import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

// Remove surrogates Unicode inválidos (causa erro 400 na Anthropic API)
function sanitizeString(str: string): string {
  return str.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '')
}

function sanitizeDeep(value: unknown): unknown {
  if (typeof value === 'string') return sanitizeString(value)
  if (Array.isArray(value)) return value.map(sanitizeDeep)
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {}
    for (const key of Object.keys(value as object)) {
      result[key] = sanitizeDeep((value as Record<string, unknown>)[key])
    }
    return result
  }
  return value
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = getServerSupabase()

    // 1. Buscar auditoria v1.0 original
    const { data: audit, error: auditError } = await supabase
      .from('audits')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('id', id)
      .single()

    if (auditError || !audit) {
      return NextResponse.json(
        { error: 'Audit not found' },
        { status: 404 }
      )
    }

    // 2. Buscar contexto do perfil
    const { data: context, error: contextError } = await supabase
      .from('profile_context')
      .select('*')
      .eq('profile_id', audit.profile_id)
      .is('deleted_at', null)
      .single()

    if (contextError || !context) {
      return NextResponse.json(
        { error: 'Profile context not found. Please add context first.' },
        { status: 404 }
      )
    }

    // 3. Preparar dados para re-auditoria
    const originalData = audit.raw_json || {}
    const posts = originalData.posts || []
    const contextOnly = posts.length === 0

    // 4. Montar prompt com contexto adicional (sanitizar dados scrapeados)
    let contextualPrompt: string
    if (contextOnly) {
      contextualPrompt = buildContextOnlyPrompt(audit, context)
    } else {
      const sanitizedPosts = sanitizeDeep(posts) as any[]
      contextualPrompt = buildReAuditPrompt(audit, context, sanitizedPosts)
    }

    console.log('Re-auditando com contexto...')
    console.log('Posts:', posts.length, contextOnly ? '(auditoria por contexto puro)' : '')
    console.log('Contexto:', {
      nicho: context.nicho,
      objetivos: context.objetivos
    })

    // 5. Enviar para Claude com Squad Auditores + Contexto
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: contextualPrompt
        }
      ]
    })

    const responseText = message.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as any).text)
      .join('\n')

    // 6. Parsear resposta
    let analysis
    try {
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) ||
                       responseText.match(/\{[\s\S]*\}/)

      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0]
        analysis = JSON.parse(jsonStr)
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError)
      return NextResponse.json(
        { error: 'Failed to parse audit response' },
        { status: 500 }
      )
    }

    // 7. Criar nova auditoria v2.0
    const { data: newAudit, error: insertError } = await supabase
      .from('audits')
      .insert({
        profile_id: audit.profile_id,
        audit_date: new Date().toISOString(),
        posts_analyzed: posts.length,
        score_overall: analysis.score_overall || 0,
        score_behavior: analysis.scores?.behavior || 0,
        score_copy: analysis.scores?.copy || 0,
        score_offers: analysis.scores?.offers || 0,
        score_metrics: analysis.scores?.metrics || 0,
        score_anomalies: analysis.scores?.anomalies || 0,
        raw_json: {
          ...analysis,
          posts,
          context_used: {
            nicho: context.nicho,
            objetivos: context.objetivos,
            publico_alvo: context.publico_alvo,
            produtos_servicos: context.produtos_servicos,
            tom_voz: context.tom_voz,
            contexto_adicional: context.contexto_adicional,
            files: context.files
          },
          original_audit_id: id,
          version: '2.0',
          context_only: contextOnly
        }
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting new audit:', insertError)
      throw insertError
    }

    console.log('✅ Re-auditoria v2.0 criada:', newAudit.id)

    // 8. Gerar arquivo .md para visualização
    try {
      const markdown = generateAuditMarkdown(analysis, audit.profile, posts, context)
      const outputDir = path.join(process.cwd(), 'squad-auditores', 'output')

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }

      const filename = `auditoria-v2-${audit.profile.username}-${new Date().toISOString().split('T')[0]}.md`
      const filepath = path.join(outputDir, filename)

      fs.writeFileSync(filepath, markdown, 'utf-8')
      console.log(`📝 Arquivo markdown gerado: ${filepath}`)
    } catch (mdError) {
      console.error('Erro ao gerar markdown:', mdError)
      // Não falha a request se o markdown não for gerado
    }

    return NextResponse.json({
      success: true,
      audit_v2: newAudit,
      comparison_url: `/dashboard/audits/${id}/compare?v2=${newAudit.id}`
    })

  } catch (error: any) {
    console.error('Error in re-audit:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to re-audit' },
      { status: 500 }
    )
  }
}

