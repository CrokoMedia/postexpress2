# Story 10.4: Background Music

**Epic:** [EPIC-010 - Reel Quality Pro](../epics/EPIC-010-reel-quality-pro.md)
**Status:** ✅ Concluído
**Priority:** P1 (High)
**Estimate:** 1 dia
**Owner:** @dev
**Wave:** 2 - Polish & Engagement
**Depende de:** Nenhuma

---

## Descrição

Adicionar música de fundo aos reels. Reels sem música performam significativamente pior no Instagram. A música toca em volume baixo (15-20%) enquanto o voiceover fica em 100%, criando uma experiência profissional completa.

---

## Acceptance Criteria

- [ ] Biblioteca de 10-15 tracks royalty-free em `/public/audio/music/`
- [ ] Tracks organizados por mood: energético, calmo, motivacional, corporativo
- [ ] Seletor de "mood" no dashboard
- [ ] Música renderizada como `<Audio>` no Remotion com volume 0.15-0.20
- [ ] Música faz loop se reel for mais longo que a track
- [ ] Fade-in (0.5s) no início e fade-out (1s) no final
- [ ] Voiceover mantém volume 1.0 (prioridade)
- [ ] Toggle "Música de fundo" no dashboard (on/off)
- [ ] Suporta todos os formatos

---

## Tarefas Técnicas

### 1. Curar Biblioteca de Músicas
- [ ] Selecionar 12 tracks royalty-free (CC0 ou similar)
- [ ] Fontes: Pixabay Music, Free Music Archive, YouTube Audio Library
- [ ] Organizar por mood:
  - `energetic/` — 3 tracks (upbeat, motivacional)
  - `calm/` — 3 tracks (ambient, lofi)
  - `corporate/` — 3 tracks (profissional, clean)
  - `inspiring/` — 3 tracks (cinematic, emotional)
- [ ] Formato: mp3, 128kbps, 30-60s cada
- [ ] Salvar em `/public/audio/music/{mood}/track-N.mp3`

### 2. Criar Music Registry
- [ ] Criar `lib/music-library.ts`
- [ ] Interface `MusicTrack { id, name, mood, duration, path }`
- [ ] Registry com todos os tracks disponíveis
- [ ] Função `getRandomTrack(mood)` para seleção

### 3. Integrar no Remotion
- [ ] Modificar composições para aceitar `backgroundMusicUrl`
- [ ] Adicionar `<Audio>` do Remotion com:
  - `volume`: 0.15 (quando tem voiceover) ou 0.30 (sem voiceover)
  - `loop`: true (se reel > track)
  - Fade-in nos primeiros 15 frames (0.5s)
  - Fade-out nos últimos 30 frames (1s)
- [ ] Interpolação de volume para fade: `interpolate(frame, [0, 15], [0, targetVolume])`

### 4. Atualizar API
- [ ] Aceitar `backgroundMusic: boolean` e `musicMood: string` no body
- [ ] Se ativado, selecionar track baseado no mood
- [ ] Passar URL da música para composição Remotion

### 5. UI — Seletor de Música
- [ ] Toggle "Música de fundo" no dashboard
- [ ] Seletor de mood com 4 opções visuais (ícones)
- [ ] Preview: botão play para ouvir snippet de 5s do track selecionado (nice to have)
- [ ] Indicador: "Volume: 15% (não compete com narração)"

---

## Arquivos

### Criar
| Arquivo | Descrição |
|---------|-----------|
| `lib/music-library.ts` | Registry de tracks musicais |
| `public/audio/music/` | Diretório com tracks organizados por mood |

### Modificar
| Arquivo | Mudança |
|---------|---------|
| `remotion/compositions/CarouselReel.tsx` | Background music `<Audio>` |
| `remotion/compositions/StoryReel.tsx` | Background music |
| `remotion/compositions/SquareReel.tsx` | Background music |
| `remotion/types.ts` | backgroundMusicUrl, musicVolume |
| `app/api/content/[id]/generate-reel/route.ts` | Music selection |
| `app/dashboard/audits/[id]/create-content/slides/page.tsx` | Toggle + mood selector |

---

## Definition of Done

- [ ] 12 tracks royalty-free disponíveis em 4 moods
- [ ] Música de fundo renderizada no reel com volume adequado
- [ ] Fade-in/out suave
- [ ] Não compete com voiceover
- [ ] Toggle e seletor funcional no dashboard
- [ ] Build sem erros

---

**Criado por**: 👑 Orion (aios-master)
**Data**: 2026-02-20
