'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Search, User, Phone, Mail, Users, ChevronRight, AlertCircle } from 'lucide-react'

export default function ResponsaveisListPage() {
  const router = useRouter()
  const [responsaveis, setResponsaveis] = useState<any[]>([])
  const [idsComPendencia, setIdsComPendencia] = useState<Set<string>>(new Set())
  const [busca, setBusca] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregar() {
      // 1. Busca Responsáveis
      const { data: listaResp } = await supabase
        .from('responsaveis')
        .select('*, alunos(id)')
        .order('nome_completo')
      
      // 2. Busca quem tem solicitação PENDENTE
      const { data: pendencias } = await supabase
        .from('solicitacoes_alteracao')
        .select('entidade_id')
        .eq('status', 'PENDENTE')
        .eq('tipo_entidade', 'RESPONSAVEL')

      // Cria um conjunto de IDs para busca rápida
      const ids = new Set(pendencias?.map(p => p.entidade_id) || [])
      
      setResponsaveis(listaResp || [])
      setIdsComPendencia(ids)
      setLoading(false)
    }
    carregar()
  }, [])

  const filtrados = responsaveis.filter(r => 
    r.nome_completo.toLowerCase().includes(busca.toLowerCase()) ||
    r.cpf.includes(busca)
  )

  // Ordena para que os cards com pendência apareçam PRIMEIRO
  const listaOrdenada = filtrados.sort((a, b) => {
    const aTem = idsComPendencia.has(a.id) ? 1 : 0
    const bTem = idsComPendencia.has(b.id) ? 1 : 0
    return bTem - aTem // Pendentes primeiro
  })

  return (
    <div className="space-y-6 pb-10">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Responsáveis</h1>
          <p className="text-gray-500">Gestão financeira e contato familiar.</p>
        </div>
        <Link href="/responsaveis/novo">
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm">
            <Plus size={18} className="mr-2"/> Novo Responsável
          </button>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Buscar por nome, CPF ou e-mail..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500" value={busca} onChange={e => setBusca(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <p className="col-span-3 text-center text-gray-400 py-10">Carregando...</p> : listaOrdenada.length === 0 ? <div className="col-span-3 text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300"><User size={48} className="mx-auto text-gray-300 mb-3" /><p className="text-gray-500">Nenhum responsável encontrado.</p></div> : (
          listaOrdenada.map(resp => {
            const qtdFilhos = resp.alunos?.length || 0
            const temPendencia = idsComPendencia.has(resp.id)

            return (
              <div 
                key={resp.id} 
                onClick={() => router.push(`/responsaveis/${resp.id}`)}
                className={`group p-6 rounded-xl shadow-sm border hover:shadow-md transition-all cursor-pointer relative ${
                  temPendencia ? 'bg-yellow-50 border-yellow-400' : 'bg-white border-gray-200 hover:border-blue-400'
                }`}
              >
                {/* AVISO DE PENDÊNCIA */}
                {temPendencia && (
                  <div className="absolute -top-3 right-4 bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-1 rounded-full border border-yellow-300 flex items-center gap-1 shadow-sm animate-pulse">
                    <AlertCircle size={12}/> ATENÇÃO: DADOS ALTERADOS
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                      temPendencia ? 'bg-yellow-200 text-yellow-800' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
                    }`}>
                      {resp.nome_completo[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-base line-clamp-1 group-hover:text-blue-600">
                        {resp.nome_completo}
                      </h3>
                      <span className="text-xs font-mono bg-white/50 px-1.5 py-0.5 rounded text-gray-500 border border-gray-100">
                        CPF: {resp.cpf}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-500" />
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 border-t border-gray-200/50 pt-3">
                  <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
                    <Mail size={14} className="text-gray-400 shrink-0"/>
                    <span className="truncate">{resp.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-400 shrink-0"/>
                    {resp.telefone_celular}
                  </div>
                </div>

                <div className={`mt-4 flex items-center gap-2 text-xs font-bold p-2 rounded-lg transition-colors ${
                   temPendencia ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-50 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-700'
                }`}>
                  <Users size={14} />
                  {qtdFilhos === 0 ? 'Nenhum aluno vinculado' : qtdFilhos === 1 ? '1 filho matriculado' : `${qtdFilhos} filhos matriculados`}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}