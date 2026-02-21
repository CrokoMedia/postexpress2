/**
 * Script de teste do template V2 de slides
 * Uso: node scripts/test-slide-v2.js
 */

const puppeteer = require('puppeteer')
const path = require('path')
const fs = require('fs')

// Dados fictícios para o teste
const testData = {
  titulo: 'Como dobrar seu faturamento em 90 dias',
  corpo: '✅ Defina seu nicho com clareza\n✅ Crie uma oferta irresistível\n✅ Otimize seu ticket médio\n✅ Só então escale o tráfego',
  profilePicUrl: 'https://res.cloudinary.com/dwkothqfw/image/upload/v1/profile-pics/default-avatar.jpg',
  fullName: 'Ana Paula Mendes',
  username: 'anapaulamendes',
  slideNumber: 2,
  totalSlides: 7,
  // Imagem de teste (foto pública do Unsplash)
  contentImageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=956&h=448&fit=crop',
}

function generateSlideHTMLV2({ titulo, corpo, contentImageUrl, profilePicUrl, username, fullName, slideNumber, totalSlides }) {
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
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { margin: 0; padding: 0; background: #ffffff; }

    .slide {
      width: 1080px;
      height: 1350px;
      background: #ffffff;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0f1419;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 62px;
    }

    .header {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 20px;
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

    .slide-corpo p {
      margin-bottom: 32px;
    }

    .slide-corpo p:last-child {
      margin-bottom: 0;
    }

    .content-image {
      width: 956px;
      margin-top: auto;
      padding-top: 40px;
    }

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
    <div class="header">
      ${profilePicUrl
        ? `<img src="${profilePicUrl}" alt="${username}" class="avatar" onerror="this.style.display='none'" />`
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
    ${corpo ? `<div class="slide-corpo">${corpo.split('\n').map(p => p.trim()).filter(p => p.length > 0).map(p => `<p>${p}</p>`).join('')}</div>` : ''}
    <div class="content-image">
      ${contentImageSection}
    </div>

    <div class="footer">${slideNumber}/${totalSlides}</div>
  </div>
</body>
</html>`
}

async function main() {
  console.log('🚀 Gerando slide de teste V2...')

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1080, height: 1350 })

  const html = generateSlideHTMLV2(testData)
  await page.setContent(html, { waitUntil: 'networkidle0' })

  const outputDir = path.join(process.cwd(), 'temp', 'test-slides')
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

  const outputPath = path.join(outputDir, `slide-v2-teste-${Date.now()}.png`)
  await page.screenshot({ path: outputPath, type: 'png' })

  await browser.close()

  console.log(`✅ Slide gerado: ${outputPath}`)
  console.log(`   Abra o arquivo para visualizar o resultado.`)
}

main().catch(console.error)
