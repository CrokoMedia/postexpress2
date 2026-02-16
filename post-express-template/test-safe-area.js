/**
 * Teste Template Instagram Safe Area
 *
 * Especificações EXATAS:
 * - Dimensões: 1080×1350px
 * - Padding: 150px (topo), 120px (lados), 200px (baixo)
 * - Área útil: 840×1000px
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, 'template-safe-area.html');
const templateHTML = fs.readFileSync(templatePath, 'utf-8');

function renderTemplate(data) {
  const { nome, username, fotoUrl, texto } = data;
  let html = templateHTML;
  html = html.replace(/\{\{NOME\}\}/g, nome);
  html = html.replace(/\{\{USERNAME\}\}/g, username);
  html = html.replace(/\{\{FOTO_URL\}\}/g, fotoUrl);
  html = html.replace(/\{\{TEXTO\}\}/g, texto);
  return html;
}

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
    nome: 'CTA',
    texto: `<strong>QUER 12 FRAMEWORKS DE COPYWRITING?</strong>

Manda DM "FRAMEWORKS"

Você recebe gratuitamente:

✓ 12 fórmulas testadas e aprovadas
✓ Templates editáveis prontos pra usar
✓ 50 exemplos reais de alta conversão
✓ Checklist de validação completo

Só 50 vagas abertas hoje.

Corre! ⚡`
  }
];

async function generateSafeArea() {
  const outputDir = path.join(__dirname, 'output-safe-area');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  console.log('🚀 Testando Template Instagram Safe Area\n');
  console.log('📐 Especificações EXATAS:');
  console.log('   Dimensões:        1080×1350px');
  console.log('   Padding superior: 150px');
  console.log('   Padding lateral:  120px (cada lado)');
  console.log('   Padding inferior: 200px');
  console.log('   Área útil:        840×1000px\n');
  console.log('💡 Por quê esse padding?');
  console.log('   • Instagram corta no preview do feed');
  console.log('   • Compressão afeta as bordas');
  console.log('   • Parte inferior sofre MAIS corte (UI)\n');

  try {
    const browser = await chromium.launch({
      args: ['--font-render-hinting=none']
    });
    const context = await browser.newContext({
      viewport: { width: 1080, height: 1350 },
      deviceScaleFactor: 1 // EXATAMENTE 1080×1350
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
      await page.waitForTimeout(1500);

      const outputPath = path.join(outputDir, `slide_${slideNum}.png`);

      const slideElement = await page.$('.slide');
      await slideElement.screenshot({
        path: outputPath,
        type: 'png',
        omitBackground: false
      });

      console.log(`  ✅ Salvo: ${outputPath}`);
    }

    await browser.close();

    console.log(`\n🎉 Slides gerados com Safe Area!\n`);
    console.log('📊 Tamanhos:');
    const files = fs.readdirSync(outputDir);
    files.forEach(file => {
      const filePath = path.join(outputDir, file);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`   ${file}: ${sizeKB} KB`);
    });

    console.log('\n✅ Verificação de dimensões:');
    const execSync = require('child_process').execSync;
    files.forEach(file => {
      const filePath = path.join(outputDir, file);
      const result = execSync(`sips -g pixelWidth -g pixelHeight "${filePath}"`).toString();
      const width = result.match(/pixelWidth: (\d+)/)?.[1];
      const height = result.match(/pixelHeight: (\d+)/)?.[1];
      console.log(`   ${file}: ${width}×${height}px`);
    });

    console.log('\n💡 Próximo passo: Upload no Cloudinary para testar\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  }
}

generateSafeArea().catch(console.error);
