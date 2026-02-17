#!/usr/bin/env node
/**
 * mistral-vision-enricher.js — ETL Data Collector
 *
 * Enriquece posts do Instagram (Sidecar + Image) com OCR via Mistral Vision.
 *
 * Fluxo:
 *   1. Escaneia .md do Instagram filtrados por content_type Sidecar/Image
 *   2. Busca URLs das imagens via Apify (instagram-scraper, directUrls)
 *   3. Envia imagens ao Mistral Vision (pixtral-12b-latest)
 *   4. Escreve texto extraído de volta no .md original
 *
 * Uso:
 *   node enrichers/mistral-vision-enricher.js <sources-dir> [opções]
 *
 * Exemplos:
 *   node enrichers/mistral-vision-enricher.js minds/gary_vaynerchuk/sources
 *   node enrichers/mistral-vision-enricher.js minds/gary_vaynerchuk/sources --dry-run
 *   node enrichers/mistral-vision-enricher.js minds/gary_vaynerchuk/sources --limit=10
 *   node enrichers/mistral-vision-enricher.js minds/gary_vaynerchuk/sources --only-sidecars
 *
 * Variáveis de ambiente (carregadas de .env):
 *   APIFY_API_TOKEN  — token do Apify
 *   MISTRAL_API_KEY  — chave da API Mistral
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const https = require('https');

// ─── Carregar .env ─────────────────────────────────────────────────────────

(function loadEnv() {
  const envPaths = [
    path.resolve(__dirname, '../../../.env'),
    path.resolve(__dirname, '../../.env'),
    path.resolve(__dirname, '../.env'),
    path.resolve(process.cwd(), '.env'),
  ];
  for (const p of envPaths) {
    if (fs.existsSync(p)) {
      const lines = fs.readFileSync(p, 'utf8').split('\n');
      for (const line of lines) {
        const m = line.match(/^([^#=\s]+)\s*=\s*(.*)$/);
        if (m && !process.env[m[1]]) {
          process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
        }
      }
      break;
    }
  }
})();

// ─── Args ──────────────────────────────────────────────────────────────────

const args       = process.argv.slice(2);
const sourceDir  = args.find(a => !a.startsWith('--'));
const dryRun     = args.includes('--dry-run');
const onlySidecars = args.includes('--only-sidecars');
const limitArg   = args.find(a => a.startsWith('--limit='));
const LIMIT      = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;

if (!sourceDir) {
  console.error('Uso: node mistral-vision-enricher.js <sources-dir> [--dry-run] [--limit=N] [--only-sidecars]');
  console.error('Exemplo: node mistral-vision-enricher.js minds/gary_vaynerchuk/sources --limit=10');
  process.exit(1);
}

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;
const MISTRAL_KEY = process.env.MISTRAL_API_KEY;

if (!APIFY_TOKEN) { console.error('❌ APIFY_API_TOKEN não encontrada'); process.exit(1); }
if (!MISTRAL_KEY) { console.error('❌ MISTRAL_API_KEY não encontrada'); process.exit(1); }

// ─── Constantes ────────────────────────────────────────────────────────────

const MISTRAL_MODEL    = 'pixtral-12b-latest';
const APIFY_ACTOR      = 'apify/instagram-scraper';
const APIFY_BATCH_SIZE = 5;    // posts por chamada Apify (directUrls)
const MISTRAL_DELAY_MS = 4000; // pausa base entre chamadas Mistral
const APIFY_DELAY_MS   = 2000; // pausa entre chamadas Apify
const MISTRAL_MAX_RETRIES = 4; // tentativas com backoff exponencial

const TYPES_TO_ENRICH  = onlySidecars
  ? ['Sidecar']
  : ['Sidecar', 'Image'];

// ─── Utilitários ───────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function postJson(hostname, pathStr, body, headers) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname,
      path: pathStr,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers },
    };
    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: JSON.parse(Buffer.concat(chunks).toString()),
          });
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// ─── Parse de frontmatter .md ──────────────────────────────────────────────

function parseFrontmatter(content) {
  const m = content.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const meta = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*"?([^"]*)"?/);
    if (kv) meta[kv[1]] = kv[2].trim();
  }
  return meta;
}

// ─── Scan de posts Instagram ────────────────────────────────────────────────

function scanInstagramPosts(instagramDir) {
  const files = fs.readdirSync(instagramDir).filter(f => f.endsWith('.md') && f !== '_INDEX.md');
  const posts = [];

  for (const file of files) {
    const filePath = path.join(instagramDir, file);
    const content  = fs.readFileSync(filePath, 'utf8');
    const meta     = parseFrontmatter(content);

    posts.push({
      filePath,
      slug:         meta.slug || file.replace('.md', ''),
      url:          meta.url || '',
      content_type: meta.content_type || '',
      likes:        parseInt(meta.likes || '0', 10),
      hasVision:    content.includes('## Extração Visual (Mistral)'),
      raw:          content,
    });
  }

  return posts;
}

// ─── Apify: buscar URLs de imagens ─────────────────────────────────────────

async function fetchImagesViaApify(postUrls) {
  const { ApifyClient } = require('apify-client');
  const client = new ApifyClient({ token: APIFY_TOKEN });

  console.log(`    Apify: buscando imagens de ${postUrls.length} posts...`);

  const run = await client.actor(APIFY_ACTOR).call({
    directUrls: postUrls,
    resultsType: 'posts',
    proxy: { useApifyProxy: true },
  });

  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  const imageMap  = {};

  const debug = process.env.ETL_DEBUG === '1';

  for (const item of (items || [])) {
    const postUrl = item.url || (item.shortCode ? `https://www.instagram.com/p/${item.shortCode}/` : null);
    if (!postUrl) continue;

    if (debug) {
      const fields = Object.keys(item).join(', ');
      console.log(`    [DEBUG] ${item.shortCode || postUrl} — campos: ${fields}`);
      if (item.type) console.log(`    [DEBUG]   type=${item.type}, displayUrl=${!!item.displayUrl}, images=${JSON.stringify(item.images?.length)}, sidecarImages=${JSON.stringify(item.sidecarImages?.length)}`);
    }

    const images = [];

    // Sidecar alternativo: sidecarImages (campo mais comum no apify/instagram-scraper)
    if (Array.isArray(item.sidecarImages) && item.sidecarImages.length > 0) {
      for (const img of item.sidecarImages) {
        const imgUrl = typeof img === 'string' ? img : (img.displayUrl || img.url || img.src);
        if (imgUrl) images.push(imgUrl);
      }
    }

    // Sidecar: campo images[] com displayUrl ou url
    if (images.length === 0 && Array.isArray(item.images) && item.images.length > 0) {
      for (const img of item.images) {
        const imgUrl = img.displayUrl || img.url || img.src;
        if (imgUrl) images.push(imgUrl);
      }
    }

    // childPosts (formato alternativo de carrossel)
    if (images.length === 0 && Array.isArray(item.childPosts) && item.childPosts.length > 0) {
      for (const child of item.childPosts) {
        const imgUrl = child.displayUrl || child.url;
        if (imgUrl) images.push(imgUrl);
      }
    }

    // Image simples: displayUrl
    if (images.length === 0 && item.displayUrl) {
      images.push(item.displayUrl);
    }

    // Normaliza URL da chave (remove trailing slash inconsistente)
    const key = postUrl.replace(/\/$/, '');
    imageMap[key] = images;

    // Também mapeia pela URL original que passamos
    for (const orig of postUrls) {
      if (orig.replace(/\/$/, '') === key) {
        imageMap[orig] = images;
      }
    }
  }

  return imageMap;
}

// ─── Mistral Vision: extrair texto ─────────────────────────────────────────

async function callMistralWithRetry(body, attempt = 1) {
  const result = await postJson(
    'api.mistral.ai',
    '/v1/chat/completions',
    body,
    { Authorization: `Bearer ${MISTRAL_KEY}` },
  );

  if (result.status === 429) {
    if (attempt > MISTRAL_MAX_RETRIES) {
      throw new Error(`Mistral API erro 429 após ${MISTRAL_MAX_RETRIES} tentativas (rate limit)`);
    }
    // Honora Retry-After se presente, senão backoff exponencial: 15s, 30s, 60s, 120s
    const retryAfterHeader = result.headers?.['retry-after'];
    const waitMs = retryAfterHeader
      ? parseInt(retryAfterHeader, 10) * 1000
      : Math.pow(2, attempt + 2) * 3750; // 15s, 30s, 60s, 120s
    process.stdout.write(`[429 aguardando ${Math.round(waitMs/1000)}s...] `);
    await sleep(waitMs);
    return callMistralWithRetry(body, attempt + 1);
  }

  if (result.status !== 200) {
    throw new Error(`Mistral API erro ${result.status}: ${JSON.stringify(result.body).slice(0, 200)}`);
  }

  return result;
}

async function extractTextWithMistral(imageUrls) {
  const contentParts = [];

  // Mistral Vision aceita URLs públicas diretamente — não precisa baixar.
  // Instagram CDN (scontent.*) normalmente é acessível publicamente por horas.
  for (const imgUrl of imageUrls) {
    contentParts.push({ type: 'image_url', image_url: imgUrl });
  }

  // Prompt de extração de texto
  contentParts.push({
    type: 'text',
    text: [
      'Você é um extrator de texto especializado em posts do Instagram.',
      'Extraia TODO o texto visível nesta(s) imagem(ns):',
      '- Títulos, subtítulos e corpo do texto',
      '- Frases de impacto, quotes, bullets',
      '- Textos em overlay, banners, etiquetas',
      '- Se houver múltiplos slides (carrossel), numere: [Slide 1], [Slide 2]...',
      '- Inclua SOMENTE o texto extraído, sem comentários adicionais',
      '- Se não houver texto significativo, responda apenas: [sem texto]',
    ].join('\n'),
  });

  const result = await callMistralWithRetry({
    model: MISTRAL_MODEL,
    messages: [{ role: 'user', content: contentParts }],
    max_tokens: 2000,
    temperature: 0.1,
  });

  const text = result.body?.choices?.[0]?.message?.content || '';
  if (text.trim() === '[sem texto]' || text.trim() === '') return null;
  return text.trim();
}

// ─── Escrever extração no .md ───────────────────────────────────────────────

function appendVisionExtraction(filePath, imageUrls, extractedText) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Remove extração anterior se existir
  const cleaned = content.replace(/\n---\n## Extração Visual \(Mistral\)[\s\S]*$/, '');

  const imageSection = imageUrls.length > 0
    ? `\n**Imagens processadas:** ${imageUrls.length}\n`
    : '';

  const appended = [
    cleaned.trimEnd(),
    '',
    '---',
    '## Extração Visual (Mistral)',
    '',
    `> Extraído em ${new Date().toISOString().split('T')[0]} via Mistral Vision (${MISTRAL_MODEL})`,
    imageSection,
    extractedText,
    '',
  ].join('\n');

  fs.writeFileSync(filePath, appended, 'utf8');
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const absSourceDir   = path.resolve(sourceDir);
  const instagramDir   = path.join(absSourceDir, 'social', 'instagram');

  if (!fs.existsSync(instagramDir)) {
    console.error(`❌ Diretório não encontrado: ${instagramDir}`);
    process.exit(1);
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  Mistral Vision Enricher — ETL Data Collector');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`📁 Fonte: ${instagramDir}`);
  console.log(`🤖 Modelo: ${MISTRAL_MODEL}`);
  console.log(`📦 Tipos: ${TYPES_TO_ENRICH.join(', ')}`);
  if (dryRun)  console.log('🏃 Modo: DRY RUN (nenhum dado será processado)');
  if (LIMIT !== Infinity) console.log(`🔢 Limite: ${LIMIT} posts`);

  // 1. Scan
  const all   = scanInstagramPosts(instagramDir);
  const queue = all
    .filter(p => TYPES_TO_ENRICH.includes(p.content_type) && !p.hasVision && p.url)
    .sort((a, b) => b.likes - a.likes) // maiores primeiro
    .slice(0, LIMIT);

  const alreadyDone = all.filter(p => TYPES_TO_ENRICH.includes(p.content_type) && p.hasVision).length;

  console.log(`\n📊 Posts Instagram: ${all.length} total`);
  console.log(`   ✅ Já enriquecidos: ${alreadyDone}`);
  console.log(`   🎯 Na fila: ${queue.length}`);

  if (queue.length === 0) {
    console.log('\n✨ Todos os posts já foram processados!');
    return;
  }

  if (dryRun) {
    console.log('\n📋 Posts que seriam processados:');
    queue.forEach((p, i) => {
      console.log(`  ${i+1}. ${p.slug} (${p.content_type}, ${p.likes.toLocaleString()} likes)`);
    });
    return;
  }

  // 2. Processa em lotes
  let enriched = 0;
  let skipped  = 0;
  let errors   = 0;

  for (let i = 0; i < queue.length; i += APIFY_BATCH_SIZE) {
    const batch = queue.slice(i, i + APIFY_BATCH_SIZE);
    const batchNum = Math.floor(i / APIFY_BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(queue.length / APIFY_BATCH_SIZE);

    console.log(`\n🔄 Lote ${batchNum}/${totalBatches} — ${batch.length} posts`);

    // 2a. Busca imagens via Apify
    let imageMap = {};
    try {
      imageMap = await fetchImagesViaApify(batch.map(p => p.url));
    } catch (err) {
      console.error(`  ⚠️  Apify erro no lote ${batchNum}: ${err.message}`);
      errors += batch.length;
      await sleep(APIFY_DELAY_MS);
      continue;
    }

    await sleep(APIFY_DELAY_MS);

    // 2b. Processa cada post do lote
    for (const post of batch) {
      const images = imageMap[post.url] || imageMap[post.url.replace(/\/$/, '')] || [];

      if (images.length === 0) {
        console.log(`  ⚠️  ${post.slug}: sem imagens retornadas pelo Apify`);
        skipped++;
        continue;
      }

      process.stdout.write(`  📷 ${post.slug} (${images.length} img) → Mistral... `);

      try {
        const text = await extractTextWithMistral(images);

        if (!text) {
          console.log('sem texto');
          skipped++;
        } else {
          appendVisionExtraction(post.filePath, images, text);
          console.log(`✅ ${text.split(/\s+/).length} palavras`);
          enriched++;
        }
      } catch (err) {
        console.log(`❌ ${err.message.slice(0, 80)}`);
        errors++;
      }

      await sleep(MISTRAL_DELAY_MS);
    }
  }

  // 3. Resumo
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  Resumo final');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  ✅ Enriquecidos: ${enriched}`);
  console.log(`  ⏭️  Sem imagem/texto: ${skipped}`);
  console.log(`  ❌ Erros: ${errors}`);
  console.log(`  📁 Salvo em: ${instagramDir}`);
  console.log('');
}

main().catch(err => {
  console.error('\n💥 Erro fatal:', err.message);
  process.exit(1);
});
