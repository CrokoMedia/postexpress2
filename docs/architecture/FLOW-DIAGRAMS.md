# Diagramas de Fluxo - Refatoração Content Creation

**Projeto:** Croko Labs
**Data:** 2026-02-21

---

## 📐 Arquitetura Antes vs Depois

### ❌ ANTES (Problemático)

```
┌─────────────────────────────────────────────────────────────────┐
│  /create-content/page.tsx (1593 linhas)                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ • Gerar carrosséis de texto                               │  │
│  │ • Aprovar/Editar carrosséis                               │  │
│  │ • Gerar slides V1 (template)                              │  │
│  │ • Gerar slides V2/V3 (IA)                                 │  │
│  │ • Gerar reels MP4 (Remotion)                              │  │
│  │ • Download ZIP                                            │  │
│  │ • Export Google Drive                                     │  │
│  │ • Variações                                               │  │
│  │                                                           │  │
│  │ 🔴 PROBLEMA: Tudo misturado na mesma página              │  │
│  │ 🔴 PROBLEMA: 1593 linhas de código                        │  │
│  │ 🔴 PROBLEMA: Impossível deletar conteúdo                  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

/create-content/slides/page.tsx (2581 linhas)
  └─> Configuração de imagens (muito grande)

/create-content/reels/page.tsx (530 linhas)
  └─> Reels de TEXTO (não MP4) - conceito errado
```

### ✅ DEPOIS (Solução)

```
┌──────────────────────────────────────────────────────────────────────┐
│  /create-content/page.tsx (HUB - 150 linhas)                         │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐         │
│  │ 📸 Carrosséis  │  │ 🎨 Slides      │  │ 🎬 Reels       │         │
│  │ 5 gerados      │  │ 15 slides      │  │ 3 vídeos       │         │
│  │ 3 aprovados    │  │ (prontos)      │  │ (prontos)      │         │
│  │ [Gerenciar] ───┼─→│ [Gerenciar] ───┼─→│ [Gerenciar]    │         │
│  └────────────────┘  └────────────────┘  └────────────────┘         │
│                                                                      │
│  ✅ Clara separação de responsabilidades                            │
│  ✅ Navegação intuitiva                                             │
│  ✅ Status de cada módulo                                           │
└──────────────────────────────────────────────────────────────────────┘
         │                      │                      │
         ▼                      ▼                      ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ /carousels/      │  │ /slides/         │  │ /reels/          │
│ page.tsx         │  │ page.tsx         │  │ page.tsx         │
│ (600 linhas)     │  │ (800 linhas)     │  │ (600 linhas)     │
│                  │  │                  │  │                  │
│ • Gerar texto    │  │ • Configurar img │  │ • Gerar MP4      │
│ • Aprovar        │  │ • Gerar V1/V2/V3 │  │ • Preview        │
│ • Editar         │  │ • Download ZIP   │  │ • Download       │
│ • Variações      │  │ • Send Drive     │  │ • ❌ Deletar     │
│ • ❌ Deletar     │  │ • ❌ Deletar     │  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

## 🔄 Fluxo de Navegação do Usuário

### Cenário 1: Criar Carrosséis e Slides

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. Usuário clica "Criar Conteúdo" na auditoria                     │
└─────────────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 2. HUB - Mostra status dos 3 módulos                                │
│    📸 Carrosséis: 0 gerados                                         │
│    🎨 Slides: 0 slides                                              │
│    🎬 Reels: 0 vídeos                                               │
│                                                                     │
│    [Gerenciar Carrosséis] [Gerenciar Slides - disabled]            │
└─────────────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 3. Clica "Gerenciar Carrosséis"                                    │
└─────────────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 4. Página /carousels/                                               │
│    • Digite tema personalizado (opcional)                           │
│    • Clica "Gerar Sugestões"                                        │
│    • Aguarda 30-60s (Claude API)                                    │
│    • 5 carrosséis gerados aparecem                                  │
└─────────────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 5. Aprova 3 carrosséis desejados                                    │
│    [✅ Aprovar] [❌ Rejeitar] [✏️ Editar] [🗑️ Deletar]             │
│                                                                     │
│    Carrossel 1: ✅ Aprovado                                         │
│    Carrossel 2: ✅ Aprovado                                         │
│    Carrossel 3: ❌ Rejeitado → [Deletar] (remove do banco)         │
│    Carrossel 4: ✅ Aprovado                                         │
│    Carrossel 5: Pendente                                            │
└─────────────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 6. Aparece botão "Ir para Slides" (3 aprovados)                    │
│    Clica no botão                                                   │
└─────────────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 7. Página /slides/                                                  │
│    • Mostra 3 carrosséis aprovados                                  │
│    • Configura imagens por slide:                                   │
│      - Auto (IA gera prompt)                                        │
│      - Custom Prompt                                                │
│      - Upload manual                                                │
│    • Clica "Gerar Slides V2 (IA)"                                   │
│    • Aguarda 2-3 min (Puppeteer/Remotion + Cloudinary)             │
│    • 30 slides PNG aparecem (10 por carrossel)                      │
└─────────────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 8. Downloads                                                        │
│    • [📦 Baixar ZIP] → 30 PNGs em arquivo ZIP                       │
│    • [📁 Enviar para Drive] → Cria pastas no Google Drive          │
│                                                                     │
│    Se não gostou de 1 carrossel:                                    │
│    • [🗑️ Deletar Slides] → Remove 10 PNGs do Cloudinary            │
└─────────────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 9. Voltar ao HUB                                                    │
│    📸 Carrosséis: 5 gerados, 3 aprovados                            │
│    🎨 Slides: 20 slides (30 - 10 deletados)                         │
│    🎬 Reels: 0 vídeos                                               │
└─────────────────────────────────────────────────────────────────────┘
```

