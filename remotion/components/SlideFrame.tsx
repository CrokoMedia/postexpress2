import React, { useState, useCallback } from 'react'
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Img,
  AbsoluteFill,
  OffthreadVideo,
} from 'remotion'

/**
 * Wrapper seguro para <Img> do Remotion.
 * URLs externas (ex: Instagram CDN) podem expirar/CORS — em vez de cancelar
 * todo o render, exibe um placeholder colorido.
 */
const SafeImg: React.FC<{
  src: string
  style: React.CSSProperties
  placeholderColor?: string
}> = ({ src, style, placeholderColor = '#333' }) => {
  const [failed, setFailed] = useState(false)
  const onError = useCallback(() => setFailed(true), [])

  if (failed) {
    return (
      <div
        style={{
          ...style,
          background: placeholderColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />
    )
  }

  return <Img src={src} style={style} onError={onError} />
}
import { loadSofiaProFonts, FONT_FAMILY } from '../fonts'
import type { SlideProps, LayoutFormat, TextEffect, HookStyle, MotionEffects, AnimatedBackgroundStyle } from '../types'
import { getTemplate } from '../templates'
import type { TemplateConfig } from '../templates'
import { getAnimatedBackground } from '../backgrounds'
import { TypewriterText } from './TypewriterText'
import { ScaleBounceText } from './ScaleBounceText'
import { GradientText } from './GradientText'
import { HighlightMarker } from './HighlightMarker'
import { SplitRevealText } from './SplitRevealText'
import { WaveText } from './WaveText'
import { CinematicFadeText } from './CinematicFadeText'
import { ParticleBurst, ZoomPulse, GlowHighlight, detectSlideEffects } from '../effects'
import { detectMetrics } from '../utils/metric-detector'
import type { MetricDetection } from '../utils/metric-detector'
import { AnimatedCounter } from './AnimatedCounter'
import { CircularProgress } from './CircularProgress'
import { AnimatedBar } from './AnimatedBar'

loadSofiaProFonts()

// Configuração de layout por formato — dimensões e tipografia adaptada
interface LayoutConfig {
  width: number
  height: number
  titleSize: number
  bodySize: number
  imageHeight: number
  showBody: boolean
  imageWidth: number
}

export const LAYOUT_CONFIG: Record<LayoutFormat, LayoutConfig> = {
  feed: {
    width: 1080,
    height: 1350,
    titleSize: 42,
    bodySize: 28,
    imageHeight: 448,
    showBody: true,
    imageWidth: 956,
  },
  story: {
    width: 1080,
    height: 1920,
    titleSize: 44,
    bodySize: 30,
    imageHeight: 700,
    showBody: true,
    imageWidth: 956,
  },
  square: {
    width: 1080,
    height: 1080,
    titleSize: 36,
    bodySize: 24,
    imageHeight: 400,
    showBody: false,
    imageWidth: 956,
  },
}

// Verified badge SVG — color driven by template config
const VerifiedBadge: React.FC<{ fill: string; checkColor: string }> = ({
  fill,
  checkColor,
}) => (
  <svg
    width={32}
    height={32}
    viewBox="0 0 52 52"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx={26} cy={26} r={26} fill={fill} />
    <path
      d="M22.25 34.25L13.75 25.75L15.85 23.65L22.25 30.05L36.15 16.15L38.25 18.25L22.25 34.25Z"
      fill={checkColor}
    />
  </svg>
)

interface SlideFrameProps extends SlideProps {
  profilePicUrl: string
  username: string
  fullName: string
  animated?: boolean
  templateId?: string
  layout?: LayoutFormat
  textEffect?: TextEffect
  isFirstSlide?: boolean
  hookStyle?: HookStyle
  motionEffects?: MotionEffects
  totalDurationFrames?: number
  backgroundVideoUrl?: string
  animatedBackground?: AnimatedBackgroundStyle
  particleEffects?: boolean
  parallax?: boolean
  animatedMetrics?: boolean
}

// Renderiza o titulo com efeito dinamico (apenas no modo animado)
function renderTitleContent(
  titulo: string,
  effectiveTitleSize: number,
  template: TemplateConfig,
  textEffect: TextEffect | undefined,
  animated: boolean,
) {
  // Em modo estatico ou sem efeito, renderizar texto simples
  if (!animated || !textEffect || textEffect === 'none') {
    return titulo
  }

  switch (textEffect) {
    case 'typewriter':
      return (
        <TypewriterText
          text={titulo}
          fontSize={effectiveTitleSize}
          color={template.colors.title}
          fontWeight={template.typography.titleWeight}
        />
      )
    case 'bounce':
      return (
        <ScaleBounceText
          text={titulo}
          fontSize={effectiveTitleSize}
          color={template.colors.title}
          accentColor={template.colors.accent}
          fontWeight={template.typography.titleWeight}
        />
      )
    case 'gradient':
      return (
        <GradientText
          text={titulo}
          fontSize={effectiveTitleSize}
          fontWeight={template.typography.titleWeight}
          gradientColors={[template.colors.accent, template.colors.title]}
        />
      )
    case 'marker':
      return (
        <HighlightMarker
          text={titulo}
          fontSize={effectiveTitleSize}
          color={template.colors.title}
          fontWeight={template.typography.titleWeight}
        />
      )
    case 'split-reveal':
      return (
        <SplitRevealText
          text={titulo}
          fontSize={effectiveTitleSize}
          color={template.colors.title}
          fontWeight={template.typography.titleWeight}
        />
      )
    case 'wave':
      return (
        <WaveText
          text={titulo}
          fontSize={effectiveTitleSize}
          color={template.colors.title}
          fontWeight={template.typography.titleWeight}
        />
      )
    case 'cinematic':
      return (
        <CinematicFadeText
          text={titulo}
          fontSize={effectiveTitleSize}
          color={template.colors.title}
          fontWeight={template.typography.titleWeight}
        />
      )
    default:
      return titulo
  }
}

// Hook Word-by-Word: cada palavra aparece com spring agressivo e stagger
function renderHookTitle(
  titulo: string,
  effectiveTitleSize: number,
  template: TemplateConfig,
  frame: number,
  fps: number,
  hookStyle: HookStyle | undefined,
  isNeonSocial: boolean,
) {
  const words = titulo.split(' ')

  if (hookStyle === 'zoom-punch') {
    // Zoom punch: titulo inteiro escala de 1.2 para 1.0 com spring agressivo
    const punchProgress = spring({
      frame,
      fps,
      config: { damping: 12, stiffness: 400, mass: 0.5 },
    })
    const punchScale = interpolate(punchProgress, [0, 1], [1.3, 1.0])
    const punchOpacity = interpolate(punchProgress, [0, 0.3], [0, 1], {
      extrapolateRight: 'clamp',
    })
    return (
      <div
        style={{
          transform: `scale(${punchScale})`,
          opacity: punchOpacity,
          transformOrigin: 'center left',
        }}
      >
        {titulo}
      </div>
    )
  }

  // Word-by-word (default): cada palavra aparece com stagger de 3 frames
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
      {words.map((word, i) => {
        const wordProgress = spring({
          frame,
          fps,
          config: { damping: 8, stiffness: 300, mass: 0.4 },
          delay: i * 3,
        })
        const wordScale = interpolate(wordProgress, [0, 1], [0.3, 1.0])
        const wordOpacity = interpolate(wordProgress, [0, 0.4], [0, 1], {
          extrapolateRight: 'clamp',
        })
        const wordY = interpolate(wordProgress, [0, 1], [20, 0])

        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              transform: `scale(${wordScale}) translateY(${wordY}px)`,
              opacity: wordOpacity,
              fontSize: effectiveTitleSize,
              fontWeight: template.typography.titleWeight,
              color: template.colors.title,
              lineHeight: 1.3,
              ...(isNeonSocial
                ? { textShadow: '0 0 20px rgba(236, 72, 153, 0.6), 0 0 40px rgba(124, 58, 237, 0.3)' }
                : {}),
            }}
          >
            {word}
          </span>
        )
      })}
    </div>
  )
}

