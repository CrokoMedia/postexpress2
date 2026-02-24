'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

/**
 * Error Boundary para o componente ScheduledContentList
 * Garante que erros no componente não quebrem a página inteira
 */
export class SafeScheduledListWrapper extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.warn('⚠️ Erro no componente de agendamentos (não crítico):', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // Renderizar nada se houver erro (componente silenciosamente desabilitado)
      return null
    }

    return this.props.children
  }
}
