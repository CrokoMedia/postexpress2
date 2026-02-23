import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import Anthropic from '@anthropic-ai/sdk'
import { ApifyClient } from 'apify-client'
import fs from 'fs'
import path from 'path'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

const apify = new ApifyClient({
  token: process.env.APIFY_API_TOKEN
})

// Remove surrogates Unicode inválidos
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

/**
 * POST /api/profiles/[id]/fresh-audit
 *
 * Faz novo scraping do Instagram + auditoria com contexto
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const postsLimit = body.postsLimit || 20
    const includeComments = body.includeComments !== false

    const supabase = getServerSupabase()

    // 1. Buscar perfil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    console.log(`🔄 Iniciando fresh audit para @${profile.username}`)
    console.log(`📊 Posts a coletar: ${postsLimit}`)
    console.log(`💬 Comentários: ${includeComments ? 'Sim' : 'Não'}`)

    // 2. Fazer scraping do Instagram
    console.log('\n📸 FASE 1: Scraping do Instagram...')
    const scrapingResult = await scrapInstagramProfile(
      profile.username,
      postsLimit,
      includeComments
    )

    if (!scrapingResult.success) {
      return NextResponse.json(
        { error: scrapingResult.error || 'Instagram scraping failed' },
        { status: 500 }
      )
    }

    const { profileData, posts = [] } = scrapingResult

    // Atualizar dados do perfil no Supabase (seguidores, bio, etc podem ter mudado)
    if (profileData) {
      await supabase
        .from('profiles')
        .update({
          full_name: profileData.fullName,
          biography: profileData.biography,
          followers_count: profileData.followersCount,
          profile_pic_url: profileData.profilePicUrlHD || profileData.profilePicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      console.log('✅ Dados do perfil atualizados no Supabase')
    }

    // 3. Buscar contexto do perfil
    console.log('\n🎯 FASE 2: Buscando contexto do perfil...')
    const { data: context } = await supabase
      .from('profile_context')
      .select('*')
      .eq('profile_id', id)
      .is('deleted_at', null)
      .single()

    const hasContext = !!context
    console.log(`Contexto: ${hasContext ? '✅ Encontrado' : '⚠️ Não encontrado'}`)

    // 4. Gerar auditoria com Claude
    console.log('\n🤖 FASE 3: Gerando auditoria com Squad Auditores...')

    const sanitizedPosts = sanitizeDeep(posts) as any[]
    const auditPrompt = buildAuditPrompt(profileData, sanitizedPosts, context)

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: auditPrompt
        }
      ]
    })

    const responseText = message.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as any).text)
      .join('\n')

    // 5. Parsear resposta
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

    // 6. Salvar auditoria no Supabase
    console.log('\n💾 FASE 4: Salvando auditoria...')
    const { data: newAudit, error: insertError } = await supabase
      .from('audits')
      .insert({
        profile_id: id,
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
          profile: profileData,
          context_used: hasContext ? {
            identity: context.identity || {},
            credibility: context.credibility || {},
            philosophy: context.philosophy || {},
            content_style: context.content_style || {},
            content_pillars: context.content_pillars || [],
            business: context.business || {},
            dna: context.dna || {},
            legacy: {
              nicho: context.nicho,
              objetivos: context.objetivos,
              publico_alvo: context.publico_alvo,
              produtos_servicos: context.produtos_servicos,
              tom_voz: context.tom_voz,
              contexto_adicional: context.contexto_adicional
            },
            files: context.files
          } : null,
          scraping_date: new Date().toISOString(),
          version: 'fresh-v1.0'
        }
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting audit:', insertError)
      throw insertError
    }

    console.log('✅ Auditoria criada:', newAudit.id)

    // 7. Gerar arquivo .md (opcional)
    try {
      const markdown = generateAuditMarkdown(analysis, profileData, posts, context)
      const outputDir = path.join(process.cwd(), 'squad-auditores', 'output')

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }

      const filename = `auditoria-fresh-${profile.username}-${new Date().toISOString().split('T')[0]}.md`
      const filepath = path.join(outputDir, filename)

      fs.writeFileSync(filepath, markdown, 'utf-8')
      console.log(`📝 Arquivo markdown gerado: ${filepath}`)
    } catch (mdError) {
      console.error('Erro ao gerar markdown:', mdError)
    }

    return NextResponse.json({
      success: true,
      audit: newAudit,
      posts_scraped: posts.length,
      profile_updated: !!profileData,
      context_used: hasContext
    })

  } catch (error: any) {
    console.error('Error in fresh-audit:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create fresh audit' },
      { status: 500 }
    )
  }
}

/**
 * Faz scraping do perfil no Instagram via Apify
 */
