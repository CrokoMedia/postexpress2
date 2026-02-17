/**
 * Scraper do blog garyvaynerchuk.com via Apify website-content-crawler
 * Salva resultados em sources/articles/ com formato padronizado
 */

const fs   = require('fs');
const path = require('path');
const https = require('https');

const APIFY_TOKEN   = 'apify_api_DQldil0xAhBSMVz46VSAVk3cinxQjo4DTOMv';
const OUTPUT_DIR    = __dirname;
const ACTOR_ID      = 'apify~website-content-crawler';
const BLOG_URL      = 'https://garyvaynerchuk.com/blog/';

// Configuração do ator
const INPUT = {
  startUrls: [{ url: BLOG_URL }],
  maxCrawlPages: 300,          // limite de páginas
  maxCrawlDepth: 3,
  crawlerType: 'cheerio',      // mais rápido, sem JS
  includeUrlGlobs: [
    { glob: 'https://garyvaynerchuk.com/**' }
  ],
  excludeUrlGlobs: [
    { glob: 'https://garyvaynerchuk.com/wp-*' },
    { glob: 'https://garyvaynerchuk.com/wp-json/**' },
    { glob: 'https://garyvaynerchuk.com/tag/**' },
    { glob: 'https://garyvaynerchuk.com/category/**' },
    { glob: 'https://garyvaynerchuk.com/author/**' },
    { glob: 'https://garyvaynerchuk.com/?*' },
    { glob: 'https://garyvaynerchuk.com/videos/**' },
    { glob: 'https://garyvaynerchuk.com/tv/**' },
    { glob: 'https://garyvaynerchuk.com/podcast/**' },
    { glob: 'https://garyvaynerchuk.com/shop/**' },
    { glob: 'https://garyvaynerchuk.com/newsletter/**' },
    { glob: 'https://garyvaynerchuk.com/contact/**' }
  ],
  removeCookieWarnings: true,
  clickElementsCssSelector: '',
  htmlTransformer: 'readableText',
  readableTextCharThreshold: 500,  // mínimo 500 chars para contar como conteúdo
  saveHtml: false,
  saveMarkdown: true,
};

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

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
    .replace(/^-|-$/g, '');
}

function saveArticle(item) {
  const title = item.metadata?.title || item.title || 'sem-titulo';
  const url   = item.url || item.metadata?.url || '';
  const text  = item.markdown || item.text || '';
  const publishedAt = item.metadata?.datePublished || '';
  const tags  = item.metadata?.keywords || [];

  if (!text || text.length < 300) {
    return null; // skip artigos muito curtos
  }

  const slug = slugify(title);
  if (!slug) return null;

  const filePath = path.join(OUTPUT_DIR, `${slug}.md`);

  // Não sobrescrever se já existe
  if (fs.existsSync(filePath)) {
    return `SKIP:${slug}`;
  }

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
  return slug;
}

async function pollRun(runId) {
  while (true) {
    const run = await apifyRequest('GET', `/v2/actor-runs/${runId}`);
    const status = run.data?.status;
    const ts = new Date().toLocaleTimeString('pt-BR');
    console.log(`[${ts}] Status: ${status}`);

    if (status === 'SUCCEEDED') return run.data;
    if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(status)) {
      throw new Error(`Run terminou com status: ${status}`);
    }
    await new Promise(r => setTimeout(r, 15000)); // 15s
  }
}

async function fetchDataset(datasetId) {
  console.log(`\n📥 Baixando resultados do dataset ${datasetId}...`);
  let offset = 0;
  const limit = 100;
  const all = [];

  while (true) {
    const res = await apifyRequest('GET', `/v2/datasets/${datasetId}/items?limit=${limit}&offset=${offset}`);
    const items = res.data || res;
    if (!Array.isArray(items) || items.length === 0) break;
    all.push(...items);
    console.log(`   Baixados: ${all.length} itens`);
    if (items.length < limit) break;
    offset += limit;
  }

  return all;
}

async function main() {
  console.log('🚀 Iniciando scraping do blog garyvaynerchuk.com\n');
  console.log(`   URL: ${BLOG_URL}`);
  console.log(`   Ator: ${ACTOR_ID}`);
  console.log(`   Max páginas: ${INPUT.maxCrawlPages}\n`);

  // 1. Iniciar o run
  console.log('▶️  Iniciando ator...');
  const run = await apifyRequest('POST', `/v2/acts/${ACTOR_ID}/runs`, INPUT);

  if (!run.data?.id) {
    console.error('❌ Erro ao iniciar ator:', JSON.stringify(run, null, 2));
    process.exit(1);
  }

  const runId = run.data.id;
  const datasetId = run.data.defaultDatasetId;
  console.log(`✅ Run iniciado: ${runId}`);
  console.log(`   Dataset: ${datasetId}`);
  console.log(`   Acompanhe em: https://console.apify.com/runs/${runId}\n`);

  // Salvar IDs para recuperar depois se necessário
  fs.writeFileSync(
    path.join(__dirname, 'apify-run-ids.json'),
    JSON.stringify({ runId, datasetId, startedAt: new Date().toISOString() }, null, 2)
  );

  // 2. Aguardar conclusão
  console.log('⏳ Aguardando conclusão (pode demorar 5-15 min)...\n');
  const completedRun = await pollRun(runId);

  console.log(`\n✅ Run concluído!`);
  console.log(`   Items: ${completedRun.stats?.requestsFinished || 0}`);
  console.log(`   Tempo: ${Math.round((completedRun.stats?.runTimeSecs || 0) / 60)} min\n`);

  // 3. Baixar resultados
  const items = await fetchDataset(datasetId);
  console.log(`\n📄 Total de páginas coletadas: ${items.length}`);

  // 4. Salvar artigos
  console.log('\n💾 Salvando artigos...\n');
  let saved = 0;
  let skipped = 0;
  let tooShort = 0;

  for (const item of items) {
    const result = saveArticle(item);
    if (result === null) {
      tooShort++;
    } else if (result.startsWith('SKIP:')) {
      skipped++;
    } else {
      saved++;
      console.log(`   ✅ ${result}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`📊 RESUMO:`);
  console.log(`   ✅ Artigos salvos: ${saved}`);
  console.log(`   ⏭️  Já existiam: ${skipped}`);
  console.log(`   📝 Conteúdo curto (ignorado): ${tooShort}`);
  console.log(`   📁 Pasta: ${OUTPUT_DIR}`);
  console.log('='.repeat(50));
}

main().catch(err => {
  console.error('\n❌ Erro:', err.message);
  process.exit(1);
});
