'use client'
import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, TrendingUp, AlertCircle, Sun, Moon, Clock, FileDown, Calendar } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'
import { gerarPDFFinanceiro } from '@/app/utils/geradorRelatorios'

export default function FinanceiroPage() {
  const [cobrancas, setCobrancas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filtros
  const [filtroAno, setFiltroAno] = useState(new Date().getFullYear()) // <--- NOVO
  const [filtroMes, setFiltroMes] = useState(new Date().getMonth() + 1)
  const [filtroTurma, setFiltroTurma] = useState('Todas')
  const [filtroTurno, setFiltroTurno] = useState('Todos')
  const [busca, setBusca] = useState('')

  useEffect(() => {
    async function buscarFinanceiro() {
      const { data } = await supabase
        .from('cobrancas')
        .select(`
          *, 
          alunos (nome_completo, turma_atual, turmas(nome, turno)), 
          responsaveis (nome_completo)
        `)
        .order('data_vencimento', { ascending: false })

      if (data) setCobrancas(data)
      setLoading(false)
    }
    buscarFinanceiro()
  }, [])

  // Função Corretora de Data
  const parseDataLocal = (dataString: string) => {
    if (!dataString) return new Date()
    const [ano, mes, dia] = dataString.split('T')[0].split('-').map(Number)
    return new Date(ano, mes - 1, dia, 12, 0, 0) 
  }

  // 1. FILTRAGEM
  const dadosFiltrados = useMemo(() => {
    return cobrancas.filter(item => {
      if (item.status === 'CANCELADO') return false;

      const dataVenc = parseDataLocal(item.data_vencimento)
      const mesItem = dataVenc.getMonth() + 1
      const anoItem = dataVenc.getFullYear() // <--- PEGA O ANO
      
      // Filtros
      const passaAno = filtroAno === 0 || anoItem === filtroAno // <--- FILTRA O ANO
      const passaMes = filtroMes === 0 || mesItem === filtroMes
      const passaTurma = filtroTurma === 'Todas' || item.alunos?.turmas?.nome === filtroTurma
      
      const turnoAluno = item.alunos?.turmas?.turno || 'Manhã'
      const passaTurno = filtroTurno === 'Todos' || turnoAluno === filtroTurno

      const termo = busca.toLowerCase()
      const passaBusca = item.alunos?.nome_completo.toLowerCase().includes(termo) || 
                         item.responsaveis?.nome_completo.toLowerCase().includes(termo)

      return passaAno && passaMes && passaTurma && passaTurno && passaBusca
    })
  }, [cobrancas, filtroAno, filtroMes, filtroTurma, filtroTurno, busca])

  // 2. CÁLCULOS
  const estatisticas = useMemo(() => {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    let totalEsperado = 0
    let totalPago = 0
    let totalAtrasado = 0
    let totalPendente = 0

    dadosFiltrados.forEach(item => {
      const valorOriginal = Number(item.valor_original)
      const valorPago = Number(item.valor_pago || 0)
      
      totalEsperado += valorOriginal

      const dtVenc = parseDataLocal(item.data_vencimento)
      dtVenc.setHours(0,0,0,0)
      
      const estaVencido = dtVenc < hoje && item.status !== 'PAGO'

      if (item.status === 'PAGO') {
        totalPago += valorPago
      } else if (item.status === 'ATRASADO' || estaVencido) {
        totalAtrasado += (valorOriginal - valorPago)
      } else {
        totalPendente += (valorOriginal - valorPago)
      }
    })

    return { totalEsperado, totalPago, totalAtrasado, totalPendente }
  }, [dadosFiltrados])

  // 3. DADOS GRÁFICO
  const dadosGrafico = [
    { name: 'Recebido', valor: estatisticas.totalPago, cor: '#22c55e' },
    { name: 'Atrasado', valor: estatisticas.totalAtrasado, cor: '#ef4444' },
    { name: 'A Vencer', valor: estatisticas.totalPendente, cor: '#eab308' }
  ].filter(d => d.valor > 0)

  const formatarMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
  const formatarData = (d: string) => parseDataLocal(d).toLocaleDateString('pt-BR')
  const turmasUnicas = Array.from(new Set(cobrancas.map(c => c.alunos?.turmas?.nome).filter(Boolean)))

  return (
    <div className="space-y-6 pb-10">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Financeiro</h1>
          <p className="text-gray-500">Gestão de mensalidades e inadimplência</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => gerarPDFFinanceiro(dadosFiltrados, `Relatório Financeiro ${filtroMes}/${filtroAno}`)}
            className="flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50"
          >
            <FileDown size={16} className="mr-2"/> Exportar Lista
          </button>
        </div>
      </div>

      {/* ÁREA DE RESUMO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center space-y-4">
          <div>
            <p className="text-gray-500 text-sm font-medium">Previsão (Filtro Atual)</p>
            <h2 className="text-3xl font-bold text-gray-800">{formatarMoeda(estatisticas.totalEsperado)}</h2>
          </div>
          <div className="h-px bg-gray-100 w-full"></div>
          <div className="flex justify-between text-sm">
            <span className="text-green-600 font-medium flex items-center"><TrendingUp size={16} className="mr-1"/> Pago: {formatarMoeda(estatisticas.totalPago)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-red-500 font-medium flex items-center"><AlertCircle size={16} className="mr-1"/> Atrasado: {formatarMoeda(estatisticas.totalAtrasado)}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="text-gray-700 font-bold mb-4 text-sm">Status (Visual)</h3>
          <div className="h-40 w-full flex items-center">
             {dadosGrafico.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={dadosGrafico} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="valor">
                     {dadosGrafico.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.cor} />)}
                   </Pie>
                   <Tooltip formatter={(value) => formatarMoeda(Number(value))} />
                 </PieChart>
               </ResponsiveContainer>
             ) : (
               <div className="w-full text-center text-gray-400">Sem dados para exibir</div>
             )}
             <div className="ml-6 space-y-2 min-w-[120px]">
               {dadosGrafico.map((item, i) => (
                 <div key={i} className="flex items-center text-xs text-gray-600">
                   <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: item.cor}}></div>
                   {item.name}: {formatarMoeda(item.valor)}
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>

      {/* BARRA DE FILTROS AVANÇADA */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Buscar..." value={busca} onChange={(e) => setBusca(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 text-sm" />
        </div>

        {/* SELETOR DE ANO (NOVO) */}
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
          <div className="px-3 bg-gray-50 border-r border-gray-200 text-gray-500"><Calendar size={16} /></div>
          <select value={filtroAno} onChange={(e) => setFiltroAno(Number(e.target.value))} className="px-2 py-2 text-sm bg-white outline-none cursor-pointer font-bold text-gray-700">
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>
        </div>

        <select value={filtroMes} onChange={(e) => setFiltroMes(Number(e.target.value))} className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white">
          <option value={0}>Todos os Meses</option>
          <option value={1}>Janeiro</option>
          <option value={2}>Fevereiro</option>
          <option value={3}>Março</option>
          <option value={4}>Abril</option>
          <option value={5}>Maio</option>
          <option value={6}>Junho</option>
          <option value={7}>Julho</option>
          <option value={8}>Agosto</option>
          <option value={9}>Setembro</option>
          <option value={10}>Outubro</option>
          <option value={11}>Novembro</option>
          <option value={12}>Dezembro</option>
        </select>

        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-3 bg-gray-50 border-r border-gray-200 text-gray-500"><Sun size={16} /></div>
          <select value={filtroTurno} onChange={(e) => setFiltroTurno(e.target.value)} className="px-2 py-2 text-sm bg-white outline-none">
            <option value="Todos">Todos os Turnos</option>
            <option value="Manhã">Manhã</option>
            <option value="Tarde">Tarde</option>
            <option value="Integral">Integral</option>
          </select>
        </div>

        <select value={filtroTurma} onChange={(e) => setFiltroTurma(e.target.value)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white">
          <option value="Todas">Todas as Turmas</option>
          {turmasUnicas.map((t: any) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* TABELA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-4">Vencimento</th>
              <th className="px-6 py-4">Aluno / Turma</th>
              <th className="px-6 py-4">Responsável</th>
              <th className="px-6 py-4">Valor</th>
              <th className="px-6 py-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="p-8 text-center text-gray-400">Carregando...</td></tr> : 
             dadosFiltrados.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-gray-400">Nada encontrado.</td></tr> : (
              dadosFiltrados.map((item) => {
                const dtVenc = parseDataLocal(item.data_vencimento)
                dtVenc.setHours(0,0,0,0)
                const hoje = new Date()
                hoje.setHours(0,0,0,0)
                const isVencido = dtVenc < hoje && item.status !== 'PAGO'
                const isAtrasado = item.status === 'ATRASADO' || isVencido

                return (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className={`px-6 py-4 ${isAtrasado ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                      {formatarData(item.data_vencimento)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800">{item.alunos?.nome_completo}</div>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs text-gray-500 bg-gray-100 px-1.5 rounded">{item.alunos?.turmas?.nome}</span>
                        <span className="text-xs text-blue-600 bg-blue-50 px-1.5 rounded flex items-center border border-blue-100">
                          {item.alunos?.turmas?.turno === 'Manhã' ? <Sun size={10} className="mr-1"/> : item.alunos?.turmas?.turno === 'Tarde' ? <Moon size={10} className="mr-1"/> : <Clock size={10} className="mr-1"/>}
                          {item.alunos?.turmas?.turno}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{item.responsaveis?.nome_completo}</td>
                    <td className="px-6 py-4 font-bold text-gray-700">{formatarMoeda(item.valor_original)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        item.status === 'PAGO' ? 'bg-green-50 text-green-700 border-green-100' : 
                        isAtrasado ? 'bg-red-50 text-red-700 border-red-100' : 
                        'bg-yellow-50 text-yellow-700 border-yellow-100'
                      }`}>
                        {item.status === 'PAGO' ? 'PAGO' : isAtrasado ? 'ATRASADO' : item.status}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}