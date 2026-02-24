#!/usr/bin/env node

const http = require('http');

const profileId = 'ffff22d8-5546-4057-b070-ad9b2572a036'; // @jonascastromp4

console.log('🔄 Iniciando fresh audit...');
console.log('📊 Squad Auditores: Kahneman, Schwartz, Hormozi, Cagan, Paul Graham\n');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: `/api/profiles/${profileId}/fresh-audit`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`Status: ${res.statusCode}\n`);

    try {
      const result = JSON.parse(data);

      if (result.success) {
        console.log('✅ FRESH AUDIT CRIADO COM SUCESSO!\n');
        console.log('Audit ID:', result.audit.id);
        console.log('Posts scraped:', result.posts_scraped);
        console.log('Score Overall:', result.audit.score_overall);
        console.log('\nScores por Framework:');
        console.log('  ├─ Behavior (Kahneman):', result.audit.score_behavior);
        console.log('  ├─ Copy (Schwartz):', result.audit.score_copy);
        console.log('  ├─ Offers (Hormozi):', result.audit.score_offers);
        console.log('  ├─ Metrics (Cagan):', result.audit.score_metrics);
        console.log('  └─ Anomalies (Graham):', result.audit.score_anomalies);
      } else {
        console.log('❌ Erro:', result.error);
      }
    } catch (e) {
      console.log('❌ Erro ao parsear resposta:');
      console.log(data.substring(0, 500));
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Erro na requisição:', e.message);
});

req.end();

console.log('⏳ Aguardando resposta (pode levar 60-90 segundos)...\n');