/**
 * Gera arquivo Markdown da auditoria
 */
function generateAuditMarkdown(analysis: any, profile: any, posts: any[], context: any): string {
  const date = new Date().toLocaleDateString('pt-BR')

  let md = `# 📊 Re-Auditoria v2.0 com Contexto - @${profile.username}\n\n`
  md += `**Data:** ${date}\n`
  md += `**Versão:** 2.0 (com contexto adicional)\n\n`
  md += `---\n\n`

  // Contexto utilizado
  md += `## 🎯 Contexto Adicional Utilizado\n\n`
  if (context.nicho) md += `- **Nicho:** ${context.nicho}\n`
  if (context.objetivos) md += `- **Objetivos:** ${context.objetivos}\n`
  if (context.publico_alvo) md += `- **Público-Alvo:** ${context.publico_alvo}\n`
  if (context.produtos_servicos) md += `- **Produtos/Serviços:** ${context.produtos_servicos}\n`
  if (context.tom_voz) md += `- **Tom de Voz:** ${context.tom_voz}\n`
  md += `\n---\n\n`

  // Dados do perfil
  md += `## 👤 Dados do Perfil\n\n`
  md += `- **Nome:** ${profile.full_name || profile.username}\n`
  md += `- **Username:** @${profile.username}\n`
  md += `- **Seguidores:** ${profile.followers_count?.toLocaleString('pt-BR') || 'N/A'}\n`
  if (profile.biography) {
    md += `\n**Biografia:**\n> ${profile.biography.split('\n').join('\n> ')}\n`
  }
  md += `\n---\n\n`

  // Scores
  md += `## 🎯 Pontuação Geral\n\n`
  md += `### Score Overall: **${analysis.score_overall || analysis.scores?.overall || 0}/100**\n\n`
  md += `**Scores por Dimensão:**\n\n`
  if (analysis.scores) {
    md += `- 🧠 **Comportamento:** ${analysis.scores.behavior || 0}/100\n`
    md += `- ✍️ **Copy:** ${analysis.scores.copy || 0}/100\n`
    md += `- 💰 **Ofertas:** ${analysis.scores.offers || 0}/100\n`
    md += `- 📊 **Métricas:** ${analysis.scores.metrics || 0}/100\n`
    md += `- 🔍 **Anomalias:** ${analysis.scores.anomalies || 0}/100\n`
  }
  md += `\n---\n\n`

  // Top Strengths
  if (analysis.top_strengths && analysis.top_strengths.length > 0) {
    md += `## 💪 Pontos Fortes\n\n`
    analysis.top_strengths.forEach((strength: any) => {
      md += `### ${strength.emoji} #${strength.rank} ${strength.title}\n\n`
      md += `${strength.description}\n\n`
    })
    md += `---\n\n`
  }

  // Critical Problems
  if (analysis.critical_problems && analysis.critical_problems.length > 0) {
    md += `## ⚠️ Problemas Críticos\n\n`
    analysis.critical_problems.forEach((problem: any) => {
      md += `### ${problem.emoji} #${problem.rank} ${problem.title}\n\n`
      if (problem.severity) md += `**Severidade:** ${problem.severity}\n\n`
      md += `${problem.description}\n\n`
    })
    md += `---\n\n`
  }

  // Quick Wins
  if (analysis.quick_wins && analysis.quick_wins.length > 0) {
    md += `## ⚡ Quick Wins - Ações Rápidas\n\n`
    analysis.quick_wins.forEach((win: string, index: number) => {
      md += `${index + 1}. ${win}\n`
    })
    md += `\n---\n\n`
  }

  // Context Insights
  if (analysis.context_insights) {
    md += `## 🎯 Insights Baseados no Contexto\n\n`
    if (analysis.context_insights.alignment_score) {
      md += `**Score de Alinhamento com Objetivos:** ${analysis.context_insights.alignment_score}/100\n\n`
    }
    if (analysis.context_insights.gaps && analysis.context_insights.gaps.length > 0) {
      md += `### Gaps Identificados\n\n`
      analysis.context_insights.gaps.forEach((gap: string, index: number) => {
        md += `${index + 1}. ${gap}\n`
      })
      md += `\n`
    }
    if (analysis.context_insights.opportunities && analysis.context_insights.opportunities.length > 0) {
      md += `### Oportunidades\n\n`
      analysis.context_insights.opportunities.forEach((opp: string, index: number) => {
        md += `${index + 1}. ${opp}\n`
      })
      md += `\n`
    }
    md += `---\n\n`
  }

  // Análise dos Auditores
  if (analysis.auditors_analysis) {
    md += `## 🔍 Análise Detalhada dos Auditores\n\n`

    const auditors = [
      { key: 'behavior', name: 'Daniel Kahneman', emoji: '🧠', specialty: 'Comportamento' },
      { key: 'copy', name: 'Eugene Schwartz', emoji: '✍️', specialty: 'Copy' },
      { key: 'offers', name: 'Alex Hormozi', emoji: '💰', specialty: 'Ofertas' },
      { key: 'metrics', name: 'Marty Cagan', emoji: '📊', specialty: 'Métricas' },
      { key: 'anomalies', name: 'Paul Graham', emoji: '🔍', specialty: 'Anomalias' }
    ]

    auditors.forEach(auditor => {
      const data = analysis.auditors_analysis[auditor.key]
      if (!data) return

      md += `### ${auditor.emoji} ${auditor.name} - ${auditor.specialty}\n\n`
      md += `**Score:** ${data.score || 0}/100\n\n`

      if (data.key_findings && data.key_findings.length > 0) {
        md += `**Insights Principais:**\n\n`
        data.key_findings.forEach((finding: string) => {
          md += `- ${finding}\n`
        })
        md += `\n`
      }

      const recKey = auditor.key === 'anomalies' ? 'opportunities' : 'recommendations'
      if (data[recKey] && data[recKey].length > 0) {
        md += `**${auditor.key === 'anomalies' ? 'Oportunidades' : 'Recomendações'}:**\n\n`
        data[recKey].forEach((rec: string) => {
          md += `- ${rec}\n`
        })
        md += `\n`
      }

      md += `---\n\n`
    })
  }

  // Posts analisados
  md += `## 📝 Fonte dos Dados\n\n`
  if (posts.length > 0) {
    md += `**Total de posts analisados:** ${posts.length}\n\n`
  } else {
    md += `**Auditoria baseada em contexto** (sem posts scrapeados)\n`
    md += `> Esta auditoria foi gerada com base nas informações fornecidas sobre nicho, objetivos e público-alvo, sem dados de posts reais.\n\n`
  }

  md += `---\n\n`
  md += `*Auditoria gerada automaticamente pelo PostExpress - Squad Auditores*\n`

  return md
}

