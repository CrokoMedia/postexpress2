/**
 * Script de teste para youtube-transcript
 *
 * Uso: node scripts/test-youtube-transcript.mjs <VIDEO_ID>
 * Exemplo: node scripts/test-youtube-transcript.mjs dQw4w9WgXcQ
 */

import { YoutubeTranscript } from 'youtube-transcript';

async function testTranscript(videoId) {
  console.log(`\n🎬 Testando transcrição do vídeo: ${videoId}\n`);

  try {
    // Tentar buscar em português brasileiro
    console.log('1️⃣ Tentando buscar transcrição em português brasileiro (pt-BR)...');
    try {
      const transcriptPt = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'pt-BR' });
      console.log(`✅ Transcrição PT-BR encontrada: ${transcriptPt.length} segmentos`);

      if (transcriptPt.length > 0) {
        const fullText = transcriptPt.map(item => item.text).join(' ');
        console.log(`📝 Total: ${fullText.length} caracteres`);
        console.log(`\n📄 Preview (primeiros 500 chars):\n${fullText.substring(0, 500)}...\n`);
        return fullText;
      }
    } catch (err) {
      console.log(`⚠️  Transcrição PT-BR não disponível: ${err.message}`);
    }

    // Tentar em inglês
    console.log('\n2️⃣ Tentando buscar transcrição em inglês...');
    try {
      const transcriptEn = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' });
      console.log(`✅ Transcrição EN encontrada: ${transcriptEn.length} segmentos`);
      console.log('📊 Debug - Tipo:', typeof transcriptEn, 'Array?', Array.isArray(transcriptEn));

      if (transcriptEn.length > 0) {
        console.log('📊 Debug - Primeiro segmento:', JSON.stringify(transcriptEn[0], null, 2));
        const fullText = transcriptEn.map(item => item.text).join(' ');
        console.log(`📝 Total: ${fullText.length} caracteres`);
        console.log(`\n📄 Preview (primeiros 500 chars):\n${fullText.substring(0, 500)}...\n`);
        return fullText;
      } else {
        console.log('⚠️  Array vazio retornado');
      }
    } catch (err) {
      console.log(`⚠️  Transcrição EN não disponível: ${err.message}`);
    }

    // Tentar sem especificar idioma
    console.log('\n3️⃣ Tentando buscar transcrição em qualquer idioma...');
    const transcriptAuto = await YoutubeTranscript.fetchTranscript(videoId);
    console.log(`✅ Transcrição encontrada: ${transcriptAuto.length} segmentos`);

    const fullText = transcriptAuto.map(item => item.text).join(' ');
    console.log(`📝 Total: ${fullText.length} caracteres`);
    console.log(`\n📄 Preview (primeiros 500 chars):\n${fullText.substring(0, 500)}...\n`);

    return fullText;

  } catch (error) {
    console.error(`\n❌ Erro ao buscar transcrição:`, error.message);
    console.error('\n💡 Dica: Verifique se o vídeo possui legendas/closed captions disponíveis no YouTube.');
    throw error;
  }
}

// Executar
const videoId = process.argv[2];

if (!videoId) {
  console.error('\n❌ Erro: Video ID não fornecido');
  console.log('\n📖 Uso: node scripts/test-youtube-transcript.mjs <VIDEO_ID>');
  console.log('📖 Exemplo: node scripts/test-youtube-transcript.mjs dQw4w9WgXcQ');
  process.exit(1);
}

testTranscript(videoId)
  .then(() => {
    console.log('\n✅ Teste concluído com sucesso!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Teste falhou\n');
    process.exit(1);
  });
