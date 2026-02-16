/**
 * Post Express - Teste Template 1080x1350
 *
 * Versão otimizada com espaçamentos ajustados
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// ============================================
// LER TEMPLATE HTML
// ============================================
const templatePath = path.join(__dirname, 'template-a-text-1080x1350.html');
const templateHTML = fs.readFileSync(templatePath, 'utf-8');

// ============================================
// FUNÇÃO PARA SUBSTITUIR PLACEHOLDERS
// ============================================
function renderTemplate(data) {
  const { nome, username, fotoUrl, texto } = data;

  let html = templateHTML;

  html = html.replace(/\{\{NOME\}\}/g, nome);
  html = html.replace(/\{\{USERNAME\}\}/g, username);
  html = html.replace(/\{\{FOTO_URL\}\}/g, fotoUrl);
  html = html.replace(/\{\{TEXTO\}\}/g, texto);

  return html;
}

// ============================================
// DADOS DE TESTE
// ============================================
const cliente = {
  nome: 'Frank Costa',
  username: 'frankcosta',
  fotoUrl: 'https://i.pravatar.cc/200?img=33'
};

const slidesTeste = [
  {
    nome: 'Hook - Framework',
    texto: `<strong>Passei 3 anos testando headlines no Instagram.</strong>

Descobri uma fórmula que funciona em 8 de 10:

O "Framework de 1 Sentença"

[Resultado específico] + [Mecanismo único] + [Prova quantificável]

Tudo em 1 frase irresistível.

(Salva esse post →)`
  },
  {
    nome: 'Problema',
    texto: `<strong>O PROBLEMA:</strong>

90% dos criadores escrevem headlines assim:

"5 dicas para crescer no Instagram"

❌ Genérico
❌ Sem diferenciação
❌ Scroll automático

O resultado? Zero engajamento.`
  },
  {
    nome: 'Solução',
    texto: `<strong>A SOLUÇÃO:</strong>

Use o Framework de 1 Sentença:

"Como ganhar 10k seguidores com conteúdo de 1 min/dia (testado em 50 perfis)"

✅ Resultado claro (10k)
✅ Mecanismo único (1 min/dia)
✅ Prova social (50 perfis)

Viu a diferença?`
  },
  {
    nome: 'CTA',
    texto: `<strong>QUER 12 FRAMEWORKS ASSIM?</strong>

Manda DM "FRAMEWORKS"

Você recebe:

✓ 12 fórmulas testadas
✓ Templates editáveis
✓ 50 exemplos reais
✓ Checklist de validação

Só 50 vagas abertas hoje.

Corre! ⚡`
  }
];

// ============================================
// GERADOR
// ============================================
async function generateTest() {
  const outputDir = path.join(__dirname, 'output-1080x1350');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  console.log('🚀 Testando Template 1080x1350\n');
  console.log('✨ Características:');
  console.log('   - Espaçamento header: 40px');
  console.log('   - Line-height texto: 1.45');
  console.log('   - Espaçamento parágrafos: 28px');
  console.log('   - Dimensões fixas: 1080x1350px\n');

  try {
    const browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width: 1080, height: 1350 },
      deviceScaleFactor: 1 // EXATAMENTE 1080x1350
    });
    const page = await context.newPage();

    for (let i = 0; i < slidesTeste.length; i++) {
      const slide = slidesTeste[i];
      const slideNum = i + 1;

      console.log(`  📸 Gerando slide ${slideNum}/${slidesTeste.length} (${slide.nome})...`);

      const html = renderTemplate({
        ...cliente,
        texto: slide.texto
      });

      await page.setContent(html);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      const outputPath = path.join(outputDir, `slide_${slideNum}.png`);

      const slideElement = await page.$('.slide');
      await slideElement.screenshot({
        path: outputPath,
        type: 'png'
      });

      console.log(`  ✅ Salvo: ${outputPath}`);
    }

    await browser.close();

    console.log(`\n🎉 Teste concluído! ${slidesTeste.length} slides gerados`);
    console.log(`📁 Pasta: ${outputDir}`);

    // Listar tamanhos
    console.log('\n📊 Tamanhos:');
    for (let i = 1; i <= slidesTeste.length; i++) {
      const filePath = path.join(outputDir, `slide_${i}.png`);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`   slide_${i}.png: ${sizeKB} KB`);
    }

    console.log('\n💡 Próximo passo: Upload no Cloudinary para comparação\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  }
}

// Executa
generateTest().catch(console.error);
