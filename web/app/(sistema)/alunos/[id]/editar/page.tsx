'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import { Save, ArrowLeft, GraduationCap, DollarSign, Users, HeartPulse } from 'lucide-react'
import { maskCurrency, maskPhone } from '@/app/utils/formatters'
import AvatarUpload from '@/components/AvatarUpload'
import { registrarLog } from '@/app/utils/logger' // <--- 1. IMPORT

export default function EditarAlunoPage() {
  const router = useRouter()
  const params = useParams()
  const idAluno = params?.id as string
  const [loading, setLoading] = useState(true)
  
  const [listaTurmas, setListaTurmas] = useState<any[]>([])
  const [listaResponsaveis, setListaResponsaveis] = useState<any[]>([])

  // Estado para guardar dados originais (Para comparar o ANTES e DEPOIS no log)
  const [dadosOriginais, setDadosOriginais] = useState<any>(null)

  const [form, setForm] = useState({
    nome_completo: '',
    foto_url: '',
    data_nascimento: '',
    turma_id: '',
    turno_contratado: '',
    responsavel_id: '',
    valor_mensalidade: '',
    desconto_percentual: 0,
    dia_vencimento: 10,
    nome_mae: '', telefone_mae: '',
    nome_pai: '', telefone_pai: '',
    restricoes_alimentares: '',
    observacoes_pedagogicas: ''
  })

  useEffect(() => {
    async function carregar() {
      const { data: turmas } = await supabase.from('turmas').select('*').order('nome')
      const { data: pais } = await supabase.from('responsaveis').select('*').order('nome_completo')
      setListaTurmas(turmas || [])
      setListaResponsaveis(pais || [])

      const { data: aluno } = await supabase.from('alunos').select('*').eq('id', idAluno).single()
      if (aluno) {
        // Guarda o estado original para auditoria
        setDadosOriginais(aluno)

        setForm({
          nome_completo: aluno.nome_completo || '',
          foto_url: aluno.foto_url || '',
          data_nascimento: aluno.data_nascimento || '',
          turma_id: aluno.turma_id || '',
          turno_contratado: aluno.turno_contratado || 'Manhã',
          responsavel_id: aluno.responsavel_id || '',
          valor_mensalidade: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(aluno.valor_mensalidade || 0),
          desconto_percentual: aluno.desconto_percentual || 0,
          dia_vencimento: aluno.dia_vencimento || 10,
          nome_mae: aluno.nome_mae || '', telefone_mae: aluno.telefone_mae || '',
          nome_pai: aluno.nome_pai || '', telefone_pai: aluno.telefone_pai || '',
          restricoes_alimentares: aluno.restricoes_alimentares || '',
          observacoes_pedagogicas: aluno.observacoes_pedagogicas || ''
        })
      }
      setLoading(false)
    }
    carregar()
  }, [idAluno])

  async function salvarEdicao() {
    setLoading(true)
    const valorLimpo = parseFloat(form.valor_mensalidade.replace('R$', '').replace('.', '').replace(',', '.').trim())

    const dadosAtualizados = {
      nome_completo: form.nome_completo,
      foto_url: form.foto_url,
      data_nascimento: form.data_nascimento,
      turma_id: form.turma_id,
      turno_contratado: form.turno_contratado,
      responsavel_id: form.responsavel_id,
      valor_mensalidade: valorLimpo,
      desconto_percentual: form.desconto_percentual,
      dia_vencimento: Number(form.dia_vencimento),
      nome_mae: form.nome_mae, telefone_mae: form.telefone_mae,
      nome_pai: form.nome_pai, telefone_pai: form.telefone_pai,
      restricoes_alimentares: form.restricoes_alimentares,
      observacoes_pedagogicas: form.observacoes_pedagogicas
    }

    const { error } = await supabase.from('alunos').update(dadosAtualizados).eq('id', idAluno)

    setLoading(false)
    if (error) alert('Erro ao atualizar: ' + error.message)
    else {
      // --- 2. LOG DE AUDITORIA INTELIGENTE ---
      // Verificamos se houve mudança em campos sensíveis
      const alterouFinanceiro = 
        dadosAtualizados.valor_mensalidade !== dadosOriginais.valor_mensalidade ||
        dadosAtualizados.desconto_percentual !== dadosOriginais.desconto_percentual

      const alterouSaude = 
        dadosAtualizados.restricoes_alimentares !== dadosOriginais.restricoes_alimentares

      let tipoAcao = 'EDICAO_CADASTRO_ALUNO'
      if (alterouFinanceiro) tipoAcao = 'EDICAO_FINANCEIRA_ALUNO' // Log mais grave
      if (alterouSaude) tipoAcao = 'EDICAO_SAUDE_ALUNO'

      await registrarLog(
        tipoAcao,
        `Alterou dados do aluno ${form.nome_completo}. ${alterouFinanceiro ? `Novo valor: ${form.valor_mensalidade} (Desc: ${form.desconto_percentual}%)` : ''}`,
        `Aluno: ${form.nome_completo}`,
        { antes: dadosOriginais, depois: dadosAtualizados } // Salva o diff técnico
      )
      // ---------------------------------------

      alert('Dados atualizados com sucesso!')
      router.push(`/alunos/${idAluno}`)
    }
  }

  if (loading) return <div className="p-10 text-center text-gray-500">Carregando edição...</div>

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft size={20} /></button>
        <h1 className="text-2xl font-bold text-gray-800">Editar Aluno</h1>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
        
        <div className="flex justify-center mb-4"><AvatarUpload tamanho={140} urlAtual={form.foto_url} onUpload={(url) => setForm({ ...form, foto_url: url })} /></div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-blue-600 border-b pb-2 mb-4"><GraduationCap size={20} /> <h3 className="font-bold">Acadêmico</h3></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2"><label className="block text-sm font-bold text-gray-700 mb-1">Nome Completo</label><input type="text" className="w-full p-3 border rounded-lg" value={form.nome_completo} onChange={e => setForm({...form, nome_completo: e.target.value})} /></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-1">Nascimento</label><input type="date" className="w-full p-3 border rounded-lg" value={form.data_nascimento} onChange={e => setForm({...form, data_nascimento: e.target.value})} /></div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Turma</label>
              <select className="w-full p-3 border rounded-lg bg-white" value={form.turma_id || ''} onChange={e => setForm({...form, turma_id: e.target.value})}>
                <option value="">Selecione...</option>{listaTurmas.map(t => <option key={t.id} value={t.id}>{t.nome} ({t.nivel})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Turno Contratado</label>
              <select className="w-full p-3 border rounded-lg bg-white" value={form.turno_contratado} onChange={e => setForm({...form, turno_contratado: e.target.value})}>
                <option value="Manhã">Manhã</option><option value="Tarde">Tarde</option><option value="Integral">Integral</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-600 border-b pb-2 mb-4"><DollarSign size={20} /> <h3 className="font-bold">Contrato Financeiro</h3></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Responsável Financeiro</label>
              <select className="w-full p-3 border rounded-lg bg-white" value={form.responsavel_id || ''} onChange={e => setForm({...form, responsavel_id: e.target.value})}>
                {listaResponsaveis.map(r => <option key={r.id} value={r.id}>{r.nome_completo}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-bold text-gray-700 mb-1">Valor Mensalidade (Atual)</label><input type="text" className="w-full p-3 border rounded-lg font-bold" value={form.valor_mensalidade} onChange={e => setForm({...form, valor_mensalidade: maskCurrency(e.target.value)})} /></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-1">% Desconto</label><input type="number" className="w-full p-3 border rounded-lg" value={form.desconto_percentual} onChange={e => setForm({...form, desconto_percentual: Number(e.target.value)})} /></div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-600 border-b pb-2 mb-4"><Users size={20} /> <h3 className="font-bold">Filiação</h3></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input type="text" placeholder="Nome Pai" className="w-full p-2 border rounded" value={form.nome_pai} onChange={e => setForm({...form, nome_pai: e.target.value})} />
            <input type="text" placeholder="Nome Mãe" className="w-full p-2 border rounded" value={form.nome_mae} onChange={e => setForm({...form, nome_mae: e.target.value})} />
          </div>
        </div>

        <div className="space-y-4">
           <div className="flex items-center gap-2 text-red-500 border-b pb-2 mb-4"><HeartPulse size={20} /> <h3 className="font-bold text-gray-700">Saúde</h3></div>
           <textarea className="w-full p-3 border rounded-lg" rows={3} value={form.restricoes_alimentares} onChange={e => setForm({...form, restricoes_alimentares: e.target.value})} />
        </div>

        <button onClick={salvarEdicao} className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex justify-center items-center shadow-md">
          <Save size={20} className="mr-2"/> Salvar Alterações
        </button>
      </div>
    </div>
  )
}