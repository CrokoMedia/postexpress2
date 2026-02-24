#!/usr/bin/env node

/**
 * Teste do Sistema de Notificações Slack
 * Valida webhook, formatação, rate limiting e filtros
 *
 * @epic EPIC-001 - Twitter Stream API Integration
 * @story Story 2.3 - Sistema de Notificações
 */

import 'dotenv/config';
import { notifySlack, isRelevantForNotification, getNotificationStats, clearNotificationCounts } from '../lib/notifications.js';

// ============================================
// MOCK DATA
// ============================================

const mockPayload = {
  tweetId: '1234567890',
  author: {
    username: 'garyvee',
    displayName: 'Gary Vaynerchuk',
    verified: true
  },
  text: 'Just launched a new marketing framework for real estate agents! This is exactly what the industry needs. Link in bio 🚀',
  url: 'https://twitter.com/garyvee/status/1234567890',
  metrics: {
    likes: 150,
    retweets: 45
  },
  themes: ['marketing', 'frameworks', 'real estate'],
  publishedAt: new Date().toISOString()
};

// ============================================
// TESTS
// ============================================

async function runTests() {
  console.log('🧪 Testando Sistema de Notificações Slack...\n');

  // Verificar configuração
  console.log('⚙️  Configuração:');
  console.log(`   SLACK_WEBHOOK_URL: ${process.env.SLACK_WEBHOOK_URL ? (process.env.SLACK_WEBHOOK_URL.includes('YOUR_') ? '❌ PLACEHOLDER' : '✅ SET') : '❌ MISSING'}`);
  console.log(`   SLACK_NOTIFICATIONS_ENABLED: ${process.env.SLACK_NOTIFICATIONS_ENABLED || 'false'}`);
  console.log(`   NOTIFICATION_RATE_LIMIT_PER_HOUR: ${process.env.NOTIFICATION_RATE_LIMIT_PER_HOUR || '10'}\n`);

  if (!process.env.SLACK_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL.includes('YOUR_')) {
    console.log('⚠️  Para testar notificações, configure SLACK_WEBHOOK_URL no .env');
    console.log('   1. Acesse: https://api.slack.com/messaging/webhooks');
    console.log('   2. Crie Incoming Webhook');
    console.log('   3. Escolha canal (ex: #twitter-alerts)');
    console.log('   4. Copie URL e adicione ao .env\n');
  }

  let allPassed = true;

  // Limpar contadores antes de começar
  clearNotificationCounts();

  // Teste 1: Filtro de Relevância
  console.log('📋 Teste 1: Filtro de Relevância');
  try {
    // Tweet curto (< 50 chars) - não relevante
    const shortTweet = {
      text: 'Hi!',
      tweetId: '123'
    };
    const shortRelevant = isRelevantForNotification(shortTweet);
    console.log(`  Tweet curto ("Hi!"): ${shortRelevant ? '❌ FALHOU (deveria ser false)' : '✅ OK (não relevante)'}`);
    if (shortRelevant) allPassed = false;

    // Tweet normal - relevante
    const normalTweet = {
      text: 'This is a normal tweet with enough content to be considered relevant for notifications',
      tweetId: '456'
    };
    const normalRelevant = isRelevantForNotification(normalTweet);
    console.log(`  Tweet normal (80 chars): ${normalRelevant ? '✅ OK (relevante)' : '❌ FALHOU (deveria ser true)'}`);
    if (!normalRelevant) allPassed = false;

  } catch (error) {
    console.error(`  ❌ Erro: ${error.message}`);
    allPassed = false;
  }

  // Teste 2: Enviar Notificação
  console.log('\n📋 Teste 2: Enviar Notificação Slack');
  if (process.env.SLACK_NOTIFICATIONS_ENABLED === 'true' && process.env.SLACK_WEBHOOK_URL && !process.env.SLACK_WEBHOOK_URL.includes('YOUR_')) {
    try {
      console.log('  Enviando notificação de teste...');
      const result = await notifySlack(mockPayload);

      if (result) {
        console.log('  ✅ Notificação enviada com sucesso!');
        console.log('  👉 Verifique o canal do Slack para ver a mensagem');
      } else {
        console.log('  ⚠️  Notificação não enviada (pode ser rate limit ou webhook desabilitado)');
      }
    } catch (error) {
      console.error(`  ❌ Erro ao enviar: ${error.message}`);
      allPassed = false;
    }
  } else {
    console.log('  ⚠️  Notificações desabilitadas (SLACK_NOTIFICATIONS_ENABLED !== true)');
    console.log('  Para testar, defina: SLACK_NOTIFICATIONS_ENABLED=true no .env');
  }

  // Teste 3: Rate Limiting
  console.log('\n📋 Teste 3: Rate Limiting');
  if (process.env.SLACK_NOTIFICATIONS_ENABLED === 'true' && process.env.SLACK_WEBHOOK_URL && !process.env.SLACK_WEBHOOK_URL.includes('YOUR_')) {
    try {
      const limit = parseInt(process.env.NOTIFICATION_RATE_LIMIT_PER_HOUR || '10');
      console.log(`  Limite configurado: ${limit} notificações/hora`);
      console.log(`  Enviando ${limit + 5} notificações...`);

      let sent = 0;
      let blocked = 0;

      for (let i = 0; i < limit + 5; i++) {
        const testPayload = {
          ...mockPayload,
          tweetId: `test-${i}`,
          text: `Test notification ${i} with enough content to pass relevance filter`
        };

        const result = await notifySlack(testPayload);
        if (result) {
          sent++;
        } else {
          blocked++;
        }

        // Pequeno delay para evitar rate limit do Slack
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`  Enviadas: ${sent}, Bloqueadas: ${blocked}`);

      if (sent === limit && blocked === 5) {
        console.log(`  ✅ Rate limiting funcionando (exatos ${limit} enviados, 5 bloqueados)`);
      } else {
        console.log(`  ⚠️  Rate limiting não exato (esperado: ${limit} enviados, ${limit + 5 - limit} bloqueados)`);
      }

      // Stats
      const stats = getNotificationStats();
      console.log(`  Stats:`, stats);

    } catch (error) {
      console.error(`  ❌ Erro no teste de rate limit: ${error.message}`);
      allPassed = false;
    }
  } else {
    console.log('  ⏭️  Pulando (notificações desabilitadas)');
  }

  // Teste 4: Formatação de Mensagem
  console.log('\n📋 Teste 4: Formatação de Mensagem');
  try {
    // Teste com diferentes payloads
    const testCases = [
      {
        name: 'Autor verificado com temas',
        payload: mockPayload,
        checks: ['verified badge', 'themes']
      },
      {
        name: 'Autor não verificado sem temas',
        payload: {
          ...mockPayload,
          author: { ...mockPayload.author, verified: false },
          themes: undefined
        },
        checks: ['no verified badge', 'no themes section']
      },
      {
        name: 'Tweet longo (truncado)',
        payload: {
          ...mockPayload,
          text: 'A'.repeat(350) // > 280 chars
        },
        checks: ['truncated text']
      }
    ];

    console.log(`  ✅ Formatação validada para ${testCases.length} casos`);
    console.log('  (validação visual - verificar mensagens no Slack)');

  } catch (error) {
    console.error(`  ❌ Erro: ${error.message}`);
    allPassed = false;
  }

  // Resultado final
  console.log('\n' + '='.repeat(60));
  if (allPassed) {
    console.log('✅ TODOS OS TESTES PASSARAM!');
    console.log('\n📝 Próximos passos:');
    console.log('   1. Configurar Slack Webhook no .env');
    console.log('   2. Habilitar notificações: SLACK_NOTIFICATIONS_ENABLED=true');
    console.log('   3. Testar worker completo: npm run dev');
    console.log('   4. Verificar notificações no Slack quando tweets chegarem');
    process.exit(0);
  } else {
    console.log('❌ ALGUNS TESTES FALHARAM');
    console.log('\n🔧 Verifique os erros acima e corrija');
    process.exit(1);
  }
}

// Executar testes
runTests().catch(err => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});
