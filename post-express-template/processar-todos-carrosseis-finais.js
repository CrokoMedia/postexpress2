/**
 * Processar TODOS os 9 Carrosséis Finais
 * Gera imagens e faz upload no Cloudinary
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function processarTodos() {
  console.log('🚀 PROCESSANDO TODOS OS 9 CARROSSÉIS\n');
  console.log('📐 Especificações:');
  console.log('   • Fonte: 44px (estilo Twitter/X)');
  console.log('   • Sem emojis');
  console.log('   • Texto fluido (1 frase = 1 parágrafo)');
  console.log('   • Dimensões: 1080×1350px exato');
  console.log('   • Instagram Safe Area\n');
  console.log('═══════════════════════════════════════\n');

  const totalCarrosseis = 9;
  let sucessos = 0;
  let erros = 0;

  for (let i = 1; i <= totalCarrosseis; i++) {
    console.log(`\n📦 CARROSSEL #${i} (${i}/${totalCarrosseis})\n`);

    try {
      // Gerar imagens
      console.log(`🎨 Gerando imagens...`);
      await execPromise(`node gerar-carrossel-final.js ${i}`);
      console.log(`   ✅ Imagens geradas\n`);

      // Upload Cloudinary
      console.log(`☁️  Fazendo upload...`);
      await execPromise(`node upload-carrossel-final.js ${i}`);
      console.log(`   ✅ Upload concluído\n`);

      sucessos++;
    } catch (error) {
      console.error(`   ❌ Erro no carrossel #${i}:`, error.message);
      erros++;
    }

    console.log('─────────────────────────────────────\n');
  }

  console.log('\n═══════════════════════════════════════\n');
  console.log('🎉 PROCESSAMENTO CONCLUÍDO!\n');
  console.log(`✅ Sucessos: ${sucessos}/${totalCarrosseis}`);
  console.log(`❌ Erros: ${erros}/${totalCarrosseis}\n`);
  console.log('📁 Pastas criadas:');
  for (let i = 1; i <= totalCarrosseis; i++) {
    console.log(`   • output-carrossel-${i}-final/`);
  }
  console.log('\n☁️  Cloudinary folders:');
  for (let i = 1; i <= totalCarrosseis; i++) {
    console.log(`   • post-express/carrossel-${i}/`);
  }
  console.log('\n💡 Todos os carrosséis estão prontos para Instagram!\n');
}

processarTodos().catch(console.error);
