import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { getBrowser } from '@/lib/browser'
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
 * Gera slides visuais a partir dos carrosséis de conteúdo
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { carousels, profile } = body

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

        console.log(`   🖼️  Gerando ${slideName}...`)

        // Gerar HTML do slide
        const html = generateSlideHTML({
          text: formatSlideText(slide),
          profilePicUrl: profile?.profile_pic_cloudinary_url || profile?.profile_pic_url_hd || '',
          username: profile?.username || '',
          fullName: profile?.full_name || '',
          slideNumber: j + 1,
          totalSlides: carousel.slides.length
        })

        // Criar página e fazer screenshot
        const page = await browser.newPage()
        await page.setViewport({ width: 1080, height: 1350 })
        await page.setContent(html, { waitUntil: 'networkidle0' })

        // Aplicar Twemoji para emojis coloridos
        await page.evaluate(() => {
          // @ts-ignore
          if (typeof twemoji !== 'undefined') {
            // @ts-ignore
            twemoji.parse(document.body, { folder: 'svg', ext: '.svg' })
          }
        })

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
function generateSlideHTML({
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
}): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Slide ${slideNumber}/${totalSlides} — @${username}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <script src="https://cdn.jsdelivr.net/npm/twemoji@14.0.2/dist/twemoji.min.js" crossorigin="anonymous"></script>
  <style>
    @font-face {
      font-family: 'Chirp';
      src: url('https://abs.twimg.com/fonts/chirp-regular-web.woff') format('woff');
      font-weight: 400; font-style: normal; font-display: swap;
    }
    @font-face {
      font-family: 'Chirp';
      src: url('https://abs.twimg.com/fonts/chirp-bold-web.woff') format('woff');
      font-weight: 700; font-style: normal; font-display: swap;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { margin: 0; padding: 0; }
    img.emoji { height: 1em; width: 1em; margin: 0 0.05em 0 0.1em; vertical-align: -0.1em; display: inline; }

    .slide {
      width: 1080px;
      height: 1350px;
      background: #ffffff;
      font-family: 'Chirp', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f1419;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 100px 110px;
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
      font-size: 28px;
      font-weight: 700;
      line-height: 1.2;
      color: #0f1419;
      margin-bottom: 4px;
    }

    .username {
      font-size: 24px;
      font-weight: 400;
      color: #536471;
    }

    .content {
      font-size: 44px;
      font-weight: 400;
      line-height: 1.4;
      color: #0f1419;
      word-wrap: break-word;
    }

    .content p {
      margin-bottom: 24px;
    }

    .content p:last-child {
      margin-bottom: 0;
    }

    .content strong {
      font-weight: 700;
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
        ${formatTextToHTML(text)}
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
function formatTextToHTML(text: string): string {
  // Quebrar em parágrafos
  const paragraphs = text.split('\n').filter(p => p.trim())

  // Formatar cada parágrafo
  const formatted = paragraphs.map(p => {
    // Aplicar negrito em palavras em CAPS
    const withBold = p.replace(/\b([A-ZÀ-Ú]{2,})\b/g, '<strong>$1</strong>')
    return `<p>${withBold}</p>`
  })

  return formatted.join('\n        ')
}
