'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, User, Phone, Mail, MapPin, DollarSign, Users, ExternalLink, Edit, Briefcase, GraduationCap, Building2, MessageCircle, AlertCircle, Check, X } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { registrarLog } from '@/app/utils/logger'

export default function DetalhesResponsavelPage() {
  const router = useRouter()
  const params = useParams()
  const idResp = params?.id as string

  const [responsavel, setResponsavel] = useState<any>(null)
  const [filhos, setFilhos] = useState<any[]>([])
  const [estatisticas, setEstatisticas] = useState({ pago: 0, pendente: 0, atrasado: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [solicitacaoPendente, setSolicitacaoPendente] = useState<any>(null)

  useEffect(() => {
    carregarDados()
  }, [idResp])

  async function carregarDados() {
    if (!idResp) return

    const { data: resp } = await supabase.from('responsaveis').select('*').eq('id', idResp).single()
    
    const { data: solicitacao } = await supabase.from('solicitacoes_alteracao').select('*').eq('entidade_id', idResp).eq('status', 'PENDENTE').single()
    setSolicitacaoPendente(solicitacao)

    const { data: listaFilhos } = await supabase.from('alunos').select('*, turmas(nome, nivel)').eq('responsavel_id', idResp)

    const { data: cobrancas } = await supabase.from('cobrancas').select('valor_original, status').eq('responsavel_id', idResp)

    let pago = 0, pendente = 0, atrasado = 0
    cobrancas?.forEach(c => {
      const val = Number(c.valor_original)
      if (c.status === 'PAGO') pago += val
      else if (c.status === 'ATRASADO') atrasado += val
      else pendente += val
    })

    setResponsavel(resp)
    setFilhos(listaFilhos || [])
    setEstatisticas({ pago, pendente, atrasado, total: pago + pendente + atrasado })
    setLoading(false)
  }

  async function aprovarSolicitacao() {
    if (!confirm('Confirma a atualização dos dados?')) return
    setLoading(true)
    
    const { error } = await supabase.from('responsaveis').update(solicitacaoPendente.dados_novos).eq('id', idResp)
    if (error) { alert('Erro: ' + error.message); setLoading(false); return }

    await supabase.from('solicitacoes_alteracao').update({ status: 'APROVADO' }).eq('id', solicitacaoPendente.id)
    await registrarLog('APROVACAO_CADASTRO', `Aprovou alteração solicitada`, `Resp: ${responsavel.nome_completo}`)
    
    alert('Dados atualizados!')
    window.location.reload()
  }

  async function rejeitarSolicitacao() {
    const motivo = prompt('Motivo da rejeição:')
    setLoading(true)
    await supabase.from('solicitacoes_alteracao').update({ status: 'REJEITADO', mensagem_pai: motivo || 'Rejeitado' }).eq('id', solicitacaoPendente.id)
    alert('Rejeitado.')
    window.location.reload()
  }

  const renderDiff = (label: string, chave: string) => {
    const antigo = responsavel[chave] || '(vazio)'
    const novo = solicitacaoPendente.dados_novos[chave] || '(vazio)'
    if (antigo !== novo) return <div className="text-sm mb-1"><span className="font-bold text-gray-600">{label}: </span><span className="text-red-400 line-through mr-2">{antigo}</span><span className="text-green-600 font-bold">{novo}</span></div>
    return null
  }

  const formatarMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
  const linkZap = (tel: string) => tel ? `https://wa.me/55${tel.replace(/\D/g, '')}` : '#'
  const dadosGrafico = [{ name: 'Pago', value: estatisticas.pago, color: '#22c55e' }, { name: 'Pendente', value: estatisticas.pendente, color: '#eab308' }, { name: 'Atrasado', value: estatisticas.atrasado, color: '#ef4444' }].filter(d => d.value > 0)

  if (loading) return <div className="p-10 text-center text-gray-500">Carregando...</div>
  if (!responsavel) return <div className="p-10 text-center text-red-500">Responsável não encontrado.</div>

  return (
    <div className="space-y-6 pb-10">
      
      <div className="flex justify-between items-center">
        <button onClick={() => router.back()} className="flex items-center text-gray-500 hover:text-blue-600 font-medium"><ArrowLeft size={20} className="mr-2" /> Voltar</button>
        <div className="flex items-center gap-3">
          <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-mono">CPF: {responsavel.cpf}</span>
          <button onClick={() => router.push(`/responsaveis/${idResp}/editar`)} className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-bold border border-blue-100 hover:bg-blue-100 transition-colors"><Edit size={16} className="mr-2"/> Editar</button>
        </div>
      </div>

      {solicitacaoPendente && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-yellow-100 text-yellow-700 rounded-full"><AlertCircle size={24} /></div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-yellow-800">Solicitação de Alteração Pendente</h3>
              <p className="text-sm text-yellow-700 mb-4">O responsável enviou novos dados via Portal.</p>
              <div className="bg-white p-4 rounded-lg border border-yellow-100 mb-4">
                {renderDiff('Nome', 'nome_completo')}
                {renderDiff('Celular', 'telefone_celular')}
                {renderDiff('E-mail', 'email')}
                {renderDiff('Endereço', 'endereco_rua')}
                {!renderDiff('Nome', 'nome_completo') && !renderDiff('Celular', 'telefone_celular') && <p className="text-sm text-gray-500 italic">Verifique outros campos...</p>}
              </div>
              <div className="flex gap-3">
                <button onClick={aprovarSolicitacao} className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 flex items-center gap-2"><Check size={18}/> Aprovar</button>
                <button onClick={rejeitarSolicitacao} className="px-4 py-2 bg-white text-red-600 font-bold rounded-lg border border-red-200 hover:bg-red-50 flex items-center gap-2"><X size={18}/> Rejeitar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center gap-4 border-b pb-6">
            <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-2xl border-4 border-gray-50 shadow-sm overflow-hidden relative">{responsavel.foto_url ? <img src={responsavel.foto_url} className="w-full h-full object-cover" /> : <span>{responsavel.nome_completo[0]}</span>}</div>
            <div><h1 className="text-2xl font-bold text-gray-800">{responsavel.nome_completo}</h1><p className="text-sm text-gray-500">Responsável Financeiro</p>{responsavel.rg && <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 mt-2 inline-block">RG: {responsavel.rg}</span>}</div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-gray-400 text-xs uppercase font-bold">Celular</p><a href={linkZap(responsavel.telefone_celular)} target="_blank" className="text-green-600 font-bold hover:underline flex items-center gap-1"><Phone size={14}/> {responsavel.telefone_celular}</a></div>
                <div><p className="text-gray-400 text-xs uppercase font-bold">E-mail</p><p className="text-gray-700 truncate">{responsavel.email}</p></div>
                {responsavel.telefone_comercial && <div><p className="text-gray-400 text-xs uppercase font-bold">Tel. Comercial</p><p className="text-gray-700 flex items-center gap-1"><Building2 size={14}/> {responsavel.telefone_comercial}</p></div>}
            </div>
            {responsavel.profissao && <div className="pt-2 border-t border-gray-50"><p className="text-gray-400 text-xs uppercase font-bold mb-1">Ocupação</p><div className="flex items-center gap-2 text-gray-700 text-sm"><Briefcase size={16} className="text-blue-500"/>{responsavel.profissao} {responsavel.local_trabalho ? `em ${responsavel.local_trabalho}` : ''}</div></div>}
            <div className="pt-2 border-t border-gray-50"><p className="text-gray-400 text-xs uppercase font-bold mb-1">Endereço</p><p className="text-sm text-gray-600 flex items-start gap-2"><MapPin size={16} className="text-gray-400 mt-0.5 shrink-0"/>{responsavel.endereco_rua}, {responsavel.endereco_numero} - {responsavel.endereco_bairro} <br/>{responsavel.endereco_cidade}/{responsavel.endereco_uf}</p></div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between flex-1">
              <div className="flex justify-between items-start"><div><h3 className="font-bold text-gray-800 flex items-center gap-2"><DollarSign size={20} className="text-green-600"/> Saúde Financeira</h3><p className="text-sm text-gray-500 mt-1">Consolidado</p></div><div className="text-right"><p className="text-xs text-gray-400 uppercase">Total Contrato</p><p className="text-xl font-bold text-gray-800">{formatarMoeda(estatisticas.total)}</p></div></div>
              <div className="flex items-center mt-6 justify-center md:justify-start">
                <div className="h-32 w-32 relative"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={dadosGrafico} innerRadius={30} outerRadius={50} paddingAngle={5} dataKey="value">{dadosGrafico.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}</Pie><Tooltip formatter={(value) => formatarMoeda(Number(value))} /></PieChart></ResponsiveContainer></div>
                <div className="ml-6 space-y-2 flex-1"><div className="flex justify-between text-xs"><span className="flex items-center gap-2 text-gray-600"><div className="w-2 h-2 rounded-full bg-green-500"></div> Pago</span><span className="font-bold text-gray-800">{formatarMoeda(estatisticas.pago)}</span></div><div className="flex justify-between text-xs"><span className="flex items-center gap-2 text-gray-600"><div className="w-2 h-2 rounded-full bg-red-500"></div> Atrasado</span><span className="font-bold text-red-600">{formatarMoeda(estatisticas.atrasado)}</span></div></div>
              </div>
            </div>
            {responsavel.nome_secundario && <div className="bg-gray-50 p-5 rounded-xl border border-gray-200"><h4 className="text-gray-500 text-xs font-bold uppercase mb-3 flex items-center gap-2"><Users size={14}/> Cônjuge / Secundário</h4><div className="flex justify-between items-start"><div><p className="font-bold text-gray-800 text-lg">{responsavel.nome_secundario}</p><div className="text-sm text-gray-600 space-y-1 mt-1"><p>CPF: {responsavel.cpf_secundario}</p><p>{responsavel.email_secundario}</p></div></div><a href={linkZap(responsavel.celular_secundario)} target="_blank" className="p-2 bg-white rounded-full text-green-600 hover:text-green-700 shadow-sm border border-gray-200"><MessageCircle size={20}/></a></div></div>}
        </div>
      </div>

      {/* LISTA DE FILHOS (VOLTOU!) */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Users size={20}/> Filhos Matriculados ({filhos.length})</h3>
        {filhos.length === 0 ? <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-10 text-center text-gray-500">Nenhum aluno vinculado.</div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filhos.map(filho => (
              <div key={filho.id} onClick={() => router.push(`/alunos/${filho.id}`)} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden">
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${filho.ativo ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                <div className="flex justify-between items-start pl-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200">{filho.foto_url ? <img src={filho.foto_url} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xs">{filho.nome_completo[0]}</div>}</div>
                    <div><h4 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition-colors line-clamp-1">{filho.nome_completo}</h4><span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded font-bold border border-gray-200">{filho.turmas?.nome || 'Sem turma'}</span></div>
                  </div>
                  <ExternalLink size={16} className="text-gray-300 group-hover:text-blue-500" />
                </div>
                <div className="mt-4 pl-3 flex justify-between items-end border-t border-gray-50 pt-3">
                  <div><p className="text-xs text-gray-400 uppercase">Mensalidade</p><p className="font-bold text-gray-700">{formatarMoeda(filho.valor_mensalidade)}</p></div>
                  <span className={`text-xs px-2 py-1 rounded-full font-bold ${filho.ativo ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{filho.ativo ? 'Ativo' : 'Inativo'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}