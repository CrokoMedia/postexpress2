#!/usr/bin/env node
/**
 * Script helper para iniciar o worker e monitorar output
 */
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

console.log('🚀 Iniciando Analysis Worker...\n');

const worker = spawn('npx', ['tsx', 'worker/analysis-worker.ts'], {
  cwd: PROJECT_ROOT,
  env: process.env,
  stdio: 'inherit'
});

worker.on('error', (error) => {
  console.error('❌ Erro ao iniciar worker:', error);
  process.exit(1);
});

worker.on('exit', (code) => {
  if (code !== 0) {
    console.error(`\n❌ Worker encerrado com código ${code}`);
    process.exit(code);
  }
  console.log('\n✅ Worker encerrado normalmente');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Encerrando worker...');
  worker.kill('SIGINT');
  setTimeout(() => process.exit(0), 1000);
});
