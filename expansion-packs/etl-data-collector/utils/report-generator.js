/**
 * Report Generator — ETL Data Collector
 * Gera relatório YAML após a coleta
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function generateCollectionReport({ mind, outputDir, results, startTime }) {
  const endTime = Date.now();
  const elapsed = Math.round((endTime - startTime) / 1000);

  const successful = results.filter(r => r.status === 'success');
  const failed = results.filter(r => r.status === 'failed');
  const skipped = results.filter(r => r.status === 'skipped');

  const byType = {};
  for (const r of results) {
    if (!byType[r.type]) byType[r.type] = { total: 0, success: 0, failed: 0 };
    byType[r.type].total++;
    if (r.status === 'success') byType[r.type].success++;
    if (r.status === 'failed') byType[r.type].failed++;
  }

  const report = {
    collection_report: {
      mind_name: mind,
      generated_at: new Date().toISOString(),
      elapsed_seconds: elapsed,

      summary: {
        total_sources: results.length,
        successful: successful.length,
        failed: failed.length,
        skipped: skipped.length,
        success_rate: `${Math.round((successful.length / results.length) * 100)}%`,
      },

      by_type: byType,

      sources: results.map(r => ({
        id: r.id,
        title: r.title,
        type: r.type,
        status: r.status,
        output_path: r.outputPath || null,
        error: r.error || null,
        duration_minutes: r.durationMinutes || null,
        word_count: r.wordCount || null,
        api_used: r.apiUsed || null,
      })),

      validation: {
        minimum_15_sources: successful.length >= 15 ? 'PASS' : 'FAIL',
        minimum_5_tier1: successful.filter(r => r.tier === 1).length >= 5 ? 'PASS' : 'FAIL',
        type_diversity: Object.keys(byType).filter(t => byType[t].success > 0).length >= 3 ? 'PASS' : 'FAIL',
      },
    },
  };

  // Salva em docs/logs/
  const logsDir = path.join(outputDir, '..', 'docs', 'logs');
  fs.mkdirSync(logsDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const reportPath = path.join(logsDir, `${timestamp}-collection-report.yaml`);
  fs.writeFileSync(reportPath, yaml.dump(report), 'utf8');

  return { reportPath, report };
}

module.exports = { generateCollectionReport };
