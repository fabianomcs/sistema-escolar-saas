'use client'

import { useEffect, useState, use } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Printer, FileText, 
  CheckCircle2, AlertCircle, Clock, Users, Wallet 
} from 'lucide-react'
import { Responsavel } from '@/types/app.types'
import { gerarExtratoResponsavelPDF } from '@/app/utils/geradorExtrato'
import { ModalBaixaManual } from '@/components/financeiro/ModalBaixaManual'

export default function ExtratoResponsavelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  
  // Estados de Dados
  const [responsavel, setResponsavel] = useState<Responsavel | null>(null)
  const [cobrancas, setCobrancas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Estados do Modal de Baixa
  const [modalBaixaOpen, setModalBaixaOpen] = useState(false)
  const [cobrancaSelecionada, setCobrancaSelecionada] = useState<any>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Função de busca extraída para permitir recarregamento
  async function carregarDados() {
    setLoading(true)
    try {
      // 1. Busca Responsável
      const { data: dadosResp } = await supabase
        .from('responsaveis')
        .select('*')
        .eq('id', id)
        .single()
      
      setResponsavel(dadosResp)

      // 2. Busca TODAS as Cobranças deste Responsável (incluindo dados do aluno)
      const { data: dadosFin } = await supabase
        .from('cobrancas')
        .select(`
          *,
          alunos (nome_completo, turmas(nome))
        `)
        .eq('responsavel_id', id)
        .order('data_vencimento', { ascending: true })
      
      if (dadosFin) setCobrancas(dadosFin)
    } catch (error) {
      console.error("Erro ao carregar financeiro responsável:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [id])

  // --- AÇÕES ---
  function abrirModalBaixa(cobranca: any) {
    setCobrancaSelecionada(cobranca)
    setModalBaixaOpen(true)
  }

  function handleSucessoBaixa() {
    // Recarrega a tabela para mostrar o item como PAGO
    carregarDados() 
  }

  // --- CÁLCULOS (Resumo Consolidado) ---
  const resumo = cobrancas.reduce((acc, c) => {
    const valor = Number(c.valor_original)
    const pago = Number(c.valor_pago || 0)
    
    const dtVenc = new Date(c.data_vencimento)
    dtVenc.setHours(0,0,0,0)
    const hoje = new Date()
    hoje.setHours(0,0,0,0)
    
    const isVencido = dtVenc < hoje && c.status !== 'PAGO' && c.status !== 'CANCELADO'

    if (c.status === 'PAGO') {
      acc.pago += pago
    } else if ((c.status === 'ATRASADO' || isVencido) && c.status !== 'CANCELADO') {
      acc.pendente += (valor - pago)
      acc.atrasado += (valor - pago)
    } else if (c.status !== 'CANCELADO') {
      acc.pendente += (valor - pago)
    }
    
    if (c.status !== 'CANCELADO') acc.total += valor
    
    return acc
  }, { total: 0, pago: 0, pendente: 0, atrasado: 0 })

  // Formatadores
  const formatarMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
  const formatarData = (d: string) => {
    if (!d) return '--/--'
    const [ano, mes, dia] = d.split('-').map(Number)
    return new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR')
  }

  if (loading && !responsavel) return <div className="p-10 text-center animate-pulse text-gray-500">Carregando extrato familiar...</div>

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <Link href={`/responsaveis/${id}`}>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
              <ArrowLeft size={24} />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Extrato Consolidado</h1>
            <p className="text-gray-500 flex items-center gap-2">
              Responsável: <span className="font-semibold text-blue-600">{responsavel?.nome_completo}</span>
            </p>
          </div>
        </div>
        
        <button 
            onClick={() => gerarExtratoResponsavelPDF(responsavel, cobrancas, resumo)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-800 rounded-lg text-sm font-bold text-white hover:bg-gray-900 shadow-md transition-all"
        >
            <Printer size={16}/> Imprimir Relatório
        </button>
      </div>

      {/* CARDS RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
             <p className="text-xs text-gray-500 uppercase font-bold">Total Contratado (Todos Alunos)</p>
             <p className="text-2xl font-bold text-gray-800 mt-1">{formatarMoeda(resumo.total)}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 text-xs text-gray-400">
             Histórico completo da conta
          </div>
        </div>
        
        <div className="bg-green-50 p-5 rounded-xl border border-green-100 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs text-green-700 uppercase font-bold">Total Pago</p>
            <p className="text-2xl font-bold text-green-700 mt-1">{formatarMoeda(resumo.pago)}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-green-100/50 text-xs text-green-600">
             Receita confirmada
          </div>
        </div>

        <div className={`p-5 rounded-xl border shadow-sm flex flex-col justify-between ${resumo.atrasado > 0 ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'}`}>
          <div>
            <p className={`text-xs uppercase font-bold ${resumo.atrasado > 0 ? 'text-red-700' : 'text-blue-700'}`}>
                {resumo.atrasado > 0 ? 'Atenção: Total em Atraso' : 'Saldo a Vencer'}
            </p>
            <p className={`text-3xl font-bold mt-1 ${resumo.atrasado > 0 ? 'text-red-700' : 'text-blue-700'}`}>
                {formatarMoeda(resumo.pendente)}
            </p>
          </div>
          <div className={`mt-4 pt-4 border-t text-xs ${resumo.atrasado > 0 ? 'border-red-100 text-red-600' : 'border-blue-100 text-blue-600'}`}>
             {resumo.atrasado > 0 ? 'Regularize as pendências' : 'Mensalidades futuras'}
          </div>
        </div>
      </div>

      {/* TABELA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <FileText size={16} className="text-gray-400"/>
                <h3 className="font-bold text-gray-700 text-sm">Detalhamento dos Lançamentos</h3>
            </div>
            <span className="text-xs font-medium bg-white border px-2 py-1 rounded text-gray-500">
                {cobrancas.length} registros
            </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Vencimento</th>
                <th className="px-6 py-4">Aluno (Filho)</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Valor</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center print:hidden">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cobrancas.length === 0 ? (
                  <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400">Nenhum registro financeiro encontrado.</td>
                  </tr>
              ) : (
                  cobrancas.map((item) => {
                      const dtVenc = new Date(item.data_vencimento)
                      dtVenc.setHours(0,0,0,0)
                      const hoje = new Date()
                      hoje.setHours(0,0,0,0)
                      const isVencido = dtVenc < hoje && item.status !== 'PAGO' && item.status !== 'CANCELADO'
                      
                      return (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                          <td className="px-6 py-4 font-mono text-gray-600 whitespace-nowrap">
                              {formatarData(item.data_vencimento)}
                          </td>
                          <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                  <Users size={14} className="text-gray-300 group-hover:text-blue-400"/>
                                  <span className="font-bold text-gray-700 text-xs uppercase">
                                      {item.alunos?.nome_completo?.split(' ')[0]} 
                                  </span>
                              </div>
                          </td>
                          <td className="px-6 py-4">
                              <span className="font-medium text-gray-800 block">{item.descricao}</span>
                              <span className="text-xs text-gray-400">
                                  {item.alunos?.turmas?.nome}
                              </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-gray-700">
                              {formatarMoeda(item.valor_original)}
                          </td>
                          <td className="px-6 py-4 text-center">
                              {item.status === 'PAGO' && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                      <CheckCircle2 size={12} className="mr-1"/> Pago
                                  </span>
                              )}
                              {isVencido && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                      <AlertCircle size={12} className="mr-1"/> Atrasado
                                  </span>
                              )}
                              {!isVencido && item.status === 'PENDENTE' && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                                      <Clock size={12} className="mr-1"/> Aberto
                                  </span>
                              )}
                              {item.status === 'CANCELADO' && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200 line-through">
                                      Cancelado
                                  </span>
                              )}
                          </td>
                          <td className="px-6 py-4 text-center print:hidden">
                              {item.status !== 'PAGO' && item.status !== 'CANCELADO' && (
                                <button 
                                  onClick={() => abrirModalBaixa(item)}
                                  className="inline-flex items-center px-3 py-1.5 bg-white border border-blue-200 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-50 shadow-sm transition-colors"
                                  title="Receber pagamento presencial"
                                >
                                  <Wallet size={14} className="mr-1.5"/> Receber
                                </button>
                              )}
                          </td>
                      </tr>
                      )
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ModalBaixaManual 
        isOpen={modalBaixaOpen}
        cobranca={cobrancaSelecionada}
        onClose={() => setModalBaixaOpen(false)}
        onSuccess={handleSucessoBaixa}
      />
    </div>
  )
}