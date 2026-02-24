# Remotion Roadmap — Croko Labs

> Plano de expansão do Remotion no Croko Labs.
> De "gerador de carrosséis" para "fábrica de conteúdo multiplataforma".

---

## Status Atual

O Remotion já está integrado ao Croko Labs com a feature base:

- **Reels animados (MP4)** a partir de carrosséis aprovados
- Template V2 replicado em React (SlideFrame.tsx)
- Transições alternadas (slide + fade) via TransitionSeries
- Animações spring no título, fade no corpo, scale na imagem
- Upload automático para Cloudinary
- Botão "Gerar Reel (MP4)" no dashboard

**Arquivos atuais:**
```
remotion/
├── index.tsx                     # Root com registerRoot()
├── types.ts                      # Schema Zod + tipos
├── fonts.ts                      # Sofia Pro loader
├── components/
│   └── SlideFrame.tsx            # Slide visual (replica V2)
└── compositions/
    └── CarouselReel.tsx          # TransitionSeries composition
```

---

## P0 — Substituir Puppeteer por renderStill()

### Problema
Os PNGs dos slides são gerados com Puppeteer + HTML strings inline (700+ linhas de template literals em cada route). Isso causa:
- Duplicação: design visual escrito duas vezes (HTML para PNG, React para vídeo)
- Hack de emojis: conversão para base64 Apple PNGs (desnecessário no Remotion)
- Hardcoded fonts: caminhos `file://` absolutos que quebram em produção
- Manutenção difícil: mudar um padding requer editar HTML string, não JSX

### Solução
Usar `renderStill()` do `@remotion/renderer` para gerar PNGs usando os **mesmos componentes React** que já geram os vídeos.

