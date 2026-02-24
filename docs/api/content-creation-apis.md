# Content Creation APIs - Documentação Técnica

> APIs backend para o fluxo de criação de carrosséis otimizado (One-Click Smart + Bulk Actions + Preview)
>
> **Versão:** 1.0
> **Data:** 2026-02-23
> **Desenvolvedor:** Backend Team

---

## 📋 Índice

1. [POST /api/audits/[id]/generate-smart](#1-post-apiauditsidgenerate-smart)
2. [POST /api/audits/[id]/apply-bulk-action](#2-post-apiauditsidapply-bulk-action)
3. [GET /api/audits/[id]/apply-bulk-action](#3-get-apiauditsidapply-bulk-action)
4. [GET /api/audits/[id]/preview-slide](#4-get-apiauditsidpreview-slide)
5. [Tipos TypeScript](#5-tipos-typescript)
6. [Exemplos de Integração](#6-exemplos-de-integração)
7. [Error Handling](#7-error-handling)

---

## 1. POST /api/audits/[id]/generate-smart

### Descrição
Gera carrosséis automaticamente com IA decidindo template, formato, tema e estratégia de imagens.

### Endpoint
```
POST /api/audits/[id]/generate-smart
```

### Request
**Body:** Vazio (IA decide tudo automaticamente)

**Headers:**
```
Content-Type: application/json
```

### Response (Success - 200)
```typescript
{
  success: true,
  audit_id: string,
  profile: string,
  content: {
    carousels: Carousel[],
    estrategia_geral: string,
    proximos_passos: string[]
  },
  config: {
    template: 'minimalist' | 'bold-gradient' | 'professional' | 'modern' | 'clean' | 'gradient',
    format: 'feed' | 'story' | 'square',
    theme: 'light' | 'dark',
    imageStrategy: Record<number, Record<number, {
      mode: 'auto' | 'no_image' | 'custom_prompt' | 'upload',
      customPrompt?: string
    }>>
  },
  reasoning: {
    profileAnalysis: string,
    profileType: 'educacional' | 'vendas' | 'autoridade' | 'viral',
    templateChoice: string,
    formatChoice: string,
    themeChoice: string,
    imageStrategyReasoning: string[]
  },
  generated_at: string
}
```

### Lógica de Decisão Automática

#### 1. Tipo de Perfil
- **Educacional**: biografia menciona "ensino", "dicas", "framework" + score_copy > 65
- **Vendas**: biografia menciona "produto", "serviço", "mentor" + score_offers > 60
- **Autoridade**: biografia com "CEO", "PhD", "Expert" OU scores consistentemente altos (>70)
- **Viral**: engagement_rate > 3.0 + score_anomalies > 60

#### 2. Template
- Educacional → `minimalist` (foco no conteúdo)
- Vendas → `bold-gradient` (visual impactante)
- Autoridade → `professional` (transmite credibilidade)
- Viral → `gradient` (cores vibrantes)

#### 3. Formato
- Se top_formats inclui "Reels" → `story` (9:16)
- Se top_formats inclui "Sidecar" → `feed` (4:5)
- Default → `feed` (mais versátil)

#### 4. Tema
- Se profile_context.brandColors tem cores escuras → `dark`
- Default → `light` (mais legível)

#### 5. Estratégia de Imagens (por slide)
- Slide com números/dados (ex: "50%", "R$ 100") → `no_image`
- Slide menciona marca/ferramenta (ex: "Instagram", "Canva") → `auto`
- Primeiro slide (hook) → sempre `auto`
- CTA final → `no_image` (foco no texto)
- Demais slides → `auto` (IA decide)

### Performance
- **Tempo médio:** 30-40 segundos
- **Custos:** 1 chamada Claude API (~$0.05)

### Exemplo de Uso (Frontend)
```typescript
const response = await fetch(`/api/audits/${auditId}/generate-smart`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})

const data = await response.json()

if (data.success) {
  console.log('Tipo de perfil:', data.reasoning.profileType)
  console.log('Template escolhido:', data.config.template)
  console.log('Carrosséis gerados:', data.content.carousels.length)

  // Exibir reasoning ao usuário (tooltips educativos)
  showTooltip('Template', data.reasoning.templateChoice)
}
```

### Errors
- `404`: Auditoria não encontrada
- `500`: Erro ao gerar conteúdo ou salvar no banco

---

## 2. POST /api/audits/[id]/apply-bulk-action

### Descrição
Aplica ações em massa em múltiplos slides de um carrossel.

### Endpoint
```
POST /api/audits/[id]/apply-bulk-action
```

### Request
```typescript
{
  carouselIndex: number,        // Índice do carrossel (0-based)
  action: 'auto' | 'no_image' | 'custom_prompt' | 'upload' | 'copy_from',
  targetSlides: number[] | 'all',  // Slides alvo ou "all"
  data?: {
    customPrompt?: string,         // Obrigatório se action = 'custom_prompt'
    uploadUrl?: string,            // Obrigatório se action = 'upload'
    uploadPublicId?: string,       // Opcional (Cloudinary public_id)
    sourceCarouselIndex?: number   // Obrigatório se action = 'copy_from'
  }
}
```

### Response (Success - 200)
```typescript
{
  success: true,
  message: string,
  updatedConfig: Record<number, {
    mode: 'auto' | 'no_image' | 'custom_prompt' | 'upload',
    customPrompt?: string,
    uploadUrl?: string,
    uploadPublicId?: string
  }>,
  carouselIndex: number,
  targetSlides: number[]
}
```

### Validações
- `carouselIndex` deve ser número >= 0
- `action` deve ser um dos valores válidos
- `targetSlides` não pode ser array vazio
- `customPrompt` obrigatório se action = 'custom_prompt'
- `customPrompt` máximo 500 caracteres
- `uploadUrl` obrigatório se action = 'upload'
- `uploadUrl` deve começar com http/https
- `sourceCarouselIndex` obrigatório se action = 'copy_from'
- `sourceCarouselIndex` não pode ser igual a `carouselIndex`

### Exemplos de Uso

#### Exemplo 1: Aplicar "sem imagem" em todos os slides
```typescript
await fetch(`/api/audits/${auditId}/apply-bulk-action`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    carouselIndex: 0,
    action: 'no_image',
    targetSlides: 'all'
  })
})
```

#### Exemplo 2: Custom prompt em slides específicos
```typescript
await fetch(`/api/audits/${auditId}/apply-bulk-action`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    carouselIndex: 1,
    action: 'custom_prompt',
    targetSlides: [0, 2, 4, 6],
    data: {
      customPrompt: 'professional office desk with laptop, natural lighting'
    }
  })
})
```

#### Exemplo 3: Upload mesma imagem para múltiplos slides
```typescript
await fetch(`/api/audits/${auditId}/apply-bulk-action`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    carouselIndex: 0,
    action: 'upload',
    targetSlides: [1, 3, 5],
    data: {
      uploadUrl: 'https://res.cloudinary.com/xyz/image.png',
      uploadPublicId: 'folder/image_abc123'
    }
  })
})
```

#### Exemplo 4: Copiar config de outro carrossel
```typescript
await fetch(`/api/audits/${auditId}/apply-bulk-action`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    carouselIndex: 2,
    action: 'copy_from',
    targetSlides: 'all',
    data: {
      sourceCarouselIndex: 0
    }
  })
})
```

### Errors
- `400`: Validação falhou (ver mensagem de erro)
- `404`: Auditoria, carrossel ou slide não encontrado
- `500`: Erro ao salvar no banco

---

## 3. GET /api/audits/[id]/apply-bulk-action

### Descrição
Retorna as configurações de imagem atuais de um carrossel.

### Endpoint
```
GET /api/audits/[id]/apply-bulk-action?carouselIndex=0
```

### Query Params
- `carouselIndex` (obrigatório): Índice do carrossel (0-based)

### Response (Success - 200)
```typescript
{
  success: true,
  carouselIndex: number,
  carouselTitle: string,
  totalSlides: number,
  configs: Record<number, {
    mode: 'auto' | 'no_image' | 'custom_prompt' | 'upload',
    customPrompt?: string,
    uploadUrl?: string,
    uploadPublicId?: string
  }>
}
```

### Exemplo de Uso
```typescript
const response = await fetch(
  `/api/audits/${auditId}/apply-bulk-action?carouselIndex=0`
)
const data = await response.json()

console.log('Total de slides:', data.totalSlides)
console.log('Config do slide 0:', data.configs[0])
```

### Errors
- `400`: carouselIndex ausente ou inválido
- `404`: Auditoria ou carrossel não encontrado

---

## 4. GET /api/audits/[id]/preview-slide

### Descrição
Gera preview SVG instantâneo de um slide específico.

### Endpoint
```
GET /api/audits/[id]/preview-slide?carouselIndex=0&slideIndex=0&template=minimalist&format=feed&theme=light
```

### Query Params
- `carouselIndex` (obrigatório): Índice do carrossel (0-based)
- `slideIndex` (obrigatório): Índice do slide (0-based)
- `template` (opcional): Template visual (default: `minimalist`)
- `format` (opcional): Formato do slide (default: `feed`)
- `theme` (opcional): Tema de cores (default: `light`)

### Templates Disponíveis
- `minimalist`: Minimalista, foco no conteúdo
- `bold-gradient`: Bold com gradientes vibrantes
- `professional`: Profissional, clean e sério
- `modern`: Moderno, contemporâneo
- `clean`: Limpo, espaçamento generoso
- `gradient`: Gradientes impactantes

### Formatos Disponíveis
- `feed`: 1080×1350 (4:5) - Instagram Feed
- `story`: 1080×1920 (9:16) - Stories/Reels
- `square`: 1080×1080 (1:1) - Post quadrado

### Temas Disponíveis
- `light`: Fundo claro, texto escuro
- `dark`: Fundo escuro, texto claro

### Response (Success - 200)
**Content-Type:** `image/svg+xml`

**Headers:**
```
Content-Type: image/svg+xml
Cache-Control: public, max-age=300
X-Generation-Time: 23ms
```

**Body:** SVG XML direto

### Performance
- **Tempo médio:** <50ms (10x mais rápido que meta de 500ms)
- **Cache:** 5 minutos (HTTP Cache-Control)
- **Peso:** ~5-10 KB (SVG compacto)

### Exemplo de Uso (Frontend)
```tsx
// React component
<img
  src={`/api/audits/${auditId}/preview-slide?carouselIndex=${carouselIndex}&slideIndex=${slideIndex}&template=${template}&format=${format}&theme=${theme}`}
  alt={`Preview slide ${slideIndex + 1}`}
  className="w-full h-auto"
/>
```

```typescript
// Fetch programático
const previewUrl = `/api/audits/${auditId}/preview-slide?` + new URLSearchParams({
  carouselIndex: '0',
  slideIndex: '0',
  template: 'minimalist',
  format: 'feed',
  theme: 'light'
})

const response = await fetch(previewUrl)
const svgText = await response.text()

// Renderizar no DOM
previewContainer.innerHTML = svgText
```

### Errors
- `400`: Parâmetros inválidos (carouselIndex, slideIndex, template, format, theme)
- `404`: Auditoria, carrossel ou slide não encontrado
- `500`: Erro ao gerar SVG

---

## 5. Tipos TypeScript

### Tipos de Template
```typescript
type TemplateId =
  | 'minimalist'
  | 'bold-gradient'
  | 'professional'
  | 'modern'
  | 'clean'
  | 'gradient'
```

### Tipos de Formato
```typescript
type LayoutFormat =
  | 'feed'    // 1080×1350 (4:5)
  | 'story'   // 1080×1920 (9:16)
  | 'square'  // 1080×1080 (1:1)
```

### Tipos de Tema
```typescript
type ThemeMode = 'light' | 'dark'
```

### Tipos de Modo de Imagem
```typescript
type ImageMode =
  | 'auto'           // IA decide e gera imagem
  | 'no_image'       // Slide sem imagem
  | 'custom_prompt'  // Usuário fornece prompt customizado
  | 'upload'         // Usuário faz upload da imagem
```

### Tipos de Ação em Massa
```typescript
type BulkActionType =
  | 'auto'
  | 'no_image'
  | 'custom_prompt'
  | 'upload'
  | 'copy_from'
```

### Configuração de Imagem de Slide
```typescript
interface SlideImageConfig {
  mode: ImageMode
  customPrompt?: string
  uploadUrl?: string
  uploadPublicId?: string
}
```

### Smart Config (generate-smart)
```typescript
interface SmartConfig {
  template: TemplateId
  format: LayoutFormat
  theme: ThemeMode
  imageStrategy: Record<number, Record<number, SlideImageConfig>>
}
```

### Smart Reasoning (generate-smart)
```typescript
interface SmartReasoning {
  profileAnalysis: string
  profileType: 'educacional' | 'vendas' | 'autoridade' | 'viral'
  templateChoice: string
  formatChoice: string
  themeChoice: string
  imageStrategyReasoning: string[]
}
```

---

## 6. Exemplos de Integração

### Fluxo Completo: One-Click Smart → Preview → Bulk Action

```typescript
// FASE 1: Gerar carrosséis automaticamente
const generateResponse = await fetch(`/api/audits/${auditId}/generate-smart`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})

const { content, config, reasoning } = await generateResponse.json()

console.log('✅ Gerado:', content.carousels.length, 'carrosséis')
console.log('📐 Template:', config.template)
console.log('📊 Formato:', config.format)

// FASE 2: Exibir preview do primeiro carrossel
const firstCarousel = content.carousels[0]
const previewsHtml = firstCarousel.slides.map((slide, idx) => `
  <img
    src="/api/audits/${auditId}/preview-slide?carouselIndex=0&slideIndex=${idx}&template=${config.template}&format=${config.format}&theme=${config.theme}"
    alt="Slide ${idx + 1}"
  />
`).join('')

previewContainer.innerHTML = previewsHtml

// FASE 3: Usuário aprova e aplica ação em massa
// "Quero todos os slides sem imagem"
await fetch(`/api/audits/${auditId}/apply-bulk-action`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    carouselIndex: 0,
    action: 'no_image',
    targetSlides: 'all'
  })
})

console.log('✅ Configuração aplicada em todos os slides')

// FASE 4: Gerar PNGs finais (API já existente)
await fetch(`/api/content/${contentSuggestionId}/generate-slides-v3`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    template: config.template,
    format: config.format,
    theme: config.theme
  })
})
```

### Hook React para Preview
```tsx
import { useState, useEffect } from 'react'

function useSlidePreview(
  auditId: string,
  carouselIndex: number,
  slideIndex: number,
  template: TemplateId,
  format: LayoutFormat,
  theme: ThemeMode
) {
  const [previewUrl, setPreviewUrl] = useState<string>('')

  useEffect(() => {
    const url = `/api/audits/${auditId}/preview-slide?` + new URLSearchParams({
      carouselIndex: String(carouselIndex),
      slideIndex: String(slideIndex),
      template,
      format,
      theme
    })

    setPreviewUrl(url)
  }, [auditId, carouselIndex, slideIndex, template, format, theme])

  return previewUrl
}

// Uso no component
function SlidePreview({ auditId, carouselIndex, slideIndex, config }) {
  const previewUrl = useSlidePreview(
    auditId,
    carouselIndex,
    slideIndex,
    config.template,
    config.format,
    config.theme
  )

  return <img src={previewUrl} alt={`Slide ${slideIndex + 1}`} />
}
```

---

## 7. Error Handling

### Padrão de Resposta de Erro
```typescript
{
  error: string,           // Mensagem de erro legível
  details?: string         // Detalhes técnicos (opcional)
}
```

### Status Codes
- `400`: Bad Request (validação falhou)
- `404`: Not Found (recurso não existe)
- `429`: Rate Limit (muitas requisições) - *não implementado ainda*
- `500`: Internal Server Error (erro no servidor)

### Exemplo de Tratamento de Erros (Frontend)
```typescript
async function generateSmartContent(auditId: string) {
  try {
    const response = await fetch(`/api/audits/${auditId}/generate-smart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!response.ok) {
      const error = await response.json()

      if (response.status === 404) {
        showNotification('Auditoria não encontrada', 'error')
      } else if (response.status === 500) {
        showNotification(`Erro ao gerar: ${error.error}`, 'error')
        console.error('Detalhes:', error.details)
      } else {
        showNotification('Erro desconhecido', 'error')
      }

      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Erro de rede:', error)
    showNotification('Erro de conexão com o servidor', 'error')
    return null
  }
}
```

---

## 📝 Notas de Implementação

### Segurança
- Todas as APIs validam input
- Sanitização de Unicode surrogates inválidos
- Proteção contra XSS (escaping de XML no SVG)
- Nenhuma exposição de dados sensíveis nos logs

### Performance
- `generate-smart`: ~30-40s (Claude API call)
- `apply-bulk-action`: <100ms (CRUD no banco)
- `preview-slide`: <50ms (SVG generation)
- Cache HTTP de 5 minutos no preview

### Logs
Todas as APIs logam no console:
- `🧠 [generate-smart]` - Geração automática
- `⚡ [bulk-action]` - Ações em massa
- `👁️ [preview-slide]` - Preview de slides

### Compatibilidade
- Next.js 15 App Router
- TypeScript strict mode
- Node.js 18+
- Supabase PostgreSQL

---

## 🚀 Próximos Passos

1. ✅ APIs implementadas e testáveis
2. ⏳ QA realizar testes de integração
3. ⏳ Frontend integrar com componentes React
4. ⏳ Adicionar rate limiting (10 req/hora por usuário)
5. ⏳ Implementar autenticação via Supabase Auth
6. ⏳ Adicionar métricas de uso (analytics)

---

**Versão:** 1.0
**Última atualização:** 2026-02-23
**Autor:** Backend Team (@dev-backend)
