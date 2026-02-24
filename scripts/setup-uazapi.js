#!/usr/bin/env node

/**
 * Script de Setup UAZapi - Configuração completa da integração WhatsApp
 *
 * Funcionalidades:
 * 1. Lista instâncias existentes
 * 2. Cria nova instância (se necessário)
 * 3. Configura webhook
 * 4. Testa conexão
 * 5. Gera variáveis de ambiente
 */

import readline from 'readline';

// Configuração
const CONFIG = {
  serverUrl: 'https://crokolabs.uazapi.com',
  adminToken: '7ovyqy3Yw1xRSTL9ik90yfzdYkIEW0WIhCOBqdJDG9ER0WGy7'
};

// Readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Função auxiliar para fazer requests
async function apiRequest(endpoint, method = 'GET', body = null) {
  const url = `${CONFIG.serverUrl}${endpoint}`;

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': CONFIG.adminToken
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  console.log(`\n📡 ${method} ${endpoint}`);

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
    }

    return data;
  } catch (error) {
    console.error(`❌ Erro na requisição: ${error.message}`);
    throw error;
  }
}

// 1. Listar instâncias existentes
async function listInstances() {
  console.log('\n📋 Listando instâncias existentes...');

  try {
    const instances = await apiRequest('/instance/fetchInstances');

    if (!instances || instances.length === 0) {
      console.log('⚠️  Nenhuma instância encontrada.');
      return [];
    }

    console.log(`\n✅ ${instances.length} instância(s) encontrada(s):\n`);

    instances.forEach((instance, index) => {
      console.log(`${index + 1}. Nome: ${instance.instance?.instanceName || 'N/A'}`);
      console.log(`   ID: ${instance.instance?.instanceId || 'N/A'}`);
      console.log(`   Status: ${instance.instance?.status || 'N/A'}`);
      console.log(`   Conectado: ${instance.instance?.state === 'open' ? '✅ Sim' : '❌ Não'}`);
      console.log('');
    });

    return instances;
  } catch (error) {
    console.error('❌ Erro ao listar instâncias:', error.message);
    return [];
  }
}

// 2. Criar nova instância
async function createInstance(instanceName) {
  console.log(`\n🔧 Criando instância "${instanceName}"...`);

  try {
    const data = await apiRequest('/instance/create', 'POST', {
      instanceName: instanceName,
      token: CONFIG.adminToken,
      qrcode: true,
      integration: 'WHATSAPP-BAILEYS'
    });

    console.log('✅ Instância criada com sucesso!');
    console.log(`   ID: ${data.instance?.instanceId || 'N/A'}`);

    if (data.qrcode?.base64) {
      console.log('\n📱 QR Code gerado! Escaneie com WhatsApp:');
      console.log('   (O QR Code será exibido na URL abaixo ou via base64)');
    }

    return data;
  } catch (error) {
    console.error('❌ Erro ao criar instância:', error.message);
    throw error;
  }
}

// 3. Conectar instância (obter QR Code)
async function connectInstance(instanceName) {
  console.log(`\n📱 Conectando instância "${instanceName}"...`);

  try {
    const data = await apiRequest(`/instance/connect/${instanceName}`, 'GET');

    if (data.qrcode?.base64) {
      console.log('\n✅ QR Code gerado!');
      console.log('   Escaneie com seu WhatsApp para conectar.');
      console.log('\n   Base64 (primeiros 100 chars):');
      console.log(`   ${data.qrcode.base64.substring(0, 100)}...`);
    }

    return data;
  } catch (error) {
    console.error('❌ Erro ao conectar instância:', error.message);
    return null;
  }
}

// 4. Configurar webhook
async function setupWebhook(instanceName, webhookUrl) {
  console.log(`\n🔗 Configurando webhook para "${instanceName}"...`);
  console.log(`   URL: ${webhookUrl}`);

  try {
    const data = await apiRequest(`/webhook/set/${instanceName}`, 'POST', {
      url: webhookUrl,
      webhook_by_events: false,
      webhook_base64: false,
      events: [
        'QRCODE_UPDATED',
        'MESSAGES_UPSERT',
        'MESSAGES_UPDATE',
        'SEND_MESSAGE',
        'CONNECTION_UPDATE'
      ]
    });

    console.log('✅ Webhook configurado com sucesso!');
    return data;
  } catch (error) {
    console.error('❌ Erro ao configurar webhook:', error.message);
    return null;
  }
}