### Impacto
- Um componente `SlideFrame.tsx` gera PNG **e** MP4
- Remove ~1400 linhas de HTML template (generate-slides + generate-slides-v2)
- Remove dependência de `lib/emoji-utils.ts` e `lib/browser.ts`
- Fonts carregadas via `@remotion/fonts` (portável, sem file://)

### Implementação
```
POST /api/content/[id]/generate-slides-v3
  → Para cada slide:
    1. Gerar imagem via fal.ai (reutiliza generateContentImage)
    2. renderStill({ composition, frame: 30 }) → captura frame estático
    3. Upload PNG para Cloudinary
    4. Salvar em slides_v3_json
```

### Arquivos
- Criar: `app/api/content/[id]/generate-slides-v3/route.ts`
- Reutilizar: `remotion/components/SlideFrame.tsx` (sem animações para still)
- Criar: `remotion/compositions/CarouselStill.tsx` (Still em vez de Composition)
- Deprecar gradualmente: `generate-slides/route.ts` e `generate-slides-v2/route.ts`

---

## P1 — Multi-formato: Stories + TikTok + YouTube Shorts

### Problema
Hoje cada carrossel gera conteúdo em apenas 1 formato (PNG 1080x1350 ou MP4 1080x1350). O creator precisa repostar o mesmo conteúdo em múltiplas plataformas com formatos diferentes.

### Solução
Adicionar composições Remotion com dimensões diferentes, reutilizando o mesmo `SlideFrame`:

| Formato | Dimensões | Aspect Ratio | Plataformas |
|---------|-----------|-------------|-------------|
| Feed Instagram | 1080x1350 | 4:5 | Instagram, LinkedIn |
| Story/Shorts | 1080x1920 | 9:16 | Instagram Stories, YouTube Shorts, TikTok |
| Feed Quadrado | 1080x1080 | 1:1 | Instagram, LinkedIn, Twitter |

### Impacto
- 1 carrossel → 3 formatos de vídeo → 3x mais conteúdo
- Pitch muda para: "Gere conteúdo para todas as plataformas em 3 minutos"
- Agências pagam premium por multi-formato

### Implementação
- Criar: `remotion/compositions/StoryReel.tsx` (1080x1920, layout adaptado)
- Criar: `remotion/compositions/SquareReel.tsx` (1080x1080, layout compacto)
- Registrar no `remotion/index.tsx` como composições separadas
- UI: dropdown ou botões para escolher formato antes de gerar
- API: parâmetro `format: 'reel' | 'story' | 'square'` no generate-reel

### Considerações de Layout
- **Story (9:16):** mais espaço vertical → imagem maior (956x600), corpo com mais linhas
- **Quadrado (1:1):** menos espaço → título menor (36px), sem corpo, só imagem + título
- `SlideFrame` precisa de prop `layout` para adaptar tamanhos

---

## P1 — Remotion Player no Dashboard (Preview ao Vivo)

### Problema
Hoje o fluxo é: configurar → gerar (esperar 2-3 min) → ver resultado. Se não gostar, reconfigura e gera de novo. Zero feedback visual durante a configuração.

### Solução
Embutir o `<Player>` do Remotion no dashboard para preview instantâneo antes de renderizar.

### Impacto
- Preview em tempo real enquanto edita texto/imagens
- Reduz tentativas de geração (economia de fal.ai + Cloudinary)
- UX profissional (padrão de mercado: Canva, CapCut)

### Implementação
```bash
npm install @remotion/player --legacy-peer-deps
```

```tsx
// No dashboard
import { Player } from '@remotion/player'
import { CarouselReel } from '@/remotion/compositions/CarouselReel'

<Player
  component={CarouselReel}
  inputProps={previewProps}
  durationInFrames={totalFrames}
  fps={30}
  compositionWidth={1080}
  compositionHeight={1350}
  style={{ width: 360, height: 450 }}  // scaled down
  controls
  autoPlay
  loop
/>
```

### Desafios
- Precisa que os componentes Remotion sejam importáveis no client-side
- Imagens do fal.ai só existem após geração → usar placeholders no preview
- Player renderiza no browser, não no servidor → performance depende do dispositivo

### Arquivos
- Instalar: `@remotion/player`
- Criar: `components/molecules/reel-preview-player.tsx`
- Modificar: `app/dashboard/audits/[id]/create-content/slides/page.tsx`

---

## P2 — Voiceover Automático + Legendas Animadas

### Problema
Reels com áudio performam 3x melhor que sem áudio no Instagram (dados internos de creators). Hoje os vídeos gerados são mudos.

### Solução (2 partes)

#### Parte A: Voiceover via TTS
- O texto dos slides já existe (gerado pelo Claude)
- Enviar cada slide para uma API de TTS (OpenAI TTS, ElevenLabs, Google Cloud TTS)
- Remotion sincroniza o áudio com os slides usando `<Audio>` + `getAudioDurationInSeconds()`
- Duração de cada slide se adapta ao tempo do áudio (em vez de fixo 3s)

```tsx
// Cada slide usa calculateMetadata para ajustar duração ao áudio
const audioDuration = await getAudioDurationInSeconds(audioUrl)
const durationInFrames = Math.ceil(audioDuration * fps) + PADDING_FRAMES
```

#### Parte B: Legendas Animadas (estilo CapCut/Hormozi)
- Usar `@remotion/captions` para gerar legendas word-by-word
- Estilo "highlight" viral: palavra atual em destaque (fundo amarelo/branco)
- Sincronizadas com o voiceover automaticamente

```bash
npm install @remotion/captions @remotion/install-whisper
```

### Impacto
- Reels com voz + legendas = taxa de retenção muito maior
- Diferencial competitivo brutal (ferramentas como OpusClip cobram $20/mês só por isso)
- Creators publicam direto sem edição adicional

### Implementação
- Criar: `lib/tts.ts` (wrapper para OpenAI TTS ou ElevenLabs)
- Criar: `remotion/components/AnimatedCaptions.tsx`
- Modificar: `remotion/compositions/CarouselReel.tsx` (adicionar `<Audio>` e legendas)
- Modificar: `app/api/content/[id]/generate-reel/route.ts` (gerar áudio antes de render)
- UI: toggle "Adicionar narração" no dashboard

### Custo estimado por reel
- OpenAI TTS: ~$0.015 por 1000 chars → ~$0.02 por reel de 7 slides
- ElevenLabs: ~$0.03 por reel (plano Creator)
- Total com fal.ai: ~$0.40 por reel completo com voz

---

## P3 — Biblioteca de Templates Visuais

### Problema
Hoje existe apenas 1 template visual (V2: branco, Sofia Pro, avatar + título + corpo + imagem). Todos os carrosséis ficam iguais.

### Solução
Criar uma biblioteca de templates Remotion parametrizáveis que o creator escolhe no dashboard.

### Templates propostos

#### Template "Hormozi" (Dark Bold)
- Fundo escuro (#1a1a2e)
- Título em amarelo (#ffd700) bold 48px
- Corpo em branco, contraste alto
- Sem imagem — foco 100% no texto
- Ideal para: vendas, ofertas, CTAs

#### Template "Minimalista" (Clean White)
- O template V2 atual, refinado
- Tipografia elegante, muito espaço em branco
- Imagem sutil no fundo com overlay
- Ideal para: educacional, autoridade

#### Template "Editorial Magazine"
- Já existe em HTML: `lib/slide-templates/editorial-cover.ts`
- Migrar para Remotion: foto full-bleed + gradient overlay + texto bold
- Ideal para: storytelling, cases

#### Template "Neon Social"
- Fundo gradiente vibrante (purple→pink ou blue→cyan)
- Texto branco com sombra glow
- Elementos decorativos animados (linhas, círculos)
- Ideal para: virais, trends, lifestyle

#### Template "Data Driven"
- Números grandes animados (contagem regressiva/crescente)
- Gráficos e barras animadas
- Cores corporativas
- Ideal para: resultados, métricas, comparações

### Impacto
- Diferenciação visual entre creators
- Upsell: templates premium pagos
- Retenção: creator volta para experimentar novos templates

### Implementação
- Criar: `remotion/templates/` (diretório com variantes)
- Cada template é um `SlideFrame` variant com props de estilo diferentes
- UI: galeria de templates no dashboard com preview
- Schema: adicionar `templateId` ao `CarouselReelSchema`

---

## P3 — Vídeo Animado da Auditoria (Resultado Visual)

### Problema
O resultado da auditoria é texto + números. O creator quer compartilhar o resultado mas não tem formato visual atraente para postar.

### Solução
Gerar um vídeo de 15-30s com os resultados da auditoria animados.

### Conteúdo do vídeo
1. **Intro (2s):** Logo Croko Labs + "Auditoria Express de @username"
2. **Scores (8s):** Gráfico radar animado com os 5 scores
   - Kahneman (comportamento)
   - Schwartz (copy)
   - Hormozi (ofertas)
   - Cagan (métricas)
   - Paul Graham (anomalias)
3. **Destaques (5s):** Top 3 insights em texto animado
4. **CTA (3s):** "Faça sua auditoria grátis em postexpress.com"

### Impacto
- Creator posta o resultado → marketing viral orgânico para o Croko Labs
- Cada auditoria gera conteúdo postável automaticamente
- Formato único — nenhum concorrente faz isso

### Implementação
- Criar: `remotion/compositions/AuditResult.tsx`
- Criar: `remotion/components/RadarChart.tsx` (gráfico radar animado com spring)
- Criar: `remotion/components/ScoreBar.tsx` (barra de score com animação)
- Criar: `app/api/audits/[id]/generate-audit-video/route.ts`
- UI: botão "Gerar Vídeo da Auditoria" na página de resultado

### Referências
- Skill Remotion: `rules/charts.md` (bar charts animados)
- Skill Remotion: `rules/text-animations.md` (typewriter, word highlight)

---

## Métricas de Sucesso

| Métrica | Baseline (sem Remotion) | Target (com Roadmap) |
|---------|------------------------|---------------------|
| Formatos de output por carrossel | 1 (PNG) | 4 (PNG + Reel + Story + Square) |
| Tempo de preview | 0 (sem preview) | Instantâneo (Player) |
| Linhas de template HTML | ~1400 | 0 (tudo em React) |
| Templates visuais | 1 | 5+ |
| Conteúdo com áudio | 0% | 100% (opcional) |
| Conteúdo da auditoria postável | 0 | 1 vídeo animado |

---

## Dependências e Custos

### Pacotes adicionais necessários
```bash
# P0 — já instalados: remotion, @remotion/renderer, @remotion/bundler
# P1 — Player
npm install @remotion/player --legacy-peer-deps
# P2 — Voiceover + Legendas
npm install @remotion/captions --legacy-peer-deps
```

### APIs externas (P2)
| API | Uso | Custo estimado/mês (100 reels) |
|-----|-----|-------------------------------|
| OpenAI TTS | Voiceover | ~$2 |
| ElevenLabs | Voiceover premium | ~$5 |
| fal.ai (Flux) | Imagens (já usado) | ~$10 |

### Licença Remotion
- **Uso pessoal/educacional:** gratuito
- **Uso comercial:** a partir de ~$450/ano (Company License)
- Necessário quando Croko Labs cobrar pelo serviço

---

## Ordem de Execução Recomendada

```
Sprint 1 (1 semana)
├── P0: renderStill() substitui Puppeteer
└── P1: Multi-formato (Story + Square)

Sprint 2 (1 semana)
├── P1: Remotion Player no dashboard
└── P3: Template "Hormozi" + "Editorial"

Sprint 3 (2 semanas)
├── P2: Voiceover (OpenAI TTS)
├── P2: Legendas animadas
└── P3: Vídeo da Auditoria

Sprint 4 (1 semana)
├── P3: Templates "Neon Social" + "Data Driven"
└── Polimento e testes
```

---

*Última atualização: 2026-02-20*
*Versão: 1.0*