### Cenário 2: Criar Reels Animados

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. No HUB, clica "Gerenciar Reels"                                  │
│    (Pré-requisito: ter carrosséis aprovados)                        │
└─────────────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 2. Página /reels/                                                   │
│    • Mostra carrosséis aprovados (3)                                │
│    • Clica "Gerar Reels MP4"                                        │
│    • Aguarda 2-3 min (Remotion renderização + Cloudinary)          │
│    • 3 vídeos MP4 aparecem                                          │
└─────────────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 3. Preview e Download                                               │
│    Reel 1: "5 Gatilhos de Venda" (30s, 10 slides)                  │
│      [▶️ Player] [📥 Baixar MP4] [🗑️ Deletar]                      │
│                                                                     │
│    Reel 2: "Como Criar Hooks" (25s, 8 slides)                      │
│      [▶️ Player] [📥 Baixar MP4] [🗑️ Deletar]                      │
│                                                                     │
│    Reel 3: "Storytelling 101" (35s, 12 slides)                     │
│      [▶️ Player] [📥 Baixar MP4] [🗑️ Deletar]                      │
└─────────────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 4. Deleta Reel 2 (não gostou)                                      │
│    • Modal: "Deletar Reel? O vídeo será removido do Cloudinary"    │
│    • Confirma                                                       │
│    • Vídeo deletado (libera 5MB no Cloudinary)                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔌 Fluxo de Dados (APIs)

### GET - Carregar Conteúdo Existente

```
Frontend (qualquer página)
    │
    ├─> GET /api/audits/[id]/content
    │
    ▼
Supabase (content_suggestions)
    │
    ├─> content_json       → Carrosséis de texto
    ├─> slides_json        → Slides V1/V2/V3 (URLs Cloudinary)
    ├─> reel_videos_json   → Reels MP4 (URLs Cloudinary)
    │
    ▼
Response JSON
{
  "content": {
    "carousels": [...]
  },
  "slides": {
    "carousels": [...]
  },
  "reel_videos": {
    "videos": [...]
  }
}
```

### DELETE - Remover Carrossel

```
Frontend (/carousels/)
    │
    ├─> DELETE /api/content/[audit_id]/carousels/[index]
    │
    ▼
API Route
    │
    ├─> 1. Buscar content_suggestions (audit_id)
    ├─> 2. Validar índice
    ├─> 3. Remover do array content_json.carousels[index]
    ├─> 4. Atualizar Supabase
    │
    ▼
Response
{
  "success": true,
  "message": "Carrossel deletado",
  "remainingCarousels": 4
}
    │
    ▼
Frontend
    ├─> Atualiza estado local (remove do array)
    ├─> Toast: "Carrossel deletado com sucesso"
    └─> Rerender (4 carrosséis)
```

### DELETE - Remover Slides

