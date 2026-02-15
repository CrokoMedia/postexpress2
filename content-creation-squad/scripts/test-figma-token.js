#!/usr/bin/env node

/**
 * 🧪 Test Figma Token
 * Valida se o token do Figma está configurado e funcionando
 */

require('dotenv').config({ path: '../../.env.local' });
const axios = require('axios');

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;

async function testFigmaToken() {
  console.log('🔍 Testando conexão com Figma API...\n');

  if (!FIGMA_TOKEN) {
    console.error('❌ ERRO: Token do Figma não encontrado!');
    console.log('Configure FIGMA_TOKEN no arquivo .env.local\n');
    process.exit(1);
  }

  console.log('✅ Token encontrado:', FIGMA_TOKEN.substring(0, 15) + '...\n');

  try {
    // Testar endpoint /me para validar token
    const response = await axios.get('https://api.figma.com/v1/me', {
      headers: {
        'X-Figma-Token': FIGMA_TOKEN
      }
    });

    console.log('✅ Conexão bem-sucedida!');
    console.log('\n📊 Informações da conta:');
    console.log('   Nome:', response.data.handle);
    console.log('   Email:', response.data.email);
    console.log('   ID:', response.data.id);

    console.log('\n🎉 Token configurado corretamente!');
    console.log('✅ Você já pode usar os scripts do Figma\n');

    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com Figma API:');

    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Mensagem:', error.response.data.err || error.response.data.message);

      if (error.response.status === 403) {
        console.log('\n💡 Dica: Verifique se o token está correto e não expirou');
        console.log('   Gere um novo token em: https://www.figma.com/settings');
      }
    } else {
      console.error('   Erro:', error.message);
    }

    console.log('');
    process.exit(1);
  }
}

testFigmaToken();
