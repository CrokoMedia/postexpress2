# Arquitetura Brownfield: Refatoração do Sistema de Criação de Conteúdo

**Projeto:** Post Express
**Módulo:** Content Creation System
**Tipo:** Refatoração Brownfield (Sistema Existente)
**Versão:** 2.0
**Data:** 2026-02-21
**Arquiteto:** Aria (Claude Code)

---

## 📋 Sumário Executivo

### Problema Atual
O sistema de criação de conteúdo sofre de **acoplamento excessivo** e **confusão conceitual**, resultando em:
- ❌ Página principal com **1593 linhas** gerenciando 3 conceitos distintos
- ❌ Usuário confuso sobre onde encontrar funcionalidades
- ❌ Impossibilidade de deletar conteúdo gerado
- ❌ Mistura de slides estáticos (PNG) com reels animados (MP4)

### Solução Proposta
**Separação de Responsabilidades** seguindo o princípio Single Responsibility:
- ✅ Hub de navegação simples
- ✅ 3 módulos independentes (Carrosséis, Slides, Reels)
- ✅ APIs de DELETE para todos os tipos de conteúdo
- ✅ UX clara e intuitiva

### Impacto
- **Redução de 70% na complexidade** da página principal
- **Navegação 3x mais clara** (usuário sabe exatamente onde está)
- **Deletar conteúdo** reduz custos de armazenamento (Cloudinary)

---

## 🎯 Objetivos da Refatoração

### Objetivos Primários
1. **Separar conceitos distintos** em páginas dedicadas
2. **Adicionar funcionalidade DELETE** para carrosséis, slides e reels
3. **Simplificar UX** com navegação clara
4. **Manter compatibilidade** com dados existentes no Supabase

### Objetivos Secundários
1. Reduzir tamanho dos arquivos (< 500 linhas por página)
2. Facilitar manutenção futura
3. Permitir evolução independente de cada módulo

### Não-Objetivos
- ❌ Não alterar lógica de geração de conteúdo (Claude API)
- ❌ Não modificar estrutura do banco de dados (migrations futuras apenas)
- ❌ Não adicionar novas features (apenas refatoração)

---

## 📊 Análise do Estado Atual

### Estrutura Existente

```
app/dashboard/audits/[id]/create-content/
├── page.tsx (1593 linhas) ⚠️ PROBLEMA
│   ├── Geração de carrosséis de texto
│   ├── Aprovação/Edição de carrosséis
│   ├── Geração de slides V1 (template padrão)
│   ├── Geração de slides V2/V3 (com IA)
│   ├── Geração de reels MP4 (Remotion)
│   ├── Download ZIP de slides
│   ├── Export para Google Drive
│   └── Variações de carrosséis
│
├── slides/page.tsx (2581 linhas) ⚠️ PROBLEMA
│   └── Configuração de imagens por slide
│
└── reels/page.tsx (530 linhas)
    └── Gestão de reels de texto (não MP4)
```

### Problemas Identificados

| Problema | Severidade | Impacto |
|----------|-----------|---------|
| Página principal com múltiplas responsabilidades | 🔴 Alta | UX confusa, código difícil de manter |
| Falta de APIs DELETE | 🔴 Alta | Conteúdo inútil acumula, custos Cloudinary |
| Navegação não intuitiva | 🟡 Média | Usuário não sabe onde está |
| Slides e Reels misturados | 🟡 Média | Confusão conceitual |
| Arquivos muito grandes | 🟡 Média | Dificulta manutenção |

### Dados no Supabase