/**
 * Constrói prompt para auditoria baseada APENAS em contexto (sem posts)
 */
function buildContextOnlyPrompt(audit: any, context: any): string {
  return `Você é o líder do **Squad Auditores**, composto por 5 especialistas que trabalham em harmonia para analisar perfis de experts no Instagram:

1. **Eugene Schwartz** - Copywriting científico e níveis de awareness (líder)
2. **Seth Godin** - Branding, narrativas e conexão emocional
3. **Alex Hormozi** - Ofertas irresistíveis e mecânicas de conversão
4. **Thiago Finch** - Marketing digital brasileiro e adaptação cultural
5. **Adriano De Marqui** - Design visual, estética e identidade

---

## CONTEXTO DO EXPERT

Este expert ainda não possui posts analisados. A auditoria será feita com base no contexto estratégico fornecido pelo próprio cliente.

**Nicho / Área de Atuação:**
${context.nicho || 'Não especificado'}

**Objetivos:**
${context.objetivos || 'Não especificado'}

**Público-Alvo:**
${context.publico_alvo || 'Não especificado'}

**Produtos / Serviços:**
${context.produtos_servicos || 'Não especificado'}

**Tom de Voz Desejado:**
${context.tom_voz || 'Não especificado'}

**Contexto Adicional:**
${context.contexto_adicional || 'Não especificado'}

${context.files && context.files.length > 0 ? `
**Arquivos Anexados:**
${context.files.map((f: any) => `- ${f.name} (${f.type})`).join('\n')}
` : ''}

---

## DADOS DO PERFIL

**Username:** @${audit.profile?.username}
**Nome:** ${audit.profile?.full_name || 'N/A'}
**Seguidores:** ${audit.profile?.followers_count || 0}
**Biografia:** ${audit.profile?.biography || 'N/A'}

---

## INSTRUÇÃO PARA AUDITORIA ESTRATÉGICA (Sem Posts)

Como não há posts disponíveis para análise, sua missão é fazer uma **auditoria estratégica prospectiva** — ou seja, baseada no que o expert DEVERIA estar fazendo com base no seu contexto.

**Tarefa:**
1. **Analise o posicionamento** com base no nicho, objetivos e público-alvo declarados
2. **Identifique gaps estratégicos** entre o que o expert diz que quer e como deveria comunicar
3. **Avalie a proposta de valor** dos produtos/serviços para o público-alvo descrito
4. **Crie recomendações de conteúdo** específicas para o nicho e tom de voz desejado
5. **Dê scores baseados no potencial** e nas oportunidades identificadas no contexto

**IMPORTANTE:**
- Os scores devem refletir o POTENCIAL estratégico e a clareza do posicionamento
- Quick wins devem ser ações concretas que o expert pode implementar imediatamente
- Use o nicho e público-alvo para contextualizar todas as recomendações
- Seja prático: recomendações que possam ser aplicadas nos próximos 7 dias

---

Retorne a análise em JSON com a SEGUINTE ESTRUTURA EXATA:

\`\`\`json
{
  "score_overall": 0-100,
  "scores": {
    "behavior": 0-100,
    "copy": 0-100,
    "offers": 0-100,
    "metrics": 0-100,
    "anomalies": 0-100
  },
  "top_strengths": [
    {
      "rank": 1,
      "title": "string (curto)",
      "description": "string (2-3 linhas)",
      "emoji": "string"
    }
  ],
  "critical_problems": [
    {
      "rank": 1,
      "title": "string (curto)",
      "description": "string (2-3 linhas)",
      "severity": "crítico|alto|médio",
      "emoji": "string"
    }
  ],
  "auditors_analysis": {
    "behavior": {
      "score": 0-100,
      "key_findings": ["Insight 1", "Insight 2", "Insight 3"],
      "recommendations": ["Recomendação 1", "Recomendação 2", "Recomendação 3"]
    },
    "copy": {
      "score": 0-100,
      "key_findings": ["Insight 1", "Insight 2", "Insight 3"],
      "recommendations": ["Recomendação 1", "Recomendação 2", "Recomendação 3"]
    },
    "offers": {
      "score": 0-100,
      "key_findings": ["Insight 1", "Insight 2", "Insight 3"],
      "recommendations": ["Recomendação 1", "Recomendação 2", "Recomendação 3"]
    },
    "metrics": {
      "score": 0-100,
      "key_findings": ["Insight 1", "Insight 2", "Insight 3"],
      "recommendations": ["Recomendação 1", "Recomendação 2", "Recomendação 3"]
    },
    "anomalies": {
      "score": 0-100,
      "key_findings": ["Padrão/oportunidade 1", "Padrão/oportunidade 2", "Padrão/oportunidade 3"],
      "opportunities": ["Oportunidade 1", "Oportunidade 2", "Oportunidade 3"]
    }
  },
  "quick_wins": [
    "Ação rápida 1 (específica para o nicho)",
    "Ação rápida 2 (específica para o público-alvo)",
    "Ação rápida 3 (específica para os objetivos)"
  ],
  "context_insights": {
    "alignment_score": 0-100,
    "gaps": [
      "Gap estratégico 1 identificado no contexto",
      "Gap estratégico 2 identificado no contexto"
    ],
    "opportunities": [
      "Oportunidade 1 baseada no nicho e objetivos",
      "Oportunidade 2 baseada no público-alvo"
    ]
  }
}
\`\`\`

**IMPORTANTE**: Use EXATAMENTE as chaves "behavior", "copy", "offers", "metrics", "anomalies" em auditors_analysis.
`
}

