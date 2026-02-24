#!/usr/bin/env node
/**
 * Script para atualizar carrosséis com branding correto
 * Croko Labs → Croko Lab
 * Auditoria Express → Croko Audit
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const AUDIT_ID = '5f9abde1-b974-4759-9f28-bb787dc59ab7';

// Função para substituir todas as referências à marca antiga
function updateBranding(text) {
  if (!text) return text;

  return text
    .replace(/Croko Labs/g, 'Croko Lab')
    .replace(/post express/g, 'croko lab')
    .replace(/postexpress/g, 'crokolab')
    .replace(/Auditoria Express/g, 'Croko Audit')
    .replace(/auditoria express/g, 'croko audit')
    .replace(/@karlapazos\.ai/g, '@karlapazos')
    .replace(/karlapazos\.ai/g, 'karlapazos');
}

// Função para atualizar um carrossel completo
function updateCarousel(carousel) {
  return {
    ...carousel,
    titulo: updateBranding(carousel.titulo),
    objetivo: updateBranding(carousel.objetivo),
    baseado_em: updateBranding(carousel.baseado_em),
    caption: updateBranding(carousel.caption),
    slides: carousel.slides.map(slide => ({
      ...slide,
      titulo: updateBranding(slide.titulo),
      corpo: updateBranding(slide.corpo),
      subtitulo: updateBranding(slide.subtitulo)
    })),
    cta: updateBranding(carousel.cta)
  };
}

async function fixBrandCarousels() {
  console.log('🔧 Atualizando branding dos carrosséis...\n');

  // 1. Buscar content_suggestions atual
  const { data: content, error: fetchError } = await supabase
    .from('content_suggestions')
    .select('id, content_json')
    .eq('audit_id', AUDIT_ID)
    .single();

  if (fetchError || !content) {
    console.error('❌ Erro ao buscar content:', fetchError);
    return;
  }

  console.log(`✅ Content ID: ${content.id}`);
  console.log(`📊 Carrosséis atuais: ${content.content_json.carousels.length}\n`);

  // 2. Atualizar carrosséis (índices 2, 3, 4, 6, 7 = carrosséis 3, 4, 5, 7, 8)
  const indicesToUpdate = [2, 3, 4, 6, 7];
  const updatedCarousels = content.content_json.carousels.map((carousel, index) => {
    if (indicesToUpdate.includes(index)) {
      console.log(`🔄 Atualizando Carrossel ${index + 1}: "${carousel.titulo}"`);
      return updateCarousel(carousel);
    }
    return carousel;
  });

  // 3. Atualizar estratégia_geral também
  const updatedContentJson = {
    ...content.content_json,
    carousels: updatedCarousels,
    estrategia_geral: updateBranding(content.content_json.estrategia_geral)
  };

  // 4. Salvar de volta no banco
  const { error: updateError } = await supabase
    .from('content_suggestions')
    .update({ content_json: updatedContentJson })
    .eq('id', content.id);

  if (updateError) {
    console.error('\n❌ Erro ao atualizar:', updateError);
    return;
  }

  console.log('\n✅ Branding atualizado com sucesso!');
  console.log('\n📋 Substituições realizadas:');
  console.log('  • Croko Labs → Croko Lab');
  console.log('  • Auditoria Express → Croko Audit');
  console.log('  • @karlapazos.ai → @karlapazos');
  console.log(`\n🎯 ${indicesToUpdate.length} carrosséis atualizados`);
  console.log('\n📍 Acesse: http://localhost:3000/dashboard/audits/5f9abde1-b974-4759-9f28-bb787dc59ab7/create-content');
}

fixBrandCarousels().catch(console.error);
