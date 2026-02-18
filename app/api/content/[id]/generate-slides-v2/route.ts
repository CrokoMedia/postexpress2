import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { generateContentImage } from '@/lib/fal-image'
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
 * Extrai o título e corpo do slide a partir da estrutura do Content Squad
 */
function getSlideFields(slide: any): { titulo: string; corpo: string } {
  if (slide.titulo && slide.corpo) {
    return { titulo: slide.titulo, corpo: slide.corpo }
  }
  if (slide.titulo) {
    return { titulo: slide.titulo, corpo: '' }
  }
  if (slide.text) {
    const lines = slide.text.split('\n').filter((l: string) => l.trim())
    return {
      titulo: lines[0] || '',
      corpo: lines.slice(1).join('\n'),
    }
  }
  return { titulo: '', corpo: slide.content || '' }
}

/**
 * Endpoint POST para gerar slides com o template V2 (fal.ai + Puppeteer)
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

    console.log(`🎨 [V2] Gerando slides para ${approvedCarousels.length} carrosséis aprovados...`)

    // Contexto de nicho do expert — ancora todas as imagens geradas
    const nicheContext = [
      profile?.biography ? profile.biography.substring(0, 150) : null,
      profile?.full_name ? `Expert: ${profile.full_name}` : null,
      profile?.username ? `Instagram: @${profile.username}` : null,
    ]
      .filter(Boolean)
      .join('. ')

    const browser = await getBrowser()

    const results = []

    // Mapear índices originais dos carrosséis aprovados
    const approvedIndices = carousels
      .map((c: any, idx: number) => ({ carousel: c, originalIndex: idx }))
      .filter(({ carousel }: { carousel: any }) => carousel.approved === true)

    for (let i = 0; i < approvedIndices.length; i++) {
      const { carousel, originalIndex } = approvedIndices[i]
      const carouselName = `carrossel-${i + 1}`

      console.log(`📝 [V2] Processando ${carouselName} (${carousel.slides.length} slides)...`)

      const slideImages = []

      for (let j = 0; j < carousel.slides.length; j++) {
        const slide = carousel.slides[j]
        const slideName = `slide-${j + 1}`
        const { titulo, corpo } = getSlideFields(slide)
        const imagemPrompt = slide.imagem_prompt || titulo || corpo

        console.log(`   🖼️  [V2] Gerando ${slideName}: "${titulo}"`)

        // Gerar imagem via fal.ai usando o prompt contextual + nicho do expert
        let contentImageUrl = ''
        try {
          const fullPrompt = [
            imagemPrompt,
            nicheContext ? `Context: ${nicheContext}` : '',
            'Professional editorial photography, minimalist style, soft lighting, neutral background. No text, no letters, no words in the image. Ultra realistic.',
          ]
            .filter(Boolean)
            .join('. ')

          console.log(`   🤖 Gerando imagem com fal.ai: "${fullPrompt.substring(0, 120)}..."`)
          contentImageUrl = await generateContentImage(fullPrompt)
          console.log(`   ✅ Imagem fal.ai: ${contentImageUrl}`)
        } catch (falError: any) {
          console.warn(`   ⚠️ fal.ai falhou (${falError.message}), usando placeholder`)
          // Continuar sem imagem central se fal.ai falhar
        }

        // Gerar HTML V2 do slide
        const html = generateSlideHTMLV2({
          titulo,
          corpo,
          contentImageUrl,
          profilePicUrl:
            profile?.profile_pic_cloudinary_url || profile?.profile_pic_url_hd || '',
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
        const tempDir = path.join('/tmp', 'slides-v2', id)
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true })
        }

        const tempFilePath = path.join(tempDir, `${carouselName}-${slideName}.png`)

        // Screenshot
        await page.screenshot({
          path: tempFilePath,
          type: 'png',
        })

        await page.close()

        console.log(`   ✅ Screenshot V2 salvo: ${tempFilePath}`)

        // Upload para Cloudinary
        console.log(`   ☁️  Uploading V2 para Cloudinary...`)

        const uploadResult = await cloudinary.v2.uploader.upload(tempFilePath, {
          folder: `carousel-slides-v2/${id}/${carouselName}`,
          public_id: slideName,
          overwrite: true,
          resource_type: 'image',
        })

        console.log(`   ✅ Upload V2 concluído: ${uploadResult.secure_url}`)

        slideImages.push({
          slideNumber: j + 1,
          localPath: tempFilePath,
          cloudinaryUrl: uploadResult.secure_url,
          cloudinaryPublicId: uploadResult.public_id,
          width: uploadResult.width,
          height: uploadResult.height,
          size: uploadResult.bytes,
          contentImageUrl,
        })

        // Remover arquivo temporário
        fs.unlinkSync(tempFilePath)
      }

      results.push({
        carouselIndex: originalIndex,
        carouselName,
        title: carousel.title || carousel.titulo || `Carrossel ${originalIndex + 1}`,
        slides: slideImages,
        totalSlides: slideImages.length,
        approved: true,
      })

      console.log(`✅ [V2] ${carouselName} concluído (${slideImages.length} slides)`)
    }

    await browser.close()

    console.log(`\n🎉 [V2] Todos os slides gerados com sucesso!`)
    console.log(`   Total de carrosséis: ${results.length}`)
    console.log(`   Total de slides: ${results.reduce((acc, r) => acc + r.slides.length, 0)}`)

    // Salvar slides no banco (tabela content_suggestions)
    console.log('💾 Salvando slides V2 no banco...')
    const supabase = getServerSupabase()

    const slidesData = {
      carousels: results,
      summary: {
        totalCarousels: results.length,
        totalSlides: results.reduce((acc, r) => acc + r.slides.length, 0),
      },
      template: 'v2',
      generated_at: new Date().toISOString(),
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
      .update({ slides_v2_json: slidesData })
      .eq('id', contentSuggestion.id)

    if (updateError) {
      console.error('❌ Erro ao salvar slides V2 no banco:', updateError)
      return NextResponse.json(
        { error: 'Slides gerados mas não foi possível salvar. Tente novamente.' },
        { status: 500 }
      )
    }

    console.log('✅ Slides V2 salvos no banco com sucesso')

    return NextResponse.json({
      success: true,
      carousels: results,
      summary: {
        totalCarousels: results.length,
        totalSlides: results.reduce((acc, r) => acc + r.slides.length, 0),
      },
      template: 'v2',
    })
  } catch (error: any) {
    console.error('Error generating slides V2:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate slides V2' },
      { status: 500 }
    )
  }
}

/**
 * Gera HTML para um slide individual usando o template V2 (1080x1350px)
 * com foto de perfil, badge verificado e imagem gerada por IA
 */
