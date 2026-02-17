/**
 * Audit with Squad - Análise com 5 Auditores
 *
 * Executa análise completa usando Claude API com os 5 auditores especializados:
 * - Daniel Kahneman: Comportamento
 * - Eugene Schwartz: Copy
 * - Alex Hormozi: Ofertas
 * - Marty Cagan: Métricas
 * - Paul Graham: Anomalias
 *
 * Uso:
 *   node scripts/audit-with-squad.js <username>
 *
 * Entrada:
 *   squad-auditores/data/{username}-complete-analysis.json
 *
 * Saída:
 *   squad-auditores/output/auditoria-express-{username}.json
 */

import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import 'dotenv/config'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// ============================================
// PROMPT DOS 5 AUDITORES
// ============================================

const AUDIT_PROMPT = `Você é o líder de um squad de 5 auditores especialistas que analisam contas de Instagram/redes sociais.

# OS 5 AUDITORES

## 🧠 Daniel Kahneman - Audit Lead (Comportamento)
Foco: Viés cognitivo, System 1 vs System 2, Loss Aversion, Heurísticas
Score de 0-100 baseado em quão bem o conteúdo ativa System 1 e cria padrões de comportamento positivos.

## ✍️ Eugene Schwartz - Copy Auditor
Foco: Awareness Stage, Market Sophistication, Hook Score, Mecanismo Único, Especificidade
Score de 0-100 baseado na qualidade do copy e adequação ao nível de awareness.

## 💰 Alex Hormozi - Offer Auditor
Foco: Value Equation, Grand Slam Offer, CTAs, Prova Social, Risk Reversal
Score de 0-100 baseado na clareza e força das ofertas e CTAs.

## 📊 Marty Cagan - Metrics Auditor
Foco: Outcomes vs Outputs, Four Risks, North Star Metric, Discovery vs Delivery
Score de 0-100 baseado na qualidade das métricas e foco em outcomes reais.

## 🔍 Paul Graham - Anomaly Detector
Foco: Padrões contraintuitivos, Oportunidades escondidas, Gaps, Consenso falso
Score de 0-100 baseado em insights não-óbvios e oportunidades identificadas.

# TAREFA

Analise os dados fornecidos e retorne um JSON com a seguinte estrutura EXATA:

\`\`\`json
{
  "audit_metadata": {
    "username": "string",
    "audit_type": "express",
    "audit_date": "YYYY-MM-DD",
    "posts_analyzed": number,
    "auditor_lead": "Daniel Kahneman",
    "version": "1.0"
  },
  "profile": {
    "username": "string",
    "full_name": "string",
    "biography": "string",
    "followers_count": number,
    "following_count": number,
    "posts_count": number,
    "is_verified": boolean,
    "is_business_account": boolean
  },
  "metrics": {
    "posts_analyzed": number,
    "total_likes": number,
    "total_comments_extracted": number,
    "relevant_comments": number,
    "engagement_rate": "string%",
    "avg_likes_per_post": number,
    "avg_comments_per_post": number,
    "total_images_ocr": number
  },
  "score_card": {
    "overall_score": number (0-100),
    "classification": "CRÍTICO|RUIM|MEDIANO|BOM|EXCELENTE|EXTRAORDINÁRIO",
    "classification_emoji": "🔴|🟠|🟡|🟢|🔵|⭐",
    "needs_improvement": "string (área mais crítica)",
    "dimensions": {
      "behavior": {
        "auditor": "Daniel Kahneman",
        "score": number (0-100),
        "status": "❌|⚠️|✅",
        "summary": "string (1 linha)"
      },
      "copy": {
        "auditor": "Eugene Schwartz",
        "score": number (0-100),
        "status": "❌|⚠️|✅",
        "summary": "string (1 linha)"
      },
      "offers": {
        "auditor": "Alex Hormozi",
        "score": number (0-100),
        "status": "❌|⚠️|✅",
        "summary": "string (1 linha)"
      },
      "metrics": {
        "auditor": "Marty Cagan",
        "score": number (0-100),
        "status": "❌|⚠️|✅",
        "summary": "string (1 linha)"
      },
      "anomalies": {
        "auditor": "Paul Graham",
        "score": number (0-100),
        "status": "❌|⚠️|✅",
        "summary": "string (1 linha)"
      }
    }
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
      "score": number,
      "key_findings": ["string"],
      "recommendations": ["string"]
    },
    "copy": {
      "score": number,
      "key_findings": ["string"],
      "recommendations": ["string"]
    },
    "offers": {
      "score": number,
      "key_findings": ["string"],
      "recommendations": ["string"]
    },
    "metrics": {
      "score": number,
      "key_findings": ["string"],
      "recommendations": ["string"]
    },
    "anomalies": {
      "score": number,
      "key_findings": ["string"],
      "opportunities": ["string"]
    }
  },
  "quick_wins": [
    "string (ações que pode fazer hoje)"
  ],
  "strategic_moves": [
    "string (mudanças de médio prazo)"
  ]
}
\`\`\`

# CRITÉRIOS DE SCORE

- **0-20**: Crítico, precisa de reestruturação total
- **21-40**: Ruim, múltiplos problemas sérios
- **41-60**: Abaixo da média, precisa melhorias significativas
- **61-80**: Bom, alguns pontos de melhoria
- **81-100**: Excelente, referência de mercado

Status por dimensão:
- ❌ = score < 50
- ⚠️ = score 50-75
- ✅ = score > 75

Classification geral:
- 0-20: CRÍTICO 🔴
- 21-40: RUIM 🟠
- 41-60: MEDIANO 🟡
- 61-80: BOM 🟢
- 81-90: EXCELENTE 🔵
- 91-100: EXTRAORDINÁRIO ⭐

# PENALIZAÇÃO POR DADOS INSUFICIENTES

**CRÍTICO: Aplique as seguintes penalizações baseadas na quantidade de posts analisados:**

- **< 3 posts**: Score máximo permitido = 30 (dados extremamente insuficientes)
- **3-4 posts**: Score máximo permitido = 45 (dados muito insuficientes)
- **5-7 posts**: Score máximo permitido = 60 (dados insuficientes - amostra mínima)
- **8-9 posts**: Score máximo permitido = 75 (dados suficientes, mas limitados)
- **≥ 10 posts**: Sem limitação de score (amostra ideal)

**Regra**: Se após análise o score calculado ultrapassar o máximo permitido pela quantidade de posts, você DEVE reduzir o score para o máximo permitido e adicionar em "critical_problems" um item explicando que a análise está limitada por dados insuficientes.

**Exemplo**: Se analisar 4 posts e o conteúdo parecer excelente (score 80), você DEVE dar no máximo 45 pontos e explicar que "Amostra insuficiente de posts (apenas 4) impede avaliação precisa. Para score mais alto, analise no mínimo 10 posts."

# IMPORTANTE

1. Seja HONESTO e DIRETO - não infle scores
2. **SEMPRE aplique a penalização por dados insuficientes descrita acima**
3. Identifique problemas REAIS e ACIONÁVEIS
4. Quick Wins devem ser implementáveis HOJE
5. Strategic Moves são para 30-90 dias
6. Retorne APENAS o JSON, sem explicações extras
7. Use dados concretos dos posts para justificar scores
8. **Se houver menos de 10 posts, SEMPRE mencione isso como limitação**

Agora analise os dados abaixo:`

