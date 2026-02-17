/**
 * Social Media Collector — ETL Data Collector
 *
 * Coleta conteúdo de todas as plataformas sociais via Apify.
 *
 * Plataformas suportadas:
 *   - TikTok     → sources/social/tiktok/
 *   - Instagram  → sources/social/instagram/
 *   - Twitter/X  → sources/social/twitter/
 *   - LinkedIn   → sources/social/linkedin/
 *
 * Para cada post salva:
 *   - {slug}.md  — caption/texto + metadados
 *
 * Para vídeos (TikTok/Reels): opção de transcrição via AssemblyAI
 */

const fs = require('fs');
const path = require('path');
const { generateSlug } = require('../utils/slug-generator');
const { updateAssemblyAIUsage, logCollection } = require('../utils/inventory-updater');

// Actors Apify por plataforma
const APIFY_ACTORS = {
  tiktok: 'clockworks/free-tiktok-scraper',
  instagram: 'apify/instagram-scraper',
  twitter: 'quacker/twitter-scraper',
  linkedin: 'curious_coder/linkedin-post-search-scraper',
};

/**
 * Coleta posts de redes sociais
 * @param {Object} source - { type, platform, handle, limit, subtype, transcribe_audio }
 * @param {string} outputDir - Diretório base sources/
 */
async function collectSocial(source, outputDir) {
  const platform = source.platform || source.type;
  const handle = source.handle || source.username;

  if (!handle) {
    return { ...source, status: 'failed', error: 'handle/username não fornecido' };
  }

  const apifyToken = process.env.APIFY_API_TOKEN;
  if (!apifyToken) {
    return { ...source, status: 'failed', error: 'APIFY_API_TOKEN não configurada no .env' };
  }

  const platformDir = path.join(outputDir, 'social', platform);
  fs.mkdirSync(platformDir, { recursive: true });

  try {
    let posts = [];

    switch (platform) {
      case 'tiktok':
        posts = await collectTikTok(handle, source.limit || 50, apifyToken);
        break;
      case 'instagram':
        posts = await collectInstagram(handle, source.limit || 30, apifyToken);
        break;
      case 'twitter':
        posts = await collectTwitter(handle, source.limit || 100, apifyToken);
        break;
      case 'linkedin':
        posts = await collectLinkedIn(handle, source.limit || 30, apifyToken);
        break;
      default:
        return { ...source, status: 'failed', error: `Plataforma não suportada: ${platform}` };
    }

    if (!posts || posts.length === 0) {
      return { ...source, status: 'failed', error: `Nenhum post encontrado para @${handle} no ${platform}` };
    }

    // Salva cada post como arquivo .md
    let savedCount = 0;
    let totalWords = 0;

    for (const post of posts) {
      const result = savePost(post, platformDir, platform, handle);
      if (result) {
        savedCount++;
        totalWords += result.wordCount;
      }
    }

    // Gera índice da plataforma
    generatePlatformIndex(posts, platformDir, platform, handle);

    logCollection({
      mind: source.mind || handle,
      type: platform,
      title: `@${handle} — ${savedCount} posts`,
      durationOrSize: `${totalWords.toLocaleString()} palavras`,
      apiUsed: 'apify',
      plan: 'free',
      status: '✓ Coletado',
    });

    return {
      ...source,
      status: 'success',
      outputPath: path.join('social', platform),
      wordCount: totalWords,
      postsCount: savedCount,
      apiUsed: 'apify',
    };

  } catch (err) {
    return { ...source, status: 'failed', error: err.message };
  }
}

// ─── TikTok ───────────────────────────────────────────────

