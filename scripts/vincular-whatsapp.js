#!/usr/bin/env node

/**
 * Script para vincular número de WhatsApp a um perfil
 *
 * Uso:
 * node scripts/vincular-whatsapp.js @username 66632607531
 */

import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '..', '.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function vincularWhatsApp(username, phone) {
  try {
    const cleanUsername = username.replace('@', '');

    console.log(`\n📱 Vinculando WhatsApp ao perfil...\n`);
    console.log(`Perfil: @${cleanUsername}`);
    console.log(`WhatsApp: ${phone}\n`);

    // Buscar perfil
    const { data: profile, error: findError } = await supabase
      .from('instagram_profiles')
      .select('id, username, whatsapp_phone')
      .eq('username', cleanUsername)
      .single();

    if (findError || !profile) {
      console.log(`❌ Perfil @${cleanUsername} não encontrado!`);
      console.log(`\nCrie o perfil primeiro rodando uma análise:\n`);
      console.log(`   node scripts/instagram-scraper-with-comments.js ${cleanUsername}\n`);
      process.exit(1);
    }

    // Atualizar WhatsApp
    const { error: updateError } = await supabase
      .from('instagram_profiles')
      .update({ whatsapp_phone: phone })
      .eq('id', profile.id);

    if (updateError) {
      throw updateError;
    }

    console.log(`✅ WhatsApp vinculado com sucesso!`);
    console.log(`\nPerfil: @${profile.username}`);
    console.log(`WhatsApp: ${phone}`);
    console.log(`\n💡 Agora você pode:`);
    console.log(`   1. Enviar mensagem do WhatsApp ${phone}`);
    console.log(`   2. O bot vai reconhecer você automaticamente`);
    console.log(`   3. Gerar conteúdo personalizado baseado no seu perfil\n`);

  } catch (error) {
    console.error(`\n❌ Erro:`, error.message);
    process.exit(1);
  }
}

// Parse argumentos
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log(`
❌ Uso incorreto!

Exemplos:

  # Vincular WhatsApp ao perfil
  node scripts/vincular-whatsapp.js @seu_perfil 66632607531
  node scripts/vincular-whatsapp.js seu_perfil 5511999999999

  # Listar perfis com WhatsApp vinculado
  node scripts/list-profiles-whatsapp.js
  `);
  process.exit(1);
}

const username = args[0];
const phone = args[1];

vincularWhatsApp(username, phone);