**Tabela `content_suggestions`** (existente):
```sql
CREATE TABLE content_suggestions (
  id UUID PRIMARY KEY,
  audit_id UUID REFERENCES audits(id),
  profile_id UUID REFERENCES profiles(id),
  content_json JSONB,      -- Carrosséis de texto
  slides_json JSONB,        -- Slides V1/V2 (URLs Cloudinary)
  reel_videos_json JSONB,   -- Reel videos MP4
  reels_json JSONB,         -- Reels de texto (antigo)
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Estrutura `content_json`**:
```json
{
  "carousels": [
    {
      "titulo": "...",
      "tipo": "educacional|vendas|autoridade",
      "objetivo": "...",
      "approved": true|false,
      "slides": [...],
      "caption": "...",
      "hashtags": [...],
      "cta": "..."
    }
  ]
}
```

**Estrutura `slides_json`**:
```json
{
  "carousels": [
    {
      "carouselIndex": 0,
      "title": "...",
      "slides": [
        {
          "slideNumber": 1,
          "cloudinaryUrl": "https://...",
          "cloudinaryPublicId": "..."
        }
      ]
    }
  ],
  "summary": { "totalSlides": 15, "totalCarousels": 3 }
}
```

**Estrutura `reel_videos_json`**:
```json
{
  "videos": [
    {
      "carouselIndex": 0,
      "title": "...",
      "videoUrl": "https://...",
      "cloudinaryPublicId": "...",
      "duration": 30,
      "totalSlides": 10
    }
  ]
}
```

---

## 🏗️ Arquitetura Alvo (Nova Estrutura)

### Visão Geral

```
app/dashboard/audits/[id]/create-content/
│
├── page.tsx (HUB - ~150 linhas)
│   └── Navegação para os 3 módulos
│
├── carousels/
│   └── page.tsx (~600 linhas)
│       ├── Gerar carrosséis de texto
│       ├── Aprovar/Rejeitar/Editar
│       ├── Gerar variações
│       └── ❌ Deletar carrosséis (NOVO)
│
├── slides/
│   └── page.tsx (~800 linhas)
│       ├── Configurar imagens por slide
│       ├── Gerar slides V1/V2/V3
│       ├── Download ZIP
│       ├── Export Google Drive
│       └── ❌ Deletar slides (NOVO)
│
└── reels/
    └── page.tsx (~600 linhas)
        ├── Gerar reels MP4 (Remotion)
        ├── Preview de vídeos
        ├── Download MP4
        └── ❌ Deletar reels (NOVO)
```

### Navegação do Usuário

```
┌──────────────────────────────────────┐
│  Auditoria @username                 │
│  ┌────────────────────────────────┐  │
│  │ [Criar Conteúdo] ──────────┐   │  │
│  └────────────────────────────┘   │  │
└───────────────────────────────────│──┘
                                    ▼
┌──────────────────────────────────────────────────────┐
│  HUB - Criar Conteúdo                                │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐     │
│  │ 📸 Carros. │  │ 🎨 Slides  │  │ 🎬 Reels   │     │
│  │ 5 gerados  │  │ 15 slides  │  │ 3 vídeos   │     │
│  │ 3 aprovados│  │ (prontos)  │  │ (prontos)  │     │
│  └────────────┘  └────────────┘  └────────────┘     │
└──────────────────────────────────────────────────────┘
       │                 │                 │
       ▼                 ▼                 ▼
   Carrosséis         Slides           Reels
   (texto JSON)    (imagens PNG)    (vídeos MP4)
```

### Fluxo de Trabalho

```
1. Gerar Carrosséis
   └─> Aprovar carrosséis desejados
       └─> [Ir para Slides] → Configurar imagens
           └─> Gerar slides visuais
               └─> Download ZIP ou Drive
       └─> [Ir para Reels] → Gerar reels animados
           └─> Download MP4
```

---

## 🔌 APIs Necessárias

### APIs Existentes (Manter)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/audits/[id]/content` | Carrega todo conteúdo existente |
| POST | `/api/audits/[id]/generate-content` | Gera carrosséis de texto |
| PUT | `/api/content/[id]/approve` | Aprova/rejeita carrossel |
| POST | `/api/content/[id]/generate-slides` | Gera slides V1 |
| POST | `/api/content/[id]/generate-slides-v2` | Gera slides V2 (Puppeteer) |
| POST | `/api/content/[id]/generate-slides-v3` | Gera slides V3 (Remotion) |
| POST | `/api/content/[id]/generate-reel` | Gera reel MP4 |
| POST | `/api/content/[id]/export-zip` | Download ZIP de slides |
| POST | `/api/content/[id]/export-drive` | Export para Google Drive |

### APIs Novas (Criar)

#### 1. DELETE Carrosséis
```typescript
// DELETE /api/content/[id]/carousels/[carouselIndex]
// Remove um carrossel específico do content_json
```

**Request:**
```
DELETE /api/content/abc-123/carousels/2
```

**Response:**
```json
{
  "success": true,
  "message": "Carrossel 2 deletado",
  "remainingCarousels": 4
}
```

