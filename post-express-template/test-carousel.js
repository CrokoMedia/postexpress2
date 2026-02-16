/**
 * Post Express - Teste com Carrossel Real
 *
 * Gera imagens do Carrossel #7 "Framework de 1 Sentença"
 * Baseado na auditoria do @frankcosta
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// ============================================
// TEMPLATE HTML
// ============================================
const generateHTML = (data) => {
  const {
    nome,
    username,
    fotoUrl,
    texto,
    slideNum,
    totalSlides,
    tema = 'light'
  } = data;

  const temaClass = tema === 'light' ? '' : tema;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; }

    .slide {
      width: 1080px;
      height: 1350px;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      padding: 80px;
      position: relative;
    }

    .slide.dark { background: #15202b; }
    .slide.highlight {
      background: linear-gradient(135deg, #FFD700 0%, #000000 100%);
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

    .user-info { display: flex; flex-direction: column; gap: 4px; }
    .name-row { display: flex; align-items: center; gap: 8px; }
    .name { font-size: 32px; font-weight: 700; color: #0f1419; }
    .slide.dark .name, .slide.highlight .name { color: #ffffff; }

    .verified {
      width: 28px;
      height: 28px;
      background: #1d9bf0;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .verified svg { width: 18px; height: 18px; fill: white; }

    .username { font-size: 26px; color: #536471; }
    .slide.dark .username { color: #8899a6; }
    .slide.highlight .username { color: rgba(255,255,255,0.8); }

    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
    }

    .text {
      font-size: 48px;
      font-weight: 600;
      color: #0f1419;
      line-height: 1.4;
      max-width: 900px;
      white-space: pre-wrap;
    }
    .slide.dark .text, .slide.highlight .text { color: #ffffff; }

    .slide-number {
      position: absolute;
      bottom: 40px;
      right: 50px;
      font-size: 24px;
      color: #a1a1a1;
    }
    .slide.dark .slide-number, .slide.highlight .slide-number {
      color: rgba(255,255,255,0.6);
    }
  </style>
</head>
<body>
  <div class="slide ${temaClass}">
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

    <div class="content">
      <p class="text">${texto}</p>
    </div>

    <span class="slide-number">${slideNum}/${totalSlides}</span>
  </div>
</body>
</html>
  `;
};

// ============================================
// SLIDES DO CARROSSEL #7
// ============================================
const cliente = {
  nome: 'Frank Costa',
  username: 'frankcosta',
  fotoUrl: 'https://i.pravatar.cc/200?img=33'
};

const slides = [
  // Slide 1 - Hook
  {
    texto: `Passei 3 anos testando
headlines no Instagram.

Descobri uma fórmula
que funciona em 8 de 10:

O "Framework de 1 Sentença"

(Salva esse post →)`,
    tema: 'dark'
  },
  // Slide 2 - O Problema
  {
    texto: `O PROBLEMA:

90% dos criadores
escrevem headlines assim:

"5 dicas para crescer
no Instagram"

Genérico.
Sem diferenciação.
Scroll automático.`,
    tema: 'light'
  },
  // Slide 3 - A Solução
  {
    texto: `A SOLUÇÃO:

Framework de 1 Sentença

[Resultado específico]
+
[Mecanismo único]
+
[Prova quantificável]

Tudo em 1 frase.`,
    tema: 'light'
  },
  // Slide 4 - Exemplo Antes/Depois
  {
    texto: `EXEMPLO:

❌ ANTES:
"Como crescer no Instagram"

✅ DEPOIS:
"Como ganhar 10k seguidores
com conteúdo de 1 min/dia
(testado em 50 perfis)"

Viu a diferença?`,
    tema: 'light'
  },
  // Slide 5 - Template
  {
    texto: `TEMPLATE EDITÁVEL:

"Como [RESULTADO]
usando [MECANISMO]
([PROVA SOCIAL])"

Exemplo:
"Como faturar R$ 50k/mês
vendendo infoprodutos
(147 alunos já replicaram)"`,
    tema: 'highlight'
  },
  // Slide 6 - Por Que Funciona
  {
    texto: `POR QUE FUNCIONA?

✓ Resultado específico
  (desperta desejo)

✓ Mecanismo único
  (diferenciação)

✓ Prova quantificável
  (credibilidade)

= Irresistível`,
    tema: 'light'
  },
  // Slide 7 - Aplicação
  {
    texto: `USE AGORA:

1. Escolha seu próximo post
2. Aplique o framework
3. Poste e marca @frankcosta
4. Vou comentar e dar RT

Quero ver você testando!`,
    tema: 'light'
  },
  // Slide 8 - CTA
  {
    texto: `QUER 12 FRAMEWORKS
ASSIM?

DM "FRAMEWORKS"

Vou te enviar PDF com:
✓ 12 fórmulas testadas
✓ Templates editáveis
✓ 50 exemplos reais

(50 vagas hoje)`,
    tema: 'dark'
  }
];

// ============================================
// GERADOR
// ============================================
async function generateCarousel() {
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  console.log('🚀 Gerando Carrossel #7 "Framework de 1 Sentença"\n');

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const slideNum = i + 1;

      console.log(`  📸 Gerando slide ${slideNum}/${slides.length}...`);

      const html = generateHTML({
        ...cliente,
        texto: slide.texto,
        slideNum,
        totalSlides: slides.length,
        tema: slide.tema
      });

      await page.setContent(html, { waitUntil: 'networkidle0' });
      await page.evaluateHandle('document.fonts.ready');

      const outputPath = path.join(outputDir, `carrossel_07_slide_${slideNum}.png`);
      await page.screenshot({
        path: outputPath,
        type: 'png',
        clip: { x: 0, y: 0, width: 1080, height: 1350 }
      });

      console.log(`  ✅ Salvo: ${outputPath}`);
    }

    await browser.close();

    console.log(`\n🎉 Carrossel completo! ${slides.length} slides em: ${outputDir}`);
    console.log('\n📊 Próximos passos:');
    console.log('  1. Revisar as imagens geradas');
    console.log('  2. Testar upload no Cloudinary (generator.js)');
    console.log('  3. Postar no Instagram do @frankcosta\n');

  } catch (error) {
    console.error('❌ Erro ao gerar carrossel:', error.message);
    throw error;
  }
}

// Executa
generateCarousel().catch(console.error);
