/**
 * PDF / Book Collector — ETL Data Collector
 *
 * Output: sources/books/{title-slug}/
 *   ├── text.md       — texto completo formatado
 *   ├── text.txt      — texto limpo
 *   └── metadata.json
 *
 * (segue estrutura dos clones existentes: sources/books/{titulo}/)
 */

const fs = require('fs');
const path = require('path');
const { generatePDFSlug } = require('../utils/slug-generator');

async function collectPDF(source, outputDir) {
  const rawPath = source.path || source.file;

  if (!rawPath) {
    return { ...source, status: 'failed', error: 'Caminho do arquivo não fornecido (use "path")' };
  }

  // Resolve relativo ao outputDir se não for caminho absoluto
  const filePath = path.isAbsolute(rawPath)
    ? rawPath
    : fs.existsSync(rawPath)
      ? rawPath
      : path.join(outputDir, rawPath);

  if (!fs.existsSync(filePath)) {
    return { ...source, status: 'failed', error: `Arquivo não encontrado: ${filePath}` };
  }

  const slug = generatePDFSlug(filePath, source.title);

  // Livros ficam em sources/books/{slug}/
  // Outros documentos ficam em sources/raw/{slug}/
  const subfolder = source.type === 'book' || !source.subtype ? 'books' : `raw`;
  const targetDir = path.join(outputDir, subfolder, slug);
  fs.mkdirSync(targetDir, { recursive: true });

  // Pula se já existe
  if (fs.existsSync(path.join(targetDir, 'text.md'))) {
    return { ...source, status: 'skipped', outputPath: path.join(subfolder, slug), reason: 'já coletado' };
  }

  try {
    const pdfParse = require('pdf-parse');
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);

    const text = data.text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    const date = new Date().toISOString().split('T')[0];
    const title = source.title || path.basename(filePath, '.pdf');

    // text.md
    fs.writeFileSync(path.join(targetDir, 'text.md'), [
      `---`,
      `title: "${title.replace(/"/g, "'")}"`,
      `source_type: book`,
      `file: "${path.basename(filePath)}"`,
      `slug: "${slug}"`,
      `collected_at: "${date}"`,
      `pages: ${data.numpages}`,
      `word_count: ${text.split(/\s+/).length}`,
      `---`,
      ``,
      `# ${title}`,
      ``,
      text,
    ].join('\n'), 'utf8');

    // text.txt
    fs.writeFileSync(path.join(targetDir, 'text.txt'), text, 'utf8');

    // metadata.json
    fs.writeFileSync(path.join(targetDir, 'metadata.json'), JSON.stringify({
      title,
      slug,
      file: path.basename(filePath),
      source_type: 'book',
      collected_at: date,
      pages: data.numpages,
      word_count: text.split(/\s+/).length,
    }, null, 2), 'utf8');

    return {
      ...source,
      status: 'success',
      outputPath: path.join(subfolder, slug),
      wordCount: text.split(/\s+/).length,
      pages: data.numpages,
      apiUsed: 'pdf-parse',
    };
  } catch (err) {
    return { ...source, status: 'failed', error: err.message };
  }
}

module.exports = { collectPDF };
