#!/usr/bin/env node

/**
 * Script para adicionar usuários autorizados do WhatsApp
 *
 * Uso:
 * node scripts/add-whatsapp-user.js --phone 66632607531 --name "Felipe Ricardo"
 * node scripts/add-whatsapp-user.js --phone 66632607531 --name "Felipe" --profile @username
 */

import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
config({ path: join(__dirname, '..', '.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addWhatsAppUser(phone, name, profileUsername) {
  try {
    console.log(`\n📱 Adicionando usuário WhatsApp...\n`);
    console.log(`Telefone: ${phone}`);
    console.log(`Nome: ${name}`);
    if (profileUsername) {
      console.log(`Perfil: @${profileUsername}`);
    }
    console.log('');

    // 1. Inserir/atualizar usuário WhatsApp
    const { data: user, error: userError } = await supabase
      .from('whatsapp_users')
      .upsert({
        phone,
        name,
        authorized: true
      }, {
        onConflict: 'phone'
      })
      .select()
      .single();

    if (userError) {
      throw userError;
    }

    console.log(`✅ Usuário criado/atualizado: ${user.id}`);

    // 2. Se forneceu perfil, vincular
    if (profileUsername) {
      const username = profileUsername.replace('@', '');

      // Buscar perfil
      const { data: profile, error: profileError } = await supabase
        .from('instagram_profiles')
        .select('id, username')
        .eq('username', username)
        .single();

      if (profileError || !profile) {
        console.log(`⚠️  Perfil @${username} não encontrado. Você pode vincular depois.`);
      } else {
        // Vincular perfil ao usuário
        const { error: linkError } = await supabase
          .from('instagram_profiles')
          .update({ whatsapp_phone: phone })
          .eq('id', profile.id);

        if (linkError) {
          throw linkError;
        }

        // Definir como perfil ativo
        const { error: activeError } = await supabase
          .from('whatsapp_users')
          .update({ active_profile_id: profile.id })
          .eq('phone', phone);

        if (activeError) {
          throw activeError;
        }

        console.log(`✅ Perfil @${username} vinculado e definido como ativo`);
      }
    }

    // 3. Listar perfis vinculados
    const { data: profiles, error: profilesError } = await supabase
      .from('instagram_profiles')
      .select('id, username')
      .eq('whatsapp_phone', phone);

    if (!profilesError && profiles && profiles.length > 0) {
      console.log(`\n📊 Perfis vinculados a este número:`);
      profiles.forEach(p => {
        const isActive = p.id === user.active_profile_id;
        console.log(`   ${isActive ? '✅' : '  '} @${p.username}${isActive ? ' (ativo)' : ''}`);
      });
    }

    console.log(`\n✅ Sucesso!`);
    console.log(`\nPróximos passos:`);
    console.log(`1. Envie uma mensagem do WhatsApp ${phone}`);
    console.log(`2. O bot vai reconhecer você automaticamente`);
    console.log(`3. Para trocar perfil ativo, use: /perfil @username\n`);

  } catch (error) {
    console.error(`\n❌ Erro:`, error.message);
    process.exit(1);
  }
}

// Parse argumentos
const args = process.argv.slice(2);
const phone = args[args.indexOf('--phone') + 1];
const name = args[args.indexOf('--name') + 1];
const profile = args.includes('--profile') ? args[args.indexOf('--profile') + 1] : null;

if (!phone || !name) {
  console.log(`
❌ Uso incorreto!

Exemplos:

  # Adicionar usuário sem vincular perfil
  node scripts/add-whatsapp-user.js --phone 66632607531 --name "Felipe Ricardo"

  # Adicionar usuário e vincular perfil
  node scripts/add-whatsapp-user.js --phone 66632607531 --name "Felipe" --profile @username

  # Listar usuários existentes
  node scripts/list-whatsapp-users.js
  `);
  process.exit(1);
}

addWhatsAppUser(phone, name, profile);
