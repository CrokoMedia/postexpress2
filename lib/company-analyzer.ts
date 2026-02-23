/**
 * Company Brand Analyzer
 * Analisa sites de empresas e extrai identidade visual (cores, logo, estilo)
 * Usa Playwright para screenshot + Gemini/Mistral para análise visual
 */

import { getServerSupabase } from './supabase'
import cloudinary from 'cloudinary'
import { extractWebsiteDataWithApify } from './apify-website-extractor'

// Configurar Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const GEMINI_API_KEY = process.env.GOOGLE_AI_API_KEY
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY

interface CompanyBrand {
  id: string
  domain: string
  name: string | null
  logo_url: string | null
  hero_image_url: string | null
  screenshot_url: string | null
  extracted_images: string[]
  color_palette: string[]
  primary_color: string | null
  secondary_color: string | null
  accent_color: string | null
  visual_style: string | null
  industry: string | null
  description: string | null
  is_manual: boolean
  analyzed_at: string
}

interface AnalysisResult {
  name: string
  colors: string[]
  primary_color: string
  secondary_color: string
  accent_color?: string
  visual_style: string
  industry: string
  description: string
}

/**
 * Normaliza domínio (remove http://, https://, www.)
 */
function normalizeDomain(url: string): string {
  let domain = url.toLowerCase().trim()
  domain = domain.replace(/^https?:\/\//, '')
  domain = domain.replace(/^www\./, '')
  domain = domain.replace(/\/.*$/, '') // Remove path
  return domain
}

/**
 * Captura screenshot do site usando Playwright MCP
 */
async function captureWebsiteScreenshot(url: string): Promise<string> {
  // TODO: Implementar chamada para Playwright MCP
  // Por enquanto, vamos simular (você pode usar o playwright tool)

  console.log(`📸 Capturando screenshot de ${url}...`)

  // Aqui você chamaria o Playwright MCP tool para:
  // 1. playwright.navigate(url)
  // 2. playwright.screenshot()
  // 3. Retornar base64 ou path do screenshot

  // Por enquanto retornamos uma URL dummy
  // Você precisará substituir isso pela implementação real do Playwright
  throw new Error('Playwright MCP screenshot não implementado ainda. Use a função com URL direta.')
}

/**
 * Captura screenshot do site e faz upload para Cloudinary
 * Tenta múltiplos serviços com fallback
 */
async function captureWebsiteScreenshotUrl(url: string): Promise<string | null> {
  const services = [
    // Serviço 1: ScreenshotAPI (free tier)
    `https://shot.screenshotapi.net/screenshot?url=${encodeURIComponent(url)}&width=1200&height=900&output=image&file_type=png&wait_for_event=load`,

    // Serviço 2: ApiFlash alternative
    `https://api.apiflash.com/v1/urltoimage?access_key=demo&url=${encodeURIComponent(url)}&width=1200&height=900&format=jpeg`,
  ]

  for (let i = 0; i < services.length; i++) {
    const screenshotServiceUrl = services[i]
    console.log(`   📸 Tentando capturar screenshot (serviço ${i + 1})...`)

    try {
      // Baixar screenshot
      const response = await fetch(screenshotServiceUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PostExpressBot/1.0)',
        },
      })

      if (!response.ok) {
        console.warn(`   ⚠️ Serviço ${i + 1} falhou: ${response.status}`)
        continue // Tentar próximo serviço
      }

      const buffer = await response.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      const dataUri = `data:image/jpeg;base64,${base64}`

      console.log(`   ☁️ Fazendo upload para Cloudinary...`)

      // Upload para Cloudinary (URL estável)
      const uploadResult = await cloudinary.v2.uploader.upload(dataUri, {
        folder: 'company-brands/screenshots',
        resource_type: 'image',
      })

      console.log(`   ✅ Screenshot salvo: ${uploadResult.secure_url}`)
      return uploadResult.secure_url

    } catch (error: any) {
      console.error(`   ❌ Serviço ${i + 1} erro:`, error?.message)
      continue // Tentar próximo serviço
    }
  }

  // Todos os serviços falharam
  console.warn(`   ⚠️ Todos os serviços de screenshot falharam. Análise sem screenshot.`)
  return null
}

/**
 * Analisa imagem com Gemini Vision API ou texto (fallback)
 */
