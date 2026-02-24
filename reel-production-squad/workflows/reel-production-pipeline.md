---
id: WF-RP-001
name: Reel Production Pipeline
version: 1.0.0
description: |
  Pipeline completo de produção de Reels profissionais.
  Transforma carrosséis aprovados em vídeos prontos para publicação.
trigger: manual
phases:
  - ROTEIRO
  - IDENTIDADE_VISUAL
  - DIRECAO
  - RENDER
  - REVISAO
  - ENTREGA
agents_involved:
  - screenwriter
  - art-director
  - creative-director
  - editor
quality_gates:
  - QG-001: Roteiro Validado
  - QG-002: Identidade Visual Coerente
  - QG-003: Spec Técnico Completo
  - QG-004: Vídeo Aprovado pelo Editor
estimated_duration: 15-30 minutos (sem render)
input: Carrossel aprovado + perfil do criador
output: Vídeo final (MP4) + metadata
---

# Reel Production Pipeline

## Visão Geral

```
CARROSSEL APROVADO
       │
       ├──────────────────────────────────┐
       ▼                                  ▼
  📝 ROTEIRISTA                     🎨 ART DIRECTOR
  "Carrossel → Roteiro"             "Perfil → Visual"
  (5-10 min)                        (3-5 min)
       │                                  │
       │  Screenplay                      │  VisualIdentity
       └──────────────┬──────────────────┘
                      ▼
                 🎬 DIRETOR
                 "Roteiro + Visual → Spec"
                 (5-10 min)
                      │
                      │  ReelSpec (JSON)
                      ▼
                 ⚙️ RENDER (Remotion)
                 (automático, 2-5 min)
                      │
                      │  video_v1.mp4
                      ▼
                 🔧 EDITOR
                 "Revisão + QA"
                 (5-10 min)
                      │
                      ├── ✅ Aprovado → ENTREGA
                      └── 🔄 Ajustes → volta pro 🎬 DIRETOR
```

---

## Phase 1: ROTEIRO (paralela com Phase 2)

### Purpose
Transformar o conteúdo estático do carrossel em narrativa cinematográfica para vídeo curto.

### Agent: Screenwriter (📝)
**Task**: write-screenplay.md
**Elicit**: true (plataforma, duração alvo, tom)

### Steps
1. Analisar carrossel (título, tipo, slides, CTA, objetivo)
2. Identificar arco narrativo e emoção dominante
3. Escolher estrutura viral
4. Escrever hook (2-3s)
5. Escrever cenas com narração oral
6. Escrever CTA
7. Definir diretrizes para outros agentes

### Output: `Screenplay`
```typescript
{
  titulo, tipo_narrativa, tom, duracao_estimada_segundos,
  hook: { texto, estilo, emocao, duracao_segundos },
  cenas: [{ numero, nome, narracao, texto_tela, emocao, ritmo, duracao_segundos, notas_direcao }],
  cta: { texto_narracao, texto_tela, emocao, duracao_segundos },
  diretrizes: { mood_geral, referencia_visual, musica_sugerida, intensidade_efeitos }
}
```

### Quality Gate: QG-001
- [ ] Hook ≤ 3 segundos
- [ ] Narração em linguagem oral
- [ ] Cada cena tem emoção + ritmo + duração
- [ ] Duração total dentro do alvo
- [ ] CTA claro e acionável

---

## Phase 2: IDENTIDADE_VISUAL (paralela com Phase 1)

### Purpose
Definir a identidade visual completa do vídeo baseada no perfil e tipo de conteúdo.

### Agent: Art Director (🎨)
**Task**: define-visual-identity.md
**Elicit**: true (formato, cores de marca, estilo)

### Steps
1. Analisar perfil (nicho, cores, estilo)
2. Selecionar template (matriz nicho × tipo)
3. Definir paleta de cores
4. Definir estilo de imagem + prompts
5. Recomendar background, caption style, tipografia
6. Criar mood board

### Output: `VisualIdentity`
```typescript
{
  templateId, paleta: { primary, secondary, accent, background, text, textSecondary },
  estiloImagem: { tipo, mood, prefixoPrompt, sufixoPrompt, evitar },
  animatedBackground, captionStyle, tipografia, moodBoard
}
```

### Quality Gate: QG-002
- [ ] Template coerente com nicho/tipo
- [ ] Contraste WCAG AA
- [ ] Prompts de imagem específicos
- [ ] Caption style adequado ao público

---

## Phase 3: DIRECAO

### Purpose
Combinar roteiro + identidade visual em spec técnico JSON executável pelo Remotion.

### Agent: Creative Director (🎬)
**Task**: direct-scenes.md
**Requires**: Phase 1 (Screenplay) + Phase 2 (VisualIdentity)

