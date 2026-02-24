# Catálogo de Componentes Remotion

> Referência técnica para o Creative Director.
> Gerado a partir de scan do diretório `/remotion/`.
> **49 componentes** | 5 templates | 7 transições | 7 text effects | 5 caption styles | 4 backgrounds | 4 visual effects

---

## Composições Disponíveis

| Composição | Formato | Dimensões | Uso |
|-----------|---------|-----------|-----|
| CarouselReel | Feed (4:5) | 1080×1350 | Vídeo animado principal |
| StoryReel | Story (9:16) | 1080×1920 | Stories/Reels verticais |
| SquareReel | Square (1:1) | 1080×1080 | TikTok/YouTube Shorts |
| CarouselStill | Feed | 1080×1350 | Export PNG estático |
| AuditResult | Square | 1080×1080 | Vídeo de resultado de auditoria (18s) |

---

## Text Effects

| ID | Componente | Descrição | Quando Usar |
|----|-----------|-----------|-------------|
| `typewriter` | TypewriterText | Caracteres aparecem um-a-um com cursor piscante | Revelação de informação, educacional |
| `bounce` | ScaleBounceText | Cada palavra escala com spring, cores alternadas | Energético, playful, listas |
| `gradient` | GradientText | Texto com gradiente animado | Premium, elegante |
| `marker` | HighlightMarker | Marca-texto amarelo em palavras selecionadas | Destaque de keywords |
| `split-reveal` | SplitRevealText | Texto divide e revela do centro | Impacto, modernidade |
| `wave` | WaveText | Letras em padrão de onda (sobe/desce) | Divertido, motion-heavy |
| `cinematic` | CinematicFadeText | Fade gradual com timing cinematográfico | Profissional, storytelling |

---

## Hook Intros (2 segundos)

| ID | Componente | Descrição |
|----|-----------|-----------|
| `spring` | HookIntro | Background blur + texto com spring animation + fade out |
| `glitch` | GlitchHookIntro | Separação RGB, scan lines, block displacement, noise overlay |

**Hook Styles (animação do texto):**
- `word-by-word` — Palavras aparecem uma a uma
- `zoom-punch` — Zoom + punch de impacto

---

## Transições

| ID | Componente | Descrição | Quando Usar |
|----|-----------|-----------|-------------|
| `fade` | Built-in | Fade de opacidade | Universal, profissional (padrão) |
| `slide` | Built-in | Slide da direita | Movimento direcional |
| `pixel` | PixelTransition | Dissolve pixelado | Tech, digital |
| `liquid` | LiquidWaveTransition | Onda líquida | Suave, orgânico |
| `glitch` | GlitchTransition | Glitch RGB | Trendy, jovem |
| `zoom-blur` | ZoomBlurTransition | Zoom + motion blur | Dinâmico, impacto |
| `random` | index.ts | Cicla por todas por índice | Variedade |

---

## Animated Backgrounds

| ID | Componente | Props | Quando Usar |
|----|-----------|-------|-------------|
| `gradient-flow` | GradientFlow | `colors: [3 cores]` | Editorial, suave |
| `geometric` | GeometricGrid | `accentColor, backgroundColor` | Data-driven, profissional |
| `particles` | ParticlesFloat | `colors: [2 cores], backgroundColor` | Energético, moderno |
| `wave-mesh` | WaveMesh | `colors: [3 cores], backgroundColor` | Minimalista, orgânico |

**Auto-mapping (template → background):**
- minimalist → wave-mesh
- hormozi-dark → particles
- editorial-magazine → gradient-flow
- neon-social → gradient-flow
- data-driven → geometric

---

## Caption Styles

| ID | Descrição | Público |
|----|-----------|---------|
| `highlight` | Palavra ativa: fundo amarelo, texto preto. Janela: 5 palavras | Profissional, podcast |
| `karaoke` | Revelação progressiva esq→dir. Passadas: highlight color | Engajante, educacional |
| `bounce` | Palavra ativa escala 1.25× com spring pop | Energético, curto |
| `tiktok-viral` | Cada palavra em pill/badge com pop. Keywords sempre highlight | Jovem, trending |
| `floating-chips` | Pills flutuantes premium. Entrada: spring de baixo | Premium, influencer |

---

## Visual Effects

