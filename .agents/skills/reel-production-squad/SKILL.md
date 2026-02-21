---
name: reel-production-squad
description: Ativar o Reel Production Squad para transformar carrosséis aprovados em vídeos profissionais (Reels/Stories/Shorts). Use para produzir vídeos com roteiro cinematográfico, direção visual e QA integrado.
metadata:
  tags: video, reels, remotion, production, instagram, tiktok, shorts
  triggers: criar reel, produzir vídeo, reel production, criar vídeo, transformar carrossel em vídeo, gerar reel
---

## When to use

Use este skill quando precisar transformar carrosséis aprovados em vídeos profissionais. O squad orquestra 4 agentes especializados:

1. **📝 Screenwriter** — Transforma o carrossel em roteiro cinematográfico
2. **🎨 Art Director** — Define identidade visual (paleta, template, estilo)
3. **🎬 Creative Director** — Combina roteiro + visual em spec técnico JSON
4. **🔧 Editor** — Revisa o vídeo e aprova ou pede ajustes

## Pipeline

```
Carrossel Aprovado
       │
       ├────────────────┐
       ▼                ▼
  📝 Roteirista   🎨 Art Director   (paralelo)
       │                │
       └───────┬───────┘
               ▼
          🎬 Diretor → ReelSpec JSON
               │
               ▼
          ⚙️ Render (Remotion)
               │
               ▼
          🔧 Editor → Aprovação/Ajustes
```

## How to use

O squad completo está em [reel-production-squad/](../../../reel-production-squad/):

### Agentes
- [agents/screenwriter.md](../../../reel-production-squad/agents/screenwriter.md) — Roteirista cinematográfico
- [agents/art-director.md](../../../reel-production-squad/agents/art-director.md) — Diretor de arte
- [agents/creative-director.md](../../../reel-production-squad/agents/creative-director.md) — Diretor criativo/técnico
- [agents/editor.md](../../../reel-production-squad/agents/editor.md) — Editor de pós-produção

### Tasks
- [tasks/write-screenplay.md](../../../reel-production-squad/tasks/write-screenplay.md) — Carrossel → Roteiro
- [tasks/define-visual-identity.md](../../../reel-production-squad/tasks/define-visual-identity.md) — Perfil → Visual
- [tasks/direct-scenes.md](../../../reel-production-squad/tasks/direct-scenes.md) — Roteiro + Visual → Spec JSON
- [tasks/review-video.md](../../../reel-production-squad/tasks/review-video.md) — Vídeo → QA

### Workflow
- [workflows/reel-production-pipeline.md](../../../reel-production-squad/workflows/reel-production-pipeline.md) — Pipeline completo

### Referência Técnica
- [data/remotion-catalog.md](../../../reel-production-squad/data/remotion-catalog.md) — Catálogo de 49 componentes Remotion

## Activation

```
/reel-production-squad           # Ativar o squad completo
@screenwriter *write             # Apenas roteiro
@art-director *design            # Apenas visual
@creative-director *direct       # Apenas spec técnico
@editor *review                  # Apenas revisão
```

## Output

O squad produz um **ReelSpec JSON** compatível com `CarouselReelProps` em `remotion/types.ts`, pronto para alimentar o endpoint `/api/content/[id]/generate-reel`.
