'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { 
  Users, RefreshCw, Search, Shield, Briefcase, User, 
  Filter, XCircle, CheckCircle2, AlertCircle 
} from 'lucide-react'
import { toast } from 'sonner'

// --- COMPONENTES VISUAIS PEQUENOS (UI KITS) ---

// 1. Avatar com Iniciais
function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  // Cores aleatórias consistentes baseadas no tamanho do nome
  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-purple-100 text-purple-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-pink-100 text-pink-700',
  ]
  const colorIndex = name.length % colors.length

  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${colors[colorIndex]}`}>
      {initials}
    </div>
  )
}

// 2. Badge de Estatística
function StatCard({ label, value, icon: Icon, color }: any) {
  const colorClasses: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    green: "bg-green-50 text-green-600 border-green-100",
    gray: "bg-gray-50 text-gray-600 border-gray-100",
  }
  
  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border ${colorClasses[color]}`}>
      <div className="p-3 bg-white rounded-lg shadow-sm bg-opacity-60">
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p className="text-xs font-medium opacity-80 uppercase tracking-wide mt-1">{label}</p>
      </div>
    </div>
  )
}

// --- PÁGINA PRINCIPAL ---

type UserProfile = {
  id: string
  nome_completo: string
  email: string
  roles: string[]
}