### Steps
1. Assimilar roteiro + visual
2. Definir configurações globais (áudio, visual, hook)
3. Spec cena-a-cena (text effect, transição, imagem prompt, SFX, música)
4. Validar coerência
5. Gerar ReelSpec JSON

### Output: `ReelSpec`
```typescript
{
  titulo, format, fps, templateId,
  audio: { voiceover, voice, backgroundMusic, musicMood, soundEffects },
  visual: { hookEnabled, hookText, captionStyle, animatedBackground, ... },
  cenas: [{
    numero, titulo, corpo, narracao,
    textEffect, imagemPrompt, transicao,
    efeitos: { particleBurst, zoomPulse, glowHighlight },
    sfx: { whoosh, pop, swoosh },
    musicaDucking, musicaIntensidade
  }]
}
```

### Quality Gate: QG-003
- [ ] Todas as cenas completas
- [ ] Transições variam
- [ ] Text effects variam
- [ ] Hook e CTA com efeitos fortes
- [ ] Prompts de imagem específicos
- [ ] Duração estimada no target

---

## Phase 4: RENDER (Automático)

### Purpose
Renderizar o vídeo usando Remotion com o spec técnico do Diretor.

### Type: Automated (não é agente)
**Endpoint**: `/api/content/[id]/generate-reel`

### Steps
1. Gerar imagens via fal.ai (paralelo)
2. Gerar voiceover via TTS (paralelo)
3. Gerar captions via Whisper (sequencial após TTS)
4. Gerar SFX via ElevenLabs (paralelo)
5. Buscar background music (paralelo)
6. Buscar B-Roll se aplicável (paralelo)
7. Bundle Remotion
8. Renderizar vídeo
9. Upload para Cloudinary
10. Salvar metadata no Supabase

### Output: `video_v1.mp4` + metadata

---

## Phase 5: REVISAO

### Purpose
Quality assurance do vídeo renderizado.

### Agent: Editor (🔧)
**Task**: review-video.md

### Steps
1. Revisar hook (PRIORIDADE MÁXIMA)
2. Revisar timing & ritmo
3. Revisar visual
4. Revisar áudio
5. Revisar narrativa
6. Prever performance
7. Emitir veredicto

### Output: `EditReview`

### Decision Point
```
Score 90-100 → ✅ APROVADO → Phase 6 (ENTREGA)
Score 75-89  → 🔄 AJUSTES MENORES → Phase 3 (DIRECAO, ajuste fino)
Score 50-74  → 🔄 AJUSTES MAIORES → Phase 3 (DIRECAO, lista detalhada)
Score 0-49   → 🔴 REFAZER → Phase 1 (ROTEIRO, novo approach)
```

### Quality Gate: QG-004
- [ ] Score ≥ 75 para aprovação
- [ ] Hook classificado como "forte" ou "ok"
- [ ] Nenhum problema "crítico" pendente
- [ ] Máximo 3 loops de revisão

---

## Phase 6: ENTREGA (Automático)

### Purpose
Finalizar e disponibilizar o vídeo.

### Type: Automated

### Steps
1. Upload final para Cloudinary (se houve re-render)
2. Salvar metadata final no Supabase (`reel_videos_json`)
3. Gerar thumbnail (frame do hook)
4. Notificar usuário

### Output Final
```json
{
  "videoUrl": "https://res.cloudinary.com/.../video.mp4",
  "duration": 35.2,
  "format": "feed",
  "templateId": "hormozi-dark",
  "score": 92,
  "hookStatus": "forte",
  "iterations": 1
}
```

---

## Regras do Pipeline

### 1. Paralelismo
- Phases 1 e 2 rodam em PARALELO (Roteirista e Art Director não dependem um do outro)
- Phase 3 SÓ começa quando ambas terminam

### 2. Loop de Refinamento
- Máximo 3 loops entre Editor ↔ Diretor
- Se após 3 loops score < 75 → escalar para usuário

### 3. Fallbacks
- Se TTS falhar → gerar sem voiceover (só texto visual)
- Se fal.ai falhar → usar placeholder (gradiente com texto)
- Se SFX falhar → gerar sem SFX (não bloqueia)
- Se música falhar → gerar sem música (não bloqueia)

### 4. Tempo Total Estimado
| Fase | Tempo |
|------|-------|
| Roteiro + Visual (paralelo) | 5-10 min |
| Direção | 5-10 min |
| Render | 2-5 min |
| Revisão | 5-10 min |
| **Total (sem loop)** | **17-35 min** |
| **Total (com 1 loop)** | **27-50 min** |

---

*Pipeline v1.0 | Reel Production Squad | Croko Labs*