async function analyzeWithGemini(screenshotUrl: string | null, domain: string): Promise<AnalysisResult> {
  if (!GEMINI_API_KEY) {
    throw new Error('GOOGLE_AI_API_KEY não configurada')
  }

  if (!screenshotUrl) {
    throw new Error('Gemini requer screenshot (sem modo textual implementado)')
  }

  console.log(`   🖼️ Analisando screenshot: ${screenshotUrl}`)

  const prompt = `Você é um especialista em branding e identidade visual. Analise esta captura de tela do site "${domain}" e extraia:

1. **Nome da empresa/marca** (título principal)
2. **Paleta de cores** (até 5 cores principais em formato HEX, ordenadas por importância)
3. **Cor primária** (cor dominante da marca)
4. **Cor secundária** (segunda cor mais importante)
5. **Cor de destaque/accent** (se houver)
6. **Estilo visual** (moderno, minimalista, esportivo, luxuoso, etc. - máx 10 palavras)
7. **Indústria/setor** (tecnologia, esportes, moda, alimentação, etc.)
8. **Descrição** (1 frase sobre o que a empresa faz)

Retorne APENAS um JSON válido neste formato:
{
  "name": "Nome da Marca",
  "colors": ["#HEX1", "#HEX2", "#HEX3"],
  "primary_color": "#HEX",
  "secondary_color": "#HEX",
  "accent_color": "#HEX",
  "visual_style": "descritivo conciso",
  "industry": "setor",
  "description": "descrição em 1 frase"
}`

  // Baixar screenshot como base64
  const imageBase64 = await fetchImageAsBase64(screenshotUrl)

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: imageBase64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1024,
        },
      }),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`   ❌ Gemini HTTP error:`, errorText)
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  console.log(`   📦 Gemini response:`, JSON.stringify(data, null, 2))

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) {
    console.error(`   ❌ Gemini response structure:`, data)
    throw new Error('Gemini não retornou texto na resposta')
  }

  console.log(`   📝 Gemini text:`, text)

  // Extrair JSON da resposta (pode vir com markdown)
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    console.error(`   ❌ Gemini text não contém JSON:`, text)
    throw new Error('Gemini não retornou JSON válido')
  }

  const parsed = JSON.parse(jsonMatch[0])
  console.log(`   ✅ Parsed JSON:`, parsed)
  return parsed
}

/**
 * Analisa imagem com Mistral Vision API ou texto (fallback)
 */
async function analyzeWithMistral(screenshotUrl: string | null, domain: string): Promise<AnalysisResult> {
  if (!MISTRAL_API_KEY) {
    throw new Error('MISTRAL_API_KEY não configurada')
  }

  let prompt: string
  let messageContent: any[]

  if (screenshotUrl) {
    // Com screenshot
    console.log(`   🖼️ Analisando screenshot com Mistral: ${screenshotUrl}`)
    prompt = `Analise esta captura do site "${domain}" e retorne JSON com: name, colors (array hex), primary_color, secondary_color, accent_color, visual_style, industry, description.`
    messageContent = [
      { type: 'text', text: prompt },
      { type: 'image_url', image_url: screenshotUrl },
    ]
  } else {
    // Sem screenshot - análise textual
    console.log(`   📝 Analisando apenas por domínio (sem screenshot): ${domain}`)
    prompt = `Você é especialista em branding. Baseado no domínio "${domain}", infira a identidade visual da marca.
Retorne JSON com:
- name: nome da empresa
- colors: array de 3-5 cores HEX típicas dessa marca (se conhecida)
- primary_color, secondary_color, accent_color
- visual_style: estilo visual típico dessa indústria
- industry: setor/indústria
- description: breve descrição

Retorne APENAS JSON válido.`
    messageContent = [{ type: 'text', text: prompt }]
  }

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model: screenshotUrl ? 'pixtral-12b-latest' : 'mistral-large-latest', // Usar modelo text se não tiver imagem
      messages: [
        {
          role: 'user',
          content: messageContent,
        },
      ],
      temperature: 0.3,
      max_tokens: 1024,
      response_format: { type: 'json_object' }, // Forçar JSON
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Mistral API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  const text = data.choices?.[0]?.message?.content

  if (!text) {
    throw new Error('Mistral não retornou texto')
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Mistral não retornou JSON válido')
  }

  return JSON.parse(jsonMatch[0])
}

/**
 * Converte URL de imagem para base64
 */