export default function GestaoUsuariosPage() {
  const [loadingSync, setLoadingSync] = useState(false)
  const [loadingList, setLoadingList] = useState(true)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'secretaria' | 'responsavel'>('all')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoadingList(true)
    const { data } = await supabase
      .from('users_profiles')
      .select('id, nome_completo, email, roles')
      .order('nome_completo')
    
    if (data) {
      const formatted = data.map((u: any) => ({
        ...u,
        roles: Array.isArray(u.roles) ? u.roles : []
      }))
      setUsers(formatted)
    }
    setLoadingList(false)
  }

  async function handleSync() {
    if (!confirm('Gerar logins para TODOS os responsáveis sem acesso?')) return
    setLoadingSync(true)
    try {
      const response = await fetch('/api/admin/sync-users', { method: 'POST' })
      const data = await response.json()
      if (data.success) {
        toast.success(`Sincronização concluída!`, {
          description: `${data.stats.criados} novos acessos criados.`
        })
        fetchUsers()
      } else {
        toast.error('Erro: ' + data.error)
      }
    } catch (err) {
      toast.error('Erro de comunicação')
    } finally {
      setLoadingSync(false)
    }
  }

  async function toggleRole(userId: string, roleToToggle: string, currentRoles: string[]) {
    const hasRole = currentRoles.includes(roleToToggle)
    let newRoles: string[] = hasRole 
      ? currentRoles.filter(r => r !== roleToToggle) 
      : [...currentRoles, roleToToggle]

    // Otimistic UI Update
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, roles: newRoles } : u))

    try {
      const response = await fetch('/api/admin/update-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, roles: newRoles })
      })
      if (!response.ok) throw new Error()
      toast.success('Permissão atualizada')
    } catch (error) {
      toast.error('Erro ao salvar')
      fetchUsers() // Reverte
    }
  }

  // Lógica de Filtragem Avançada
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === 'all' || user.roles.includes(roleFilter)

    return matchesSearch && matchesRole
  })

  // Cálculos para os Cards
  const stats = {
    total: users.length,
    admins: users.filter(u => u.roles.includes('admin')).length,
    secretaria: users.filter(u => u.roles.includes('secretaria')).length,
    pais: users.filter(u => u.roles.includes('responsavel')).length
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* 1. HEADER COM DASHBOARD */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Gestão de Acessos</h1>
          <p className="text-gray-500">Controle quem entra e o que pode fazer.</p>
        </div>
        
        <button
          onClick={handleSync}
          disabled={loadingSync}
          className="group relative inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-gray-200 disabled:opacity-70"
        >
          {loadingSync ? <RefreshCw className="animate-spin" size={16}/> : <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500"/>}
          <span>Sincronizar Logins (CPFs)</span>
        </button>
      </div>

      {/* 2. CARDS DE ESTATÍSTICA (Contexto Imediato) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Usuários" value={stats.total} icon={Users} color="gray" />
        <StatCard label="Admins / Diretores" value={stats.admins} icon={Shield} color="purple" />
        <StatCard label="Secretaria" value={stats.secretaria} icon={Briefcase} color="blue" />
        <StatCard label="Pais / Alunos" value={stats.pais} icon={User} color="green" />
      </div>

      {/* 3. LISTA DE USUÁRIOS (Corpo Principal) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        
        {/* Barra de Ferramentas da Tabela */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 bg-gray-50/50">
          
          {/* Busca */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome, email ou CPF..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all text-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtro de Cargo (Dropdown Visual) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
            <Filter size={16} className="text-gray-400 mr-2 flex-shrink-0"/>
            
            {[
              { id: 'all', label: 'Todos' },
              { id: 'admin', label: 'Admin' },
              { id: 'secretaria', label: 'Secretaria' },
              { id: 'responsavel', label: 'Pais' },
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setRoleFilter(filter.id as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                  roleFilter === filter.id 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabela de Dados */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/80 text-gray-500 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">Usuário</th>
                <th className="px-6 py-4 text-center w-32">Diretoria</th>
                <th className="px-6 py-4 text-center w-32">Secretaria</th>
                <th className="px-6 py-4 text-center w-32">Portal Pais</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loadingList ? (
                // Skeleton Loading (UX melhor que "carregando")
                [1,2,3].map(i => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-10 bg-gray-100 rounded-lg animate-pulse w-48"></div></td>
                    <td colSpan={4}></td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 flex flex-col items-center">
                    <AlertCircle size={32} className="mb-2 opacity-20"/>
                    <p>Nenhum usuário encontrado com os filtros atuais.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-blue-50/30 transition-colors group">
                    
                    {/* INFO USUÁRIO */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <UserAvatar name={user.nome_completo || 'U'} />
                        <div>
                          <div className="font-bold text-gray-900">{user.nome_completo}</div>
                          <div className="text-gray-500 text-xs font-mono">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* CONTROLES DE PERMISSÃO (TOGGLES VISUAIS) */}
                    <RoleToggle 
                      active={user.roles.includes('admin')} 
                      onClick={() => toggleRole(user.id, 'admin', user.roles)}
                      color="purple"
                      icon={Shield}
                    />
                    <RoleToggle 
                      active={user.roles.includes('secretaria')} 
                      onClick={() => toggleRole(user.id, 'secretaria', user.roles)}
                      color="blue"
                      icon={Briefcase}
                    />
                    <RoleToggle 
                      active={user.roles.includes('responsavel')} 
                      onClick={() => toggleRole(user.id, 'responsavel', user.roles)}
                      color="green"
                      icon={User}
                    />

                    {/* STATUS (Apenas Informativo) */}
                    <td className="px-6 py-4 text-right">
                       <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                         <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                         Ativo
                       </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Componente Auxiliar de Toggle (Botão de Permissão)
function RoleToggle({ active, onClick, color, icon: Icon }: any) {
  const styles: any = {
    purple: active ? 'bg-purple-100 text-purple-700 border-purple-200 ring-purple-200' : 'text-gray-300 hover:text-purple-400 hover:bg-purple-50',
    blue: active ? 'bg-blue-100 text-blue-700 border-blue-200 ring-blue-200' : 'text-gray-300 hover:text-blue-400 hover:bg-blue-50',
    green: active ? 'bg-green-100 text-green-700 border-green-200 ring-green-200' : 'text-gray-300 hover:text-green-400 hover:bg-green-50',
  }

  return (
    <td className="px-6 py-4 text-center">
      <button 
        onClick={onClick}
        className={`
          w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 border border-transparent
          ${styles[color]}
          ${active ? 'ring-2 ring-offset-2 scale-105 shadow-sm' : 'hover:scale-110'}
        `}
      >
        <Icon size={18} strokeWidth={active ? 2.5 : 2} />
      </button>
    </td>
  )
}