import { NextRequest, NextResponse } from 'next/server'
// import { createServerClient } from '@supabase/ssr'

/**
 * AUTENTICAÇÃO DESABILITADA (2026-02-27)
 *
 * Todas as rotas são públicas para facilitar desenvolvimento/testes.
 * Para reativar autenticação, descomente o código abaixo.
 */
export async function middleware(request: NextRequest) {
  // Permitir acesso a todas as rotas sem autenticação
  const response = NextResponse.next()

  // Headers para identificar versão sem auth e forçar revalidação
  response.headers.set('X-Auth-Disabled', 'true')
  response.headers.set('X-Auth-Disabled-Date', '2026-02-27')

  return response

  /* CÓDIGO DE AUTENTICAÇÃO DESABILITADO - DESCOMENTE PARA REATIVAR
  const { pathname } = request.nextUrl

  // Rotas públicas — sem redirect no middleware
  if (pathname.startsWith('/login') || pathname.startsWith('/api/templates-pro')) {
    return NextResponse.next()
  }

  // Dashboard templatesPro é público — sinalizar para o layout não exigir auth
  if (pathname.startsWith('/dashboard/templatesPro')) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-public-route', 'true')
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  // Para rotas protegidas (/dashboard/* e /api/*), verificar autenticação
  const response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL)!,
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY)!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Verificar autenticação
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
  */
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/((?!queue).*)',
  ],
}
