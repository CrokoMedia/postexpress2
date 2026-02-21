'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { PageHeader } from '@/components/molecules/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Input } from '@/components/atoms/input'
import { Badge } from '@/components/atoms/badge'
import { Sparkles, Upload, Download, Image as ImageIcon, Type, Loader2, Link2, Search, Layers, LayoutTemplate } from 'lucide-react'
import Image from 'next/image'

type TemplateType = 'editorial-cover' | 'editorial-content-title' | 'editorial-content-image' | 'editorial-cta'
type ImageMode = 'compose' | 'search' | 'url' | 'upload' | 'auto' | 'custom_prompt'

interface TemplateOption {
  id: TemplateType
  name: string
  description: string
  slides: string
  preview: string
}

const TEMPLATES: TemplateOption[] = [
  {
    id: 'editorial-cover',
    name: 'Capa',
    description: 'Titulo grande + imagem de fundo + overlay escuro',
    slides: 'Slide 01',
    preview: '/templates-pro/preview-cover.png',
  },
  {
    id: 'editorial-content-title',
    name: 'Conteudo (Titulo)',
    description: 'Titulo destaque no topo + imagem + paragrafos',
    slides: 'Slides 02-07',
    preview: '/templates-pro/preview-content-title.png',
  },
  {
    id: 'editorial-content-image',
    name: 'Conteudo (Imagem)',
    description: 'Imagem grande no topo + paragrafos embaixo',
    slides: 'Slides 03-08',
    preview: '/templates-pro/preview-content-image.png',
  },
  {
    id: 'editorial-cta',
    name: 'CTA / Creditos',
    description: 'Imagem de fundo + badge + texto de creditos',
    slides: 'Slide 09',
    preview: '/templates-pro/preview-cta.png',
  },
]

function getAutoCoverTitleSize(text: string): number {
  const len = text.length
  if (len <= 30) return 96
  if (len <= 45) return 82
  if (len <= 60) return 70
  if (len <= 80) return 58
  return 48
}

function getAutoContentTitleSize(text: string): number {
  const len = text.length
  if (len <= 40) return 64
  if (len <= 60) return 54
  if (len <= 80) return 46
  if (len <= 100) return 40
  return 36
}

function FontSizeSlider({ label, value, onChange, min = 10, max = 120, autoValue }: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  autoValue?: number
}) {
  const isAuto = autoValue !== undefined && value === autoValue
  return (
    <div className="flex items-center gap-3">
      <label className="text-xs text-muted-foreground w-20 shrink-0">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-primary-500"
      />
      <span className="text-xs text-neutral-500 font-mono w-16 text-right">
        {value}px{isAuto ? ' (auto)' : ''}
      </span>
    </div>
  )
}

