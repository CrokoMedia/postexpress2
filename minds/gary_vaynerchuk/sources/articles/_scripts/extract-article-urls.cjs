/**
 * Extrai URLs de artigos reais das páginas de arquivo já coletadas,
 * depois inicia novo run do Apify só com essas URLs
 */

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const APIFY_TOKEN = 'apify_api_DQldil0xAhBSMVz46VSAVk3cinxQjo4DTOMv';
const DIR         = __dirname;

// Padrões que NÃO são artigos
const EXCLUDE = [
  /\/blog\/?$/,
  /\/topics\//,
  /\/tag\//,
  /\/category\//,
  /\/author\//,
  /\/page\/\d+/,
  /archives/,
  /\?/,
  /\/videos\//,
  /\/tv\//,
  /\/podcast\/?$/,
  /\/shop\//,
  /\/newsletter\//,
  /\/contact\//,
  /\/wp-/,
  /\/feed\//,
  /www\.entrepreneur\.com/,
  /youtube\.com/,
  /instagram\.com/,
  /twitter\.com/,
  /linkedin\.com/,
  /garyvee\.com/,
  /veefriends\.com/,
];

function isArticleUrl(url) {
  if (!url.startsWith('https://garyvaynerchuk.com/')) return false;
  const path = url.replace('https://garyvaynerchuk.com', '');
  // precisa ter um slug (não só /)
  if (path === '/' || path === '') return false;
  // slug com letras e hífens
  if (!/^\/[a-z0-9]/.test(path)) return false;
  return !EXCLUDE.some(p => p.test(url));
}

function extractUrls(content) {
  const matches = content.match(/https:\/\/garyvaynerchuk\.com\/[a-z0-9][^)\s"'\]>]*/g) || [];
  return matches
    .map(u => u.replace(/[/,.]$/, '').split(' ')[0])  // limpar trailing
    .filter(isArticleUrl);
}

// 1. Ler todos os arquivos de arquivo
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.md') && f !== 'README.md');
const allUrls = new Set();
let existingSlugs = new Set();

// Já existe o artigo original (não re-scrape)
existingSlugs.add('creating-content-that-builds-your-personal-brand');

for (const file of files) {
  const content = fs.readFileSync(path.join(DIR, file), 'utf8');
  const urls = extractUrls(content);
  urls.forEach(u => allUrls.add(u));

  // Registrar slugs já existentes dos arquivos de artigos
  const m = content.match(/^canonical_url: "(.+)"$/m);
  if (m) {
    const slug = m[1].replace(/\/$/, '').split('/').pop();
    existingSlugs.add(slug);
  }
}

console.log(`📄 Arquivos lidos: ${files.length}`);
console.log(`🔗 URLs únicas de artigos encontradas: ${allUrls.size}`);

// 2. Filtrar URLs que já têm arquivo gerado
const knownArchiveSlugs = new Set(
  files.map(f => f.replace('.md', ''))
);

const newUrls = [...allUrls].filter(url => {
  const slug = url.replace(/\/$/, '').split('/').pop();
  return !knownArchiveSlugs.has(slug) && !existingSlugs.has(slug);
});

console.log(`🆕 URLs novas (sem arquivo ainda): ${newUrls.length}\n`);

// Mostrar amostra
newUrls.slice(0, 20).forEach(u => console.log(`   ${u}`));
if (newUrls.length > 20) console.log(`   ... e mais ${newUrls.length - 20}`);

// Salvar lista
fs.writeFileSync(path.join(DIR, 'article-urls.json'), JSON.stringify(newUrls, null, 2));
console.log(`\n💾 Salvo em article-urls.json`);

// 3. Iniciar novo run do Apify
if (newUrls.length === 0) {
  console.log('✅ Nenhuma URL nova para scrape!');
  process.exit(0);
}

// Limitar a 200 para não gastar demais
const urlsToScrape = newUrls.slice(0, 200);
console.log(`\n🚀 Iniciando Apify com ${urlsToScrape.length} URLs...\n`);

const INPUT = {
  startUrls: urlsToScrape.map(url => ({ url })),
  maxCrawlDepth: 0,   // só as URLs especificadas, sem seguir links
  crawlerType: 'cheerio',
  htmlTransformer: 'readableText',
  readableTextCharThreshold: 300,
  saveMarkdown: true,
  saveHtml: false,
  removeCookieWarnings: true,
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

async function main() {
  const run = await apifyRequest('POST', '/v2/acts/apify~website-content-crawler/runs', INPUT);

  if (!run.data?.id) {
    console.error('❌ Erro:', JSON.stringify(run, null, 2));
    process.exit(1);
  }

  const runId = run.data.id;
  const datasetId = run.data.defaultDatasetId;
  console.log(`✅ Run 2 iniciado: ${runId}`);
  console.log(`   Dataset: ${datasetId}`);
  console.log(`   Console: https://console.apify.com/runs/${runId}`);

  // Salvar IDs
  fs.writeFileSync(
    path.join(DIR, 'apify-run2-ids.json'),
    JSON.stringify({ runId, datasetId, urlCount: urlsToScrape.length, startedAt: new Date().toISOString() }, null, 2)
  );

  // Polling
  console.log('\n⏳ Aguardando conclusão...\n');
  while (true) {
    const r = await apifyRequest('GET', `/v2/actor-runs/${runId}`);
    const status = r.data?.status;
    const finished = r.data?.stats?.requestsFinished || 0;
    const ts = new Date().toLocaleTimeString('pt-BR');
    console.log(`[${ts}] ${status} | Páginas processadas: ${finished}`);

    if (status === 'SUCCEEDED') {
      console.log('\n✅ Run concluído!');
      break;
    }
    if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(status)) {
      throw new Error(`Run terminou: ${status}`);
    }
    await new Promise(r => setTimeout(r, 20000));
  }

  // Baixar e salvar resultados
  console.log('\n📥 Baixando resultados...');
  let offset = 0;
  const limit = 100;
  let saved = 0, tooShort = 0;

  function slugify(text) {
    return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 80).replace(/^-|-$/, '');
  }

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