```
Frontend (/slides/)
    │
    ├─> DELETE /api/content/[audit_id]/slides/[carouselIndex]
    │
    ▼
API Route
    │
    ├─> 1. Buscar content_suggestions (audit_id)
    ├─> 2. Validar carouselIndex
    ├─> 3. Extrair cloudinaryPublicId de todos os slides
    │      ["postexpress/slide-1.png", "postexpress/slide-2.png", ...]
    ├─> 4. Deletar do Cloudinary (em batch)
    │      cloudinary.uploader.destroy() x 10
    ├─> 5. Remover de slides_json.carousels[carouselIndex]
    ├─> 6. Atualizar summary (totalSlides -= 10)
    ├─> 7. Atualizar Supabase
    │
    ▼
Response
{
  "success": true,
  "message": "Slides deletados",
  "deletedImages": 10,
  "cloudinaryDeleted": 10,
  "cloudinaryFailed": 0
}
    │
    ▼
Frontend
    ├─> Atualiza estado local
    ├─> Toast: "10 slides deletados (liberou X MB)"
    └─> Rerender
```

### DELETE - Remover Reel

```
Frontend (/reels/)
    │
    ├─> DELETE /api/content/[audit_id]/reels/[reelIndex]
    │
    ▼
API Route
    │
    ├─> 1. Buscar content_suggestions (audit_id)
    ├─> 2. Validar reelIndex
    ├─> 3. Extrair cloudinaryPublicId do reel
    │      "postexpress/reel-abc-123.mp4"
    ├─> 4. Deletar do Cloudinary (resource_type: 'video')
    │      cloudinary.uploader.destroy(id, { resource_type: 'video' })
    ├─> 5. Remover de reel_videos_json.videos[reelIndex]
    ├─> 6. Atualizar Supabase (null se array vazio)
    │
    ▼
Response
{
  "success": true,
  "message": "Reel deletado",
  "cloudinaryDeleted": "postexpress/reel-abc-123.mp4"
}
    │
    ▼
Frontend
    ├─> Atualiza estado local
    ├─> Toast: "Reel deletado (liberou 5 MB)"
    └─> Rerender
```

---

## 🗂️ Estrutura de Dados (Supabase)

### Tabela: `content_suggestions`

```sql
┌─────────────────────────────────────────────────────────────────────┐
│ content_suggestions                                                 │
├─────────────────────────────────────────────────────────────────────┤
│ id                UUID (PK)                                         │
│ audit_id          UUID (FK → audits.id)                             │
│ profile_id        UUID (FK → profiles.id)                           │
│ content_json      JSONB  ← Carrosséis de texto                      │
│ slides_json       JSONB  ← Slides PNG (V1/V2/V3)                    │
│ reel_videos_json  JSONB  ← Reels MP4 (Remotion)                     │
│ reels_json        JSONB  ← (DEPRECATED - reels de texto antigos)   │
│ created_at        TIMESTAMPTZ                                       │
│ updated_at        TIMESTAMPTZ                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Estrutura `content_json`

```json
{
  "carousels": [
    {
      "titulo": "5 Gatilhos de Venda Irresistíveis",
      "tipo": "vendas",
      "objetivo": "Ensinar gatilhos psicológicos",
      "approved": true,      ← FLAG de aprovação
      "baseado_em": "Schwartz + Hormozi",
      "slides": [
        {
          "numero": 1,
          "tipo": "gancho",
          "titulo": "Você Está Perdendo Vendas?",
          "corpo": "Descubra os 5 gatilhos que triplicam conversão",
          "notas_design": "Usar vermelho para urgência"
        },
        // ... mais 9 slides
      ],
      "caption": "Caption completa com emojis...",
      "hashtags": ["vendas", "marketing", "conversao"],
      "cta": "Salve este post para não esquecer!"
    }
    // ... mais carrosséis
  ],
  "estrategia_geral": "Focar em vendas com autoridade",
  "proximos_passos": ["Criar reels", "Testar hooks", ...]
}
```

### Estrutura `slides_json`

```json
{
  "carousels": [
    {
      "carouselIndex": 0,     ← Referência ao carrossel em content_json
      "title": "5 Gatilhos de Venda Irresistíveis",
      "slides": [
        {
          "slideNumber": 1,
          "cloudinaryUrl": "https://res.cloudinary.com/.../slide-1.png",
          "cloudinaryPublicId": "postexpress/audit-abc/carousel-0/slide-1",
          "width": 1080,
          "height": 1350
        },
        // ... mais 9 slides
      ]
    }
  ],
  "summary": {
    "totalCarousels": 3,
    "totalSlides": 30,
    "generated_at": "2026-02-21T10:30:00Z",
    "version": "v3"  ← V1 (template) | V2 (Puppeteer) | V3 (Remotion)
  }
}
```

### Estrutura `reel_videos_json`

```json
{
  "videos": [
    {
      "carouselIndex": 0,     ← Referência ao carrossel
      "title": "5 Gatilhos de Venda Irresistíveis",
      "videoUrl": "https://res.cloudinary.com/.../reel-abc.mp4",
      "cloudinaryPublicId": "postexpress/audit-abc/reel-0",
      "duration": 30.5,       ← segundos
      "totalSlides": 10,
      "width": 1080,
      "height": 1920,         ← formato 9:16 (vertical)
      "fps": 30
    }
    // ... mais reels
  ],
  "generated_at": "2026-02-21T11:00:00Z"
}
```

---

## 🎨 Componentes Reutilizáveis

### Modal de Confirmação DELETE

```tsx
// components/molecules/delete-confirmation-modal.tsx