async function scrapInstagramProfile(
  username: string,
  limit: number,
  includeComments: boolean
): Promise<{
  success: boolean
  error?: string
  profileData?: any
  posts?: any[]
}> {
  try {
    // Extrai posts do perfil
    const run = await apify.actor('apify/instagram-profile-scraper').call({
      usernames: [username],
      resultsLimit: limit,
    })

    const finishedRun = await apify.run(run.id).waitForFinish()

    if (finishedRun.status !== 'SUCCEEDED') {
      return {
        success: false,
        error: `Scraping failed: ${finishedRun.status}`
      }
    }

    const { items } = await apify.dataset(finishedRun.defaultDatasetId).listItems()

    if (items.length === 0) {
      return {
        success: false,
        error: 'No profile data found'
      }
    }

    const profileData = items[0]
    let posts = (profileData.latestPosts && Array.isArray(profileData.latestPosts))
      ? profileData.latestPosts.slice(0, limit)
      : []

    console.log(`✅ ${posts.length} posts extraídos`)

    // Extrair comentários (se solicitado)
    if (includeComments && posts.length > 0) {
      console.log('\n💬 Extraindo comentários...')

      for (let i = 0; i < Math.min(posts.length, 5); i++) {
        const post = posts[i]
        try {
          const comments = await extractComments(post.url, 50)
          post.comments = comments
          console.log(`   Post ${i + 1}: ${comments.length} comentários`)
        } catch (error: any) {
          console.log(`   ⚠️ Erro ao extrair comentários do post ${i + 1}`)
          post.comments = []
        }
      }
    }

    return {
      success: true,
      profileData,
      posts
    }

  } catch (error: any) {
    console.error('Scraping error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Extrai comentários de um post
 */
async function extractComments(postUrl: string, limit: number): Promise<any[]> {
  try {
    const run = await apify.actor('apify/instagram-scraper').call({
      directUrls: [postUrl],
      resultsType: 'comments',
      resultsLimit: limit,
      proxy: { useApifyProxy: true },
    })

    const finishedRun = await apify.run(run.id).waitForFinish()

    if (finishedRun.status !== 'SUCCEEDED') {
      return []
    }

    const { items } = await apify.dataset(finishedRun.defaultDatasetId).listItems()
    return items

  } catch (error) {
    return []
  }
}

/**
 * Constrói prompt para auditoria
 */
function buildAuditPrompt(profileData: any, posts: any[], context: any): string {
  const hasContext = !!context
  const identity = context?.identity || {}
  const credibility = context?.credibility || {}
  const philosophy = context?.philosophy || {}
  const contentStyle = context?.content_style || {}
  const contentPillars = context?.content_pillars || []
  const business = context?.business || {}
  const dna = context?.dna || {}

  return `Você é o líder do **Squad Auditores**, composto por 5 especialistas que trabalham em harmonia para analisar perfis de experts no Instagram:

1. **Eugene Schwartz** - Copywriting científico e níveis de awareness (líder)
2. **Seth Godin** - Branding, narrativas e conexão emocional
3. **Alex Hormozi** - Ofertas irresistíveis e mecânicas de conversão
4. **Thiago Finch** - Marketing digital brasileiro e adaptação cultural
5. **Adriano De Marqui** - Design visual, estética e identidade

---

## DADOS DO PERFIL

**Username:** @${profileData.username}
**Nome:** ${profileData.fullName || 'N/A'}
**Seguidores:** ${profileData.followersCount?.toLocaleString() || 0}
**Biografia:** ${profileData.biography || 'N/A'}
**Verificado:** ${profileData.verified ? 'Sim' : 'Não'}
**Conta Business:** ${profileData.isBusinessAccount ? 'Sim' : 'Não'}

---

${hasContext ? `## CONTEXTO COMPLETO DO EXPERT

### 🎯 IDENTIDADE & POSICIONAMENTO
**Nome Completo:** ${identity.fullName || profileData.fullName || 'Não especificado'}
**Posicionamento:** ${identity.positioning || context.nicho || 'Não especificado'}
**Nicho:** ${identity.niche?.join(', ') || context.nicho || 'Não especificado'}
**Público-Alvo:** ${identity.avatar || context.publico_alvo || 'Não especificado'}
**Tom de Voz:** ${identity.toneOfVoice || contentStyle.language?.toneOfVoice || context.tom_voz || 'Não especificado'}

### 💼 CREDIBILIDADE & AUTORIDADE
**Experiência:** ${credibility.experience || 'Não especificado'}
${credibility.achievements?.length ? `**Conquistas:**\n${credibility.achievements.map((a: string) => `- ${a}`).join('\n')}` : ''}

### 🧭 FILOSOFIA & VALORES
${philosophy.values?.length ? `**Valores:**\n${philosophy.values.map((v: string) => `- ${v}`).join('\n')}` : ''}

### 🎨 PILARES DE CONTEÚDO
${contentPillars.length ? contentPillars.map((pilar: any) => `
**${pilar.name}** (${pilar.weight})
- Objetivo: ${pilar.objetivo}
`).join('\n') : 'Não especificado'}

### 💰 PRODUTOS & OFERTAS
${business.products?.length ? business.products.map((p: any) => `
**${p.name}** - ${p.price}
- Público: ${p.target}
`).join('\n') : context.produtos_servicos || 'Não especificado'}

---

` : ''}

## POSTS ANALISADOS (${posts.length} posts)

${JSON.stringify(posts, null, 2)}

---

## INSTRUÇÃO PARA AUDITORIA${hasContext ? ' COM CONTEXTO' : ''}

${hasContext ? `Esta auditoria tem acesso ao CONTEXTO COMPLETO do expert. Use essas informações para:
1. Avaliar o ALINHAMENTO entre o conteúdo e os objetivos declarados
2. Identificar GAPS entre o que está sendo feito e o que deveria ser feito
3. Dar recomendações PERSONALIZADAS baseadas no nicho e público-alvo
4. Avaliar se as ofertas/produtos estão sendo promovidos adequadamente` :
`Analise este perfil profissionalmente com base nos posts e dados públicos disponíveis.`}

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
      "title": "string",
      "description": "string",
      "emoji": "string"
    }
  ],
  "critical_problems": [
    {
      "rank": 1,
      "title": "string",
      "description": "string",
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
      "key_findings": ["Padrão 1", "Padrão 2", "Padrão 3"],
      "opportunities": ["Oportunidade 1", "Oportunidade 2", "Oportunidade 3"]
    }
  },
  "quick_wins": [
    "Ação rápida 1",
    "Ação rápida 2",
    "Ação rápida 3"
  ]${hasContext ? `,
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
  }` : ''}
}
\`\`\`
`
}

/**
 * Gera arquivo Markdown da auditoria
 */
function generateAuditMarkdown(analysis: any, profileData: any, posts: any[], context: any): string {
  const date = new Date().toLocaleDateString('pt-BR')

  let md = `# 📊 Fresh Audit - @${profileData.username}\n\n`
  md += `**Data:** ${date}\n`
  md += `**Tipo:** Auditoria com scraping novo\n`
  md += `**Posts analisados:** ${posts.length}\n\n`
  md += `---\n\n`

  // Contexto (se houver)
  if (context) {
    md += `## 🎯 Contexto Utilizado\n\n`
    const identity = context.identity || {}
    if (identity.positioning) md += `**Posicionamento:** ${identity.positioning}\n`
    if (identity.niche?.length) md += `**Nicho:** ${identity.niche.join(', ')}\n`
    md += `\n---\n\n`
  }

  // Dados do perfil
  md += `## 👤 Dados do Perfil\n\n`
  md += `- **Nome:** ${profileData.fullName || profileData.username}\n`
  md += `- **Username:** @${profileData.username}\n`
  md += `- **Seguidores:** ${profileData.followersCount?.toLocaleString('pt-BR') || 'N/A'}\n`
  if (profileData.biography) {
    md += `\n**Biografia:**\n> ${profileData.biography.split('\n').join('\n> ')}\n`
  }
  md += `\n---\n\n`

  // Scores
  md += `## 🎯 Pontuação Geral\n\n`
  md += `### Score Overall: **${analysis.score_overall || 0}/100**\n\n`
  if (analysis.scores) {
    md += `**Scores por Dimensão:**\n\n`
    md += `- 🧠 **Comportamento:** ${analysis.scores.behavior || 0}/100\n`
    md += `- ✍️ **Copy:** ${analysis.scores.copy || 0}/100\n`
    md += `- 💰 **Ofertas:** ${analysis.scores.offers || 0}/100\n`
    md += `- 📊 **Métricas:** ${analysis.scores.metrics || 0}/100\n`
    md += `- 🔍 **Anomalias:** ${analysis.scores.anomalies || 0}/100\n`
  }
  md += `\n---\n\n`

  // Top Strengths
  if (analysis.top_strengths?.length) {
    md += `## 💪 Pontos Fortes\n\n`
    analysis.top_strengths.forEach((strength: any) => {
      md += `### ${strength.emoji} #${strength.rank} ${strength.title}\n\n`
      md += `${strength.description}\n\n`
    })
    md += `---\n\n`
  }

  // Critical Problems
  if (analysis.critical_problems?.length) {
    md += `## ⚠️ Problemas Críticos\n\n`
    analysis.critical_problems.forEach((problem: any) => {
      md += `### ${problem.emoji} #${problem.rank} ${problem.title}\n\n`
      if (problem.severity) md += `**Severidade:** ${problem.severity}\n\n`
      md += `${problem.description}\n\n`
    })
    md += `---\n\n`
  }

  // Quick Wins
  if (analysis.quick_wins?.length) {
    md += `## ⚡ Quick Wins\n\n`
    analysis.quick_wins.forEach((win: string, index: number) => {
      md += `${index + 1}. ${win}\n`
    })
    md += `\n---\n\n`
  }

  md += `*Auditoria gerada automaticamente pelo PostExpress*\n`

  return md
}