| Componente | Descrição | Props Chave |
|-----------|-----------|-------------|
| ParticleBurst | Explosão radial de partículas | `startFrame, particleCount, color, spreadRadius` |
| ZoomPulse | Zoom + glow em elementos | `maxScale (1.15), glowColor, showGlow` |
| GlowHighlight | Halo pulsante | `color, maxSpread (14px), pulseCount` |
| ParallaxContainer | Profundidade 3D | `amplitude (30px), layerSpeed (0-1)` |

---

## Templates

| ID | Nome | Background | Texto | Accent | Imagem | Estilo |
|----|------|-----------|-------|--------|--------|--------|
| `minimalist` | Minimalista | #FFFFFF | #1A1A2E | #7C3AED | Bottom | Clean, moderno |
| `hormozi-dark` | Hormozi Dark | #0A0A0A | #FFFFFF | #FF6B35 | Bottom | Dark, alto contraste |
| `editorial-magazine` | Editorial Magazine | #1A1A2E | #FFFFFF | #E8D5B7 | Background | Cinematic, overlay |
| `neon-social` | Neon Social | #1A0533 | #FFFFFF | #FF00FF | Bottom | Vibrante, neon |
| `data-driven` | Data-Driven | #F8FAFC | #0F172A | #3B82F6 | Bottom | Professional, minimal |

### TemplateConfig Interface
```typescript
{
  colors: { background, title, body, accent, headerName, headerUsername, headerBorder, footerText, footerBorder, imagePlaceholderGradient }
  typography: { titleSize, titleWeight, bodySize, bodyWeight, nameSize, usernameSize }
  layout: { showImage, showBody, showHeader, imagePosition: 'bottom' | 'background' | 'none', padding }
  badge: { fill, checkColor }
}
```

---

## Visualizações (para dados/métricas)

| Componente | Uso | Props |
|-----------|-----|-------|
| CircularProgress | Score circular (85/100) | `value, max, accentColor, size` |
| ScoreBar | Barra horizontal | `label, score, maxScore, color, delay` |
| RadarChart | Pentágono animado | `scores: [{label, value, color}], size` |
| AnimatedCounter | Número contando (0→85) | `targetValue, suffix, durationFrames` |
| AnimatedBar | Progress bar com label | `value, max, label, accentColor, height` |

**Auto-detecção de métricas** (`metric-detector.ts`):
- `85/100` → CircularProgress
- `85%` → AnimatedBar
- `10k` → AnimatedCounter

---

## SlideFrame (Componente Master)

O componente central que renderiza cada slide. Props importantes:

```
titulo, corpo, contentImageUrl, profilePicUrl, username, fullName,
slideNumber, totalSlides, animated, templateId, layout,
textEffect, isFirstSlide, hookStyle, motionEffects,
backgroundVideoUrl, animatedBackground, particleEffects,
parallax, animatedMetrics
```

**Layout por formato:**
| Formato | Título | Corpo | Imagem | Show Body |
|---------|--------|-------|--------|-----------|
| feed | 42px | 28px | 448px | Sim |
| story | 44px | 30px | 700px | Sim |
| square | 36px | 24px | 400px | Não |

---

## Áudio

### BackgroundMusic
- Fade-in: 15 frames | Fade-out: 30 frames
- Volume com voiceover: 0.10-0.20
- Volume sem voiceover: 0.25-0.35
- Auto-loop se vídeo > áudio

### SFX Disponíveis
- `whoosh` — Transição entre cenas (~1s)
- `pop` — Destaque/notificação (~0.5s)
- `swoosh` — Entrada de texto (~0.8s)

### Moods de Música
- `energetic` | `calm` | `corporate` | `inspiring`

---

## CTA Effect Detection

Palavras que ativam efeitos especiais automaticamente:
- **PT**: gratis, gratuito, agora, hoje, descubra, aprenda, comece, garanta, acesse, link, bio, comentarios, salve, compartilhe, clique, arraste, confira, baixe, inscreva
- **EN**: free, now, today, discover, learn, start, click, save, share, link, comment, subscribe, download, swipe, tap

---

## Font: Sofia Pro

Pesos disponíveis: 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)

---

*Catálogo gerado em 2026-02-20 | 49 componentes | Remotion v4*
