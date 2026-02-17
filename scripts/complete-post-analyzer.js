/**
 * Complete Post Analyzer - Pipeline Integrado
 *
 * Executa o pipeline completo:
 * 1. Scraping de posts
 * 2. Extração de comentários
 * 3. OCR das imagens
 * 4. Análise e categorização
 *
 * Uso:
 *   node scripts/complete-post-analyzer.js <username> [--limit=10] [--skip-ocr]
 *
 * Exemplos:
 *   node scripts/complete-post-analyzer.js rodrigogunter_
 *   node scripts/complete-post-analyzer.js frankcosta --limit=5
 *   node scripts/complete-post-analyzer.js rodrigogunter_ --skip-ocr
 *
 * Saída:
 *   squad-auditores/data/{username}-complete-analysis.json
 *   squad-auditores/output/auditoria-{username}.md (relatório)
 */

import { ApifyClient } from 'apify-client';
import { Mistral } from '@mistralai/mistralai';
import fs from 'fs';
import 'dotenv/config';

const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

const mistralClient = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

// ============================================
// FASE 1: Scraping de Posts
// ============================================

async function extractPosts(username, limit = 10) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📸 FASE 1: SCRAPING DE POSTS + PERFIL');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const run = await apifyClient.actor('apify/instagram-profile-scraper').call({
    usernames: [username],
    resultsLimit: limit,
  });

  const finishedRun = await apifyClient.run(run.id).waitForFinish();

  if (finishedRun.status !== 'SUCCEEDED') {
    throw new Error(`Post extraction failed: ${finishedRun.status}`);
  }

  const { items } = await apifyClient.dataset(finishedRun.defaultDatasetId).listItems();

  console.log(`✅ ${items.length} perfil(is) extraído(s)\n`);

  // O instagram-profile-scraper retorna o perfil completo com latestPosts dentro
  if (items.length > 0) {
    const profileData = items[0];
    const posts = profileData.latestPosts ? profileData.latestPosts.slice(0, limit) : [];

    // Extrair dados do perfil (NOVO!)
    const profile = {
      username: profileData.username,
      fullName: profileData.fullName,
      biography: profileData.biography,
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

    console.log('👤 DADOS DO PERFIL:');
    console.log(`   Nome: ${profile.fullName}`);
    console.log(`   Seguidores: ${profile.followersCount?.toLocaleString() || 0}`);
    console.log(`   Seguindo: ${profile.followsCount?.toLocaleString() || 0}`);
    console.log(`   Posts: ${profile.postsCount?.toLocaleString() || 0}`);
    console.log(`   📸 Foto de perfil: ${profile.profilePicUrlHD || profile.profilePicUrl ? '✅ CAPTURADA' : '❌ NÃO CAPTURADA'}`);
    if (profile.profilePicUrlHD || profile.profilePicUrl) {
      console.log(`      URL: ${(profile.profilePicUrlHD || profile.profilePicUrl)?.substring(0, 60)}...`);
    }
    console.log(`   Posts extraídos: ${posts.length}\n`);

    return { profile, posts };
  }

  return { profile: null, posts: [] };
}

// ============================================
// FASE 2: Extração de Comentários
// ============================================

async function extractComments(posts) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💬 FASE 2: EXTRAÇÃO DE COMENTÁRIOS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const postsWithComments = [];

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];

    console.log(`[${i + 1}/${posts.length}] ${post.url}`);

    try {
      const run = await apifyClient.actor('apify/instagram-scraper').call({
        directUrls: [post.url],
        resultsType: 'comments',
        resultsLimit: 50,
        proxy: { useApifyProxy: true },
      });

      const finishedRun = await apifyClient.run(run.id).waitForFinish();

      let comments = [];
      if (finishedRun.status === 'SUCCEEDED') {
        const { items } = await apifyClient.dataset(finishedRun.defaultDatasetId).listItems();
        comments = items;
      }

      // Filtrar e categorizar comentários
      const relevant = filterRelevantComments(comments);
      const categorized = categorizeComments(relevant);

      postsWithComments.push({
        ...post,
        comments: {
          total: comments.length,
          relevant: relevant.length,
          raw: comments,
          categorized,
        },
      });

      console.log(`✅ ${comments.length} comentários (${relevant.length} relevantes)\n`);

    } catch (error) {
      console.log(`⚠️  Erro: ${error.message}\n`);
      postsWithComments.push({
        ...post,
        comments: { total: 0, relevant: 0, raw: [], categorized: {} },
      });
    }
  }

  return postsWithComments;
}

function filterRelevantComments(comments) {
  return comments.filter(comment => {
    const text = comment.text || '';
    if (text.length < 3) return false;
    if (/^[\p{Emoji}\s]+$/u.test(text)) return false;

    const spam = ['follow', 'dm', 'link in bio', 'check out', 'giveaway'];
    const lower = text.toLowerCase();
    if (spam.some(k => lower.includes(k))) return false;

    return true;
  });
}

