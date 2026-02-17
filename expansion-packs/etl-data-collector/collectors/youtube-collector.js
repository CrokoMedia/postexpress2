/**
 * YouTube Collector — ETL Data Collector
 *
 * Estratégia de coleta:
 * 1. Tenta transcrição automática do YouTube (grátis, youtube-transcript)
 * 2. Fallback: yt-dlp → baixa áudio → AssemblyAI transcribe
 * 3. Fallback: audio_url/audio_file diretamente → AssemblyAI
 *
 * Output: sources/videos/{subtype}/{slug}/
 *   ├── transcript.md   — transcrição completa formatada
 *   └── metadata.json   — metadados do vídeo
 *
 * Subtypes: youtube_main (default) | youtube_shorts | {channel_name}
 */

const fs   = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');
const { generateYouTubeSlug } = require('../utils/slug-generator');
const { updateAssemblyAIUsage } = require('../utils/inventory-updater');

/**
 * Extrai transcrição de um vídeo do YouTube
 * @param {Object} source - { id, video_id, title, url, subtype, lang, audio_url, audio_file }
 * @param {string} outputDir - Diretório base sources/
 */
async function collectYouTube(source, outputDir) {
  const videoId = source.video_id || extractVideoId(source.url);

  if (!videoId && !source.audio_url && !source.audio_file) {
    return { ...source, status: 'failed', error: 'video_id/url não encontrado e sem audio_url/audio_file' };
  }

  const subtype  = source.subtype || 'youtube_main';
  const slug     = generateYouTubeSlug(videoId || source.id, source.title);
  const targetDir = path.join(outputDir, 'videos', subtype, slug);
  fs.mkdirSync(targetDir, { recursive: true });

  // ── 0. Pula se já existe ──────────────────────────────────────────────────
  if (fs.existsSync(path.join(targetDir, 'transcript.md'))) {
    return {
      ...source,
      status: 'skipped',
      outputPath: path.join('videos', subtype, slug),
      reason: 'já coletado',
    };
  }

  // ── 1. Legenda automática do YouTube (grátis) ─────────────────────────────
  if (videoId) {
    try {
      const transcript = await tryYouTubeTranscript(videoId, source.lang || 'en');
      if (transcript) {
        await saveTranscript(transcript, targetDir, source, videoId, slug, 'youtube-auto');
        return {
          ...source,
          status: 'success',
          outputPath: path.join('videos', subtype, slug),
          wordCount: transcript.fullText.split(/\s+/).length,
          apiUsed: 'youtube-auto',
        };
      }
    } catch (_) {}

    // Tenta pt também
    try {
      const transcript = await tryYouTubeTranscript(videoId, 'pt');
      if (transcript) {
        await saveTranscript(transcript, targetDir, source, videoId, slug, 'youtube-auto-pt');
        return {
          ...source,
          status: 'success',
          outputPath: path.join('videos', subtype, slug),
          wordCount: transcript.fullText.split(/\s+/).length,
          apiUsed: 'youtube-auto',
        };
      }
    } catch (_) {}
  }

  // ── 2. AssemblyAI (requer audio_url, audio_file, ou yt-dlp) ──────────────
  const assemblyKey = process.env.ASSEMBLYAI_API_KEY;
  if (!assemblyKey) {
    return {
      ...source,
      status: 'partial',
      error: 'Sem legenda automática. Configure ASSEMBLYAI_API_KEY para transcrição via AssemblyAI.',
    };
  }

  // 2a. yt-dlp → AssemblyAI (para URLs YouTube sem legenda)
  if (videoId && source.url) {
    const ytdlpPath = findYtDlp();
    if (ytdlpPath) {
      try {
        return await collectViaYtDlp(source, targetDir, subtype, slug, videoId, assemblyKey, ytdlpPath);
      } catch (err) {
        console.warn(`  ⚠️  yt-dlp falhou: ${err.message} — tentando audio_url...`);
      }
    }
  }

  // 2b. audio_url / audio_file diretamente
  if (source.audio_url || source.audio_file) {
    return await collectWithAssemblyAI(source, targetDir, subtype, slug, videoId, assemblyKey);
  }

  return {
    ...source,
    status: 'partial',
    error: 'Sem legenda automática e yt-dlp não disponível. Instale com: brew install yt-dlp',
  };
}

// ─── YouTube auto transcript ────────────────────────────────────────────────

async function tryYouTubeTranscript(videoId, lang) {
  const { YoutubeTranscript } = require('youtube-transcript');
  const segments = await YoutubeTranscript.fetchTranscript(videoId, { lang });
  if (!segments || segments.length === 0) return null;

  const fullText  = segments.map(s => s.text).join(' ').replace(/\s+/g, ' ').trim();
  const formatted = segments.map(s => `[${formatTime(s.offset / 1000)}] ${s.text}`).join('\n');

  return { segments, fullText, formatted };
}

// ─── yt-dlp + AssemblyAI ────────────────────────────────────────────────────

