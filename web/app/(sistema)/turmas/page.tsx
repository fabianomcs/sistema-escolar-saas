'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Users, Sun, Moon, Clock, DollarSign, Edit, ExternalLink } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { registrarLog } from '@/app/utils/logger' // <--- 1. IMPORT NOVO

export default function TurmasPage() {
  const router = useRouter()
  const [turmas, setTurmas] = useState<any[]>([])
  const [categoriasPreco, setCategoriasPreco] = useState<string[]>([])

  // Form States
  const [idEdicao, setIdEdicao] = useState('')
  const [novoNome, setNovoNome] = useState('')
  const [novoNivel, setNovoNivel] = useState('')
  const [novoTurno, setNovoTurno] = useState('Manhã')
  const [novoLimite, setNovoLimite] = useState(30)
  const [loading, setLoading] = useState(false)

  useEffect(() => { carregarTudo() }, [])

  async function carregarTudo() {
    const { data: dadosTurmas } = await supabase.from('turmas').select('*, alunos(id)').order('nome')
    setTurmas(dadosTurmas || [])

    const { data: dadosPrecos } = await supabase.from('tabela_precos').select('nivel').eq('ano_letivo', 2026)
    if (dadosPrecos) {
      const niveisUnicos = Array.from(new Set(dadosPrecos.map(p => p.nivel))).sort()
      setCategoriasPreco(niveisUnicos)
      if (niveisUnicos.length > 0 && !idEdicao) setNovoNivel(niveisUnicos[0])
    }
  }

  function abrirGestaoTurma(id: string) {
    router.push(`/turmas/${id}`)
  }

  function editarTurma(e: React.MouseEvent, turma: any) {
    e.stopPropagation()
    setIdEdicao(turma.id)
    setNovoNome(turma.nome)
    setNovoNivel(turma.nivel)
    setNovoTurno(turma.turno)
    setNovoLimite(turma.capacidade)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelarEdicao() {
    setIdEdicao('')
    setNovoNome('')
    if (categoriasPreco.length > 0) setNovoNivel(categoriasPreco[0])
    setNovoLimite(30)
  }

  // --- SALVAR COM LOG ---
  async function salvarTurma() {
    if (!novoNome) return alert('Digite o nome da turma')
    if (!novoNivel) return alert('Selecione um Nível de Preço')
    
    setLoading(true)
    const { data: escola } = await supabase.from('escolas').select('id').single()

    const dados = {
      escola_id: escola?.id,
      nome: novoNome,
      nivel: novoNivel,
      turno: novoTurno,
      capacidade: novoLimite
    }

    let error = null

    if (idEdicao) {
      // UPDATE
      const res = await supabase.from('turmas').update(dados).eq('id', idEdicao)
      error = res.error
      if (!error) {
        await registrarLog('EDICAO_TURMA', `Alterou a turma: ${novoNome} (${novoTurno})`, 'Turmas', dados)
      }
    } else {
      // INSERT
      const res = await supabase.from('turmas').insert(dados)
      error = res.error
      if (!error) {
        await registrarLog('CRIACAO_TURMA', `Criou nova turma: ${novoNome} (${novoTurno})`, 'Turmas', dados)
      }
    }

    setLoading(false)
    if (error) alert('Erro: ' + error.message)
    else {
      cancelarEdicao()
      carregarTudo()
    }
  }

  // --- EXCLUIR COM LOG ---
  // Agora recebe o objeto 'turma' inteiro para poder logar o nome
  async function deletarTurma(e: React.MouseEvent, turma: any) {
    e.stopPropagation()
    const totalAlunos = turma.alunos?.length || 0

    if (totalAlunos > 0) return alert('Esvazie a turma antes de excluir!')
    if (!confirm(`Tem certeza que deseja excluir a turma "${turma.nome}"?`)) return
    
    const { error } = await supabase.from('turmas').delete().eq('id', turma.id)
    
    if (!error) {
      // 2. REGISTRA O LOG
      await registrarLog('EXCLUSAO_TURMA', `Excluiu a turma: ${turma.nome} (${turma.nivel})`, 'Turmas')
      carregarTudo()
    } else {
      alert('Erro ao excluir: ' + error.message)
    }
  }

  const IconeTurno = ({ turno }: { turno: string }) => {
    if (turno === 'Manhã') return <Sun size={14} className="mr-1" />
    if (turno === 'Tarde') return <Moon size={14} className="mr-1" />
    return <Clock size={14} className="mr-1" />
  }

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Gerenciar Turmas</h1>
        <p className="text-gray-500">Crie, edite e organize os alunos nas salas.</p>
      </div>

      {/* FORMULÁRIO */}
      <div className={`p-6 rounded-xl shadow-sm border flex flex-col md:flex-row gap-4 items-end transition-colors ${idEdicao ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-100'}`}>
        <div className="flex-1 w-full">
          <label className="block text-sm font-bold text-gray-700 mb-1">Nome da Sala</label>
          <input type="text" value={novoNome} onChange={e => setNovoNome(e.target.value)} placeholder="Ex: 1º Ano A" className="w-full p-3 border border-gray-300 rounded-lg" />
        </div>
        
        <div className="w-full md:w-64">
          <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center"><DollarSign size={14} className="mr-1 text-green-600"/> Categoria de Preço</label>
          <select value={novoNivel} onChange={e => setNovoNivel(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white">
            {categoriasPreco.length === 0 && <option>Sem preços cadastrados</option>}
            {categoriasPreco.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div className="w-full md:w-40">
          <label className="block text-sm font-bold text-gray-700 mb-1">Turno</label>
          <select value={novoTurno} onChange={e => setNovoTurno(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white">
            <option value="Manhã">Manhã</option><option value="Tarde">Tarde</option><option value="Integral">Integral</option>
          </select>
        </div>

        <div className="w-full md:w-24">
          <label className="block text-sm font-bold text-gray-700 mb-1">Vagas</label>
          <input type="number" value={novoLimite} onChange={e => setNovoLimite(Number(e.target.value))} className="w-full p-3 border border-gray-300 rounded-lg" />
        </div>

        <div className="flex gap-2">
          {idEdicao && <button onClick={cancelarEdicao} className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold shadow-sm">Cancelar</button>}
          <button onClick={salvarTurma} disabled={loading} className={`px-6 py-3 text-white rounded-lg font-bold shadow-sm flex items-center justify-center ${idEdicao ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {idEdicao ? <Edit size={20} className="mr-2"/> : <Plus size={20} className="mr-2"/>}
            {idEdicao ? 'Atualizar' : 'Criar'}
          </button>
        </div>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {turmas.map(turma => {
          const totalAlunos = turma.alunos?.length || 0
          const capacidade = turma.capacidade || 30
          const pct = (totalAlunos / capacidade) * 100
          let cor = '#3b82f6'
          if (pct > 80) cor = '#f59e0b'
          if (pct >= 100) cor = '#ef4444'
          const dadosGrafico = [{ name: 'Ocupado', value: totalAlunos }, { name: 'Livre', value: Math.max(0, capacidade - totalAlunos) }]

          return (
            <div 
              key={turma.id} 
              onClick={() => abrirGestaoTurma(turma.id)}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 relative overflow-hidden group hover:shadow-md hover:border-blue-300 cursor-pointer transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    {turma.nome}
                    <ExternalLink size={14} className="text-gray-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"/>
                  </h3>
                  <div className="flex flex-col gap-1 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded font-bold bg-green-50 text-green-700 border border-green-100 truncate max-w-[200px]">{turma.nivel}</span>
                    <span className={`text-xs px-2 py-0.5 rounded font-bold flex items-center w-fit border ${turma.turno === 'Integral' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                      <IconeTurno turno={turma.turno} /> {turma.turno}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={(e) => editarTurma(e, turma)} className="text-gray-300 hover:text-blue-500 p-1 hover:bg-blue-50 rounded"><Edit size={16} /></button>
                  {/* Passando o objeto turma inteiro para o delete */}
                  <button onClick={(e) => deletarTurma(e, turma)} className="text-gray-300 hover:text-red-500 p-1 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 border-t pt-3 border-gray-50">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Lotação</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-800">{totalAlunos}</span>
                    <span className="text-sm text-gray-400">/ {capacidade}</span>
                  </div>
                </div>
                <div className="relative w-14 h-14">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={dadosGrafico} innerRadius={15} outerRadius={25} paddingAngle={5} dataKey="value">
                        <Cell fill={cor} /><Cell fill="#f3f4f6" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}