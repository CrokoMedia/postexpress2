import { NextRequest, NextResponse } from 'next/server';

/**
 * API para enviar mensagens via WhatsApp (UAZapi)
 *
 * Suporta:
 * - Texto
 * - Imagens (com caption)
 * - Documentos (PDFs, ZIPs)
 * - Múltiplas imagens (carrossel)
 */

interface SendMessageRequest {
  phone: string;
  type: 'text' | 'image' | 'document' | 'images';
  text?: string;
  imageUrl?: string;
  imageUrls?: string[];
  documentUrl?: string;
  fileName?: string;
  caption?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SendMessageRequest = await request.json();

    // Validações
    if (!body.phone) {
      return NextResponse.json(
        { error: 'Campo "phone" é obrigatório' },
        { status: 400 }
      );
    }

    if (!body.type) {
      return NextResponse.json(
        { error: 'Campo "type" é obrigatório' },
        { status: 400 }
      );
    }

    // Processar por tipo
    switch (body.type) {
      case 'text':
        return await sendText(body.phone, body.text || '');

      case 'image':
        return await sendImage(body.phone, body.imageUrl || '', body.caption);

      case 'images':
        return await sendMultipleImages(body.phone, body.imageUrls || [], body.caption);

      case 'document':
        return await sendDocument(body.phone, body.documentUrl || '', body.fileName);

      default:
        return NextResponse.json(
          { error: `Tipo "${body.type}" não suportado` },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Enviar texto simples
async function sendText(phone: string, text: string) {
  const result = await uazapiRequest('/send/text', {
    number: phone,
    text: text
  });

  return NextResponse.json({
    success: true,
    type: 'text',
    phone,
    result
  });
}

// Enviar imagem única
async function sendImage(phone: string, imageUrl: string, caption?: string) {
  const result = await uazapiRequest('/send/image', {
    number: phone,
    image: imageUrl,
    caption: caption || ''
  });

  return NextResponse.json({
    success: true,
    type: 'image',
    phone,
    imageUrl,
    result
  });
}

// Enviar múltiplas imagens (carrossel de slides)
async function sendMultipleImages(phone: string, imageUrls: string[], caption?: string) {
  console.log(`📤 Enviando ${imageUrls.length} imagens para ${phone}`);

  const results = [];

  for (let i = 0; i < imageUrls.length; i++) {
    const imageUrl = imageUrls[i];
    const slideCaption = `${caption ? caption + '\n\n' : ''}📸 Slide ${i + 1}/${imageUrls.length}`;

    try {
      const result = await uazapiRequest('/send/image', {
        number: phone,
        image: imageUrl,
        caption: slideCaption
      });

      results.push({ success: true, slide: i + 1, result });

      // Pequeno delay entre envios (evitar rate limit)
      if (i < imageUrls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (error) {
      console.error(`❌ Erro ao enviar slide ${i + 1}:`, error);
      results.push({ success: false, slide: i + 1, error: String(error) });
    }
  }

  const successCount = results.filter(r => r.success).length;

  return NextResponse.json({
    success: successCount === imageUrls.length,
    type: 'images',
    phone,
    total: imageUrls.length,
    sent: successCount,
    results
  });
}

// Enviar documento (PDF, ZIP, etc)
async function sendDocument(phone: string, documentUrl: string, fileName?: string) {
  const result = await uazapiRequest('/send/file', {
    number: phone,
    file: documentUrl,
    fileName: fileName || 'documento.pdf'
  });

  return NextResponse.json({
    success: true,
    type: 'document',
    phone,
    documentUrl,
    fileName,
    result
  });
}

// Função auxiliar para fazer requisições ao UAZapi
async function uazapiRequest(endpoint: string, body: any) {
  const serverUrl = process.env.UAZAPI_SERVER_URL;
  const token = process.env.UAZAPI_INSTANCE_TOKEN;

  if (!serverUrl || !token) {
    throw new Error('Variáveis de ambiente UAZapi não configuradas');
  }

  const url = `${serverUrl}${endpoint}`;

  console.log(`📡 POST ${endpoint}`);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'token': token
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }

  return await response.json();
}

// Endpoint GET para testar configuração
export async function GET() {
  const config = {
    serverUrl: process.env.UAZAPI_SERVER_URL,
    instanceName: process.env.UAZAPI_INSTANCE_NAME,
    hasToken: !!process.env.UAZAPI_ADMIN_TOKEN,
    webhookUrl: process.env.UAZAPI_WEBHOOK_URL
  };

  return NextResponse.json({
    status: 'ok',
    message: 'UAZapi Send API',
    config: {
      ...config,
      token: config.hasToken ? '***' : 'not set'
    }
  });
}