function findYtDlp() {
  const candidates = [
    '/opt/homebrew/bin/yt-dlp',
    '/usr/local/bin/yt-dlp',
    '/usr/bin/yt-dlp',
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  try {
    const result = spawnSync('which', ['yt-dlp'], { encoding: 'utf8' });
    const found = (result.stdout || '').trim();
    if (found) return found;
  } catch (_) {}
  return null;
}

async function collectViaYtDlp(source, targetDir, subtype, slug, videoId, assemblyKey, ytdlpPath) {
  const tmpAudio = path.join(targetDir, 'audio.m4a');

  console.log(`    yt-dlp: baixando áudio de ${source.url}...`);

  // Baixa apenas o áudio (formato m4a/mp4a, sem vídeo)
  const result = spawnSync(ytdlpPath, [
    '--extract-audio',
    '--audio-format', 'm4a',
    '--audio-quality', '64K',        // qualidade suficiente para transcrição
    '--no-playlist',
    '-o', tmpAudio,
    source.url,
  ], { encoding: 'utf8', timeout: 120000 });

  if (result.status !== 0) {
    throw new Error(`yt-dlp saiu com código ${result.status}: ${(result.stderr || '').slice(0, 200)}`);
  }

  // yt-dlp pode adicionar extensão diferente
  const actualAudio = fs.existsSync(tmpAudio) ? tmpAudio
    : fs.existsSync(tmpAudio.replace('.m4a', '.mp4')) ? tmpAudio.replace('.m4a', '.mp4')
    : null;

  if (!actualAudio || !fs.existsSync(actualAudio)) {
    throw new Error('Arquivo de áudio não encontrado após download');
  }

  console.log(`    AssemblyAI: transcrevendo áudio (${Math.round(fs.statSync(actualAudio).size / 1024)}KB)...`);

  try {
    const { AssemblyAI } = require('assemblyai');
    const client = new AssemblyAI({ apiKey: assemblyKey });

    // Upload do arquivo local → URL temporária
    const uploadUrl = await client.files.upload(fs.createReadStream(actualAudio));

    const transcript = await client.transcripts.transcribe({
      audio_url: uploadUrl,
      speech_models: ['universal-2'],
      language_detection: true,
      speaker_labels: true,
    });

    if (transcript.status === 'error') {
      throw new Error(transcript.error || 'Erro desconhecido no AssemblyAI');
    }

    const durationMinutes = transcript.audio_duration
      ? Math.ceil(transcript.audio_duration / 60) : null;

    const fullText  = transcript.text || '';
    const formatted = transcript.utterances
      ? transcript.utterances.map(u => `[Speaker ${u.speaker}] ${u.text}`).join('\n')
      : fullText;

    await saveTranscript({ fullText, formatted }, targetDir, source, videoId, slug, 'assemblyai-ytdlp');
    if (durationMinutes) updateAssemblyAIUsage(durationMinutes);

    // Remove áudio temporário após upload
    try { fs.unlinkSync(actualAudio); } catch (_) {}

    return {
      ...source,
      status: 'success',
      outputPath: path.join('videos', subtype, slug),
      wordCount: fullText.split(/\s+/).length,
      durationMinutes,
      apiUsed: 'assemblyai',
      method: 'ytdlp+assemblyai',
    };
  } catch (err) {
    // Limpa áudio mesmo em erro
    try { fs.unlinkSync(actualAudio); } catch (_) {}
    throw err;
  }
}

// ─── AssemblyAI via audio_url/audio_file ────────────────────────────────────

async function collectWithAssemblyAI(source, targetDir, subtype, slug, videoId, assemblyKey) {
  try {
    const { AssemblyAI } = require('assemblyai');
    const client = new AssemblyAI({ apiKey: assemblyKey });

    const audioSource = source.audio_url
      ? { audio_url: source.audio_url }
      : { audio: fs.createReadStream(source.audio_file) };

    const transcript = await client.transcripts.transcribe({
      ...audioSource,
      speech_models: ['universal-2'],
      language_detection: true,
      speaker_labels: true,
    });

    if (transcript.status === 'error') {
      return { ...source, status: 'failed', error: transcript.error };
    }

    const durationMinutes = transcript.audio_duration
      ? Math.ceil(transcript.audio_duration / 60) : null;

    const fullText  = transcript.text || '';
    const formatted = transcript.utterances
      ? transcript.utterances.map(u => `[Speaker ${u.speaker}] ${u.text}`).join('\n')
      : fullText;

    await saveTranscript({ fullText, formatted }, targetDir, source, videoId, slug, 'assemblyai');
    if (durationMinutes) updateAssemblyAIUsage(durationMinutes);

    return {
      ...source,
      status: 'success',
      outputPath: path.join('videos', subtype, slug),
      wordCount: fullText.split(/\s+/).length,
      durationMinutes,
      apiUsed: 'assemblyai',
      method: 'assemblyai',
    };
  } catch (err) {
    return { ...source, status: 'failed', error: err.message };
  }
}

// ─── Salvar transcrição ─────────────────────────────────────────────────────

async function saveTranscript(transcript, targetDir, source, videoId, slug, method) {
  const date = new Date().toISOString().split('T')[0];

  const mdContent = [
    `---`,
    `title: "${(source.title || videoId || source.id || '').replace(/"/g, "'")}"`,
    `video_id: "${videoId || ''}"`,
    `source_type: video`,
    `method: ${method}`,
    `collected_at: "${date}"`,
    `slug: "${slug}"`,
    ...(videoId ? [`url: "https://www.youtube.com/watch?v=${videoId}"`] : []),
    ...(source.url && !videoId ? [`url: "${source.url}"`] : []),
    `---`,
    ``,
    `# ${source.title || videoId || slug}`,
    ``,
    transcript.formatted || transcript.fullText,
  ].join('\n');

  fs.writeFileSync(path.join(targetDir, 'transcript.md'), mdContent, 'utf8');
  fs.writeFileSync(
    path.join(targetDir, 'metadata.json'),
    JSON.stringify({
      video_id:   videoId || null,
      title:      source.title || null,
      url:        source.url || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : null),
      slug,
      subtype:    source.subtype || 'youtube_main',
      method,
      collected_at: date,
      word_count: (transcript.fullText || '').split(/\s+/).length,
    }, null, 2),
    'utf8'
  );
}

// ─── Utils ──────────────────────────────────────────────────────────────────

function extractVideoId(url) {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

module.exports = { collectYouTube };
