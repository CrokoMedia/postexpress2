/**
 * Post Express - Teste com Template Corrigido
 *
 * Usa o Post_Express_Template_Corrigido.html
 * Fonte Chirp + Texto alinhado à esquerda
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// ============================================
// LER TEMPLATE HTML
// ============================================
const templatePath = path.join(__dirname, 'Post_Express_Template_Corrigido.html');
const templateHTML = fs.readFileSync(templatePath, 'utf-8');

// ============================================
// FUNÇÃO PARA SUBSTITUIR PLACEHOLDERS
// ============================================
function renderTemplate(data) {
  const {
    nome,
    username,
    fotoUrl,
    texto,
    tema = '' // '', 'dark', 'highlight'
  } = data;

  let html = templateHTML;

  // Substituir placeholders
  html = html.replace(/\{\{NOME\}\}/g, nome);
  html = html.replace(/\{\{USERNAME\}\}/g, username);
  html = html.replace(/\{\{FOTO_URL\}\}/g, fotoUrl);
  html = html.replace(/\{\{TEXTO\}\}/g, texto);

  // Adicionar classe de tema se necessário
  if (tema) {
    html = html.replace('class="slide"', `class="slide ${tema}"`);
  }

  return html;
}

// ============================================
// SLIDES DO CARROSSEL #7
// ============================================
const cliente = {
  nome: 'Frank Costa',
  username: 'frankcosta',
  fotoUrl: 'https://i.pravatar.cc/200?img=33'
};

const slides = [
  {
    texto: `Passei 3 anos testando headlines no Instagram.

Descobri uma fórmula que funciona em 8 de 10:

O "Framework de 1 Sentença"

(Salva esse post →)`,
    tema: 'dark'
  },
  {
    texto: `<strong>O PROBLEMA:</strong>

90% dos criadores escrevem headlines assim:

"5 dicas para crescer no Instagram"

Genérico.
Sem diferenciação.
Scroll automático.`,
    tema: ''
  },
  {
    texto: `<strong>A SOLUÇÃO:</strong>

Framework de 1 Sentença

[Resultado específico]
+
[Mecanismo único]
+
[Prova quantificável]

Tudo em 1 frase.`,
    tema: ''
  },
  {
    texto: `<strong>EXEMPLO:</strong>

❌ ANTES:
"Como crescer no Instagram"

✅ DEPOIS:
"Como ganhar 10k seguidores com conteúdo de 1 min/dia (testado em 50 perfis)"

Viu a diferença?`,
    tema: ''
  },
  {
    texto: `<strong>TEMPLATE EDITÁVEL:</strong>

"Como [RESULTADO] usando [MECANISMO] ([PROVA SOCIAL])"

<strong>Exemplo:</strong>
"Como faturar R$ 50k/mês vendendo infoprodutos (147 alunos já replicaram)"`,
    tema: 'highlight'
  },
  {
    texto: `<strong>POR QUE FUNCIONA?</strong>

✓ Resultado específico (desperta desejo)

✓ Mecanismo único (diferenciação)

✓ Prova quantificável (credibilidade)

= Irresistível`,
    tema: ''
  },
  {
    texto: `<strong>USE AGORA:</strong>

1. Escolha seu próximo post
2. Aplique o framework
3. Poste e marca @frankcosta
4. Vou comentar e dar RT

Quero ver você testando!`,
    tema: ''
  },
  {
    texto: `<strong>QUER 12 FRAMEWORKS ASSIM?</strong>

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
// GERADOR COM PLAYWRIGHT
// ============================================
async function generateCarousel() {
  const outputDir = path.join(__dirname, 'output-corrigido');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  console.log('🚀 Gerando Carrossel #7 com TEMPLATE CORRIGIDO\n');
  console.log('✨ Mudanças:');
  console.log('   - Fonte Chirp (Twitter real)');
  console.log('   - Texto alinhado à esquerda');
  console.log('   - Sem numeração de slides\n');

  try {
    const browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width: 1080, height: 1350 },
      deviceScaleFactor: 2
    });
    const page = await context.newPage();

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const slideNum = i + 1;

      console.log(`  📸 Gerando slide ${slideNum}/${slides.length}...`);

      const html = renderTemplate({
        ...cliente,
        texto: slide.texto,
        tema: slide.tema
      });

      await page.setContent(html);
      await page.waitForLoadState('networkidle');

      // Aguardar fontes carregarem
      await page.waitForTimeout(1000);

      const outputPath = path.join(outputDir, `slide_${slideNum}.png`);

      // Capturar apenas o slide (não a página inteira)
      const slideElement = await page.$('#slide-text-only');
      await slideElement.screenshot({
        path: outputPath,
        type: 'png'
      });

      console.log(`  ✅ Salvo: ${outputPath}`);
    }

    await browser.close();

    console.log(`\n🎉 Carrossel completo! ${slides.length} slides em: ${outputDir}`);
    console.log('\n📊 Comparação:');
    console.log('   output/          - Versão original (Inter, centralizado)');
    console.log('   output-corrigido/ - Versão corrigida (Chirp, esquerda)');
    console.log('\n💡 Próximo passo: Comparar visualmente os dois outputs\n');

  } catch (error) {
    console.error('❌ Erro ao gerar carrossel:', error.message);
    throw error;
  }
}

// Executa
generateCarousel().catch(console.error);
