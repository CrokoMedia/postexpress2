# Story 9.3: Remotion Player no Dashboard (Preview ao Vivo)

**Epic:** [EPIC-009 - Remotion Expansion](../epics/EPIC-009-remotion-expansion.md)
**Status:** ✅ Concluído
**Priority:** P1 (High)
**Estimate:** 2 dias
**Owner:** @dev
**Sprint:** Sprint 2 - Semana 2
**Depende de:** Story 9.1 (SlideFrame reutilizavel), Story 9.2 (multi-formato)

---

## Descricao

Embutir o `<Player>` do `@remotion/player` no dashboard para preview instantaneo do carrossel antes de renderizar. O creator ve o resultado em tempo real enquanto edita texto/imagens, sem precisar esperar 2-3 minutos de renderizacao.

---

## Acceptance Criteria

- [x] Pacote `@remotion/player` instalado
- [x] Componente `ReelPreviewPlayer` criado e reutilizavel
- [x] Player renderiza preview do carrossel com controles (play/pause/seek)
- [x] Preview atualiza em tempo real quando props mudam (texto, imagens)
- [x] Player suporta todos os formatos (feed 4:5, story 9:16, square 1:1)
- [x] Placeholders visuais para imagens ainda nao geradas pelo fal.ai
- [x] Performance: Player carrega em < 2s (dynamic import com loading state)
- [x] Layout responsivo (player scaled down para caber no dashboard)

---

## Tarefas Tecnicas

### 1. Instalar @remotion/player
- [x] `npm install @remotion/player --legacy-peer-deps`
- [x] Verificar compatibilidade com versao atual do Remotion (4.0.425)

### 2. Criar Componente ReelPreviewPlayer
- [x] Criar `components/molecules/reel-preview-player.tsx`
- [x] Props:
  ```typescript
  interface ReelPreviewPlayerProps {
    slides: PreviewSlide[]
    profileName?: string
    profileUsername?: string
    profileImageUrl?: string
    templateId?: string
    format?: 'feed' | 'story' | 'square'
    autoPlay?: boolean
    loop?: boolean
    className?: string
  }
  ```
- [x] Usar `<Player>` do `@remotion/player` (via reel-player-inner.tsx)
- [x] Calcular `durationInFrames` baseado no numero de slides
- [x] Dimensoes scaled down para preview (360px desktop, 280px mobile)

### 3. Sistema de Placeholders
- [x] Criar placeholder visual para slides sem imagem gerada (empty state com icone Monitor)
- [x] Gradiente placeholder via SlideFrame/template `imagePlaceholderGradient`
- [x] Substituir automaticamente quando imagem fal.ai estiver disponivel (props reativas)

### 4. Integrar no Dashboard
- [x] Modificar `app/dashboard/audits/[id]/create-content/slides/page.tsx`
- [x] Adicionar Player ao lado do editor de conteudo (layout split)
- [x] Player atualiza quando:
  - Texto de um slide e editado
  - Formato e alterado (feed/story/square)
  - Template visual e trocado
  - Imagem e gerada/substituida
- [x] Toggle para mostrar/esconder player (botao Ocultar/Mostrar)

### 5. Responsividade
- [x] Player se adapta ao viewport:
  - Desktop: ao lado do editor (split view, sticky sidebar)
  - Mobile: abaixo do editor (stacked)
- [x] Scale proporcional mantendo aspect ratio
- [x] Controles de player visiveis e usaveis em mobile

---

## Arquivos

### Criados
| Arquivo | Descricao |
|---------|-----------|
| `components/molecules/reel-preview-player.tsx` | Componente Player reutilizavel (outer, com controles) |
| `components/molecules/reel-player-inner.tsx` | Wrapper do Remotion Player (dynamic import, ssr: false) |

### Modificados
| Arquivo | Mudanca |
|---------|---------|
| `app/dashboard/audits/[id]/create-content/slides/page.tsx` | Layout split com Player, seletor de carrossel |
| `package.json` | `@remotion/player` ja estava presente |

---

## Desafios Conhecidos

| Desafio | Solucao |
|---------|---------|
| Componentes Remotion precisam ser client-side | `'use client'` no componente Player |
| Imagens fal.ai so existem apos geracao | Placeholders com gradiente via template config |
| Performance em dispositivos fracos | Toggle para desabilitar player (Ocultar/Mostrar) |
| Bundle size do Player pode ser grande | Dynamic import com `next/dynamic` + ssr: false |
| `staticFile` do Remotion no contexto Next.js | Funciona pois Next.js serve `/public` na raiz |

---

## Definition of Done

- [x] Player funcional com controles no dashboard
- [x] Preview atualiza em tempo real com mudancas de conteudo
- [x] Suporta todos os 3 formatos
- [x] Placeholders para imagens nao geradas
- [x] Responsivo em desktop e mobile
- [x] Performance < 2s para carregar (dynamic import com spinner)
- [ ] Code review aprovado

---

**Criado por**: Orion (aios-master)
**Implementado por**: @dev
**Data**: 2026-02-20
