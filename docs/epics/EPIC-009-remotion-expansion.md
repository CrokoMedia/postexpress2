# EPIC 009: Remotion Expansion — Fábrica de Conteúdo Multiplataforma

**Status**: ✅ Concluído (8/8 stories)
**Prioridade**: 🔴 Alta
**Duração Estimada**: 5 semanas (4 sprints)
**Agente Responsável**: @dev + @architect
**Roadmap**: [docs/REMOTION-ROADMAP.md](../REMOTION-ROADMAP.md)

---

## Objetivo

Expandir o Remotion de "gerador de reels" para **fábrica de conteúdo multiplataforma**, eliminando Puppeteer, adicionando multi-formato, preview ao vivo, voiceover com legendas, templates visuais e vídeo animado de auditoria.

---

## Contexto

**Estado Atual:**
- Remotion integrado com geração de Reels (MP4) a partir de carrosséis
- Template V2 (SlideFrame.tsx) replicado em React
- PNGs ainda gerados via Puppeteer + HTML strings (~1400 linhas)
- 1 único formato de output (1080x1350)
- Zero preview visual antes de renderizar

**Dependências:**
- EPIC-005 (Geração Visual — base Cloudinary já implementada)
- Remotion, @remotion/renderer, @remotion/bundler já instalados

**Bloqueia:**
- Nenhum epic diretamente, mas habilita escalabilidade do produto

---

## Métricas de Sucesso

| Métrica | Baseline | Target |
|---------|----------|--------|
| Formatos de output por carrossel | 1 (PNG) | 4 (PNG + Reel + Story + Square) |
| Tempo de preview | 0 (sem preview) | Instantâneo (Player) |
| Linhas de template HTML | ~1400 | 0 (tudo em React) |
| Templates visuais | 1 | 5+ |
| Conteúdo com áudio | 0% | 100% (opcional) |
| Conteúdo da auditoria postável | 0 | 1 vídeo animado |

---

## Stories

### Sprint 1 (1 semana) — Foundation

| Story | Título | Prioridade | Status |
|-------|--------|------------|--------|
| [9.1](../stories/STORY-9.1-renderstill-replace-puppeteer.md) | renderStill() substitui Puppeteer | P0 | ✅ Concluído |
| [9.2](../stories/STORY-9.2-multi-format-story-square.md) | Multi-formato: Story + Square | P1 | ✅ Concluído |

### Sprint 2 (1 semana) — Preview & Templates Base

| Story | Título | Prioridade | Status |
|-------|--------|------------|--------|
| [9.3](../stories/STORY-9.3-remotion-player-dashboard.md) | Remotion Player no Dashboard | P1 | ✅ Concluído |
| [9.6](../stories/STORY-9.6-templates-hormozi-editorial.md) | Templates: Hormozi + Editorial | P3 | ✅ Concluído |

### Sprint 3 (2 semanas) — Audio & Audit Video

| Story | Título | Prioridade | Status |
|-------|--------|------------|--------|
| [9.4](../stories/STORY-9.4-voiceover-tts.md) | Voiceover via TTS | P2 | ✅ Concluído |
| [9.5](../stories/STORY-9.5-animated-captions.md) | Legendas Animadas | P2 | ✅ Concluído |
| [9.8](../stories/STORY-9.8-audit-video.md) | Vídeo Animado da Auditoria | P3 | ✅ Concluído |

### Sprint 4 (1 semana) — Polish & Extra Templates

| Story | Título | Prioridade | Status |
|-------|--------|------------|--------|
| [9.7](../stories/STORY-9.7-templates-neon-datadriven.md) | Templates: Neon + Data Driven | P3 | ✅ Concluído |

---

## Custos & Dependências Externas

### Pacotes NPM
```bash
# Sprint 1 — já instalados
remotion, @remotion/renderer, @remotion/bundler

# Sprint 2
@remotion/player

# Sprint 3
@remotion/captions
```

### APIs Externas (Sprint 3)
| API | Uso | Custo/mês (100 reels) |
|-----|-----|-----------------------|
| OpenAI TTS | Voiceover | ~$2 |
| ElevenLabs | Voiceover premium | ~$5 |
| fal.ai (Flux) | Imagens (já usado) | ~$10 |

### Licença Remotion
- Uso atual: gratuito (pessoal/educacional)
- Comercial: ~$450/ano (necessário quando cobrar pelo serviço)

---

## Gate de Qualidade

- [ ] Todas as stories com acceptance criteria atendidos
- [ ] Zero linhas de template HTML Puppeteer em uso ativo
- [ ] Testes de renderização para cada formato (PNG, Reel, Story, Square)
- [ ] Performance: PNG < 5s, Reel < 30s, Player < 2s para carregar
- [ ] UI consistente com Design System existente
- [ ] Sem regressões nas features existentes (carrosséis, export ZIP/Drive)

---

## Próximo Passo
→ **EPIC COMPLETA!** Todas as 8 stories implementadas. Próximo: code review e testes de integração.

---

**Criado por**: 👑 Orion (aios-master)
**Data**: 2026-02-20
**Fonte**: docs/REMOTION-ROADMAP.md v1.0
