# BrandKitFormModal

Componente modal complexo para criar e editar Brand Kits.

## Localização
`/components/organisms/brand-kit-form-modal.tsx`

## Características

### Layout
- Modal overlay 80% viewport
- Layout 2 colunas responsivo:
  - **Desktop:** Form (60%) + Preview (40%) lado a lado
  - **Mobile:** Stacked (form acima, preview ocultado)
- Scroll interno independente

### Seções (Accordion)

#### 1. Visual Identity
- **Upload de Logo:**
  - Drag & drop ou click
  - Preview da imagem
  - Upload para Cloudinary (`/api/upload`)
  - Salva `logo_url` e `logo_public_id`
  - Validações: apenas imagens, máx 5MB
  - Loading state durante upload

- **Color Pickers:**
  - Primary Color (padrão: #6366f1)
  - Secondary Color (padrão: #8b5cf6)
  - Accent Color (padrão: #ec4899)
  - Grid 3 colunas em desktop

- **Font Selectors:**
  - Primary Font (padrão: Inter)
  - Secondary Font (padrão: Roboto)
  - Grid 2 colunas em desktop

#### 2. Verbal Identity
- **TagInput: Tom de Voz**
  - Placeholder: "Ex: informal, educativo, inspirador..."
  - Array de características

- **TagInput: Keywords**
  - Palavras-chave da marca

- **Textarea: Missão**
  - Placeholder: "Qual é a missão da sua marca?"
  - 3 rows

- **Textarea: Público-Alvo**
  - Placeholder: "Quem é seu público-alvo?"
  - 3 rows

#### 3. Business Info
- **Input: Nicho**
  - Ex: Marketing Digital

- **Grid 2 colunas:**
  - Website (URL)
  - Instagram (@username)

- **Input: Linktree**
  - URL completa

- **TagInput: CTAs Padrão**
  - Ex: "Compre agora", "Saiba mais"

### Preview Lateral (SimplePreview)
**Nota:** Implementação mockup temporária. Será substituída pelo `BrandKitPreview` quando Task #10 for concluída.

Exibe em tempo real:
- Logo (se carregada)
- Paleta de cores (circles)
- Preview das fontes
- Nome da marca
- Tom de voz (string concatenada)

### Estados

```typescript
const [isSaving, setIsSaving] = useState(false)
const [isUploadingLogo, setIsUploadingLogo] = useState(false)
const [isDragging, setIsDragging] = useState(false)
const [expandedSections, setExpandedSections] = useState({
  visual: true,
  verbal: false,
  business: false,
})
const [formData, setFormData] = useState<BrandKitFormData>({...})
```

### Validações Client-Side

1. **Brand Name:** Obrigatório (trim)
2. **Logo Upload:**
   - Tipo de arquivo (apenas imagens)
   - Tamanho (máx 5MB)
3. **Toasts:**
   - Erro se brand_name vazio
   - Sucesso ao criar/atualizar
   - Erro genérico se API falhar

### Integração com API

#### Criar novo kit (POST)
```typescript
POST /api/brand-kits
{
  profile_id: string,
  brand_name: string,
  primary_color: string,
  secondary_color: string,
  accent_color: string,
  logo_url: string | null,
  logo_public_id: string | null,
  primary_font: string,
  secondary_font: string,
  tone_of_voice: {
    characteristics: string[],
    examples: [],
    avoid: []
  }
}
```

#### Atualizar kit existente (PATCH)
```typescript
PATCH /api/brand-kits/{id}
// Mesma estrutura do POST
```

### Props

```typescript
interface BrandKitFormModalProps {
  isOpen: boolean           // Controla visibilidade do modal
  onClose: () => void      // Callback ao fechar
  profileId: string        // ID do perfil (obrigatório)
  editingKit?: BrandKit | null  // Kit em edição (opcional)
  onSuccess?: () => void   // Callback após salvar com sucesso
}
```

### Uso

```tsx
import { BrandKitFormModal } from '@/components/organisms/brand-kit-form-modal'

function MyPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [editingKit, setEditingKit] = useState<BrandKit | null>(null)

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Criar Brand Kit
      </Button>

      <BrandKitFormModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false)
          setEditingKit(null)
        }}
        profileId="profile-uuid"
        editingKit={editingKit}
        onSuccess={() => {
          // Recarregar lista, etc
        }}
      />
    </>
  )
}
```

## Padrões Seguidos

✅ Next.js 15 App Router
✅ TypeScript strict
✅ Tailwind CSS com dark mode (`dark:` variants)
✅ Design tokens (cores, spacing, border-radius)
✅ Atomic Design (organisms)
✅ Pattern de ProfileContextModal
✅ React Hooks (useState, useEffect, useRef)
✅ Toast notifications (react-hot-toast)
✅ Accessibility (labels, aria-*)
✅ Responsive (lg: breakpoint)

## Dependências

- `@/components/atoms/card`
- `@/components/atoms/button`
- `@/components/atoms/color-picker` ✅ Task #8
- `@/components/atoms/font-selector` ✅ Task #8
- `@/components/atoms/tag-input` ✅ Task #8
- `@/lib/utils` (cn helper)
- `react-hot-toast`
- `lucide-react`

## Melhorias Futuras

1. **Substituir SimplePreview por BrandKitPreview** (Task #10)
2. **Adicionar color_palette completo** (atualmente não persiste)
3. **Adicionar mais campos de links** (LinkedIn, TikTok, etc)
4. **Validação de URLs** (regex para website, instagram, etc)
5. **Preview mobile** (atualmente oculto)
6. **Keyboard shortcuts** (Esc para fechar, Ctrl+S para salvar)
7. **Dirty state warning** (confirmar antes de fechar com mudanças não salvas)

## Notas Técnicas

- **Logo upload:** Usa `/api/upload` (Cloudinary) com pasta `post-express/brand-kits/{profile_id}/`
- **Types temporários:** Definidos inline até Task #2 criar `/types/brand-kit.ts` dedicado
- **Accordion:** Implementado manualmente (não usa library externa)
- **Form state:** useState local (não usa react-hook-form)
- **Preview:** Atualiza em tempo real via formData state
