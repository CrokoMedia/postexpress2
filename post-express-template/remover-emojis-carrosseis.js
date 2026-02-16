/**
 * Remover Emojis dos Carrosséis Fluidos
 * Gera versões sem emoji para geração de imagens
 */

const fs = require('fs');
const path = require('path');

// Função para remover emojis e símbolos especiais
function removerEmojis(texto) {
  // Remove emojis usando regex (Unicode ranges)
  return texto
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Emoticons
    .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport and Map
    .replace(/[\u{2300}-\u{23FF}]/gu, '')   // Misc Technical
    .replace(/[\u{FE00}-\u{FE0F}]/gu, '')   // Variation Selectors
    .replace(/[\u{1F1E6}-\u{1F1FF}]/gu, '') // Flags
    // Remove símbolos decorativos específicos
    .replace(/🔴/g, '•')  // Substitui círculo vermelho por bullet
    .replace(/✓/g, '✓')   // Mantém checkmark simples
    .replace(/•/g, '•')   // Mantém bullets
    // Remove espaços extras
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Ler todos os carrosséis fluidos
const inputDir = path.join(__dirname, '../squad-auditores/output-fluidos');
const outputDir = path.join(__dirname, '../squad-auditores/output-sem-emojis');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('🚀 Removendo emojis dos carrosséis\n');

for (let i = 1; i <= 9; i++) {
  const inputFile = path.join(inputDir, `carrossel_${i}_fluido.json`);

  if (!fs.existsSync(inputFile)) {
    console.log(`⚠️  Arquivo não encontrado: carrossel_${i}_fluido.json`);
    continue;
  }

  const carrossel = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));

  // Processar cada slide
  carrossel.slides = carrossel.slides.map(slide => ({
    texto: removerEmojis(slide.texto)
  }));

  // Salvar versão sem emojis
  const outputFile = path.join(outputDir, `carrossel_${i}_sem_emoji.json`);
  fs.writeFileSync(outputFile, JSON.stringify(carrossel, null, 2), 'utf-8');

  console.log(`✅ Carrossel #${i}: ${carrossel.titulo}`);
  console.log(`   ${carrossel.slides.length} slides processados`);
  console.log(`   Salvo: carrossel_${i}_sem_emoji.json\n`);
}

console.log('═══════════════════════════════════════\n');
console.log('🎉 EMOJIS REMOVIDOS COM SUCESSO!\n');
console.log(`📁 Pasta: squad-auditores/output-sem-emojis/\n`);
console.log('💡 Pronto para gerar imagens sem emojis!\n');
