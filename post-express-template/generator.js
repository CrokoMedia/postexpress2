/**
 * Post Express - Gerador de Carrosséis
 * 
 * Este script:
 * 1. Recebe dados do cliente e conteúdo
 * 2. Renderiza o template HTML
 * 3. Tira screenshot com Puppeteer
 * 4. Faz upload pro Cloudinary
 * 5. Retorna URLs das imagens
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

// ============================================
// CONFIGURAÇÃO CLOUDINARY
// ============================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ============================================
// TEMPLATE HTML BASE
// ============================================
const generateHTML = (data) => {
  const { 
    nome, 
    username, 
    fotoUrl, 
    texto, 
    slideNum, 
    totalSlides,
    variacao = 'centered', // 'centered' ou 'with-image'
    imagemUrl = null,
    tema = 'light' // 'light', 'dark', 'highlight'
  } = data;

  const temaClass = tema === 'light' ? '' : tema;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      margin: 0;
      padding: 0;
    }

    .slide {
      width: 1080px;
      height: 1350px;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      padding: 80px;
      position: relative;
    }

    .slide.dark {
      background: #15202b;
    }

    .slide.highlight {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .header {
      display: flex;
      align-items: center;
      gap: 24px;
      margin-bottom: 60px;
    }

    .avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid #e1e1e1;
    }

    .user-info {
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
      font-size: 32px;
      font-weight: 700;
      color: #0f1419;
    }

    .slide.dark .name,
    .slide.highlight .name {
      color: #ffffff;
    }

    .verified {
      width: 28px;
      height: 28px;
      background: #1d9bf0;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .verified svg {
      width: 18px;
      height: 18px;
      fill: white;
    }

    .username {
      font-size: 26px;
      color: #536471;
      font-weight: 400;
    }

    .slide.dark .username {
      color: #8899a6;
    }

    .slide.highlight .username {
      color: rgba(255,255,255,0.8);
    }

    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .content.centered {
      justify-content: center;
      align-items: center;
      text-align: center;
    }

    .content.centered .text {
      font-size: 48px;
      line-height: 1.4;
      max-width: 900px;
    }

    .content.with-image .text {
      font-size: 38px;
      line-height: 1.5;
      margin-bottom: 50px;
    }

    .text {
      font-size: 42px;
      font-weight: 500;
      color: #0f1419;
      line-height: 1.4;
    }

    .slide.dark .text,
    .slide.highlight .text {
      color: #ffffff;
    }

    .post-image {
      width: 100%;
      max-height: 600px;
      object-fit: cover;
      border-radius: 24px;
      margin-top: auto;
    }

    .slide-number {
      position: absolute;
      bottom: 40px;
      right: 50px;
      font-size: 24px;
      color: #a1a1a1;
      font-weight: 500;
    }

    .slide.dark .slide-number,
    .slide.highlight .slide-number {
      color: rgba(255,255,255,0.6);
    }
  </style>
</head>
<body>
  <div class="slide ${temaClass}" id="slide">
    <div class="header">
      <img src="${fotoUrl}" alt="Avatar" class="avatar">
      <div class="user-info">
        <div class="name-row">
          <span class="name">${nome}</span>
          <div class="verified">
            <svg viewBox="0 0 24 24">
              <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"/>
            </svg>
          </div>
        </div>
        <span class="username">@${username}</span>
      </div>
    </div>
    
    <div class="content ${variacao}">
      <p class="text">${texto}</p>
      ${imagemUrl ? `<img src="${imagemUrl}" class="post-image" alt="Post image">` : ''}
    </div>

    <span class="slide-number">${slideNum}/${totalSlides}</span>
  </div>
</body>
</html>
  `;
};

// ============================================
// GERADOR DE IMAGEM (PUPPETEER)
// ============================================
async function generateSlideImage(slideData, outputPath) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Tamanho do slide Instagram
  await page.setViewport({
    width: 1080,
    height: 1350,
    deviceScaleFactor: 1
  });

  // Carrega o HTML
  const html = generateHTML(slideData);
  await page.setContent(html, { waitUntil: 'networkidle0' });

  // Aguarda fontes carregarem
  await page.evaluateHandle('document.fonts.ready');

  // Tira screenshot
  await page.screenshot({
    path: outputPath,
    type: 'png',
    clip: {
      x: 0,
      y: 0,
      width: 1080,
      height: 1350
    }
  });

  await browser.close();
  
  return outputPath;
}

// ============================================
// UPLOAD PRO CLOUDINARY
// ============================================
async function uploadToCloudinary(imagePath, clienteId, slideNum) {
  const result = await cloudinary.uploader.upload(imagePath, {
    folder: `post-express/${clienteId}`,
    public_id: `slide_${slideNum}_${Date.now()}`,
    resource_type: 'image'
  });

  return result.secure_url;
}

// ============================================
// GERADOR DE CARROSSEL COMPLETO
// ============================================
async function generateCarousel(clienteData, slides) {
  const { id: clienteId, nome, username, fotoUrl } = clienteData;
  const totalSlides = slides.length;
  const results = [];

  console.log(`🎨 Gerando carrossel para ${nome} (@${username})`);
  console.log(`📊 Total de slides: ${totalSlides}`);

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const slideNum = i + 1;

    console.log(`  → Gerando slide ${slideNum}/${totalSlides}...`);

    const slideData = {
      nome,
      username,
      fotoUrl,
      texto: slide.texto,
      slideNum,
      totalSlides,
      variacao: slide.variacao || 'centered',
      imagemUrl: slide.imagemUrl || null,
      tema: slide.tema || 'light'
    };

    // Gera imagem local
    const tempPath = `/tmp/slide_${clienteId}_${slideNum}.png`;
    await generateSlideImage(slideData, tempPath);

    // Upload pro Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(tempPath, clienteId, slideNum);

    // Limpa arquivo temporário
    fs.unlinkSync(tempPath);

    results.push({
      slideNum,
      url: cloudinaryUrl,
      texto: slide.texto
    });

    console.log(`  ✅ Slide ${slideNum} gerado: ${cloudinaryUrl}`);
  }

  console.log(`\n🎉 Carrossel completo! ${results.length} slides gerados.`);

  return results;
}

// ============================================
// EXEMPLO DE USO
// ============================================
async function exemplo() {
  // Dados do cliente (viriam do Supabase)
  const cliente = {
    id: 'cliente_123',
    nome: 'João Silva',
    username: 'joaosilva',
    fotoUrl: 'https://i.pravatar.cc/200?img=12'
  };

  // Slides do carrossel (viriam do Squad Criação)
  const slides = [
    {
      texto: '9 em cada 10 empreendedores cometem esse erro fatal no Instagram',
      variacao: 'centered',
      tema: 'light'
    },
    {
      texto: 'Eles focam em QUANTIDADE de posts ao invés de QUALIDADE',
      variacao: 'centered',
      tema: 'light'
    },
    {
      texto: 'O algoritmo premia conteúdo que RETÉM a atenção, não que enche o feed',
      variacao: 'centered',
      tema: 'light'
    },
    {
      texto: 'Poste MENOS, mas poste MELHOR. Seu engajamento vai agradecer.',
      variacao: 'centered',
      tema: 'highlight'
    },
    {
      texto: '💡 Salve esse post e compartilhe com um amigo que precisa ouvir isso!',
      variacao: 'centered',
      tema: 'light'
    }
  ];

  // Gera o carrossel
  const resultado = await generateCarousel(cliente, slides);
  
  console.log('\n📦 Resultado final:');
  console.log(JSON.stringify(resultado, null, 2));
}

// Exporta funções
module.exports = {
  generateHTML,
  generateSlideImage,
  uploadToCloudinary,
  generateCarousel
};

// Se executado diretamente, roda exemplo
if (require.main === module) {
  exemplo().catch(console.error);
}