export default function TemplatesProPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('editorial-cover')
  const [metaLeft, setMetaLeft] = useState('ESTUDO DE CASO')
  const [metaCenter, setMetaCenter] = useState('POST EXPRESS')
  const [metaRight, setMetaRight] = useState('\u00a9COPYRIGHT 2025')
  const [metaBgColor, setMetaBgColor] = useState('')
  const [metaShape, setMetaShape] = useState<'square' | 'rounded'>('square')
  const [metaFontSize, setMetaFontSize] = useState(13)
  const [titulo, setTitulo] = useState('')
  const [subtitulo, setSubtitulo] = useState('')
  const [badgeText, setBadgeText] = useState('')
  const [titleFontSize, setTitleFontSize] = useState(0)
  const [subtitleFontSize, setSubtitleFontSize] = useState(17)
  const [badgeFontSize, setBadgeFontSize] = useState(13)
  const [paragraph1, setParagraph1] = useState('')
  const [paragraph2, setParagraph2] = useState('')
  const [accentColor, setAccentColor] = useState('#E63946')
  const [imagePosition, setImagePosition] = useState<'middle' | 'bottom'>('middle')
  const [creditsText, setCreditsText] = useState('')
  const [imageMode, setImageMode] = useState<ImageMode>('compose')
  const [imagePrompt, setImagePrompt] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [uploadUrl, setUploadUrl] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [referenceFiles, setReferenceFiles] = useState<File[]>([])
  const [referencePreviews, setReferencePreviews] = useState<string[]>([])
  const [generating, setGenerating] = useState(false)
  const [generatedSlide, setGeneratedSlide] = useState<{
    cloudinaryUrl: string
    width: number
    height: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const [previewScale, setPreviewScale] = useState(0.35)

  useEffect(() => {
    const el = previewContainerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width
      setPreviewScale(width / 1080)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const effectiveTitleFontSize = useMemo(() => {
    if (titleFontSize > 0) return titleFontSize
    if (selectedTemplate === 'editorial-cover') return getAutoCoverTitleSize(titulo)
    if (selectedTemplate === 'editorial-content-title') return getAutoContentTitleSize(titulo)
    return 64
  }, [titleFontSize, titulo, selectedTemplate])

  const autoTitleSize = selectedTemplate === 'editorial-cover'
    ? getAutoCoverTitleSize(titulo)
    : getAutoContentTitleSize(titulo)

  async function handleUploadFile(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/templates-pro/upload', { method: 'POST', body: formData })
    if (!res.ok) throw new Error('Falha ao enviar imagem')
    const data = await res.json()
    return data.url as string
  }

  async function handleGenerate() {
    setGenerating(true)
    setError(null)
    setGeneratedSlide(null)
    try {
      let finalUploadUrl = uploadUrl
      if (imageMode === 'upload' && uploadFile) {
        finalUploadUrl = await handleUploadFile(uploadFile)
      }
      let referenceImageUrls: string[] | undefined
      if (imageMode === 'compose' && referenceFiles.length > 0) {
        referenceImageUrls = await Promise.all(referenceFiles.map(f => handleUploadFile(f)))
      }
      const apiImageMode = imageMode === 'url' ? 'upload' : imageMode
      const payload: Record<string, unknown> = {
        template: selectedTemplate,
        metaLeft, metaCenter, metaRight,
        metaBgColor: metaBgColor || undefined,
        metaShape, metaFontSize,
        imageMode: apiImageMode,
        imagePrompt: (imageMode === 'custom_prompt' || imageMode === 'compose') ? imagePrompt : undefined,
        referenceImageUrls,
        searchQuery: imageMode === 'search' ? (searchQuery || titulo) : undefined,
        uploadUrl: (imageMode === 'url' || imageMode === 'upload') ? finalUploadUrl : undefined,
      }
      if (selectedTemplate === 'editorial-cover') {
        if (!titulo.trim()) { setError('Preencha o titulo'); setGenerating(false); return }
        payload.titulo = titulo
        payload.subtitulo = subtitulo
        payload.badgeText = badgeText
        payload.titleFontSizeOverride = titleFontSize > 0 ? titleFontSize : undefined
        payload.subtitleFontSize = subtitleFontSize
        payload.badgeFontSize = badgeFontSize
      }
      if (selectedTemplate === 'editorial-content-title') {
        if (!titulo.trim()) { setError('Preencha o titulo'); setGenerating(false); return }
        if (!paragraph1.trim()) { setError('Preencha o paragrafo 1'); setGenerating(false); return }
        payload.titulo = titulo
        payload.paragraph1 = paragraph1
        payload.paragraph2 = paragraph2 || undefined
        payload.accentColor = accentColor
        payload.imagePosition = imagePosition
        payload.titleFontSizeOverride = titleFontSize > 0 ? titleFontSize : undefined
      }
      if (selectedTemplate === 'editorial-content-image') {
        if (!paragraph1.trim()) { setError('Preencha o paragrafo 1'); setGenerating(false); return }
        if (!paragraph2.trim()) { setError('Preencha o paragrafo 2'); setGenerating(false); return }
        payload.paragraph1 = paragraph1
        payload.paragraph2 = paragraph2
        payload.accentColor = accentColor
      }
      if (selectedTemplate === 'editorial-cta') {
        if (!creditsText.trim()) { setError('Preencha o texto de creditos'); setGenerating(false); return }
        payload.badgeText = badgeText
        payload.creditsText = creditsText
      }
      const res = await fetch('/api/templates-pro/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao gerar slide')
      }
      const data = await res.json()
      setGeneratedSlide({
        cloudinaryUrl: data.slide.cloudinaryUrl,
        width: data.slide.width,
        height: data.slide.height,
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setGenerating(false)
    }
  }

  async function handleDownload() {
    if (!generatedSlide) return
    try {
      const res = await fetch(generatedSlide.cloudinaryUrl)
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `${selectedTemplate}-${Date.now()}.png`
      a.click()
      URL.revokeObjectURL(blobUrl)
    } catch (_downloadErr) {
      window.open(generatedSlide.cloudinaryUrl, '_blank')
    }
  }

  const imageModes = selectedTemplate === 'editorial-cover'
    ? [
        { mode: 'compose' as const, label: 'Descricao Visual', icon: Layers },
        { mode: 'search' as const, label: 'Busca Foto', icon: Search },
        { mode: 'url' as const, label: 'URL da Imagem', icon: Link2 },
        { mode: 'upload' as const, label: 'Upload', icon: Upload },
        { mode: 'auto' as const, label: 'Gerar com IA', icon: Sparkles },
      ]
    : [
        { mode: 'search' as const, label: 'Busca Foto', icon: Search },
        { mode: 'url' as const, label: 'URL da Imagem', icon: Link2 },
        { mode: 'upload' as const, label: 'Upload', icon: Upload },
        { mode: 'auto' as const, label: 'Gerar com IA', icon: Sparkles },
      ]

  const metaItemStyle = (text: string): Record<string, string | number> => {
    if (!text) return {}
    return {
      fontSize: `${metaFontSize}px`,
      fontWeight: 500,
      letterSpacing: '2.5px',
      textTransform: 'uppercase',
      color: metaBgColor ? '#ffffff' : 'rgba(255,255,255,0.6)',
      backgroundColor: metaBgColor || 'transparent',
      padding: metaBgColor ? '6px 14px' : '0',
      borderRadius: metaBgColor ? (metaShape === 'rounded' ? '999px' : '4px') : '0',
    }
  }

  const metaItemStyleDark = (text: string): Record<string, string | number> => {
    if (!text) return {}
    return {
      fontSize: `${metaFontSize}px`,
      fontWeight: 500,
      letterSpacing: '2.5px',
      textTransform: 'uppercase',
      color: metaBgColor ? '#1a1a1a' : '#999999',
      backgroundColor: metaBgColor || 'transparent',
      padding: metaBgColor ? '6px 14px' : '0',
      borderRadius: metaBgColor ? (metaShape === 'rounded' ? '999px' : '4px') : '0',
    }
  }

  function renderMetaBar(isDark = false) {
    const styleFn = isDark ? metaItemStyleDark : metaItemStyle
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        {metaLeft ? <span style={styleFn(metaLeft)}>{metaLeft}</span> : <span />}
        {metaCenter ? <span style={styleFn(metaCenter)}>{metaCenter}</span> : <span />}
        {metaRight ? <span style={styleFn(metaRight)}>{metaRight}</span> : <span />}
      </div>
    )
  }

  function renderCoverPreview() {
    return (
      <div style={{ width: 1080, height: 1350, position: 'relative', overflow: 'hidden', fontFamily: "'Sofia Pro', system-ui, sans-serif", color: '#ffffff', background: '#2a2a2a' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 140, zIndex: 2, background: 'linear-gradient(to bottom, rgba(0,0,0,0.35), transparent)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '75%', zIndex: 2, background: 'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.88) 25%, rgba(0,0,0,0.55) 55%, transparent 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ImageIcon style={{ width: 80, height: 80, color: 'rgba(255,255,255,0.15)' }} />
        </div>
        <div style={{ position: 'relative', zIndex: 3, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 60px 56px' }}>
          {renderMetaBar()}
          <div style={{ marginTop: 'auto' }}>
            {subtitulo && (
              <div style={{ fontSize: `${subtitleFontSize}px`, fontWeight: 400, letterSpacing: '5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 16, lineHeight: 1.5 }}>
                {subtitulo}
              </div>
            )}
            {titulo ? (
              <h1 style={{ fontSize: `${effectiveTitleFontSize}px`, fontWeight: 700, lineHeight: 1.02, textTransform: 'uppercase', color: '#ffffff', marginBottom: 40, letterSpacing: '-1px' }}>
                {titulo}
              </h1>
            ) : (
              <h1 style={{ fontSize: '82px', fontWeight: 700, lineHeight: 1.02, textTransform: 'uppercase', color: 'rgba(255,255,255,0.15)', marginBottom: 40, letterSpacing: '-1px' }}>
                {'SEU TITULO AQUI'}
              </h1>
            )}
            {badgeText && (
              <div style={{ display: 'inline-block', border: '1.5px solid rgba(255,255,255,0.4)', padding: '12px 28px', fontSize: `${badgeFontSize}px`, fontWeight: 600, letterSpacing: '5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)' }}>
                {badgeText}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  function renderContentTitlePreview() {
    return (
      <div style={{ width: 1080, height: 1350, position: 'relative', overflow: 'hidden', fontFamily: "'Sofia Pro', system-ui, sans-serif", background: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '40px 60px 0' }}>{renderMetaBar(true)}</div>
        <div style={{ padding: '36px 60px 0' }}>
          {titulo ? (
            <h1 style={{ fontSize: `${effectiveTitleFontSize}px`, fontWeight: 700, lineHeight: 1.05, textTransform: 'uppercase', color: accentColor, letterSpacing: '-0.5px' }}>{titulo}</h1>
          ) : (
            <h1 style={{ fontSize: '54px', fontWeight: 700, lineHeight: 1.05, textTransform: 'uppercase', color: 'rgba(0,0,0,0.1)', letterSpacing: '-0.5px' }}>{'SEU TITULO AQUI'}</h1>
          )}
        </div>
        {imagePosition === 'middle' ? (
          <>
            <div style={{ flex: '0 0 auto', width: '100%', height: 420, marginTop: 32, overflow: 'hidden', background: '#e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ImageIcon style={{ width: 60, height: 60, color: '#ccc' }} />
            </div>
            <div style={{ flex: 1, padding: '36px 60px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              {paragraph1 && <p style={{ fontSize: 23, fontWeight: 400, lineHeight: 1.55, color: '#1a1a1a' }}>{paragraph1}</p>}
              {paragraph2 && <p style={{ fontSize: 23, fontWeight: 400, lineHeight: 1.55, color: '#1a1a1a', marginTop: 20 }}>{paragraph2}</p>}
            </div>
          </>
        ) : (
          <>
            <div style={{ padding: '32px 60px 0' }}>
              {paragraph1 && <p style={{ fontSize: 23, fontWeight: 400, lineHeight: 1.55, color: '#1a1a1a' }}>{paragraph1}</p>}
              {paragraph2 && <p style={{ fontSize: 23, fontWeight: 400, lineHeight: 1.55, color: '#1a1a1a', marginTop: 20 }}>{paragraph2}</p>}
            </div>
            <div style={{ marginTop: 'auto', width: '100%', height: 460, overflow: 'hidden', background: '#e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ImageIcon style={{ width: 60, height: 60, color: '#ccc' }} />
            </div>
          </>
        )}
      </div>
    )
  }

  function renderContentImagePreview() {
    return (
      <div style={{ width: 1080, height: 1350, position: 'relative', overflow: 'hidden', fontFamily: "'Sofia Pro', system-ui, sans-serif", background: '#FFFFFF', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: '0 0 auto', width: '100%', height: 700, position: 'relative', overflow: 'hidden', background: '#d5d5d5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ImageIcon style={{ width: 80, height: 80, color: '#bbb' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 100%)', zIndex: 1 }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '40px 60px', zIndex: 2 }}>
            {metaLeft ? <span style={metaItemStyle(metaLeft)}>{metaLeft}</span> : <span />}
            {metaCenter ? <span style={metaItemStyle(metaCenter)}>{metaCenter}</span> : <span />}
            {metaRight ? <span style={metaItemStyle(metaRight)}>{metaRight}</span> : <span />}
          </div>
        </div>
        <div style={{ flex: 1, padding: '40px 60px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 24 }}>
          {paragraph1 ? (
            <p style={{ fontSize: 23, fontWeight: 400, lineHeight: 1.55, color: '#1a1a1a' }}>{paragraph1}</p>
          ) : (
            <p style={{ fontSize: 23, fontWeight: 400, lineHeight: 1.55, color: 'rgba(0,0,0,0.15)' }}>{'Paragrafo 1 aparece aqui...'}</p>
          )}
          {paragraph2 ? (
            <p style={{ fontSize: 23, fontWeight: 400, lineHeight: 1.55, color: '#1a1a1a' }}>{paragraph2}</p>
          ) : (
            <p style={{ fontSize: 23, fontWeight: 400, lineHeight: 1.55, color: 'rgba(0,0,0,0.15)' }}>{'Paragrafo 2 aparece aqui...'}</p>
          )}
        </div>
      </div>
    )
  }

  function renderCtaPreview() {
    return (
      <div style={{ width: 1080, height: 1350, position: 'relative', overflow: 'hidden', fontFamily: "'Sofia Pro', system-ui, sans-serif", color: '#ffffff', background: '#2a2a2a' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 140, zIndex: 2, background: 'linear-gradient(to bottom, rgba(0,0,0,0.30), transparent)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '75%', zIndex: 2, background: 'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.88) 25%, rgba(0,0,0,0.55) 55%, transparent 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ImageIcon style={{ width: 80, height: 80, color: 'rgba(255,255,255,0.15)' }} />
        </div>
        <div style={{ position: 'relative', zIndex: 3, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '56px 60px 64px' }}>
          <div style={{ position: 'absolute', top: 40, left: 60, right: 60, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {metaLeft ? <span style={metaItemStyle(metaLeft)}>{metaLeft}</span> : <span />}
            {metaCenter ? <span style={metaItemStyle(metaCenter)}>{metaCenter}</span> : <span />}
            {metaRight ? <span style={metaItemStyle(metaRight)}>{metaRight}</span> : <span />}
          </div>
          {badgeText && (
            <div style={{ display: 'inline-block', alignSelf: 'flex-start', background: accentColor, color: '#ffffff', padding: '10px 20px', fontSize: 13, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', borderRadius: 4, marginBottom: 28 }}>
              {badgeText}
            </div>
          )}
          {creditsText ? (
            <div style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.3, color: '#ffffff' }} dangerouslySetInnerHTML={{ __html: creditsText }} />
          ) : (
            <div style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.3, color: 'rgba(255,255,255,0.15)' }}>{'Texto de creditos aqui...'}</div>
          )}
        </div>
      </div>
    )
  }

  function renderLivePreview() {
    let content: React.ReactElement
    switch (selectedTemplate) {
      case 'editorial-cover': content = renderCoverPreview(); break
      case 'editorial-content-title': content = renderContentTitlePreview(); break
      case 'editorial-content-image': content = renderContentImagePreview(); break
      case 'editorial-cta': content = renderCtaPreview(); break
      default: content = renderCoverPreview(); break
    }
    return (
      <div ref={previewContainerRef} style={{ width: '100%', aspectRatio: '1080 / 1350', position: 'relative', overflow: 'hidden', borderRadius: 8 }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: 1080, height: 1350, transform: `scale(${previewScale})`, transformOrigin: 'top left' }}>
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader title="Templates Pro" description="Gere slides editoriais de alta qualidade estilo magazine" />

      <div className="mb-8">
        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <LayoutTemplate className="h-4 w-4" />
          Escolha o template
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => { setSelectedTemplate(t.id); setGeneratedSlide(null); setError(null); setTitleFontSize(0); if (t.id !== 'editorial-cover' && imageMode === 'compose') setImageMode('search') }}
              className={`text-left rounded-xl border-2 transition-all overflow-hidden ${selectedTemplate === t.id ? 'border-primary-500 bg-primary-500/10 ring-1 ring-primary-500/30' : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600 shadow-sm hover:shadow-hover'}`}
            >
              <div className="aspect-[1080/1350] relative bg-neutral-100 dark:bg-neutral-700">
                <Image src={t.preview} alt={t.name} fill className="object-cover" sizes="(max-width: 1024px) 50vw, 25vw" />
                {selectedTemplate === t.id && <div className="absolute inset-0 bg-primary-500/10 border-b-2 border-primary-500" />}
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-semibold ${selectedTemplate === t.id ? 'text-primary-600 dark:text-primary-400' : 'text-foreground'}`}>{t.name}</span>
                  <span className="text-[10px] font-medium text-muted-foreground bg-neutral-100 dark:bg-neutral-700 px-1.5 py-0.5 rounded">{t.slides}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{t.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {selectedTemplate === 'editorial-cover' && (
            <Card className="bg-gradient-to-br from-primary-50/50 to-white dark:from-primary-950/30 dark:to-neutral-800/50 border-l-4 border-l-primary-500 shadow-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Type className="h-5 w-5 text-primary-500" />Conteudo da Capa</CardTitle>
                <CardDescription>Textos do slide de capa editorial</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Titulo Principal</label>
                  <Input placeholder="Ex: Como Why Do It muda o sentido do esporte" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Subtitulo</label>
                  <Input placeholder="Ex: O peso de uma frase global" value={subtitulo} onChange={(e) => setSubtitulo(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Texto do Badge</label>
                  <Input placeholder="Ex: DOSSIE POST EXPRESS" value={badgeText} onChange={(e) => setBadgeText(e.target.value)} />
                </div>
                <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4 mt-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Tipografia</p>
                  <div className="space-y-3">
                    <FontSizeSlider label="Titulo" value={effectiveTitleFontSize} onChange={(v) => setTitleFontSize(v)} min={36} max={120} autoValue={autoTitleSize} />
                    <FontSizeSlider label="Subtitulo" value={subtitleFontSize} onChange={setSubtitleFontSize} min={12} max={32} />
                    <FontSizeSlider label="Badge" value={badgeFontSize} onChange={setBadgeFontSize} min={10} max={24} />
                    {titleFontSize > 0 && <button onClick={() => setTitleFontSize(0)} className="text-xs text-primary-400 hover:text-primary-300 underline">{`Resetar titulo para auto (${autoTitleSize}px)`}</button>}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedTemplate === 'editorial-content-title' && (
            <Card className="bg-gradient-to-br from-info-50/50 to-white dark:from-info-950/30 dark:to-neutral-800/50 border-l-4 border-l-info-500 shadow-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Type className="h-5 w-5 text-primary-500" />Conteudo com Titulo</CardTitle>
                <CardDescription>Titulo em destaque + paragrafos + imagem</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Titulo Principal</label>
                  <Input placeholder="Ex: Em 1988, Nike lancou Just Do It." value={titulo} onChange={(e) => setTitulo(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Paragrafo 1</label>
                  <textarea className="flex w-full rounded-lg border-2 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 min-h-[80px] resize-y" placeholder="Primeira frase sera automaticamente colocada em negrito." value={paragraph1} onChange={(e) => setParagraph1(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Paragrafo 2 (opcional)</label>
                  <textarea className="flex w-full rounded-lg border-2 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 min-h-[80px] resize-y" placeholder="Primeira frase sera em negrito com cor de destaque." value={paragraph2} onChange={(e) => setParagraph2(e.target.value)} />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-foreground mb-1.5">Posicao da Imagem</label>
                    <div className="flex gap-2">
                      {(['middle', 'bottom'] as const).map((pos) => (
                        <button key={pos} onClick={() => setImagePosition(pos)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${imagePosition === pos ? 'bg-primary-500 text-white' : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'}`}>
                          {pos === 'middle' ? 'No Meio' : 'Embaixo'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Cor Destaque</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-10 h-10 rounded-lg border-2 border-neutral-300 cursor-pointer bg-transparent" />
                      <span className="text-xs text-muted-foreground font-mono">{accentColor}</span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4 mt-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Tipografia</p>
                  <FontSizeSlider label="Titulo" value={effectiveTitleFontSize} onChange={(v) => setTitleFontSize(v)} min={28} max={80} autoValue={autoTitleSize} />
                  {titleFontSize > 0 && <button onClick={() => setTitleFontSize(0)} className="text-xs text-primary-400 hover:text-primary-300 underline mt-2">{`Resetar para auto (${autoTitleSize}px)`}</button>}
                </div>
              </CardContent>
            </Card>
          )}

          {selectedTemplate === 'editorial-content-image' && (
            <Card className="bg-gradient-to-br from-success-50/50 to-white dark:from-success-950/30 dark:to-neutral-800/50 border-l-4 border-l-success-500 shadow-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5 text-primary-500" />Conteudo com Imagem</CardTitle>
                <CardDescription>Imagem grande no topo + 2 paragrafos de texto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Paragrafo 1</label>
                  <textarea className="flex w-full rounded-lg border-2 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 min-h-[100px] resize-y" placeholder="Ex: Decadas depois, o mundo mudou." value={paragraph1} onChange={(e) => setParagraph1(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Paragrafo 2</label>
                  <textarea className="flex w-full rounded-lg border-2 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 min-h-[100px] resize-y" placeholder="Primeira frase sera em negrito com cor de destaque." value={paragraph2} onChange={(e) => setParagraph2(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Cor Destaque</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-10 h-10 rounded-lg border-2 border-neutral-300 cursor-pointer bg-transparent" />
                    <span className="text-xs text-neutral-600 font-mono">{accentColor}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedTemplate === 'editorial-cta' && (
            <Card className="bg-gradient-to-br from-warning-50/50 to-white dark:from-warning-950/30 dark:to-neutral-800/50 border-l-4 border-l-warning-500 shadow-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary-500" />CTA / Creditos</CardTitle>
                <CardDescription>Slide final com atribuicao e chamada</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Texto do Badge</label>
                  <Input placeholder="Ex: POWERED BY AI [POST EXPRESS]" value={badgeText} onChange={(e) => setBadgeText(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Texto de Creditos</label>
                  <textarea className="flex w-full rounded-lg border-2 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 min-h-[120px] resize-y" placeholder='Ex: Produzido com ajuda de Inteligencia Artificial inspirado no artigo: "Nike Reintroduces Just Do It".' value={creditsText} onChange={(e) => setCreditsText(e.target.value)} />
                  <p className="text-xs text-muted-foreground mt-1">{'Use <em>texto</em> para italico'}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Meta Bar</CardTitle>
              <CardDescription>Informacoes no topo do slide</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Esquerda</label>
                  <Input placeholder="Ex: ESTUDO DE CASO" value={metaLeft} onChange={(e) => setMetaLeft(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Centro</label>
                  <Input placeholder="Ex: POST EXPRESS" value={metaCenter} onChange={(e) => setMetaCenter(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Direita</label>
                  <Input placeholder={'\u00a9COPYRIGHT 2025'} value={metaRight} onChange={(e) => setMetaRight(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center gap-6 flex-wrap">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Fundo do Destaque</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={metaBgColor || '#E63946'} onChange={(e) => setMetaBgColor(e.target.value)} className="w-10 h-10 rounded-lg border-2 border-neutral-300 cursor-pointer bg-transparent" />
                    <span className="text-xs text-muted-foreground font-mono">{metaBgColor || 'nenhum'}</span>
                    {metaBgColor && <button onClick={() => setMetaBgColor('')} className="text-xs text-muted-foreground hover:text-foreground underline">limpar</button>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Formato</label>
                  <div className="flex gap-2">
                    <button onClick={() => setMetaShape('square')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${metaShape === 'square' ? 'bg-primary-500 text-white' : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'}`}>Quadrado</button>
                    <button onClick={() => setMetaShape('rounded')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${metaShape === 'rounded' ? 'bg-primary-500 text-white' : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'}`}>Redondo</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Tamanho da Fonte</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min={10} max={24} value={metaFontSize} onChange={(e) => setMetaFontSize(Number(e.target.value))} className="w-24 accent-primary-500" />
                    <span className="text-xs text-neutral-500 font-mono w-8">{metaFontSize}px</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-800/50 dark:to-neutral-800/30 border-l-4 border-l-secondary-900 shadow-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5 text-primary-500" />Imagem</CardTitle>
              <CardDescription>Escolha como obter a imagem do slide</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {imageModes.map(({ mode, label, icon: Icon }) => (
                  <button key={mode} onClick={() => setImageMode(mode)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${imageMode === mode ? 'bg-primary-500 text-white' : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'}`}>
                    <Icon className="h-4 w-4" />{label}
                  </button>
                ))}
              </div>

              {imageMode === 'compose' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground mb-1.5">Descreva o visual do slide</label>
                    <textarea className="flex w-full rounded-lg border-2 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 min-h-[120px] resize-y" placeholder={'Ex: Foto de skatista fazendo manobra em pista\nGradiente verde escuro para verde claro (#0f4c3a \u2192 #2d8659)\nLogo da Nike + Logo da Monster Energy\nEstilo jornalistico, breaking news'} value={imagePrompt} onChange={(e) => setImagePrompt(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">{'Imagens de referencia '}<span className="text-muted-foreground font-normal">{'(opcional, max 4)'}</span></label>
                      {referenceFiles.length > 0 && <button type="button" onClick={() => { setReferenceFiles([]); setReferencePreviews([]) }} className="text-xs text-muted-foreground hover:text-foreground">Limpar todas</button>}
                    </div>
                    <p className="text-xs text-muted-foreground">{'Envie imagens (logos, fotos, referencias) para a IA combinar com o prompt. Use @image1, @image2... no prompt para referenciar cada imagem.'}</p>
                    {referencePreviews.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {referencePreviews.map((preview, idx) => (
                          <div key={idx} className="relative group">
                            <img src={preview} alt={`Ref ${idx + 1}`} className="w-full h-[100px] object-cover rounded-lg border-2 border-neutral-300 dark:border-neutral-600" />
                            <div className="absolute top-1 left-1 bg-white/90 dark:bg-neutral-800/90 text-foreground rounded px-1.5 py-0.5 text-[10px] font-mono border border-neutral-200 dark:border-neutral-600">{`@image${idx + 1}`}</div>
                            <button type="button" onClick={() => { setReferenceFiles(prev => prev.filter((_, i) => i !== idx)); setReferencePreviews(prev => prev.filter((_, i) => i !== idx)) }} className="absolute top-1 right-1 bg-white/90 dark:bg-neutral-800/90 text-neutral-600 dark:text-neutral-400 hover:text-error-600 rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity border border-neutral-200 dark:border-neutral-600">x</button>
                          </div>
                        ))}
                      </div>
                    )}
                    {referenceFiles.length < 4 && (
                      <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { setReferenceFiles(prev => [...prev, file]); const reader = new FileReader(); reader.onload = (ev) => setReferencePreviews(prev => [...prev, ev.target?.result as string]); reader.readAsDataURL(file) } e.target.value = '' }} className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-neutral-100 dark:file:bg-neutral-700 file:text-neutral-900 dark:file:text-neutral-100 hover:file:bg-neutral-200 dark:hover:file:bg-neutral-600 file:cursor-pointer" />
                    )}
                  </div>
                </div>
              )}

              {imageMode === 'search' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground mb-1.5">Termo de busca</label>
                  <Input placeholder="Ex: Nike athlete, Rayssa Leal, LeBron James" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
              )}

              {imageMode === 'url' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground mb-1.5">URL da imagem</label>
                  <Input placeholder="https://exemplo.com/foto.jpg" value={uploadUrl} onChange={(e) => setUploadUrl(e.target.value)} />
                </div>
              )}

              {imageMode === 'upload' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Upload de imagem</label>
                  <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) setUploadFile(file) }} className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-500 file:text-white hover:file:bg-primary-600 file:cursor-pointer" />
                </div>
              )}

              {imageMode === 'auto' && <p className="text-sm text-muted-foreground">Busca no Google primeiro. Se nao encontrar, gera com IA.</p>}
            </CardContent>
          </Card>

          <Button size="lg" className="w-full" onClick={handleGenerate} loading={generating} icon={<Sparkles className="h-5 w-5" />} disabled={generating}>
            {generating ? 'Gerando Slide...' : 'Gerar Slide'}
          </Button>

          {error && <div className="rounded-lg border border-error-200 dark:border-error-800 bg-error-50 dark:bg-error-900/30 p-4 text-sm text-error-700 dark:text-error-400">{error}</div>}
        </div>

        <div className="space-y-4">
          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Preview ao Vivo</CardTitle>
                <div className="flex items-center gap-2">
                  {generatedSlide && <Badge variant="success">Gerado</Badge>}
                  <Badge variant="neutral">{TEMPLATES.find(t => t.id === selectedTemplate)?.name}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {generating && (
                <div className="aspect-[1080/1350] bg-neutral-50 dark:bg-neutral-800 rounded-lg flex flex-col items-center justify-center gap-4 border border-neutral-200 dark:border-neutral-700">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                  <p className="text-sm text-muted-foreground">Gerando slide editorial...</p>
                </div>
              )}
              {!generating && generatedSlide && (
                <div className="space-y-4">
                  <div className="aspect-[1080/1350] relative rounded-lg overflow-hidden">
                    <Image src={generatedSlide.cloudinaryUrl} alt="Slide editorial gerado" fill className="object-cover" unoptimized />
                  </div>
                  <div className="flex gap-3">
                    <Button variant="secondary" className="flex-1" onClick={handleDownload} icon={<Download className="h-4 w-4" />}>Download PNG</Button>
                    <Button variant="ghost" className="flex-1" onClick={() => setGeneratedSlide(null)}>Voltar ao Preview</Button>
                  </div>
                </div>
              )}
              {!generating && !generatedSlide && renderLivePreview()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
