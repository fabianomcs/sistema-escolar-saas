'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import { useRouter } from 'next/navigation' // <--- IMPORTANTE
import { 
  Search, Plus, GraduationCap, Calendar, 
  User, ChevronRight, AlertCircle 
} from 'lucide-react'
import { AlunoCompleto } from '@/types/app.types'

// ... (Mantenha as funções StudentAvatar e StatCard iguais) ...
function StudentAvatar({ name }: { name: string }) {
  const initials = name ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'AL'
  const colors = ['bg-indigo-100 text-indigo-700', 'bg-pink-100 text-pink-700', 'bg-cyan-100 text-cyan-700', 'bg-orange-100 text-orange-700']
  const colorIndex = (name?.length || 0) % colors.length
  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${colors[colorIndex]}`}>
      {initials}
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }: any) {
  const styles: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  }
  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border ${styles[color]}`}>
      <div className="p-3 bg-white rounded-lg shadow-sm bg-opacity-60"><Icon size={20} /></div>
      <div>
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p className="text-xs font-medium opacity-80 uppercase tracking-wide mt-1">{label}</p>
      </div>
    </div>
  )
}
// ... (Fim dos componentes auxiliares) ...

export default function AlunosPage() {
  const router = useRouter() // <--- INICIALIZAR O ROUTER
  const [alunos, setAlunos] = useState<AlunoCompleto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativos' | 'inativos'>('ativos')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function fetchAlunos() {
      setLoading(true)
      const { data, error } = await supabase
        .from('alunos')
        .select(`*, turmas (nome, turno)`)
        .order('nome_completo')
      
      if (!error && data) setAlunos(data as any)
      setLoading(false)
    }
    fetchAlunos()
  }, [])

  const filteredAlunos = alunos.filter(aluno => {
    const matchesSearch = aluno.nome_completo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'todos' 
      ? true 
      : statusFilter === 'ativos' ? aluno.ativo : !aluno.ativo
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: alunos.length,
    ativos: alunos.filter(a => a.ativo).length,
    manha: alunos.filter(a => a.turmas?.turno === 'Manhã').length,
    tarde: alunos.filter(a => a.turmas?.turno === 'Tarde').length
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Alunos</h1>
          <p className="text-gray-500">Gerencie matrículas, turmas e dados acadêmicos.</p>
        </div>
        <Link href="/alunos/novo">
          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all shadow-lg shadow-blue-200">
            <Plus size={18} /> Novo Aluno
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Matrículas" value={stats.total} icon={GraduationCap} color="blue" />
        <StatCard label="Alunos Ativos" value={stats.ativos} icon={User} color="green" />
        <StatCard label="Turno Manhã" value={stats.manha} icon={Calendar} color="orange" />
        <StatCard label="Turno Tarde" value={stats.tarde} icon={Calendar} color="purple" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 bg-gray-50/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar aluno..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setStatusFilter('ativos')}
              className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors ${statusFilter === 'ativos' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              Ativos
            </button>
            <button 
              onClick={() => setStatusFilter('todos')}
              className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors ${statusFilter === 'todos' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              Todos
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/80 text-gray-500 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">Nome do Aluno</th>
                <th className="px-6 py-4">Turma / Turno</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i}><td className="px-6 py-4" colSpan={4}><div className="h-10 bg-gray-100 rounded animate-pulse"/></td></tr>
                ))
              ) : filteredAlunos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-400">
                    <AlertCircle size={32} className="mx-auto mb-2 opacity-20"/>
                    Nenhum aluno encontrado.
                  </td>
                </tr>
              ) : (
                filteredAlunos.map(aluno => (
                  <tr 
                    key={aluno.id} 
                    onClick={() => router.push(`/alunos/${aluno.id}`)} // <--- AQUI ESTÁ A CORREÇÃO
                    className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <StudentAvatar name={aluno.nome_completo} />
                        <div>
                          <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{aluno.nome_completo}</div>
                          <div className="text-gray-500 text-xs font-mono">Matrícula: {aluno.matricula_escolar || '---'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {aluno.turmas ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-700">{aluno.turmas.nome}</span>
                          <span className="text-xs text-gray-400">{aluno.turmas.turno}</span>
                        </div>
                      ) : <span className="text-gray-400 italic">Sem turma</span>}
                    </td>
                    <td className="px-6 py-4">
                      {aluno.ativo ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                           Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                           Inativo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-block">
                        <ChevronRight size={20} />
                      </div>
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