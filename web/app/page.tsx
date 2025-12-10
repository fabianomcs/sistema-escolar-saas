'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Users, AlertCircle, CheckCircle, TrendingUp, DollarSign, ArrowRight } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  
  const [alunosRecentes, setAlunosRecentes] = useState<any[]>([])
  const [kpi, setKpi] = useState({
    totalAlunos: 0,
    receitaEsperada: 0,
    receitaRecebida: 0,
    totalAtrasado: 0
  })
  
  const [graficoFinanceiro, setGraficoFinanceiro] = useState<any[]>([])
  const [graficoNiveis, setGraficoNiveis] = useState<any[]>([])

  // Função de Data consistente
  const parseDataLocal = (dataString: string) => {
    if (!dataString) return new Date()
    const [ano, mes, dia] = dataString.split('T')[0].split('-').map(Number)
    return new Date(ano, mes - 1, dia, 12, 0, 0) 
  }

  useEffect(() => {
    async function carregarDashboard() {
      const hoje = new Date()
      hoje.setHours(0,0,0,0)

      const mesAtual = hoje.getMonth() + 1
      const anoAtual = hoje.getFullYear()

      // 1. KPI Alunos (Total)
      const { count: totalAlunos } = await supabase.from('alunos').select('*', { count: 'exact', head: true }).eq('ativo', true)

      // 2. BUSCA FINANCEIRA UNIFICADA (Para KPIs e Gráficos)
      const inicioAno = `${anoAtual}-01-01`
      const fimAno = `${anoAtual}-12-31`

      // Agora trazemos também o NÍVEL da turma na cobrança
      const { data: cobrancas } = await supabase
        .from('cobrancas')
        .select(`
          valor_original, status, valor_pago, data_vencimento,
          alunos (
            turmas (nivel)
          )
        `)
        .gte('data_vencimento', inicioAno)
        .lte('data_vencimento', fimAno)
        .neq('status', 'CANCELADO')

      let esperado = 0, recebido = 0, atrasado = 0, pendente = 0
      
      // Estrutura para agrupar por nível: { 'Berçário': {recebido: 0, atrasado: 0...}, ... }
      const niveisStats: any = {}

      cobrancas?.forEach(c => {
        // Filtro de Mês (Dashboard é mensal)
        const dtVenc = parseDataLocal(c.data_vencimento)
        if ((dtVenc.getMonth() + 1) !== mesAtual) return

        const valorOriginal = Number(c.valor_original)
        const valorPago = Number(c.valor_pago || 0)
        
        // Determina Situação
        dtVenc.setHours(0,0,0,0)
        const estaVencido = dtVenc < hoje && c.status !== 'PAGO'
        let situacao = ''

        // KPIs Financeiros (Soma Valores R$)
        esperado += valorOriginal

        if (c.status === 'PAGO') {
          recebido += valorPago
          situacao = 'recebido'
        } else if (c.status === 'ATRASADO' || estaVencido) {
          atrasado += (valorOriginal - valorPago)
          situacao = 'atrasado'
        } else {
          pendente += (valorOriginal - valorPago)
          situacao = 'avencer'
        }

        // Agrupamento por Nível (Conta Quantidade de Boletos/Alunos)
        // Se a cobrança não tiver turma/nível (ex: aluno novo sem enturmação), chamamos de "Outros"
        // @ts-ignore
        const nivel = c.alunos?.turmas?.nivel || 'Sem Turma'
        
        if (!niveisStats[nivel]) {
          niveisStats[nivel] = { name: nivel, recebido: 0, atrasado: 0, avencer: 0 }
        }
        // Incrementa contagem
        niveisStats[nivel][situacao] += 1
      })

      // Prepara dados para os gráficos
      const dadosGraficoPizza = [
        { name: 'Recebido', value: recebido, color: '#22c55e' },
        { name: 'A Vencer', value: pendente, color: '#eab308' },
        { name: 'Atrasado', value: atrasado, color: '#ef4444' }
      ].filter(d => d.value > 0)

      // Transforma objeto de níveis em array para o gráfico de barras
      const dadosGraficoBarras = Object.values(niveisStats)

      // 4. Tabela Recentes
      const { data: recentes } = await supabase.from('alunos').select('id, nome_completo, turma_id, turmas(nome), responsaveis(id, nome_completo)').order('created_at', { ascending: false }).limit(5)

      setAlunosRecentes(recentes || [])
      setKpi({
        totalAlunos: totalAlunos || 0,
        receitaEsperada: esperado,
        receitaRecebida: recebido,
        totalAtrasado: atrasado
      })
      setGraficoFinanceiro(dadosGraficoPizza)
      setGraficoNiveis(dadosGraficoBarras)
      setLoading(false)
    }

    carregarDashboard()
  }, [])

  const formatarMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  if (loading) return <div className="p-10 text-center text-gray-500">Carregando indicadores...</div>

  return (
    <div className="space-y-8 pb-10">
      
      {/* 1. CARDS KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div><p className="text-sm text-gray-500 font-bold uppercase">Total Alunos</p><h3 className="text-3xl font-bold text-gray-800 mt-1">{kpi.totalAlunos}</h3><span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-bold mt-2 inline-block">Ativos</span></div>
          <div className="p-4 bg-blue-50 text-blue-600 rounded-full"><Users size={24} /></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div><p className="text-sm text-gray-500 font-bold uppercase">Previsão (Mês)</p><h3 className="text-2xl font-bold text-gray-800 mt-1">{formatarMoeda(kpi.receitaEsperada)}</h3><span className="text-xs text-gray-400 mt-1 block">Boletos de {new Date().toLocaleString('default', { month: 'long' })}</span></div>
          <div className="p-4 bg-gray-50 text-gray-600 rounded-full"><DollarSign size={24} /></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div><p className="text-sm text-gray-500 font-bold uppercase">Em Caixa</p><h3 className="text-2xl font-bold text-gray-800 mt-1">{formatarMoeda(kpi.receitaRecebida)}</h3><span className="text-xs text-green-600 flex items-center mt-1 font-bold"><TrendingUp size={12} className="mr-1"/> Confirmados</span></div>
          <div className="p-4 bg-green-50 text-green-600 rounded-full"><CheckCircle size={24} /></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div><p className="text-sm text-gray-500 font-bold uppercase">Em Atraso</p><h3 className="text-2xl font-bold text-red-600 mt-1">{formatarMoeda(kpi.totalAtrasado)}</h3><span className="text-xs text-red-500 flex items-center mt-1 font-bold"><AlertCircle size={12} className="mr-1"/> Vencidos</span></div>
          <div className="p-4 bg-red-50 text-red-600 rounded-full"><AlertCircle size={24} /></div>
        </div>
      </div>

      {/* 2. ÁREA DE GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfico Pizza */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6">Status Financeiro ({new Date().toLocaleString('default', { month: 'long' })})</h3>
          <div className="h-72 w-full flex items-center">
            {graficoFinanceiro.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={graficoFinanceiro} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{graficoFinanceiro.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}</Pie><Tooltip formatter={(value) => formatarMoeda(Number(value))} /></PieChart></ResponsiveContainer>
            ) : <div className="w-full text-center text-gray-400">Sem dados este mês</div>}
            <div className="space-y-3 min-w-[120px]">
              {graficoFinanceiro.map((item, idx) => <div key={idx} className="flex items-center text-sm"><div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: item.color}}></div><span className="text-gray-600">{item.name}</span></div>)}
            </div>
          </div>
        </div>

        {/* Gráfico Barras Empilhadas (NOVO!) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6">Situação Financeira por Nível</h3>
          <div className="h-72 w-full">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={graficoNiveis} layout="vertical" margin={{ left: 40, right: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 11}} interval={0} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Legend iconType="circle" />
                
                {/* Barras Empilhadas (stackId="a" faz elas ficarem na mesma linha) */}
                <Bar dataKey="recebido" name="Recebido" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} barSize={24} />
                <Bar dataKey="avencer" name="A Vencer" stackId="a" fill="#eab308" radius={[0, 0, 0, 0]} barSize={24} />
                <Bar dataKey="atrasado" name="Atrasado" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">* Quantidade de boletos/alunos</p>
        </div>
      </div>

      {/* 3. TABELA RECENTES */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center"><h3 className="font-bold text-gray-800">Últimas Matrículas</h3><Link href="/alunos" className="text-sm text-blue-600 hover:text-blue-800 font-bold flex items-center">Ver todos <ArrowRight size={16} className="ml-1"/></Link></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left"><thead className="bg-gray-50 text-gray-500 uppercase font-medium"><tr><th className="px-6 py-3">Aluno</th><th className="px-6 py-3">Turma</th><th className="px-6 py-3">Responsável</th><th className="px-6 py-3 text-right">Ação</th></tr></thead>
            <tbody className="divide-y divide-gray-50">
              {alunosRecentes.map((aluno) => (
                <tr key={aluno.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-800"><Link href={`/alunos/${aluno.id}`} className="hover:text-blue-600 hover:underline">{aluno.nome_completo}</Link></td>
                  <td className="px-6 py-4 text-gray-600"><span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold border border-gray-200">{aluno.turmas?.nome || 'Sem Turma'}</span></td>
                  <td className="px-6 py-4"><Link href={`/responsaveis/${aluno.responsaveis?.id}`} className="text-gray-600 hover:text-blue-600 hover:underline">{aluno.responsaveis?.nome_completo}</Link></td>
                  <td className="px-6 py-4 text-right"><Link href={`/alunos/${aluno.id}`} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">Ver Dossiê</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}