// Shared render logic — avoids duplicating the entire JSX tree
function renderSlide(
  props: SlideFrameProps,
  template: TemplateConfig,
  anim: {
    headerY: number
    headerOpacity: number
    titleY: number
    titleOpacity: number
    bodyOpacity: number
    imageScale: number
    imageOpacity: number
    footerOpacity: number
    overlayOpacity?: number
    kenBurnsScale?: number
    kenBurnsPan?: number
    progressPercent?: number
    // Parallax offsets (computed in SlideFrame component, applied here)
    parallaxBgOffsetX?: number
    parallaxContentOffsetX?: number
  },
  frameInfo?: { frame: number; fps: number }
) {
  const {
    titulo,
    corpo,
    contentImageUrl,
    profilePicUrl,
    username,
    fullName,
    slideNumber,
    totalSlides,
    layout = 'feed',
    textEffect,
    animated = true,
    isFirstSlide,
    hookStyle,
    motionEffects,
    backgroundVideoUrl,
    animatedBackground,
    particleEffects = true,
    parallax = false,
    animatedMetrics = false,
  } = props

  // Verificar se hook visual esta ativo neste slide
  const useHookAnimation = animated && isFirstSlide && hookStyle

  // Detectar metricas no texto do corpo (quando animatedMetrics esta ativo)
  const detectedMetrics: MetricDetection[] = animated && animatedMetrics && corpo
    ? detectMetrics(corpo)
    : []

  // Detect which highlight effects should be applied to this slide
  const slideEffects = animated && particleEffects
    ? detectSlideEffects(titulo, corpo, slideNumber, totalSlides)
    : { shouldParticleBurst: false, shouldZoomPulse: false, shouldGlowHighlight: false }

  const layoutConfig = LAYOUT_CONFIG[layout]

  const t = template
  const paragraphs = corpo
    ? corpo
        .split('\n')
        .map((p) => p.trim())
        .filter((p) => p.length > 0)
    : []

  const isEditorial = t.layout.imagePosition === 'background'
  const isNeonSocial = t.id === 'neon-social'
  const isDataDriven = t.id === 'data-driven'

  // Tipografia e layout adaptados ao formato selecionado
  // Se não for feed, sobrescreve os valores do template
  const effectiveTitleSize = layout !== 'feed' ? layoutConfig.titleSize : t.typography.titleSize
  const effectiveBodySize = layout !== 'feed' ? layoutConfig.bodySize : t.typography.bodySize
  const effectiveShowBody = layout === 'square' ? false : t.layout.showBody
  const effectiveImageHeight = layoutConfig.imageHeight
  const effectiveImageWidth = layoutConfig.imageWidth

  return (
    <AbsoluteFill
      style={{
        backgroundColor: t.colors.background,
        // Neon Social: gradiente vibrante purple→pink como fundo
        ...(isNeonSocial
          ? { background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }
          : {}),
        fontFamily: `'${FONT_FAMILY}', system-ui, -apple-system, sans-serif`,
        color: t.colors.body,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: t.layout.padding,
        position: 'relative',
      }}
    >
      {/* Parallax Layer 0 (Background) — all background elements wrapped in parallax container when active */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          // Parallax: background layer moves at 0.3x speed with subtle depth blur
          ...(anim.parallaxBgOffsetX !== undefined ? {
            transform: `translateX(${anim.parallaxBgOffsetX}px)`,
            filter: 'blur(2px)',
            // Scale up slightly to prevent edges showing during parallax movement
            inset: '-4px',
          } : {}),
        }}
      >
        {/* Animated Background — layer z-index 0 (atras de tudo) */}
        {/* Renderiza quando: nao tem B-Roll video E (nao tem imagem editorial OU animatedBackground explicitamente definido) */}
        {(() => {
          const bgStyle = animatedBackground || 'none'
          const hasVideo = !!backgroundVideoUrl
          const hasEditorialImage = isEditorial && !!contentImageUrl
          // Mostrar background animado quando nao tem video e (nao tem imagem editorial ou foi explicitamente habilitado)
          const shouldShow = bgStyle !== 'none' && !hasVideo && (!hasEditorialImage || bgStyle !== 'auto')
          if (!shouldShow) return null
          const bgElement = getAnimatedBackground(bgStyle, t)
          if (!bgElement) return null
          return (
            <>
              <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
                {bgElement}
              </div>
              {/* Overlay gradient para legibilidade do texto sobre o background animado */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 0,
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.10) 70%, rgba(0,0,0,0.25) 100%)',
                  pointerEvents: 'none',
                }}
              />
            </>
          )
        })()}

        {/* B-Roll Video Background — substitui imagem estatica quando fornecido */}
        {backgroundVideoUrl && (
          <>
            <OffthreadVideo
              src={backgroundVideoUrl}
              muted
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                zIndex: 1,
                opacity: anim.imageOpacity,
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 2,
                background: `linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.50) 55%, rgba(0,0,0,0.85) 100%)`,
                opacity: anim.overlayOpacity ?? 1,
              }}
            />
          </>
        )}

        {/* Editorial: background image + gradient overlay */}
        {isEditorial && contentImageUrl && !backgroundVideoUrl && (
          <>
            <SafeImg
              src={contentImageUrl}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                zIndex: 1,
                opacity: anim.imageOpacity,
                transform: anim.kenBurnsScale
                  ? `scale(${anim.kenBurnsScale}) translateX(${anim.kenBurnsPan || 0}px)`
                  : `scale(${anim.imageScale})`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 2,
                background: `linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.12) 30%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.82) 100%)`,
                opacity: anim.overlayOpacity ?? 1,
              }}
            />
          </>
        )}

        {/* Editorial: placeholder when no image and no video */}
        {isEditorial && !contentImageUrl && !backgroundVideoUrl && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              background: t.colors.imagePlaceholderGradient,
            }}
          />
        )}
      </div>

      {/* Progress Bar — barra fina animada no topo */}
      {animated && motionEffects?.progressBar && anim.progressPercent !== undefined && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            zIndex: 20,
            backgroundColor: 'rgba(255,255,255,0.15)',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${anim.progressPercent}%`,
              backgroundColor: t.colors.accent,
              borderRadius: 2,
            }}
          />
        </div>
      )}

      {/* Content wrapper (above background for editorial) */}
      {/* Parallax Layer 1: content moves at 0.6x speed, text stays static (layer 2) for readability */}
      <div
        style={{
          position: 'relative',
          zIndex: 3,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: anim.parallaxContentOffsetX !== undefined ? 'hidden' as const : undefined,
          ...(isEditorial ? { justifyContent: 'space-between' } : {}),
          ...(anim.parallaxContentOffsetX !== undefined ? {
            transform: `translateX(${anim.parallaxContentOffsetX}px)`,
          } : {}),
        }}
      >
        {/* Header: avatar + name + verified badge */}
        {t.layout.showHeader && (
          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              marginBottom: isEditorial ? 0 : 40,
              transform: `translateY(${anim.headerY}px)`,
              opacity: anim.headerOpacity,
            }}
          >
            {profilePicUrl ? (
              <SafeImg
                src={profilePicUrl}
                placeholderColor={t.colors.headerBorder}
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: `2.5px solid ${t.colors.headerBorder}`,
                  flexShrink: 0,
                }}
              />
            ) : (
              <div
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: '50%',
                  background: t.colors.headerBorder,
                  flexShrink: 0,
                }}
              />
            )}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    fontSize: t.typography.nameSize,
                    fontWeight: 700,
                    color: t.colors.headerName,
                    lineHeight: 1.2,
                  }}
                >
                  {fullName || username}
                </span>
                <VerifiedBadge
                  fill={t.badge.fill}
                  checkColor={t.badge.checkColor}
                />
              </div>
              <span
                style={{
                  fontSize: t.typography.usernameSize,
                  fontWeight: 400,
                  color: t.colors.headerUsername,
                  lineHeight: 1.2,
                }}
              >
                @{username}
              </span>
            </div>
          </div>
        )}

        {/* Title + Body area */}
        <div style={{ ...(isEditorial ? { marginTop: 'auto' } : {}), position: 'relative' }}>
          {/* ParticleBurst — explosion around title on first/CTA slides */}
          {slideEffects.shouldParticleBurst && (
            <ParticleBurst
              startFrame={5}
              particleCount={16}
              color={t.colors.accent}
              spreadRadius={140}
              durationFrames={18}
              seed={slideNumber}
            />
          )}

          {/* Titulo — hook visual explosivo OU efeito de texto padrao */}
          {useHookAnimation && frameInfo ? (
            <div
              style={{
                width: '100%',
                marginBottom: effectiveShowBody && paragraphs.length > 0 ? 32 : 0,
              }}
            >
              {slideEffects.shouldGlowHighlight ? (
                <GlowHighlight
                  startFrame={10}
                  color={t.colors.accent}
                  maxSpread={14}
                  pulseCount={2}
                  durationFrames={40}
                >
                  {renderHookTitle(
                    titulo,
                    effectiveTitleSize,
                    t,
                    frameInfo.frame,
                    frameInfo.fps,
                    hookStyle,
                    isNeonSocial,
                  )}
                </GlowHighlight>
              ) : (
                renderHookTitle(
                  titulo,
                  effectiveTitleSize,
                  t,
                  frameInfo.frame,
                  frameInfo.fps,
                  hookStyle,
                  isNeonSocial,
                )
              )}
            </div>
          ) : (
            <div
              style={{
                width: '100%',
                fontSize: effectiveTitleSize,
                fontWeight: t.typography.titleWeight,
                color: t.colors.title,
                lineHeight: 1.3,
                marginBottom: effectiveShowBody && paragraphs.length > 0 ? 32 : 0,
                transform: `translateY(${anim.titleY}px)`,
                opacity: anim.titleOpacity,
                // Neon Social: glow neon no titulo
                ...(isNeonSocial
                  ? { textShadow: '0 0 20px rgba(236, 72, 153, 0.6), 0 0 40px rgba(124, 58, 237, 0.3)' }
                  : {}),
              }}
            >
              {slideEffects.shouldZoomPulse ? (
                <ZoomPulse
                  startFrame={8}
                  maxScale={1.15}
                  durationFrames={20}
                  glowColor={t.colors.accent}
                  showGlow={true}
                >
                  {renderTitleContent(titulo, effectiveTitleSize, t, textEffect, animated)}
                </ZoomPulse>
              ) : slideEffects.shouldGlowHighlight ? (
                <GlowHighlight
                  startFrame={10}
                  color={t.colors.accent}
                  maxSpread={14}
                  pulseCount={2}
                  durationFrames={40}
                >
                  {renderTitleContent(titulo, effectiveTitleSize, t, textEffect, animated)}
                </GlowHighlight>
              ) : (
                renderTitleContent(titulo, effectiveTitleSize, t, textEffect, animated)
              )}
            </div>
          )}

          {/* Corpo */}
          {effectiveShowBody && paragraphs.length > 0 && (
            <div
              style={{
                width: '100%',
                fontSize: effectiveBodySize,
                fontWeight: t.typography.bodyWeight,
                color: t.colors.body,
                lineHeight: 1.5,
                opacity: anim.bodyOpacity,
              }}
            >
              {paragraphs.map((p, i) => (
                <div
                  key={i}
                  style={{ marginBottom: i < paragraphs.length - 1 ? 32 : 0 }}
                >
                  {p}
                </div>
              ))}
            </div>
          )}

          {/* Animated Metrics — visualizacoes automaticas de numeros/scores/% detectados */}
          {detectedMetrics.length > 0 && (
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 20,
                marginTop: 24,
                alignItems: 'center',
                justifyContent: detectedMetrics.length === 1 ? 'center' : 'flex-start',
                opacity: anim.bodyOpacity,
              }}
            >
              {detectedMetrics.slice(0, 3).map((metric, idx) => {
                const staggerDelay = 8 + idx * 6

                if (metric.type === 'score' && metric.max) {
                  return (
                    <CircularProgress
                      key={`metric-${idx}`}
                      value={metric.value}
                      max={metric.max}
                      startFrame={staggerDelay}
                      accentColor={t.colors.accent}
                      size={detectedMetrics.length === 1 ? 140 : 110}
                      textColor={t.colors.title}
                    />
                  )
                }

                if (metric.type === 'percentage') {
                  return (
                    <div key={`metric-${idx}`} style={{ flex: 1, minWidth: 200, maxWidth: 500 }}>
                      <AnimatedBar
                        value={metric.value}
                        max={100}
                        label={metric.original}
                        startFrame={staggerDelay}
                        accentColor={t.colors.accent}
                        backgroundColor="rgba(255,255,255,0.1)"
                        labelColor={t.colors.body}
                        height={20}
                      />
                    </div>
                  )
                }

                // type === 'number'
                return (
                  <AnimatedCounter
                    key={`metric-${idx}`}
                    targetValue={metric.value}
                    suffix={metric.suffix || ''}
                    startFrame={staggerDelay}
                    durationFrames={35}
                    fontSize={effectiveBodySize * 1.4}
                    color={t.colors.accent}
                  />
                )
              })}
            </div>
          )}
        </div>

        {/* Content Image — only for 'bottom' position (minimalist) */}
        {t.layout.showImage && t.layout.imagePosition === 'bottom' && (
          <div
            style={{
              width: effectiveImageWidth,
              marginTop: 'auto',
              paddingTop: 40,
              opacity: anim.imageOpacity,
              overflow: 'hidden',
              borderRadius: 20,
            }}
          >
            {contentImageUrl ? (
              <SafeImg
                src={contentImageUrl}
                style={{
                  width: effectiveImageWidth,
                  height: effectiveImageHeight,
                  objectFit: 'cover',
                  display: 'block',
                  // Ken Burns: zoom lento + pan sutil
                  transform: anim.kenBurnsScale
                    ? `scale(${anim.kenBurnsScale}) translateX(${anim.kenBurnsPan || 0}px)`
                    : `scale(${anim.imageScale})`,
                  // Neon Social: sombra colorida na imagem
                  ...(isNeonSocial
                    ? { boxShadow: '0 8px 32px rgba(236, 72, 153, 0.4), 0 4px 16px rgba(124, 58, 237, 0.3)' }
                    : {}),
                }}
              />
            ) : (
              <div
                style={{
                  width: effectiveImageWidth,
                  height: effectiveImageHeight,
                  borderRadius: 20,
                  background: t.colors.imagePlaceholderGradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ color: 'white', fontSize: 24, opacity: 0.7 }}>
                  ✦
                </span>
              </div>
            )}
          </div>
        )}

        {/* Hormozi / Data Driven: accent separator line before footer */}
        {(t.id === 'hormozi-dark' || isDataDriven) && (
          <div
            style={{
              marginTop: 'auto',
              width: '100%',
              height: 3,
              background: t.colors.accent,
              borderRadius: 2,
              opacity: anim.footerOpacity,
            }}
          />
        )}

        {/* Footer */}
        <div
          style={{
            width: '100%',
            paddingTop: isEditorial ? 20 : 28,
            borderTop:
              t.id === 'hormozi-dark' || isDataDriven
                ? 'none'
                : `1.5px solid ${t.colors.footerBorder}`,
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            fontSize: 20,
            color: t.colors.footerText,
            fontWeight: 500,
            opacity: anim.footerOpacity,
            ...(isEditorial ? {} : { marginTop: (t.id === 'hormozi-dark' || isDataDriven) ? 12 : 0 }),
          }}
        >
          {slideNumber}/{totalSlides}
        </div>
      </div>
    </AbsoluteFill>
  )
}

export const SlideFrame: React.FC<SlideFrameProps> = (props) => {
  const { animated = true, templateId = 'minimalist', layout = 'feed' } = props
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const template = getTemplate(templateId)

  const { motionEffects, totalDurationFrames } = props

  // Static mode: all elements visible immediately (for renderStill)
  if (!animated) {
    return renderSlide(props, template, {
      headerY: 0,
      headerOpacity: 1,
      titleY: 0,
      titleOpacity: 1,
      bodyOpacity: 1,
      imageScale: 1,
      imageOpacity: 1,
      footerOpacity: 1,
      overlayOpacity: 1,
    })
  }

  // Animated mode: spring animations for video
  const headerProgress = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 120 },
  })
  const headerY = interpolate(headerProgress, [0, 1], [-30, 0])
  const headerOpacity = interpolate(headerProgress, [0, 1], [0, 1])

  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
    delay: 5,
  })
  const titleY = interpolate(titleProgress, [0, 1], [40, 0])
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1])

  const bodyOpacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const imageScale = interpolate(frame, [8, 28], [0.95, 1.0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const imageOpacity = interpolate(frame, [8, 24], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const footerOpacity = interpolate(frame, [15, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Editorial overlay fades in faster
  const overlayOpacity = interpolate(frame, [0, 15], [0.5, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Ken Burns: zoom lento + pan sutil ao longo de toda a duracao do slide
  const slideDuration = totalDurationFrames || 90
  const kenBurnsActive = motionEffects?.kenBurns
  const kenBurnsScale = kenBurnsActive
    ? interpolate(frame, [0, slideDuration], [1.0, 1.08], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : undefined
  const kenBurnsPan = kenBurnsActive
    ? interpolate(frame, [0, slideDuration], [0, -15], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : undefined

  // Progress bar: percentagem de progresso no slide
  const progressPercent = motionEffects?.progressBar
    ? interpolate(frame, [0, slideDuration], [0, 100], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : undefined

  // Parallax 3D: compute offsets per layer (background 0.3x, content 0.6x, text static)
  // Maximum amplitude 30px, pans left-to-right over slide duration
  const parallaxActive = props.parallax === true
  const PARALLAX_AMPLITUDE = 30
  const parallaxBgOffsetX = parallaxActive
    ? interpolate(frame, [0, slideDuration], [-PARALLAX_AMPLITUDE * 0.3, PARALLAX_AMPLITUDE * 0.3], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : undefined
  const parallaxContentOffsetX = parallaxActive
    ? interpolate(frame, [0, slideDuration], [-PARALLAX_AMPLITUDE * 0.6, PARALLAX_AMPLITUDE * 0.6], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : undefined

  return renderSlide(
    props,
    template,
    {
      headerY,
      headerOpacity,
      titleY,
      titleOpacity,
      bodyOpacity,
      imageScale,
      imageOpacity,
      footerOpacity,
      overlayOpacity,
      kenBurnsScale,
      kenBurnsPan,
      progressPercent,
      parallaxBgOffsetX,
      parallaxContentOffsetX,
    },
    { frame, fps }
  )
}