function categorizeComments(comments) {
  const categories = {
    perguntas: [],
    elogios: [],
    duvidas: [],
    experiencias: [],
    outros: [],
  };

  comments.forEach(comment => {
    const text = comment.text || '';
    const lower = text.toLowerCase();

    if (text.includes('?') || /^(como|onde|quando|porque|qual|quem|quanto)/.test(lower)) {
      categories.perguntas.push(comment);
    } else if (/(parabens|parabéns|incrível|top|excelente|amei|adorei)/.test(lower)) {
      categories.elogios.push(comment);
    } else if (/(duvida|dúvida|será que|alguém sabe|não entendi)/.test(lower)) {
      categories.duvidas.push(comment);
    } else if (/(eu também|comigo|já passei|aconteceu|meu caso)/.test(lower)) {
      categories.experiencias.push(comment);
    } else {
      categories.outros.push(comment);
    }
  });

  return categories;
}

// ============================================
// HELPERS
// ============================================

function detectarTipo(texto) {
  const lower = texto.toLowerCase();

  // Palavras-chave para cada tipo
  if (lower.match(/(comprar|compre|desconto|oferta|promoção|garanta|aproveite)/)) {
    return 'vendas';
  }
  if (lower.match(/(aprenda|descubra|saiba|entenda|passo|dica|como)/)) {
    return 'educacional';
  }
  if (lower.match(/(anos de experiência|especialista|líder|referência|autoridade)/)) {
    return 'autoridade';
  }

  return 'outros';
}

// ============================================
// FASE 3: OCR das Imagens (Mistral AI Pixtral)
// ============================================

/**
 * Baixa imagem da URL e converte para base64
 */
async function fetchImageAsBase64(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer.toString('base64');
  } catch (error) {
    throw new Error(`Falha ao baixar imagem: ${error.message}`);
  }
}

