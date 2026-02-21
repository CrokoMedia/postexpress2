import React from 'react'
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  AbsoluteFill,
  Img,
  Sequence,
} from 'remotion'
import { RadarChart } from '../components/RadarChart'
import { ScoreBar } from '../components/ScoreBar'
import type { AuditVideoProps } from '../types'

// Cores dos 5 auditores
const AUDITOR_COLORS = {
  behavior: '#3b82f6', // azul (Kahneman)
  copy: '#f59e0b', // amarelo (Schwartz)
  offers: '#ef4444', // vermelho (Hormozi)
  metrics: '#22c55e', // verde (Cagan)
  anomalies: '#a855f7', // roxo (Paul Graham)
}

// Constantes de timing (30fps)
const FPS = 30
const INTRO_START = 0
const INTRO_END = 60 // 2s
const RADAR_START = 60
const RADAR_END = 300 // 8s
const INSIGHTS_START = 300
const INSIGHTS_END = 450 // 5s
const CTA_START = 450
const CTA_END = 540 // 3s

/**
 * Secao Intro: logo Post Express + "Auditoria de @username"
 */
const IntroSection: React.FC<{ username: string; profileImageUrl?: string }> = ({
  username,
  profileImageUrl,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Logo/titulo anima de baixo pra cima com fade
  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 100 },
    delay: 5,
  })
  const titleY = interpolate(titleProgress, [0, 1], [60, 0])
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1])

  // Username anima depois
  const usernameProgress = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 90 },
    delay: 15,
  })
  const usernameY = interpolate(usernameProgress, [0, 1], [40, 0])
  const usernameOpacity = interpolate(usernameProgress, [0, 1], [0, 1])

  // Avatar anima com scale
  const avatarProgress = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
    delay: 8,
  })

  // Fade out no final da secao
  const fadeOut = interpolate(frame, [45, 58], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 32,
        opacity: fadeOut,
      }}
    >
      {/* Avatar do perfil */}
      {profileImageUrl && (
        <div
          style={{
            transform: `scale(${avatarProgress})`,
            width: 120,
            height: 120,
            borderRadius: '50%',
            overflow: 'hidden',
            border: '3px solid rgba(124, 58, 237, 0.6)',
          }}
        >
          <Img
            src={profileImageUrl}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      )}

      {/* Titulo Post Express */}
      <div
        style={{
          transform: `translateY(${titleY}px)`,
          opacity: titleOpacity,
          fontSize: 48,
          fontWeight: 700,
          color: '#7c3aed',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          letterSpacing: -1,
        }}
      >
        Post Express
      </div>

      {/* Subtitulo com username */}
      <div
        style={{
          transform: `translateY(${usernameY}px)`,
          opacity: usernameOpacity,
          fontSize: 32,
          fontWeight: 500,
          color: 'rgba(255,255,255,0.9)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        Auditoria de @{username}
      </div>

      {/* Linha decorativa */}
      <div
        style={{
          width: 80,
          height: 3,
          backgroundColor: '#7c3aed',
          borderRadius: 2,
          opacity: usernameOpacity,
        }}
      />
    </AbsoluteFill>
  )
}

/**
 * Secao Radar: radar chart animado + 5 barras de score
 */
