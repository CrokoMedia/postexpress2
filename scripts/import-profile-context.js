#!/usr/bin/env node

/**
 * Script para importar contexto de perfil a partir de arquivo JSON
 *
 * Uso:
 *   node scripts/import-profile-context.js caminho/para/contexto.json
 *
 * Exemplo:
 *   node scripts/import-profile-context.js database/contexto-garyvee.json
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontrados no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Validar argumentos
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('❌ Uso: node scripts/import-profile-context.js <caminho-do-json>');
  console.error('📝 Exemplo: node scripts/import-profile-context.js database/contexto-garyvee.json');
  process.exit(1);
}

const jsonPath = resolve(args[0]);

async function importProfileContext() {
  console.log('🚀 Iniciando importação de contexto de perfil...\n');
  console.log(`📁 Arquivo: ${jsonPath}\n`);

  try {
    // Ler arquivo JSON
    const fileContent = readFileSync(jsonPath, 'utf-8');
    const contextData = JSON.parse(fileContent);

    // Validar campos obrigatórios
    if (!contextData.profile_id) {
      console.error('❌ Campo obrigatório "profile_id" não encontrado no JSON');
      process.exit(1);
    }

    // Remover campos de instrução (começam com _)
    const cleanData = Object.fromEntries(
      Object.entries(contextData).filter(([key]) => !key.startsWith('_'))
    );

    // Limpar _exemplo dos objetos internos
    const cleanNested = (obj) => {
      if (Array.isArray(obj)) {
        return obj.map(cleanNested);
      } else if (obj && typeof obj === 'object') {
        return Object.fromEntries(
          Object.entries(obj)
            .filter(([key]) => !key.startsWith('_'))
            .map(([key, value]) => [key, cleanNested(value)])
        );
      }
      return obj;
    };

    const finalData = cleanNested(cleanData);

    console.log(`Profile ID: ${finalData.profile_id}`);
    if (finalData.identity?.displayName) {
      console.log(`Nome: ${finalData.identity.displayName}\n`);
    }

    // Upsert (insert ou update)
    const { data, error } = await supabase
      .from('profile_context')
      .upsert(finalData, {
        onConflict: 'profile_id'
      })
      .select();

    if (error) {
      console.error('❌ Erro ao importar contexto:', error);
      process.exit(1);
    }

    console.log('✅ Contexto importado com sucesso!\n');

    // Verificar o resultado
    const { data: verificacao, error: errorVerif } = await supabase
      .from('profile_context')
      .select('profile_id, identity, content_pillars, business, dna')
      .eq('profile_id', finalData.profile_id)
      .single();

    if (errorVerif) {
      console.error('⚠️  Erro ao verificar:', errorVerif);
    } else {
      console.log('📊 Dados inseridos:');
      if (verificacao.identity?.displayName) {
        console.log(`   - Nome: ${verificacao.identity.displayName}`);
      }
      if (verificacao.identity?.positioning) {
        console.log(`   - Posicionamento: ${verificacao.identity.positioning}`);
      }
      if (verificacao.content_pillars) {
        console.log(`   - Pilares de conteúdo: ${verificacao.content_pillars.length}`);
      }
      if (verificacao.business?.products) {
        console.log(`   - Produtos: ${verificacao.business.products.length}`);
      }
      if (verificacao.dna?.frameworks) {
        console.log(`   - Frameworks: ${verificacao.dna.frameworks.length}`);
      }
      console.log('\n✨ Perfil completo atualizado no Post Express!');
    }

  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error(`❌ Arquivo não encontrado: ${jsonPath}`);
    } else if (err instanceof SyntaxError) {
      console.error('❌ Erro ao parsear JSON:', err.message);
      console.error('💡 Verifique se o JSON está válido (vírgulas, aspas, chaves)');
    } else {
      console.error('❌ Erro inesperado:', err);
    }
    process.exit(1);
  }
}

// Executar
importProfileContext();