**Lógica:**
1. Buscar `content_suggestions` pelo `audit_id`
2. Remover carrossel do array `content_json.carousels[carouselIndex]`
3. Reindexar array (carrossel 3 vira 2, etc.)
4. Atualizar `content_json` no Supabase
5. Retornar sucesso

#### 2. DELETE Slides de um Carrossel
```typescript
// DELETE /api/content/[id]/slides/[carouselIndex]
// Remove slides visuais de um carrossel e limpa Cloudinary
```

**Request:**
```
DELETE /api/content/abc-123/slides/1
```

**Response:**
```json
{
  "success": true,
  "message": "Slides do carrossel 1 deletados",
  "deletedImages": 10,
  "cloudinaryDeleted": ["postexpress/slide-1.png", ...]
}
```

**Lógica:**
1. Buscar `content_suggestions` pelo `audit_id`
2. Extrair `cloudinaryPublicId` de todos os slides do carrossel
3. Deletar imagens do Cloudinary (`cloudinary.uploader.destroy()`)
4. Remover carrossel de `slides_json.carousels[carouselIndex]`
5. Atualizar `slides_json` no Supabase
6. Retornar sucesso com contagem de imagens deletadas

#### 3. DELETE Reel Video
```typescript
// DELETE /api/content/[id]/reels/[reelIndex]
// Remove um reel MP4 e limpa Cloudinary
```

**Request:**
```
DELETE /api/content/abc-123/reels/0
```

**Response:**
```json
{
  "success": true,
  "message": "Reel deletado",
  "cloudinaryDeleted": "postexpress/reel-abc.mp4"
}
```

**Lógica:**
1. Buscar `content_suggestions` pelo `audit_id`
2. Extrair `cloudinaryPublicId` do reel
3. Deletar vídeo do Cloudinary (tipo `video`)
4. Remover reel de `reel_videos_json.videos[reelIndex]`
5. Atualizar `reel_videos_json` no Supabase
6. Retornar sucesso

#### 4. DELETE Tudo (Limpeza Completa)
```typescript
// DELETE /api/content/[id]/all
// Remove TUDO (carrosséis, slides, reels) e limpa Cloudinary
```

**Request:**
```
DELETE /api/content/abc-123/all
```

**Response:**
```json
{
  "success": true,
  "message": "Todo conteúdo deletado",
  "deletedCarousels": 5,
  "deletedSlides": 20,
  "deletedReels": 3,
  "cloudinaryDeleted": 23
}
```

**Lógica:**
1. Buscar `content_suggestions` pelo `audit_id`
2. Extrair todos os `cloudinaryPublicId` (slides + reels)
3. Deletar em batch do Cloudinary
4. Setar `content_json`, `slides_json`, `reel_videos_json` como `null`
5. Atualizar no Supabase
6. Retornar estatísticas

---

## 📄 Componentes e Páginas

### 1. Hub de Navegação (`/create-content/page.tsx`)

**Responsabilidade:** Apenas mostrar status e navegar para módulos

**Estado:**
```typescript
interface HubState {
  carouselsCount: number
  approvedCarouselsCount: number
  slidesCount: number
  reelsCount: number
  loading: boolean
}
```

**UI:**
```tsx
<div className="grid grid-cols-3 gap-6">
  {/* Card Carrosséis */}
  <Card>
    <CardHeader>
      <CardTitle>📸 Carrosséis</CardTitle>
      <CardDescription>Sugestões de conteúdo em texto</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-4xl font-bold">{carouselsCount}</div>
      <p className="text-sm text-muted-foreground">
        {approvedCarouselsCount} aprovados
      </p>
      <Button onClick={() => router.push(`/audits/${id}/create-content/carousels`)}>
        Gerenciar Carrosséis
      </Button>
    </CardContent>
  </Card>

  {/* Card Slides */}
  <Card>
    <CardHeader>
      <CardTitle>🎨 Slides Visuais</CardTitle>
      <CardDescription>Imagens PNG dos carrosséis</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-4xl font-bold">{slidesCount}</div>
      <p className="text-sm text-muted-foreground">slides gerados</p>
      <Button
        onClick={() => router.push(`/audits/${id}/create-content/slides`)}
        disabled={approvedCarouselsCount === 0}
      >
        Gerenciar Slides
      </Button>
    </CardContent>
  </Card>

  {/* Card Reels */}
  <Card>
    <CardHeader>
      <CardTitle>🎬 Reels Animados</CardTitle>
      <CardDescription>Vídeos MP4 para Instagram</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-4xl font-bold">{reelsCount}</div>
      <p className="text-sm text-muted-foreground">vídeos MP4</p>
      <Button
        onClick={() => router.push(`/audits/${id}/create-content/reels`)}
        disabled={approvedCarouselsCount === 0}
      >
        Gerenciar Reels
      </Button>
    </CardContent>
  </Card>
</div>
```

