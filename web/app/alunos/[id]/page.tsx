'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft, User, Phone, DollarSign, Calendar, HeartPulse, Edit, RefreshCw, 
  X, Check, TrendingUp, Users, AlertCircle, CheckCircle, RotateCcw, Wallet, 
  PieChart as IconPie, Printer, Shield, Camera, FileText, Pencil, MessageCircle
} from 'lucide-react'
import { registrarLog } from '@/app/utils/logger'
import { gerarReciboPDF } from '@/app/utils/geradorPDF'
import Tabs from '@/components/Tabs'

export default function DetalhesAlunoPage() {
  const router = useRouter()
  const params = useParams()
  const idAluno = params?.id as string

  // GERAIS
  const [aluno, setAluno] = useState<any>(null)
  const [cobrancas, setCobrancas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [abaAtiva, setAbaAtiva] = useState('Visão Geral')
  const [resumoFin, setResumoFin] = useState({ total: 0, pago: 0, atrasado: 0, pendente: 0 })

  // MODAIS
  const [modalRenovacaoAberto, setModalRenovacaoAberto] = useState(false)
  const [modalBaixaAberto, setModalBaixaAberto] = useState(false)
  const [modalEdicaoCobranca, setModalEdicaoCobranca] = useState(false) 

  // DADOS AUXILIARES
  const [tabelaProximoAno, setTabelaProximoAno] = useState<any[]>([])
  const [regraDescontoIrmao, setRegraDescontoIrmao] = useState(0)
  
  // FORMULÁRIOS
  const [dadosRenovacao, setDadosRenovacao] = useState({
    ano: new Date().getFullYear() + 1, novaSerie: '', novoTurno: '', novoValorMatricula: 0, descontoAplicado: 0, motivoDesconto: ''
  })

  const [cobrancaParaBaixa, setCobrancaParaBaixa] = useState<any>(null)
  const [formBaixa, setFormBaixa] = useState({
    data_pagamento: new Date().toISOString().split('T')[0], valor_pagamento_atual: '', forma_pagamento: 'Pix', observacao: ''
  })

  // FORMULÁRIO DE EDIÇÃO DE COBRANÇA (NEGOCIAÇÃO)
  const [cobrancaEditando, setCobrancaEditando] = useState<any>(null)
  const [formEdicaoCobranca, setFormEdicaoCobranca] = useState({
    novo_valor: '',
    nova_data: '',
    motivo: ''
  })

  // --- CARREGAMENTO ---
  useEffect(() => {
    carregarTudo()
  }, [idAluno])

  async function carregarTudo() {
    if (!idAluno) return

    const { data: dadosAluno } = await supabase.from('alunos').select(`*, turmas (nome, nivel, turno), responsaveis (nome_completo, cpf, telefone_celular, email)`).eq('id', idAluno).single()
    const { data: dadosFin } = await supabase.from('cobrancas').select('*').eq('aluno_id', idAluno).order('data_vencimento', { ascending: true })
    const { data: dadosEscola } = await supabase.from('escolas').select('desconto_irmaos_percentual').single()
    
    setRegraDescontoIrmao(dadosEscola?.desconto_irmaos_percentual || 10)

    let total = 0, pago = 0, atrasado = 0, pendente = 0
    const hoje = new Date()
    hoje.setHours(0,0,0,0)

    dadosFin?.forEach(c => {
      const vTotal = Number(c.valor_original)
      const vPago = Number(c.valor_pago || 0)
      const saldo = vTotal - vPago
      total += vTotal
      pago += vPago
      if (saldo > 0.01) {
        const dtVenc = new Date(c.data_vencimento)
        dtVenc.setHours(0,0,0,0)
        if (dtVenc < hoje && c.status !== 'PAGO') atrasado += saldo
        else pendente += saldo
      }
    })

    setAluno(dadosAluno)
    setCobrancas(dadosFin || [])
    setResumoFin({ total, pago, atrasado, pendente })
    setLoading(false)
  }

  // --- RENOVAÇÃO ---
  const sugerirProximaSerie = (serie: string) => {
     // Lógica simplificada para o exemplo manter o contexto
     if (serie?.includes('Berçário I')) return 'Berçário II'
     // ... adicione outros mapas se necessário
     return serie
  }

  async function abrirRenovacao() {
      const proximoAno = new Date().getFullYear() + 1
      const { data: tabela } = await supabase.from('tabela_precos').select('*').eq('ano_letivo', proximoAno)
      setTabelaProximoAno(tabela || [])
      
      // Lógica Irmãos
      let descontoCalc = 0
      let motivoCalc = ''
      if (aluno.responsavel_id) {
        const { data: irmaos } = await supabase.from('alunos').select('id, data_nascimento').eq('responsavel_id', aluno.responsavel_id).eq('ativo', true)
        if (irmaos && irmaos.length > 1) {
            const irmaosOrd = irmaos.sort((a:any, b:any) => new Date(a.data_nascimento).getTime() - new Date(b.data_nascimento).getTime())
            if (irmaosOrd[0].id === aluno.id) { descontoCalc = regraDescontoIrmao; motivoCalc = 'Primogênito' }
        }
      }

      setDadosRenovacao({ 
          ano: proximoAno, 
          novaSerie: sugerirProximaSerie(aluno.turmas?.nivel || ''), 
          novoTurno: aluno.turno_contratado || 'Manhã', 
          novoValorMatricula: Number(aluno.valor_mensalidade), // Fallback inicial
          descontoAplicado: descontoCalc, 
          motivoDesconto: motivoCalc 
      })
      setModalRenovacaoAberto(true)
  }

  // Efeito para recalcular preço no modal
  useEffect(() => {
    if (!modalRenovacaoAberto) return
    let turnoBusca = dadosRenovacao.novoTurno
    if (['Manhã', 'Tarde'].includes(turnoBusca)) turnoBusca = 'Parcial'

    const preco = tabelaProximoAno.find(p => p.nivel === dadosRenovacao.novaSerie && p.turno === turnoBusca)
    // Matrícula Cheia (Sem desconto)
    const valorBase = preco ? Number(preco.valor_matricula) : Number(aluno.valor_mensalidade)
    
    setDadosRenovacao(prev => ({ ...prev, novoValorMatricula: valorBase }))
  }, [dadosRenovacao.novaSerie, dadosRenovacao.novoTurno, modalRenovacaoAberto])

  async function confirmarRenovacao() {
      setLoading(true)
      // Atualiza desconto para o futuro
      await supabase.from('alunos').update({ desconto_percentual: dadosRenovacao.descontoAplicado, turno_contratado: dadosRenovacao.novoTurno }).eq('id', idAluno)

      const { error } = await supabase.from('cobrancas').insert({
        escola_id: aluno.escola_id, aluno_id: aluno.id, responsavel_id: aluno.responsavel_id,
        valor_original: dadosRenovacao.novoValorMatricula, 
        data_vencimento: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
        descricao: `Matrícula ${dadosRenovacao.ano} (${dadosRenovacao.novaSerie})`, status: 'PENDENTE'
      })
      
      if (error) alert('Erro: ' + error.message)
      else {
        await registrarLog('RENOVACAO_MATRICULA', `Iniciou renovação ${dadosRenovacao.ano}`, `Aluno: ${aluno.nome_completo}`)
        alert(`Boleto de Matrícula gerado!`)
        setModalRenovacaoAberto(false)
        carregarTudo()
      }
      setLoading(false)
  }

  // --- BAIXA ---
  function abrirModalBaixa(cobranca: any) {
    setCobrancaParaBaixa(cobranca)
    const saldo = Number(cobranca.valor_original) - Number(cobranca.valor_pago || 0)
    setFormBaixa({ data_pagamento: new Date().toISOString().split('T')[0], valor_pagamento_atual: saldo.toFixed(2), forma_pagamento: 'Pix', observacao: '' })
    setModalBaixaAberto(true)
  }

  async function confirmarBaixa() {
    if (!formBaixa.valor_pagamento_atual) return alert('Informe o valor.')
    setLoading(true)
    const vAnterior = Number(cobrancaParaBaixa.valor_pago || 0)
    const vAtual = parseFloat(formBaixa.valor_pagamento_atual)
    const vNovoTotal = vAnterior + vAtual
    const vOriginal = Number(cobrancaParaBaixa.valor_original)
    const novoStatus = vNovoTotal >= (vOriginal - 0.01) ? 'PAGO' : 'PARCIAL'

    await supabase.from('cobrancas').update({
      status: novoStatus, data_pagamento: formBaixa.data_pagamento, valor_pago: vNovoTotal,
      forma_pagamento: formBaixa.forma_pagamento,
      observacao: formBaixa.observacao ? (cobrancaParaBaixa.observacao ? cobrancaParaBaixa.observacao + ' | ' : '') + formBaixa.observacao : cobrancaParaBaixa.observacao
    }).eq('id', cobrancaParaBaixa.id)

    await registrarLog('BAIXA_FINANCEIRA', `Recebeu ${vAtual} (${formBaixa.forma_pagamento}) - ${cobrancaParaBaixa.descricao}`, `Aluno: ${aluno.nome_completo}`)
    
    // GATILHO MATRÍCULA -> CARNÊ
    if (novoStatus === 'PAGO' && cobrancaParaBaixa.descricao.toLowerCase().includes('matrícula')) {
         await gerarCarneAnualAposMatricula(cobrancaParaBaixa.descricao)
    }

    setModalBaixaAberto(false)
    carregarTudo()
    setLoading(false)
  }

  async function gerarCarneAnualAposMatricula(descricao: string) {
    const anoMatch = descricao.match(/\d{4}/)
    if (!anoMatch) return
    const ano = parseInt(anoMatch[0])
    const jaTem = cobrancas.some(c => c.descricao.includes(`Mensalidade`) && c.descricao.includes(String(ano)))
    if (jaTem) return

    // Valor Mensalidade (Já está no aluno com desconto aplicado na matrícula/renovação)
    const valorMensal = Number(aluno.valor_mensalidade)
    let valorJan = valorMensal
    
    // Busca Valor Janeiro Integral se necessário
    if (aluno.turno_contratado === 'Integral') {
       const { data: p } = await supabase.from('tabela_precos').select('valor_janeiro').eq('ano_letivo', ano).ilike('nivel', `%${aluno.turmas?.nivel || ''}%`).limit(1).maybeSingle()
       const baseJan = Number(p?.valor_janeiro || 0)
       if (baseJan > 0) valorJan = baseJan - (baseJan * (aluno.desconto_percentual / 100))
    }

    const novas = []
    const dia = aluno.dia_vencimento || 10
    for (let m = 0; m <= 11; m++) {
        let gerar = true
        let val = valorMensal
        if (m === 0) {
            if (aluno.turno_contratado === 'Integral') val = valorJan
            else gerar = false
        }
        if (gerar) {
            const dt = new Date(ano, m, dia); const mesNome = dt.toLocaleString('pt-BR', { month: 'long' })
            novas.push({ escola_id: aluno.escola_id, aluno_id: aluno.id, responsavel_id: aluno.responsavel_id, valor_original: val, data_vencimento: dt.toISOString(), descricao: `Mensalidade ${mesNome}/${ano}`, status: 'PENDENTE' })
        }
    }
    if (novas.length) {
        await supabase.from('cobrancas').insert(novas)
        await registrarLog('GERACAO_AUTOMATICA', `Gerou carnê ${ano}`, `Aluno: ${aluno.nome_completo}`)
        alert(`Carnê ${ano} gerado com sucesso!`)
    }
  }

  async function estornarPagamento(cobranca: any) {
    if (!confirm('Deseja estornar?')) return
    setLoading(true)
    await supabase.from('cobrancas').update({ status: 'PENDENTE', data_pagamento: null, valor_pago: 0, forma_pagamento: null }).eq('id', cobranca.id)
    await registrarLog('ESTORNO', `Estornou ${cobranca.descricao}`, `Aluno: ${aluno.nome_completo}`)
    carregarTudo()
    setLoading(false)
  }

  // --- NOVA FUNÇÃO: EDIÇÃO DE COBRANÇA ---
  function abrirEdicaoCobranca(cobranca: any) {
    setCobrancaEditando(cobranca)
    setFormEdicaoCobranca({ novo_valor: cobranca.valor_original, nova_data: cobranca.data_vencimento.split('T')[0], motivo: '' })
    setModalEdicaoCobranca(true)
  }

  async function salvarEdicaoCobranca() {
    if (!formEdicaoCobranca.motivo) return alert('Informe o motivo (auditoria).')
    setLoading(true)
    await supabase.from('cobrancas').update({
      valor_original: parseFloat(formEdicaoCobranca.novo_valor),
      data_vencimento: formEdicaoCobranca.nova_data,
      observacao: (cobrancaEditando.observacao || '') + ` [Alt: ${formEdicaoCobranca.motivo}]`
    }).eq('id', cobrancaEditando.id)

    await registrarLog('ALTERACAO_BOLETO', `Alterou ${cobrancaEditando.descricao} para ${formEdicaoCobranca.novo_valor}. Motivo: ${formEdicaoCobranca.motivo}`, `Aluno: ${aluno.nome_completo}`)
    setModalEdicaoCobranca(false)
    carregarTudo()
    setLoading(false)
  }

  // Helpers
  const formatarData = (d: string) => d ? new Date(d).toLocaleDateString('pt-BR') : '-'
  const formatarMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
  const linkZap = (tel: string) => tel ? `https://wa.me/55${tel.replace(/\D/g, '')}` : '#'

  if (loading && !modalRenovacaoAberto && !modalBaixaAberto && !modalEdicaoCobranca) return <div className="p-10 text-center">Carregando...</div>
  if (!aluno) return <div className="p-10 text-center text-red-500">Aluno não encontrado.</div>

  const renderConteudoAba = () => {
    switch (abaAtiva) {
      case 'Visão Geral': return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2"><FileText size={18} className="text-blue-500"/> Dados Cadastrais</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-500">Nascimento</p><p className="font-medium">{formatarData(aluno.data_nascimento)}</p></div>
              <div><p className="text-gray-500">Naturalidade</p><p className="font-medium">{aluno.naturalidade || '-'}</p></div>
              <div><p className="text-gray-500">RG</p><p className="font-medium">{aluno.rg_numero || '-'}</p></div>
              <div><p className="text-gray-500">CPF</p><p className="font-medium">{aluno.cpf_aluno || '-'}</p></div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
             <h3 className="font-bold text-gray-800 flex items-center gap-2"><Phone size={18} className="text-green-500"/> Contatos</h3>
             <div className="space-y-3 text-sm">
               {aluno.nome_pai && <div><p className="text-gray-500">Pai</p><p className="font-medium">{aluno.nome_pai}</p><a href={linkZap(aluno.telefone_pai)} target="_blank" className="text-green-600 text-xs flex items-center gap-1"><MessageCircle size={12}/> WhatsApp</a></div>}
               {aluno.nome_mae && <div><p className="text-gray-500">Mãe</p><p className="font-medium">{aluno.nome_mae}</p><a href={linkZap(aluno.telefone_mae)} target="_blank" className="text-green-600 text-xs flex items-center gap-1"><MessageCircle size={12}/> WhatsApp</a></div>}
             </div>
          </div>
        </div>
      )
      case 'Saúde & Inclusão': return (
        <div className="grid grid-cols-1 gap-6 animate-in fade-in">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-red-50 p-4 rounded-lg"><h4 className="text-red-800 font-bold mb-1">Tipo Sanguíneo</h4><p className="text-xl font-bold">{aluno.tipo_sanguineo || '-'}</p></div>
               <div className="bg-blue-50 p-4 rounded-lg"><h4 className="text-blue-800 font-bold mb-1">Cartão SUS</h4><p>{aluno.carteira_sus || '-'}</p></div>
               <div className="bg-gray-50 p-4 rounded-lg"><h4 className="text-gray-800 font-bold mb-1">Plano Saúde</h4><p>{aluno.plano_saude || 'Particular'}</p></div>
            </div>
            <div><h4 className="font-bold text-gray-700 mb-2">Restrições</h4><div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-yellow-900">{aluno.restricoes_alimentares || 'Nenhuma.'}</div></div>
            {aluno.possui_necessidade_especial && <div className="border-t pt-4"><h4 className="font-bold text-purple-700 mb-2">Inclusão / Laudo</h4><p className="text-gray-600">{aluno.observacoes_pedagogicas}</p></div>}
          </div>
        </div>
      )
      case 'Jurídico': return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm animate-in fade-in space-y-4">
           <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
             <span className="font-medium flex items-center gap-2"><Camera size={18}/> Uso de Imagem</span>
             <span className={`px-3 py-1 rounded-full text-xs font-bold ${aluno.autoriza_imagem ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{aluno.autoriza_imagem ? 'AUTORIZADO' : 'NÃO AUTORIZADO'}</span>
           </div>
           {aluno.restrucao_judicial && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800"><h4 className="font-bold mb-1 flex gap-2"><Shield size={18}/> Restrição Judicial</h4><p>{aluno.restrucao_judicial}</p></div>}
        </div>
      )
      case 'Financeiro': default: return (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"><p className="text-xs text-gray-500 uppercase">Total</p><p className="text-lg font-bold text-blue-600">{formatarMoeda(resumoFin.total)}</p></div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"><p className="text-xs text-gray-500 uppercase">Pago</p><p className="text-lg font-bold text-green-600">{formatarMoeda(resumoFin.pago)}</p></div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"><p className="text-xs text-gray-500 uppercase">Em Aberto</p><p className="text-lg font-bold text-yellow-600">{formatarMoeda(resumoFin.total - resumoFin.pago)}</p></div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500"><tr><th className="px-6 py-3">Vencimento</th><th className="px-6 py-3">Descrição</th><th className="px-6 py-3">Valor</th><th className="px-6 py-3 text-center">Status</th><th className="px-6 py-3 text-right">Ação</th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                {cobrancas.map(c => {
                  const pg = Number(c.valor_pago || 0); const tot = Number(c.valor_original); const isP = pg > 0 && pg < tot
                  const vencido = new Date(c.data_vencimento) < new Date() && c.status !== 'PAGO'
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 group">
                      <td className={`px-6 py-4 ${vencido ? 'text-red-600 font-bold' : 'text-gray-600'}`}>{formatarData(c.data_vencimento)}</td>
                      <td className="px-6 py-4 font-medium text-gray-700 flex items-center gap-2">
                         {c.descricao}{c.descricao?.toLowerCase().includes('matrícula') && <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Matrícula</span>}
                         {c.status !== 'PAGO' && <button onClick={() => abrirEdicaoCobranca(c)} className="text-gray-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Editar"><Pencil size={14}/></button>}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-800">{formatarMoeda(tot)}{isP && <div className="text-[10px] text-red-500 font-normal">Resta: {formatarMoeda(tot-pg)}</div>}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${c.status === 'PAGO' ? 'bg-green-100 text-green-700' : isP ? 'bg-yellow-100 text-yellow-700' : vencido ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                          {c.status === 'PAGO' ? 'PAGO' : isP ? 'PARCIAL' : vencido ? 'ATRASADO' : c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-1">
                        {c.status === 'PAGO' ? (
                          <>
                            <button onClick={() => gerarReciboPDF(c, aluno, aluno.responsaveis)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded" title="Recibo"><Printer size={16}/></button>
                            <button onClick={() => estornarPagamento(c)} className="p-1.5 hover:bg-red-50 text-red-500 rounded" title="Estornar"><RotateCcw size={16}/></button>
                          </>
                        ) : (
                          <button onClick={() => abrirModalBaixa(c)} className={`p-1.5 rounded flex items-center gap-1 text-xs font-bold border ${isP ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                            {isP ? <IconPie size={14}/> : <Check size={14}/>} {isP ? 'Completar' : 'Baixar'}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6 pb-10 relative">
      <div className="flex justify-between items-center">
        <button onClick={() => router.back()} className="flex items-center text-gray-500 hover:text-blue-600 font-medium"><ArrowLeft size={20} className="mr-2" /> Voltar</button>
        <div className="flex gap-2">
          <button onClick={abrirRenovacao} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow-sm transition-colors text-sm"><RefreshCw size={16} className="mr-2"/> Renovar</button>
          <button onClick={() => router.push(`/alunos/${idAluno}/editar`)} className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-bold border border-blue-100 hover:bg-blue-100 transition-colors text-sm"><Edit size={16} className="mr-2"/> Editar</button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-center md:items-start">
        <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-3xl border-4 border-white shadow-lg overflow-hidden relative">
          {aluno?.foto_url ? <img src={aluno.foto_url} className="w-full h-full object-cover" /> : <span>{aluno?.nome_completo?.substring(0,2).toUpperCase()}</span>}
        </div>
        <div className="flex-1 text-center md:text-left space-y-1">
          <h1 className="text-2xl font-bold text-gray-800">{aluno?.nome_completo}</h1>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-2">
            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-100">{aluno?.turmas?.nome}</span>
            <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-bold border border-purple-100">{aluno?.turno_contratado}</span>
            <span className={`px-2 py-1 rounded text-xs font-bold border ${aluno?.ativo ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700'}`}>{aluno?.ativo ? 'Ativo' : 'Inativo'}</span>
          </div>
          {aluno?.desconto_percentual > 0 && <div className="inline-flex items-center gap-1 text-yellow-600 text-xs font-bold mt-1"><Users size={12}/> Desconto: {aluno.desconto_percentual}%</div>}
        </div>
      </div>

      <Tabs tabs={['Visão Geral', 'Financeiro', 'Saúde & Inclusão', 'Jurídico']} activeTab={abaAtiva} onChange={setAbaAtiva} />
      
      {renderConteudoAba()}

      {/* MODAL EDIÇÃO COBRANÇA */}
      {modalEdicaoCobranca && cobrancaEditando && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
             <div className="bg-blue-600 p-4 flex justify-between items-center text-white"><h3 className="font-bold flex items-center gap-2"><Pencil size={18}/> Editar Boleto</h3><button onClick={() => setModalEdicaoCobranca(false)} className="hover:bg-blue-700 p-1 rounded"><X size={20}/></button></div>
             <div className="p-6 space-y-4">
               <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 mb-2"><strong>Atenção:</strong> Esta alteração será registrada nos logs.</div>
               <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descrição</label><p className="font-bold text-gray-800">{cobrancaEditando.descricao}</p></div>
               <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Novo Valor (R$)</label><input type="number" step="0.01" className="w-full p-2 border rounded font-bold" value={formEdicaoCobranca.novo_valor} onChange={e => setFormEdicaoCobranca({...formEdicaoCobranca, novo_valor: e.target.value})} /></div>
               <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nova Data</label><input type="date" className="w-full p-2 border rounded" value={formEdicaoCobranca.nova_data} onChange={e => setFormEdicaoCobranca({...formEdicaoCobranca, nova_data: e.target.value})} /></div>
               <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Motivo *</label><textarea className="w-full p-2 border rounded text-sm" rows={2} placeholder="Ex: Acordo..." value={formEdicaoCobranca.motivo} onChange={e => setFormEdicaoCobranca({...formEdicaoCobranca, motivo: e.target.value})} /></div>
             </div>
             <div className="p-4 bg-gray-50 border-t flex gap-2"><button onClick={() => setModalEdicaoCobranca(false)} className="flex-1 py-2 text-gray-600 font-bold border rounded hover:bg-gray-100">Cancelar</button><button onClick={salvarEdicaoCobranca} className="flex-1 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700">Salvar</button></div>
          </div>
        </div>
      )}

      {/* MODAL BAIXA */}
      {modalBaixaAberto && cobrancaParaBaixa && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-green-600 p-4 flex justify-between items-center text-white"><h3 className="font-bold flex items-center gap-2"><Wallet size={20}/> Registrar Pagamento</h3><button onClick={() => setModalBaixaAberto(false)} className="hover:bg-green-700 p-1 rounded"><X size={20}/></button></div>
            <div className="p-6 space-y-4">
               <div><p className="text-xs text-gray-500 uppercase">Referência</p><p className="font-bold text-gray-800">{cobrancaParaBaixa.descricao}</p></div>
               <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data</label><input type="date" className="w-full p-2 border rounded" value={formBaixa.data_pagamento} onChange={e => setFormBaixa({...formBaixa, data_pagamento: e.target.value})} /></div>
               <div className="grid grid-cols-2 gap-2">
                 <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Valor</label><input type="number" step="0.01" className="w-full p-2 border rounded font-bold" value={formBaixa.valor_pagamento_atual} onChange={e => setFormBaixa({...formBaixa, valor_pagamento_atual: e.target.value})} /></div>
                 <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Forma</label><select className="w-full p-2 border rounded" value={formBaixa.forma_pagamento} onChange={e => setFormBaixa({...formBaixa, forma_pagamento: e.target.value})}><option>Pix</option><option>Dinheiro</option><option>Cartão</option></select></div>
               </div>
            </div>
            <div className="p-4 bg-gray-50 border-t flex gap-2"><button onClick={() => setModalBaixaAberto(false)} className="flex-1 py-2 text-gray-600 font-bold border rounded hover:bg-gray-100">Cancelar</button><button onClick={confirmarBaixa} className="flex-1 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700">Confirmar</button></div>
          </div>
        </div>
      )}

      {/* MODAL RENOVAÇÃO */}
      {modalRenovacaoAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-blue-600 p-4 flex justify-between items-center text-white"><h3 className="font-bold flex items-center gap-2"><TrendingUp size={20}/> Renovação {dadosRenovacao.ano}</h3><button onClick={() => setModalRenovacaoAberto(false)} className="hover:bg-blue-700 p-1 rounded"><X size={20}/></button></div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">Confirme os dados para o próximo ano.</p>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Próxima Série</label><select className="w-full p-3 border border-gray-300 rounded-lg bg-white" value={dadosRenovacao.novaSerie} onChange={e => setDadosRenovacao({...dadosRenovacao, novaSerie: e.target.value})}>{Array.from(new Set(tabelaProximoAno.map(p => p.nivel))).map(n => <option key={n} value={n}>{n}</option>)}</select></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Turno</label><select className="w-full p-3 border border-gray-300 rounded-lg bg-white" value={dadosRenovacao.novoTurno} onChange={e => setDadosRenovacao({...dadosRenovacao, novoTurno: e.target.value})}><option>Manhã</option><option>Tarde</option><option>Integral</option></select></div>
              {dadosRenovacao.descontoAplicado > 0 && <div className="bg-yellow-50 p-2 rounded text-xs text-yellow-800 font-bold border border-yellow-200">Primogênito: {dadosRenovacao.descontoAplicado}% desc.</div>}
              <div className="bg-green-50 p-4 rounded border border-green-100 flex justify-between items-center"><span className="text-green-800 font-bold">Matrícula:</span><span className="text-xl font-bold text-green-700">{formatarMoeda(dadosRenovacao.novoValorMatricula)}</span></div>
            </div>
            <div className="p-4 bg-gray-50 border-t flex gap-2"><button onClick={() => setModalRenovacaoAberto(false)} className="flex-1 py-2 text-gray-600 font-bold border rounded hover:bg-gray-100">Cancelar</button><button onClick={confirmarRenovacao} className="flex-1 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700">Confirmar</button></div>
          </div>
        </div>
      )}
    </div>
  )
}