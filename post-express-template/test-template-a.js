/**
 * Croko Labs - Teste Template A (Só Texto)
 *
 * Template mais simples e limpo
 * Header compacto (32px) + Texto à esquerda
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// ============================================
// LER TEMPLATE HTML
// ============================================
const templatePath = path.join(__dirname, 'template-a-text.html');
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
// SLIDE DE TESTE
// ============================================
const cliente = {
  nome: 'Frank Costa',
  username: 'frankcosta',
  fotoUrl: 'https://i.pravatar.cc/200?img=33'
};

const slidesTeste = [
  {
    texto: `<strong>Framework de 1 Sentença</strong>

Passei 3 anos testando headlines no Instagram.

Descobri uma fórmula que funciona em 8 de 10 posts:

[Resultado específico] + [Mecanismo único] + [Prova quantificável]

Exemplo:
"Como ganhar 10k seguidores com conteúdo de 1 min/dia (testado em 50 perfis)"

Viu como fica mais atraente? 🎯`
  },
  {
    texto: `<strong>POR QUE 90% DOS CRIADORES FALHAM:</strong>

Eles focam em QUANTIDADE de posts ao invés de QUALIDADE.

O algoritmo premia conteúdo que RETÉM a atenção, não que enche o feed.

A solução?

Poste MENOS, mas poste MELHOR.

3 posts excelentes > 10 posts medianos

Seu engajamento vai agradecer. 📈`
  },
  {
    texto: `<strong>QUER 12 FRAMEWORKS DE COPYWRITING?</strong>

Manda DM com a palavra "FRAMEWORKS"

Vou te enviar PDF completo com:

✓ 12 fórmulas testadas e aprovadas
✓ Templates editáveis prontos pra usar
✓ 50 exemplos reais de alta conversão
✓ Checklist de validação

Só tenho 50 vagas abertas hoje.

Corre que ainda dá tempo! ⚡`
  }
];

// ============================================
// GERADOR COM PLAYWRIGHT
// ============================================
async function generateTestSlides() {
  const outputDir = path.join(__dirname, 'output-template-a');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  console.log('🚀 Testando Template A - Só Texto\n');
  console.log('✨ Características:');
  console.log('   - Fonte Chirp');
  console.log('   - Espaçamento compacto (32px)');
  console.log('   - Layout limpo e profissional');
  console.log('   - Sempre fundo branco\n');

  try {
    const browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width: 1080, height: 1350 },
      deviceScaleFactor: 2
    });
    const page = await context.newPage();

    for (let i = 0; i < slidesTeste.length; i++) {
      const slide = slidesTeste[i];
      const slideNum = i + 1;

      console.log(`  📸 Gerando slide ${slideNum}/${slidesTeste.length}...`);

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
    console.log('\n📊 Próximo passo:');
    console.log('   - Comparar com template anterior');
    console.log('   - Escolher qual usar em produção\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  }
}

// Executa
generateTestSlides().catch(console.error);