// ============================================
// SANITIZAÇÃO DE UNICODE
// Remove surrogates inválidos de texto scrapeado (emojis raros, etc.)
// ============================================

function sanitizeString(str) {
  if (typeof str !== 'string') return str
  // Remove high surrogates sem low surrogate e vice-versa
  return str.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '')
}

function sanitizeDeep(value) {
  if (typeof value === 'string') return sanitizeString(value)
  if (Array.isArray(value)) return value.map(sanitizeDeep)
  if (value !== null && typeof value === 'object') {
    const result = {}
    for (const key of Object.keys(value)) {
      result[key] = sanitizeDeep(value[key])
    }
    return result
  }
  return value
}

// ============================================
// FUNÇÃO PRINCIPAL
// ============================================

async function auditWithSquad(username) {
  console.log('╔════════════════════════════════════════════════╗')
  console.log('║   🔬 AUDIT WITH SQUAD                          ║')
  console.log('║   Análise com 5 Auditores Especializados      ║')
  console.log('╚════════════════════════════════════════════════╝')
  console.log('')
  console.log(`🎯 Perfil: @${username}`)
  console.log('')

  const startTime = Date.now()

  try {
    // Ler arquivo de análise completa
    const dataFile = `squad-auditores/data/${username}-complete-analysis.json`

    if (!fs.existsSync(dataFile)) {
      throw new Error(`Arquivo não encontrado: ${dataFile}`)
    }

    console.log('📖 Carregando dados...')
    const completeData = JSON.parse(fs.readFileSync(dataFile, 'utf-8'))

    // Preparar dados para análise (limitar para não ultrapassar token limit)
    const analysisData = {
      username: completeData.username,
      profile: completeData.profile,
      metrics: completeData.metrics,
      posts_sample: completeData.posts.slice(0, 10).map(post => ({
        type: post.type,
        caption: post.caption?.substring(0, 500), // Limitar caption
        likes: post.likesCount,
        comments: post.commentsCount,
        hashtags: post.hashtags,
        comments_sample: post.comments?.list?.slice(0, 5),
        ocr: post.ocr ? { totalImages: post.ocr.totalImages, hasText: post.ocr.images?.length > 0 } : null
      })),
      total_posts: completeData.posts.length
    }

    console.log('🤖 Enviando para Claude API (5 auditores)...')
    console.log('')

    // Sanitizar dados antes de enviar (remove surrogates Unicode inválidos do conteúdo scrapeado)
    const sanitizedData = sanitizeDeep(analysisData)

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: AUDIT_PROMPT + '\n\n```json\n' + JSON.stringify(sanitizedData, null, 2) + '\n```'
        }
      ]
    })

    // Extrair JSON da resposta
    const responseText = message.content[0].text
    console.log('✅ Resposta recebida!')
    console.log('')

    // Tentar extrair JSON do response
    let auditResult
    try {
      // Remover markdown code blocks se existirem
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/```\n([\s\S]*?)\n```/)
      const jsonText = jsonMatch ? jsonMatch[1] : responseText
      auditResult = JSON.parse(jsonText)
    } catch (e) {
      console.error('❌ Erro ao fazer parse do JSON:', e.message)
      console.log('Response completo:', responseText)
      throw new Error('Claude retornou formato inválido')
    }

    // Salvar resultado
    const outputDir = 'squad-auditores/output'
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const outputFile = `${outputDir}/auditoria-express-${username}.json`
    fs.writeFileSync(outputFile, JSON.stringify(auditResult, null, 2))

    const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1)

    console.log('╔════════════════════════════════════════════════╗')
    console.log('║   ✅ AUDITORIA CONCLUÍDA!                      ║')
    console.log('╚════════════════════════════════════════════════╝')
    console.log('')
    console.log('📊 SCORE CARD:')
    console.log(`   Score Geral: ${auditResult.score_card.overall_score}/100`)
    console.log(`   Classificação: ${auditResult.score_card.classification} ${auditResult.score_card.classification_emoji}`)
    console.log('')
    console.log('💯 SCORES POR DIMENSÃO:')
    Object.entries(auditResult.score_card.dimensions).forEach(([dim, data]) => {
      console.log(`   ${data.status} ${dim}: ${data.score}/100 - ${data.summary}`)
    })
    console.log('')
    console.log(`⏱️  Tempo: ${elapsed} minutos`)
    console.log(`💾 Arquivo: ${outputFile}`)
    console.log('')

    return {
      success: true,
      outputFile,
      score: auditResult.score_card.overall_score
    }

  } catch (error) {
    console.error('\n❌ ERRO:', error.message)
    return { success: false, error: error.message }
  }
}

// CLI
const args = process.argv.slice(2)
const username = args[0]

if (!username) {
  console.error('❌ Uso: node scripts/audit-with-squad.js <username>')
  process.exit(1)
}

auditWithSquad(username)
