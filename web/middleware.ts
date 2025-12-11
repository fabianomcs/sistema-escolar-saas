import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Configuração inicial da resposta
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Cria o cliente Supabase para ler a sessão (SSR)
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

  // 4. Definição de Rotas
  const path = request.nextUrl.pathname
  
  // Lista de Rotas Públicas (Portal Institucional + Login + Assets)
  const isPublicRoute = 
    path === '/' || 
    path === '/login' || 
    path === '/sobre' || 
    path === '/contato' || 
    path === '/pedagogico' || 
    path === '/galeria' || 
    path === '/blog' || 
    path.startsWith('/blog/') ||
    path === '/politica-privacidade' || 
    path === '/termos-uso' || 
    path === '/auth/callback' || 
    path.startsWith('/_next') || 
    path.startsWith('/static') || 
    path.startsWith('/api') || // Webhooks (Asaas) e APIs públicas
    path.includes('.') // Arquivos estáticos (imagens, css, favicon)

  const isLoginPage = path === '/login'

  // --- REGRAS DE REDIRECIONAMENTO ---

  // CENÁRIO A: Usuário NÃO logado tentando acessar área privada (Sistema)
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // CENÁRIO B: Usuário JÁ LOGADO tentando acessar o Login
  if (user && isLoginPage) {
    // Verifica o perfil para redirecionar para o lugar certo
    const { data: profile } = await supabase
      .from('users_profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    const role = profile?.role || 'responsavel'
    const url = request.nextUrl.clone()

    if (role === 'responsavel') {
      url.pathname = '/portal/home'
    } else {
      // Admin ou Secretaria vai para o Dashboard do Sistema
      url.pathname = '/dashboard' 
    }
    
    return NextResponse.redirect(url)
  }

  // CENÁRIO C: Proteção de Rotas por Perfil (RBAC)
  if (user && !isPublicRoute) {
    const { data: profile } = await supabase
      .from('users_profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    const userRole = profile?.role || 'responsavel'
    const isPortalRoute = path.startsWith('/portal')

    // Responsável tentando acessar área Administrativa -> Redireciona para o Portal
    if (userRole === 'responsavel' && !isPortalRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/portal/home'
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: [
    // Aplica o middleware em todas as rotas, exceto arquivos estáticos nativos do Next
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}