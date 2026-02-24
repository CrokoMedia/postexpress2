#!/usr/bin/env node

/**
 * Teste de conexão UAZapi - Debug
 */

const CONFIG = {
  serverUrl: 'https://crokolabs.uazapi.com',
  adminToken: '7ovyqy3Yw1xRSTL9ik90yfzdYkIEW0WIhCOBqdJDG9ER0WGy7'
};

async function testConnection() {
  console.log('🧪 Testando conexão com UAZapi...\n');
  console.log(`Server: ${CONFIG.serverUrl}`);
  console.log(`Token: ${CONFIG.adminToken.substring(0, 10)}...\n`);

  const endpoints = [
    '/instance/fetchInstances',
    '/instance',
    '/',
    '/status'
  ];

  for (const endpoint of endpoints) {
    console.log(`📡 Testando: ${endpoint}`);

    try {
      const url = `${CONFIG.serverUrl}${endpoint}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': CONFIG.adminToken
        }
      });

      console.log(`   Status: ${response.status} ${response.statusText}`);
      console.log(`   Content-Type: ${response.headers.get('content-type')}`);

      const text = await response.text();
      console.log(`   Body (primeiros 200 chars):`);
      console.log(`   ${text.substring(0, 200)}\n`);

      // Tentar parsear como JSON
      try {
        const json = JSON.parse(text);
        console.log(`   ✅ JSON válido:`, json);
      } catch (e) {
        console.log(`   ⚠️  Não é JSON válido`);
      }

    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`);
    }

    console.log('');
  }
}

testConnection().catch(console.error);
