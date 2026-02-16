/**
 * Post Express - Teste Template Agora Vai
 *
 * Template otimizado com elementos menores
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Template na raiz do projeto
const templatePath = '/Users/macbook-karla/postexpress2/templateagoravai.html';
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
    nome: 'Hook',
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

O resultado? Zero engajamento.

Seus posts viram invisíveis no feed.`
  },
  {
    nome: 'Solução',
    texto: `<strong>A SOLUÇÃO:</strong>

Use o Framework de 1 Sentença:

"Como ganhar 10k seguidores com conteúdo de 1 min/dia (testado em 50 perfis)"

✅ Resultado claro (10k seguidores)
✅ Mecanismo único (1 min/dia)
✅ Prova social (50 perfis testados)

Viu como fica mais atraente?`
  },
  {
    nome: 'CTA',
    texto: `<strong>QUER 12 FRAMEWORKS ASSIM?</strong>

Manda DM "FRAMEWORKS"

Você recebe gratuitamente:

✓ 12 fórmulas testadas e aprovadas
✓ Templates editáveis prontos pra usar
✓ 50 exemplos reais de alta conversão
✓ Checklist de validação completo

Só 50 vagas abertas hoje. Corre! ⚡`
  }
];

async function generateTest() {
  const outputDir = path.join(__dirname, 'output-agoravai');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  console.log('🚀 Testando Template "Agora Vai"\n');
  console.log('✨ Características:');
  console.log('   - Elementos menores (avatar 80px, texto 36px)');
  console.log('   - Padding otimizado: 100px 110px');
  console.log('   - Line-height: 1.5 (leitura confortável)');
  console.log('   - Dimensões: 1080x1350px EXATOS\n');

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
    console.log(`📁 Pasta: ${outputDir}\n`);

    // Listar tamanhos e confirmar dimensões
    console.log('📊 Tamanhos:');
    for (let i = 1; i <= slidesTeste.length; i++) {
      const filePath = path.join(outputDir, `slide_${i}.png`);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`   slide_${i}.png: ${sizeKB} KB`);
    }

    console.log('\n💡 Próximo passo: Upload no Cloudinary\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  }
}

generateTest().catch(console.error);
