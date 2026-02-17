#!/usr/bin/env node
/**
 * run-collection.js — ETL Data Collector
 * Orquestrador principal de coleta paralela de fontes
 *
 * Uso:
 *   node run-collection.js <batch_file.yaml> <output_dir> [rules_file.yaml]
 *
 * Exemplo (chamado pelo MMOS):
 *   node run-collection.js \
 *     ../../minds/gary_vaynerchuk/sources/tier1_batch.yaml \
 *     ../../minds/gary_vaynerchuk/sources \
 *     ./config/download-rules.yaml
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const chalk = require('chalk');

const { collectYouTube } = require('./collectors/youtube-collector');
const { collectBlog } = require('./collectors/blog-collector');
const { collectPDF } = require('./collectors/pdf-collector');
const { collectAudio } = require('./collectors/audio-collector');
const { collectSocial } = require('./collectors/social-collector');
const { ProgressTracker } = require('./utils/progress-tracker');
const { generateCollectionReport } = require('./utils/report-generator');
const { logCollection, updateMindStatus } = require('./utils/inventory-updater');

const COLLECTORS = {
  // Vídeos
  youtube: collectYouTube,
  video: collectYouTube,
  // Artigos e blogs
  blog: collectBlog,
  article: collectBlog,
  // Documentos e livros
  pdf: collectPDF,
  book: collectPDF,
  document: collectPDF,
  // Áudio e podcasts
  audio: collectAudio,
  podcast: collectAudio,
  // Redes sociais
  tiktok: collectSocial,
  instagram: collectSocial,
  twitter: collectSocial,
  linkedin: collectSocial,
  social: collectSocial,
};

async function main() {
  const [, , batchFile, outputDir, rulesFile] = process.argv;

  if (!batchFile || !outputDir) {
    console.error(chalk.red('Uso: node run-collection.js <batch_file.yaml> <output_dir> [rules_file.yaml]'));
    process.exit(1);
  }

  // Valida existência do batch file
  if (!fs.existsSync(batchFile)) {
    console.error(chalk.red(`Batch file não encontrado: ${batchFile}`));
    process.exit(1);
  }

  // Lê configurações
  const batch = yaml.load(fs.readFileSync(batchFile, 'utf8'));
  const rules = rulesFile && fs.existsSync(rulesFile)
    ? yaml.load(fs.readFileSync(rulesFile, 'utf8'))
    : {};

  const sources = batch.sources || batch.batch?.sources || [];
  const mind = batch.mind || batch.batch?.mind || 'unknown';
  const batchName = batch.name || batch.batch?.name || 'batch';
  const maxConcurrent = rules.max_concurrent || 3;

  if (sources.length === 0) {
    console.error(chalk.red('Nenhuma fonte encontrada no batch file'));
    process.exit(1);
  }

  // Garante estrutura de diretórios
  fs.mkdirSync(outputDir, { recursive: true });

  console.log(chalk.bold('\n🚀 ETL Data Collector'));
  console.log(chalk.gray('═'.repeat(60)));
  console.log(chalk.white(`  Mente:   ${chalk.cyan(mind)}`));
  console.log(chalk.white(`  Batch:   ${chalk.cyan(batchName)}`));
  console.log(chalk.white(`  Fontes:  ${chalk.cyan(sources.length)}`));
  console.log(chalk.white(`  Paralel: ${chalk.cyan(maxConcurrent)} simultâneos`));
  console.log(chalk.white(`  Output:  ${chalk.cyan(outputDir)}`));
  console.log(chalk.gray('═'.repeat(60)));

  const tracker = new ProgressTracker(sources.length);
  const startTime = Date.now();
  const results = [];

  // Processa em lotes paralelos
  for (let i = 0; i < sources.length; i += maxConcurrent) {
    const batch = sources.slice(i, i + maxConcurrent);

    const batchPromises = batch.map(async (source) => {
      const collector = COLLECTORS[source.type];

      if (!collector) {
        const result = {
          ...source,
          status: 'skipped',
          error: `Tipo não suportado: ${source.type}`,
        };
        tracker.skip(source.title || source.id, `tipo "${source.type}" não suportado`);
        return result;
      }

      tracker.start(source.title || source.id || source.url);

      try {
        const result = await collector({ ...source, mind }, outputDir);

        if (result.status === 'success') {
          tracker.success(source.title || source.id);
          logCollection({
            mind,
            type: source.type,
            title: source.title || source.id,
            durationOrSize: result.wordCount ? `${result.wordCount} palavras` : null,
            apiUsed: result.apiUsed || null,
            plan: 'free',
            status: '✓ Coletado',
          });
        } else if (result.status === 'partial') {
          tracker.skip(source.title || source.id, result.error || 'parcial');
        } else {
          tracker.fail(source.title || source.id, result.error || 'erro desconhecido');
        }

        return result;
      } catch (err) {
        const result = { ...source, status: 'failed', error: err.message };
        tracker.fail(source.title || source.id, err.message);
        return result;
      }
    });

    const batchResults = await Promise.allSettled(batchPromises);
    for (const settled of batchResults) {
      if (settled.status === 'fulfilled') {
        results.push(settled.value);
      } else {
        results.push({ status: 'failed', error: settled.reason?.message });
      }
    }
  }

  // Resumo final
  tracker.summary();

  // Gera relatório
  const { reportPath, report } = generateCollectionReport({
    mind,
    outputDir,
    results,
    startTime,
  });

  // Gera sources_master.yaml (interface MMOS)
  const masterPath = path.join(outputDir, 'sources_master.yaml');
  const master = buildSourcesMaster(mind, results);
  fs.writeFileSync(masterPath, yaml.dump(master), 'utf8');

  // Gera SOURCE_INVENTORY.md (padrão dos clones existentes)
  const inventoryPath = path.join(outputDir, 'SOURCE_INVENTORY.md');
  const inventory = buildSourceInventory(mind, results);
  fs.writeFileSync(inventoryPath, inventory, 'utf8');

  // Atualiza status da mente no inventário
  const successCount = results.filter(r => r.status === 'success').length;
  const audioHours = results
    .filter(r => r.durationMinutes)
    .reduce((sum, r) => sum + (r.durationMinutes || 0), 0) / 60;

  updateMindStatus(
    mind,
    successCount === sources.length ? 'completed' : 'partial',
    successCount,
    audioHours.toFixed(1)
  );

  // Validação final
  console.log(chalk.bold('\n📋 Validação Final'));
  console.log(chalk.gray('─'.repeat(40)));
  printValidation('≥ 15 fontes coletadas', successCount >= 15, successCount);
  printValidation(
    '≥ 5 fontes Tier 1',
    results.filter(r => r.status === 'success' && r.tier === 1).length >= 5,
    results.filter(r => r.status === 'success' && r.tier === 1).length
  );
  const typeCount = new Set(results.filter(r => r.status === 'success').map(r => r.type)).size;
  printValidation('≥ 3 tipos de fonte', typeCount >= 3, typeCount);

  console.log(chalk.gray('\n─'.repeat(40)));
  console.log(chalk.white(`📄 Relatório: ${chalk.cyan(reportPath)}`));
  console.log(chalk.white(`📦 sources_master.yaml: ${chalk.cyan(masterPath)}`));
  console.log();

  process.exit(results.some(r => r.status === 'failed') ? 1 : 0);
}

function buildSourcesMaster(mind, results) {
  const successful = results.filter(r => r.status === 'success');

  return {
    sources_master: {
      mind_name: mind,
      compilation_date: new Date().toISOString(),
      metadata: {
        total_sources: successful.length,
        sources_by_type: successful.reduce((acc, r) => {
          acc[r.type] = (acc[r.type] || 0) + 1;
          return acc;
        }, {}),
      },
      sources: successful.map((r, idx) => ({
        id: r.id || `source_${String(idx + 1).padStart(3, '0')}`,
        title: r.title || null,
        type: r.type,
        tier: r.tier || 2,
        path: r.outputPath || null,
        url: r.url || null,
        word_count: r.wordCount || null,
        collected_at: new Date().toISOString().split('T')[0],
      })),
    },
  };
}

function buildSourceInventory(mind, results) {
  const date = new Date().toISOString().split('T')[0];
  const successful = results.filter(r => r.status === 'success');
  const failed = results.filter(r => r.status === 'failed');
  const skipped = results.filter(r => r.status === 'skipped');

  const totalWords = successful.reduce((sum, r) => sum + (r.wordCount || 0), 0);
  const totalMinutes = successful.reduce((sum, r) => sum + (r.durationMinutes || 0), 0);
  const pct = Math.round((successful.length / Math.max(results.length, 1)) * 100);
  const bar = '█'.repeat(Math.round(pct / 5)) + '░'.repeat(20 - Math.round(pct / 5));

  const byType = {};
  for (const r of results) {
    const t = r.type || 'other';
    if (!byType[t]) byType[t] = { success: 0, failed: 0, skipped: 0 };
    byType[t][r.status] = (byType[t][r.status] || 0) + 1;
  }

  const lines = [
    `# ${mind.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} — Source Inventory`,
    ``,
    `## 📊 Dashboard de Coleta`,
    ``,
    `\`\`\`yaml`,
    `Status Geral: ${successful.length === results.length ? '✅ Completo' : successful.length > 0 ? '🔨 Em andamento' : '🌱 Inicial'}`,
    `Fontes Coletadas: ${successful.length}/${results.length}`,
    `Palavras Totais: ${totalWords.toLocaleString()}`,
    `Áudio Transcrito: ${totalMinutes}min`,
    `Progresso: ${bar} ${pct}%`,
    `Última Atualização: ${date}`,
    `\`\`\``,
    ``,
    `---`,
    ``,
  ];

  // Seção por tipo
  const typeLabels = {
    youtube: '🎥 Vídeos (YouTube)',
    video: '🎥 Vídeos',
    blog: '📝 Artigos',
    article: '📝 Artigos',
    book: '📚 Livros',
    pdf: '📚 Documentos',
    document: '📚 Documentos',
    audio: '🎙️ Áudio',
    podcast: '🎙️ Podcasts',
  };

  const grouped = {};
  for (const r of results) {
    const label = typeLabels[r.type] || `📦 ${r.type}`;
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(r);
  }

  for (const [label, items] of Object.entries(grouped)) {
    lines.push(`## ${label}`, ``);
    for (const r of items) {
      const statusIcon = r.status === 'success' ? '✅' : r.status === 'skipped' ? '⏭️' : '❌';
      const title = r.title || r.id || r.url || 'Sem título';
      const meta = r.wordCount ? `${r.wordCount.toLocaleString()} palavras` :
                   r.durationMinutes ? `${r.durationMinutes}min` : '';
      lines.push(`### ${title}`);
      lines.push(`\`\`\`yaml`);
      lines.push(`Status: ${statusIcon} ${r.status === 'success' ? 'Coletado' : r.status === 'skipped' ? 'Pulado' : 'Falhou'}`);
      if (meta) lines.push(`Tamanho: ${meta}`);
      if (r.outputPath) lines.push(`Localização: ${r.outputPath}`);
      if (r.apiUsed) lines.push(`API: ${r.apiUsed}`);
      if (r.error) lines.push(`Erro: ${r.error}`);
      lines.push(`Coletado em: ${date}`);
      lines.push(`\`\`\``);
      lines.push(``);
    }
    lines.push(`---`, ``);
  }

  // Resumo final
  lines.push(
    `## 📈 Métricas`,
    ``,
    `| Métrica | Valor |`,
    `|---------|-------|`,
    `| ✅ Coletados | ${successful.length} |`,
    `| ⏭️ Pulados (já existiam) | ${skipped.length} |`,
    `| ❌ Falhas | ${failed.length} |`,
    `| 📝 Total de palavras | ${totalWords.toLocaleString()} |`,
    `| 🎙️ Áudio transcrito | ${totalMinutes}min |`,
    ``,
    `---`,
    ``,
    `*Gerado automaticamente pelo ETL Data Collector em ${date}*`,
    `*Atualizar este arquivo após cada nova coleta para evitar retrabalho.*`,
  );

  return lines.join('\n');
}

function printValidation(label, pass, value) {
  const icon = pass ? chalk.green('✓') : chalk.red('✗');
  const status = pass ? chalk.green('PASS') : chalk.red('FAIL');
  console.log(`  ${icon} ${label}: ${chalk.cyan(value)} — ${status}`);
}

main().catch(err => {
  console.error(chalk.red('\n❌ Erro fatal:'), err.message);
  process.exit(1);
});
