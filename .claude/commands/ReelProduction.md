Ative o Reel Production Squad para transformar carrosséis aprovados em vídeos profissionais (Reels/Stories/Shorts).

## Squad: 4 Agentes Especializados

Leia os agentes e siga o pipeline definido:

1. **Screenwriter** — Leia `reel-production-squad/agents/screenwriter.md` e execute `reel-production-squad/tasks/write-screenplay.md`
2. **Art Director** — Leia `reel-production-squad/agents/art-director.md` e execute `reel-production-squad/tasks/define-visual-identity.md`
3. **Creative Director** — Leia `reel-production-squad/agents/creative-director.md` e execute `reel-production-squad/tasks/direct-scenes.md`
4. **Editor** — Leia `reel-production-squad/agents/editor.md` e execute `reel-production-squad/tasks/review-video.md`

## Pipeline

```
Carrossel Aprovado
       |
       +----------------+
       v                v
  Screenwriter    Art Director   (paralelo)
       |                |
       +-------+--------+
               v
         Creative Director -> ReelSpec JSON
               |
               v
         Render (Remotion via /api/content/[id]/generate-reel)
               |
               v
         Editor -> Aprovacao/Ajustes
```

## Workflow Completo

Leia e siga: `reel-production-squad/workflows/reel-production-pipeline.md`

## Referencia Tecnica

- Catalogo Remotion (49 componentes): `reel-production-squad/data/remotion-catalog.md`
- Types: `remotion/types.ts` (CarouselReelProps)
- API endpoint: `POST /api/content/[id]/generate-reel`

## Output Esperado

ReelSpec JSON compativel com `CarouselReelProps`, pronto para renderizacao via Remotion.