interface DeleteConfirmationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  itemCount?: number
  warning?: string
  onConfirm: () => void
  loading?: boolean
}

export function DeleteConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  itemCount,
  warning,
  onConfirm,
  loading = false
}: DeleteConfirmationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="space-y-2">
            <p>{description}</p>
            {itemCount && (
              <p className="font-semibold">
                {itemCount} {itemCount === 1 ? 'item' : 'itens'} será deletado
              </p>
            )}
            {warning && (
              <p className="text-warning-600 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {warning}
              </p>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deletando...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Deletar Permanentemente
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### Uso no Código

```tsx
// Exemplo: /carousels/page.tsx

const [deleteModal, setDeleteModal] = useState({
  open: false,
  carouselIndex: null as number | null,
  carouselTitle: ''
})

const handleDeleteClick = (index: number, carousel: any) => {
  setDeleteModal({
    open: true,
    carouselIndex: index,
    carouselTitle: carousel.titulo
  })
}

const confirmDelete = async () => {
  if (deleteModal.carouselIndex === null) return

  try {
    const res = await fetch(
      `/api/content/${id}/carousels/${deleteModal.carouselIndex}`,
      { method: 'DELETE' }
    )

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error)
    }

    // Atualizar estado local
    setContent(prev => {
      const next = { ...prev }
      next.carousels.splice(deleteModal.carouselIndex!, 1)
      return next
    })

    toast.success('Carrossel deletado com sucesso')
    setDeleteModal({ open: false, carouselIndex: null, carouselTitle: '' })

  } catch (err: any) {
    toast.error(`Erro: ${err.message}`)
  }
}

// Render
<DeleteConfirmationModal
  open={deleteModal.open}
  onOpenChange={(open) => setDeleteModal(prev => ({ ...prev, open }))}
  title="Deletar Carrossel?"
  description={`Você está prestes a deletar "${deleteModal.carouselTitle}". Esta ação não pode ser desfeita.`}
  warning="Se houver slides gerados, eles NÃO serão deletados automaticamente."
  onConfirm={confirmDelete}
/>
```

---

## 📊 Métricas de Sucesso

### Redução de Complexidade

```
ANTES:
┌────────────────────────────────────┐
│ /create-content/page.tsx           │
│ ████████████████████ 1593 linhas   │
└────────────────────────────────────┘

DEPOIS:
┌────────────────────────────────────┐
│ /create-content/page.tsx (HUB)     │
│ ███ 150 linhas (-90%)              │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ /carousels/page.tsx                │
│ ████████ 600 linhas                │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ /slides/page.tsx                   │
│ ██████████ 800 linhas              │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ /reels/page.tsx                    │
│ ████████ 600 linhas                │
└────────────────────────────────────┘

TOTAL: 2150 linhas (+557) mas 4 arquivos manuteníveis
```

### Economia de Armazenamento (Cloudinary)

```
ANTES (sem DELETE):
┌────────────────────────────────────────────────┐
│ Usuário gera 10 carrosséis → 100 slides PNG   │
│ Usuário não gosta de 5 → ficam no Cloudinary  │
│ Custo mensal: 50 MB x $0.02/MB = $1.00        │
└────────────────────────────────────────────────┘

DEPOIS (com DELETE):
┌────────────────────────────────────────────────┐
│ Usuário gera 10 carrosséis → 100 slides PNG   │
│ Usuário deleta 5 → limpa 50 slides            │
│ Custo mensal: 25 MB x $0.02/MB = $0.50 (-50%) │
└────────────────────────────────────────────────┘
```

---

**Última Atualização:** 2026-02-21
**Status:** ✅ Documentação Completa
