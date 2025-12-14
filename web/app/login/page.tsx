'use client'
import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import { SiteHeader } from '@/components/public/SiteHeader'
import { SiteFooter } from '@/components/public/SiteFooter'

export default function LoginPage() {
  const [loginIdentifier, setLoginIdentifier] = useState('') // Aceita CPF ou Email
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Remove caracteres não numéricos
  const cleanCPF = (value: string) => value.replace(/\D/g, '')

  // Validação básica de formato CPF
  const isCPFFormat = (value: string) => {
    const numbers = cleanCPF(value)
    return numbers.length === 11
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    let emailToUse = loginIdentifier.trim()
    const isCPF = isCPFFormat(loginIdentifier)

    // --- LÓGICA DE LEGADO (LOGIN POR CPF) ---
    if (isCPF) {
      const cpfNumbers = cleanCPF(loginIdentifier)
      // Transformamos o CPF em um e-mail técnico interno para o Supabase
      // Isso permite que o pai use o CPF no input, mas o Supabase receba um email
      emailToUse = `${cpfNumbers}@escolafacil.system` 
      
      // NOTA IMPORTANTE:
      // Para isso funcionar, os usuários PRECISAM ter sido criados no Supabase Auth com esse e-mail.
      // Se eles só existem no banco de dados (tabela responsaveis) mas não no Auth, o login falhará.
      // Nesse caso, precisaríamos de uma "Edge Function" para migrar o usuário na hora (Lazy Migration),
      // mas por segurança, o ideal é rodar um script de migração no backend.
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password,
    })

    if (error) {
      // Feedback inteligente
      if (isCPF && error.message.includes('Invalid login credentials')) {
        toast.error('Acesso não encontrado ou senha incorreta', {
          description: 'Se for seu primeiro acesso, use a senha padrão: PrimeiroNome@Ultimos4DigitosCPF (Ex: Joao@1234)'
        })
      } else {
        toast.error('Erro ao acessar', {
          description: 'Verifique suas credenciais e tente novamente.'
        })
      }
      setLoading(false)
      return
    }

    // --- REDIRECIONAMENTO INTELIGENTE ---
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: profile } = await supabase
        .from('users_profiles')
        .select('roles')
        .eq('id', user.id)
        .single()
      
      const roles = profile?.roles || []
      
      toast.success('Login realizado com sucesso!')
      
      if (roles.includes('admin') || roles.includes('secretaria')) {
        router.push('/dashboard')
      } else {
        router.push('/portal/home')
      }
      
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Acesse sua conta</h2>
            <p className="mt-2 text-sm text-gray-600">
              Pais: Utilize seu CPF (apenas números) e senha padrão.
            </p>
          </div>

          <div className="bg-white py-8 px-4 shadow-xl border border-gray-100 sm:rounded-xl sm:px-10">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  E-mail ou CPF
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={e => setLoginIdentifier(e.target.value)}
                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Digite seu e-mail ou CPF"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Lembrar de mim
                  </label>
                </div>
                
                <div className="text-sm">
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                    Esqueceu a senha?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-all disabled:opacity-70"
                >
                  {loading ? 'Acessando...' : 'Entrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}