---

### 2. Página de Carrosséis (`/carousels/page.tsx`)

**Responsabilidade:** APENAS carrosséis de texto (JSON)

**Funcionalidades:**
- ✅ Gerar carrosséis (já existe)
- ✅ Aprovar/Rejeitar (já existe)
- ✅ Editar inline (já existe)
- ✅ Gerar variações (já existe)
- ✅ Copiar texto (já existe)
- ❌ **NOVO:** Deletar carrossel individual
- ❌ **NOVO:** Deletar todos os carrosséis

**Botões de Ação por Carrossel:**
```tsx
<div className="flex gap-2">
  <Button variant="success" onClick={() => handleApprove(index, true)}>
    <CheckCircle /> Aprovar
  </Button>
  <Button variant="danger" onClick={() => handleApprove(index, false)}>
    <XCircle /> Rejeitar
  </Button>
  <Button variant="secondary" onClick={() => handleEdit(index)}>
    <Pencil /> Editar
  </Button>
  <Button variant="secondary" onClick={() => handleVariations(index)}>
    <Repeat2 /> Gerar Variações
  </Button>
  {/* NOVO */}
  <Button variant="danger" onClick={() => handleDelete(index)}>
    <Trash2 /> Deletar
  </Button>
</div>
```

**Modal de Confirmação DELETE:**
```tsx
<Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Deletar Carrossel?</DialogTitle>
      <DialogDescription>
        Esta ação não pode ser desfeita. O carrossel "{carousel.titulo}"
        será permanentemente removido.
        {hasSlides && (
          <p className="text-warning-600 mt-2">
            ⚠️ Este carrossel possui slides visuais gerados.
            Eles NÃO serão deletados automaticamente.
          </p>
        )}
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
        Cancelar
      </Button>
      <Button variant="danger" onClick={confirmDelete}>
        Deletar Permanentemente
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Navegação:**
```tsx
{approvedCarouselsCount > 0 && (
  <div className="flex gap-2">
    <Button onClick={() => router.push(`/audits/${id}/create-content/slides`)}>
      <Sparkles /> Ir para Slides
    </Button>
    <Button onClick={() => router.push(`/audits/${id}/create-content/reels`)}>
      <Video /> Ir para Reels
    </Button>
  </div>
)}
```

---

### 3. Página de Slides (`/slides/page.tsx`)

**Responsabilidade:** APENAS slides visuais (PNG)

**Funcionalidades:**
- ✅ Configurar imagens por slide (já existe)
- ✅ Gerar slides V1/V2/V3 (já existe)
- ✅ Download ZIP (já existe)
- ✅ Export Google Drive (já existe)
- ❌ **NOVO:** Deletar slides de um carrossel
- ❌ **NOVO:** Deletar todos os slides

**UI por Carrossel:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>{carousel.title}</CardTitle>
    <div className="flex gap-2">
      <Button onClick={() => handleGenerateSlides(carouselIndex)}>
        <Sparkles /> Gerar Slides
      </Button>
      {/* NOVO */}
      <Button variant="danger" onClick={() => handleDeleteSlides(carouselIndex)}>
        <Trash2 /> Deletar Slides
      </Button>
    </div>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-3 gap-3">
      {carousel.slides.map(slide => (
        <div key={slide.slideNumber}>
          <img src={slide.cloudinaryUrl} alt={`Slide ${slide.slideNumber}`} />
        </div>
      ))}
    </div>
  </CardContent>
</Card>
```

**Modal de Confirmação DELETE Slides:**
```tsx
<Dialog>
  <DialogHeader>
    <DialogTitle>Deletar Slides?</DialogTitle>
    <DialogDescription>
      Você está prestes a deletar {slideCount} slides do carrossel
      "{carouselTitle}".

      ⚠️ As imagens serão permanentemente removidas do Cloudinary.

      O carrossel de texto permanecerá intacto.
    </DialogDescription>
  </DialogHeader>
  <DialogFooter>
    <Button variant="secondary">Cancelar</Button>
    <Button variant="danger" onClick={confirmDeleteSlides}>
      Deletar {slideCount} Slides
    </Button>
  </DialogFooter>
</Dialog>
```

