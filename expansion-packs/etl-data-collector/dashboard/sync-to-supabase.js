#!/usr/bin/env node
/**
 * sync-to-supabase.js — ETL Dashboard Sync
 *
 * Lê os arquivos locais SOURCE_INVENTORY.md e COLLECTION-INVENTORY.md
 * e sincroniza o estado com o Supabase para alimentar o dashboard HTML.
 *
 * Uso:
 *   node sync-to-supabase.js                  # Sync todas as mentes
 *   node sync-to-supabase.js gary_vaynerchuk   # Sync mente específica
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MINDS_DIR = path.join(__dirname, '../../../minds');
const INVENTORY_PATH = path.join(__dirname, '../data/COLLECTION-INVENTORY.md');

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados no .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Main ──────────────────────────────────────────────────

async function main() {
  const targetMind = process.argv[2] || null;

  console.log('\n🔄 ETL → Supabase Sync');
  console.log('═'.repeat(50));

  if (targetMind) {
    await syncMind(targetMind);
  } else {
    await syncAllMinds();
  }

  await syncAssemblyAIUsage();
  await syncCollectionLog();

  console.log('\n✅ Sync concluído!');
}

// ─── Sync todas as mentes ─────────────────────────────────

async function syncAllMinds() {
  if (!fs.existsSync(MINDS_DIR)) {
    console.log('⚠️ Pasta minds/ não encontrada');
    return;
  }

  const minds = fs.readdirSync(MINDS_DIR).filter(f =>
    fs.statSync(path.join(MINDS_DIR, f)).isDirectory()
  );

  console.log(`\n📂 Mentes encontradas: ${minds.length}`);

  for (const mind of minds) {
    await syncMind(mind);
  }
}

// ─── Sync uma mente específica ────────────────────────────

async function syncMind(mindId) {
  const mindDir = path.join(MINDS_DIR, mindId);
  const inventoryPath = path.join(mindDir, 'sources', 'SOURCE_INVENTORY.md');
  const metadataPath = path.join(mindDir, 'metadata.yaml');

  if (!fs.existsSync(mindDir)) {
    console.log(`  ⚠️ ${mindId}: pasta não encontrada`);
    return;
  }

  const displayName = mindId
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  // Parsear SOURCE_INVENTORY.md se existir
  let mindData = {
    id: mindId,
    display_name: displayName,
    status: 'pending',
    pipeline_phase: null,
    purpose: null,
    collected_sources: 0,
    total_sources: 0,
    failed_sources: 0,
    total_words: 0,
    audio_minutes: 0,
    sources_by_type: {},
    updated_at: new Date().toISOString(),
  };

  if (fs.existsSync(inventoryPath)) {
    const inv = fs.readFileSync(inventoryPath, 'utf8');
    mindData = { ...mindData, ...parseSourceInventory(inv, mindId) };
  }

  // Sempre complementa/sobrescreve com contagem real do disco
  const diskCount = countSourcesFromDisk(mindDir);
  if (diskCount && diskCount.collected > 0) {
    mindData.collected_sources = diskCount.collected;
    mindData.total_words = diskCount.totalWords;
    mindData.sources_by_type = diskCount.byType;
    if (diskCount.totalSources > 0) mindData.total_sources = diskCount.totalSources;
    if (mindData.status === 'pending') mindData.status = 'collecting';
  }

  // Parsear metadata.yaml se existir
  if (fs.existsSync(metadataPath)) {
    const meta = fs.readFileSync(metadataPath, 'utf8');
    const purposeMatch = meta.match(/purpose:\s*["']?([^"'\n]+)["']?/);
    const phaseMatch = meta.match(/pipeline_phase:\s*["']?([^"'\n]+)["']?/);
    if (purposeMatch) mindData.purpose = purposeMatch[1].trim();
    if (phaseMatch && phaseMatch[1] !== 'null') mindData.pipeline_phase = phaseMatch[1].trim();
  }

  const { error } = await supabase
    .from('etl_minds')
    .upsert(mindData, { onConflict: 'id' });

  if (error) {
    console.log(`  ❌ ${mindId}: ${error.message}`);
  } else {
    console.log(`  ✓ ${mindId}: ${mindData.status} (${mindData.collected_sources}/${mindData.total_sources} fontes)`);
  }
}

// ─── Parse SOURCE_INVENTORY.md ────────────────────────────
// Suporta dois formatos:
//   • Gerado pelo ETL: "Fontes Coletadas: X/Y", "Palavras Totais: N"
//   • Clones existentes (legado): "Status: ⏸️ Não Coletado", "Progresso: X%"

function parseSourceInventory(content, mindId) {
  const result = {
    collected_sources: 0,
    total_sources: 0,
    failed_sources: 0,
    total_words: 0,
    audio_minutes: 0,
    sources_by_type: {},
    status: 'pending',
  };

  // ── Formato ETL (novo) ────────────────────────────────────
  // Status
  if (content.includes('✅ Completo')) result.status = 'complete';
  else if (content.includes('🔨 Em andamento')) result.status = 'collecting';
  else if (content.includes('🌱 Inicial')) result.status = 'pending';

  // Fontes coletadas (formato ETL)
  const collectedMatch = content.match(/Fontes Coletadas:\s*(\d+)\/(\d+)/);
  if (collectedMatch) {
    result.collected_sources = parseInt(collectedMatch[1]);
    result.total_sources = parseInt(collectedMatch[2]);
  }

  // Total de palavras (formato ETL)
  const wordsMatch = content.match(/Palavras Totais:\s*([\d,.]+)/);
  if (wordsMatch) {
    result.total_words = parseInt(wordsMatch[1].replace(/[,\.]/g, ''));
  }

  // Áudio transcrito (formato ETL)
  const audioMatch = content.match(/Áudio Transcrito:\s*(\d+)min/);
  if (audioMatch) result.audio_minutes = parseInt(audioMatch[1]);

  // Count por tipo baseado nos status icons
  const typeMap = {
    'youtube': /##\s*🎥.*YouTube[^\n]*\n[\s\S]*?(?=\n##|\n---|$)/gi,
    'blog': /##\s*📝.*Artigos[^\n]*\n[\s\S]*?(?=\n##|\n---|$)/gi,
    'pdf': /##\s*📚.*(?:Livros|Documentos)[^\n]*\n[\s\S]*?(?=\n##|\n---|$)/gi,
    'podcast': /##\s*🎙️.*(?:Podcasts|Áudio)[^\n]*\n[\s\S]*?(?=\n##|\n---|$)/gi,
    'tiktok': /##\s*(?:TikTok)[^\n]*\n[\s\S]*?(?=\n##|\n---|$)/gi,
    'instagram': /##\s*(?:Instagram)[^\n]*\n[\s\S]*?(?=\n##|\n---|$)/gi,
    'twitter': /##\s*(?:Twitter)[^\n]*\n[\s\S]*?(?=\n##|\n---|$)/gi,
    'linkedin': /##\s*(?:LinkedIn)[^\n]*\n[\s\S]*?(?=\n##|\n---|$)/gi,
  };

  // ── Formato legado (clones existentes) ───────────────────
  // Conta cada entrada de Status no arquivo
  const allStatuses = content.match(/^Status:/gm) || [];
  const pendingCount = (content.match(/⏸️ Não Coletado/g) || []).length;
  const partialCount = (content.match(/✅ Parcialmente Coletado/g) || []).length;
  const collectedCount = (content.match(/✅ Coletado\b/g) || []).length;
  const failedCount = (content.match(/❌/g) || []).length;

  // Só usar contagem legada se o formato ETL não encontrou nada
  if (result.total_sources === 0 && allStatuses.length > 0) {
    result.total_sources = pendingCount + partialCount + collectedCount;
    result.collected_sources = partialCount + collectedCount;
    result.failed_sources = failedCount;
  }

  // Progresso % (formato legado: "Progresso: ██░░ 5%")
  if (result.total_sources === 0) {
    const progressMatch = content.match(/Progresso:.*?(\d+)%/);
    if (progressMatch) {
      // Estimar total de fontes a partir da seção de h3 (### = fonte)
      const h3Count = (content.match(/^### /gm) || []).length;
      result.total_sources = h3Count;
      result.collected_sources = Math.round(h3Count * parseInt(progressMatch[1]) / 100);
    }
  }

  // Material Total (legado: "Material Total: 16KB")
  if (result.total_words === 0) {
    const materialMatch = content.match(/Material Total:\s*([\d.]+)\s*(KB|MB|GB)/i);
    if (materialMatch) {
      const size = parseFloat(materialMatch[1]);
      const unit = materialMatch[2].toUpperCase();
      // Estimativa: 1KB ≈ 150 palavras
      const kb = unit === 'MB' ? size * 1024 : unit === 'GB' ? size * 1024 * 1024 : size;
      result.total_words = Math.round(kb * 150);
    }
  }

  // Status geral (legado)
  if (result.status === 'pending') {
    const progressMatch = content.match(/Progresso:.*?(\d+)%/);
    if (progressMatch && parseInt(progressMatch[1]) > 0) {
      result.status = parseInt(progressMatch[1]) >= 100 ? 'complete' : 'collecting';
    }
  }

  // Count por tipo (legado — olha os títulos das seções h2)
  const sectionMap = {
    'Books': 'pdf', 'Livros': 'pdf',
    'YouTube': 'youtube', 'Vídeos': 'youtube',
    'Podcast': 'podcast', 'Podcasts': 'podcast',
    'Articles': 'article', 'Artigos': 'article', 'Blog': 'article',
    'TikTok': 'tiktok', 'Instagram': 'instagram',
    'Twitter': 'twitter', 'LinkedIn': 'linkedin',
    'Social': 'social', 'Courses': 'course',
    'Newsletters': 'newsletter',
  };

  for (const [section, type] of Object.entries(sectionMap)) {
    const sectionRegex = new RegExp(`## [^\\n]*${section}[^\\n]*\\n([\\s\\S]*?)(?=\\n## |$)`, 'i');
    const sectionMatch = content.match(sectionRegex);
    if (sectionMatch) {
      const h3Count = (sectionMatch[1].match(/^### /gm) || []).length;
      if (h3Count > 0) {
        result.sources_by_type[type] = (result.sources_by_type[type] || 0) + h3Count;
      }
    }
  }

  return result;
}

// ─── Count sources from disk ──────────────────────────────
// Conta pastas/arquivos reais em disco, independente do inventory

function countSourcesFromDisk(mindDir) {
  const sourcesDir = path.join(mindDir, 'sources');
  if (!fs.existsSync(sourcesDir)) return null;

  let collected = 0;
  let totalWords = 0;
  const byType = {};

  // Conta subpastas que contêm um arquivo específico
  function countDirs(dir, checkFile) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).filter(f => {
      try {
        const fp = path.join(dir, f);
        return fs.statSync(fp).isDirectory() && fs.existsSync(path.join(fp, checkFile));
      } catch (_) { return false; }
    });
  }

  // Soma palavras de todos os arquivos de texto em subpastas de um dir
  function sumWords(dir, filename) {
    if (!fs.existsSync(dir)) return 0;
    let words = 0;
    fs.readdirSync(dir).forEach(f => {
      try {
        const fp = path.join(dir, f);
        if (!fs.statSync(fp).isDirectory()) return;
        const textFile = path.join(fp, filename);
        if (fs.existsSync(textFile)) {
          words += fs.readFileSync(textFile, 'utf8').split(/\s+/).length;
        }
      } catch (_) {}
    });
    return words;
  }

  // Livros: sources/books/{slug}/text.md
  const booksDir = path.join(sourcesDir, 'books');
  const books = countDirs(booksDir, 'text.md');
  if (books.length > 0) {
    byType.pdf = books.length;
    collected += books.length;
    totalWords += sumWords(booksDir, 'text.md');
  }

  // YouTube: sources/videos/{subtype}/{slug}/transcript.md
  const videosDir = path.join(sourcesDir, 'videos');
  if (fs.existsSync(videosDir)) {
    fs.readdirSync(videosDir).forEach(subtype => {
      try {
        const subtypeDir = path.join(videosDir, subtype);
        if (!fs.statSync(subtypeDir).isDirectory()) return;
        const vids = countDirs(subtypeDir, 'transcript.md');
        if (vids.length > 0) {
          byType.youtube = (byType.youtube || 0) + vids.length;
          collected += vids.length;
          totalWords += sumWords(subtypeDir, 'transcript.md');
        }
      } catch (_) {}
    });
  }

  // Artigos: sources/articles/{slug}/article.md
  const articlesDir = path.join(sourcesDir, 'articles');
  const articles = countDirs(articlesDir, 'article.md');
  if (articles.length > 0) {
    byType.article = articles.length;
    collected += articles.length;
    totalWords += sumWords(articlesDir, 'article.md');
  }

  // Podcasts: sources/podcasts/{subtype}/{slug}/transcript.md
  const podcastsDir = path.join(sourcesDir, 'podcasts');
  if (fs.existsSync(podcastsDir)) {
    fs.readdirSync(podcastsDir).forEach(subtype => {
      try {
        const subtypeDir = path.join(podcastsDir, subtype);
        if (!fs.statSync(subtypeDir).isDirectory()) return;
        const eps = countDirs(subtypeDir, 'transcript.md');
        if (eps.length > 0) {
          byType.podcast = (byType.podcast || 0) + eps.length;
          collected += eps.length;
          totalWords += sumWords(subtypeDir, 'transcript.md');
        }
      } catch (_) {}
    });
  }

  // Social: sources/social/{platform}/*.md
  // Conta cada plataforma como 1 fonte (igual ao batch), mas soma todas as palavras
  const socialDir = path.join(sourcesDir, 'social');
  if (fs.existsSync(socialDir)) {
    fs.readdirSync(socialDir).forEach(platform => {
      try {
        const platformDir = path.join(socialDir, platform);
        if (!fs.statSync(platformDir).isDirectory()) return;
        const posts = fs.readdirSync(platformDir).filter(f =>
          f.endsWith('.md') && f !== 'README.md' && f !== 'index.md'
        );
        if (posts.length > 0) {
          byType[platform] = posts.length; // guarda count real para info
          collected += 1;                   // 1 fonte por plataforma (= 1 batch entry)
          posts.forEach(p => {
            try {
              totalWords += fs.readFileSync(path.join(platformDir, p), 'utf8').split(/\s+/).length;
            } catch (_) {}
          });
        }
      } catch (_) {}
    });
  }

  // Lê total_sources do tier1_batch.yaml se existir
  let totalSources = 0;
  const batchPath = path.join(sourcesDir, 'tier1_batch.yaml');
  if (fs.existsSync(batchPath)) {
    try {
      const yaml = require('js-yaml');
      const batch = yaml.load(fs.readFileSync(batchPath, 'utf8'));
      totalSources = (batch.sources || []).length;
    } catch (_) {}
  }

  return { collected, totalWords, byType, totalSources };
}

// ─── Sync usage AssemblyAI ────────────────────────────────

async function syncAssemblyAIUsage() {
  if (!fs.existsSync(INVENTORY_PATH)) return;

  const content = fs.readFileSync(INVENTORY_PATH, 'utf8');

  const usedMatch = content.match(/\*\*Utilizado pré-gravado:\*\* (\d+)h (\d+)min/);
  if (!usedMatch) return;

  const minutesUsed = parseInt(usedMatch[1]) * 60 + parseInt(usedMatch[2]);
  if (minutesUsed === 0) return;

  const { error } = await supabase.from('etl_api_usage').insert({
    api_name: 'assemblyai',
    operation: 'sync-snapshot',
    units_used: minutesUsed / 60,
    unit_type: 'hours',
    logged_at: new Date().toISOString(),
  });

  if (!error) {
    console.log(`\n  ✓ AssemblyAI: ${(minutesUsed / 60).toFixed(1)}h sincronizado`);
  }
}

// ─── Sync log de coletas ──────────────────────────────────

async function syncCollectionLog() {
  if (!fs.existsSync(INVENTORY_PATH)) return;

  const content = fs.readFileSync(INVENTORY_PATH, 'utf8');

  // Encontra a tabela de log
  const logSection = content.match(/## 📋 Log de Coletas.*\n\n\|.+\|\n\|[-| ]+\|\n([\s\S]+?)(?:\n---|\n##|$)/);
  if (!logSection) return;

  const rows = logSection[1].split('\n').filter(l => l.startsWith('|') && !l.includes('—'));
  if (rows.length === 0) return;

  // Normaliza status do inventory para valores esperados pelo dashboard
  function normalizeStatus(raw) {
    if (!raw) return null;
    const s = raw.toLowerCase().replace(/[✓✗⚠️]/g, '').trim();
    if (s.includes('coletado') || s.includes('success') || s.includes('ok')) return 'success';
    if (s.includes('falh') || s.includes('erro') || s.includes('fail')) return 'failed';
    if (s.includes('pulado') || s.includes('skip')) return 'skipped';
    if (s.includes('parcial') || s.includes('partial')) return 'partial';
    return 'success'; // default: se tem entrada no log, foi coletado
  }

  const entries = rows.map(row => {
    const cols = row.split('|').map(c => c.trim()).filter(Boolean);
    if (cols.length < 7) return null;
    return {
      logged_at: cols[0] ? new Date(cols[0]).toISOString() : new Date().toISOString(),
      mind_id: cols[1] || null,
      source_type: cols[2] || null,
      title: cols[3] || null,
      duration_or_size: cols[4] || null,
      api_used: cols[5] || null,
      plan: cols[6] || 'free',
      status: normalizeStatus(cols[7]),
    };
  }).filter(Boolean);

  if (entries.length === 0) return;

  const { error } = await supabase.from('etl_collection_log').upsert(entries);
  if (!error) {
    console.log(`  ✓ Log: ${entries.length} entradas sincronizadas`);
  }
}

main().catch(err => {
  console.error('\n❌ Erro:', err.message);
  process.exit(1);
});