async function fetchImageAsBase64(imageUrl: string): Promise<string> {
  console.log(`   📥 Baixando imagem: ${imageUrl}`)
  try {
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    const buffer = await response.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    console.log(`   ✅ Imagem baixada (${(base64.length / 1024).toFixed(2)} KB)`)
    return base64
  } catch (error: any) {
    console.error(`   ❌ Erro ao baixar imagem:`, error?.message || error)
    throw new Error(`Falha ao baixar screenshot: ${error?.message || 'erro desconhecido'}`)
  }
}

/**
 * Faz upload de screenshot para Cloudinary
 */
async function uploadScreenshotToCloudinary(screenshotUrl: string, domain: string): Promise<string> {
  const result = await cloudinary.v2.uploader.upload(screenshotUrl, {
    folder: 'company-brands',
    public_id: `screenshot-${domain.replace(/\./g, '-')}-${Date.now()}`,
    overwrite: false,
  })
  return result.secure_url
}

/**
 * Busca marca no cache (banco de dados)
 */
export async function getCompanyBrandFromCache(url: string): Promise<CompanyBrand | null> {
  const domain = normalizeDomain(url)
  const supabase = getServerSupabase()

  const { data, error } = await supabase
    .from('company_brands')
    .select('*')
    .eq('domain', domain)
    .single()

  if (error || !data) {
    return null
  }

  return data as CompanyBrand
}

/**
 * Analisa site da empresa e extrai identidade visual
 * Usa cache se disponível, caso contrário faz análise completa
 */
