/**
 * Progress Tracker — ETL Data Collector
 * Exibe progresso visual no terminal durante a coleta
 */

const chalk = require('chalk');

class ProgressTracker {
  constructor(total) {
    this.total = total;
    this.completed = 0;
    this.failed = 0;
    this.skipped = 0;
    this.current = null;
    this.startTime = Date.now();
  }

  start(sourceTitle) {
    this.current = sourceTitle;
    const truncated = sourceTitle.length > 60
      ? sourceTitle.slice(0, 57) + '...'
      : sourceTitle;
    process.stdout.write(chalk.cyan(`\n→ Coletando: ${truncated}`));
  }

  success(sourceTitle) {
    this.completed++;
    this.current = null;
    const truncated = sourceTitle.length > 60
      ? sourceTitle.slice(0, 57) + '...'
      : sourceTitle;
    console.log(chalk.green(`\n✓ ${truncated}`));
    this._printProgress();
  }

  skip(sourceTitle, reason) {
    this.skipped++;
    const truncated = sourceTitle.length > 60
      ? sourceTitle.slice(0, 57) + '...'
      : sourceTitle;
    console.log(chalk.yellow(`\n⏭  ${truncated} — ${reason}`));
    this._printProgress();
  }

  fail(sourceTitle, error) {
    this.failed++;
    const truncated = sourceTitle.length > 60
      ? sourceTitle.slice(0, 57) + '...'
      : sourceTitle;
    console.log(chalk.red(`\n✗ ${truncated} — ${error}`));
    this._printProgress();
  }

  _printProgress() {
    const done = this.completed + this.failed + this.skipped;
    const pct = Math.round((done / this.total) * 100);
    const filled = Math.round(pct / 5);
    const bar = '█'.repeat(filled) + '░'.repeat(20 - filled);

    const elapsed = Math.round((Date.now() - this.startTime) / 1000);
    const eta = done > 0
      ? Math.round((elapsed / done) * (this.total - done))
      : '?';

    console.log(
      chalk.white(
        `  [${bar}] ${done}/${this.total} (${pct}%) ` +
        chalk.green(`✓${this.completed} `) +
        chalk.yellow(`⏭${this.skipped} `) +
        chalk.red(`✗${this.failed} `) +
        chalk.gray(`ETA: ${eta}s`)
      )
    );
  }

  summary() {
    const elapsed = Math.round((Date.now() - this.startTime) / 1000);
    console.log('\n' + chalk.bold('═'.repeat(60)));
    console.log(chalk.bold('RESUMO DA COLETA'));
    console.log('═'.repeat(60));
    console.log(chalk.green(`  ✓ Coletados:  ${this.completed}/${this.total}`));
    console.log(chalk.yellow(`  ⏭ Pulados:    ${this.skipped}`));
    console.log(chalk.red(`  ✗ Falhas:     ${this.failed}`));
    console.log(chalk.gray(`  ⏱ Tempo:      ${elapsed}s`));
    console.log('═'.repeat(60) + '\n');
  }
}

module.exports = { ProgressTracker };