---

### 4. Página de Reels (`/reels/page.tsx`)

**Responsabilidade:** APENAS reels animados (MP4)

**Funcionalidades:**
- ✅ Gerar reels MP4 (já existe)
- ✅ Preview de vídeos (já existe)
- ✅ Download MP4 (já existe)
- ❌ **NOVO:** Deletar reel individual
- ❌ **NOVO:** Deletar todos os reels

**UI por Reel:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>{reel.title}</CardTitle>
    <div className="flex gap-2">
      <Button onClick={() => handleDownload(reel.videoUrl)}>
        <Download /> Baixar MP4
      </Button>
      {/* NOVO */}
      <Button variant="danger" onClick={() => handleDeleteReel(index)}>
        <Trash2 /> Deletar
      </Button>
    </div>
  </CardHeader>
  <CardContent>
    <video src={reel.videoUrl} controls style={{ aspectRatio: '4/5' }} />
    <p>{reel.totalSlides} slides • {Math.round(reel.duration)}s</p>
  </CardContent>
</Card>
```

**Modal de Confirmação DELETE Reel:**
```tsx
<Dialog>
  <DialogHeader>
    <DialogTitle>Deletar Reel?</DialogTitle>
    <DialogDescription>
      Você está prestes a deletar o reel "{reelTitle}".

      ⚠️ O vídeo MP4 será permanentemente removido do Cloudinary.

      O carrossel de texto permanecerá intacto.
    </DialogDescription>
  </DialogHeader>
  <DialogFooter>
    <Button variant="secondary">Cancelar</Button>
    <Button variant="danger" onClick={confirmDeleteReel}>
      Deletar Reel
    </Button>
  </DialogFooter>
