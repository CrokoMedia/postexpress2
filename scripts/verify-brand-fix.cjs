#!/usr/bin/env node
/**
 * Verificar se o branding foi atualizado corretamente
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const AUDIT_ID = '5f9abde1-b974-4759-9f28-bb787dc59ab7';

async function verifyBrandFix() {
  console.log('🔍 Verificando atualizações de branding...\n');

  const { data: content, error } = await supabase
    .from('content_suggestions')
    .select('content_json')
    .eq('audit_id', AUDIT_ID)
    .single();

  if (error || !content) {
    console.error('❌ Erro ao buscar content:', error);
    return;
  }

  const carousels = content.content_json.carousels;
  const indicesToCheck = [2, 3, 4, 6, 7]; // Carrosséis 3, 4, 5, 7, 8

  indicesToCheck.forEach(index => {
    const carousel = carousels[index];
    const carouselNum = index + 1;

    console.log(`\n📊 Carrossel ${carouselNum}: "${carousel.titulo}"`);

    // Verificar caption
    const hasPostExpress = carousel.caption.includes('Post Express') ||
                          carousel.caption.includes('post express');
    const hasCrokoLab = carousel.caption.includes('Croko Lab') ||
                       carousel.caption.includes('croko lab');

    if (hasPostExpress) {
      console.log('  ❌ Ainda contém "Post Express" na caption');
    } else if (hasCrokoLab) {
      console.log('  ✅ Caption atualizada com "Croko Lab"');
    } else {
      console.log('  ℹ️  Caption não menciona marca');
    }

    // Verificar slides
    carousel.slides.forEach((slide, slideIndex) => {
      const slideText = `${slide.titulo} ${slide.corpo} ${slide.subtitulo || ''}`;
      if (slideText.includes('Post Express')) {
        console.log(`  ❌ Slide ${slideIndex + 1} ainda contém "Post Express"`);
      }
    });
  });

  console.log('\n✅ Verificação completa!');
}

verifyBrandFix().catch(console.error);
