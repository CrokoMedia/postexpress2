import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkProfile() {
  console.log('Verificando perfil OnePercent...\n');

  // Primeiro, vamos listar todas as tabelas disponíveis
  console.log('Listando tabelas disponíveis...');
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public');

  if (tablesError) {
    console.error('Erro ao listar tabelas:', tablesError);
  } else {
    console.log('Tabelas:', tables?.map(t => t.table_name).join(', '));
  }
  console.log();

  // 1. Verificar se o perfil existe na tabela profiles
  const { data: profile, error: profileError } = await supabase
    .from('instagram_profiles')
    .select('*')
    .eq('id', '76752b65-8878-47fa-ab91-d3021982ffe7')
    .single();

  if (profileError) {
    console.error('❌ Erro ao buscar perfil:', profileError.message);
    return;
  }

  console.log('✅ Perfil encontrado:');
  console.log(JSON.stringify(profile, null, 2));
  console.log();

  // 2. Verificar se existe profile_context para esse perfil
  const { data: context, error: contextError } = await supabase
    .from('profile_context')
    .select('profile_id, identity, content_pillars, business, updated_at')
    .eq('profile_id', '76752b65-8878-47fa-ab91-d3021982ffe7')
    .single();

  if (contextError) {
    if (contextError.code === 'PGRST116') {
      console.log('⚠️  Contexto do perfil não existe ainda (será criado)');
    } else {
      console.error('❌ Erro ao buscar contexto:', contextError.message);
    }
  } else {
    console.log('✅ Contexto do perfil existe:');
    console.log(`   - Display Name: ${context.identity?.displayName || 'N/A'}`);
    console.log(`   - Positioning: ${context.identity?.positioning?.substring(0, 80) || 'N/A'}...`);
    console.log(`   - Pilares: ${context.content_pillars?.length || 0}`);
    console.log(`   - Produtos: ${context.business?.products?.length || 0}`);
    console.log(`   - Última atualização: ${context.updated_at}`);
  }
}

checkProfile().catch(console.error);