/**
 * Constrói prompt para re-auditoria com contexto adicional
 */
function buildReAuditPrompt(audit: any, context: any, posts: any[]): string {
  return `Você é o líder do **Squad Auditores**, composto por 5 especialistas que trabalham em harmonia para analisar perfis de experts no Instagram:

1. **Eugene Schwartz** - Copywriting científico e níveis de awareness (líder)
2. **Seth Godin** - Branding, narrativas e conexão emocional
3. **Alex Hormozi** - Ofertas irresistíveis e mecânicas de conversão
4. **Thiago Finch** - Marketing digital brasileiro e adaptação cultural
5. **Adriano De Marqui** - Design visual, estética e identidade

---

## CONTEXTO ADICIONAL DO EXPERT

Agora você tem acesso a informações detalhadas sobre o expert, fornecidas pelo próprio cliente:

**Nicho / Área de Atuação:**
${context.nicho || 'Não especificado'}

**Objetivos do Expert:**
${context.objetivos || 'Não especificado'}

**Público-Alvo:**
${context.publico_alvo || 'Não especificado'}

**Produtos / Serviços:**
${context.produtos_servicos || 'Não especificado'}

**Tom de Voz Desejado:**
${context.tom_voz || 'Não especificado'}

**Contexto Adicional:**
${context.contexto_adicional || 'Não especificado'}

${context.files && context.files.length > 0 ? `
**Arquivos Anexados:**
${context.files.map((f: any) => `- ${f.name} (${f.type})`).join('\n')}
` : ''}

---

## DADOS DO PERFIL

**Username:** @${audit.profile?.username}
**Nome:** ${audit.profile?.full_name || 'N/A'}
**Seguidores:** ${audit.profile?.followers_count || 0}
**Biografia:** ${audit.profile?.biography || 'N/A'}

---

## POSTS ANALISADOS (${posts.length} posts)

${JSON.stringify(posts, null, 2)}

---

## INSTRUÇÃO PARA RE-AUDITORIA v2.0

Esta é uma **RE-AUDITORIA** do perfil. Você já fez uma análise inicial (v1.0), mas agora tem **contexto adicional** sobre:
- Os objetivos reais do expert
- O público-alvo específico
- Os produtos/serviços oferecidos
- O tom de voz desejado

**Tarefa:**
1. Analise os posts novamente, mas agora **considerando o contexto adicional**
2. Avalie se o conteúdo está **alinhado com os objetivos e público-alvo** especificados
3. Identifique gaps entre o que está sendo feito e o que deveria ser feito
4. Dê insights mais precisos e personalizados baseados no contexto

**IMPORTANTE:**
- Use o contexto para dar uma análise mais profunda e personalizada
- Compare o que está sendo feito com o que deveria ser feito (baseado nos objetivos)
- Identifue oportunidades específicas para o nicho e público-alvo
- Seja mais preciso nas recomendações, usando o contexto como referência

---

Retorne a análise em JSON com a MESMA ESTRUTURA EXATA da auditoria original:

\`\`\`json
{
  "score_overall": 0-100,
  "scores": {
    "behavior": 0-100,
    "copy": 0-100,
    "offers": 0-100,
    "metrics": 0-100,
    "anomalies": 0-100
  },
  "top_strengths": [
    {
      "rank": 1,
      "title": "string (curto)",
      "description": "string (2-3 linhas)",
      "emoji": "string"
    }
  ],
  "critical_problems": [
    {
      "rank": 1,
      "title": "string (curto)",
      "description": "string (2-3 linhas)",
      "severity": "crítico|alto|médio",
      "emoji": "string"
    }
  ],
  "auditors_analysis": {
    "behavior": {
      "score": 0-100,
      "key_findings": [
        "Insight 1 sobre comportamento",
        "Insight 2 sobre comportamento",
        "Insight 3 sobre comportamento"
      ],
      "recommendations": [
        "Recomendação 1",
        "Recomendação 2",
        "Recomendação 3"
      ]
    },
    "copy": {
      "score": 0-100,
      "key_findings": [
        "Insight 1 sobre copy",
        "Insight 2 sobre copy",
        "Insight 3 sobre copy"
      ],
      "recommendations": [
        "Recomendação 1",
        "Recomendação 2",
        "Recomendação 3"
      ]
    },
    "offers": {
      "score": 0-100,
      "key_findings": [
        "Insight 1 sobre ofertas",
        "Insight 2 sobre ofertas",
        "Insight 3 sobre ofertas"
      ],
      "recommendations": [
        "Recomendação 1",
        "Recomendação 2",
        "Recomendação 3"
      ]
    },
    "metrics": {
      "score": 0-100,
      "key_findings": [
        "Insight 1 sobre métricas",
        "Insight 2 sobre métricas",
        "Insight 3 sobre métricas"
      ],
      "recommendations": [
        "Recomendação 1",
        "Recomendação 2",
        "Recomendação 3"
      ]
    },
    "anomalies": {
      "score": 0-100,
      "key_findings": [
        "Anomalia/padrão 1 identificado",
        "Anomalia/padrão 2 identificado",
        "Anomalia/padrão 3 identificado"
      ],
      "opportunities": [
        "Oportunidade 1",
        "Oportunidade 2",
        "Oportunidade 3"
      ]
    }
  },
  "quick_wins": [
    "Ação rápida 1",
    "Ação rápida 2",
    "Ação rápida 3"
  ],
  "context_insights": {
    "alignment_score": 0-100,
    "gaps": [
      "Gap 1 entre o que faz e o que deveria fazer",
      "Gap 2 entre o que faz e o que deveria fazer"
    ],
    "opportunities": [
      "Oportunidade 1 baseada no contexto",
      "Oportunidade 2 baseada no contexto"
    ]
  }
}
\`\`\`

**IMPORTANTE**: Use EXATAMENTE as chaves "behavior", "copy", "offers", "metrics", "anomalies" em auditors_analysis. Cada dimensão deve ter "key_findings" e "recommendations" (ou "opportunities" para anomalies).
`
}
