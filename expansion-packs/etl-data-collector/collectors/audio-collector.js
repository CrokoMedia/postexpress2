/**
 * Audio / Podcast Collector — ETL Data Collector
 *
 * Output: sources/podcasts/{subtype}/{slug}/
 *   ├── transcript.md
 *   └── metadata.json
 *
 * Subtypes: guest_appearances (default) | own_podcast
 * (segue estrutura dos clones existentes: sources/podcasts/)
 */

const fs = require('fs');
const path = require('path');
const { generateSlug } = require('../utils/slug-generator');
const { updateAssemblyAIUsage, logCollection } = require('../utils/inventory-updater');

async function collectAudio(source, outputDir) {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;

  if (!apiKey) {
    return { ...source, status: 'failed', error: 'ASSEMBLYAI_API_KEY não configurada. Adicione ao .env' };
  }

  if (!source.audio_url && !source.audio_file) {
    return { ...source, status: 'failed', error: 'Forneça audio_url (URL pública) ou audio_file (caminho local)' };
  }

  // Subtype: guest_appearances (default) ou own_podcast
  const subtype = source.subtype || 'guest_appearances';
  const slug = generateSlug(source.title || source.audio_url || 'audio');
  const targetDir = path.join(outputDir, 'podcasts', subtype, slug);
  fs.mkdirSync(targetDir, { recursive: true });

  // Pula se já existe
  if (fs.existsSync(path.join(targetDir, 'transcript.md'))) {
    return { ...source, status: 'skipped', outputPath: path.join('podcasts', subtype, slug), reason: 'já coletado' };
  }

  try {
    const { AssemblyAI } = require('assemblyai');
    const client = new AssemblyAI({ apiKey });

    console.log(`    AssemblyAI: enviando áudio para transcrição...`);

    const transcriptRequest = {
      speech_models: ['universal-2'],  // Universal-2: 99+ idiomas (API v6+)
      language_detection: true,
      speaker_labels: true,
      auto_chapters: true,
    };

    if (source.audio_url) {
      transcriptRequest.audio_url = source.audio_url;
    } else {
      transcriptRequest.audio_url = await client.files.upload(source.audio_file);
    }

    const transcript = await client.transcripts.transcribe(transcriptRequest);

    if (transcript.status === 'error') {
      return { ...source, status: 'failed', error: transcript.error };
    }

    const durationMinutes = transcript.audio_duration
      ? Math.ceil(transcript.audio_duration / 60)
      : null;

    const fullText = transcript.text || '';
    const formatted = transcript.utterances && transcript.utterances.length > 0
      ? transcript.utterances.map(u => `**[${u.speaker}]** ${u.text}`).join('\n\n')
      : fullText;

    const chaptersSection = transcript.chapters && transcript.chapters.length > 0
      ? '\n\n## Capítulos\n\n' + transcript.chapters
          .map(c => `### ${c.headline}\n_${formatTime(c.start / 1000)} → ${formatTime(c.end / 1000)}_\n\n${c.summary}`)
          .join('\n\n')
      : '';

    const date = new Date().toISOString().split('T')[0];
    const title = source.title || slug;

    fs.writeFileSync(path.join(targetDir, 'transcript.md'), [
      `---`,
      `title: "${title.replace(/"/g, "'")}"`,
      `source_type: podcast`,
      `subtype: ${subtype}`,
      `method: assemblyai`,
      `slug: "${slug}"`,
      `collected_at: "${date}"`,
      `duration_minutes: ${durationMinutes || 'unknown'}`,
      `word_count: ${fullText.split(/\s+/).length}`,
      `language: ${source.lang || 'pt'}`,
      source.audio_url ? `audio_url: "${source.audio_url}"` : `audio_file: "${source.audio_file}"`,
      `---`,
      ``,
      `# ${title}`,
      chaptersSection,
      ``,
      `## Transcrição`,
      ``,
      formatted,
    ].join('\n'), 'utf8');

    fs.writeFileSync(path.join(targetDir, 'metadata.json'), JSON.stringify({
      title, slug, source_type: 'podcast', subtype,
      method: 'assemblyai', collected_at: date,
      duration_minutes: durationMinutes,
      word_count: fullText.split(/\s+/).length,
      audio_url: source.audio_url || null,
      audio_file: source.audio_file || null,
      assemblyai_id: transcript.id,
    }, null, 2), 'utf8');

    if (durationMinutes) {
      updateAssemblyAIUsage(durationMinutes);
      logCollection({
        mind: source.mind || 'unknown',
        type: 'podcast',
        title,
        durationOrSize: `${durationMinutes}min`,
        apiUsed: 'assemblyai',
        plan: 'free',
        status: '✓ Coletado',
      });
    }

    return {
      ...source,
      status: 'success',
      outputPath: path.join('podcasts', subtype, slug),
      wordCount: fullText.split(/\s+/).length,
      durationMinutes,
      apiUsed: 'assemblyai',
    };
  } catch (err) {
    return { ...source, status: 'failed', error: err.message };
  }
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

module.exports = { collectAudio };
