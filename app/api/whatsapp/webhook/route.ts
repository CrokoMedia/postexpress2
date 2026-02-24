import { NextRequest, NextResponse } from 'next/server';

/**
 * Webhook UAZapi - Recebe mensagens do WhatsApp
 *
 * Formato do payload UAZapi (diferente da Evolution API padrão)
 */

interface UAZapiWebhook {
  BaseUrl: string;
  EventType: string;
  chat: {
    id: string;
    name: string;
    owner: string;
    phone: string;
    wa_chatid: string;
    wa_isGroup: boolean;
  };
  chatSource: string;
  instanceName: string;
  message: {
    chatid: string;
    content: string;
    fromMe: boolean;
    messageType: string;
    sender: string;
    senderName: string;
    text: string;
    wasSentByApi: boolean;
    messageTimestamp: number;
  };
  owner: string;
  token: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: UAZapiWebhook = await request.json();

    console.log('📱 Webhook recebido:', {
      event: body.EventType,
      instance: body.instanceName,
      from: body.message?.senderName,
      text: body.message?.text
    });

    // Ignorar mensagens enviadas por nós ou pela API
    if (body.message?.fromMe || body.message?.wasSentByApi) {
      console.log('⏭️  Ignorando: mensagem enviada por nós');
      return NextResponse.json({ status: 'ignored', reason: 'fromMe or sentByApi' });
    }

    // Ignorar mensagens de grupo
    if (body.chat?.wa_isGroup) {
      console.log('⏭️  Ignorando: mensagem de grupo');
      return NextResponse.json({ status: 'ignored', reason: 'isGroup' });
    }

    // Processar apenas mensagens novas
    if (body.EventType === 'messages') {
      return await handleNewMessage(body);
    }

    // Outros eventos
    return NextResponse.json({ status: 'ok', event: body.EventType });

  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleNewMessage(payload: UAZapiWebhook) {
  const { message, chat } = payload;

  // Extrair número do telefone (remover @s.whatsapp.net)
  const phone = message.sender.replace('@s.whatsapp.net', '');
  const senderName = message.senderName || chat.name || 'Desconhecido';
  const messageText = message.text || message.content || '';

  console.log(`📝 Nova mensagem de ${senderName} (${phone}): ${messageText}`);

  // Buscar perfil vinculado a este WhatsApp
  const userProfile = await getUserProfile(phone);

  if (userProfile) {
    console.log(`👤 Perfil identificado: @${userProfile.username}`);
  }

  // Identificar tipo de comando/intenção
  const command = messageText.trim().toLowerCase();

  // Comandos especiais
  if (command.startsWith('/')) {
    return await handleCommand(phone, command, senderName, userProfile);
  }

  // Menção de perfil Instagram
  if (command.startsWith('@')) {
    return await handleProfileAudit(phone, command, senderName);
  }

  // Texto livre = criar conteúdo
  if (messageText.length > 10) {
    return await handleContentRequest(phone, messageText, senderName, userProfile);
  }

  // Mensagem muito curta, responder com ajuda
  return await sendHelpMessage(phone);
}

async function getUserProfile(phone: string) {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('instagram_profiles')
      .select('id, username, followers_count, posts_count')
      .eq('whatsapp_phone', phone)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('❌ Erro ao buscar perfil:', error);
    return null;
  }
}

async function handleCommand(phone: string, command: string, senderName: string) {
  const cmd = command.split(' ')[0];

  console.log(`🔧 Comando recebido: ${cmd}`);

  switch (cmd) {
    case '/aprovar':
      await sendWhatsAppMessage(phone, '✅ Aprovado! Gerando seus slides agora...');
      // TODO: Acionar geração de slides
      return NextResponse.json({ status: 'approved' });

    case '/rejeitar':
      const reason = command.replace('/rejeitar', '').trim();
      await sendWhatsAppMessage(
        phone,
        `❌ Entendido! Vou criar uma nova versão.\n\nMotivo: ${reason || 'Não especificado'}`
      );
      return NextResponse.json({ status: 'rejected', reason });

    case '/status':
      await sendWhatsAppMessage(phone, '⏳ Seu conteúdo está sendo criado. Aguarde mais 1 minuto.');
      return NextResponse.json({ status: 'status_sent' });

    case '/historico':
      await sendWhatsAppMessage(
        phone,
        '📋 Últimos conteúdos:\n\n1. Marketing Digital (03/02)\n2. Vendas Online (01/02)\n3. Copywriting (28/01)'
      );
      return NextResponse.json({ status: 'history_sent' });

    case '/ajuda':
    case '/help':
      return await sendHelpMessage(phone);

    default:
      await sendWhatsAppMessage(phone, `❓ Comando "${cmd}" não reconhecido. Digite /ajuda para ver os comandos.`);
      return NextResponse.json({ status: 'unknown_command' });
  }
}

