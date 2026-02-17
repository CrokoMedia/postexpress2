'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/atoms/dialog'
import { Button } from '@/components/atoms/button'
import { Badge } from '@/components/atoms/badge'
import { toast } from 'sonner'
import { Sparkles, Send, Loader2, User, Bot, Copy, Check, Plus } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ContentSquadChatModalProps {
  profileId: string
  username: string
  latestAudit: any
  isOpen: boolean
  onClose: () => void
}

export function ContentSquadChatModal({
  profileId,
  username,
  latestAudit,
  isOpen,
  onClose
}: ContentSquadChatModalProps) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [savingIndex, setSavingIndex] = useState<number | null>(null)
  const [savedIndex, setSavedIndex] = useState<number | null>(null)

  const handleCopy = async (content: string, index: number) => {
    await navigator.clipboard.writeText(content)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleSaveToContent = async (content: string, index: number) => {
    if (!latestAudit?.id) {
      toast.error('Nenhuma auditoria encontrada para salvar o conteúdo')
      return
    }

    setSavingIndex(index)
    try {
      const response = await fetch(`/api/profiles/${profileId}/save-to-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_content: content,
          audit_id: latestAudit.id
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar conteúdo')
      }

      setSavedIndex(index)
      setTimeout(() => setSavedIndex(null), 3000)

      toast.success(`Carrossel "${data.carousel_titulo}" adicionado!`, {
        action: {
          label: 'Ver Conteúdos',
          onClick: () => {
            onClose()
            router.push(`/dashboard/audits/${latestAudit.id}/create-content`)
          }
        },
        duration: 6000
      })
    } catch (error: any) {
      console.error('Erro ao salvar conteúdo:', error)
      toast.error(error.message || 'Erro ao adicionar aos conteúdos')
    } finally {
      setSavingIndex(null)
    }
  }
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll para última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Mensagem inicial ao abrir o modal
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        role: 'assistant',
        content: `Olá! 👋 Sou o Content Squad, formado por 5 mentes especializadas em criar conteúdo de alta conversão para Instagram.

**Contexto do seu perfil @${username}:**
• Score Geral: ${latestAudit.score_overall}/100
• Seguidores: ${latestAudit.snapshot_followers?.toLocaleString() || 'N/A'}
• Engagement: ${latestAudit.engagement_rate?.toFixed(2) || 'N/A'}%
• Posts Analisados: ${latestAudit.posts_analyzed || 0}

**Como posso ajudar?**
- Sugerir temas de carrosséis
- Criar hooks irresistíveis
- Otimizar CTAs e captions
- Estratégias baseadas na sua auditoria

Digite sua solicitação ou pergunta! 🚀`
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen])

  // Auto-focus no textarea quando abrir
  useEffect(() => {
    if (isOpen) {
      textareaRef.current?.focus()
    }
  }, [isOpen])

  // Limpar histórico ao fechar
  const handleClose = () => {
    setMessages([])
    setInput('')
    onClose()
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()

    const trimmedInput = input.trim()
    if (!trimmedInput || loading) return

    // Validar tamanho
    if (trimmedInput.length > 2000) {
      toast.error('Mensagem muito longa (máximo 2000 caracteres)')
      return
    }

    // Adicionar mensagem do usuário
    const userMessage: Message = { role: 'user', content: trimmedInput }
    setMessages(prev => [...prev, userMessage])
    setInput('')

    setLoading(true)

    try {
      const response = await fetch(`/api/profiles/${profileId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmedInput,
          conversation_history: messages
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao enviar mensagem')
      }

      const data = await response.json()

      // Adicionar resposta do assistant
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response
      }
      setMessages(prev => [...prev, assistantMessage])

    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error)
      toast.error(error.message || 'Erro ao comunicar com Content Squad')

      // Adicionar mensagem de erro
      const errorMessage: Message = {
        role: 'assistant',
        content: '❌ Desculpe, ocorreu um erro. Por favor, tente novamente.'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  // Permitir Enter para enviar, Shift+Enter para nova linha
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-neutral-800 shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-500" />
            Conversar com Content Squad
          </DialogTitle>
          <DialogDescription>
            Chat conversacional com 5 especialistas em criação de conteúdo
          </DialogDescription>
        </DialogHeader>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="shrink-0 w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary-500" />
                </div>
              )}

              <div className="max-w-[75%] flex flex-col gap-1">
                <div
                  className={`rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-primary-500 text-white'
                      : 'bg-neutral-800 text-neutral-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                    {message.content}
                  </div>
                </div>

                {message.role === 'assistant' && (
                  <div className="self-start flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(message.content, index)}
                      className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-300 transition-colors px-1 py-0.5"
                      title="Copiar resposta"
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-400" />
                          <span className="text-green-400">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>

                    {/* Botão só aparece nas respostas geradas (não na mensagem de boas-vindas) */}
                    {index > 0 && (
                      <button
                        onClick={() => handleSaveToContent(message.content, index)}
                        disabled={savingIndex === index}
                        className="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 transition-colors px-1 py-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Adicionar este conteúdo à fila de aprovação"
                      >
                        {savingIndex === index ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Salvando...</span>
                          </>
                        ) : savedIndex === index ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-green-400" />
                            <span className="text-green-400">Adicionado!</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Adicionar aos Conteúdos</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {message.role === 'user' && (
                <div className="shrink-0 w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center">
                  <User className="w-5 h-5 text-neutral-300" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="shrink-0 w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-500" />
              </div>
              <div className="bg-neutral-800 rounded-lg p-4">
                <div className="flex items-center gap-2 text-neutral-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Content Squad está digitando...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="border-t border-neutral-800 p-4 shrink-0">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua mensagem... (Enter para enviar, Shift+Enter para nova linha)"
                maxLength={2000}
                rows={3}
                disabled={loading}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="absolute bottom-2 right-2 text-xs text-neutral-500 font-mono">
                {input.length}/2000
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={!input.trim() || loading}
              className="flex items-center gap-2 h-[76px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar
                </>
              )}
            </Button>
          </div>

          {/* Info */}
          <div className="mt-2 flex justify-between items-center text-xs text-neutral-500">
            <span>💡 Dica: Seja específico para obter melhores sugestões</span>
            <span>{messages.filter(m => m.role === 'user').length} mensagens enviadas</span>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
