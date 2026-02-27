import { NextRequest, NextResponse } from 'next/server'

/**
 * Safe API Handler Wrapper
 *
 * Garante que a API SEMPRE retorna JSON, mesmo em crashes inesperados.
 * Captura erros não tratados e formata resposta consistente.
 *
 * @example
 * export const POST = safeApiHandler(async (request) => {
 *   // seu código aqui
 *   return NextResponse.json({ success: true })
 * })
 */
export function safeApiHandler(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      console.log(`📥 [SafeAPI] ${request.method} ${request.url}`)
      const response = await handler(request, context)
      console.log(`📤 [SafeAPI] Response status: ${response.status}`)
      return response
    } catch (error: unknown) {
      // Erro não capturado pelo handler - último recurso
      console.error('❌ [SafeAPI] UNCAUGHT ERROR:', error)
      console.error('❌ [SafeAPI] Stack:', error instanceof Error ? error.stack : 'N/A')
      console.error('❌ [SafeAPI] Type:', typeof error)
      console.error('❌ [SafeAPI] Constructor:', error?.constructor?.name)

      // Extrair mensagem de erro
      let errorMessage = 'Unknown error occurred'
      let errorDetails: Record<string, any> = {}

      if (error instanceof Error) {
        errorMessage = error.message
        errorDetails = {
          name: error.name,
          stack: error.stack?.split('\n').slice(0, 5), // Primeiras 5 linhas do stack
        }
      } else if (typeof error === 'string') {
        errorMessage = error
      } else if (error && typeof error === 'object') {
        errorMessage = JSON.stringify(error)
        errorDetails = { rawError: error }
      }

      // GARANTIR resposta JSON
      return NextResponse.json(
        {
          error: errorMessage,
          details: errorDetails,
          timestamp: new Date().toISOString(),
          endpoint: request.url,
          method: request.method,
          safeHandler: true, // Flag para identificar que passou pelo safe handler
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Error Response Helper
 * Cria resposta de erro padronizada em JSON
 */
export function errorResponse(
  message: string,
  status: number = 500,
  details?: Record<string, any>
) {
  return NextResponse.json(
    {
      error: message,
      details,
      timestamp: new Date().toISOString(),
    },
    { status }
  )
}