</Dialog>
```

---

## 🛠️ Implementação Técnica

### Migração de Código

**Origem:** `/create-content/page.tsx` (1593 linhas)

**Destino:**
```
/create-content/page.tsx          → 150 linhas (HUB)
/create-content/carousels/page.tsx → 600 linhas
/create-content/slides/page.tsx    → 800 linhas (já existe, refatorar)
/create-content/reels/page.tsx     → 600 linhas (já existe, expandir)
```

**Estados a Mover:**

| Estado | De | Para |
|--------|-----|------|
| `content` (carrosséis JSON) | `page.tsx` | `carousels/page.tsx` |
| `slides` (V1), `slidesV2` (V2/V3) | `page.tsx` | `slides/page.tsx` |
| `reelVideos` | `page.tsx` | `reels/page.tsx` |
| `generating`, `error` | `page.tsx` | cada módulo |
| `approvingCarousel` | `page.tsx` | `carousels/page.tsx` |
| `generatingSlides*` | `page.tsx` | `slides/page.tsx` |
| `generatingReel` | `page.tsx` | `reels/page.tsx` |

### Implementação das APIs DELETE

#### `/api/content/[id]/carousels/[carouselIndex]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; carouselIndex: string } }
) {
  try {
    const { id: audit_id, carouselIndex } = params
    const index = parseInt(carouselIndex, 10)

    const supabase = getServerSupabase()

    // 1. Buscar content_suggestions
    const { data: existing, error: fetchError } = await supabase
      .from('content_suggestions')
      .select('id, content_json')
      .eq('audit_id', audit_id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Conteúdo não encontrado' },
        { status: 404 }
      )
    }

    const contentJson = existing.content_json as any

    if (!contentJson?.carousels || index >= contentJson.carousels.length) {
      return NextResponse.json(
        { error: 'Carrossel não encontrado' },
        { status: 404 }
      )
    }

    // 2. Remover carrossel do array
    const deletedCarousel = contentJson.carousels.splice(index, 1)[0]

    // 3. Atualizar no Supabase
    const { error: updateError } = await supabase
      .from('content_suggestions')
      .update({
        content_json: contentJson,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      message: `Carrossel "${deletedCarousel.titulo}" deletado`,
      remainingCarousels: contentJson.carousels.length
    })

  } catch (error: any) {
    console.error('Erro ao deletar carrossel:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar carrossel' },
      { status: 500 }
    )
  }
}
```

#### `/api/content/[id]/slides/[carouselIndex]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { v2 as cloudinary } from 'cloudinary'

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; carouselIndex: string } }
) {
  try {
    const { id: audit_id, carouselIndex } = params
    const index = parseInt(carouselIndex, 10)

    const supabase = getServerSupabase()

    // 1. Buscar content_suggestions
    const { data: existing, error: fetchError } = await supabase
      .from('content_suggestions')
      .select('id, slides_json')
      .eq('audit_id', audit_id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Conteúdo não encontrado' },
        { status: 404 }
      )
    }

    const slidesJson = existing.slides_json as any

    if (!slidesJson?.carousels) {
      return NextResponse.json(
        { error: 'Nenhum slide gerado ainda' },
        { status: 404 }
      )
    }

    // 2. Encontrar carrossel
    const carouselToDelete = slidesJson.carousels.find(
      (c: any) => c.carouselIndex === index
    )

    if (!carouselToDelete) {
      return NextResponse.json(
        { error: 'Slides deste carrossel não encontrados' },
        { status: 404 }
      )
    }

    // 3. Extrair public_ids do Cloudinary
    const publicIds = carouselToDelete.slides.map(
      (s: any) => s.cloudinaryPublicId
    )

    // 4. Deletar do Cloudinary em batch
    const deletePromises = publicIds.map((publicId: string) =>
      cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
    )

    const cloudinaryResults = await Promise.allSettled(deletePromises)
    const deletedCount = cloudinaryResults.filter(
      r => r.status === 'fulfilled' && r.value.result === 'ok'
    ).length

    console.log(`✅ Deletados ${deletedCount}/${publicIds.length} slides do Cloudinary`)

    // 5. Remover do slides_json
    slidesJson.carousels = slidesJson.carousels.filter(
      (c: any) => c.carouselIndex !== index
    )

    // Atualizar summary
    slidesJson.summary = {
      totalCarousels: slidesJson.carousels.length,
      totalSlides: slidesJson.carousels.reduce(
        (acc: number, c: any) => acc + c.slides.length,
        0
      )
    }

    // 6. Atualizar no Supabase
    const { error: updateError } = await supabase
      .from('content_suggestions')
      .update({
        slides_json: slidesJson.carousels.length > 0 ? slidesJson : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      message: `Slides do carrossel ${index} deletados`,
      deletedImages: publicIds.length,
      cloudinaryDeleted: deletedCount,
      cloudinaryFailed: publicIds.length - deletedCount
    })

  } catch (error: any) {
    console.error('Erro ao deletar slides:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar slides' },
      { status: 500 }
    )
  }
}
```

#### `/api/content/[id]/reels/[reelIndex]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; reelIndex: string } }
) {
  try {
    const { id: audit_id, reelIndex } = params
    const index = parseInt(reelIndex, 10)

    const supabase = getServerSupabase()

    // 1. Buscar content_suggestions
    const { data: existing, error: fetchError } = await supabase
      .from('content_suggestions')
      .select('id, reel_videos_json')
      .eq('audit_id', audit_id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Conteúdo não encontrado' },
        { status: 404 }
      )
    }

    const reelVideosJson = existing.reel_videos_json as any

    if (!reelVideosJson?.videos || index >= reelVideosJson.videos.length) {
      return NextResponse.json(
        { error: 'Reel não encontrado' },
        { status: 404 }
      )
    }

    // 2. Extrair public_id do Cloudinary
    const reelToDelete = reelVideosJson.videos[index]
    const publicId = reelToDelete.cloudinaryPublicId

    // 3. Deletar do Cloudinary (tipo video)
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'video'
      })
      console.log(`✅ Reel deletado do Cloudinary:`, result)
    } catch (cloudErr: any) {
      console.warn('⚠️ Erro ao deletar do Cloudinary:', cloudErr.message)
    }

    // 4. Remover do array
    reelVideosJson.videos.splice(index, 1)

    // 5. Atualizar no Supabase
    const { error: updateError } = await supabase
      .from('content_suggestions')
      .update({
        reel_videos_json: reelVideosJson.videos.length > 0 ? reelVideosJson : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      message: 'Reel deletado',
      cloudinaryDeleted: publicId
    })

  } catch (error: any) {
    console.error('Erro ao deletar reel:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar reel' },
      { status: 500 }
    )
  }
}
```

---

## 📦 Plano de Implementação

### Fase 1: Preparação (1 dia)
- [ ] Criar branch `refactor/content-creation-separation`
- [ ] Backup da página atual (`page.tsx.backup`)
- [ ] Criar estrutura de pastas

### Fase 2: APIs DELETE (1 dia)
- [ ] Implementar `DELETE /carousels/[index]`
- [ ] Implementar `DELETE /slides/[index]`
- [ ] Implementar `DELETE /reels/[index]`
- [ ] Testar com Postman/Thunder Client

### Fase 3: Hub de Navegação (2 horas)
- [ ] Criar `/create-content/page.tsx` (novo HUB)
- [ ] Cards de navegação
- [ ] Contador de status

### Fase 4: Página de Carrosséis (4 horas)
- [ ] Criar `/carousels/page.tsx`
- [ ] Mover lógica de geração de carrosséis
- [ ] Adicionar botão DELETE com modal
- [ ] Testar fluxo completo

### Fase 5: Página de Slides (4 horas)
- [ ] Refatorar `/slides/page.tsx` existente
- [ ] Remover mistura com carrosséis
- [ ] Adicionar botão DELETE com modal
- [ ] Testar fluxo completo

### Fase 6: Página de Reels (4 horas)
- [ ] Refatorar `/reels/page.tsx` existente
- [ ] Focar apenas em MP4 (remover texto)
- [ ] Adicionar botão DELETE com modal
- [ ] Testar fluxo completo

### Fase 7: Testes e Ajustes (1 dia)
- [ ] Testar navegação entre páginas
- [ ] Testar DELETE de carrosséis
- [ ] Testar DELETE de slides (validar Cloudinary)
- [ ] Testar DELETE de reels (validar Cloudinary)
- [ ] Ajustes de UX

### Fase 8: Deploy (2 horas)
- [ ] Merge para `main`
- [ ] Deploy para produção
- [ ] Monitorar erros (Sentry/Logs)
- [ ] Comunicar mudanças aos usuários

**Tempo Total Estimado:** 3-4 dias de desenvolvimento

---

## 🎯 Métricas de Sucesso

### Quantitativas
- ✅ Página principal reduzida de **1593 → 150 linhas** (90% menor)
- ✅ 3 módulos com **< 800 linhas** cada (manutenível)
- ✅ Tempo de carregamento **< 1s** por página
- ✅ Taxa de erro de DELETE **< 1%**

### Qualitativas
- ✅ Usuário sabe exatamente onde está (breadcrumbs claros)
- ✅ Navegação intuitiva entre módulos
- ✅ Deletar conteúdo inútil (economia de Cloudinary)
- ✅ Código fácil de manter e evoluir

---

## ⚠️ Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Quebrar funcionalidades existentes | Média | Alto | Testes manuais completos antes do deploy |
| Erro ao deletar do Cloudinary | Baixa | Médio | Try/catch + logs detalhados |
| Confusão de usuários com nova navegação | Média | Baixo | Tooltip + mensagens de ajuda |
| Performance de DELETE em batch | Baixa | Baixo | Usar `Promise.allSettled` |

---

## 📚 Referências

### Código Existente
- `/app/dashboard/audits/[id]/create-content/page.tsx` (1593 linhas)
- `/app/dashboard/audits/[id]/create-content/slides/page.tsx` (2581 linhas)
- `/app/dashboard/audits/[id]/create-content/reels/page.tsx` (530 linhas)

### APIs Existentes
- `/app/api/audits/[id]/content/route.ts` (GET)
- `/app/api/audits/[id]/generate-content/route.ts` (POST)
- `/app/api/content/[id]/approve/route.ts` (PUT)
- `/app/api/content/[id]/generate-slides-v2/route.ts` (POST)
- `/app/api/content/[id]/generate-reel/route.ts` (POST)

### Dependências
- Cloudinary SDK (`cloudinary`)
- Supabase Client (`@/lib/supabase`)
- Next.js 15 App Router
- React 18

---

## 🚀 Próximos Passos

1. **Revisar este documento** com o time
2. **Aprovar a arquitetura** proposta
3. **Criar branch de desenvolvimento**
4. **Iniciar Fase 1** (Preparação)

---

**Documento criado por:** Aria (Architect Agent)
**Data:** 2026-02-21
**Versão:** 1.0
**Status:** ✅ Aprovado para Implementação

---

**Arquitetura brownfield completa!** 🎉

Este documento serve como guia definitivo para a refatoração do sistema de criação de conteúdo.