async function analyzeImages(posts, skipOCR = false) {
  if (skipOCR) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⏭️  FASE 3: OCR PULADO (--skip-ocr)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return posts;
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 FASE 3: ANÁLISE OCR DAS IMAGENS (Mistral AI Pixtral)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const postsWithOCR = [];

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];

    console.log(`[${i + 1}/${posts.length}] ${post.url}`);

    const images = [];
    if (post.type === 'Image' && post.displayUrl) {
      images.push(post.displayUrl);
    } else if (post.type === 'Sidecar' && post.images) {
      images.push(...post.images);
    } else if (post.displayUrl) {
      images.push(post.displayUrl);
    }

    console.log(`   🖼️  ${images.length} imagem(ns)`);

    const imageAnalysis = [];

    for (let j = 0; j < images.length; j++) {
      const imageUrl = images[j];

      try {
        console.log(`   [${j + 1}/${images.length}] Extraindo texto com Mistral AI...`);

        // Usar Mistral AI Pixtral para OCR
        const base64Image = await fetchImageAsBase64(imageUrl);

        const prompt = `Você é um especialista em análise de conteúdo visual de redes sociais, especialmente carrosséis do Instagram.

Analise esta imagem e extraia TODAS as informações de texto visíveis.

Retorne um JSON estruturado no seguinte formato:
{
  "texto_completo": "todo o texto extraído concatenado",
  "titulo": "título principal ou headline (se houver)",
  "subtitulos": ["subtítulo 1", "subtítulo 2"],
  "bullets": ["bullet point 1", "bullet point 2"],
  "cta": "call-to-action (se houver)",
  "numeros_destaque": ["números em destaque"],
  "estrutura": "descrição breve da hierarquia visual",
  "cores_predominantes": ["cor principal"],
  "tipo": "educacional|vendas|autoridade|viral|outros",
  "elementos_especiais": ["emojis", "ícones", "badges"]
}

IMPORTANTE:
- Capture TODO o texto
- Identifique a hierarquia visual
- Para tipo, use: "educacional" (dicas), "vendas" (CTA compra), "autoridade" (credenciais), "viral" (storytelling)
- Retorne APENAS o JSON, sem markdown`;

        const result = await mistralClient.chat.complete({
          model: 'pixtral-12b-2409',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                },
                {
                  type: 'image_url',
                  imageUrl: `data:image/jpeg;base64,${base64Image}`
                }
              ]
            }
          ]
        });

        const text = result.choices[0].message.content;

        let jsonText = text.trim();
        if (jsonText.startsWith('```json')) {
          jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        } else if (jsonText.startsWith('```')) {
          jsonText = jsonText.replace(/```\n?/g, '').trim();
        }

        const analysis = JSON.parse(jsonText);

        imageAnalysis.push({ success: true, imageUrl, analysis, model: 'pixtral-12b-2409' });
        console.log(`   ✅ Texto extraído - Tipo: ${analysis.tipo}`);

      } catch (error) {
        console.log(`   ⚠️  Erro: ${error.message}`);
        imageAnalysis.push({ success: false, imageUrl, error: error.message });
      }

      await new Promise(r => setTimeout(r, 500)); // Pequeno delay
    }

    postsWithOCR.push({
      ...post,
      ocr: { totalImages: images.length, images: imageAnalysis },
    });

    console.log('');
  }

  return postsWithOCR;
}

// ============================================
// FASE 4: Geração de Relatório
// ============================================

function generateReport(data, username) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📄 FASE 4: GERANDO RELATÓRIO');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const { profile, metrics, posts } = data;

  // Estatísticas dos comentários
  const totalCommentsExtracted = posts.reduce((s, p) => s + (p.comments?.total || 0), 0);
  const totalRelevantComments = posts.reduce((s, p) => s + (p.comments?.relevant || 0), 0);
  const totalPerguntas = posts.reduce((s, p) => s + (p.comments?.categorized?.perguntas?.length || 0), 0);

  // Gerar markdown
  let report = `# 📊 Auditoria Completa - @${username}\n\n`;
  report += `**Data:** ${new Date().toLocaleDateString('pt-BR')}\n\n`;
  report += `---\n\n`;

  // Dados do Perfil
  if (profile) {
    report += `## 👤 Dados do Perfil\n\n`;
    report += `- **Nome:** ${profile.fullName || username}\n`;
    report += `- **Username:** @${profile.username || username}\n`;
    report += `- **Seguidores:** ${profile.followersCount?.toLocaleString() || 'N/A'}\n`;
    report += `- **Seguindo:** ${profile.followsCount?.toLocaleString() || 'N/A'}\n`;
    report += `- **Total de posts:** ${profile.postsCount?.toLocaleString() || 'N/A'}\n`;
    if (profile.verified) report += `- ✅ **Perfil Verificado**\n`;
    if (profile.isBusinessAccount) report += `- 💼 **Conta Business**\n`;
    if (profile.businessCategoryName) report += `- **Categoria:** ${profile.businessCategoryName}\n`;
    if (profile.biography) {
      report += `\n**Biografia:**\n> ${profile.biography}\n`;
    }
    report += `\n---\n\n`;
  }

  report += `## 📈 Métricas de Engajamento\n\n`;
  report += `- **Posts analisados:** ${posts.length}\n`;
  report += `- **Total de likes:** ${metrics?.totalLikes?.toLocaleString() || 0}\n`;
  report += `- **Média de likes/post:** ${metrics?.avgLikes || 0}\n`;
  report += `- **Total de comentários:** ${totalCommentsExtracted}\n`;
  report += `- **Média de comentários/post:** ${metrics?.avgComments || 0}\n`;
  report += `- **Taxa de engajamento:** ${metrics?.engagementRate || 'N/A'}\n`;
  report += `- **Comentários relevantes:** ${totalRelevantComments}\n`;
  report += `- **Perguntas identificadas:** ${totalPerguntas}\n\n`;

  report += `---\n\n`;

  report += `## 💬 Top Perguntas dos Comentários\n\n`;

  const allPerguntas = [];
  posts.forEach(p => {
    if (p.comments?.categorized?.perguntas) {
      allPerguntas.push(...p.comments.categorized.perguntas);
    }
  });

  const topPerguntas = allPerguntas
    .sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
    .slice(0, 10);

  topPerguntas.forEach((q, i) => {
    report += `${i + 1}. **"${q.text}"** - @${q.ownerUsername}\n`;
  });

  report += `\n---\n\n`;

  report += `## 📝 Análise dos Posts\n\n`;

  posts.forEach((post, i) => {
    report += `### Post ${i + 1}: ${post.type}\n\n`;
    report += `- **URL:** ${post.url}\n`;
    report += `- **Data:** ${new Date(post.timestamp).toLocaleDateString('pt-BR')}\n`;
    report += `- **Likes:** ${post.likesCount || 0}\n`;
    report += `- **Comentários:** ${post.comments?.total || 0}\n\n`;

    if (post.caption) {
      report += `**Legenda:**\n> ${post.caption.substring(0, 200)}...\n\n`;
    }

    if (post.ocr?.images?.length > 0) {
      report += `**Texto extraído (OCR):**\n`;
      post.ocr.images.forEach((img, j) => {
        if (img.success && img.analysis?.texto_completo) {
          report += `\nSlide ${j + 1}:\n> ${img.analysis.texto_completo}\n`;
        }
      });
      report += `\n`;
    }

    if (post.comments?.categorized?.perguntas?.length > 0) {
      report += `**Perguntas neste post:**\n`;
      post.comments.categorized.perguntas.slice(0, 3).forEach(q => {
        report += `- "${q.text}" - @${q.ownerUsername}\n`;
      });
      report += `\n`;
    }

    report += `---\n\n`;
  });

  report += `\n📊 *Relatório gerado automaticamente pelo Complete Post Analyzer*\n`;

  return report;
}

// ============================================
// PIPELINE PRINCIPAL
// ============================================

async function completeAnalysis(username, options = {}) {
  const { postLimit = 10, skipOCR = false } = options;

  console.log('\n');
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   📊 COMPLETE POST ANALYZER                    ║');
  console.log('║   Pipeline Completo de Análise                 ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🎯 Perfil: @${username}`);
  console.log(`📊 Limite: ${postLimit} posts`);
  console.log(`🔍 OCR: ${skipOCR ? 'Desabilitado' : 'Habilitado'}`);
  console.log('');

  const startTime = Date.now();

  try {
    // Validar API Keys
    if (!skipOCR && !process.env.MISTRAL_API_KEY) {
      throw new Error('❌ MISTRAL_API_KEY não configurada no .env (necessária para OCR com Mistral AI)');
    }

    // FASE 1: Scraping
    const { profile, posts } = await extractPosts(username, postLimit);

    // FASE 2: Comentários
    const postsWithComments = await extractComments(posts);

    // FASE 3: OCR
    const completeData = await analyzeImages(postsWithComments, skipOCR);

    // FASE 4: Salvar dados
    const dataDir = 'squad-auditores/data';
    const outputDir = 'squad-auditores/output';

    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const dataFile = `${dataDir}/${username}-complete-analysis.json`;
    const reportFile = `${outputDir}/auditoria-${username}.md`;

    // Calcular métricas de engajamento
    const totalLikes = completeData.reduce((s, p) => s + (p.likesCount || 0), 0);
    const totalComments = completeData.reduce((s, p) => s + (p.commentsCount || 0), 0);
    const avgLikes = completeData.length > 0 ? (totalLikes / completeData.length) : 0;
    const avgComments = completeData.length > 0 ? (totalComments / completeData.length) : 0;
    const engagementRate = profile?.followersCount > 0
      ? (((totalLikes + totalComments) / completeData.length / profile.followersCount) * 100).toFixed(2)
      : '0.00';

    const metrics = {
      totalLikes,
      totalComments,
      avgLikes: parseFloat(avgLikes.toFixed(0)),
      avgComments: parseFloat(avgComments.toFixed(0)),
      engagementRate: `${engagementRate}%`,
    };

    // Salvar JSON com perfil e métricas
    fs.writeFileSync(dataFile, JSON.stringify({
      username,
      profile,
      metrics,
      posts: completeData
    }, null, 2));

    // Gerar relatório com perfil
    const report = generateReport({ username, profile, metrics, posts: completeData }, username);
    fs.writeFileSync(reportFile, report);

    // Estatísticas finais
    const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

    const totalCommentsExtracted = completeData.reduce((s, p) => s + (p.comments?.total || 0), 0);
    const totalRelevant = completeData.reduce((s, p) => s + (p.comments?.relevant || 0), 0);
    const totalImages = completeData.reduce((s, p) => s + (p.ocr?.totalImages || 0), 0);

    console.log('╔════════════════════════════════════════════════╗');
    console.log('║   ✅ ANÁLISE CONCLUÍDA COM SUCESSO!            ║');
    console.log('╚════════════════════════════════════════════════╝');
    console.log('');
    console.log('📊 RESUMO:');
    console.log(`   Posts: ${completeData.length}`);
    console.log(`   Comentários extraídos: ${totalCommentsExtracted} (${totalRelevant} relevantes)`);
    console.log(`   Imagens: ${totalImages}`);
    console.log(`   Tempo: ${elapsed} minutos`);
    console.log('');
    console.log('💾 ARQUIVOS GERADOS:');
    console.log(`   📄 Dados: ${dataFile}`);
    console.log(`   📋 Relatório: ${reportFile}`);
    console.log('');

    return {
      success: true,
      posts: completeData.length,
      totalComments,
      totalRelevant,
      totalImages,
      dataFile,
      reportFile,
    };

  } catch (error) {
    console.error('\n❌ ERRO:\n', error);
    return { success: false, error: error.message };
  }
}

// CLI
const args = process.argv.slice(2);
const username = args[0] || 'frankcosta';

const options = {};
args.forEach(arg => {
  if (arg.startsWith('--limit=')) {
    options.postLimit = parseInt(arg.split('=')[1]);
  }
  if (arg === '--skip-ocr') {
    options.skipOCR = true;
  }
});

completeAnalysis(username, options);
