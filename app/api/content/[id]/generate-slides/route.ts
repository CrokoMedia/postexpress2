// DEPRECATED: use generate-slides-v3 (Remotion renderStill)
import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { getBrowser } from '@/lib/browser'
import { replaceEmojisWithAppleImages } from '@/lib/emoji-utils'
import { generateContentImage } from '@/lib/fal-image'
import cloudinary from 'cloudinary'
import fs from 'fs'
import path from 'path'

// Configurar Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Formata o texto do slide a partir da estrutura do Content Squad
 */
function formatSlideText(slide: any): string {
  // Content Squad structure: { numero, tipo, titulo, corpo, notas_design }
  // Legacy structure: { text } or { content }

  if (slide.text) return slide.text
  if (slide.content) return slide.content

  // Content Squad format
  if (slide.titulo && slide.corpo) {
    return `${slide.titulo}\n\n${slide.corpo}`
  }

  if (slide.titulo) return slide.titulo
  if (slide.corpo) return slide.corpo

  return ''
}

/**
 * @deprecated Use generate-slides-v3 (Remotion renderStill) instead
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Add deprecation header to all responses from this endpoint
  const addDeprecationHeader = (response: NextResponse) => {
    response.headers.set('X-Deprecated', 'true')
    response.headers.set('X-Deprecated-Use', '/api/content/[id]/generate-slides-v3')
    return response
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { carousels, profile, slideImageOptions } = body

    if (!carousels || carousels.length === 0) {
      return NextResponse.json(
        { error: 'No carousels provided' },
        { status: 400 }
      )
    }

    // Filtrar apenas carrosséis aprovados
    const approvedCarousels = carousels.filter((c: any) => c.approved === true)

    if (approvedCarousels.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum carrossel aprovado. Aprove pelo menos um carrossel antes de gerar slides.' },
        { status: 400 }
      )
    }

    console.log(`🎨 Gerando slides para ${approvedCarousels.length} carrosséis aprovados (de ${carousels.length} totais)...`)

    const browser = await getBrowser()

    const results = []

    // Mapear índices originais dos carrosséis aprovados
    const approvedIndices = carousels
      .map((c: any, idx: number) => ({ carousel: c, originalIndex: idx }))
      .filter(({ carousel }: { carousel: any }) => carousel.approved === true)

    for (let i = 0; i < approvedIndices.length; i++) {
      const { carousel, originalIndex } = approvedIndices[i]
      const carouselName = `carrossel-${i + 1}`

      console.log(`📝 Processando ${carouselName} (${carousel.slides.length} slides)...`)

      const slideImages = []

      for (let j = 0; j < carousel.slides.length; j++) {
        const slide = carousel.slides[j]
        const slideName = `slide-${j + 1}`

        // Verificar se existe configuração customizada para este slide
        const slideConfig = slideImageOptions?.[originalIndex]?.[j]
        const hasImageConfig = slideConfig && slideConfig.mode !== 'no_image'

        console.log(`   🖼️  Gerando ${slideName}... ${hasImageConfig ? '(com imagem)' : '(só texto)'}`)

        let contentImageUrl = ''

        // Se tem configuração de imagem, gerar/buscar a imagem
        if (hasImageConfig) {
          if (slideConfig.mode === 'upload' && slideConfig.uploadUrl) {
            // Usar imagem enviada
            contentImageUrl = slideConfig.uploadUrl
            console.log(`   📤 Usando imagem enviada: ${contentImageUrl}`)
          } else if (slideConfig.mode === 'custom_prompt' && slideConfig.customPrompt) {
            // Gerar com prompt customizado
            try {
              const fullPrompt = [
                slideConfig.customPrompt,
                'professional photography, photorealistic, high quality, sharp focus',
                'natural lighting, modern aesthetic, clean composition',
                'no text visible, no letters, no words, no typography in the image',
              ]
                .filter(Boolean)
                .join(', ')

              console.log(`   ✍️  Gerando com prompt: "${fullPrompt.substring(0, 100)}..."`)
              contentImageUrl = await generateContentImage(fullPrompt)
              console.log(`   ✅ Imagem gerada: ${contentImageUrl}`)
            } catch (err: any) {
              console.warn(`   ⚠️ fal.ai falhou (${err.message}), continuando sem imagem`)
            }
          } else if (slideConfig.mode === 'auto') {
            // Gerar automaticamente baseado no conteúdo
            try {
              const slideText = formatSlideText(slide)
              const imagemPrompt = slide.imagem_prompt || slide.titulo || slideText.substring(0, 200)

              const fullPrompt = [
                imagemPrompt,
                'professional photography, photorealistic, high quality, sharp focus',
                'natural lighting, modern aesthetic, clean composition',
                'no text visible, no letters, no words, no typography in the image',
              ]
                .filter(Boolean)
                .join(', ')

              console.log(`   🤖 Gerando imagem automática: "${fullPrompt.substring(0, 100)}..."`)
              contentImageUrl = await generateContentImage(fullPrompt)
              console.log(`   ✅ Imagem gerada: ${contentImageUrl}`)
            } catch (err: any) {
              console.warn(`   ⚠️ fal.ai falhou (${err.message}), continuando sem imagem`)
            }
          }
        }

        // Gerar HTML do slide (com ou sem imagem)
        const html = contentImageUrl
          ? await generateSlideHTMLWithImage({
              text: formatSlideText(slide),
              contentImageUrl,
              profilePicUrl: profile?.profile_pic_cloudinary_url || profile?.profile_pic_url_hd || '',
              username: profile?.username || '',
              fullName: profile?.full_name || '',
              slideNumber: j + 1,
              totalSlides: carousel.slides.length,
            })
          : await generateSlideHTML({
              text: formatSlideText(slide),
              profilePicUrl: profile?.profile_pic_cloudinary_url || profile?.profile_pic_url_hd || '',
              username: profile?.username || '',
              fullName: profile?.full_name || '',
              slideNumber: j + 1,
              totalSlides: carousel.slides.length,
            })

        // Criar página e fazer screenshot
        const page = await browser.newPage()
        await page.setViewport({ width: 1080, height: 1350 })
        await page.setContent(html, { waitUntil: 'networkidle0' })


        // Criar diretório temporário
        const tempDir = path.join('/tmp', 'slides', id)
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true })
        }

        const tempFilePath = path.join(tempDir, `${carouselName}-${slideName}.png`)

        // Screenshot
        await page.screenshot({
          path: tempFilePath,
          type: 'png'
        })

        await page.close()

        console.log(`   ✅ Screenshot salvo: ${tempFilePath}`)

        // Upload para Cloudinary
        console.log(`   ☁️  Uploading para Cloudinary...`)

        const uploadResult = await cloudinary.v2.uploader.upload(tempFilePath, {
          folder: `carousel-slides/${id}/${carouselName}`,
          public_id: slideName,
          overwrite: true,
          resource_type: 'image'
        })

        console.log(`   ✅ Upload concluído: ${uploadResult.secure_url}`)

        slideImages.push({
          slideNumber: j + 1,
          localPath: tempFilePath,
          cloudinaryUrl: uploadResult.secure_url,
          cloudinaryPublicId: uploadResult.public_id,
          width: uploadResult.width,
          height: uploadResult.height,
          size: uploadResult.bytes
        })

        // Remover arquivo temporário
        fs.unlinkSync(tempFilePath)
      }

      results.push({
        carouselIndex: originalIndex, // Usar índice original para manter referência
        carouselName,
        title: carousel.title || carousel.titulo || `Carrossel ${originalIndex + 1}`,
        slides: slideImages,
        totalSlides: slideImages.length,
        approved: true
      })

      console.log(`✅ ${carouselName} concluído (${slideImages.length} slides)`)
    }

    await browser.close()

    console.log(`\n🎉 Todos os slides gerados com sucesso!`)
    console.log(`   Total de carrosséis: ${results.length}`)
    console.log(`   Total de slides: ${results.reduce((acc, r) => acc + r.slides.length, 0)}`)

    // Salvar slides no banco (tabela content_suggestions)
    console.log('💾 Salvando slides no banco...')
    const supabase = getServerSupabase()

    const slidesData = {
      carousels: results,
      summary: {
        totalCarousels: results.length,
        totalSlides: results.reduce((acc, r) => acc + r.slides.length, 0)
      },
      generated_at: new Date().toISOString()
    }

    // Buscar content_suggestion para este audit
    const { data: contentSuggestion, error: fetchError } = await supabase
      .from('content_suggestions')
      .select('id')
      .eq('audit_id', id)
      .single()

    if (fetchError || !contentSuggestion) {
      console.error('❌ Content suggestion não encontrado para audit_id:', id, fetchError)
      return NextResponse.json(
        { error: 'Conteúdo não encontrado. Gere o conteúdo textual antes de gerar slides.' },
        { status: 404 }
      )
    }

    const { error: updateError } = await supabase
      .from('content_suggestions')
      .update({ slides_json: slidesData })
      .eq('id', contentSuggestion.id)

    if (updateError) {
      console.error('❌ Erro ao salvar slides no banco:', updateError)
      return NextResponse.json(
        { error: 'Slides gerados mas não foi possível salvar. Tente novamente.' },
        { status: 500 }
      )
    }

    console.log('✅ Slides salvos no banco com sucesso')

    return NextResponse.json({
      success: true,
      carousels: results,
      summary: {
        totalCarousels: results.length,
        totalSlides: results.reduce((acc, r) => acc + r.slides.length, 0)
      }
    })

  } catch (error: any) {
    console.error('Error generating slides:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate slides' },
      { status: 500 }
    )
  }
}

/**
 * Gera HTML para um slide individual
 */
