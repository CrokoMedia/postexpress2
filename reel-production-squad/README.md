# Reel Production Squad

> Squad de produção de vídeo que transforma carrosséis aprovados em Reels profissionais.

---

## Agentes

| Agente | Role | Input | Output |
|--------|------|-------|--------|
| 📝 **Screenwriter** | Roteirista cinematográfico | Carrossel aprovado | Roteiro (Screenplay) |
| 🎨 **Art Director** | Diretor de arte visual | Perfil + tipo conteúdo | Identidade visual (VisualIdentity) |
| 🎬 **Creative Director** | Diretor criativo/técnico | Roteiro + Visual | Spec técnico (ReelSpec JSON) |
| 🔧 **Editor** | Pós-produção & QA | Vídeo V1 + Specs | Aprovação ou lista de ajustes |

---

## Pipeline

```
CARROSSEL APROVADO
       │
       ├──────────────────┐
       ▼                  ▼
  📝 Roteirista     🎨 Art Director    ← paralelo
       │                  │
       └────────┬────────┘
                ▼
           🎬 Diretor
                │
                ▼
           ⚙️ Render (Remotion)
                │
                ▼
           🔧 Editor
                │
                ├── ✅ Aprovado → Entrega
                └── 🔄 Ajustes → Diretor
```

---

## Quick Start

```bash
# Ativar o squad
/reel-production-squad

# Ou ativar agentes individualmente
@screenwriter *write         # Criar roteiro
@art-director *design        # Definir visual
@creative-director *direct   # Criar spec técnico
@editor *review              # Revisar vídeo
```

---

## Estrutura

```
reel-production-squad/
├── squad.yaml                    # Configuração principal
├── README.md                     # Esta documentação
├── agents/
│   ├── screenwriter.md           # 📝 Roteirista
│   ├── creative-director.md      # 🎬 Diretor
│   ├── art-director.md           # 🎨 Art Director
│   └── editor.md                 # 🔧 Editor
├── tasks/
│   ├── write-screenplay.md       # Carrossel → Roteiro
│   ├── direct-scenes.md          # Roteiro + Visual → Spec técnico
│   ├── define-visual-identity.md # Perfil → Identidade visual
│   └── review-video.md           # Vídeo → Revisão + QA
├── workflows/
│   └── reel-production-pipeline.md  # Pipeline completo
└── data/
    └── remotion-catalog.md       # Catálogo de 49 componentes Remotion
```

---

## Dependências

- **Content Creation Squad** — Carrosséis aprovados (input)
- **Remotion** — Engine de renderização (49 componentes)
- **fal.ai** — Geração de imagens
- **OpenAI / ElevenLabs** — TTS + SFX
- **Pexels** — Stock video (B-Roll)
- **Cloudinary** — CDN de mídia
- **Supabase** — Persistência

---

*Reel Production Squad v1.0 | Croko Labs | Pazos Media*
