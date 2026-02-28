#!/usr/bin/env node

/**
 * Script de Validação de Deploy - Post Express
 * Verifica se todos os arquivos essenciais estão presentes
 * antes de fazer deploy para Digital Ocean
 */

import { existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${COLORS.green}✓${COLORS.reset} ${msg}`),
  error: (msg) => console.log(`${COLORS.red}✗${COLORS.reset} ${msg}`),
  warning: (msg) => console.log(`${COLORS.yellow}⚠${COLORS.reset} ${msg}`),
  info: (msg) => console.log(`${COLORS.blue}ℹ${COLORS.reset} ${msg}`),
  section: (msg) => console.log(`\n${COLORS.cyan}${msg}${COLORS.reset}`),
};

// Arquivos críticos (root)
const CRITICAL_FILES = [
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'next.config.js',
  'tailwind.config.ts',
  'postcss.config.js',
  'Dockerfile',
  '.dockerignore',
];

// Pastas críticas
const CRITICAL_FOLDERS = [
  'app',
  'components',
  'lib',
  'types',
  'remotion',
  'public',
];

// Arquivos críticos em pastas específicas
const CRITICAL_NESTED_FILES = [
  'app/layout.tsx',
  'app/page.tsx',
  'app/globals.css',
  'app/api/whatsapp/webhook/route.ts',
  'app/api/whatsapp/send/route.ts',
  'app/api/content/[id]/generate-slides-v3/route.ts',
  'app/api/content/[id]/preview-carousel/route.ts',
  'app/api/content/[id]/export-zip/route.ts',
  'app/api/health/route.ts',
  'lib/supabase.ts',
  'types/database.ts',
  'remotion/index.tsx',
];

// Arquivos que NÃO devem estar (dados sensíveis)
const FORBIDDEN_FILES = [
  '.env',
  '.env.local',
  'SECRETS-PRODUCTION.txt',
  'secrets.txt',
];

let errors = 0;
let warnings = 0;

function checkFile(filePath, critical = false) {
  const fullPath = join(ROOT, filePath);
  if (existsSync(fullPath)) {
    log.success(`${filePath}`);
    return true;
  } else {
    if (critical) {
      log.error(`${filePath} (CRÍTICO)`);
      errors++;
    } else {
      log.warning(`${filePath} (opcional)`);
      warnings++;
    }
    return false;
  }
}

function checkFolder(folderPath) {
  const fullPath = join(ROOT, folderPath);
  if (existsSync(fullPath)) {
    log.success(`${folderPath}/`);
    return true;
  } else {
    log.error(`${folderPath}/ (CRÍTICO)`);
    errors++;
    return false;
  }
}

function checkForbidden(filePath) {
  const fullPath = join(ROOT, filePath);

  // Verificar se está tracked pelo git
  try {
    const tracked = execSync(`git -C "${ROOT}" ls-files | grep -x "${filePath}"`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    }).trim();

    if (tracked) {
      log.error(`${filePath} COMMITADO NO GIT (remover com git rm --cached!)`);
      errors++;
      return false;
    }
  } catch (e) {
    // Arquivo não está no git (correto)
  }

  // Verificar se existe localmente (OK, mas avisar)
  if (existsSync(fullPath)) {
    log.warning(`${filePath} existe localmente (OK - .dockerignore bloqueia)`);
    return true;
  } else {
    log.success(`${filePath} não encontrado`);
    return true;
  }
}

// ============================================
// Validação Principal
// ============================================

console.log(`
╔════════════════════════════════════════════╗
║   Validação de Deploy - Post Express      ║
║   Digital Ocean App Platform               ║
╚════════════════════════════════════════════╝
`);

// 1. Arquivos Críticos (Root)
log.section('📄 Arquivos Críticos (Root)');
CRITICAL_FILES.forEach((file) => checkFile(file, true));

// 2. Pastas Críticas
log.section('📁 Pastas Críticas');
CRITICAL_FOLDERS.forEach((folder) => checkFolder(folder));

// 3. Arquivos Aninhados Críticos
log.section('📄 Arquivos Críticos (Nested)');
CRITICAL_NESTED_FILES.forEach((file) => checkFile(file, true));

// 4. Verificar Arquivos Proibidos
log.section('🔒 Verificar Arquivos Sensíveis (não devem estar)');
FORBIDDEN_FILES.forEach((file) => checkForbidden(file));

// 5. Verificar .env.example
log.section('📝 Arquivo .env.example');
if (checkFile('.env.example', false)) {
  log.info('Certifique-se de que .env.example está atualizado com TODAS as variáveis');
}

// 6. Verificar Remotion Compositions
log.section('🎬 Remotion Compositions');
const remotionFiles = [
  'remotion/index.tsx',
  'remotion/types.ts',
  'remotion/fonts.ts',
];

remotionFiles.forEach((file) => {
  checkFile(file, false); // Não crítico - Remotion é opcional
});

// ============================================
// Resumo Final
// ============================================

console.log('\n' + '='.repeat(50));

if (errors === 0 && warnings === 0) {
  log.success(`\n✨ TUDO OK! Sistema pronto para deploy na Digital Ocean!\n`);
  log.info('Próximos passos:');
  console.log('  1. Commit e push para o repositório');
  console.log('  2. Conectar repositório na Digital Ocean');
  console.log('  3. Configurar variáveis de ambiente');
  console.log('  4. Deploy! 🚀\n');
  process.exit(0);
} else {
  console.log('');
  if (errors > 0) {
    log.error(`${errors} erro(s) CRÍTICO(s) encontrado(s)`);
  }
  if (warnings > 0) {
    log.warning(`${warnings} aviso(s) encontrado(s)`);
  }

  if (errors > 0) {
    console.log('\n❌ Sistema NÃO está pronto para deploy!');
    console.log('Corrija os erros críticos antes de prosseguir.\n');
    process.exit(1);
  } else {
    console.log('\n⚠️  Sistema OK, mas com avisos.');
    console.log('Revise os avisos antes de fazer deploy.\n');
    process.exit(0);
  }
}
