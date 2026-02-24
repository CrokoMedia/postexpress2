#!/usr/bin/env node

/**
 * Testar endpoints de envio de mensagem UAZapi
 */

const CONFIG = {
  serverUrl: 'https://crokolabs.uazapi.com',
  instanceToken: 'f9f51da3-be78-4ff0-8214-c858520b400e',
  instanceName: 'Croko-whatsapp',
  testPhone: '66632607531' // Número que enviou a mensagem
};

async function testSendEndpoint(endpoint, method, body, headers = {}) {
  try {
    const url = `${CONFIG.serverUrl}${endpoint}`;

    console.log(`\n🧪 Testando: ${method} ${endpoint}`);
    console.log(`   Body: ${JSON.stringify(body).substring(0, 100)}`);

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(body)
    });

    const text = await response.text();

    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Response: ${text.substring(0, 200)}`);

    if (response.status === 200 || response.status === 201) {
      console.log(`   ✅ FUNCIONOU!`);
      return true;
    }

    return false;
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Testando endpoints de envio UAZapi\n');
  console.log(`Instance: ${CONFIG.instanceName}`);
  console.log(`Token: ${CONFIG.instanceToken.substring(0, 10)}...`);
  console.log(`Telefone teste: ${CONFIG.testPhone}\n`);

  const endpoints = [
    // Formato 1: /message/sendText/{instance}
    {
      endpoint: `/message/sendText/${CONFIG.instanceName}`,
      method: 'POST',
      body: { number: CONFIG.testPhone, text: '🧪 Teste 1' },
      headers: { 'apikey': CONFIG.instanceToken }
    },
    // Formato 2: /send (sem instance na URL)
    {
      endpoint: `/send`,
      method: 'POST',
      body: {
        instance: CONFIG.instanceName,
        number: CONFIG.testPhone,
        text: '🧪 Teste 2'
      },
      headers: { 'apikey': CONFIG.instanceToken }
    },
    // Formato 3: /messages/send
    {
      endpoint: `/messages/send`,
      method: 'POST',
      body: {
        instance: CONFIG.instanceName,
        phone: CONFIG.testPhone,
        message: '🧪 Teste 3'
      },
      headers: { 'apikey': CONFIG.instanceToken }
    },
    // Formato 4: /{instance}/sendText
    {
      endpoint: `/${CONFIG.instanceName}/sendText`,
      method: 'POST',
      body: { number: CONFIG.testPhone, text: '🧪 Teste 4' },
      headers: { 'apikey': CONFIG.instanceToken }
    },
    // Formato 5: /api/sendText
    {
      endpoint: `/api/sendText`,
      method: 'POST',
      body: {
        instance: CONFIG.instanceName,
        number: CONFIG.testPhone,
        text: '🧪 Teste 5'
      },
      headers: { 'apikey': CONFIG.instanceToken }
    },
    // Formato 6: Com Authorization Bearer
    {
      endpoint: `/message/sendText/${CONFIG.instanceName}`,
      method: 'POST',
      body: { number: CONFIG.testPhone, text: '🧪 Teste 6' },
      headers: { 'Authorization': `Bearer ${CONFIG.instanceToken}` }
    }
  ];

  let working = [];

  for (const test of endpoints) {
    const success = await testSendEndpoint(
      test.endpoint,
      test.method,
      test.body,
      test.headers
    );

    if (success) {
      working.push(test);
    }

    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\n\n📊 Resumo:\n');

  if (working.length === 0) {
    console.log('❌ Nenhum endpoint funcionou.');
    console.log('\n💡 Sugestões:');
    console.log('1. Verifique no painel UAZapi se há seção de API/Documentação');
    console.log('2. Entre em contato com suporte UAZapi');
    console.log('3. Procure por "Send Message" ou "Enviar Mensagem" no painel');
  } else {
    console.log(`✅ ${working.length} endpoint(s) funcionando:\n`);
    working.forEach((w, i) => {
      console.log(`${i + 1}. ${w.method} ${w.endpoint}`);
      console.log(`   Headers: ${Object.keys(w.headers).join(', ')}`);
      console.log(`   Body: ${JSON.stringify(w.body, null, 2).substring(0, 100)}`);
      console.log('');
    });
  }
}

main().catch(console.error);
