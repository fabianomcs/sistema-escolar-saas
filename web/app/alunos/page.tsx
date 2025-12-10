'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Search, Plus, Filter, MessageCircle, MoreHorizontal, ArrowUp, ArrowDown, FileDown, Printer } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { gerarPDFListaAlunos } from '@/app/utils/geradorRelatorios'

export default function AlunosPage() {
  const searchParams = useSearchParams()
  const turmaPre = searchParams.get('turma_id')

  const [alunos, setAlunos] = useState<any[]>([])
  const [turmas, setTurmas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filtros & Ordenação
  const [busca, setBusca] = useState('')
  const [filtroTurma, setFiltroTurma] = useState(turmaPre || '')
  
  // Estado de Ordenação { campo, direção }
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'nome_completo', direction: 'asc' })

  useEffect(() => {
    async function carregarDados() {
      const { data: listaAlunos } = await supabase
        .from('alunos')
        .select(`*, turmas (nome), responsaveis (id, nome_completo, telefone_celular)`)
      
      const { data: listaTurmas } = await supabase.from('turmas').select('*').order('nome')

      setAlunos(listaAlunos || [])
      setTurmas(listaTurmas || [])
      setLoading(false)
    }
    carregarDados()
  }, [])

  // Função de Click no Cabeçalho
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  // Ícone de Ordenação
  const SortIcon = ({ colKey }: { colKey: string }) => {
    if (sortConfig.key !== colKey) return null
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="ml-1 inline"/> : <ArrowDown size={14} className="ml-1 inline"/>
  }

  // Lógica de Filtragem e Ordenação
  const alunosFiltrados = alunos
    .filter((aluno) => {
      const termo = busca.toLowerCase()
      const matchNome = aluno.nome_completo.toLowerCase().includes(termo)
      const matchResp = aluno.responsaveis?.nome_completo.toLowerCase().includes(termo)
      const matchTurma = filtroTurma ? aluno.turma_id === filtroTurma : true
      return (matchNome || matchResp) && matchTurma
    })
    .sort((a, b) => {
      // Extrai valores
      let valA = '', valB = ''
      
      if (sortConfig.key === 'nome_completo') { valA = a.nome_completo; valB = b.nome_completo }
      else if (sortConfig.key === 'turma') { valA = a.turmas?.nome || ''; valB = b.turmas?.nome || '' }
      else if (sortConfig.key === 'responsavel') { valA = a.responsaveis?.nome_completo || ''; valB = b.responsaveis?.nome_completo || '' }

      return sortConfig.direction === 'asc' 
        ? valA.localeCompare(valB) 
        : valB.localeCompare(valA)
    })

  const linkZap = (tel: string) => tel ? `https://wa.me/55${tel.replace(/\D/g, '')}` : '#'
  const iniciais = (nome: string) => nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div><h1 className="text-2xl font-bold text-gray-800">Alunos Matriculados</h1><p className="text-gray-500">Gerencie matrículas e turmas.</p></div>
          <div className="flex gap-2">
          {/* BOTÃO EXPORTAR PDF */}
          <button 
            onClick={() => gerarPDFListaAlunos(alunosFiltrados, `Lista de Alunos - ${filtroTurma || 'Geral'}`)}
            className="flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-bold hover:bg-gray-50 shadow-sm transition-all"
          >
            <Printer size={20} className="mr-2"/> PDF
          </button>
          </div>        
        <Link href="/alunos/novo"><button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-sm transition-all"><Plus size={20} className="mr-2"/> Nova Matrícula</button></Link>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" placeholder="Buscar aluno ou responsável..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500" value={busca} onChange={e => setBusca(e.target.value)}/></div>
        <div className="flex items-center gap-2"><Filter size={18} className="text-gray-400" /><select className="p-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-500 text-sm" value={filtroTurma} onChange={e => setFiltroTurma(e.target.value)}><option value="">Todas as Turmas</option>{turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}</select></div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100 select-none">
            <tr>
              <th className="px-6 py-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('nome_completo')}>Aluno <SortIcon colKey="nome_completo"/></th>
              <th className="px-6 py-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('turma')}>Turma <SortIcon colKey="turma"/></th>
              <th className="px-6 py-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('responsavel')}>Responsável <SortIcon colKey="responsavel"/></th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? <tr><td colSpan={5} className="p-8 text-center text-gray-400">Carregando...</td></tr> : 
             alunosFiltrados.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-gray-400">Nenhum aluno.</td></tr> : (
              alunosFiltrados.map((aluno) => (
                <tr key={aluno.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <Link href={`/alunos/${aluno.id}`} className="flex items-center gap-3 group/link">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs group-hover/link:bg-blue-600 group-hover/link:text-white transition-colors overflow-hidden border border-blue-200">
                        {aluno.foto_url ? <img src={aluno.foto_url} className="w-full h-full object-cover" /> : iniciais(aluno.nome_completo)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 group-hover/link:text-blue-600 group-hover/link:underline transition-all">{aluno.nome_completo}</div>
                        <div className="text-xs text-gray-400">Matrícula: {aluno.matricula_escolar || '---'}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4"><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold border border-gray-200">{aluno.turmas?.nome || 'Sem Turma'}</span></td>
                  <td className="px-6 py-4">
                    <Link href={`/responsaveis/${aluno.responsaveis?.id}`} className="font-medium text-gray-700 hover:text-blue-600 hover:underline">{aluno.responsaveis?.nome_completo}</Link>
                    <div className="flex items-center gap-2 mt-1"><a href={linkZap(aluno.responsaveis?.telefone_celular)} target="_blank" className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full border border-green-100"><MessageCircle size={12} /> WhatsApp</a></div>
                  </td>
                  <td className="px-6 py-4 text-center"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${aluno.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{aluno.ativo ? 'Ativo' : 'Inativo'}</span></td>
                  <td className="px-6 py-4 text-right"><button className="text-gray-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-all"><MoreHorizontal size={18} /></button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}