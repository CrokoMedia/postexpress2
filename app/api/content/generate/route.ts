import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

/**
 * API para gerar carrosséis usando Content Creation Squad
 *
 * POST /api/content/generate
 * Body: { idea: string, phone?: string }
 */

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

interface GenerateRequest {
  idea: string;
  phone?: string;
  userId?: string;
  profileId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();

    if (!body.idea) {
      return NextResponse.json(
        { error: 'Campo "idea" é obrigatório' },
        { status: 400 }
      );
    }

    console.log(`🎨 Gerando carrossel: "${body.idea}"`);

    // Gerar carrossel usando Claude
    const carousel = await generateCarousel(body.idea);

    console.log(`✅ Carrossel gerado: ${carousel.slides.length} slides`);

    // Salvar no Supabase (content_suggestions table)
    const suggestionId = await saveContentSuggestion({
      idea: body.idea,
      phone: body.phone,
      userId: body.userId,
      profileId: body.profileId,
      carousel
    });

    return NextResponse.json({
      success: true,
      carousel,
      phone: body.phone,
      suggestionId
    });

  } catch (error) {
    console.error('❌ Erro ao gerar carrossel:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar carrossel' },
      { status: 500 }
    );
  }
}

async function generateCarousel(idea: string) {
  const prompt = `Você é um especialista em criar carrosséis de alta conversão para Instagram e LinkedIn.

Crie um carrossel sobre: "${idea}"

## Instruções:

1. **Título do carrossel** (gancho poderoso)
2. **7-10 slides** com:
   - Título curto (máx 40 caracteres)
   - Texto principal (2-3 linhas, máx 150 caracteres)
   - Visual sugerido (descrição breve)

3. **Slide final** com CTA forte

## Formato de saída (JSON):

\`\`\`json
{
  "titulo": "...",
  "descricao": "...",
  "slides": [
    {
      "numero": 1,
      "titulo": "...",
      "texto": "...",
      "visual": "..."
    }
  ],
  "cta": "...",
  "legenda": "..."
}
\`\`\`

## Regras:
- Linguagem direta e conversacional
- Foco em transformação/resultado
- Ganchos emocionais fortes
- Mobile-first (textos curtos)
- CTA claro e acionável

Gere o carrossel agora em JSON válido.`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  // Extrair JSON da resposta
  const responseText = message.content[0].type === 'text'
    ? message.content[0].text
    : '';

  // Tentar extrair JSON do código
  const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) ||
                    responseText.match(/```\n([\s\S]*?)\n```/);

  let carouselData;

  if (jsonMatch) {
    carouselData = JSON.parse(jsonMatch[1]);
  } else {
    // Tentar parsear a resposta inteira como JSON
    carouselData = JSON.parse(responseText);
  }

  return carouselData;
}

async function saveContentSuggestion(data: {
  idea: string;
  phone?: string;
  userId?: string;
  profileId?: string;
  carousel: any;
}) {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: suggestion, error } = await supabase
    .from('content_suggestions')
    .insert({
      profile_id: data.profileId || null,
      whatsapp_phone: data.phone || '',
      idea: data.idea,
      sender_name: data.userId || 'Desconhecido',
      carousel_data: data.carousel,
      status: 'pending'
    })
    .select('id')
    .single();

  if (error) {
    console.error('❌ Erro ao salvar sugestão:', error);
    throw error;
  }

  console.log(`✅ Sugestão salva: ${suggestion.id}`);
  return suggestion.id;
}
