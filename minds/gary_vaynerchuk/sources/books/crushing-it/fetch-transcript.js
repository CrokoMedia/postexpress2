/**
 * Busca o resultado da transcrição do audiobook Crushing It!
 * Transcript ID: e41efabe-eb03-41fb-aa4b-1b7b0ab13e0d
 *
 * Uso: node fetch-transcript.js
 */

const fs   = require('fs');
const path = require('path');

const ASSEMBLYAI_KEY  = 'e6f0fe8a173440229da572ca74118b00';
const TRANSCRIPT_ID   = 'e41efabe-eb03-41fb-aa4b-1b7b0ab13e0d';
const OUTPUT_DIR      = __dirname;
const POLL_INTERVAL   = 30000; // 30s

async function checkTranscript() {
  const res  = await fetch(`https://api.assemblyai.com/v2/transcript/${TRANSCRIPT_ID}`, {
    headers: { authorization: ASSEMBLYAI_KEY }
  });
  return res.json();
}

async function saveResults(data) {
  const wordCount = data.text ? data.text.split(/\s+/).length : 0;

  // Salvar texto bruto
  fs.writeFileSync(path.join(OUTPUT_DIR, 'text.txt'), data.text || '');

  // Salvar markdown com frontmatter
  const md = `---
title: "Crushing It! — Gary Vaynerchuk (Audiobook EN)"
original_title: "Crushing It!"
slug: "crushing-it"
source_type: book
source_format: audiobook
youtube_url: "https://www.youtube.com/watch?v=ioIXmk2VuWU"
assemblyai_id: "${TRANSCRIPT_ID}"
collected_at: "${new Date().toISOString().split('T')[0]}"
duration_minutes: ${Math.round((data.audio_duration || 0) / 60)}
word_count: ${wordCount}
language: en
---

# Crushing It! — Gary Vaynerchuk

${data.text || ''}
`;
  fs.writeFileSync(path.join(OUTPUT_DIR, 'text.md'), md);

  // Salvar metadata
  const metadata = {
    title: "Crushing It! — Gary Vaynerchuk (Audiobook EN)",
    original_title: "Crushing It!",
    slug: "crushing-it",
    source_type: "book",
    source_format: "audiobook",
    youtube_url: "https://www.youtube.com/watch?v=ioIXmk2VuWU",
    assemblyai_id: TRANSCRIPT_ID,
    collected_at: new Date().toISOString().split('T')[0],
    duration_minutes: Math.round((data.audio_duration || 0) / 60),
    word_count: wordCount,
    language: "en",
    confidence: data.confidence
  };
  fs.writeFileSync(path.join(OUTPUT_DIR, 'metadata.json'), JSON.stringify(metadata, null, 2));

  console.log(`\n✅ Transcrição salva!`);
  console.log(`   📝 Palavras: ${wordCount.toLocaleString()}`);
  console.log(`   ⏱️  Duração: ${Math.round((data.audio_duration || 0) / 60)} min`);
  console.log(`   🎯 Confiança: ${(data.confidence * 100).toFixed(1)}%`);
  console.log(`   📁 Arquivos: text.txt, text.md, metadata.json`);
}

async function poll() {
  console.log(`🔍 Verificando status da transcrição: ${TRANSCRIPT_ID}`);
  console.log(`⏱️  Verificando a cada ${POLL_INTERVAL / 1000}s...\n`);

  while (true) {
    const data = await checkTranscript();
    const ts   = new Date().toLocaleTimeString('pt-BR');

    if (data.status === 'completed') {
      console.log(`[${ts}] ✅ CONCLUÍDO!`);
      await saveResults(data);
      break;
    } else if (data.status === 'error') {
      console.error(`[${ts}] ❌ ERRO:`, data.error);
      break;
    } else {
      console.log(`[${ts}] ⏳ Status: ${data.status}...`);
      await new Promise(r => setTimeout(r, POLL_INTERVAL));
    }
  }
}

poll().catch(console.error);
