'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/card'
import { Button } from '@/components/atoms/button'
import { Badge } from '@/components/atoms/badge'
import { FileText, Upload, X, Check, Loader2, ChevronDown, ChevronUp, Plus, Trash2, AlertTriangle } from 'lucide-react'
import type { UserProfile, UserProfileContentPillar, UserProfileProduct } from '@/types/database'

interface ProfileContextModalProps {
  profileId: string
  username: string
  onClose: () => void
  onSave: () => void
}

export function ProfileContextModal({ profileId, username, onClose, onSave }: ProfileContextModalProps) {
  const [loading, setLoading] = useState(false)
  const [loadingContext, setLoadingContext] = useState(true)
  const [uploading, setUploading] = useState(false)

  // Seções expansíveis
  const [expandedSections, setExpandedSections] = useState({
    identity: true,
    credibility: false,
    philosophy: false,
    contentStyle: false,
    contentPillars: false,
    business: false,
    dna: false,
    documents: false
  })

  // 1. IDENTITY
  const [fullName, setFullName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [positioning, setPositioning] = useState('')
  const [niche, setNiche] = useState<string[]>([])
  const [nicheInput, setNicheInput] = useState('')
  const [toneOfVoice, setToneOfVoice] = useState('')

  // 2. CREDIBILITY
  const [experience, setExperience] = useState('')
  const [achievements, setAchievements] = useState<string[]>([])
  const [achievementInput, setAchievementInput] = useState('')
  const [expertise, setExpertise] = useState<string[]>([])
  const [expertiseInput, setExpertiseInput] = useState('')

  // 3. PHILOSOPHY
  const [values, setValues] = useState<string[]>([])
  const [valueInput, setValueInput] = useState('')
  const [beliefs, setBeliefs] = useState('')
  const [defends, setDefends] = useState('')
  const [rejects, setRejects] = useState('')

  // 4. CONTENT STYLE
  const [preferredFormats, setPreferredFormats] = useState<string[]>([])
  const [formatInput, setFormatInput] = useState('')
  const [structure, setStructure] = useState('')
  const [formality, setFormality] = useState('casual')
  const [emojis, setEmojis] = useState(true)
  const [storytelling, setStorytelling] = useState('')
  const [termsToAvoid, setTermsToAvoid] = useState<string[]>([])
  const [termToAvoidInput, setTermToAvoidInput] = useState('')

  // 5. CONTENT PILLARS
  const [contentPillars, setContentPillars] = useState<UserProfileContentPillar[]>([])
  const [pillarNameInput, setPillarNameInput] = useState('')
  const [pillarSubtopicsInput, setPillarSubtopicsInput] = useState('')

  // 6. BUSINESS
  const [products, setProducts] = useState<UserProfileProduct[]>([])
  const [productNameInput, setProductNameInput] = useState('')
  const [productPriceInput, setProductPriceInput] = useState('')
  const [productTargetInput, setProductTargetInput] = useState('')
  const [productCtaInput, setProductCtaInput] = useState('')

  // 7. DNA
  const [energy, setEnergy] = useState('')
  const [uniqueVoice, setUniqueVoice] = useState('')
  const [transformation, setTransformation] = useState('')

  // 8. DOCUMENTS (mantém estrutura anterior)
  const [files, setFiles] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [isDragging, setIsDragging] = useState(false)

  // Carregar contexto existente
  useEffect(() => {
    fetchContext()
  }, [profileId])

  const fetchContext = async () => {
    try {
      const res = await fetch(`/api/profiles/${profileId}/context`)
      if (res.ok) {
        const data = await res.json()
        if (data.context) {
          const ctx = data.context

          // 1. IDENTITY
          setFullName(ctx.identity?.fullName || '')
          setDisplayName(ctx.identity?.displayName || '')
          setPositioning(ctx.identity?.positioning || '')
          setNiche(ctx.identity?.niche || [])
          setToneOfVoice(ctx.identity?.toneOfVoice || '')

          // 2. CREDIBILITY
          setExperience(ctx.credibility?.experience || '')
          setAchievements(ctx.credibility?.achievements || [])
          setExpertise(ctx.credibility?.expertise || [])

          // 3. PHILOSOPHY
          setValues(ctx.philosophy?.values || [])
          setBeliefs(ctx.philosophy?.beliefs || '')
          setDefends(ctx.philosophy?.defends || '')
          setRejects(ctx.philosophy?.rejects || '')

          // 4. CONTENT STYLE
          setPreferredFormats(ctx.content_style?.preferredFormats || [])
          setStructure(ctx.content_style?.structure || '')
          setFormality(ctx.content_style?.language?.formality || 'casual')
          setEmojis(ctx.content_style?.language?.emojis ?? true)
          setStorytelling(ctx.content_style?.language?.storytelling || '')
          setTermsToAvoid(ctx.content_style?.language?.termsToAvoid || [])

          // 5. CONTENT PILLARS
          setContentPillars(ctx.content_pillars || [])

          // 6. BUSINESS
          setProducts(ctx.business?.products || [])

          // 7. DNA
          setEnergy(ctx.dna?.energy || '')
          setUniqueVoice(ctx.dna?.uniqueVoice || '')
          setTransformation(ctx.dna?.transformation || '')

          // 8. DOCUMENTS
          setFiles(ctx.files || [])
          setDocuments(ctx.documents || [])
        }
      }
    } catch (error) {
      console.error('Erro ao carregar contexto:', error)
    } finally {
      setLoadingContext(false)
    }
  }

  // Toggle de seções
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Funções auxiliares para arrays
  const addToArray = (arr: string[], setter: (arr: string[]) => void, value: string) => {
    if (value.trim() && !arr.includes(value.trim())) {
      setter([...arr, value.trim()])
    }
  }

  const removeFromArray = (arr: string[], setter: (arr: string[]) => void, value: string) => {
    setter(arr.filter(item => item !== value))
  }

  const addContentPillar = () => {
    if (!pillarNameInput.trim()) return
    const subtopics = pillarSubtopicsInput.split(',').map(s => s.trim()).filter(Boolean)
    setContentPillars([...contentPillars, { name: pillarNameInput.trim(), subtopics }])
    setPillarNameInput('')
    setPillarSubtopicsInput('')
  }

  const removeContentPillar = (index: number) => {
    setContentPillars(contentPillars.filter((_, i) => i !== index))
  }

  const addProduct = () => {
    if (!productNameInput.trim()) return
    setProducts([...products, {
      name: productNameInput.trim(),
      price: productPriceInput.trim(),
      target: productTargetInput.trim(),
      cta: productCtaInput.trim()
    }])
    setProductNameInput('')
    setProductPriceInput('')
    setProductTargetInput('')
    setProductCtaInput('')
  }

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index))
  }

  const handleFileUpload = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(`/api/profiles/${profileId}/context/upload`, {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Erro ao fazer upload')
      }

      const data = await res.json()
      setDocuments([...documents, data.document])

      // Recarregar contexto para pegar raw_text atualizado
      await fetchContext()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileUpload(file)
  }

  const handleRemoveDocument = async (docId: string) => {
    if (!confirm('Remover este documento?')) return

    try {
      const res = await fetch(`/api/profiles/${profileId}/context/documents/${docId}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Erro ao remover documento')

      setDocuments(documents.filter(d => d.id !== docId))
    } catch (error: any) {
      alert(error.message)
    }
  }

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const userProfile: UserProfile = {
        identity: {
          fullName,
          displayName,
          positioning,
          niche,
          toneOfVoice
        },
        credibility: {
          experience,
          achievements,
          expertise
        },
        philosophy: {
          values,
          beliefs,
          defends,
          rejects
        },
        contentStyle: {
          preferredFormats,
          structure,
          language: {
            formality,
            emojis,
            storytelling,
            termsToAvoid
          }
        },
        contentPillars,
        business: {
          products
        },
        dna: {
          energy,
          uniqueVoice,
          transformation
        }
      }

      const res = await fetch(`/api/profiles/${profileId}/context`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userProfile)
      })

      if (!res.ok) throw new Error('Erro ao salvar contexto')

      onSave()
      onClose()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loadingContext) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-3xl">
          <CardContent className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-500" />
            <p className="text-neutral-400">Carregando contexto...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <Card className="w-full">
          <CardHeader className="sticky top-0 bg-neutral-900 z-10 border-b border-neutral-800">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Adicionar Contexto</CardTitle>
                <p className="text-sm text-neutral-400 mt-1">@{username}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 p-6">
            {/* ===== 1. IDENTITY ===== */}
            <div className="border border-neutral-700 rounded-lg">
              <button
                type="button"
                onClick={() => toggleSection('identity')}
                className="w-full flex items-center justify-between p-4 hover:bg-neutral-800/50 transition-colors"
              >
                <h3 className="text-lg font-semibold">1. Identidade</h3>
                {expandedSections.identity ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {expandedSections.identity && (
                <div className="p-4 pt-0 space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nome Completo</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex: Gary Vaynerchuk"
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nome de Exibição</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Ex: GaryVee"
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Posicionamento</label>
                    <textarea
                      value={positioning}
                      onChange={(e) => setPositioning(e.target.value)}
                      placeholder="Ex: Empreendedor serial e especialista em marketing digital"
                      rows={2}
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nichos</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={nicheInput}
                        onChange={(e) => setNicheInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addToArray(niche, setNiche, nicheInput)
                            setNicheInput('')
                          }
                        }}
                        placeholder="Ex: Marketing Digital"
                        className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          addToArray(niche, setNiche, nicheInput)
                          setNicheInput('')
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {niche.map((item) => (
                        <Badge key={item} variant="neutral">
                          {item}
                          <button
                            type="button"
                            onClick={() => removeFromArray(niche, setNiche, item)}
                            className="ml-1 hover:text-red-400"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tom de Voz</label>
                    <input
                      type="text"
                      value={toneOfVoice}
                      onChange={(e) => setToneOfVoice(e.target.value)}
                      placeholder="Ex: Direto, enérgico, motivacional"
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ===== 2. CREDIBILITY ===== */}
            <div className="border border-neutral-700 rounded-lg">
              <button
                type="button"
                onClick={() => toggleSection('credibility')}
                className="w-full flex items-center justify-between p-4 hover:bg-neutral-800/50 transition-colors"
              >
                <h3 className="text-lg font-semibold">2. Credibilidade</h3>
                {expandedSections.credibility ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {expandedSections.credibility && (
                <div className="p-4 pt-0 space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Experiência</label>
                    <textarea
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      placeholder="Ex: 30+ anos em marketing e empreendedorismo"
                      rows={2}
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Conquistas</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={achievementInput}
                        onChange={(e) => setAchievementInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addToArray(achievements, setAchievements, achievementInput)
                            setAchievementInput('')
                          }
                        }}
                        placeholder="Ex: Fundador da VaynerMedia"
                        className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          addToArray(achievements, setAchievements, achievementInput)
                          setAchievementInput('')
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {achievements.map((item, idx) => (
                        <Badge key={idx} variant="success">
                          {item}
                          <button
                            type="button"
                            onClick={() => removeFromArray(achievements, setAchievements, item)}
                            className="ml-1 hover:text-red-400"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Áreas de Expertise</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={expertiseInput}
                        onChange={(e) => setExpertiseInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addToArray(expertise, setExpertise, expertiseInput)
                            setExpertiseInput('')
                          }
                        }}
                        placeholder="Ex: Marketing Digital"
                        className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          addToArray(expertise, setExpertise, expertiseInput)
                          setExpertiseInput('')
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {expertise.map((item, idx) => (
                        <Badge key={idx} variant="neutral">
                          {item}
                          <button
                            type="button"
                            onClick={() => removeFromArray(expertise, setExpertise, item)}
                            className="ml-1 hover:text-red-400"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ===== 3. PHILOSOPHY ===== */}
            <div className="border border-neutral-700 rounded-lg">
              <button
                type="button"
                onClick={() => toggleSection('philosophy')}
                className="w-full flex items-center justify-between p-4 hover:bg-neutral-800/50 transition-colors"
              >
                <h3 className="text-lg font-semibold">3. Filosofia</h3>
                {expandedSections.philosophy ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {expandedSections.philosophy && (
                <div className="p-4 pt-0 space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Valores</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={valueInput}
                        onChange={(e) => setValueInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addToArray(values, setValues, valueInput)
                            setValueInput('')
                          }
                        }}
                        placeholder="Ex: Autenticidade"
                        className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          addToArray(values, setValues, valueInput)
                          setValueInput('')
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {values.map((item, idx) => (
                        <Badge key={idx} variant="primary">
                          {item}
                          <button
                            type="button"
                            onClick={() => removeFromArray(values, setValues, item)}
                            className="ml-1 hover:text-red-400"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Crenças</label>
                    <textarea
                      value={beliefs}
                      onChange={(e) => setBeliefs(e.target.value)}
                      placeholder="Ex: Marketing é sobre contar histórias e agregar valor"
                      rows={2}
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Defende</label>
                    <textarea
                      value={defends}
                      onChange={(e) => setDefends(e.target.value)}
                      placeholder="Ex: Produção massiva de conteúdo e documentação da jornada"
                      rows={2}
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Rejeita</label>
                    <textarea
                      value={rejects}
                      onChange={(e) => setRejects(e.target.value)}
                      placeholder="Ex: Atalhos, fórmulas mágicas, falta de autenticidade"
                      rows={2}
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ===== 4. CONTENT STYLE ===== */}
            <div className="border border-neutral-700 rounded-lg">
              <button
                type="button"
                onClick={() => toggleSection('contentStyle')}
                className="w-full flex items-center justify-between p-4 hover:bg-neutral-800/50 transition-colors"
              >
                <h3 className="text-lg font-semibold">4. Estilo de Conteúdo</h3>
                {expandedSections.contentStyle ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {expandedSections.contentStyle && (
                <div className="p-4 pt-0 space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Formatos Preferidos</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={formatInput}
                        onChange={(e) => setFormatInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addToArray(preferredFormats, setPreferredFormats, formatInput)
                            setFormatInput('')
                          }
                        }}
                        placeholder="Ex: Vídeo curto"
                        className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          addToArray(preferredFormats, setPreferredFormats, formatInput)
                          setFormatInput('')
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {preferredFormats.map((item, idx) => (
                        <Badge key={idx} variant="neutral">
                          {item}
                          <button
                            type="button"
                            onClick={() => removeFromArray(preferredFormats, setPreferredFormats, item)}
                            className="ml-1 hover:text-red-400"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Estrutura</label>
                    <textarea
                      value={structure}
                      onChange={(e) => setStructure(e.target.value)}
                      placeholder="Ex: Hook forte → Contexto → 3-5 pontos práticos → CTA claro"
                      rows={2}
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Formalidade</label>
                    <select
                      value={formality}
                      onChange={(e) => setFormality(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                    >
                      <option value="casual">Casual</option>
                      <option value="formal">Formal</option>
                      <option value="técnico">Técnico</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <input
                        type="checkbox"
                        checked={emojis}
                        onChange={(e) => setEmojis(e.target.checked)}
                        className="w-4 h-4"
                      />
                      Usar emojis
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Storytelling</label>
                    <input
                      type="text"
                      value={storytelling}
                      onChange={(e) => setStorytelling(e.target.value)}
                      placeholder="Ex: Pessoal e vulnerável"
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Termos a Evitar
                      <span className="text-xs text-neutral-400 ml-2">(jargões técnicos, termos em inglês, etc.)</span>
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={termToAvoidInput}
                        onChange={(e) => setTermToAvoidInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addToArray(termsToAvoid, setTermsToAvoid, termToAvoidInput)
                            setTermToAvoidInput('')
                          }
                        }}
                        placeholder="Ex: ROI, funil, CTR, engagement"
                        className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          addToArray(termsToAvoid, setTermsToAvoid, termToAvoidInput)
                          setTermToAvoidInput('')
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {termsToAvoid.map((term, idx) => (
                        <Badge key={idx} variant="error">
                          {term}
                          <button
                            type="button"
                            onClick={() => removeFromArray(termsToAvoid, setTermsToAvoid, term)}
                            className="ml-1 hover:text-red-300"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    {termsToAvoid.length > 0 && (
                      <p className="text-xs text-neutral-500 mt-2 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Estes termos serão evitados na geração de conteúdo
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ===== 5. CONTENT PILLARS ===== */}
            <div className="border border-neutral-700 rounded-lg">
              <button
                type="button"
                onClick={() => toggleSection('contentPillars')}
                className="w-full flex items-center justify-between p-4 hover:bg-neutral-800/50 transition-colors"
              >
                <h3 className="text-lg font-semibold">5. Pilares de Conteúdo</h3>
                {expandedSections.contentPillars ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {expandedSections.contentPillars && (
                <div className="p-4 pt-0 space-y-3">
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={pillarNameInput}
                      onChange={(e) => setPillarNameInput(e.target.value)}
                      placeholder="Nome do Pilar (Ex: Marketing Digital)"
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                    />
                    <input
                      type="text"
                      value={pillarSubtopicsInput}
                      onChange={(e) => setPillarSubtopicsInput(e.target.value)}
                      placeholder="Subtópicos separados por vírgula (Ex: social media, paid ads, organic reach)"
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                    />
                    <Button type="button" size="sm" onClick={addContentPillar}>
                      <Plus className="w-4 h-4 mr-1" /> Adicionar Pilar
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {contentPillars.map((pillar, idx) => (
                      <div key={idx} className="p-3 bg-neutral-800 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">{pillar.name}</h4>
                          <button
                            type="button"
                            onClick={() => removeContentPillar(idx)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {pillar.subtopics.map((sub, subIdx) => (
                            <Badge key={subIdx} variant="neutral" className="text-xs">
                              {sub}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ===== 6. BUSINESS ===== */}
            <div className="border border-neutral-700 rounded-lg">
              <button
                type="button"
                onClick={() => toggleSection('business')}
                className="w-full flex items-center justify-between p-4 hover:bg-neutral-800/50 transition-colors"
              >
                <h3 className="text-lg font-semibold">6. Negócio</h3>
                {expandedSections.business ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {expandedSections.business && (
                <div className="p-4 pt-0 space-y-3">
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={productNameInput}
                      onChange={(e) => setProductNameInput(e.target.value)}
                      placeholder="Nome do Produto"
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                    />
                    <input
                      type="text"
                      value={productPriceInput}
                      onChange={(e) => setProductPriceInput(e.target.value)}
                      placeholder="Preço (Ex: R$ 497)"
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                    />
                    <input
                      type="text"
                      value={productTargetInput}
                      onChange={(e) => setProductTargetInput(e.target.value)}
                      placeholder="Público-alvo (Ex: Empreendedores iniciantes)"
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                    />
                    <input
                      type="text"
                      value={productCtaInput}
                      onChange={(e) => setProductCtaInput(e.target.value)}
                      placeholder="CTA (Ex: Link na bio)"
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                    />
                    <Button type="button" size="sm" onClick={addProduct}>
                      <Plus className="w-4 h-4 mr-1" /> Adicionar Produto
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {products.map((product, idx) => (
                      <div key={idx} className="p-3 bg-neutral-800 rounded-lg">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <h4 className="font-semibold">{product.name}</h4>
                            <p className="text-sm text-neutral-400">{product.price}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeProduct(idx)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-neutral-400">Público: {product.target}</p>
                        <p className="text-xs text-neutral-400">CTA: {product.cta}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ===== 7. DNA ===== */}
            <div className="border border-neutral-700 rounded-lg">
              <button
                type="button"
                onClick={() => toggleSection('dna')}
                className="w-full flex items-center justify-between p-4 hover:bg-neutral-800/50 transition-colors"
              >
                <h3 className="text-lg font-semibold">7. DNA</h3>
                {expandedSections.dna ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {expandedSections.dna && (
                <div className="p-4 pt-0 space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Energia</label>
                    <textarea
                      value={energy}
                      onChange={(e) => setEnergy(e.target.value)}
                      placeholder="Ex: Alta energia, movimento constante, senso de urgência"
                      rows={2}
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Voz Única</label>
                    <textarea
                      value={uniqueVoice}
                      onChange={(e) => setUniqueVoice(e.target.value)}
                      placeholder="Ex: Xinga, fala rápido, usa muitas metáforas de esportes"
                      rows={2}
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Transformação</label>
                    <textarea
                      value={transformation}
                      onChange={(e) => setTransformation(e.target.value)}
                      placeholder="Ex: De 'travado sem saber o que postar' para 'máquina de conteúdo'"
                      rows={2}
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ===== 8. DOCUMENTS ===== */}
            <div className="border border-neutral-700 rounded-lg">
              <button
                type="button"
                onClick={() => toggleSection('documents')}
                className="w-full flex items-center justify-between p-4 hover:bg-neutral-800/50 transition-colors"
              >
                <h3 className="text-lg font-semibold">8. Documentos</h3>
                {expandedSections.documents ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {expandedSections.documents && (
                <div className="p-4 pt-0 space-y-3">
          <div>
            <label className="block text-sm font-medium mb-2">
              Documentos (PDF, DOCX, TXT, MD)
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragging
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-neutral-700'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
              <p className="text-sm text-neutral-400 mb-1">
                {isDragging ? 'Solte o arquivo aqui' : 'Arraste arquivos ou clique para escolher'}
              </p>
              <p className="text-xs text-neutral-500 mb-3">
                Briefings, ebooks, materiais de referência
              </p>
              <input
                type="file"
                id="file-upload"
                accept=".pdf,.txt,.md,.doc,.docx"
                onChange={handleFileInput}
                disabled={uploading}
                className="hidden"
              />
              <label htmlFor="file-upload" className="inline-block">
                <span className="inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all cursor-pointer bg-neutral-800 text-neutral-50 border border-neutral-600 hover:bg-neutral-700 h-8 px-3 text-xs disabled:pointer-events-none disabled:opacity-50">
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Extraindo texto...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Escolher Arquivo
                    </>
                  )}
                </span>
              </label>
              <p className="text-xs text-neutral-500 mt-2">
                Max 10MB • Texto será extraído automaticamente
              </p>
            </div>

            {/* Lista de Documentos */}
            {documents.length > 0 && (
              <div className="mt-4 space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <FileText className="w-5 h-5 text-primary-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.filename}</p>
                        <p className="text-xs text-neutral-400">
                          {(doc.size / 1024).toFixed(1)} KB • {doc.extracted_text_length || 0} caracteres extraídos
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDocument(doc.id)}
                      title="Remover documento"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
                </div>
              )}
            </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 sticky bottom-0 bg-neutral-900 pb-6 -mb-6 border-t border-neutral-800 mt-6 pt-6">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Salvar Contexto
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  )
}