function generateSlideHTMLV2({
  titulo,
  corpo,
  contentImageUrl,
  profilePicUrl,
  username,
  fullName,
  slideNumber,
  totalSlides,
}: {
  titulo: string
  corpo: string
  contentImageUrl: string
  profilePicUrl: string
  username: string
  fullName: string
  slideNumber: number
  totalSlides: number
}): string {
  // Badge verificado Twitter/X (SVG inline, azul #1D9BF0, 52x52px)
  const verifiedBadgeSVG = `<svg width="32" height="32" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="26" cy="26" r="26" fill="#1D9BF0"/>
    <path d="M22.25 34.25L13.75 25.75L15.85 23.65L22.25 30.05L36.15 16.15L38.25 18.25L22.25 34.25Z" fill="white"/>
  </svg>`

  const contentImageSection = contentImageUrl
    ? `<img src="${contentImageUrl}" alt="imagem do slide" style="width: 956px; height: 448px; border-radius: 20px; object-fit: cover; display: block;" />`
    : `<div style="width: 956px; height: 448px; border-radius: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center;">
        <span style="color: white; font-size: 24px; opacity: 0.7;">✦</span>
      </div>`

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Slide ${slideNumber}/${totalSlides} — @${username}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Noto+Emoji&display=swap" rel="stylesheet">
  <style>
    @font-face {
      font-family: 'Noto Emoji';
      src: url('https://fonts.gstatic.com/s/notoemoji/v47/bMrnmSyK7YY-MEu6aWjPDs-ar6uWaGWuob-r0jwvS-FGJCMY.woff2') format('woff2');
    }
  </style>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { margin: 0; padding: 0; background: #ffffff; }

    .slide {
      width: 1080px;
      height: 1350px;
      background: #ffffff;
      font-family: 'Inter', 'Noto Emoji', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0f1419;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 62px;
    }

    /* Header: avatar + nome + badge */
    .header {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 24px;
      margin-bottom: 40px;
    }

    .avatar {
      width: 84px;
      height: 84px;
      border-radius: 50%;
      object-fit: cover;
      border: 2.5px solid #e1e4e8;
      flex-shrink: 0;
    }

    .avatar-placeholder {
      width: 84px;
      height: 84px;
      border-radius: 50%;
      background: #e1e4e8;
      flex-shrink: 0;
    }

    .user-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .name-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .name {
      font-size: 30px;
      font-weight: 700;
      color: #0f1419;
      line-height: 1.2;
    }

    .username {
      font-size: 24px;
      font-weight: 400;
      color: #536471;
      line-height: 1.2;
    }

    /* Textos do slide */
    .slide-titulo {
      width: 100%;
      font-size: 42px;
      font-weight: 700;
      color: #0f1419;
      line-height: 1.3;
      margin-bottom: 32px;
    }

    .slide-corpo {
      width: 100%;
      font-size: 42px;
      font-weight: 400;
      color: #0f1419;
      line-height: 1.5;
    }

    /* Parágrafos dentro do corpo */
    .slide-corpo p {
      margin-bottom: 32px;
    }

    .slide-corpo p:last-child {
      margin-bottom: 0;
    }

    /* Imagem: empurrada para baixo, abre espaço para o texto */
    .content-image {
      width: 956px;
      margin-top: auto;
      padding-top: 40px;
    }

    /* Rodapé com contador de slides */
    .footer {
      width: 100%;
      padding-top: 28px;
      border-top: 1.5px solid #eff3f4;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      font-size: 20px;
      color: #536471;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="slide">
    <!-- Header -->
    <div class="header">
      ${profilePicUrl
      ? `<img src="${profilePicUrl}" alt="${username}" class="avatar" />`
      : `<div class="avatar-placeholder"></div>`
    }
      <div class="user-info">
        <div class="name-row">
          <span class="name">${fullName || username}</span>
          ${verifiedBadgeSVG}
        </div>
        <span class="username">@${username}</span>
      </div>
    </div>

    <div class="slide-titulo">${titulo}</div>
    ${corpo ? `<div class="slide-corpo">${corpo.split('\n').map((p: string) => p.trim()).filter((p: string) => p.length > 0).map((p: string) => `<p>${p}</p>`).join('')}</div>` : ''}
    <div class="content-image">
      ${contentImageSection}
    </div>

    <!-- Rodapé -->
    <div class="footer">${slideNumber}/${totalSlides}</div>
  </div>
</body>
</html>`
}
