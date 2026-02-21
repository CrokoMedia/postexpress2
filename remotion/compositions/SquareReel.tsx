import React from 'react'
import {
  TransitionSeries,
  springTiming,
} from '@remotion/transitions'
import { fade } from '@remotion/transitions/fade'
import { Audio, Sequence, AbsoluteFill, useVideoConfig } from 'remotion'
import { SlideFrame } from '../components/SlideFrame'
import { AnimatedCaptions } from '../components/AnimatedCaptions'
import { BackgroundMusic } from '../components/BackgroundMusic'
import { HookIntro } from '../components/HookIntro'
import { GlitchHookIntro } from '../components/GlitchHookIntro'
import { getTransitionForStyle } from '../transitions'
import type { CarouselReelProps } from '../types'

const HOOK_DURATION_FRAMES = 60 // 2 seconds at 30fps

/**
 * Composicao Square (1:1 / 1080x1080) -- usa o mesmo SlideFrame
 * com layout="square" para adaptar tipografia (sem corpo, imagem menor).
 */
export const SquareReel: React.FC<CarouselReelProps> = ({
  slides,
  profilePicUrl,
  username,
  fullName,
  templateId = 'minimalist',
  durationPerSlideFrames,
  transitionFrames,
  audioUrls,
  slideDurations,
  captionData,
  captionStyle,
  soundEffectUrls,
  hookEnabled,
  hookText,
  hookStyle,
  hookIntroStyle,
  backgroundMusicUrl,
  musicVolume,
  textEffect,
  motionEffects,
  backgroundMusic,
  transitionStyle = 'random',
  animatedBackground,
  particleEffects,
  animatedMetrics,
  parallax,
}) => {
  const { durationInFrames } = useVideoConfig()
  const effectiveMusicVolume = musicVolume ?? (backgroundMusic?.volume) ?? 0.15
  const effectiveMusicUrl = backgroundMusic?.url || backgroundMusicUrl

  return (
    <AbsoluteFill>
    {/* Background music — toca durante todo o video com fade-in/out */}
    {effectiveMusicUrl && (
      <BackgroundMusic
        src={effectiveMusicUrl}
        volume={effectiveMusicVolume}
        totalFrames={durationInFrames}
      />
    )}
    <TransitionSeries>
      {/* Hook Visual (2s de intro antes do primeiro slide) */}
      {hookEnabled && hookText && (
        <>
          <TransitionSeries.Sequence durationInFrames={HOOK_DURATION_FRAMES}>
            {hookIntroStyle === 'glitch' ? (
              <GlitchHookIntro
                hookText={hookText}
                format="square"
                backgroundImageUrl={slides[0]?.contentImageUrl}
              />
            ) : (
              <HookIntro
                hookText={hookText}
                format="square"
                backgroundImageUrl={slides[0]?.contentImageUrl}
              />
            )}
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition
            presentation={fade()}
            timing={springTiming({
              config: { damping: 14 },
              durationInFrames: transitionFrames,
            })}
          />
        </>
      )}
      {slides.map((slideData, i) => {
        const frameDuration = slideDurations?.[i] ?? durationPerSlideFrames
        const audioUrl = audioUrls?.[i]
        const slideCaptions = captionData?.[i]

        // Sound effect de transição: posicionar no final do slide
        const hasTransition = i < slides.length - 1
        const sfxUrl = hasTransition ? soundEffectUrls?.whoosh : undefined

        return (
          <React.Fragment key={i}>
            <TransitionSeries.Sequence
              durationInFrames={frameDuration}
            >
              <>
                <SlideFrame
                  titulo={slideData.titulo}
                  corpo={slideData.corpo}
                  contentImageUrl={slideData.contentImageUrl}
                  profilePicUrl={profilePicUrl}
                  username={username}
                  fullName={fullName}
                  slideNumber={slideData.slideNumber}
                  totalSlides={slideData.totalSlides}
                  templateId={templateId}
                  layout="square"
                  textEffect={textEffect}
                  isFirstSlide={i === 0}
                  hookStyle={hookEnabled ? (hookStyle || 'word-by-word') : undefined}
                  motionEffects={motionEffects}
                  totalDurationFrames={frameDuration}
                  animatedBackground={animatedBackground}
                  particleEffects={particleEffects}
                  animatedMetrics={animatedMetrics}
                  parallax={parallax}
                />
                {audioUrl && (
                  <Audio src={audioUrl} volume={1} />
                )}
                {slideCaptions && slideCaptions.length > 0 && (
                  <AnimatedCaptions
                    captions={slideCaptions}
                    style={captionStyle || 'highlight'}
                    position={captionStyle === 'tiktok-viral' ? 'center' : 'bottom'}
                    layout="square"
                    startFrame={0}
                  />
                )}
                {/* Sound effect posicionado nos últimos frames antes da transição */}
                {sfxUrl && frameDuration > transitionFrames && (
                  <Sequence
                    from={Math.max(0, frameDuration - transitionFrames)}
                    durationInFrames={transitionFrames}
                  >
                    <Audio src={sfxUrl} volume={0.5} />
                  </Sequence>
                )}
              </>
            </TransitionSeries.Sequence>
            {hasTransition && (
              <TransitionSeries.Transition
                presentation={getTransitionForStyle(transitionStyle ?? 'random', i)}
                timing={springTiming({
                  config: { damping: 14 },
                  durationInFrames: transitionFrames,
                })}
              />
            )}
          </React.Fragment>
        )
      })}
    </TransitionSeries>
    </AbsoluteFill>
  )
}
