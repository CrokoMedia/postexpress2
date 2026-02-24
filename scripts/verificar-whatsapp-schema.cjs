#!/usr/bin/env node

/**
 * Script para verificar se o schema do WhatsApp está aplicado no Supabase
 *
 * Uso:
 * node scripts/verificar-whatsapp-schema.cjs
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verificarSchema() {
  console.log('\n🔍 Verificando Schema WhatsApp no Supabase...\n');

  try {
    // 1. Verificar se tabela whatsapp_users existe
    console.log('1. Verificando tabela whatsapp_users...');
    const { data: whatsappUsers, error: whatsappError } = await supabase
      .from('whatsapp_users')
      .select('id')
      .limit(1);

    if (whatsappError) {
      if (whatsappError.message.includes('does not exist')) {
        console.log('   ❌ Tabela whatsapp_users NÃO existe');
        console.log('\n📝 AÇÃO NECESSÁRIA:');
        console.log('   Execute no SQL Editor do Supabase:');
        console.log('   database/whatsapp-users-schema.sql\n');
        return false;
      } else {
        throw whatsappError;
      }
    }
    console.log('   ✅ Tabela whatsapp_users existe');

    // 2. Verificar coluna whatsapp_phone em profiles
    console.log('\n2. Verificando coluna whatsapp_phone em profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, whatsapp_phone')
      .limit(1);

    if (profilesError) {
      if (profilesError.message.includes('whatsapp_phone')) {
        console.log('   ❌ Coluna whatsapp_phone NÃO existe em profiles');
        console.log('\n📝 AÇÃO NECESSÁRIA:');
        console.log('   Execute no SQL Editor do Supabase:');
        console.log('   database/whatsapp-users-schema.sql\n');
        return false;
      } else {
        throw profilesError;
      }
    }
    console.log('   ✅ Coluna whatsapp_phone existe em profiles');

    // 3. Verificar se há usuários WhatsApp cadastrados
    console.log('\n3. Verificando usuários WhatsApp cadastrados...');
    const { data: users, error: usersError } = await supabase
      .from('whatsapp_users')
      .select('*');

    if (usersError) throw usersError;

    if (!users || users.length === 0) {
      console.log('   ⚠️  Nenhum usuário WhatsApp cadastrado ainda');
      console.log('   💡 Vincule um WhatsApp na interface ou use:');
      console.log('      node scripts/vincular-whatsapp.js @username 66632607531\n');
    } else {
      console.log(`   ✅ ${users.length} usuário(s) WhatsApp cadastrado(s):`);
      users.forEach(user => {
        console.log(`      • ${user.name} (${user.phone}) ${user.authorized ? '✓' : '✗'}`);
      });
    }

    // 4. Verificar perfis com WhatsApp vinculado
    console.log('\n4. Verificando perfis com WhatsApp vinculado...');
    const { data: linkedProfiles, error: linkedError } = await supabase
      .from('profiles')
      .select('id, username, whatsapp_phone')
      .not('whatsapp_phone', 'is', null);

    if (linkedError) throw linkedError;

    if (!linkedProfiles || linkedProfiles.length === 0) {
      console.log('   ⚠️  Nenhum perfil com WhatsApp vinculado');
      console.log('   💡 Vincule na interface: /dashboard/profiles/[id]\n');
    } else {
      console.log(`   ✅ ${linkedProfiles.length} perfil(is) com WhatsApp:`);
      linkedProfiles.forEach(profile => {
        console.log(`      • @${profile.username} → ${profile.whatsapp_phone}`);
      });
    }

    console.log('\n✅ Schema WhatsApp configurado corretamente!\n');
    console.log('📱 Próximos passos:');
    console.log('   1. Abra um perfil em: http://localhost:3000/dashboard/profiles/[id]');
    console.log('   2. Clique em "Vincular WhatsApp"');
    console.log('   3. Preencha nome e telefone');
    console.log('   4. Teste envio de mensagem via /api/whatsapp/send\n');

    return true;

  } catch (error) {
    console.error('\n❌ Erro ao verificar schema:', error.message);
    console.error('\nDetalhes:', error);
    return false;
  }
}

// Executar verificação
verificarSchema()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
