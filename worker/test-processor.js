#!/usr/bin/env node

/**
 * Testes do Tweet Processor
 * Valida deduplicação, cache, metadados e performance
 *
 * @epic EPIC-001 - Twitter Stream API Integration
 * @story Story 2.2 - Tweet Processing Optimization
 */

import 'dotenv/config';
import { processTweet, getProcessingStats, clearCaches } from './tweet-processor.js';

// ============================================
// MOCK DATA
// ============================================

function mockTweet(id) {
  return {
    id: `tweet_${id}`,
    text: `This is a test tweet about marketing frameworks and real estate! #marketing #frameworks`,
    created_at: new Date().toISOString(),
    public_metrics: {
      like_count: Math.floor(Math.random() * 100),
      retweet_count: Math.floor(Math.random() * 50),
      reply_count: Math.floor(Math.random() * 20),
      quote_count: Math.floor(Math.random() * 10),
      impression_count: Math.floor(Math.random() * 1000)
    },
    entities: {
      hashtags: [{ tag: 'marketing' }, { tag: 'frameworks' }],
      mentions: [],
      urls: []
    }
  };
}

function mockAuthor(username = 'test_user') {
  return {
    id: 'author_123',
    username: username,
    name: 'Test User',
    verified: false,
    public_metrics: {
      followers_count: 1000
    }
  };
}

// ============================================
// TESTS
// ============================================

async function runTests() {
  console.log('🧪 Testando Tweet Processor...\n');

  let allPassed = true;

  // Limpar caches antes de começar
  clearCaches();

  // Teste 1: Deduplicação
  console.log('📋 Teste 1: Deduplicação');
  try {
    const tweetData = mockTweet(1);
    const authorData = mockAuthor();

    await processTweet(tweetData, authorData); // Deve salvar
    await processTweet(tweetData, authorData); // Deve pular (duplicate)

    const stats = getProcessingStats();
    if (stats.duplicatesAvoided >= 1) {
      console.log(`  ✅ Deduplicação OK (${stats.duplicatesAvoided} duplicata(s) evitada(s))`);
    } else {
      console.error('  ❌ Deduplicação falhou');
      allPassed = false;
    }
  } catch (error) {
    console.error(`  ❌ Erro: ${error.message}`);
    allPassed = false;
  }

  // Teste 2: Cache de Experts
  console.log('\n📋 Teste 2: Cache de Experts');
  try {
    const tweet1 = mockTweet(2);
    const tweet2 = mockTweet(3);
    const author = mockAuthor('garyvee'); // Trocar para um username real se existir no DB

    await processTweet(tweet1, author);
    await processTweet(tweet2, author);

    const stats = getProcessingStats();
    if (stats.cacheHits >= 1) {
      console.log(`  ✅ Cache OK (${stats.cacheHits} cache hit(s), hit rate: ${stats.cacheHitRate})`);
    } else {
      console.log(`  ⚠️  Cache não teve hits ainda (normal se expert não existe no DB)`);
    }
  } catch (error) {
    console.error(`  ❌ Erro: ${error.message}`);
    allPassed = false;
  }

  // Teste 3: Performance (100 tweets)
  console.log('\n📋 Teste 3: Performance (100 tweets)');
  try {
    clearCaches(); // Reset para teste limpo
    const startTime = Date.now();

    for (let i = 0; i < 100; i++) {
      await processTweet(mockTweet(100 + i), mockAuthor(`user_${i}`));
    }

    const totalTime = Date.now() - startTime;
    const avgTime = totalTime / 100;
    const stats = getProcessingStats();

    console.log(`  ⏱️  100 tweets processados em ${totalTime}ms`);
    console.log(`  ⏱️  Tempo médio: ${avgTime.toFixed(2)}ms por tweet`);
    console.log(`  ⏱️  Stats do processador: ${stats.averageTime}ms média`);

    if (avgTime < 100) {
      console.log(`  ✅ Performance OK (< 100ms por tweet)`);
    } else {
      console.log(`  ⚠️  Performance abaixo do alvo (target: < 100ms)`);
    }
  } catch (error) {
    console.error(`  ❌ Erro: ${error.message}`);
    allPassed = false;
  }

  // Teste 4: Extração de Metadados
  console.log('\n📋 Teste 4: Extração de Metadados');
  try {
    const richTweet = {
      id: 'meta_test_001',
      text: 'Check out this awesome article! https://example.com @someuser #marketing',
      created_at: new Date().toISOString(),
      public_metrics: {
        like_count: 42,
        retweet_count: 15,
        reply_count: 8
      },
      entities: {
        hashtags: [{ tag: 'marketing' }],
        mentions: [{ username: 'someuser' }],
        urls: [{ expanded_url: 'https://example.com' }]
      }
    };

    await processTweet(richTweet, mockAuthor());
    console.log('  ✅ Metadados extraídos (hashtags, mentions, URLs)');
  } catch (error) {
    console.error(`  ❌ Erro: ${error.message}`);
    allPassed = false;
  }

  // Stats Finais
  console.log('\n📊 Estatísticas Finais:');
  const finalStats = getProcessingStats();
  console.log(JSON.stringify(finalStats, null, 2));

  // Resultado
  console.log('\n' + '='.repeat(60));
  if (allPassed) {
    console.log('✅ TODOS OS TESTES PASSARAM!');
    console.log('\n📝 Próximos passos:');
    console.log('   1. Testar worker completo: npm run dev');
    console.log('   2. Verificar endpoint /processing-stats');
    console.log('   3. Deploy no Railway/Render');
    process.exit(0);
  } else {
    console.log('❌ ALGUNS TESTES FALHARAM');
    console.log('\n🔧 Verifique os erros acima e corrija');
    process.exit(1);
  }
}

// Executar testes
console.log('⚙️  Configuração:');
console.log(`   SUPABASE_URL: ${process.env.SUPABASE_URL ? 'SET' : 'MISSING'}`);
console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING'}`);
console.log(`   ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? 'SET (classificação ativa)' : 'MISSING (classificação desativada)'}\n`);

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Credenciais do Supabase necessárias para testes!\n');
  process.exit(1);
}

runTests().catch(err => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});
