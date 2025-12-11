'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link' // <--- IMPORTANTE: Adicionado para navegação
import { ArrowLeft, Users, UserPlus, XCircle, Search, AlertCircle, Sun, Moon, Clock, FileText } from 'lucide-react'
import { gerarPDFReuniaoPais } from '@/app/utils/geradorRelatorios' // <--- Import Novo

export default function DetalhesTurmaPage() {
  const router = useRouter()
  const params = useParams()
  const idTurma = params?.id as string

  const [turma, setTurma] = useState<any>(null)
  const [alunosNaTurma, setAlunosNaTurma] = useState<any[]>([])
  const [alunosDisponiveis, setAlunosDisponiveis] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [busca, setBusca] = useState('')

  useEffect(() => {
    carregarDados()
  }, [idTurma])

  async function carregarDados() {
    if (!idTurma) return

    const { data: dadosTurma } = await supabase.from('turmas').select('*').eq('id', idTurma).single()
    setTurma(dadosTurma)

    const { data: naTurma } = await supabase
      .from('alunos')
      .select('id, nome_completo, foto_url, data_nascimento, turno_contratado')
      .eq('turma_id', idTurma)
      .eq('ativo', true)
      .order('nome_completo')
    
    setAlunosNaTurma(naTurma || [])

    const { data: disponiveis } = await supabase
      .from('alunos')
      .select('id, nome_completo, foto_url, data_nascimento, turno_contratado, valor_mensalidade')
      .is('turma_id', null) 
      .eq('ativo', true)
      .order('nome_completo')

    setAlunosDisponiveis(disponiveis || [])
    setLoading(false)
  }

  async function adicionarAluno(idAluno: string) {
    if (turma.capacidade && alunosNaTurma.length >= turma.capacidade) {
      if (!confirm('A turma já atingiu a capacidade máxima! Deseja forçar a inclusão?')) return
    }

    setLoading(true)
    const { error } = await supabase.from('alunos').update({ turma_id: idTurma }).eq('id', idAluno)

    if (error) alert('Erro: ' + error.message)
    else carregarDados()
  }

  async function removerAluno(idAluno: string) {
    if (!confirm('Remover aluno desta turma? Ele voltará para a lista de "Sem Turma".')) return

    setLoading(true)
    const { error } = await supabase.from('alunos').update({ turma_id: null }).eq('id', idAluno)

    if (error) alert('Erro: ' + error.message)
    else carregarDados()
  }

  const IconeTurno = ({ turno }: { turno: string }) => {
    if (turno === 'Manhã') return <Sun size={14} className="text-yellow-600" />
    if (turno === 'Tarde') return <Moon size={14} className="text-orange-600" />
    return <Clock size={14} className="text-purple-600" />
  }

  const poolFiltrado = alunosDisponiveis.filter(a => 
    a.nome_completo.toLowerCase().includes(busca.toLowerCase())
  )

  if (loading && !turma) return <div className="p-10 text-center">Carregando gestão de turma...</div>

  return (
    <div className="space-y-6 pb-10 h-[calc(100vh-100px)] flex flex-col">
      
      {/* CABEÇALHO */}
      <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft size={20}/></button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              {turma.nome} 
              <span className="text-sm font-normal bg-gray-100 px-2 py-1 rounded text-gray-500 border border-gray-200">{turma.nivel}</span>
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
              <span className="flex items-center gap-1"><IconeTurno turno={turma.turno}/> Turno: {turma.turno}</span>
              <span>•</span>
              <span className={alunosNaTurma.length >= turma.capacidade ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                {alunosNaTurma.length} / {turma.capacidade} alunos
              </span>
            </div>
          </div>
        </div>
        {/* BOTÃO LISTA DE PRESENÇA */}
        <button 
          onClick={() => gerarPDFReuniaoPais(alunosNaTurma, turma.nome)}
          className="flex items-center px-4 py-2 bg-white text-blue-700 border border-blue-200 rounded-lg font-bold hover:bg-blue-50 shadow-sm"
          title="Gerar lista para reunião de pais"
        >
          <FileText size={18} className="mr-2"/> Lista de Presença
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
        
        {/* COLUNA ESQUERDA: ALUNOS NA TURMA (Agora Clicáveis) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-700 flex items-center gap-2"><Users size={18}/> Alunos na Turma</h3>
            <span className="text-xs font-bold bg-white px-2 py-1 rounded border">{alunosNaTurma.length}</span>
          </div>
          
          <div className="overflow-y-auto p-4 space-y-2 flex-1">
            {alunosNaTurma.length === 0 ? (
              <p className="text-center text-gray-400 py-10">Turma vazia.</p>
            ) : alunosNaTurma.map(aluno => (
              <div key={aluno.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:border-blue-300 transition-all group">
                <div className="flex items-center gap-3">
                  
                  {/* LINK NO AVATAR */}
                  <Link href={`/alunos/${aluno.id}`}>
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs overflow-hidden cursor-pointer hover:opacity-80">
                      {aluno.foto_url ? <img src={aluno.foto_url} className="w-full h-full object-cover"/> : aluno.nome_completo[0]}
                    </div>
                  </Link>

                  <div>
                    {/* LINK NO NOME */}
                    <Link href={`/alunos/${aluno.id}`} className="font-bold text-gray-800 text-sm hover:text-blue-600 hover:underline transition-colors">
                      {aluno.nome_completo}
                    </Link>
                    
                    {aluno.turno_contratado !== 'Integral' && aluno.turno_contratado !== turma.turno && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle size={10}/> Contrato: {aluno.turno_contratado}
                      </p>
                    )}
                  </div>
                </div>
                <button onClick={() => removerAluno(aluno.id)} className="text-gray-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity" title="Remover da turma">
                  <XCircle size={20}/>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* COLUNA DIREITA: POOL (Mantive igual, mas também poderíamos tornar clicável se quisesse ver o aluno antes de incluir) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden border-l-4 border-l-blue-500">
          <div className="p-4 border-b border-gray-100 bg-blue-50">
            <h3 className="font-bold text-blue-900 mb-2">Alunos sem Turma</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" size={16} />
              <input type="text" placeholder="Buscar aluno..." className="w-full pl-9 pr-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={busca} onChange={e => setBusca(e.target.value)} />
            </div>
          </div>

          <div className="overflow-y-auto p-4 space-y-2 flex-1 bg-gray-50/50">
            {poolFiltrado.length === 0 ? (
              <p className="text-center text-gray-400 py-10">Nenhum aluno aguardando.</p>
            ) : poolFiltrado.map(aluno => (
              <div key={aluno.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  {/* LINK OPCIONAL TAMBÉM NA LISTA DE ESPERA - Útil para conferir antes de puxar */}
                  <Link href={`/alunos/${aluno.id}`}>
                    <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-xs overflow-hidden cursor-pointer hover:opacity-80">
                      {aluno.foto_url ? <img src={aluno.foto_url} className="w-full h-full object-cover"/> : aluno.nome_completo[0]}
                    </div>
                  </Link>
                  <div>
                    <Link href={`/alunos/${aluno.id}`} className="font-bold text-gray-700 text-sm hover:text-blue-600 hover:underline">
                      {aluno.nome_completo}
                    </Link>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <IconeTurno turno={aluno.turno_contratado} /> {aluno.turno_contratado}
                    </p>
                  </div>
                </div>
                <button onClick={() => adicionarAluno(aluno.id)} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 shadow-sm flex items-center gap-1 text-xs font-bold">
                  <UserPlus size={16}/> Incluir
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}