async function generateSlideHTML({
  text,
  profilePicUrl,
  username,
  fullName,
  slideNumber,
  totalSlides
}: {
  text: string
  profilePicUrl: string
  username: string
  fullName: string
  slideNumber: number
  totalSlides: number
}): Promise<string> {
  const formattedContent = await formatTextToHTML(text)
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Slide ${slideNumber}/${totalSlides} — @${username}</title>
  <style>
    @font-face {
      font-family: 'Sofia Pro';
      src: url('file:///Users/macbook-karla/postexpress2/public/fonts/sofia-pro/SofiaPro-Regular.otf') format('opentype');
      font-weight: 400;
      font-style: normal;
      font-display: block;
    }
    @font-face {
      font-family: 'Sofia Pro';
      src: url('file:///Users/macbook-karla/postexpress2/public/fonts/sofia-pro/SofiaPro-Bold.otf') format('opentype');
      font-weight: 700;
      font-style: normal;
      font-display: block;
    }
    @font-face {
      font-family: 'Sofia Pro';
      src: url('file:///Users/macbook-karla/postexpress2/public/fonts/sofia-pro/SofiaPro-SemiBold.otf') format('opentype');
      font-weight: 600;
      font-style: normal;
      font-display: block;
    }
    @font-face {
      font-family: 'Sofia Pro';
      src: url('file:///Users/macbook-karla/postexpress2/public/fonts/sofia-pro/SofiaPro-Medium.otf') format('opentype');
      font-weight: 500;
      font-style: normal;
      font-display: block;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { margin: 0; padding: 0; }

    .slide {
      width: 1080px;
      height: 1350px;
      background: #ffffff;
      font-family: 'Sofia Pro', system-ui, -apple-system, sans-serif;
      color: #0f1419;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 100px 110px;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .post-wrapper { width: 100%; }

    .header {
      display: flex;
      align-items: center;
      gap: 18px;
      margin-bottom: 36px;
    }

    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #e1e1e1;
      flex-shrink: 0;
    }

    .user-info { flex: 1; }

    .name {
      font-size: 36px;
      font-weight: 700;
      line-height: 1.2;
      color: #0f1419;
      margin-bottom: 4px;
      letter-spacing: 0;
    }

    .username {
      font-size: 30px;
      font-weight: 400;
      color: #536471;
      letter-spacing: 0;
    }

    .content {
      font-size: 44px;
      font-weight: 400;
      line-height: 1.4;
      color: #0f1419;
      word-wrap: break-word;
      letter-spacing: 0;
    }

    .content p {
      margin-bottom: 24px;
      letter-spacing: 0;
    }

    .content p:last-child {
      margin-bottom: 0;
    }

    .content strong {
      font-weight: 700;
      letter-spacing: 0;
    }

    /* Garantir renderização correta de emojis inline */
    .content img {
      display: inline;
      vertical-align: middle;
    }

    .footer {
      margin-top: 48px;
      padding-top: 32px;
      border-top: 1px solid #eff3f4;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 22px;
      color: #536471;
    }

    .slide-number {
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="slide">
    <div class="post-wrapper">
      <div class="header">
        ${profilePicUrl ? `<img src="${profilePicUrl}" alt="${username}" class="avatar" />` : ''}
        <div class="user-info">
          <div class="name">${fullName || username}</div>
          <div class="username">@${username}</div>
        </div>
      </div>
      <div class="content">
        ${formattedContent}
      </div>
      <div class="footer">
        <div class="slide-number">${slideNumber}/${totalSlides}</div>
      </div>
    </div>
  </div>
</body>
</html>`
}

/**
 * Gera HTML para um slide individual COM IMAGEM (Template V1 com imagem)
 */
async function generateSlideHTMLWithImage({
  text,
  contentImageUrl,
  profilePicUrl,
  username,
  fullName,
  slideNumber,
  totalSlides,
}: {
  text: string
  contentImageUrl: string
  profilePicUrl: string
  username: string
  fullName: string
  slideNumber: number
  totalSlides: number
}): Promise<string> {
  const formattedContent = await formatTextToHTML(text)

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Slide ${slideNumber}/${totalSlides} — @${username}</title>
  <style>
    @font-face {
      font-family: 'Sofia Pro';
      src: url('file:///Users/macbook-karla/postexpress2/public/fonts/sofia-pro/SofiaPro-Regular.otf') format('opentype');
      font-weight: 400;
      font-style: normal;
      font-display: block;
    }
    @font-face {
      font-family: 'Sofia Pro';
      src: url('file:///Users/macbook-karla/postexpress2/public/fonts/sofia-pro/SofiaPro-Bold.otf') format('opentype');
      font-weight: 700;
      font-style: normal;
      font-display: block;
    }
    @font-face {
      font-family: 'Sofia Pro';
      src: url('file:///Users/macbook-karla/postexpress2/public/fonts/sofia-pro/SofiaPro-SemiBold.otf') format('opentype');
      font-weight: 600;
      font-style: normal;
      font-display: block;
    }
    @font-face {
      font-family: 'Sofia Pro';
      src: url('file:///Users/macbook-karla/postexpress2/public/fonts/sofia-pro/SofiaPro-Medium.otf') format('opentype');
      font-weight: 500;
      font-style: normal;
      font-display: block;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { margin: 0; padding: 0; }

    .slide {
      width: 1080px;
      height: 1350px;
      background: #ffffff;
      font-family: 'Sofia Pro', system-ui, -apple-system, sans-serif;
      color: #0f1419;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 80px 90px;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .post-wrapper {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 18px;
    }

    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #e1e1e1;
      flex-shrink: 0;
    }

    .user-info { flex: 1; }

    .name {
      font-size: 36px;
      font-weight: 700;
      line-height: 1.2;
      color: #0f1419;
      margin-bottom: 4px;
      letter-spacing: 0;
    }

    .username {
      font-size: 30px;
      font-weight: 400;
      color: #536471;
      letter-spacing: 0;
    }

    .content {
      font-size: 40px;
      font-weight: 400;
      line-height: 1.4;
      color: #0f1419;
      word-wrap: break-word;
      letter-spacing: 0;
    }

    .content p {
      margin-bottom: 20px;
      letter-spacing: 0;
    }

    .content p:last-child {
      margin-bottom: 0;
    }

    .content strong {
      font-weight: 700;
      letter-spacing: 0;
    }

    .content img {
      display: inline;
      vertical-align: middle;
    }

    /* Imagem do conteúdo */
    .content-image {
      width: 100%;
      border-radius: 16px;
      overflow: hidden;
    }

    .content-image img {
      width: 100%;
      height: 400px;
      object-fit: cover;
      display: block;
    }

    .footer {
      padding-top: 24px;
      border-top: 1px solid #eff3f4;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 22px;
      color: #536471;
    }

    .slide-number {
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="slide">
    <div class="post-wrapper">
      <div class="header">
        ${profilePicUrl ? `<img src="${profilePicUrl}" alt="${username}" class="avatar" />` : ''}
        <div class="user-info">
          <div class="name">${fullName || username}</div>
          <div class="username">@${username}</div>
        </div>
      </div>
      <div class="content">
        ${formattedContent}
      </div>
      <div class="content-image">
        <img src="${contentImageUrl}" alt="Imagem do slide" />
      </div>
      <div class="footer">
        <div class="slide-number">${slideNumber}/${totalSlides}</div>
      </div>
    </div>
  </div>
</body>
</html>`
}

/**
 * Formata texto para HTML com quebras de linha e negrito
 */
async function formatTextToHTML(text: string): Promise<string> {
  // Quebrar em parágrafos
  const paragraphs = text.split('\n').filter(p => p.trim())

  // Formatar cada parágrafo
  const formatted = await Promise.all(paragraphs.map(async p => {
    // Aplicar negrito em palavras em CAPS (antes de processar emojis)
    const withBold = p.replace(/\b([A-ZÀ-Ú]{2,})\b/g, '<strong>$1</strong>')
    // Substituir emojis por imagens Apple por último
    const withEmojis = await replaceEmojisWithAppleImages(withBold)
    return `<p>${withEmojis}</p>`
  }))

  return formatted.join('\n        ')
}
