/**
 * Instagram Scraper com Extração de Comentários
 *
 * Extrai posts + comentários de um perfil do Instagram
 *
 * Uso:
 *   node scripts/instagram-scraper-with-comments.js <username> [--limit=20] [--comments-per-post=50]
 *
 * Exemplos:
 *   node scripts/instagram-scraper-with-comments.js frankcosta
 *   node scripts/instagram-scraper-with-comments.js rodrigogunter_ --limit=15 --comments-per-post=100
 *
 * Saída:
 *   squad-auditores/data/{username}-posts-with-comments.json
 */

import { ApifyClient } from 'apify-client';
import fs from 'fs';
import 'dotenv/config';

const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

/**
 * Extrai posts de um perfil
 */
async function extractPosts(username, limit = 20) {
  console.log('📸 FASE 1: Extraindo posts...\n');

  const run = await client.actor('apify/instagram-profile-scraper').call({
    usernames: [username],
    resultsLimit: limit,
  });

  const finishedRun = await client.run(run.id).waitForFinish();

  if (finishedRun.status !== 'SUCCEEDED') {
    throw new Error(`Post extraction failed: ${finishedRun.status}`);
  }

  const { items } = await client.dataset(finishedRun.defaultDatasetId).listItems();

  console.log(`✅ ${items.length} perfil(is) extraído(s)\n`);

  // O instagram-profile-scraper retorna o perfil completo com latestPosts dentro
  if (items.length > 0) {
    const profileData = items[0];
    const posts = profileData.latestPosts ? profileData.latestPosts.slice(0, limit) : [];

    // Extrair dados do perfil (incluindo foto!)
    const profile = {
      username: profileData.username,
      fullName: profileData.fullName,
      biography: profileData.biography,
      externalUrl: profileData.externalUrl || null, // Link externo do perfil
      followersCount: profileData.followersCount,
      followsCount: profileData.followsCount,
      postsCount: profileData.postsCount,
      profilePicUrl: profileData.profilePicUrl,
      profilePicUrlHD: profileData.profilePicUrlHD,
      url: profileData.url,
      verified: profileData.verified,
      isBusinessAccount: profileData.isBusinessAccount,
      businessCategoryName: profileData.businessCategoryName,
    };

    console.log('👤 DADOS DO PERFIL CAPTURADOS:');
    console.log(`   Nome: ${profile.fullName}`);
    console.log(`   Seguidores: ${profile.followersCount?.toLocaleString() || 0}`);
    console.log(`   📸 Foto de perfil: ${profile.profilePicUrlHD || profile.profilePicUrl ? '✅ CAPTURADA' : '❌ NÃO CAPTURADA'}`);
    if (profile.profilePicUrlHD || profile.profilePicUrl) {
      console.log(`      URL: ${(profile.profilePicUrlHD || profile.profilePicUrl)?.substring(0, 60)}...`);
    }
    console.log(`   🔗 External URL: ${profile.externalUrl || '(nenhum)'}`);
    console.log('');

    return { profile, posts };
  }

  return { profile: null, posts: [] };
}

/**
 * Extrai comentários de um post específico
 */
async function extractCommentsForPost(postUrl, limit = 50) {
  try {
    const run = await client.actor('apify/instagram-scraper').call({
      directUrls: [postUrl],
      resultsType: 'comments',
      resultsLimit: limit,
      proxy: { useApifyProxy: true },
    });

    const finishedRun = await client.run(run.id).waitForFinish();

    if (finishedRun.status !== 'SUCCEEDED') {
      console.log(`   ⚠️  Comentários não disponíveis para ${postUrl}`);
      return [];
    }

    const { items } = await client.dataset(finishedRun.defaultDatasetId).listItems();

    return items;
  } catch (error) {
    console.log(`   ⚠️  Erro ao extrair comentários: ${error.message}`);
    return [];
  }
}

/**
 * Filtra comentários relevantes (remove spam, emojis puros, etc)
 */
function filterRelevantComments(comments) {
  return comments.filter(comment => {
    const text = comment.text || '';

    // Remove comentários muito curtos (menos de 3 caracteres)
    if (text.length < 3) return false;

    // Remove comentários que são apenas emojis
    const emojiOnlyRegex = /^[\p{Emoji}\s]+$/u;
    if (emojiOnlyRegex.test(text)) return false;

    // Remove spam comum
    const spamKeywords = ['follow', 'dm', 'link in bio', 'check out', 'giveaway'];
    const lowerText = text.toLowerCase();
    if (spamKeywords.some(keyword => lowerText.includes(keyword))) return false;

    return true;
  });
}

/**
 * Categoriza comentários (perguntas, elogios, críticas, etc)
 */