async function handleProfileAudit(phone: string, profileUsername: string, senderName: string) {
  const username = profileUsername.replace('@', '');

  console.log(`🔍 Solicitação de auditoria: ${username}`);

  await sendWhatsAppMessage(
    phone,
    `🔍 Analisando perfil @${username}...\n\nIsso pode levar até 3 minutos. Você receberá o resultado aqui mesmo! ⏳`
  );

  // TODO: Acionar Squad Auditores
  // await triggerProfileAudit(username, phone);

  return NextResponse.json({ status: 'audit_started', username });
}

async function handleContentRequest(phone: string, idea: string, senderName: string, userProfile?: any) {
  console.log(`💡 Solicitação de conteúdo de ${senderName}: ${idea}`);

  if (!userProfile) {
    await sendWhatsAppMessage(
      phone,
      `⚠️ Você ainda não tem um perfil vinculado!\n\nPara gerar conteúdo personalizado, peça ao admin para vincular seu perfil.\n\nPor enquanto, vou gerar um conteúdo genérico...`
    );
  } else {
    await sendWhatsAppMessage(
      phone,
      `💡 Entendi @${userProfile.username}! Vou criar um carrossel personalizado sobre:\n"${idea}"\n\n⏳ Gerando ideias com base no seu perfil... (30 segundos)`
    );
  }

  // Acionar Content Creation Squad de forma assíncrona
  generateContentAsync(idea, phone, senderName, userProfile).catch(error => {
    console.error('❌ Erro ao gerar conteúdo:', error);
    sendWhatsAppMessage(
      phone,
      `❌ Desculpe, ocorreu um erro ao gerar o conteúdo. Tente novamente.`
    );
  });

  return NextResponse.json({ status: 'content_started', idea, profile: userProfile?.username });
}

async function generateContentAsync(idea: string, phone: string, senderName: string, userProfile?: any) {
  try {
    console.log(`🎨 Iniciando geração de carrossel para ${senderName}...`);

    // Chamar API de geração de conteúdo
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/content/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        idea,
        phone,
        userId: senderName,
        profileId: userProfile?.id,
        username: userProfile?.username
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const carousel = data.carousel;

    console.log(`✅ Carrossel gerado: ${carousel.slides.length} slides`);

    // Montar preview do carrossel
    let preview = `🎨 *${carousel.titulo}*\n\n`;
    preview += `${carousel.descricao}\n\n`;
    preview += `📊 *${carousel.slides.length} slides:*\n\n`;

    carousel.slides.slice(0, 3).forEach((slide: any, index: number) => {
      preview += `${index + 1}. ${slide.titulo}\n`;
    });

    if (carousel.slides.length > 3) {
      preview += `... e mais ${carousel.slides.length - 3} slides\n`;
    }

    preview += `\n📝 *Legenda:*\n${carousel.legenda.substring(0, 200)}...\n\n`;
    preview += `✅ *Para aprovar:* /aprovar\n`;
    preview += `❌ *Para ajustar:* /rejeitar [motivo]`;

    await sendWhatsAppMessage(phone, preview);

    console.log(`📱 Preview enviado para ${phone}`);

  } catch (error) {
    console.error(`❌ Erro ao gerar conteúdo para ${phone}:`, error);
    throw error;
  }
}

async function sendHelpMessage(phone: string) {
  const helpText = `
🤖 *Croko Lab - Comandos disponíveis*

📝 *Criar conteúdo:*
   Envie sua ideia em texto livre
   Ex: "marketing digital para coaches"

🔍 *Auditar perfil:*
   @username
   Ex: @garyvee

✅ *Comandos:*
   /aprovar - Aprovar sugestão
   /rejeitar [motivo] - Solicitar ajustes
   /status - Ver andamento
   /historico - Últimos conteúdos
   /ajuda - Esta mensagem

💬 *Dúvidas?*
   Só me enviar uma mensagem!
  `.trim();

  await sendWhatsAppMessage(phone, helpText);
  return NextResponse.json({ status: 'help_sent' });
}

// Função auxiliar para enviar mensagem via UAZapi
async function sendWhatsAppMessage(phone: string, message: string) {
  const serverUrl = process.env.UAZAPI_SERVER_URL;
  const token = process.env.UAZAPI_INSTANCE_TOKEN;

  if (!serverUrl || !token) {
    console.error('❌ Variáveis de ambiente UAZapi não configuradas');
    return;
  }

  try {
    // Endpoint correto UAZapi: /send/text
    const response = await fetch(`${serverUrl}/send/text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'token': token
      },
      body: JSON.stringify({
        number: phone,
        text: message
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log(`✅ Mensagem enviada para ${phone}:`, result);
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error);
  }
}
