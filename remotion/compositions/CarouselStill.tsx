import React from 'react'
import { AbsoluteFill } from 'remotion'
import { SlideFrame } from '../components/SlideFrame'
import type { CarouselStillProps } from '../types'

export const CarouselStill: React.FC<CarouselStillProps> = ({
  titulo,
  corpo,
  contentImageUrl,
  profilePicUrl,
  username,
  fullName,
  templateId = 'minimalist',
  format = 'feed',
  slideNumber,
  totalSlides,
  theme,
}) => {
  return (
    <AbsoluteFill>
      <SlideFrame
        titulo={titulo}
        corpo={corpo}
        contentImageUrl={contentImageUrl}
        profilePicUrl={profilePicUrl}
        username={username}
        fullName={fullName}
        slideNumber={slideNumber}
        totalSlides={totalSlides}
        templateId={templateId}
        layout={format}
        animated={false}
        theme={theme}
      />
    </AbsoluteFill>
  )
}
