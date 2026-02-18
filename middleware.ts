import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rotas de login são sempre públicas — sem redirect no middleware
  if (pathname.startsWith('/login')) {
    return NextResponse.next()
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

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/((?!queue).*)',
  ],
}
