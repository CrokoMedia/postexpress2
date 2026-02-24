#!/usr/bin/env node

/**
 * Descobrir endpoints corretos da API UAZapi
 */

const CONFIG = {
  serverUrl: 'https://crokolabs.uazapi.com',
  adminToken: '7ovyqy3Yw1xRSTL9ik90yfzdYkIEW0WIhCOBqdJDG9ER0WGy7'
};

async function testEndpoint(baseUrl, endpoint, headers = {}) {
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
    const text = await response.text();

    return {
      url,
      status: response.status,
      contentType,
      isJson: contentType.includes('json'),
      body: text.substring(0, 300),
      success: response.status === 200 || response.status === 401 || response.status === 403
    };
  } catch (error) {
    return {
      url: `${baseUrl}${endpoint}`,
      error: error.message
    };
  }
}

async function discover() {
  console.log('🔍 Descobrindo endpoints UAZapi...\n');

  // Variações de base URL
  const baseUrls = [
    'https://crokolabs.uazapi.com',
    'https://crokolabs.uazapi.com/api',
    'https://crokolabs.uazapi.com/v1',
    'https://crokolabs.uazapi.com/api/v1',
    'https://crokolabs.uazapi.com/manager'
  ];

  // Variações de endpoints
  const endpoints = [
    '/',
    '/instance/fetchInstances',
    '/instance',
    '/instances',
    '/status',
    '/health',
    '/api-docs',
    '/swagger',
    '/instance/list'
  ];

  // Variações de headers
  const headerVariations = [
    { name: 'apikey', headers: { 'apikey': CONFIG.adminToken } },
    { name: 'Authorization Bearer', headers: { 'Authorization': `Bearer ${CONFIG.adminToken}` } },
    { name: 'x-api-key', headers: { 'x-api-key': CONFIG.adminToken } },
    { name: 'sem autenticação', headers: {} }
  ];

  let foundEndpoints = [];

  for (const baseUrl of baseUrls) {
    console.log(`\n📍 Testando base: ${baseUrl}\n`);

    for (const endpoint of endpoints) {
      for (const { name, headers } of headerVariations) {
        const result = await testEndpoint(baseUrl, endpoint, headers);

        if (result.success) {
          console.log(`✅ ${result.status} - ${endpoint} (header: ${name})`);
          if (result.isJson) {
            console.log(`   JSON: ${result.body}\n`);
          }
          foundEndpoints.push({ baseUrl, endpoint, headers: name, ...result });
        } else if (result.error) {
          console.log(`❌ ${endpoint} - ${result.error}`);
        }

        // Pequeno delay para não sobrecarregar
        await new Promise(r => setTimeout(r, 100));
      }
    }
  }

  console.log('\n\n📋 Resumo de endpoints encontrados:\n');

  if (foundEndpoints.length === 0) {
    console.log('⚠️  Nenhum endpoint acessível foi encontrado.');
    console.log('\n💡 Sugestões:');
    console.log('1. Verifique se a URL base está correta: https://crokolabs.uazapi.com');
    console.log('2. Consulte a documentação da sua instalação UAZapi');
    console.log('3. Verifique se o admin token está correto');
    console.log('4. Tente acessar a URL no navegador para ver se há uma interface web');
  } else {
    foundEndpoints.forEach((ep, i) => {
      console.log(`${i + 1}. ${ep.baseUrl}${ep.endpoint}`);
      console.log(`   Status: ${ep.status}`);
      console.log(`   Headers: ${ep.headers}`);
      console.log(`   Content-Type: ${ep.contentType}`);
      console.log('');
    });
  }
}

discover().catch(console.error);
