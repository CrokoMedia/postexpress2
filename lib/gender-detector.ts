/**
 * Gender Detector
 * Detecta automaticamente o gênero de um perfil do Instagram
 * usando análise de nome, biografia e contexto
 */

import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export type Gender = 'masculino' | 'feminino' | 'neutro' | 'empresa'

export interface GenderDetectionResult {
  gender: Gender
  confidence: number // 0.0 a 1.0
  reasoning: string
}

/**
 * Detecta o gênero de um perfil usando Claude API
 */
export async function detectGender(
  fullName: string | null,
  biography: string | null,
  username: string
): Promise<GenderDetectionResult> {

  const prompt = `Você é um especialista em análise de perfis de redes sociais. Sua tarefa é identificar o GÊNERO do perfil do Instagram baseado nas informações fornecidas.

**INFORMAÇÕES DO PERFIL:**

Username: @${username}
Nome completo: ${fullName || 'não informado'}
Biografia: ${biography || 'não informada'}

**INSTRUÇÕES:**

1. Analise cuidadosamente o nome, biografia e username
2. Identifique se o perfil pertence a uma PESSOA ou EMPRESA/MARCA
3. Se for pessoa, identifique se é MASCULINO ou FEMININO
4. Se não houver certeza, retorne NEUTRO

**REGRAS:**

- Empresas/marcas/páginas = "empresa"
- Pessoa do sexo masculino = "masculino"
- Pessoa do sexo feminino = "feminino"
- Incerto/ambíguo = "neutro"

**IMPORTANTE:** Considere nomes brasileiros, nomes artísticos, apelidos e contexto cultural do Brasil.

**FORMATO DE RESPOSTA (JSON):**

{
  "gender": "masculino" | "feminino" | "neutro" | "empresa",
  "confidence": 0.95,
  "reasoning": "Explicação breve da decisão"
}

Retorne APENAS o JSON, sem texto adicional.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022', // Modelo rápido e barato
      max_tokens: 200,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Resposta inválida da API')
    }

    // Parse do JSON
    const result = JSON.parse(content.text) as GenderDetectionResult

    // Validação
    if (!['masculino', 'feminino', 'neutro', 'empresa'].includes(result.gender)) {
      throw new Error(`Gênero inválido: ${result.gender}`)
    }

    if (result.confidence < 0 || result.confidence > 1) {
      result.confidence = 0.5
    }

    return result

  } catch (error: any) {
    console.error('Erro ao detectar gênero:', error)

    // Fallback: tentar detecção simples por nome
    return detectGenderFallback(fullName, biography, username)
  }
}

/**
 * Fallback: detecção simples baseada em regras heurísticas
 */
function detectGenderFallback(
  fullName: string | null,
  biography: string | null,
  username: string
): GenderDetectionResult {

  const text = `${fullName || ''} ${biography || ''} ${username}`.toLowerCase()

  // Lista de palavras-chave para detecção
  const feminineIndicators = [
    'ela', 'mulher', 'feminina', 'mãe', 'maternidade', 'gestante',
    'influenciadora', 'empreendedora', 'blogueira', 'coach feminina'
  ]

  const masculineIndicators = [
    'ele', 'homem', 'masculino', 'pai', 'paternidade',
    'influenciador', 'empreendedor', 'blogueiro', 'coach masculino'
  ]

  const companyIndicators = [
    'empresa', 'loja', 'store', 'shop', 'oficial', 'official',
    'marca', 'brand', 'serviços', 'produtos', 'delivery'
  ]

  // Nomes femininos comuns no Brasil
  const feminineNames = [
    'ana', 'maria', 'julia', 'beatriz', 'laura', 'isabella', 'camila',
    'carolina', 'fernanda', 'gabriela', 'leticia', 'mariana', 'rafaela',
    'amanda', 'bianca', 'daniela', 'eduarda', 'isadora', 'jessica',
    'larissa', 'natalia', 'patricia', 'renata', 'sabrina', 'thais', 'vanessa'
  ]

  // Nomes masculinos comuns no Brasil
  const masculineNames = [
    'joao', 'gabriel', 'pedro', 'lucas', 'matheus', 'rafael', 'bruno',
    'carlos', 'daniel', 'eduardo', 'felipe', 'gustavo', 'henrique',
    'leonardo', 'marcos', 'paulo', 'ricardo', 'rodrigo', 'thiago', 'vitor'
  ]

  let femScore = 0
  let mascScore = 0
  let compScore = 0

  // Contar indicadores na biografia
  feminineIndicators.forEach(word => {
    if (text.includes(word)) femScore += 2
  })

  masculineIndicators.forEach(word => {
    if (text.includes(word)) mascScore += 2
  })

  companyIndicators.forEach(word => {
    if (text.includes(word)) compScore += 3
  })

  // Verificar nomes
  const nameLower = (fullName || '').toLowerCase()
  feminineNames.forEach(name => {
    if (nameLower.includes(name)) femScore += 5
  })

  masculineNames.forEach(name => {
    if (nameLower.includes(name)) mascScore += 5
  })

  // Decisão
  if (compScore >= 3) {
    return {
      gender: 'empresa',
      confidence: Math.min(compScore / 10, 0.7),
      reasoning: 'Detectado indicadores de empresa/marca'
    }
  }

  if (femScore > mascScore && femScore >= 5) {
    return {
      gender: 'feminino',
      confidence: Math.min(femScore / 10, 0.8),
      reasoning: 'Detectado indicadores femininos no nome ou biografia'
    }
  }

  if (mascScore > femScore && mascScore >= 5) {
    return {
      gender: 'masculino',
      confidence: Math.min(mascScore / 10, 0.8),
      reasoning: 'Detectado indicadores masculinos no nome ou biografia'
    }
  }

  // Neutro (baixa confiança)
  return {
    gender: 'neutro',
    confidence: 0.3,
    reasoning: 'Não foi possível determinar o gênero com confiança'
  }
}
