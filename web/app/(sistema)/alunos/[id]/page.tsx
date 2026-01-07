'use client'

import { useEffect, useState, use } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, GraduationCap, Calendar, 
  AlertTriangle, CheckCircle2, History 
} from 'lucide-react'
import { toast } from 'sonner'
import { AlunoCompleto } from '@/types/app.types'

// --- Lógica BNCC ---
function sugerirSerieBNCC(dataNascimento: string | null, anoAlvo: number): string {
  if (!dataNascimento) return 'Data de nascimento pendente'
  const nascimento = new Date(dataNascimento)
  let idade = anoAlvo - nascimento.getFullYear()
  if (nascimento.getMonth() > 2 || (nascimento.getMonth() === 2 && nascimento.getDate() > 31)) idade--

  if (idade <= 1) return 'Berçário'
  if (idade === 2) return 'Maternal I'
  if (idade === 3) return 'Maternal II'
  if (idade === 4) return 'Pré-Escola I'
  if (idade === 5) return 'Pré-Escola II'
  if (idade === 6) return '1º Ano Fundamental'
  if (idade === 7) return '2º Ano Fundamental'
  if (idade === 8) return '3º Ano Fundamental'
  if (idade === 9) return '4º Ano Fundamental'
  if (idade === 10) return '5º Ano Fundamental'
  if (idade >= 15) return 'Ensino Médio'
  return 'Consultar Pedagógico'
}

// 1. Definição correta dos Params
export default function DetalhesAlunoPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { id } = use(params)
  // 2. Captura o rastro de navegação
  const searchProps = use(searchParams)
  const voltarPara = searchProps.voltar_para as string
  
  const router = useRouter()
  const [aluno, setAluno] = useState<AlunoCompleto | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Renovação
  const [loadingRenovacao, setLoadingRenovacao] = useState(false)
  const [modalAberta, setModalAberta] = useState(false)
  const [anoRenovacao, setAnoRenovacao] = useState(new Date().getFullYear() + 1)
  const [sugestaoSerie, setSugestaoSerie] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function init() {
      await carregarAluno()
    }
    init()
  }, [id])

  async function carregarAluno() {
    try {
      const { data, error } = await supabase
        .from('alunos')
        .select(`*, turmas (id, nome, turno, ano_letivo), responsaveis (id, nome_completo, email, telefone_celular)`)
        .eq('id', id)
        .single()

      if (error) toast.error('Aluno não encontrado')
      else setAluno(data as AlunoCompleto)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // --- Lógica de Renovação ---
  function abrirModalRenovacao() {
    if (!aluno) return
    const sugestao = sugerirSerieBNCC(aluno.data_nascimento, anoRenovacao)
    setSugestaoSerie(sugestao)
    setModalAberta(true)
  }

  async function confirmarRenovacao() {
    if (!aluno) return
    setLoadingRenovacao(true)
    try {
      if (aluno.turmas?.ano_letivo === anoRenovacao) {
        toast.error(`Já matriculado para ${anoRenovacao}!`)
      } else {
        toast.success(`Iniciando renovação para ${sugestaoSerie}`)
      }
      setModalAberta(false)
    } catch (error) {
      toast.error('Erro ao renovar')
    } finally {
      setLoadingRenovacao(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Carregando ficha...</div>
  
  if (!aluno) return (
    <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-gray-800">Aluno não encontrado</h2>
        <Link href="/alunos"><button className="mt-4 text-blue-600 hover:underline">Voltar para lista</button></Link>
    </div>
  )

  const anoAtual = new Date().getFullYear()
  const jaRenovado = aluno.turmas?.ano_letivo === (anoAtual + 1)

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      
      {/* HEADER */}
      <div className="flex items-center gap-4">
        {/* 3. Botão Voltar Inteligente: Volta para o pai se veio dele, ou para lista */}
        <Link href={voltarPara || "/alunos"}>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <ArrowLeft size={24} />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{aluno.nome_completo}</h1>
          <p className="text-gray-500 flex items-center gap-2 text-sm">
            <GraduationCap size={16} />
            Matrícula: {aluno.matricula_escolar || 'Pendente'}
            <span className="mx-1">•</span>
            {aluno.ativo ? (
              <span className="text-green-600 font-medium flex items-center gap-1"><CheckCircle2 size={14}/> Ativo</span>
            ) : (
              <span className="text-red-600 font-medium flex items-center gap-1"><AlertTriangle size={14}/> Inativo</span>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Card Acadêmico */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="text-blue-600" size={20}/>
                Situação Acadêmica ({aluno.turmas?.ano_letivo || anoAtual})
              </h3>
              
              {!jaRenovado ? (
                <button onClick={abrirModalRenovacao} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-blue-100 shadow-lg transition-all flex items-center gap-2">
                  <History size={16} /> Renovar
                </button>
              ) : (
                <div className="px-4 py-2 bg-green-50 text-green-700 border border-green-100 rounded-lg text-sm font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} /> Renovado
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-xs uppercase">Turma Atual</p>
                <p className="font-bold text-gray-900 text-lg">{aluno.turmas?.nome || 'Sem Turma'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-xs uppercase">Turno</p>
                <p className="font-bold text-gray-900 text-lg">{aluno.turmas?.turno || '---'}</p>
              </div>
            </div>
          </div>

          {/* Dados Pessoais */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
            <h3 className="font-bold text-gray-800 border-b pb-2">Dados Pessoais</h3>
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div>
                <p className="text-gray-500">Nascimento</p>
                <p className="font-medium">{aluno.data_nascimento ? new Date(aluno.data_nascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '--'}</p>
              </div>
              <div>
                <p className="text-gray-500">CPF</p>
                <p className="font-medium">{aluno.cpf_aluno || '--'}</p>
              </div>
              <div>
                <p className="text-gray-500">Responsável</p>
                {aluno.responsaveis ? (
                    <Link href={`/responsaveis/${aluno.responsavel_id}`} className="text-blue-600 hover:underline font-bold">
                      {aluno.responsaveis.nome_completo}
                    </Link>
                ) : <span className="text-red-500">Não vinculado</span>}
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA */}
        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <h3 className="font-bold text-blue-900 mb-2">Status Financeiro</h3>
            <p className="text-sm text-blue-700 mb-4">Visão rápida da adimplência.</p>
            <div className="text-3xl font-bold text-blue-800">Em dia</div>
            
            {/* 4. Repassa o 'voltar_para' para a tela de financeiro */}
            <Link href={`/alunos/${id}/financeiro${voltarPara ? `?voltar_para=${voltarPara}` : ''}`}>
              <button className="w-full mt-4 py-2 bg-white text-blue-600 text-sm font-bold rounded border border-blue-200 hover:bg-blue-50 transition-colors">
                Ver Extrato Completo
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Modal Renovação */}
      {modalAberta && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Renovação de Matrícula</h2>
            <p className="text-gray-500 mb-6">Sugestão: <strong className="text-blue-600">{sugestaoSerie}</strong></p>
            <div className="flex gap-3">
              <button onClick={() => setModalAberta(false)} className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl">Cancelar</button>
              <button onClick={confirmarRenovacao} disabled={loadingRenovacao} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}