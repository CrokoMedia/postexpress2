/**
 * Croko Labs - Teste Templates de PRODUÇÃO
 *
 * Template A: Só texto (33px)
 * Template B: Texto + Imagem (31px)
 *
 * INSTAGRAM SAFE AREA:
 * - Padding: 150px 120px 200px 120px
 * - Área útil: 840x1000px
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Templates de produção
const templateAPath = '/Users/macbook-karla/postexpress2/template-a-producao.html';
const templateBPath = '/Users/macbook-karla/postexpress2/template-b-producao.html';

const templateA = fs.readFileSync(templateAPath, 'utf-8');
const templateB = fs.readFileSync(templateBPath, 'utf-8');

function renderTemplate(template, data) {
  const { nome, username, fotoUrl, texto, imagemUrl } = data;
  let html = template;
  html = html.replace(/\{\{NOME\}\}/g, nome);
  html = html.replace(/\{\{USERNAME\}\}/g, username);
  html = html.replace(/\{\{FOTO_URL\}\}/g, fotoUrl);
  html = html.replace(/\{\{TEXTO\}\}/g, texto);
  if (imagemUrl) {
    html = html.replace(/\{\{IMAGEM_URL\}\}/g, imagemUrl);
  }
  return html;
}

const cliente = {
  nome: 'Frank Costa',
  username: 'frankcosta',
  fotoUrl: 'https://i.pravatar.cc/200?img=33'
};

const slidesTeste = [
  {
    nome: 'Template A - Só Texto',
    template: templateA,
    texto: `<strong>Passei 3 anos testando headlines no Instagram.</strong>

Descobri uma fórmula que funciona em 8 de 10:

O "Framework de 1 Sentença"

[Resultado específico] + [Mecanismo único] + [Prova quantificável]

Tudo em 1 frase irresistível.

(Salva esse post →)`,
    imagemUrl: null
  },
  {
    nome: 'Template B - Com Imagem',
    template: templateB,
    texto: `<strong>QUER 12 FRAMEWORKS DE COPYWRITING?</strong>

Manda DM "FRAMEWORKS"

Você recebe gratuitamente:

✓ 12 fórmulas testadas
✓ Templates editáveis
✓ 50 exemplos reais

(50 vagas hoje)`,
    imagemUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=840&h=460&fit=crop'
  }
];

async function generateProducao() {
  const outputDir = path.join(__dirname, 'output-producao');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  console.log('🚀 Testando Templates de PRODUÇÃO\n');
  console.log('✨ Instagram Safe Area:');
  console.log('   - Padding: 150px top, 120px laterais, 200px bottom');
  console.log('   - Área útil: 840×1000px');
  console.log('   - Avatar: 72px (otimizado)');
  console.log('   - Dimensões: 1080×1350px EXATOS\n');

  try {
    const browser = await chromium.launch({
      args: ['--font-render-hinting=none'] // Melhor renderização de fontes
    });
    const context = await browser.newContext({
      viewport: { width: 1080, height: 1350 },
      deviceScaleFactor: 1 // EXATAMENTE 1080x1350
    });
    const page = await context.newPage();

    for (let i = 0; i < slidesTeste.length; i++) {
      const slide = slidesTeste[i];
      const slideNum = i + 1;
      const tipo = slide.imagemUrl ? 'B' : 'A';

      console.log(`  📸 Gerando slide ${slideNum} - ${slide.nome}...`);

      const html = renderTemplate(slide.template, {
        ...cliente,
        texto: slide.texto,
        imagemUrl: slide.imagemUrl
      });

      await page.setContent(html);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);

      const outputPath = path.join(outputDir, `template_${tipo}_slide.png`);

      const slideElement = await page.$('.slide');
      await slideElement.screenshot({
        path: outputPath,
        type: 'png',
        omitBackground: false
      });

      console.log(`  ✅ Salvo: ${outputPath}`);
    }

    await browser.close();

    console.log(`\n🎉 Templates de produção gerados!`);
    console.log(`📁 Pasta: ${outputDir}\n`);

    // Listar tamanhos
    console.log('📊 Tamanhos:');
    const files = fs.readdirSync(outputDir);
    files.forEach(file => {
      const filePath = path.join(outputDir, file);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`   ${file}: ${sizeKB} KB`);
    });

    console.log('\n💡 Diferenças:');
    console.log('   Template A: Texto 33px (só texto)');
    console.log('   Template B: Texto 31px + imagem (460px max)\n');

    console.log('🎯 Próximo passo: Upload no Cloudinary\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  }
}

generateProducao().catch(console.error);
