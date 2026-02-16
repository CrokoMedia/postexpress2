/**
 * Script usando apify/instagram-scraper (Actor oficial mais completo)
 *
 * Uso:
 *   node scripts/instagram-scraper-apify.js [username]
 *
 * Exemplo:
 *   node scripts/instagram-scraper-apify.js frankcosta
 */

import { ApifyClient } from 'apify-client';
import fs from 'fs';
import 'dotenv/config';

// Configurar cliente Apify
const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

async function scrapInstagram(username) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📸 INSTAGRAM SCRAPER - APIFY (COMPLETO)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`🎯 Perfil alvo: @${username}\n`);

  try {
    const ACTOR_NAME = 'apify/instagram-scraper';

    console.log(`🚀 Iniciando execução do Actor: ${ACTOR_NAME}`);
    console.log('⏳ Aguarde...\n');

    // Input para apify/instagram-scraper
    const run = await client.actor(ACTOR_NAME).call({
      // URL do perfil diretamente
      directUrls: [`https://www.instagram.com/${username}/`],

      // Configurações
      resultsType: 'posts',  // 'posts', 'comments', 'details'
      resultsLimit: 10,

      // Proxy (recomendado para evitar bloqueio)
      proxy: {
        useApifyProxy: true,
      },

      // Outras opções
      searchLimit: 10,
      searchType: 'hashtag',
      addParentData: true,  // Adiciona dados do perfil nos posts
    });

    console.log(`✅ Actor iniciado!`);
    console.log(`   ID da execução: ${run.id}`);
    console.log(`   Status: ${run.status}\n`);

    // Aguardar conclusão
    console.log('⏳ Aguardando conclusão (pode levar 1-3 minutos)...');
    const finishedRun = await client.run(run.id).waitForFinish();

    console.log(`\n✅ Execução finalizada!`);
    console.log(`   Status final: ${finishedRun.status}`);
    console.log(`   Duração: ${finishedRun.stats.computeUnits.toFixed(2)} compute units\n`);

    // Verificar se teve sucesso
    if (finishedRun.status !== 'SUCCEEDED') {
      throw new Error(`Actor falhou com status: ${finishedRun.status}`);
    }

    // Obter resultados
    console.log('📊 Baixando resultados...');
    const { items } = await client.dataset(finishedRun.defaultDatasetId).listItems();

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log('📈 RESULTADOS DA EXTRAÇÃO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log(`✅ Total de itens extraídos: ${items.length}\n`);

    // Analisar dados extraídos
    if (items.length > 0) {
      const firstItem = items[0];

      // Verificar se tem dados do dono do perfil
      if (firstItem.ownerFullName || firstItem.ownerUsername) {
        console.log('👤 DADOS DO PERFIL (do dono dos posts):');
        console.log(`   Nome completo: ${firstItem.ownerFullName || '❌ Não encontrado'}`);
        console.log(`   Username: ${firstItem.ownerUsername || '❌ Não encontrado'}`);
        console.log(`   ID: ${firstItem.ownerId || '❌ Não encontrado'}`);
        console.log(`   📸 Foto de perfil: ${firstItem.ownerProfilePicUrl ? '✅ ENCONTRADA!' : '❌ NÃO ENCONTRADA'}`);

        if (firstItem.ownerProfilePicUrl) {
          console.log(`\n🔗 URL da foto de perfil:`);
          console.log(`   ${firstItem.ownerProfilePicUrl}\n`);
        }
      }

      // Estatísticas dos posts
      console.log('📝 ESTATÍSTICAS DOS POSTS:');
      const totalLikes = items.reduce((sum, post) => sum + (post.likesCount || 0), 0);
      const totalComments = items.reduce((sum, post) => sum + (post.commentsCount || 0), 0);
      const avgLikes = (totalLikes / items.length).toFixed(0);
      const avgComments = (totalComments / items.length).toFixed(0);

      console.log(`   Total de posts: ${items.length}`);
      console.log(`   Total de likes: ${totalLikes.toLocaleString()}`);
      console.log(`   Total de comentários: ${totalComments.toLocaleString()}`);
      console.log(`   Média de likes/post: ${avgLikes}`);
      console.log(`   Média de comentários/post: ${avgComments}`);

      // Exemplo de post
      console.log('\n   📌 Exemplo de post:');
      console.log(`      Tipo: ${firstItem.type || 'N/A'}`);
      console.log(`      Caption: ${firstItem.caption?.substring(0, 80) || 'Sem caption'}...`);
      console.log(`      Likes: ${firstItem.likesCount || 0}`);
      console.log(`      Comentários: ${firstItem.commentsCount || 0}`);
      console.log(`      Data: ${firstItem.timestamp || 'N/A'}`);
      console.log(`      URL: ${firstItem.url || 'N/A'}`);

      // Verificar se tem comentários
      if (firstItem.latestComments && firstItem.latestComments.length > 0) {
        console.log(`\n   💬 Comentários extraídos: ${firstItem.latestComments.length}`);
        const firstComment = firstItem.latestComments[0];
        console.log(`      Exemplo: "${firstComment.text?.substring(0, 60)}..." - @${firstComment.ownerUsername}`);
      }
    }

    // Salvar em arquivo
    const outputDir = 'squad-auditores/data';
    const outputFile = `${outputDir}/${username}-instagram-scraper.json`;

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputFile, JSON.stringify(items, null, 2));

    console.log(`\n💾 Dados salvos em: ${outputFile}`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 SCRAPING CONCLUÍDO COM SUCESSO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Retornar resumo
    return {
      success: true,
      posts: items.length,
      profilePicUrl: items[0]?.ownerProfilePicUrl,
      username: items[0]?.ownerUsername,
      fullName: items[0]?.ownerFullName,
      totalLikes,
      totalComments,
    };

  } catch (error) {
    console.error('\n❌ ERRO AO EXECUTAR O SCRAPER:\n');
    console.error(error);

    console.log('\n💡 DICAS DE TROUBLESHOOTING:\n');
    console.log('1. Verifique se APIFY_API_TOKEN está configurado no arquivo .env');
    console.log('2. Obtenha seu token em: https://console.apify.com/account/integrations');
    console.log('3. Verifique se o perfil do Instagram existe e é público');
    console.log('4. Este Actor pode levar alguns minutos para executar\n');

    return {
      success: false,
      error: error.message,
    };
  }
}

// Executar
const username = process.argv[2] || 'frankcosta';
scrapInstagram(username);