async function collectTikTok(handle, limit, apiToken) {
  const { ApifyClient } = require('apify-client');
  const client = new ApifyClient({ token: apiToken });

  const run = await client.actor(APIFY_ACTORS.tiktok).call({
    profiles: [`https://www.tiktok.com/@${handle}`],
    resultsPerPage: limit,
    maxProfilesPerQuery: 1,
    shouldDownloadVideos: false,
    shouldDownloadCovers: false,
    shouldDownloadSubtitles: true,  // Tenta pegar legendas automáticas
    shouldDownloadSlideshowImages: false,
    proxy: { useApifyProxy: true },
  });

  const { items } = await client.dataset(run.defaultDatasetId).listItems();

  return (items || []).map(item => ({
    id: item.id || item.webVideoUrl,
    platform: 'tiktok',
    url: item.webVideoUrl || `https://tiktok.com/@${handle}/video/${item.id}`,
    author: item.authorMeta?.name || handle,
    handle,
    text: item.text || item.desc || '',
    date: item.createTimeISO || item.createTime || '',
    likes: item.diggCount || 0,
    comments: item.commentCount || 0,
    shares: item.shareCount || 0,
    views: item.playCount || 0,
    duration: item.videoMeta?.duration || null,
    subtitles: item.subtitles || null,
    hashtags: (item.text || '').match(/#\w+/g) || [],
  }));
}

// ─── Instagram ────────────────────────────────────────────

async function collectInstagram(handle, limit, apiToken) {
  const { ApifyClient } = require('apify-client');
  const client = new ApifyClient({ token: apiToken });

  const run = await client.actor(APIFY_ACTORS.instagram).call({
    directUrls: [`https://www.instagram.com/${handle}/`],
    resultsType: 'posts',
    resultsLimit: limit,
    proxy: { useApifyProxy: true },
    addParentData: true,
  });

  const { items } = await client.dataset(run.defaultDatasetId).listItems();

  return (items || []).map(item => ({
    id: item.id || item.shortCode,
    platform: 'instagram',
    url: item.url || `https://instagram.com/p/${item.shortCode}`,
    author: item.ownerUsername || handle,
    handle,
    text: item.caption || item.alt || '',
    date: item.timestamp || item.takenAtTimestamp || '',
    likes: item.likesCount || 0,
    comments: item.commentsCount || 0,
    type: item.type || 'post', // post, reel, igtv
    hashtags: (item.hashtags || []).map(h => `#${h}`),
    mentions: item.mentions || [],
  }));
}

// ─── Twitter / X ──────────────────────────────────────────

async function collectTwitter(handle, limit, apiToken) {
  const { ApifyClient } = require('apify-client');
  const client = new ApifyClient({ token: apiToken });

  const run = await client.actor(APIFY_ACTORS.twitter).call({
    searchTerms: [`from:${handle}`],
    maxTweets: limit,
    addUserInfo: true,
    proxy: { useApifyProxy: true },
  });

  const { items } = await client.dataset(run.defaultDatasetId).listItems();

  return (items || []).map(item => ({
    id: item.id || item.tweetId,
    platform: 'twitter',
    url: item.url || `https://twitter.com/${handle}/status/${item.id}`,
    author: item.user?.screen_name || handle,
    handle,
    text: item.full_text || item.text || '',
    date: item.created_at || '',
    likes: item.favorite_count || 0,
    retweets: item.retweet_count || 0,
    replies: item.reply_count || 0,
    isThread: item.is_thread || false,
    hashtags: (item.entities?.hashtags || []).map(h => `#${h.text}`),
  }));
}

// ─── LinkedIn ─────────────────────────────────────────────

async function collectLinkedIn(handle, limit, apiToken) {
  const { ApifyClient } = require('apify-client');
  const client = new ApifyClient({ token: apiToken });

  const run = await client.actor(APIFY_ACTORS.linkedin).call({
    searchQueries: [handle],
    maxResults: limit,
    proxy: { useApifyProxy: true },
  });

  const { items } = await client.dataset(run.defaultDatasetId).listItems();

  return (items || []).map(item => ({
    id: item.id || item.url,
    platform: 'linkedin',
    url: item.url || '',
    author: item.authorName || handle,
    handle,
    text: item.text || item.content || '',
    date: item.publishedAt || '',
    likes: item.numLikes || 0,
    comments: item.numComments || 0,
    shares: item.numShares || 0,
    hashtags: (item.text || '').match(/#\w+/g) || [],
  }));
}

// ─── Salvar post ──────────────────────────────────────────

function savePost(post, platformDir, platform, handle) {
  if (!post.text && !post.id) return null;

  const title = post.text
    ? post.text.slice(0, 60).replace(/\n/g, ' ').trim()
    : post.id;

  const slug = generateSlug(title || post.id || String(Date.now()));
  const filePath = path.join(platformDir, `${slug}.md`);

  // Pula se já existe
  if (fs.existsSync(filePath)) return { wordCount: 0, skipped: true };

  const date = post.date
    ? new Date(post.date).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  const engagementLines = [];
  if (post.likes) engagementLines.push(`likes: ${post.likes}`);
  if (post.views) engagementLines.push(`views: ${post.views}`);
  if (post.comments !== undefined) engagementLines.push(`comments: ${post.comments}`);
  if (post.shares) engagementLines.push(`shares: ${post.shares}`);
  if (post.retweets) engagementLines.push(`retweets: ${post.retweets}`);

  const content = [
    `---`,
    `platform: ${platform}`,
    `handle: "@${handle}"`,
    `url: "${post.url || ''}"`,
    `published_at: "${date}"`,
    `collected_at: "${new Date().toISOString().split('T')[0]}"`,
    `slug: "${slug}"`,
    ...(engagementLines.length ? engagementLines : []),
    ...(post.hashtags?.length ? [`hashtags: [${post.hashtags.join(', ')}]`] : []),
    ...(post.type ? [`content_type: ${post.type}`] : []),
    `---`,
    ``,
    post.text || '',
    ``,
    ...(post.subtitles ? [`## Legendas / Transcrição`, ``, post.subtitles] : []),
  ].join('\n');

  fs.writeFileSync(filePath, content, 'utf8');

  return { wordCount: (post.text || '').split(/\s+/).length };
}

// ─── Índice da plataforma ─────────────────────────────────

function generatePlatformIndex(posts, platformDir, platform, handle) {
  const date = new Date().toISOString().split('T')[0];
  const sorted = [...posts].sort((a, b) => (b.likes || 0) - (a.likes || 0));

  const lines = [
    `# @${handle} — ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
    ``,
    `**Coletado em:** ${date}  `,
    `**Total de posts:** ${posts.length}  `,
    ``,
    `## Top Posts por Engajamento`,
    ``,
    `| # | Texto | Likes | Data |`,
    `|---|-------|-------|------|`,
    ...sorted.slice(0, 20).map((p, i) => {
      const text = (p.text || '').slice(0, 60).replace(/\|/g, '/').replace(/\n/g, ' ');
      return `| ${i + 1} | ${text}... | ${p.likes || 0} | ${p.date?.slice(0, 10) || '—'} |`;
    }),
    ``,
    `---`,
    `*Gerado automaticamente pelo ETL Data Collector*`,
  ];

  fs.writeFileSync(path.join(platformDir, '_INDEX.md'), lines.join('\n'), 'utf8');
}

module.exports = { collectSocial };