function categorizeComments(comments) {
  const categorized = {
    perguntas: [],
    elogios: [],
    duvidas: [],
    experiencias: [],
    outros: [],
  };

  comments.forEach(comment => {
    const text = comment.text || '';
    const lowerText = text.toLowerCase();

    // Perguntas diretas
    if (text.includes('?') || lowerText.match(/^(como|onde|quando|porque|qual|quem|quanto)/)) {
      categorized.perguntas.push(comment);
    }
    // Elogios
    else if (lowerText.match(/(parabens|parabéns|incrível|top|excelente|amei|adorei|maravilhoso)/)) {
      categorized.elogios.push(comment);
    }
    // Dúvidas
    else if (lowerText.match(/(duvida|dúvida|será que|alguém sabe|não entendi|explica)/)) {
      categorized.duvidas.push(comment);
    }
    // Experiências pessoais
    else if (lowerText.match(/(eu também|comigo|já passei|aconteceu|meu caso)/)) {
      categorized.experiencias.push(comment);
    }
    // Outros
    else {
      categorized.outros.push(comment);
    }
  });

  return categorized;
}

/**
 * Pipeline principal
 */
async function scrapWithComments(username, options = {}) {
  const { postLimit = 20, commentsPerPost = 50 } = options;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📸 INSTAGRAM SCRAPER COM COMENTÁRIOS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`🎯 Perfil: @${username}`);
  console.log(`📊 Posts: ${postLimit} | Comentários/post: ${commentsPerPost}\n`);

  const startTime = Date.now();

  try {
    // FASE 1: Extrair posts + perfil
    const { profile, posts } = await extractPosts(username, postLimit);

    if (!profile) {
      throw new Error('❌ Não foi possível extrair dados do perfil');
    }

    // FASE 2: Extrair comentários de cada post
    console.log('💬 FASE 2: Extraindo comentários...\n');

    const postsWithComments = [];

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];

      console.log(`   [${i + 1}/${posts.length}] ${post.url}`);

      // Extrair comentários
      const rawComments = await extractCommentsForPost(post.url, commentsPerPost);

      // Filtrar comentários relevantes
      const relevantComments = filterRelevantComments(rawComments);

      // Categorizar comentários
      const categorizedComments = categorizeComments(relevantComments);

      postsWithComments.push({
        ...post,
        isPinned: post.isPinned || false, // Campo de post fixado (importante para ofertas)
        comments: {
          total: rawComments.length,
          relevant: relevantComments.length,
          raw: rawComments,
          categorized: categorizedComments,
        },
      });

      console.log(`   ✅ ${rawComments.length} comentários (${relevantComments.length} relevantes)\n`);
    }

    // FASE 3: Salvar resultados
    console.log('💾 FASE 3: Salvando dados...\n');

    const outputDir = 'squad-auditores/data';
    const outputFile = `${outputDir}/${username}-posts-with-comments.json`;

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Salvar dados completos (perfil + posts + comentários)
    fs.writeFileSync(outputFile, JSON.stringify({
      username,
      profile, // ✅ AGORA INCLUI DADOS DO PERFIL COM FOTO!
      posts: postsWithComments
    }, null, 2));

    // Estatísticas finais
    const totalComments = postsWithComments.reduce((sum, p) => sum + p.comments.total, 0);
    const totalRelevant = postsWithComments.reduce((sum, p) => sum + p.comments.relevant, 0);
    const totalPerguntas = postsWithComments.reduce((sum, p) => sum + p.comments.categorized.perguntas.length, 0);

    const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📈 RESUMO DA EXTRAÇÃO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`✅ Posts extraídos: ${postsWithComments.length}`);
    console.log(`💬 Total de comentários: ${totalComments}`);
    console.log(`🎯 Comentários relevantes: ${totalRelevant}`);
    console.log(`❓ Perguntas identificadas: ${totalPerguntas}`);
    console.log(`⏱️  Tempo decorrido: ${elapsed} minutos`);
    console.log(`\n💾 Arquivo salvo: ${outputFile}\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 EXTRAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return {
      success: true,
      posts: postsWithComments.length,
      totalComments,
      totalRelevant,
      totalPerguntas,
      outputFile,
    };

  } catch (error) {
    console.error('\n❌ ERRO:\n', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// CLI
const args = process.argv.slice(2);
const username = args[0] || 'frankcosta';

// Parse options
const options = {};
args.forEach(arg => {
  if (arg.startsWith('--limit=')) {
    options.postLimit = parseInt(arg.split('=')[1]);
  }
  if (arg.startsWith('--comments-per-post=')) {
    options.commentsPerPost = parseInt(arg.split('=')[1]);
  }
});

scrapWithComments(username, options);
