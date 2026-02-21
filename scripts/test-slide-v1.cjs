/**
 * Script de teste do template V1 de slides
 * Uso: node scripts/test-slide-v1.cjs
 */

const puppeteer = require('puppeteer')
const path = require('path')
const fs = require('fs')

// Dados fictícios para o teste
const testData = {
  text: `Como dobrar seu faturamento em 90 dias

✅ Defina seu nicho com clareza
✅ Crie uma oferta irresistível
✅ Otimize seu ticket médio
✅ Só então escale o tráfego`,
  profilePicUrl: 'https://res.cloudinary.com/dwkothqfw/image/upload/v1/profile-pics/default-avatar.jpg',
  fullName: 'Ana Paula Mendes',
  username: 'anapaulamendes',
  slideNumber: 2,
  totalSlides: 7,
}

function generateSlideHTML({ text, profilePicUrl, username, fullName, slideNumber, totalSlides }) {
  // Formatar parágrafos
  const paragraphs = text.split('\n').filter(p => p.trim())
  const formattedContent = paragraphs.map(p => `<p>${p}</p>`).join('\n        ')

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

async function main() {
  console.log('🚀 Gerando slide de teste V1...')

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1080, height: 1350 })

  const html = generateSlideHTML(testData)
  await page.setContent(html, { waitUntil: 'networkidle0' })

  const outputDir = path.join(process.cwd(), 'temp', 'test-slides')
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

  const outputPath = path.join(outputDir, `slide-v1-teste-${Date.now()}.png`)
  await page.screenshot({ path: outputPath, type: 'png' })

  await browser.close()

  console.log(`✅ Slide V1 gerado: ${outputPath}`)
  console.log(`   Abra o arquivo para visualizar o resultado.`)
}

main().catch(console.error)
