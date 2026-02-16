/**
 * Script de teste usando Actor OFICIAL do Apify Store
 * Instagram Profile Scraper (apify/instagram-profile-scraper)
 *
 * Uso:
 *   node scripts/test-instagram-official.js [username]
 *
 * Exemplo:
 *   node scripts/test-instagram-official.js frankcosta
 */

import { ApifyClient } from 'apify-client';
import fs from 'fs';
import 'dotenv/config';

// Configurar cliente Apify
const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

async function testInstagramOfficial(username) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📸 TESTE - INSTAGRAM OFFICIAL SCRAPER (APIFY)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`🎯 Perfil alvo: @${username}\n`);

  try {
    // Actor oficial do Apify Store
    const ACTOR_NAME = 'apify/instagram-profile-scraper';

    console.log(`🚀 Iniciando execução do Actor: ${ACTOR_NAME}`);
    console.log('⏳ Aguarde...\n');

    // Executar o Actor com input correto para o oficial
    const run = await client.actor(ACTOR_NAME).call({
      usernames: [username],
      resultsLimit: 10,
    });

    console.log(`✅ Actor iniciado!`);
    console.log(`   ID da execução: ${run.id}`);
    console.log(`   Status: ${run.status}\n`);

    // Aguardar conclusão
    console.log('⏳ Aguardando conclusão...');
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

    // Mostrar dados do perfil
    if (items.length > 0) {
      const profile = items[0];

      console.log('👤 DADOS DO PERFIL:');
      console.log(`   Nome completo: ${profile.fullName || profile.name || '❌ Não encontrado'}`);
      console.log(`   Username: ${profile.username || '❌ Não encontrado'}`);
      console.log(`   Biografia: ${profile.biography?.substring(0, 100) || '❌ Não encontrada'}...`);
      console.log(`   Seguidores: ${profile.followersCount || 0}`);
      console.log(`   Seguindo: ${profile.followsCount || 0}`);
      console.log(`   Posts: ${profile.postsCount || 0}`);
      console.log(`   📸 Foto de perfil: ${profile.profilePicUrl || profile.profilePicUrlHD ? '✅ ENCONTRADA!' : '❌ NÃO ENCONTRADA'}`);

      if (profile.profilePicUrl || profile.profilePicUrlHD) {
        console.log(`\n🔗 URL da foto de perfil (HD):`);
        console.log(`   ${profile.profilePicUrlHD || profile.profilePicUrl}\n`);
      }

      // Estatísticas de posts (se houver)
      if (profile.latestPosts && profile.latestPosts.length > 0) {
        console.log('\n📝 POSTS RECENTES:');
        const totalLikes = profile.latestPosts.reduce((sum, post) => sum + (post.likesCount || 0), 0);
        const totalComments = profile.latestPosts.reduce((sum, post) => sum + (post.commentsCount || 0), 0);
        const avgLikes = (totalLikes / profile.latestPosts.length).toFixed(0);
        const avgComments = (totalComments / profile.latestPosts.length).toFixed(0);

        console.log(`   Total de posts extraídos: ${profile.latestPosts.length}`);
        console.log(`   Média de likes/post: ${avgLikes}`);
        console.log(`   Média de comentários/post: ${avgComments}`);

        console.log('\n   📌 Exemplo de post:');
        const firstPost = profile.latestPosts[0];
        console.log(`      Caption: ${firstPost.caption?.substring(0, 80)}...`);
        console.log(`      Likes: ${firstPost.likesCount}`);
        console.log(`      Comentários: ${firstPost.commentsCount}`);
        console.log(`      URL: ${firstPost.url}`);
      }
    }

    // Salvar em arquivo
    const outputDir = 'squad-auditores/data';
    const outputFile = `${outputDir}/${username}-official-scraper.json`;

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputFile, JSON.stringify(items, null, 2));

    console.log(`\n💾 Dados salvos em: ${outputFile}`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 TESTE CONCLUÍDO COM SUCESSO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Retornar resumo
    return {
      success: true,
      items: items.length,
      profilePicUrl: items[0]?.profilePicUrlHD || items[0]?.profilePicUrl,
      username: items[0]?.username,
      fullName: items[0]?.fullName || items[0]?.name,
    };

  } catch (error) {
    console.error('\n❌ ERRO AO EXECUTAR O SCRAPER:\n');
    console.error(error);

    console.log('\n💡 DICAS DE TROUBLESHOOTING:\n');
    console.log('1. Verifique se APIFY_API_TOKEN está configurado no arquivo .env');
    console.log('2. Obtenha seu token em: https://console.apify.com/account/integrations');
    console.log('3. Verifique se o perfil do Instagram existe e é público\n');

    return {
      success: false,
      error: error.message,
    };
  }
}

// Executar
const username = process.argv[2] || 'frankcosta';
testInstagramOfficial(username);