const RadarSection: React.FC<{
  scores: AuditVideoProps['scores']
}> = ({ scores }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Fade in da secao inteira
  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Fade out no final
  const fadeOut = interpolate(frame, [220, 238], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Overall score animado (aparece depois do radar)
  const overallProgress = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 60 },
    delay: 40,
  })
  const overallScale = interpolate(overallProgress, [0, 1], [0.5, 1])
  const overallOpacity = interpolate(overallProgress, [0, 1], [0, 1])

  // Dados para o radar chart
  const radarScores = [
    { label: 'Kahneman', value: scores.behavior, color: AUDITOR_COLORS.behavior },
    { label: 'Schwartz', value: scores.copy, color: AUDITOR_COLORS.copy },
    { label: 'Hormozi', value: scores.offers, color: AUDITOR_COLORS.offers },
    { label: 'Cagan', value: scores.metrics, color: AUDITOR_COLORS.metrics },
    { label: 'P. Graham', value: scores.anomalies, color: AUDITOR_COLORS.anomalies },
  ]

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 60,
        opacity: fadeIn * fadeOut,
      }}
    >
      {/* Titulo da secao */}
      <div
        style={{
          fontSize: 28,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.7)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          marginBottom: 20,
          textTransform: 'uppercase',
          letterSpacing: 3,
        }}
      >
        Resultado da Auditoria
      </div>

      {/* Overall Score */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 24,
          transform: `scale(${overallScale})`,
          opacity: overallOpacity,
        }}
      >
        <span
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: '#7c3aed',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            lineHeight: 1,
          }}
        >
          {Math.round(scores.overall * overallProgress)}
        </span>
        <span
          style={{
            fontSize: 24,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.5)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          / 100
        </span>
      </div>

      {/* Radar chart */}
      <div style={{ marginBottom: 32 }}>
        <RadarChart scores={radarScores} size={380} animated />
      </div>

      {/* Barras de score individuais */}
      <div
        style={{
          width: '100%',
          maxWidth: 600,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <ScoreBar
          label="Kahneman"
          score={scores.behavior}
          maxScore={100}
          color={AUDITOR_COLORS.behavior}
          delay={20}
        />
        <ScoreBar
          label="Schwartz"
          score={scores.copy}
          maxScore={100}
          color={AUDITOR_COLORS.copy}
          delay={25}
        />
        <ScoreBar
          label="Hormozi"
          score={scores.offers}
          maxScore={100}
          color={AUDITOR_COLORS.offers}
          delay={30}
        />
        <ScoreBar
          label="Cagan"
          score={scores.metrics}
          maxScore={100}
          color={AUDITOR_COLORS.metrics}
          delay={35}
        />
        <ScoreBar
          label="P. Graham"
          score={scores.anomalies}
          maxScore={100}
          color={AUDITOR_COLORS.anomalies}
          delay={40}
        />
      </div>
    </AbsoluteFill>
  )
}

/**
 * Secao Insights: top 3 insights com efeito typewriter
 */
const InsightsSection: React.FC<{ insights: string[] }> = ({ insights }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Fade in
  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Fade out no final
  const fadeOut = interpolate(frame, [130, 148], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 80,
        opacity: fadeIn * fadeOut,
      }}
    >
      {/* Titulo */}
      <div
        style={{
          fontSize: 28,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.7)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          marginBottom: 48,
          textTransform: 'uppercase',
          letterSpacing: 3,
        }}
      >
        Principais Insights
      </div>

      {/* Insights com typewriter */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
          width: '100%',
          maxWidth: 800,
        }}
      >
        {insights.slice(0, 3).map((insight, i) => {
          const insightDelay = 10 + i * 35 // cada insight aparece com intervalo
          const insightProgress = spring({
            frame,
            fps,
            config: { damping: 20, stiffness: 80 },
            delay: insightDelay,
          })
          const insightX = interpolate(insightProgress, [0, 1], [-40, 0])
          const insightOpacity = interpolate(insightProgress, [0, 1], [0, 1])

          // Typewriter: caracteres visiveis
          const totalChars = insight.length
          const typewriterStart = insightDelay + 5
          const typewriterEnd = typewriterStart + Math.min(totalChars * 0.7, 40)
          const visibleChars = Math.round(
            interpolate(frame, [typewriterStart, typewriterEnd], [0, totalChars], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })
          )

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 20,
                transform: `translateX(${insightX}px)`,
                opacity: insightOpacity,
              }}
            >
              {/* Numero do insight */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  fontWeight: 700,
                  color: 'white',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>

              {/* Texto do insight com typewriter */}
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.9)',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  lineHeight: 1.5,
                  flex: 1,
                }}
              >
                {insight.slice(0, visibleChars)}
                {visibleChars < totalChars && (
                  <span
                    style={{
                      opacity: frame % 15 < 8 ? 1 : 0,
                      color: '#7c3aed',
                    }}
                  >
                    |
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </AbsoluteFill>
  )
}

/**
 * Secao CTA: "Faca sua auditoria em postexpress.com"
 */
const CTASection: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Animacao de entrada
  const progress = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 100 },
    delay: 5,
  })
  const scale = interpolate(progress, [0, 1], [0.8, 1])
  const opacity = interpolate(progress, [0, 1], [0, 1])

  // Pulso sutil no CTA
  const pulse = interpolate(
    frame,
    [30, 50, 70, 90],
    [1, 1.03, 1, 1.03],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  )

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 32,
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      {/* Logo */}
      <div
        style={{
          fontSize: 52,
          fontWeight: 800,
          color: '#7c3aed',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          letterSpacing: -1,
        }}
      >
        Post Express
      </div>

      {/* CTA principal */}
      <div
        style={{
          fontSize: 30,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.95)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center',
          lineHeight: 1.4,
          maxWidth: 700,
        }}
      >
        Descubra o score do seu perfil
      </div>

      {/* Botao CTA */}
      <div
        style={{
          transform: `scale(${pulse})`,
          backgroundColor: '#7c3aed',
          borderRadius: 16,
          padding: '20px 48px',
          fontSize: 26,
          fontWeight: 700,
          color: 'white',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        postexpress.com
      </div>

      {/* Subtexto */}
      <div
        style={{
          fontSize: 18,
          color: 'rgba(255,255,255,0.5)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          marginTop: 8,
        }}
      >
        Auditoria profissional em 3 minutos
      </div>
    </AbsoluteFill>
  )
}

/**
 * Composicao principal: AuditResult
 * Formato: 1080x1080 (quadrado, ideal para feed e social)
 * Duracao: ~18s (540 frames a 30fps)
 */
export const AuditResult: React.FC<AuditVideoProps> = ({
  username,
  profileImageUrl,
  scores,
  insights,
}) => {
  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Secao 1: Intro (0-60 frames = 2s) */}
      <Sequence from={INTRO_START} durationInFrames={INTRO_END - INTRO_START}>
        <IntroSection username={username} profileImageUrl={profileImageUrl} />
      </Sequence>

      {/* Secao 2: Radar + Scores (60-300 frames = 8s) */}
      <Sequence from={RADAR_START} durationInFrames={RADAR_END - RADAR_START}>
        <RadarSection scores={scores} />
      </Sequence>

      {/* Secao 3: Insights (300-450 frames = 5s) */}
      <Sequence
        from={INSIGHTS_START}
        durationInFrames={INSIGHTS_END - INSIGHTS_START}
      >
        <InsightsSection insights={insights} />
      </Sequence>

      {/* Secao 4: CTA (450-540 frames = 3s) */}
      <Sequence from={CTA_START} durationInFrames={CTA_END - CTA_START}>
        <CTASection />
      </Sequence>
    </AbsoluteFill>
  )
}
