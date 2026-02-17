/**
 * Blog / Article Collector — ETL Data Collector
 *
 * Output: sources/articles/{slug}.md
 * (segue estrutura dos clones existentes: alex_hormozi, adriano_de_marqui, etc.)
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const { generateBlogSlug } = require('../utils/slug-generator');

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function collectBlog(source, outputDir) {
  if (!source.url) {
    return { ...source, status: 'failed', error: 'URL não fornecida' };
  }

  const slug = generateBlogSlug(source.url, source.title);
  const articlesDir = path.join(outputDir, 'articles');
  fs.mkdirSync(articlesDir, { recursive: true });
  const outputPath = path.join(articlesDir, `${slug}.md`);

  // Pula se já existe
  if (fs.existsSync(outputPath)) {
    return { ...source, status: 'skipped', outputPath: path.join('articles', `${slug}.md`), reason: 'já coletado' };
  }

  try {
    const result = await fetchDirect(source.url);
    if (result && result.content && result.content.length > 200) {
      saveBlog(result, outputPath, source, slug);
      return {
        ...source,
        status: 'success',
        outputPath: path.join('articles', `${slug}.md`),
        wordCount: result.content.split(/\s+/).length,
        apiUsed: 'direct-http',
      };
    }
  } catch (_) { /* Tenta Apify */ }

  const apifyToken = process.env.APIFY_API_TOKEN;
  if (apifyToken) {
    try {
      const result = await fetchWithApify(source.url, apifyToken);
      if (result && result.content && result.content.length > 200) {
        saveBlog(result, outputPath, source, slug);
        return {
          ...source,
          status: 'success',
          outputPath: path.join('articles', `${slug}.md`),
          wordCount: result.content.split(/\s+/).length,
          apiUsed: 'apify',
        };
      }
    } catch (err) {
      return { ...source, status: 'failed', error: `Apify: ${err.message}` };
    }
  }

  return { ...source, status: 'failed', error: 'Conteúdo insuficiente após tentativas de coleta' };
}

async function fetchDirect(url) {
  const response = await axios.get(url, {
    headers: { 'User-Agent': USER_AGENT },
    timeout: 30000,
  });

  const $ = cheerio.load(response.data);
  $('script, style, nav, header, footer, aside, .sidebar, .ads, .comments, .share').remove();

  const title = $('h1').first().text().trim() || $('title').text().trim() || '';
  const publishedAt = $('time').attr('datetime') || $('[class*="date"]').first().text().trim() || '';

  let content = '';
  for (const selector of ['article', '[class*="post-content"]', '[class*="article-body"]',
    '[class*="entry-content"]', '[class*="content-body"]', 'main', '.post', '#content']) {
    const found = $(selector).first().text().trim();
    if (found && found.length > 300) { content = found; break; }
  }
  if (!content) content = $('body').text().trim();
  content = content.replace(/\s+/g, ' ').trim();

  return { title, content, publishedAt, url };
}

async function fetchWithApify(url, apiToken) {
  const { ApifyClient } = require('apify-client');
  const client = new ApifyClient({ token: apiToken });

  const run = await client.actor('apify/web-scraper').call({
    startUrls: [{ url }],
    pageFunction: `async function pageFunction(context) {
      const { page, request } = context;
      await page.waitForLoadState('networkidle');
      const title = await page.title();
      const content = await page.evaluate(() => {
        for (const s of ['article','[class*="post-content"]','[class*="content"]','main']) {
          const el = document.querySelector(s);
          if (el && el.innerText.length > 300) return el.innerText;
        }
        return document.body.innerText;
      });
      return { url: request.url, title, content };
    }`,
    maxRequestsPerCrawl: 1,
  });

  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  if (!items || items.length === 0) throw new Error('Apify não retornou resultados');

  return { title: items[0].title || '', content: items[0].content || '', publishedAt: '', url };
}

function saveBlog(result, outputPath, source, slug) {
  const date = new Date().toISOString().split('T')[0];
  const mdContent = [
    `---`,
    `title: "${(result.title || source.title || slug).replace(/"/g, "'")}"`,
    `canonical_url: "${source.url}"`,
    `source_type: article`,
    `collected_at: "${date}"`,
    `published_at: "${result.publishedAt || ''}"`,
    `slug: "${slug}"`,
    `tags: []`,
    `---`,
    ``,
    `# ${result.title || source.title || slug}`,
    ``,
    `> Fonte: ${source.url}`,
    ``,
    result.content,
  ].join('\n');

  fs.writeFileSync(outputPath, mdContent, 'utf8');
}

module.exports = { collectBlog };