export async function analyzeCompanyBrand(url: string): Promise<CompanyBrand> {
  const domain = normalizeDomain(url)

  // 1. Verificar cache
  console.log(`🔍 Verificando cache para ${domain}...`)
  const cached = await getCompanyBrandFromCache(domain)
  if (cached) {
    console.log(`✅ Cache hit! Usando dados salvos de ${domain}`)
    return cached
  }

  console.log(`⚡ Cache miss. Analisando ${domain}...`)

  const websiteUrl = `https://${domain}`
  let screenshotUrl: string | null = null
  let apifyData: any = null

  // 2. OPÇÃO 1: Tentar extrair dados com Apify (MELHOR)
  try {
    console.log(`   🕷️ Método 1: Extração com Apify...`)
    apifyData = await extractWebsiteDataWithApify(websiteUrl)
    console.log(`   ✅ Apify extraiu:`, {
      images: apifyData.images.length,
      logo: !!apifyData.logoUrl,
      hero: !!apifyData.heroImageUrl,
      colors: apifyData.colors.length,
    })
  } catch (apifyError: any) {
    console.warn(`   ⚠️ Apify falhou: ${apifyError.message}`)
    console.log(`   🔄 Fallback: Screenshot + análise visual...`)

    // OPÇÃO 2: Fallback com screenshot (método antigo)
    try {
      screenshotUrl = await captureWebsiteScreenshotUrl(websiteUrl)
      if (!screenshotUrl) {
        console.warn(`   ⚠️ Screenshot não disponível, continuando com análise textual...`)
      }
    } catch (screenshotError: any) {
      console.warn(`   ⚠️ Screenshot falhou (não crítico):`, screenshotError?.message)
    }
  }

  // 3. Análise de identidade visual
  let analysis: AnalysisResult

  if (apifyData) {
    // OPÇÃO 1: Usar dados da Apify + análise com Mistral para completar
    console.log(`🤖 Analisando identidade com dados da Apify...`)
    try {
      analysis = await analyzeWithMistral(screenshotUrl, domain)
      // Enriquecer com dados da Apify
      if (apifyData.colors.length > 0) {
        analysis.colors = apifyData.colors
        analysis.primary_color = apifyData.colors[0]
        analysis.secondary_color = apifyData.colors[1] || apifyData.colors[0]
        analysis.accent_color = apifyData.colors[2]
      }
      if (apifyData.title) {
        analysis.name = apifyData.title
      }
      if (apifyData.description) {
        analysis.description = apifyData.description
      }
      console.log(`✅ Análise enriquecida com Apify + Mistral`)
    } catch (mistralError: any) {
      // Se Mistral falhar, criar análise básica com dados da Apify
      console.warn(`⚠️ Mistral falhou, usando apenas dados Apify`)
      analysis = {
        name: apifyData.title || domain,
        colors: apifyData.colors.length > 0 ? apifyData.colors : ['#1a1a1a', '#ffffff'],
        primary_color: apifyData.colors[0] || '#1a1a1a',
        secondary_color: apifyData.colors[1] || '#ffffff',
        accent_color: apifyData.colors[2],
        visual_style: 'modern professional',
        industry: 'business',
        description: apifyData.description || `Website: ${domain}`,
      }
    }
  } else {
    // OPÇÃO 2: Análise tradicional (Gemini ou Mistral)
    try {
      console.log(`🤖 Analisando com Gemini Flash 2.0...`)
      analysis = await analyzeWithGemini(screenshotUrl, domain)
      console.log(`✅ Gemini analysis success:`, analysis)
    } catch (geminiError: any) {
      console.warn(`⚠️ Gemini falhou:`, geminiError?.message || geminiError)
      try {
        console.log(`🔄 Tentando Mistral como fallback...`)
        analysis = await analyzeWithMistral(screenshotUrl, domain)
        console.log(`✅ Mistral analysis success:`, analysis)
      } catch (mistralError: any) {
        console.error(`❌ Ambas análises falharam`)
        throw new Error(`Análise falhou - Gemini: ${geminiError?.message || 'erro desconhecido'}, Mistral: ${mistralError?.message || 'erro desconhecido'}`)
      }
    }
  }

  // 4. Salvar no banco de dados
  console.log(`💾 Salvando no banco de dados...`)
  try {
    const supabase = getServerSupabase()
    const insertData = {
      domain,
      name: analysis.name,
      logo_url: apifyData?.logoUrl || null,
      hero_image_url: apifyData?.heroImageUrl || null,
      screenshot_url: screenshotUrl,
      extracted_images: apifyData?.images || [],
      color_palette: analysis.colors,
      primary_color: analysis.primary_color,
      secondary_color: analysis.secondary_color,
      accent_color: analysis.accent_color || null,
      visual_style: analysis.visual_style,
      industry: analysis.industry,
      description: analysis.description,
      is_manual: false,
      analyzed_at: new Date().toISOString(),
    }

    console.log(`   📝 Dados a salvar no banco:`)
    console.log(`      - Nome: ${insertData.name}`)
    console.log(`      - Logo URL: ${insertData.logo_url || 'NÃO ENCONTRADO'}`)
    console.log(`      - Hero Image: ${insertData.hero_image_url || 'NÃO ENCONTRADO'}`)
    console.log(`      - Screenshot: ${insertData.screenshot_url || 'NÃO ENCONTRADO'}`)
    console.log(`      - Imagens extraídas: ${insertData.extracted_images.length}`)
    console.log(`      - Cores: ${insertData.color_palette.join(', ')}`)
    console.log(`      - Estilo: ${insertData.visual_style}`)
    console.log(`   📝 Full data:`, JSON.stringify(insertData, null, 2))

    const { data, error } = await supabase
      .from('company_brands')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao salvar no banco:', error)
      throw new Error(`Supabase error: ${error.message}`)
    }

    console.log(`✅ Identidade visual de ${domain} analisada e salva!`)
    return data as CompanyBrand
  } catch (dbError: any) {
    console.error('❌ Erro ao salvar no banco:', dbError)
    throw new Error(`Falha ao salvar no cache: ${dbError?.message || 'erro desconhecido'}`)
  }
}

/**
 * Salva marca manualmente (cadastro manual via formulário)
 */
export async function saveCompanyBrandManually(brandData: {
  domain: string
  name: string
  colors: string[]
  primary_color: string
  secondary_color?: string
  accent_color?: string
  visual_style?: string
  industry?: string
  description?: string
  logo_url?: string
}): Promise<CompanyBrand> {
  const domain = normalizeDomain(brandData.domain)
  const supabase = getServerSupabase()

  const { data, error } = await supabase
    .from('company_brands')
    .upsert(
      {
        domain,
        name: brandData.name,
        logo_url: brandData.logo_url || null,
        screenshot_url: null,
        color_palette: brandData.colors,
        primary_color: brandData.primary_color,
        secondary_color: brandData.secondary_color || null,
        accent_color: brandData.accent_color || null,
        visual_style: brandData.visual_style || null,
        industry: brandData.industry || null,
        description: brandData.description || null,
        is_manual: true,
        analyzed_at: new Date().toISOString(),
      },
      { onConflict: 'domain' }
    )
    .select()
    .single()

  if (error) {
    throw new Error(`Erro ao salvar marca: ${error.message}`)
  }

  return data as CompanyBrand
}
