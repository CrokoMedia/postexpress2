#!/usr/bin/env node

/**
 * Script para atualizar o contexto de um perfil com informações dos documentos estratégicos
 *
 * Uso: node scripts/update-profile-context.js <profile_id>
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
config({ path: join(__dirname, '../.env') });

// Configuração Supabase
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são necessárias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Ler argumentos
const profileId = process.argv[2];

if (!profileId) {
  console.error('❌ Uso: node scripts/update-profile-context.js <profile_id>');
  process.exit(1);
}

async function main() {
  console.log('📚 Lendo documentos estratégicos da pasta SobreCrokolabs...\n');

  try {
    // Ler os 3 documentos
    const dissecacao = readFileSync(
      join(__dirname, '../SobreCrokolabs/DISSECAÇÃO NEURAL _ PERSONA MCA.txt'),
      'utf-8'
    );

    const fundacoes = readFileSync(
      join(__dirname, '../SobreCrokolabs/DOCUMENTO FUNDAÇÕES _ MCA.txt'),
      'utf-8'
    );

    const posicionamento = readFileSync(
      join(__dirname, '../SobreCrokolabs/POSICIONAMENTO NUCLEAR _ MCA.txt'),
      'utf-8'
    );

    console.log('✅ Documentos lidos com sucesso:');
    console.log(`   - DISSECAÇÃO NEURAL (${dissecacao.length} caracteres)`);
    console.log(`   - DOCUMENTO FUNDAÇÕES (${fundacoes.length} caracteres)`);
    console.log(`   - POSICIONAMENTO NUCLEAR (${posicionamento.length} caracteres)\n`);

    // Consolidar contexto estratégico
    const contextoAdicional = `# CONTEXTO ESTRATÉGICO - MOTOR DE CONTEÚDO AUTÔNOMO™

## 📋 DOCUMENTO FUNDAÇÕES

${fundacoes}

---

## 🎯 POSICIONAMENTO NUCLEAR

${posicionamento}

---

## 👤 DISSECAÇÃO NEURAL - PERSONA PRINCIPAL

${dissecacao}

---

*Fonte: SobreCrokolabs/ - Documentos estratégicos da Croko Labs*
*Atualizado em: ${new Date().toISOString()}*
`;

    console.log(`📊 Contexto consolidado: ${contextoAdicional.length} caracteres\n`);

    // Buscar perfil atual
    console.log(`🔍 Buscando perfil ${profileId}...`);
    const { data: profile, error: fetchError } = await supabase
      .from('instagram_profiles')
      .select('id, username')
      .eq('id', profileId)
      .single();

    if (fetchError) {
      console.error('❌ Erro ao buscar perfil:', fetchError.message);
      process.exit(1);
    }

    if (!profile) {
      console.error('❌ Perfil não encontrado');
      process.exit(1);
    }

    console.log(`✅ Perfil encontrado: @${profile.username || profile.id}\n`);

    // Verificar se já existe contexto
    console.log('🔍 Verificando contexto existente...');
    const { data: existingContext } = await supabase
      .from('profile_context')
      .select('*')
      .eq('profile_id', profileId)
      .is('deleted_at', null)
      .single();

    let result;

    if (existingContext) {
      // Atualizar contexto existente
      console.log('💾 Atualizando contexto existente...');

      const { data: updated, error: updateError } = await supabase
        .from('profile_context')
        .update({
          contexto_adicional: contextoAdicional,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingContext.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Erro ao atualizar contexto:', updateError.message);
        process.exit(1);
      }

      result = updated;
      console.log('✅ Contexto atualizado com sucesso!\n');

    } else {
      // Criar novo contexto
      console.log('💾 Criando novo contexto...');

      const { data: created, error: createError } = await supabase
        .from('profile_context')
        .insert({
          profile_id: profileId,
          contexto_adicional: contextoAdicional,
          nicho: 'Infraestrutura de Conteúdo Autônomo',
          objetivos: 'Eliminar dependência criativa e transformar autoridade em ativo operacional previsível',
          publico_alvo: 'Experts high ticket (R$50k-150k/mês) que querem escalar sem depender de equipe criativa',
          produtos_servicos: 'Motor de Conteúdo Autônomo™ - Implantação Premium',
          tom_voz: 'Estratégico, estrutural, anti-criatividade como gargalo'
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Erro ao criar contexto:', createError.message);
        process.exit(1);
      }

      result = created;
      console.log('✅ Contexto criado com sucesso!\n');
    }

    console.log('📊 Resumo:');
    console.log(`   - Profile ID: ${profileId}`);
    console.log(`   - Username: @${profile.username || 'N/A'}`);
    console.log(`   - Contexto ID: ${result.id}`);
    console.log(`   - Contexto adicional: ${contextoAdicional.length} caracteres`);
    console.log(`   - Atualizado em: ${result.updated_at}\n`);

    console.log('🎯 Contexto estratégico integrado:');
    console.log('   ✓ Motor de Conteúdo Autônomo™ (método)');
    console.log('   ✓ 4 Pilares + Big Idea + Posicionamento Nuclear');
    console.log('   ✓ Persona João Mendes (10 lâminas completas)');
    console.log('   ✓ Dores, desejos, medos e gatilhos de compra');
    console.log('   ✓ Estrutura de ofertas e vocabulário estratégico\n');

    console.log('🌐 Acesse o contexto em:');
    console.log(`   GET /api/profiles/${profileId}/context\n`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

main();
