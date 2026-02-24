#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkKarlaReAudit() {
  // Buscar profile da Karla pelo ID
  const karlaId = '9ebce906-35c4-408c-a73b-c5211a927ad9';

  const { data: profile, error: profileError } = await supabase
    .from('instagram_profiles')
    .select('id, username, full_name')
    .eq('id', karlaId)
    .single();

  if (profileError || !profile) {
    console.log('❌ Perfil da Karla não encontrado');
    process.exit(1);
  }

  console.log('👤 Perfil encontrado:', profile.full_name || profile.username, '@' + profile.username);
  console.log('');

  // Buscar auditorias da Karla
  const { data: audits, error: auditError } = await supabase
    .from('audits')
    .select('id, audit_date, raw_json, score_overall')
    .eq('profile_id', profile.id)
    .order('audit_date', { ascending: false });

  if (auditError || !audits || audits.length === 0) {
    console.log('❌ Nenhuma auditoria encontrada para a Karla');
    process.exit(1);
  }

  console.log('📊 Total de auditorias:', audits.length);
  console.log('');

  // Verificar se há re-auditoria (version 2.0)
  const reAudits = audits.filter(a => a.raw_json?.version === '2.0');

  if (reAudits.length === 0) {
    console.log('⚠️  Nenhuma RE-AUDITORIA encontrada');
    console.log('');
    console.log('🎯 AÇÃO NECESSÁRIA:');
    console.log('   1. Entre na auditoria da Karla');
    console.log('   2. Clique em "Re-Auditar"');
    console.log('   3. Aguarde o processamento');
    console.log('');
    console.log('Auditorias disponíveis (v1.0):');
    audits.slice(0, 3).forEach((a, i) => {
      console.log(`   ${i + 1}. Score: ${a.score_overall} - ${new Date(a.audit_date).toLocaleDateString('pt-BR')}`);
    });
    return;
  }

  console.log('✅ RE-AUDITORIA ENCONTRADA!');
  console.log('');

  const latest = reAudits[0];
  console.log('📅 Data:', new Date(latest.audit_date).toLocaleString('pt-BR'));
  console.log('📊 Score Overall:', latest.score_overall);
  console.log('');

  // Verificar context_used
  const contextUsed = latest.raw_json?.context_used;

  if (!contextUsed) {
    console.log('❌ context_used não encontrado no raw_json');
    return;
  }

  if (contextUsed.identity && contextUsed.content_pillars) {
    console.log('✅ CONTEXTO COMPLETO USADO (nova estrutura JSONB):');
    console.log('');
    console.log('   ✅ identity:', !!contextUsed.identity);
    console.log('   ✅ credibility:', !!contextUsed.credibility);
    console.log('   ✅ philosophy:', !!contextUsed.philosophy);
    console.log('   ✅ content_style:', !!contextUsed.content_style);
    console.log('   ✅ content_pillars:', contextUsed.content_pillars?.length || 0, 'pilares');
    console.log('   ✅ business:', contextUsed.business?.products?.length || 0, 'produtos');
    console.log('   ✅ dna:', contextUsed.dna?.frameworks?.length || 0, 'frameworks');
    console.log('');

    if (contextUsed.identity?.positioning) {
      console.log('🎯 Posicionamento usado:');
      console.log('   "' + contextUsed.identity.positioning.substring(0, 80) + '..."');
      console.log('');
    }

    if (contextUsed.content_pillars?.length > 0) {
      console.log('🎨 Pilares de conteúdo usados:');
      contextUsed.content_pillars.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name} (${p.weight})`);
      });
      console.log('');
    }

    if (contextUsed.business?.products?.length > 0) {
      console.log('💰 Produtos usados:');
      contextUsed.business.products.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name} - ${p.price}`);
      });
      console.log('');
    }

    if (contextUsed.dna?.frameworks?.length > 0) {
      console.log('🧬 Frameworks usados:');
      contextUsed.dna.frameworks.slice(0, 5).forEach((f, i) => {
        console.log(`   ${i + 1}. ${f}`);
      });
      if (contextUsed.dna.frameworks.length > 5) {
        console.log(`   ... e mais ${contextUsed.dna.frameworks.length - 5} frameworks`);
      }
      console.log('');
    }

    console.log('🎉 TUDO CERTO! A re-auditoria usou o contexto completo.');
  } else {
    console.log('⚠️  Re-auditoria encontrada mas com estrutura ANTIGA (campos legados)');
    console.log('');
    console.log('Context usado (legacy):');
    if (contextUsed.legacy) {
      console.log('   - nicho:', contextUsed.legacy.nicho || 'N/A');
      console.log('   - objetivos:', contextUsed.legacy.objetivos || 'N/A');
    }
    console.log('');
    console.log('🔄 AÇÃO NECESSÁRIA:');
    console.log('   Clique em "Re-Auditar" novamente para usar a nova estrutura');
  }
}

checkKarlaReAudit();
