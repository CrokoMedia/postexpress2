#!/usr/bin/env node

/**
 * Script to migrate pages from dark mode to light mode design system
 *
 * This script updates:
 * - Background colors: dark (neutral-800/900) → light (white/neutral-50)
 * - Text colors: light (neutral-50/100) → dark (neutral-900/800)
 * - Secondary text: neutral-400 → neutral-600
 * - Borders: neutral-700 → neutral-200
 * - Gradient backgrounds
 * - Card borders and backgrounds
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files to update
const files = [
  'app/dashboard/profiles/[id]/page.tsx',
  'app/dashboard/audits/[id]/page.tsx',
  'app/dashboard/new/page.tsx',
  'app/login/page.tsx',
  'app/dashboard/audits/[id]/create-content/page.tsx',
];

// Color mappings from dark to light
const colorMappings = [
  // Backgrounds
  { from: /bg-neutral-950/g, to: 'bg-white' },
  { from: /bg-neutral-900/g, to: 'bg-neutral-50' },
  { from: /bg-neutral-800/g, to: 'bg-white' },

  // Text colors
  { from: /text-neutral-50\b/g, to: 'text-neutral-900' },
  { from: /text-neutral-100\b/g, to: 'text-neutral-900' },
  { from: /text-neutral-200\b/g, to: 'text-neutral-900' },
  { from: /text-neutral-300\b/g, to: 'text-neutral-700' },
  { from: /text-neutral-400\b/g, to: 'text-neutral-600' },
  { from: /text-neutral-500\b/g, to: 'text-neutral-600' },

  // Borders
  { from: /border-neutral-800/g, to: 'border-neutral-200' },
  { from: /border-neutral-700/g, to: 'border-neutral-200' },
  { from: /border-neutral-600/g, to: 'border-neutral-300' },

  // Gradients - primary
  { from: /from-primary-500\/10/g, to: 'from-primary-50' },
  { from: /to-primary-500\/5/g, to: 'to-white' },
  { from: /from-primary-500\/15/g, to: 'from-primary-100' },
  { from: /border-primary-500\/20/g, to: 'border-primary-200' },
  { from: /border-primary-500\/30/g, to: 'border-primary-200' },
  { from: /border-primary-500\/60/g, to: 'border-primary-300' },
  { from: /bg-primary-500\/20/g, to: 'bg-primary-100' },
  { from: /text-primary-400/g, to: 'text-primary-600' },
  { from: /text-primary-500/g, to: 'text-primary-600' },

  // Gradients - success
  { from: /from-success-500\/10/g, to: 'from-success-50' },
  { from: /to-success-500\/5/g, to: 'to-white' },
  { from: /from-success-500\/15/g, to: 'from-success-100' },
  { from: /border-success-500\/30/g, to: 'border-success-200' },
  { from: /border-success-500\/60/g, to: 'border-success-300' },
  { from: /bg-success-500\/20/g, to: 'bg-success-100' },
  { from: /text-success-400/g, to: 'text-success-700' },
  { from: /border-success-500\/5/g, to: 'border-success-200' },

  // Gradients - warning
  { from: /from-warning-500\/10/g, to: 'from-warning-50' },
  { from: /to-warning-500\/5/g, to: 'to-white' },
  { from: /from-warning-500\/15/g, to: 'from-warning-100' },
  { from: /border-warning-500\/30/g, to: 'border-warning-200' },
  { from: /border-warning-500\/60/g, to: 'border-warning-300' },
  { from: /bg-warning-500\/20/g, to: 'bg-warning-100' },
  { from: /text-warning-400/g, to: 'text-warning-700' },
  { from: /border-warning-500\/20/g, to: 'border-warning-200' },

  // Gradients - error
  { from: /from-error-500\/10/g, to: 'from-error-50' },
  { from: /to-error-500\/5/g, to: 'to-white' },
  { from: /from-error-500\/15/g, to: 'from-error-100' },
  { from: /border-error-500\/30/g, to: 'border-error-200' },
  { from: /bg-error-500\/20/g, to: 'bg-error-100' },
  { from: /text-error-400/g, to: 'text-error-700' },
  { from: /bg-error-500\/10/g, to: 'bg-error-50' },

  // Gradients - info
  { from: /from-info-500\/10/g, to: 'from-info-50' },
  { from: /to-info-500\/5/g, to: 'to-white' },
  { from: /from-info-500\/15/g, to: 'from-info-100' },
  { from: /border-info-500\/30/g, to: 'border-info-200' },
  { from: /border-info-500\/60/g, to: 'border-info-300' },
  { from: /bg-info-500\/20/g, to: 'bg-info-100' },
  { from: /text-info-400/g, to: 'text-info-700' },

  // Gradients - blue
  { from: /from-blue-500\/10/g, to: 'from-blue-50' },
  { from: /to-blue-500\/5/g, to: 'to-white' },
  { from: /border-blue-500\/20/g, to: 'border-blue-200' },

  // Gradients - yellow/orange
  { from: /from-yellow-500\/10/g, to: 'from-yellow-50' },
  { from: /to-orange-500\/10/g, to: 'to-orange-50' },
  { from: /border-yellow-500\/30/g, to: 'border-yellow-200' },
  { from: /text-yellow-600/g, to: 'text-yellow-700' },

  // Specific patterns
  { from: /bg-neutral-800\/50/g, to: 'bg-neutral-50' },
  { from: /bg-neutral-800\/60/g, to: 'bg-neutral-50' },
  { from: /bg-neutral-800\/30/g, to: 'bg-neutral-50' },
  { from: /bg-neutral-900\/50/g, to: 'bg-neutral-100' },
  { from: /bg-neutral-900\/80/g, to: 'bg-neutral-100' },
  { from: /bg-neutral-700\/60/g, to: 'bg-neutral-200' },
  { from: /bg-neutral-700\/50/g, to: 'bg-neutral-200' },
  { from: /ring-neutral-700/g, to: 'ring-neutral-200' },

  // Login page specific
  { from: /border-neutral-700\b/g, to: 'border-neutral-200' },
  { from: /placeholder-neutral-500/g, to: 'placeholder-neutral-400' },
  { from: /focus:ring-offset-neutral-950/g, to: 'focus:ring-offset-white' },
];

function migrateFile(filePath) {
  const absolutePath = path.join(path.dirname(__dirname), filePath);

  if (!fs.existsSync(absolutePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(absolutePath, 'utf8');
  let changes = 0;

  // Apply all color mappings
  colorMappings.forEach(({ from, to }) => {
    const before = content;
    content = content.replace(from, to);
    if (before !== content) {
      changes++;
    }
  });

  if (changes > 0) {
    fs.writeFileSync(absolutePath, content, 'utf8');
    console.log(`✅ Updated ${filePath} (${changes} pattern(s) changed)`);
  } else {
    console.log(`⏭️  No changes needed for ${filePath}`);
  }
}

console.log('🎨 Starting light mode migration...\n');

files.forEach(file => {
  migrateFile(file);
});

console.log('\n✨ Migration complete!');
console.log('\n⚠️  IMPORTANT: Review the changes manually and test all pages.');
console.log('Some complex gradients or special cases may need manual adjustment.\n');
