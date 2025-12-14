'use client'

import { useEffect, useState, use } from 'react' // <--- IMPORTANTE: Adicione 'use'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, GraduationCap, Calendar, 
  AlertTriangle, CheckCircle2, History 
} from 'lucide-react'
import { toast } from 'sonner'
import { AlunoCompleto } from '@/types/app.types'

// --- LÓGICA DE NEGÓCIO: BNCC & IDADE ---

function sugerirSerieBNCC(dataNascimento: string | null, anoAlvo: number): string {
  if (!dataNascimento) return 'Data de nascimento pendente'

  const nascimento = new Date(dataNascimento)
  let idade = anoAlvo - nascimento.getFullYear()
  
  if (nascimento.getMonth() > 2 || (nascimento.getMonth() === 2 && nascimento.getDate() > 31)) {
    idade--
  }

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
  if (idade === 11) return '6º Ano Fundamental'
  if (idade === 12) return '7º Ano Fundamental'
  if (idade === 13) return '8º Ano Fundamental'
  if (idade === 14) return '9º Ano Fundamental'
  if (idade >= 15) return 'Ensino Médio'

  return 'Consultar Pedagógico'
}

// CORREÇÃO: params agora é uma Promise<{ id: string }>
export default function DetalhesAlunoPage({ params }: { params: Promise<{ id: string }> }) {
  // CORREÇÃO: Desembrulha o parametro ID usando o hook 'use'
  const { id } = use(params)
  
  const router = useRouter()
  const [aluno, setAluno] = useState<AlunoCompleto | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingRenovacao, setLoadingRenovacao] = useState(false)
  
  // Estados para Renovação
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
  }, [id]) // Dependência atualizada para 'id'

  async function carregarAluno() {
    try {
      const { data, error } = await supabase
        .from('alunos')
        .select(`
            *, 
            turmas (id, nome, turno, ano_letivo), 
            responsaveis (id, nome_completo, email, telefone_celular)
        `)
        .eq('id', id) // <--- CORREÇÃO: Usa 'id' desembrulhado, não 'params.id'
        .single()

      if (error) {
        console.error('Erro ao buscar aluno:', error)
        toast.error('Aluno não encontrado')
      } else {
        setAluno(data as AlunoCompleto)
      }
    } catch (err) {
      console.error('Erro crítico:', err)
    } finally {
      setLoading(false)
    }
  }

  // --- LÓGICA DE RENOVAÇÃO ---

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
        toast.error(`Aluno já matriculado para o ano letivo de ${anoRenovacao}!`)
        setModalAberta(false)
        setLoadingRenovacao(false)
        return
      }

      toast.success(`Iniciando renovação para ${sugestaoSerie}`)
      setModalAberta(false)

    } catch (error) {
      toast.error('Erro ao renovar')
    } finally {
      setLoadingRenovacao(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Carregando ficha do aluno...</div>
  
  if (!aluno) return (
    <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-gray-800">Aluno não encontrado</h2>
        <Link href="/alunos">
            <button className="mt-4 text-blue-600 hover:underline">Voltar para lista</button>
        </Link>
    </div>
  )

  const anoAtual = new Date().getFullYear()
  const anoProximo = anoAtual + 1
  const jaRenovado = aluno.turmas?.ano_letivo === anoProximo

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Link href="/alunos">
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
          
          {/* CARD ACADÊMICO */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="text-blue-600" size={20}/>
                Situação Acadêmica ({aluno.turmas?.ano_letivo || anoAtual})
              </h3>
              
              {!jaRenovado ? (
                <button 
                  onClick={abrirModalRenovacao}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-blue-100 shadow-lg transition-all flex items-center gap-2"
                >
                  <History size={16} />
                  Renovar para {anoProximo}
                </button>
              ) : (
                <div className="px-4 py-2 bg-green-50 text-green-700 border border-green-100 rounded-lg text-sm font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  Matrícula {anoProximo} Garantida
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

          {/* DADOS PESSOAIS */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
            <h3 className="font-bold text-gray-800 border-b pb-2">Dados Pessoais</h3>
            <div className="grid grid-cols-2 gap-y-4 text-sm">
              <div>
                <p className="text-gray-500">Data de Nascimento</p>
                <p className="font-medium">
                  {aluno.data_nascimento 
                    ? new Date(aluno.data_nascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) 
                    : 'Não informada'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">CPF</p>
                <p className="font-medium">{aluno.cpf_aluno || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-gray-500">Responsável Financeiro</p>
                {aluno.responsaveis ? (
                    <Link href={`/responsaveis/${aluno.responsavel_id}`} className="text-blue-600 hover:underline">
                    {aluno.responsaveis.nome_completo}
                    </Link>
                ) : (
                    <span className="text-red-500">Não vinculado</span>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* COLUNA DIREITA */}
        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <h3 className="font-bold text-blue-900 mb-2">Status Financeiro</h3>
            <p className="text-sm text-blue-700 mb-4">
              Visão rápida da adimplência do aluno.
            </p>
            <div className="text-3xl font-bold text-blue-800">Em dia</div>
            <Link href="/financeiro">
              <button className="w-full mt-4 py-2 bg-white text-blue-600 text-sm font-bold rounded border border-blue-200 hover:bg-blue-50 transition-colors">
                Ver Extrato Completo
              </button>
            </Link>
          </div>
        </div>

      </div>

      {/* MODAL */}
      {modalAberta && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><GraduationCap size={24} /></div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Renovação de Matrícula</h2>
                <p className="text-sm text-gray-500">Ciclo {anoRenovacao}</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Sugestão Pedagógica (BNCC)</p>
                <p className="text-lg font-bold text-blue-700">{sugestaoSerie}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Série/Ano</label>
                <select className="w-full p-2 border border-gray-300 rounded-lg" defaultValue={sugestaoSerie}>
                  <option value={sugestaoSerie}>{sugestaoSerie} (Recomendado)</option>
                  <option value="outro">Outra (Seleção Manual)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setModalAberta(false)} className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors">Cancelar</button>
              <button onClick={confirmarRenovacao} disabled={loadingRenovacao} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                {loadingRenovacao ? 'Processando...' : 'Confirmar Renovação'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}