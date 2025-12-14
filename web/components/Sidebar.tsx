'use client'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr' // Usar a lib correta para client side
import Link from 'next/link'
import { LayoutDashboard, Users, Wallet, Settings, GraduationCap, LogOut, School } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner' // Opcional: Feedback visual

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [escola, setEscola] = useState<any>(null)

  // Criar cliente Supabase
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function carregarEscola() {
      const { data } = await supabase.from('escolas').select('*').limit(1).single()
      setEscola(data)
    }
    carregarEscola()
  }, [])

  // --- FUNÇÃO DE LOGOUT ---
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Erro ao sair:', error)
      toast.error('Erro ao encerrar sessão')
    } else {
      // Limpa cookies e redireciona
      router.push('/login')
      router.refresh() 
      toast.success('Sessão encerrada com sucesso')
    }
  }

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`)

  const menuClass = (path: string) => `flex items-center px-6 py-3 transition-colors ${
    isActive(path) 
      ? 'bg-slate-800 border-r-4 border-blue-500 text-blue-400 font-medium' 
      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
  }`

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20 h-screen fixed left-0 top-0 overflow-y-auto">
      
      {/* LOGO */}
      <div className="h-24 flex items-center justify-center px-4 border-b border-slate-800">
        {escola?.logo_url ? (
          <img 
            src={escola.logo_url} 
            alt="Logo" 
            className="max-h-16 max-w-full object-contain"
          />
        ) : (
          <div className="font-bold text-xl tracking-tight text-center">
            {escola?.nome_fantasia || (
              <>Escola<span className="text-blue-400">Fácil</span></>
            )}
          </div>
        )}
      </div>

      {/* MENU */}
      <nav className="flex-1 py-6 space-y-1">
        {/* CORREÇÃO: Link agora aponta para /dashboard, não / */}
        <Link href="/dashboard" className={menuClass('/dashboard')}>
          <LayoutDashboard size={20} className="mr-3" /> Dashboard
        </Link>
        
        <Link href="/alunos" className={menuClass('/alunos')}>
          <GraduationCap size={20} className="mr-3" /> Alunos
        </Link>

        <Link href="/turmas" className={menuClass('/turmas')}>
          <School size={20} className="mr-3" /> Turmas
        </Link>

        <Link href="/financeiro" className={menuClass('/financeiro')}>
          <Wallet size={20} className="mr-3" /> Financeiro
        </Link>

        <Link href="/responsaveis" className={menuClass('/responsaveis')}>
          <Users size={20} className="mr-3" /> Responsáveis
        </Link>

        <Link href="/configuracoes" className={menuClass('/configuracoes')}>
          <Settings size={20} className="mr-3" /> Configurações
        </Link>
      </nav>

      {/* RODAPÉ DO MENU COM LOGOUT ATIVO */}
      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
        >
          <LogOut size={16} className="mr-3" />
          Sair do Sistema
        </button>
      </div>
    </aside>
  )
}