// 5. Testar conexão da instância
async function checkInstanceStatus(instanceName) {
  console.log(`\n🔍 Verificando status da instância "${instanceName}"...`);

  try {
    const data = await apiRequest(`/instance/connectionState/${instanceName}`, 'GET');

    const isConnected = data.state === 'open';
    console.log(`   Status: ${data.state || 'N/A'}`);
    console.log(`   Conectado: ${isConnected ? '✅ Sim' : '❌ Não'}`);

    return data;
  } catch (error) {
    console.error('❌ Erro ao verificar status:', error.message);
    return null;
  }
}

// 6. Gerar arquivo .env
function generateEnvFile(instanceId, instanceName, webhookUrl) {
  console.log('\n📝 Gerando variáveis de ambiente...\n');

  const envContent = `
# UAZapi WhatsApp Integration
UAZAPI_SERVER_URL=${CONFIG.serverUrl}
UAZAPI_ADMIN_TOKEN=${CONFIG.adminToken}
UAZAPI_INSTANCE_ID=${instanceId}
UAZAPI_INSTANCE_NAME=${instanceName}
UAZAPI_WEBHOOK_URL=${webhookUrl}

# Adicione estas variáveis ao seu arquivo .env principal
`.trim();

  console.log('─'.repeat(60));
  console.log(envContent);
  console.log('─'.repeat(60));

  return envContent;
}

// Script principal
async function main() {
  console.log('🚀 Setup UAZapi - Croko Lab\n');
  console.log('Este script vai configurar sua integração WhatsApp.\n');

  try {
    // 1. Listar instâncias existentes
    const instances = await listInstances();

    let instanceName;
    let instanceId;
    let useExisting = false;

    // 2. Escolher instância ou criar nova
    if (instances.length > 0) {
      const choice = await question(
        '\nDeseja usar uma instância existente? (s/n): '
      );

      if (choice.toLowerCase() === 's') {
        const index = await question(
          `Escolha o número da instância (1-${instances.length}): `
        );

        const selected = instances[parseInt(index) - 1];
        if (selected) {
          instanceName = selected.instance?.instanceName;
          instanceId = selected.instance?.instanceId;
          useExisting = true;
          console.log(`\n✅ Usando instância: ${instanceName}`);
        }
      }
    }

    // Criar nova instância se necessário
    if (!useExisting) {
      instanceName = await question(
        '\nDigite o nome da nova instância (ex: croko-lab-whatsapp): '
      );

      const newInstance = await createInstance(instanceName);
      instanceId = newInstance.instance?.instanceId || instanceName;

      // Conectar para obter QR Code
      await connectInstance(instanceName);

      console.log('\n⏳ Aguarde escanear o QR Code antes de continuar...');
      await question('Pressione ENTER após escanear o QR Code: ');
    }

    // 3. Verificar status da conexão
    await checkInstanceStatus(instanceName);

    // 4. Configurar webhook
    const webhookUrl = await question(
      '\nDigite a URL pública do webhook (ex: https://seu-dominio.com/api/whatsapp/webhook): '
    );

    if (webhookUrl && webhookUrl.startsWith('http')) {
      await setupWebhook(instanceName, webhookUrl);
    } else {
      console.log('⚠️  URL inválida. Webhook não configurado.');
      console.log('   Você pode configurar manualmente depois.');
    }

    // 5. Gerar variáveis de ambiente
    console.log('\n✅ Configuração concluída!');
    generateEnvFile(instanceId, instanceName, webhookUrl);

    console.log('\n📋 Próximos passos:');
    console.log('1. Copie as variáveis acima para seu arquivo .env');
    console.log('2. Reinicie sua aplicação Next.js');
    console.log('3. Teste enviando uma mensagem para o número do WhatsApp');
    console.log('\n🎉 Setup finalizado com sucesso!\n');

  } catch (error) {
    console.error('\n❌ Erro durante o setup:', error.message);
    rl.close();
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Executar
main().catch((error) => {
  console.error('❌ Erro fatal:', error.message);
  process.exit(1);
});
