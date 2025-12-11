'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Trash2, Calendar, ChevronLeft, ChevronRight, Edit, X } from 'lucide-react'
import { maskCurrency } from '@/app/utils/formatters'
import { registrarLog } from '@/app/utils/logger'

export default function ConfiguracaoValoresPage() {
  const [precos, setPrecos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [anoSelecionado, setAnoSelecionado] = useState(2026)

  // Estado para controlar se é Edição ou Criação
  const [idEdicao, setIdEdicao] = useState('')

  const [novo, setNovo] = useState({
    nivel: '',
    turno: 'Parcial',
    valor_matricula: '',
    valor_mensalidade: '',
    valor_janeiro: ''
  })

  useEffect(() => {
    carregarPrecos()
  }, [anoSelecionado])

  async function carregarPrecos() {
    const { data } = await supabase
      .from('tabela_precos')
      .select('*')
      .eq('ano_letivo', anoSelecionado)
      .order('nivel')
    setPrecos(data || [])
  }

  // --- PREPARAR EDIÇÃO ---
  function editarPreco(item: any) {
    setIdEdicao(item.id)
    setNovo({
      nivel: item.nivel,
      turno: item.turno,
      valor_matricula: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor_matricula),
      valor_mensalidade: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor_mensalidade),
      valor_janeiro: item.valor_janeiro ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor_janeiro) : ''
    })
    // Rola para o topo para facilitar
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelarEdicao() {
    setIdEdicao('')
    setNovo({ nivel: '', turno: 'Parcial', valor_matricula: '', valor_mensalidade: '', valor_janeiro: '' })
  }

  // --- SALVAR (CRIAR OU ATUALIZAR) ---
  async function salvarPreco() {
    // 1. Validação
    if (!novo.nivel) return alert('Digite ou selecione o Nível/Série')
    if (!novo.valor_matricula || !novo.valor_mensalidade) return alert('Preencha os valores')
    
    setLoading(true)
    const { data: escola } = await supabase.from('escolas').select('id').single()
    
    // 2. Tratamento de Valores (R$ -> Float)
    const vMatricula = parseFloat(novo.valor_matricula.replace('R$', '').replace('.', '').replace(',', '.').trim())
    const vMensalidade = parseFloat(novo.valor_mensalidade.replace('R$', '').replace('.', '').replace(',', '.').trim())
    const vJaneiro = novo.valor_janeiro ? parseFloat(novo.valor_janeiro.replace('R$', '').replace('.', '').replace(',', '.').trim()) : 0

    const dados = {
      escola_id: escola?.id,
      ano_letivo: anoSelecionado,
      nivel: novo.nivel,
      turno: novo.turno,
      valor_matricula: vMatricula,
      valor_mensalidade: vMensalidade,
      valor_janeiro: vJaneiro
    }

    let error = null

    // 3. Execução no Banco
    if (idEdicao) {
      // UPDATE
      const res = await supabase.from('tabela_precos').update(dados).eq('id', idEdicao)
      error = res.error
    } else {
      // INSERT
      const res = await supabase.from('tabela_precos').insert(dados)
      error = res.error
    }

    // 4. Resultado e Log
    if (error) {
      alert('Erro: ' + error.message)
    } else {
      // --- LOG DE AUDITORIA (O ESPIÃO) ---
      const acaoLog = idEdicao ? 'ALTERACAO_TABELA_PRECO' : 'NOVO_PRECO_TABELA'
      
      await registrarLog(
        acaoLog,
        `Definiu ${novo.nivel} (${novo.turno}) | Mensalidade: ${novo.valor_mensalidade} | Matrícula: ${novo.valor_matricula}`,
        `Tabela ${anoSelecionado}`,
        dados // Salva os dados técnicos no JSON do log
      )
      // -----------------------------------

      // Limpeza do Form
      if (idEdicao) cancelarEdicao()
      else setNovo({ ...novo, turno: 'Parcial', valor_matricula: '', valor_mensalidade: '', valor_janeiro: '' })
      
      carregarPrecos()
    }
    setLoading(false)
  }

  async function deletar(id: string) {
    if (!confirm('Tem certeza? Isso pode afetar a criação de novas turmas baseadas neste preço.')) return
    await supabase.from('tabela_precos').delete().eq('id', id)
    carregarPrecos()
  }

  const mudarAno = (direcao: number) => {
    setAnoSelecionado(prev => prev + direcao)
    cancelarEdicao() // Limpa form se mudar de ano
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tabela de Preços</h1>
          <p className="text-gray-500">Histórico e planejamento de valores anuais.</p>
        </div>

        <div className="flex items-center bg-white border border-gray-300 rounded-lg p-1 shadow-sm">
          <button onClick={() => mudarAno(-1)} className="p-2 hover:bg-gray-100 rounded-md text-gray-600"><ChevronLeft size={20} /></button>
          <div className="px-4 flex items-center font-bold text-xl text-blue-700 min-w-[100px] justify-center">
            <Calendar size={20} className="mr-2 text-blue-500 mb-0.5"/>
            {anoSelecionado}
          </div>
          <button onClick={() => mudarAno(1)} className="p-2 hover:bg-gray-100 rounded-md text-gray-600"><ChevronRight size={20} /></button>
        </div>
      </div>

      {/* FORMULÁRIO (Criação e Edição) */}
      <div className={`p-6 rounded-xl shadow-sm border flex flex-col md:flex-row gap-4 items-end transition-colors ${idEdicao ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100'}`}>
        <div className="w-full md:w-64">
          <label className="block text-sm font-bold text-gray-700 mb-1">Nível / Série</label>
          <input 
            list="sugestoes-niveis" 
            className="w-full p-3 border border-gray-300 rounded-lg bg-white"
            placeholder="Digite ou selecione..."
            value={novo.nivel}
            onChange={e => setNovo({...novo, nivel: e.target.value})}
          />
          <datalist id="sugestoes-niveis">
            <option value="Berçário I" /><option value="Berçário II" />
            <option value="Maternal I" /><option value="Maternal II" /><option value="Maternal III" />
            <option value="1º Período" /><option value="2º Período" />
            <option value="1º Ano Fundamental" /><option value="2º Ano Fundamental" /><option value="3º Ano Fundamental" />
            <option value="4º Ano Fundamental" /><option value="5º Ano Fundamental" />
            <option value="6º Ano Fundamental" /><option value="7º Ano Fundamental" /><option value="8º Ano Fundamental" /><option value="9º Ano Fundamental" />
            <option value="Ensino Médio 1º Ano" /><option value="Ensino Médio 2º Ano" /><option value="Ensino Médio 3º Ano" />
          </datalist>
        </div>

        <div className="w-full md:w-40">
          <label className="block text-sm font-bold text-gray-700 mb-1">Turno</label>
          <select className="w-full p-3 border border-gray-300 rounded-lg bg-white" value={novo.turno} onChange={e => setNovo({...novo, turno: e.target.value})}>
            <option value="Parcial">Parcial</option><option value="Integral">Integral</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-bold text-gray-700 mb-1">Matrícula (1x)</label>
          <input type="text" placeholder="R$ 0,00" className="w-full p-3 border border-gray-300 rounded-lg" value={novo.valor_matricula} onChange={e => setNovo({...novo, valor_matricula: maskCurrency(e.target.value)})} />
        </div>

        <div className="flex-1">
          <label className="block text-sm font-bold text-gray-700 mb-1">Mensalidade</label>
          <input type="text" placeholder="R$ 0,00" className="w-full p-3 border border-gray-300 rounded-lg" value={novo.valor_mensalidade} onChange={e => setNovo({...novo, valor_mensalidade: maskCurrency(e.target.value)})} />
        </div>

        <div className="flex-1 bg-purple-50 p-1 rounded-lg border border-purple-100">
          <label className="block text-xs font-bold text-purple-700 mb-1 ml-1">Janeiro (Extra)</label>
          <input type="text" placeholder="R$ 0,00" className="w-full p-2 border border-purple-200 rounded-lg text-sm bg-white" value={novo.valor_janeiro} onChange={e => setNovo({...novo, valor_janeiro: maskCurrency(e.target.value)})} />
        </div>

        <div className="flex gap-2">
          {idEdicao && (
            <button onClick={cancelarEdicao} className="px-4 py-3 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 font-bold" title="Cancelar Edição">
              <X size={20}/>
            </button>
          )}
          <button onClick={salvarPreco} disabled={loading} className={`px-4 py-3 text-white rounded-lg font-bold shadow-sm flex items-center ${idEdicao ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}>
            {idEdicao ? <Edit size={20}/> : <Plus size={20}/>}
          </button>
        </div>
      </div>

      {/* TABELA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
            <tr>
              <th className="p-4">Nível</th>
              <th className="p-4">Turno</th>
              <th className="p-4">Matrícula</th>
              <th className="p-4">Mensalidade</th>
              <th className="p-4 text-purple-700">Janeiro</th>
              <th className="p-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {precos.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-400">Nenhum preço configurado para {anoSelecionado}.</td></tr>
            ) : precos.map(item => (
              <tr key={item.id} className={`hover:bg-gray-50 ${idEdicao === item.id ? 'bg-blue-50' : ''}`}>
                <td className="p-4 font-bold text-gray-800">{item.nivel}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${item.turno === 'Integral' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {item.turno}
                  </span>
                </td>
                <td className="p-4 text-gray-600">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor_matricula)}</td>
                <td className="p-4 text-green-700 font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor_mensalidade)}</td>
                <td className="p-4 font-bold">
                  {item.turno === 'Integral' ? <span className="text-purple-700">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor_janeiro || 0)}</span> : <span className="text-gray-300">-</span>}
                </td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <button onClick={() => editarPreco(item)} className="text-blue-400 hover:text-blue-600 p-1 bg-blue-50 rounded"><Edit size={16}/></button>
                  <button onClick={() => deletar(item.id)} className="text-gray-400 hover:text-red-600 p-1 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}