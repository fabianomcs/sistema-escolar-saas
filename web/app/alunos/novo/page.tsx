'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft, GraduationCap, DollarSign, HeartPulse, Users, RefreshCw, Sun, Moon, Clock, Lightbulb, Calculator, Percent, CalendarCheck, Baby, FileText, Shield, Camera } from 'lucide-react'
import { maskPhone, maskCurrency, maskCPF } from '@/app/utils/formatters'
import AvatarUpload from '@/components/AvatarUpload'

export default function NovoAlunoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // Listas e Dados
  const [listaTurmas, setListaTurmas] = useState<any[]>([])
  const [listaResponsaveis, setListaResponsaveis] = useState<any[]>([])
  const [tabelaPrecos, setTabelaPrecos] = useState<any[]>([])
  
  // Sugestões Visuais
  const [turnoSelecionadoNaTurma, setTurnoSelecionadoNaTurma] = useState('')
  const [sugestaoSerie, setSugestaoSerie] = useState('')
  const [avisoDescontoIrmao, setAvisoDescontoIrmao] = useState('')

  const [form, setForm] = useState({
    ano_letivo: 2026,
    dia_vencimento: '10',
    foto_url: '',
    
    // Identificação Civil
    nome_completo: '',
    data_nascimento: '',
    naturalidade: '',
    rg_numero: '',
    cpf_aluno: '',
    
    // Acadêmico
    turma_id: '',
    turno_contratado: 'Manhã',
    
    // Financeiro
    responsavel_id: '',
    valor_tabela: 0,
    valor_matricula_base: 0,
    valor_janeiro_base: 0,
    desconto_percentual: 0,
    valor_mensalidade: '',
    
    // Filiação
    nome_mae: '', telefone_mae: '', 
    nome_pai: '', telefone_pai: '',
    
    // Saúde & Inclusão
    carteira_sus: '',
    tipo_sanguineo: '',
    plano_saude: '',
    restricoes_alimentares: '', 
    possui_necessidade_especial: false,
    observacoes_pedagogicas: '',

    // Jurídico
    autoriza_imagem: true,
    restrucao_judicial: ''
  })

  // 1. CARREGAR DADOS
  useEffect(() => {
    async function carregarDados() {
      const { data: turmas } = await supabase.from('turmas').select('*').order('nome')
      const { data: pais } = await supabase.from('responsaveis').select('*').order('nome_completo')
      setListaTurmas(turmas || [])
      setListaResponsaveis(pais || [])
    }
    carregarDados()
  }, [])

  // 2. CARREGAR PREÇOS
  useEffect(() => {
    async function carregarPrecos() {
      const { data: precos } = await supabase.from('tabela_precos').select('*').eq('ano_letivo', form.ano_letivo)
      setTabelaPrecos(precos || [])
      setForm(prev => ({ ...prev, valor_tabela: 0, valor_matricula_base: 0, valor_janeiro_base: 0 }))
    }
    carregarPrecos()
  }, [form.ano_letivo])

  // 3. SUGESTÃO SÉRIE
  useEffect(() => {
    if (!form.data_nascimento) { setSugestaoSerie(''); return }
    const nasc = new Date(form.data_nascimento)
    const anoRef = form.ano_letivo
    const dataCorte = new Date(anoRef, 2, 31)
    let idade = anoRef - nasc.getFullYear()
    const aniversario = new Date(anoRef, nasc.getMonth(), nasc.getDate())
    if (aniversario > dataCorte) idade-- 
    
    // Lógica simplificada de sugestão
    let sug = 'Berçário/Maternal'
    if (idade >= 4) sug = 'Pré-Escola'
    if (idade >= 6) sug = 'Fundamental I'
    
    setSugestaoSerie(`${sug} (Idade corte: ${idade} anos)`)
  }, [form.data_nascimento, form.ano_letivo])

  // 4. CÁLCULO PREÇO
  useEffect(() => {
    if (!form.turma_id) return
    const turma = listaTurmas.find(t => t.id === form.turma_id)
    if (!turma) return
    setTurnoSelecionadoNaTurma(turma.turno)

    const preco = tabelaPrecos.find(p => 
      (turma.nome.includes(p.nivel) || turma.nivel === p.nivel) &&
      p.turno === form.turno_contratado
    )

    if (preco) {
      const vBase = Number(preco.valor_mensalidade)
      const vFinal = vBase - (vBase * (form.desconto_percentual / 100))
      setForm(prev => ({
        ...prev,
        valor_tabela: vBase,
        valor_matricula_base: Number(preco.valor_matricula),
        valor_janeiro_base: Number(preco.valor_janeiro) || 0,
        valor_mensalidade: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vFinal)
      }))
    }
  }, [form.turma_id, form.turno_contratado, tabelaPrecos, form.desconto_percentual])

  // --- HANDLERS ---
  function aoMudarDesconto(novoDesconto: number) {
    setAvisoDescontoIrmao('')
    const vBase = form.valor_tabela
    const vFinal = vBase - (vBase * (novoDesconto / 100))
    setForm(prev => ({
      ...prev,
      desconto_percentual: novoDesconto,
      valor_mensalidade: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(vFinal)
    }))
  }

  async function aoSelecionarResponsavel(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value
    const resp = listaResponsaveis.find(r => r.id === id)
    if (resp) {
      setForm(prev => ({
        ...prev,
        responsavel_id: id,
        nome_pai: resp.nome_completo,
        telefone_pai: resp.telefone_celular,
        nome_mae: resp.nome_secundario || prev.nome_mae,
        telefone_mae: resp.celular_secundario || prev.telefone_mae
      }))
      verificarDescontoIrmaos(id, form.data_nascimento)
    } else setForm(prev => ({ ...prev, responsavel_id: '' }))
  }

  async function verificarDescontoIrmaos(respId: string, dataNascAtual: string) {
    if (!respId || !dataNascAtual) return
    const { data: irmaos } = await supabase.from('alunos').select('data_nascimento, nome_completo').eq('responsavel_id', respId).eq('ativo', true)
    
    if (!irmaos || irmaos.length === 0) { setForm(prev => ({ ...prev, desconto_percentual: 0 })); return }

    const todosFilhos = [...irmaos, { data_nascimento: dataNascAtual, nome_completo: 'Atual' }]
    todosFilhos.sort((a, b) => new Date(a.data_nascimento).getTime() - new Date(b.data_nascimento).getTime())

    if (todosFilhos[0].nome_completo === 'Atual' && todosFilhos.length > 1) {
      const { data: escola } = await supabase.from('escolas').select('desconto_irmaos_percentual').single()
      const desc = escola?.desconto_irmaos_percentual || 10
      setForm(prev => ({ ...prev, desconto_percentual: desc }))
      setAvisoDescontoIrmao(`Primogênito! Desconto de ${desc}% aplicado.`)
    }
  }

  function inverterFiliacao() {
    setForm(prev => ({ ...prev, nome_pai: prev.nome_mae, telefone_pai: prev.telefone_mae, nome_mae: prev.nome_pai, telefone_mae: prev.telefone_pai }))
  }

  // --- SALVAR ---
  async function salvarAluno() {
    if (!form.nome_completo || !form.turma_id || !form.responsavel_id) return alert('Preencha os campos obrigatórios (*)')
    setLoading(true)

    const { data: escola } = await supabase.from('escolas').select('id').single()
    const valorFinal = parseFloat(form.valor_mensalidade.replace('R$', '').replace('.', '').replace(',', '.').trim())
    const valorJan = form.valor_janeiro_base - (form.valor_janeiro_base * (form.desconto_percentual / 100))

    // Insert Completo
    const { data: aluno, error } = await supabase.from('alunos').insert({
      escola_id: escola?.id,
      foto_url: form.foto_url,
      
      // Civil
      nome_completo: form.nome_completo,
      data_nascimento: form.data_nascimento,
      naturalidade: form.naturalidade,
      rg_numero: form.rg_numero,
      cpf_aluno: form.cpf_aluno,
      
      // Acadêmico
      turno_contratado: form.turno_contratado,
      turma_id: form.turma_id,
      
      // Financeiro
      responsavel_id: form.responsavel_id,
      valor_mensalidade: valorFinal,
      desconto_percentual: form.desconto_percentual,
      dia_vencimento: parseInt(form.dia_vencimento),
      
      // Filiação
      nome_mae: form.nome_mae, telefone_mae: form.telefone_mae,
      nome_pai: form.nome_pai, telefone_pai: form.telefone_pai,
      
      // Saúde & Inclusão
      carteira_sus: form.carteira_sus,
      tipo_sanguineo: form.tipo_sanguineo,
      plano_saude: form.plano_saude,
      restricoes_alimentares: form.restricoes_alimentares,
      possui_necessidade_especial: form.possui_necessidade_especial,
      observacoes_pedagogicas: form.observacoes_pedagogicas,
      
      // Jurídico
      autoriza_imagem: form.autoriza_imagem,
      restrucao_judicial: form.restrucao_judicial,
      
      ativo: true
    }).select().single()

    if (error) { setLoading(false); return alert('Erro: ' + error.message) }

    // Carnê
    const cobrancas = []
    const diaVenc = parseInt(form.dia_vencimento)
    
    // A. Matrícula
    cobrancas.push({
      escola_id: escola?.id, aluno_id: aluno.id, responsavel_id: form.responsavel_id,
      valor_original: form.valor_matricula_base, 
      data_vencimento: new Date().toISOString(), descricao: `Matrícula ${form.ano_letivo}`, status: 'PENDENTE'
    })

    // B. Meses
    for (let mes = 0; mes <= 11; mes++) {
      const dt = new Date(form.ano_letivo, mes, diaVenc)
      const nomeMes = dt.toLocaleString('pt-BR', { month: 'long' })
      const nomeMesCap = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)
      
      let gerar = true
      let val = valorFinal
      if (mes === 0) {
        if (form.turno_contratado === 'Integral') val = valorJan
        else gerar = false
      }

      if (gerar) {
        cobrancas.push({
          escola_id: escola?.id, aluno_id: aluno.id, responsavel_id: form.responsavel_id,
          valor_original: val, data_vencimento: dt.toISOString(), descricao: `Mensalidade ${nomeMesCap}/${form.ano_letivo}`, status: 'PENDENTE'
        })
      }
    }

    await supabase.from('cobrancas').insert(cobrancas)
    setLoading(false)
    alert('Matrícula e Prontuário salvos!')
    router.push('/alunos')
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft size={20} /></button>
          <div><h1 className="text-2xl font-bold text-gray-800">Nova Matrícula</h1><p className="text-gray-500 text-sm">Prontuário Completo</p></div>
        </div>
        <div className="bg-white border border-blue-200 rounded-lg p-1 flex items-center shadow-sm">
          <span className="px-3 text-xs font-bold text-blue-800 uppercase">Ano Letivo:</span>
          <select className="bg-blue-50 text-blue-900 font-bold p-2 rounded cursor-pointer outline-none" value={form.ano_letivo} onChange={e => setForm({...form, ano_letivo: Number(e.target.value)})}>
            <option value={2025}>2025</option><option value={2026}>2026</option>
          </select>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-8">
        
        {/* SEÇÃO 1: CIVIL & ACADÊMICO */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-blue-600 border-b pb-2 mb-4"><GraduationCap size={20} /> <h3 className="font-bold">Dados do Aluno</h3></div>
          <div className="flex justify-center mb-6"><AvatarUpload tamanho={140} onUpload={(url) => setForm(prev => ({ ...prev, foto_url: url }))} /></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Nome Completo *</label>
              <input type="text" className="w-full p-3 border rounded-lg" value={form.nome_completo} onChange={e => setForm({...form, nome_completo: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nascimento *</label>
              <input type="date" className="w-full p-3 border rounded-lg" value={form.data_nascimento} onChange={e => setForm({...form, data_nascimento: e.target.value})} />
              {sugestaoSerie && <p className="text-xs text-blue-600 mt-1">{sugestaoSerie}</p>}
            </div>
            {/* NOVOS CAMPOS CIVIS */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Naturalidade/UF</label>
              <input type="text" placeholder="Ex: São Paulo/SP" className="w-full p-3 border rounded-lg" value={form.naturalidade} onChange={e => setForm({...form, naturalidade: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">RG (Opcional)</label>
              <input type="text" className="w-full p-3 border rounded-lg" value={form.rg_numero} onChange={e => setForm({...form, rg_numero: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">CPF Aluno</label>
              <input type="text" className="w-full p-3 border rounded-lg" value={form.cpf_aluno} onChange={e => setForm({...form, cpf_aluno: maskCPF(e.target.value)})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Turno Contratado *</label>
              <select className="w-full p-3 border rounded-lg bg-white" value={form.turno_contratado} onChange={e => setForm({...form, turno_contratado: e.target.value})}>
                <option value="Manhã">Manhã</option><option value="Tarde">Tarde</option><option value="Integral">Integral</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Turma *</label>
              <select className="w-full p-3 border rounded-lg bg-white" value={form.turma_id} onChange={e => setForm(prev => ({ ...prev, turma_id: e.target.value }))}>
                <option value="">Selecione...</option>
                {listaTurmas.map(t => <option key={t.id} value={t.id}>{t.nome} ({t.turno})</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* SEÇÃO 2: FINANCEIRO */}
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 space-y-4">
          <div className="flex items-center gap-2 text-blue-800 border-b border-blue-200 pb-2 mb-4"><DollarSign size={20} /> <h3 className="font-bold">Contrato Financeiro</h3></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Responsável *</label>
              <select className="w-full p-3 border border-blue-200 rounded-lg bg-white" value={form.responsavel_id} onChange={aoSelecionarResponsavel}>
                <option value="">Selecione...</option>
                {listaResponsaveis.map(r => <option key={r.id} value={r.id}>{r.nome_completo} (CPF: {r.cpf})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Dia de Vencimento</label>
              <div className="flex gap-2">
                {['05', '10', '15', '20'].map(dia => (
                  <button key={dia} type="button" onClick={() => setForm({...form, dia_vencimento: dia})} className={`px-3 py-2 rounded font-bold text-sm border ${form.dia_vencimento === dia ? 'bg-blue-600 text-white' : 'bg-white'}`}>{dia}</button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Box de Valores (Igual anterior) */}
          <div className="bg-white p-4 rounded-lg border border-blue-200">
             <div className="flex justify-between text-sm mb-2"><span>Matrícula:</span><strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(form.valor_matricula_base)}</strong></div>
             {form.turno_contratado === 'Integral' && <div className="flex justify-between text-sm text-purple-700 mb-2"><span>Janeiro:</span><strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(form.valor_janeiro_base - (form.valor_janeiro_base * (form.desconto_percentual/100)))}</strong></div>}
             {avisoDescontoIrmao && <div className="text-xs text-green-600 font-bold mb-2 flex items-center gap-1"><Baby size={12}/> {avisoDescontoIrmao}</div>}
             <div className="flex items-center gap-2 mb-2">
                <input type="number" className="w-16 p-1 border rounded text-right text-sm" value={form.desconto_percentual} onChange={e => aoMudarDesconto(Number(e.target.value))} />
                <span className="text-xs">% Desconto</span>
             </div>
             <div className="border-t pt-2 flex justify-between items-center"><span className="text-blue-900 font-bold">Mensalidade Final:</span><span className="text-xl font-bold text-blue-900">{form.valor_mensalidade}</span></div>
          </div>
        </div>

        {/* SEÇÃO 3: SAÚDE E INCLUSÃO (EXPANDIDA) */}
        <div className="space-y-4">
           <div className="flex items-center gap-2 text-red-500 border-b pb-2 mb-4"><HeartPulse size={20} /> <h3 className="font-bold text-gray-700">Saúde & Inclusão</h3></div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div>
               <label className="block text-sm font-bold text-gray-600 mb-1">Cartão SUS</label>
               <input type="text" className="w-full p-2 border rounded" value={form.carteira_sus} onChange={e => setForm({...form, carteira_sus: e.target.value})} />
             </div>
             <div>
               <label className="block text-sm font-bold text-gray-600 mb-1">Tipo Sanguíneo</label>
               <select className="w-full p-2 border rounded bg-white" value={form.tipo_sanguineo} onChange={e => setForm({...form, tipo_sanguineo: e.target.value})}>
                 <option value="">Selecione</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
               </select>
             </div>
             <div>
               <label className="block text-sm font-bold text-gray-600 mb-1">Plano de Saúde</label>
               <input type="text" className="w-full p-2 border rounded" placeholder="Ex: Unimed" value={form.plano_saude} onChange={e => setForm({...form, plano_saude: e.target.value})} />
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label className="block text-sm font-bold text-gray-600 mb-1">Alergias / Restrições</label>
               <textarea rows={2} className="w-full p-2 border rounded" placeholder="Glúten, lactose..." value={form.restricoes_alimentares} onChange={e => setForm({...form, restricoes_alimentares: e.target.value})} />
             </div>
             <div>
               <div className="flex items-center gap-2 mb-1">
                 <input type="checkbox" id="nec" checked={form.possui_necessidade_especial} onChange={e => setForm({...form, possui_necessidade_especial: e.target.checked})} />
                 <label htmlFor="nec" className="text-sm font-bold text-gray-600 cursor-pointer">Possui Necessidade Especial / Laudo?</label>
               </div>
               <textarea rows={2} className="w-full p-2 border rounded" placeholder="Detalhes do laudo/CID..." disabled={!form.possui_necessidade_especial} value={form.observacoes_pedagogicas} onChange={e => setForm({...form, observacoes_pedagogicas: e.target.value})} />
             </div>
           </div>
        </div>

        {/* SEÇÃO 4: JURÍDICO & IMAGEM */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
           <div className="flex items-center gap-2 text-gray-700 border-b pb-2 mb-2"><Shield size={20} /> <h3 className="font-bold">Jurídico e Imagem</h3></div>
           
           <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 p-3 bg-white rounded border cursor-pointer" onClick={() => setForm({...form, autoriza_imagem: !form.autoriza_imagem})}>
               <Camera size={20} className={form.autoriza_imagem ? 'text-green-600' : 'text-gray-400'} />
               <span className="text-sm font-medium">Autoriza uso de imagem (Redes Sociais)</span>
               <div className={`w-10 h-5 rounded-full p-1 ml-2 ${form.autoriza_imagem ? 'bg-green-500' : 'bg-gray-300'}`}>
                 <div className={`w-3 h-3 bg-white rounded-full transition-all ${form.autoriza_imagem ? 'ml-5' : 'ml-0'}`}></div>
               </div>
             </div>
           </div>

           <div>
             <label className="block text-sm font-bold text-gray-600 mb-1">Restrição Judicial (Quem NÃO pode buscar)</label>
             <input type="text" className="w-full p-2 border rounded border-red-200 bg-red-50 text-red-800 placeholder-red-300" placeholder="Se houver, descreva aqui..." value={form.restrucao_judicial} onChange={e => setForm({...form, restrucao_judicial: e.target.value})} />
           </div>
        </div>

        {/* FILIAÇÃO SIMPLES (Para registro) */}
        <div className="grid grid-cols-2 gap-4 border-t pt-4">
           <input type="text" placeholder="Nome do Pai" className="w-full p-2 border rounded" value={form.nome_pai} onChange={e => setForm({...form, nome_pai: e.target.value})} />
           <input type="text" placeholder="Nome da Mãe" className="w-full p-2 border rounded" value={form.nome_mae} onChange={e => setForm({...form, nome_mae: e.target.value})} />
        </div>

        <button onClick={salvarAluno} disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg flex justify-center items-center">
          <Save size={24} className="mr-2"/> {loading ? 'Processando...' : 'Concluir Matrícula'}
        </button>
      </div>
    </div>
  )
}