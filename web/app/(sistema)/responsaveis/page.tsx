'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import { useRouter } from 'next/navigation' // <--- IMPORTADO
import { 
  Search, Plus, Users, Smartphone, Mail, ChevronRight, 
  AlertCircle, ShieldCheck 
} from 'lucide-react'
import { Responsavel } from '@/types/app.types'

// ... (Mantenha as funções ParentAvatar e StatCard iguais) ...
function ParentAvatar({ name }: { name: string }) {
  const initials = name ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'RP'
  const colors = ['bg-emerald-100 text-emerald-700', 'bg-slate-100 text-slate-700', 'bg-rose-100 text-rose-700', 'bg-amber-100 text-amber-700']
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
    gray: "bg-gray-50 text-gray-600 border-gray-100",
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
// ... (Fim dos componentes) ...

export default function ResponsaveisPage() {
  const router = useRouter() // <--- INICIALIZADO
  const [pais, setPais] = useState<Responsavel[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function fetchPais() {
      setLoading(true)
      const { data, error } = await supabase
        .from('responsaveis')
        .select('*')
        .order('nome_completo')
      
      if (!error && data) setPais(data)
      setLoading(false)
    }
    fetchPais()
  }, [])

  const filteredPais = pais.filter(pai => 
    pai.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pai.cpf?.includes(searchTerm) ||
    pai.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: pais.length,
    comEmail: pais.filter(p => p.email).length,
    comCelular: pais.filter(p => p.telefone_celular).length
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Responsáveis</h1>
          <p className="text-gray-500">Gestão de pais e responsáveis financeiros.</p>
        </div>
        <Link href="/responsaveis/novo">
          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all shadow-lg shadow-blue-200">
            <Plus size={18} /> Cadastrar Pai/Mãe
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Cadastrados" value={stats.total} icon={Users} color="blue" />
        <StatCard label="Com E-mail" value={stats.comEmail} icon={Mail} color="green" />
        <StatCard label="Com Celular" value={stats.comCelular} icon={Smartphone} color="gray" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome, CPF ou email..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/80 text-gray-500 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">Nome do Responsável</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4">Documento (CPF)</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i}><td className="px-6 py-4" colSpan={4}><div className="h-10 bg-gray-100 rounded animate-pulse"/></td></tr>
                ))
              ) : filteredPais.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-400">
                    <AlertCircle size={32} className="mx-auto mb-2 opacity-20"/>
                    Nenhum responsável encontrado.
                  </td>
                </tr>
              ) : (
                filteredPais.map(pai => (
                  <tr 
                    key={pai.id} 
                    onClick={() => router.push(`/responsaveis/${pai.id}`)} // <--- AQUI ESTÁ A CORREÇÃO
                    className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <ParentAvatar name={pai.nome_completo} />
                        <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{pai.nome_completo}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                         {pai.email && (
                           <span className="flex items-center gap-1.5 text-xs text-gray-500">
                             <Mail size={12}/> {pai.email}
                           </span>
                         )}
                         {pai.telefone_celular && (
                           <span className="flex items-center gap-1.5 text-xs text-gray-500">
                             <Smartphone size={12}/> {pai.telefone_celular}
                           </span>
                         )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600 font-mono text-xs bg-gray-50 px-2 py-1 rounded w-fit border border-gray-100">
                        <ShieldCheck size={12} className="text-gray-400"/>
                        {pai.cpf || 'Não informado'}
                      </div>
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