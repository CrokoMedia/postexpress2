/**
 * Processar TODOS os 9 Carrosséis
 * Dividir em slides curtos (3-4 linhas cada)
 */

const fs = require('fs');
const path = require('path');

const basePath = '/Users/macbook-karla/postexpress2/squad-auditores/output';
const outputDir = path.join(__dirname, '../squad-auditores/output-divididos');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Função para extrair texto limpo de um bloco de código
function extrairTexto(markdown, slideNum) {
  const pattern = new RegExp(`### \\*\\*SLIDE ${slideNum}[^\\n]*\\n\`\`\`([\\s\\S]*?)\`\`\``, 'm');
  const match = markdown.match(pattern);

  if (!match) return null;

  let texto = match[1].trim();
  // Remover linhas de visual/instruções
  texto = texto.split('\n').filter(line =>
    !line.includes('**Visual:**') &&
    !line.includes('---') &&
    line.trim() !== ''
  ).join('\n');

  return texto;
}

// Função para dividir texto em chunks de 3-4 linhas
function dividirTexto(texto) {
  const linhas = texto.split('\n').filter(l => l.trim());
  const chunks = [];
  let chunk = [];

  for (let i = 0; i < linhas.length; i++) {
    chunk.push(linhas[i]);

    // Se atingiu 4 linhas OU é uma linha importante sozinha (título)
    if (chunk.length >= 4 ||
        (chunk[chunk.length - 1].includes(':') && chunk.length >= 2) ||
        (chunk[chunk.length - 1].startsWith('✓') && chunk.length >= 3)) {
      chunks.push(chunk.join('\n'));
      chunk = [];
    }
  }

  // Adicionar última chunk se houver
  if (chunk.length > 0) {
    chunks.push(chunk.join('\n'));
  }

  return chunks;
}

// Processar carrossel
function processarCarrossel(nomeArquivo, numero) {
  const filepath = path.join(basePath, nomeArquivo);

  if (!fs.existsSync(filepath)) {
    console.log(`⚠️  Arquivo não encontrado: ${nomeArquivo}`);
    return null;
  }

  const markdown = fs.readFileSync(filepath, 'utf-8');

  // Extrair título
  const tituloMatch = markdown.match(/##\s+"([^"]+)"/);
  const titulo = tituloMatch ? tituloMatch[1] : `Carrossel ${numero}`;

  // Extrair número de slides original
  const slidesMatch = markdown.match(/\*\*Slides:\*\*\s+(\d+)/);
  const totalSlidesOriginal = slidesMatch ? parseInt(slidesMatch[1]) : 10;

  // Extrair todos os slides
  const todosSlides = [];
  for (let i = 1; i <= totalSlidesOriginal; i++) {
    const texto = extrairTexto(markdown, i);
    if (texto) {
      // Dividir este slide em chunks menores
      const chunks = dividirTexto(texto);
      chunks.forEach(chunk => {
        todosSlides.push({ texto: chunk });
      });
    }
  }

  return {
    numero,
    titulo,
    slidesOriginais: totalSlidesOriginal,
    slidesDivididos: todosSlides.length,
    slides: todosSlides
  };
}

// Lista dos 9 carrosséis
const carrosseis = [
  { arquivo: 'carrossel-educacional-01-5-erros-engajamento.md', numero: 1 },
  { arquivo: 'carrossel-educacional-02-70-porcento-inutil.md', numero: 2 },
  { arquivo: 'carrossel-educacional-03-3-frameworks-copywriting.md', numero: 3 },
  { arquivo: 'carrossel-vendas-01-pain-revelado.md', numero: 4 },
  { arquivo: 'carrossel-vendas-02-8-empresas-1bi.md', numero: 5 },
  { arquivo: 'carrossel-vendas-03-imersao-ia-alphaville.md', numero: 6 },
  { arquivo: 'carrossel-autoridade-01-framework-1-sentenca.md', numero: 7 },
  { arquivo: 'carrossel-autoridade-02-vale-ansiedade.md', numero: 8 },
  { arquivo: 'carrossel-autoridade-03-ia-elimina-categoria.md', numero: 9 }
];

console.log('🚀 Processando 9 carrosséis...\n');
console.log('📐 Regra: 3-4 linhas por slide\n');

let totalSlidesGerados = 0;

carrosseis.forEach(({ arquivo, numero }) => {
  const carrossel = processarCarrossel(arquivo, numero);

  if (carrossel) {
    // Salvar JSON
    const outputFile = path.join(outputDir, `carrossel_${numero}_dividido.json`);
    fs.writeFileSync(outputFile, JSON.stringify(carrossel, null, 2), 'utf-8');

    console.log(`✅ Carrossel #${numero}: ${carrossel.titulo}`);
    console.log(`   Original: ${carrossel.slidesOriginais} slides`);
    console.log(`   Dividido: ${carrossel.slidesDivididos} slides`);
    console.log(`   Arquivo: carrossel_${numero}_dividido.json\n`);

    totalSlidesGerados += carrossel.slidesDivididos;
  }
});

console.log('═══════════════════════════════════════\n');
console.log('🎉 TODOS OS 9 CARROSSÉIS DIVIDIDOS!\n');
console.log(`📊 Total de slides gerados: ${totalSlidesGerados}`);
console.log(`📁 Pasta: squad-auditores/output-divididos/\n`);
console.log('💡 Próximo passo: Gerar as imagens PNG\n');
