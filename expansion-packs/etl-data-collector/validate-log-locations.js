#!/usr/bin/env node
/**
 * validate-log-locations.js — ETL Data Collector
 * Valida que logs e relatórios estão em docs/logs/ e não em sources/
 *
 * Uso:
 *   node validate-log-locations.js <mind_dir>
 *
 * Exemplo:
 *   node validate-log-locations.js ../../minds/gary_vaynerchuk
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Padrões que NÃO devem estar em sources/
const LOG_PATTERNS = [
  /collection-report\.(yaml|json|md)$/,
  /discovery-report\.(yaml|json|md)$/,
  /import-log\.(yaml|json|md)$/,
  /priority-matrix\.(yaml|json|md)$/,
  /temporal-context\.(yaml|json|md)$/,
  /COLLECTION_SUMMARY\.(yaml|json)$/,
  /QUICK_LINKS\.md$/,
  /VERIFIED_TRANSCRIPT_SOURCES\.md$/,
  /-report\.(yaml|json)$/,
  /-log\.(yaml|json)$/,
  /-status\.(yaml|json)$/,
];

// Arquivos PERMITIDOS em sources/ (segue estrutura dos clones existentes)
const ALLOWED_IN_SOURCES = [
  /sources_master\.yaml$/,
  /SOURCE_INVENTORY\.md$/,
  /README\.md$/,
  /^articles\/.+\.md$/,
  /^videos\/.+\/(transcript\.md|metadata\.json)$/,
  /^books\/.+\/(text\.md|text\.txt|metadata\.json)$/,
  /^podcasts\/.+\/(transcript\.md|metadata\.json)$/,
  /^social\/.+/,
  /^newsletters\/.+/,
  /^transcripts\/.+/,
  /^courses\/.+/,
  /^raw\/.+/,
  /^manual\/.+/,
  /\.gitkeep$/,
  /\.json$/, // config.json e dados estruturados
];

function main() {
  const mindDir = process.argv[2];

  if (!mindDir) {
    console.error(chalk.red('Uso: node validate-log-locations.js <mind_dir>'));
    process.exit(1);
  }

  if (!fs.existsSync(mindDir)) {
    console.error(chalk.red(`Diretório não encontrado: ${mindDir}`));
    process.exit(1);
  }

  const sourcesDir = path.join(mindDir, 'sources');
  const logsDir = path.join(mindDir, 'docs', 'logs');

  console.log(chalk.bold('\n🔍 Validando estrutura de diretórios'));
  console.log(chalk.gray('═'.repeat(50)));
  console.log(chalk.white(`  Mente: ${chalk.cyan(path.basename(mindDir))}`));
  console.log(chalk.gray('═'.repeat(50)));

  let violations = 0;
  let warnings = 0;

  // Verifica se diretórios existem
  if (!fs.existsSync(sourcesDir)) {
    console.log(chalk.yellow('  ⚠ sources/ não existe ainda (normal se coleta não iniciou)'));
  } else {
    violations += checkSourcesDir(sourcesDir);
  }

  if (!fs.existsSync(logsDir)) {
    console.log(chalk.yellow('  ⚠ docs/logs/ não existe ainda'));
    warnings++;
  } else {
    console.log(chalk.green('  ✓ docs/logs/ existe'));
  }

  // Verifica sources_master.yaml
  const masterPath = path.join(sourcesDir, 'sources_master.yaml');
  if (fs.existsSync(masterPath)) {
    console.log(chalk.green('  ✓ sources_master.yaml existe'));
  } else if (fs.existsSync(sourcesDir)) {
    console.log(chalk.yellow('  ⚠ sources_master.yaml não encontrado (gerar após coleta)'));
    warnings++;
  }

  console.log(chalk.gray('─'.repeat(50)));

  if (violations === 0) {
    console.log(chalk.green.bold(`  ✓ Estrutura válida! (${warnings} avisos)`));
  } else {
    console.log(chalk.red.bold(`  ✗ ${violations} violação(ões) encontrada(s)`));
    console.log(chalk.yellow('    Mova os arquivos listados para docs/logs/'));
  }

  console.log();
  process.exit(violations > 0 ? 1 : 0);
}

function checkSourcesDir(sourcesDir) {
  let violations = 0;

  const scanDir = (dir, relative = '') => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const relPath = relative ? `${relative}/${entry.name}` : entry.name;
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        scanDir(fullPath, relPath);
        continue;
      }

      // Verifica se é um arquivo de log que não deveria estar em sources/
      const isViolation = LOG_PATTERNS.some(p => p.test(entry.name));

      if (isViolation) {
        console.log(chalk.red(`  ✗ Violação: sources/${relPath}`));
        console.log(chalk.gray(`       → Mover para: docs/logs/${entry.name}`));
        violations++;
      }
    }
  };

  scanDir(sourcesDir);

  if (violations === 0) {
    console.log(chalk.green('  ✓ sources/ sem violações'));
  }

  return violations;
}

main();
