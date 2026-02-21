import { z } from 'zod'

// Formatos de layout suportados: feed (4:5), story (9:16), square (1:1)
export const LayoutFormatSchema = z.enum(['feed', 'story', 'square']).default('feed')
export type LayoutFormat = z.infer<typeof LayoutFormatSchema>

// Schema para word-level captions (legendas animadas)
export const CaptionWordSchema = z.object({
  word: z.string(),
  startMs: z.number(),
  endMs: z.number(),
  isKeyword: z.boolean().optional(),
})

export const CaptionStyleSchema = z.enum(['highlight', 'karaoke', 'bounce', 'tiktok-viral', 'floating-chips']).default('highlight')

export type CaptionWord = z.infer<typeof CaptionWordSchema>
export type CaptionStyle = z.infer<typeof CaptionStyleSchema>

export const SlideSchema = z.object({
  titulo: z.string(),
  corpo: z.string(),
  contentImageUrl: z.string(),
  slideNumber: z.number(),
  totalSlides: z.number(),
  backgroundVideoUrl: z.string().optional(),
})

export const SoundEffectUrlsSchema = z.object({
  whoosh: z.string().optional(),
  pop: z.string().optional(),
  swoosh: z.string().optional(),
}).optional()

export const TTSProviderSchema = z.enum(['openai', 'elevenlabs']).optional()

// Efeitos de texto dinamicos para o titulo dos slides
export const TextEffectSchema = z.enum(['none', 'typewriter', 'bounce', 'gradient', 'marker', 'split-reveal', 'wave', 'cinematic']).optional()

// Hook visual config — estilo de animacao do primeiro slide
export const HookStyleSchema = z.enum(['word-by-word', 'zoom-punch']).default('word-by-word')

// Hook intro style — estilo da animacao de intro (2s antes do primeiro slide)
export const HookIntroStyleSchema = z.enum(['spring', 'glitch']).default('spring')

// Motion effects config — efeitos visuais continuos
export const MotionEffectsSchema = z.object({
  kenBurns: z.boolean().default(true),
  progressBar: z.boolean().default(true),
}).optional()

// Background animado — estilo de animacao de fundo para slides sem imagem/video
export const AnimatedBackgroundStyleSchema = z.enum([
  'none',
  'gradient-flow',
  'geometric',
  'particles',
  'wave-mesh',
  'auto',
]).default('auto')

// Estilo de transicao entre slides
export const TransitionStyleSchema = z.enum([
  'fade', 'slide', 'pixel', 'liquid', 'glitch', 'zoom-blur', 'random'
]).default('random')

// Background music config completo
export const BackgroundMusicSchema = z.object({
  url: z.string(),
  volume: z.number().default(0.2),
  fadeInFrames: z.number().default(15),
  fadeOutFrames: z.number().default(30),
}).optional()

export type SoundEffectUrlsProps = z.infer<typeof SoundEffectUrlsSchema>
export type TTSProviderOption = z.infer<typeof TTSProviderSchema>
export type TextEffect = z.infer<typeof TextEffectSchema>
export type HookStyle = z.infer<typeof HookStyleSchema>
export type HookIntroStyle = z.infer<typeof HookIntroStyleSchema>
export type MotionEffects = z.infer<typeof MotionEffectsSchema>
export type TransitionStyleOption = z.infer<typeof TransitionStyleSchema>
export type AnimatedBackgroundStyle = z.infer<typeof AnimatedBackgroundStyleSchema>
export type BackgroundMusicConfig = z.infer<typeof BackgroundMusicSchema>

export const CarouselReelSchema = z.object({
  slides: z.array(SlideSchema),
  profilePicUrl: z.string(),
  username: z.string(),
  fullName: z.string(),
  templateId: z.string().default('minimalist'),
  format: LayoutFormatSchema,
  fps: z.number().default(30),
  durationPerSlideFrames: z.number().default(90), // 3 seconds at 30fps
  transitionFrames: z.number().default(20), // ~0.67s
  // Hook visual (opcional — animacao explosiva no primeiro slide)
  hookEnabled: z.boolean().optional(),
  hookText: z.string().optional(),
  hookStyle: HookStyleSchema.optional(),
  hookIntroStyle: HookIntroStyleSchema.optional(),
  // Voiceover (opcional — quando presente, usa áudio e durações dinâmicas)
  voiceover: z.boolean().optional(),
  audioUrls: z.array(z.string()).optional(),
  slideDurations: z.array(z.number()).optional(), // durações em frames por slide
  // Legendas animadas (opcional — requer voiceover com timestamps)
  captionData: z.array(z.array(CaptionWordSchema)).optional(),
  captionStyle: CaptionStyleSchema.optional(),
  // Sound effects nas transições (opcional — gerados via ElevenLabs)
  soundEffectUrls: SoundEffectUrlsSchema,
  // Provider de TTS utilizado (para referência/logging)
  ttsProvider: TTSProviderSchema,
  // Background music (opcional — URL publica do arquivo de audio)
  backgroundMusicUrl: z.string().optional(),
  // Volume da musica de fundo (0-1). Default: 0.15 com voiceover, 0.30 sem
  musicVolume: z.number().optional(),
  // Efeito de texto dinamico aplicado ao titulo dos slides
  textEffect: TextEffectSchema,
  // Motion effects (Ken Burns, progress bar)
  motionEffects: MotionEffectsSchema,
  // Background animado (gradient, geometric, particles, wave-mesh, auto)
  animatedBackground: AnimatedBackgroundStyleSchema.optional(),
  // Background music config completo (alternativa a backgroundMusicUrl simples)
  backgroundMusic: BackgroundMusicSchema,
  // Estilo de transicao entre slides (fade, slide, pixel, liquid, glitch, zoom-blur, random)
  transitionStyle: TransitionStyleSchema.optional(),
  // Efeitos de destaque (particle burst, zoom pulse, glow) em momentos-chave
  particleEffects: z.boolean().optional(),
  // Parallax 3D — camadas em velocidades diferentes para sensacao de profundidade
  parallax: z.boolean().optional(),
  // Metricas animadas (AnimatedCounter, CircularProgress, AnimatedBar) quando detectadas no texto
  animatedMetrics: z.boolean().optional(),
})

export const CarouselStillSchema = z.object({
  titulo: z.string(),
  corpo: z.string(),
  contentImageUrl: z.string(),
  profilePicUrl: z.string(),
  username: z.string(),
  fullName: z.string(),
  templateId: z.string().default('minimalist'),
  format: LayoutFormatSchema,
  slideNumber: z.number(),
  totalSlides: z.number(),
})

// Schema para video de resultado de auditoria
export const AuditVideoSchema = z.object({
  username: z.string(),
  profileImageUrl: z.string().optional(),
  scores: z.object({
    behavior: z.number(),
    copy: z.number(),
    offers: z.number(),
    metrics: z.number(),
    anomalies: z.number(),
    overall: z.number(),
  }),
  insights: z.array(z.string()).max(3),
})

export type SlideProps = z.infer<typeof SlideSchema>
export type CarouselReelProps = z.infer<typeof CarouselReelSchema>
export type CarouselStillProps = z.infer<typeof CarouselStillSchema>
export type AuditVideoProps = z.infer<typeof AuditVideoSchema>
