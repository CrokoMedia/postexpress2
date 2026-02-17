/**
 * Scrape das URLs restantes (231 - 400)
 */

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const APIFY_TOKEN = 'apify_api_DQldil0xAhBSMVz46VSAVk3cinxQjo4DTOMv';
const DIR         = __dirname;

const allUrls = JSON.parse(fs.readFileSync(path.join(DIR, 'article-urls.json'), 'utf8'));

// Pegar as restantes (200+)
const remaining = allUrls.slice(200);
console.log(`📋 URLs restantes: ${remaining.length}`);

function slugify(text) {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 80).replace(/^-|-$/g, '');
}

// Verificar quais já foram salvas
const existingFiles = new Set(
  fs.readdirSync(DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace('.md', ''))
);

const toScrape = remaining.filter(url => {
  const slug = url.replace(/\/$/, '').split('/').pop();
  return !existingFiles.has(slug);
});

console.log(`🆕 Ainda precisam de scrape: ${toScrape.length}`);

if (toScrape.length === 0) {
  console.log('✅ Tudo já extraído!');
  process.exit(0);
}

function apifyRequest(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(`https://api.apify.com${urlPath}?token=${APIFY_TOKEN}`);
    const data = body ? JSON.stringify(body) : null;

    const options = {
      method,
      hostname: url.hostname,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    };

    const req = https.request(options, res => {
      let chunks = '';
      res.on('data', d => chunks += d);
      res.on('end', () => {
        try { resolve(JSON.parse(chunks)); }
        catch(e) { resolve(chunks); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  const INPUT = {
    startUrls: toScrape.map(url => ({ url })),
    maxCrawlDepth: 0,
    crawlerType: 'cheerio',
    htmlTransformer: 'readableText',
    readableTextCharThreshold: 300,
    saveMarkdown: true,
    saveHtml: false,
    removeCookieWarnings: true,
  };

  console.log(`\n🚀 Iniciando Apify run 3 com ${toScrape.length} URLs...`);
  const run = await apifyRequest('POST', '/v2/acts/apify~website-content-crawler/runs', INPUT);

  if (!run.data?.id) {
    console.error('❌ Erro:', JSON.stringify(run, null, 2));
    process.exit(1);
  }

  const runId = run.data.id;
  const datasetId = run.data.defaultDatasetId;
  console.log(`✅ Run iniciado: ${runId}`);
  console.log(`   Dataset: ${datasetId}`);
  console.log(`   Console: https://console.apify.com/runs/${runId}`);

  fs.writeFileSync(
    path.join(DIR, 'apify-run3-ids.json'),
    JSON.stringify({ runId, datasetId, urlCount: toScrape.length, startedAt: new Date().toISOString() }, null, 2)
  );

  console.log('\n⏳ Aguardando conclusão...\n');
  while (true) {
    const r = await apifyRequest('GET', `/v2/actor-runs/${runId}`);
    const status = r.data?.status;
    const finished = r.data?.stats?.requestsFinished || 0;
    const ts = new Date().toLocaleTimeString('pt-BR');
    console.log(`[${ts}] ${status} | Páginas: ${finished}`);

    if (status === 'SUCCEEDED') { console.log('\n✅ Run concluído!'); break; }
    if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(status)) throw new Error(`Run: ${status}`);
    await new Promise(r => setTimeout(r, 20000));
  }

  // Baixar resultados
  console.log('\n📥 Baixando resultados...');
  let offset = 0;
  const limit = 100;
  let saved = 0, tooShort = 0;

  while (true) {
    const res = await apifyRequest('GET', `/v2/datasets/${datasetId}/items?limit=${limit}&offset=${offset}`);
    const items = res.data || res;
    if (!Array.isArray(items) || items.length === 0) break;

    for (const item of items) {
      const title = item.metadata?.title || item.title || '';
      const url   = item.url || item.metadata?.url || '';
      const text  = item.markdown || item.text || '';
      const publishedAt = item.metadata?.datePublished || '';
      const tags  = item.metadata?.keywords || [];

      if (!text || text.length < 300) { tooShort++; continue; }

      const slug = slugify(title) || slugify(url.split('/').filter(Boolean).pop());
      if (!slug) { tooShort++; continue; }

      const filePath = path.join(DIR, `${slug}.md`);
      if (fs.existsSync(filePath)) continue;

      const md = `---
title: "${title.replace(/"/g, '\\"')}"
canonical_url: "${url}"
source_type: article
collected_at: "${new Date().toISOString().split('T')[0]}"
published_at: "${publishedAt}"
slug: "${slug}"
tags: [${tags.map(t => `"${t}"`).join(', ')}]
---

# ${title}

> Fonte: ${url}

${text}
`;
      fs.writeFileSync(filePath, md, 'utf8');
      saved++;
      console.log(`   ✅ ${slug}`);
    }

    if (items.length < limit) break;
    offset += limit;
  }

  console.log('\n' + '='.repeat(50));
  console.log(`📊 RESUMO:`);
  console.log(`   ✅ Artigos salvos: ${saved}`);
  console.log(`   📝 Conteúdo curto (ignorado): ${tooShort}`);
  console.log('='.repeat(50));
}

main().catch(err => {
  console.error('\n❌ Erro:', err.message);
  process.exit(1);
});
