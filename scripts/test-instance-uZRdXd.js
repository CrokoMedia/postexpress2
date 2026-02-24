#!/usr/bin/env node

/**
 * Teste com instância específica: uZRdXd
 */

const CONFIG = {
  serverUrl: 'https://crokolabs.uazapi.com',
  adminToken: '7ovyqy3Yw1xRSTL9ik90yfzdYkIEW0WIhCOBqdJDG9ER0WGy7',
  instanceName: 'uZRdXd',
  systemName: 'crokolabs'
};

async function testWithInstance() {
  console.log('🧪 Testando com instância específica...\n');
  console.log(`Instance: ${CONFIG.instanceName}`);
  console.log(`System: ${CONFIG.systemName}\n`);

  // Variações de URL base
  const baseUrls = [
    'https://crokolabs.uazapi.com',
    'https://uazapi.com',
    `https://${CONFIG.systemName}.uazapi.com`,
    'https://api.uazapi.com',
    'https://crokolabs.uazapi.com/api'
  ];

  // Endpoints com nome da instância
  const endpoints = [
    `/instance/connectionState/${CONFIG.instanceName}`,
    `/instance/connect/${CONFIG.instanceName}`,
    `/${CONFIG.instanceName}/instance/connectionState`,
    `/${CONFIG.instanceName}/status`,
    `/instance/${CONFIG.instanceName}`,
    `/instance/${CONFIG.instanceName}/status`,
    `/instance/fetchInstances`,
    `/instance`,
    `/instances`
  ];

  // Variações de autenticação
  const authVariations = [
    { name: 'apikey', headers: { 'apikey': CONFIG.adminToken } },
    { name: 'Bearer', headers: { 'Authorization': `Bearer ${CONFIG.adminToken}` } },
    { name: 'x-api-key', headers: { 'x-api-key': CONFIG.adminToken } },
    { name: 'apiToken', headers: { 'apiToken': CONFIG.adminToken } }
  ];

  const results = [];

  for (const baseUrl of baseUrls) {
    console.log(`\n📍 Base: ${baseUrl}`);

    for (const endpoint of endpoints) {
      for (const { name: authName, headers } of authVariations) {
        try {
          const url = `${baseUrl}${endpoint}`;
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...headers
            }
          });

          const contentType = response.headers.get('content-type') || '';

          if (response.status !== 404) {
            const text = await response.text();

            console.log(`✅ ${response.status} - ${endpoint} (${authName})`);
            console.log(`   Content-Type: ${contentType}`);

            if (contentType.includes('json')) {
              try {
                const json = JSON.parse(text);
                console.log(`   Response: ${JSON.stringify(json, null, 2).substring(0, 200)}`);
              } catch (e) {
                console.log(`   Body: ${text.substring(0, 100)}`);
              }
            } else {
              console.log(`   Body: ${text.substring(0, 100)}`);
            }

            results.push({
              baseUrl,
              endpoint,
              auth: authName,
              status: response.status,
              contentType,
              success: response.status === 200 || response.status === 401 || response.status === 403
            });
          }
        } catch (error) {
          // Silenciar erros de 404
        }

        await new Promise(r => setTimeout(r, 50));
      }
    }
  }

  console.log('\n\n📊 Resultados:\n');

  if (results.length === 0) {
    console.log('❌ Nenhum endpoint respondeu (todos 404).\n');
    console.log('💡 Sugestões:');
    console.log('1. Acesse https://crokolabs.uazapi.com no navegador');
    console.log('2. Procure por painel de admin/manager');
    console.log('3. Verifique a documentação ou entre em contato com suporte');
    console.log('4. Pode ser que precise de VPN ou autenticação adicional');
  } else {
    console.log(`✅ ${results.length} endpoint(s) acessível(is):\n`);

    results.forEach((r, i) => {
      console.log(`${i + 1}. ${r.baseUrl}${r.endpoint}`);
      console.log(`   Auth: ${r.auth}`);
      console.log(`   Status: ${r.status}`);
      console.log(`   Type: ${r.contentType}`);
      console.log('');
    });

    console.log('\n💡 Use esses endpoints nos scripts de integração!');
  }
}

testWithInstance().catch(console.error);
