import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Configuração inicial da resposta
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Cria o cliente Supabase (Versão Atualizada com getAll/setAll)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
          
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // 3. Verifica a sessão do usuário
  const { data: { user } } = await supabase.auth.getUser()

  // Definição das Rotas
  const path = request.nextUrl.pathname
  const isLoginPage = path === '/login'
  // Rotas públicas que não precisam de login
  const isPublicRoute = path === '/auth/callback' || 
                        path.startsWith('/_next') || 
                        path.startsWith('/static') || 
                        path.includes('.')

  // CENÁRIO A: Usuário NÃO logado tenta acessar área privada
  if (!user && !isLoginPage && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // CENÁRIO B: Usuário LOGADO tenta acessar login
  if (user && isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // CENÁRIO C: Verificação de Role (Segurança Admin vs Portal)
  if (user && !isPublicRoute) {
    const { data: profile } = await supabase
      .from('users_profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    const userRole = profile?.role || 'responsavel'
    const isPortalRoute = path.startsWith('/portal')

    // Responsável tentando acessar Admin -> Manda pro Portal
    if (userRole === 'responsavel' && !isPortalRoute && path !== '/') {
      const url = request.nextUrl.clone()
      url.pathname = '/portal/home'
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}