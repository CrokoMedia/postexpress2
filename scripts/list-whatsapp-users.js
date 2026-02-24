#!/usr/bin/env node

/**
 * Script para listar usuários autorizados do WhatsApp
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

async function listUsers() {
  try {
    const { data: users, error } = await supabase
      .from('whatsapp_users')
      .select(`
        *,
        active_profile:instagram_profiles!whatsapp_users_active_profile_id_fkey(id, username)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!users || users.length === 0) {
      console.log('\n⚠️  Nenhum usuário cadastrado ainda.\n');
      console.log('Use: node scripts/add-whatsapp-user.js --phone XXXXX --name "Nome"\n');
      return;
    }

    console.log(`\n📱 ${users.length} usuário(s) autorizado(s):\n`);

    for (const user of users) {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`👤 ${user.name}`);
      console.log(`📞 ${user.phone}`);
      console.log(`🔐 ${user.authorized ? '✅ Autorizado' : '❌ Bloqueado'}`);

      if (user.active_profile) {
        console.log(`📊 Perfil ativo: @${user.active_profile.username}`);
      }

      // Buscar todos os perfis vinculados
      const { data: profiles } = await supabase
        .from('instagram_profiles')
        .select('username')
        .eq('whatsapp_phone', user.phone);

      if (profiles && profiles.length > 0) {
        console.log(`📎 ${profiles.length} perfil(is) vinculado(s): ${profiles.map(p => '@' + p.username).join(', ')}`);
      }

      console.log(`🕒 Criado: ${new Date(user.created_at).toLocaleString('pt-BR')}`);
    }

    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

listUsers();
