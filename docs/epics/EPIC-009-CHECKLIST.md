# EPIC-009 — Checklist Master de Implementação

> Checklist completa para acompanhar o progresso da expansão Remotion.
> Marque [x] conforme cada item for concluído.

---

## Sprint 1 — Foundation (Semana 1)

### Story 9.1: renderStill() Substitui Puppeteer (P0)
- [ ] `remotion/compositions/CarouselStill.tsx` criado
- [ ] `SlideFrame.tsx` com prop `animated: boolean`
- [ ] `app/api/content/[id]/generate-slides-v3/route.ts` criado
- [ ] Geração de imagens fal.ai integrada no fluxo v3
- [ ] `renderStill()` gera PNGs corretamente
- [ ] Upload Cloudinary funcionando na rota v3
- [ ] Bundle Remotion cacheado (não re-bundla por slide)
- [ ] Performance < 5s/slide validada
- [ ] Rotas v1/v2 marcadas como deprecated
- [ ] Frontend apontando para rota v3
- [ ] Teste: carrossel completo (7-10 slides) gerado com sucesso

### Story 9.2: Multi-formato (P1)
- [ ] `LAYOUT_CONFIG` criado com medidas para feed/story/square
- [ ] `SlideFrame.tsx` com prop `layout: 'feed' | 'story' | 'square'`
- [ ] `remotion/compositions/StoryReel.tsx` (1080x1920) criado
- [ ] `remotion/compositions/SquareReel.tsx` (1080x1080) criado
- [ ] Composições registradas no `index.tsx`
- [ ] API generate-reel aceita `format` parameter
- [ ] API generate-slides-v3 aceita `format` parameter
- [ ] UI: seletor de formato no dashboard
- [ ] Teste: PNG e MP4 gerados para cada formato
- [ ] Teste: layout adaptativo correto por formato

---

## Sprint 2 — Preview & Templates Base (Semana 2)

### Story 9.3: Remotion Player no Dashboard (P1)
- [ ] `@remotion/player` instalado
- [ ] `components/molecules/reel-preview-player.tsx` criado
- [ ] Player com controles (play/pause/seek) funcional
- [ ] Player integrado na página de slides (split view)
- [ ] Preview atualiza em tempo real com mudanças
- [ ] Placeholders para imagens não geradas
- [ ] Suporta todos os 3 formatos
- [ ] Dynamic import para performance
- [ ] Responsivo (desktop + mobile)
- [ ] Performance: Player carrega < 2s

### Story 9.6: Templates Hormozi + Editorial (P3)
- [ ] `remotion/templates/` diretório criado
- [ ] `remotion/templates/types.ts` com interface TemplateConfig
- [ ] `remotion/templates/index.ts` com registry
- [ ] Template "Minimalista" (V2 refatorado) extraído
- [ ] Template "Hormozi Dark Bold" criado
- [ ] Template "Editorial Magazine" migrado do HTML
- [ ] `templateId` adicionado ao schema Zod
- [ ] SlideFrame lê config do template selecionado
- [ ] API aceita `templateId` parameter
- [ ] Galeria de templates no dashboard
- [ ] Teste: 3 templates geram PNG e MP4 corretamente

---

## Sprint 3 — Audio & Audit Video (Semana 3-4)

### Story 9.4: Voiceover via TTS (P2)
- [ ] `lib/tts.ts` criado com interface unificada
- [ ] OpenAI TTS provider implementado
- [ ] Áudio gerado em pt-BR com voz natural
- [ ] Upload áudio para Cloudinary
- [ ] `CarouselReel.tsx` com `<Audio>` component
- [ ] Duração por slide adapta ao tempo do áudio
- [ ] `getAudioDurationInSeconds()` integrado
- [ ] API generate-reel aceita `voiceover: boolean`
- [ ] Toggle "Adicionar narração" no dashboard
- [ ] Variáveis de ambiente atualizadas
- [ ] Custo por reel < $0.05 validado

### Story 9.5: Legendas Animadas (P2)
- [ ] `@remotion/captions` instalado
- [ ] Timestamps word-by-word extraídos (Whisper)
- [ ] `remotion/components/AnimatedCaptions.tsx` criado
- [ ] Estilo "highlight" funcional (palavra com fundo)
- [ ] Legendas sincronizadas com áudio
- [ ] Adaptação por formato (feed/story/square)
- [ ] API aceita `captions: boolean`
- [ ] Toggle "Legendas animadas" no dashboard
- [ ] Dependency: desabilitado se voiceover off
- [ ] Teste: MP4 com legendas word-by-word corretas

### Story 9.8: Vídeo Animado da Auditoria (P3)
- [ ] `remotion/components/RadarChart.tsx` criado (SVG animado)
- [ ] `remotion/components/ScoreBar.tsx` criado
- [ ] `remotion/compositions/AuditResult.tsx` criado
- [ ] Seção Intro (2s) com logo + @username
- [ ] Seção Radar (8s) com gráfico animado
- [ ] Seção Insights (5s) com typewriter text
- [ ] Seção CTA (3s) com branding
- [ ] `app/api/audits/[id]/generate-audit-video/route.ts` criado
- [ ] Upload para Cloudinary funcional
- [ ] Campo `audit_video_url` no Supabase (migration)
- [ ] Botão "Gerar Vídeo da Auditoria" na página de resultado
- [ ] Suporta formatos 1:1 e 9:16

---

## Sprint 4 — Polish & Extra Templates (Semana 5)

### Story 9.7: Templates Neon + Data Driven (P3)
- [ ] `remotion/templates/neon-social.ts` criado
- [ ] `remotion/templates/data-driven.ts` criado
- [ ] `remotion/components/CountUpNumber.tsx` criado
- [ ] `remotion/components/AnimatedBar.tsx` criado
- [ ] Neon Social: gradiente + glow funcional
- [ ] Data Driven: contagem + barras animadas
- [ ] Ambos registrados no template registry
- [ ] Galeria atualizada com 5 templates

### Polimento Final
- [ ] Testes de renderização para todos os formatos x templates
- [ ] Performance benchmarks documentados
- [ ] Zero regressões verificadas (carrosséis, ZIP, Drive)
- [ ] Error handling robusto em todas as rotas
- [ ] Loading states e feedback visual no dashboard
- [ ] Cleanup: remover código Puppeteer deprecated (se aprovado)
- [ ] Documentação atualizada (CLAUDE.md, README)

---

## Métricas de Validação Final

| Métrica | Target | Status |
|---------|--------|--------|
| Formatos de output | 4 (PNG + Reel + Story + Square) | [ ] |
| Preview instantâneo | < 2s para carregar | [ ] |
| Template HTML removido | 0 linhas em uso ativo | [ ] |
| Templates visuais | 5 | [ ] |
| Conteúdo com áudio | Disponível (opt-in) | [ ] |
| Vídeo de auditoria | Funcional | [ ] |
| Custo por reel | < $0.50 | [ ] |

---

**Criado por**: 👑 Orion (aios-master)
**Data**: 2026-02-20
**Total de items**: 76 checkboxes
