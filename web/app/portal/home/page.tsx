'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { LogOut, User, CheckCircle, Clock, AlertCircle, Copy, ChevronDown, ChevronUp, FileText, Settings, GraduationCap, Save, X } from 'lucide-react'
import { gerarReciboPDF } from '@/app/utils/geradorPDF'

export default function PortalSuperApp() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  
  // DADOS REAIS
  const [responsavel, setResponsavel] = useState<any>(null)
  const [filhos, setFilhos] = useState<any[]>([])
  const [cobrancas, setCobrancas] = useState<any[]>([])

  // ESTADOS DE NAVEGAÇÃO (ABAS)
  const [abaPrincipal, setAbaPrincipal] = useState<'FILHOS' | 'PERFIL'>('FILHOS')
  const [filhoSelecionado, setFilhoSelecionado] = useState<string>('')
  const [subAbaFilho, setSubAbaFilho] = useState<'FINANCEIRO' | 'DADOS'>('FINANCEIRO')

  // ESTADOS DE EDIÇÃO (SOLICITAÇÃO)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [formEdicao, setFormEdicao] = useState<any>({}) // Guarda os dados temporários

  // ESTADO VISUAL
  const [expandido, setExpandido] = useState<string | null>(null)

  useEffect(() => {
    const idResp = sessionStorage.getItem('portal_responsavel_id')
    if (!idResp) { router.push('/portal'); return }
    carregarDados(idResp)
  }, [])

  async function carregarDados(idResp: string) {
    const { data: resp } = await supabase.from('responsaveis').select('*').eq('id', idResp).single()
    setResponsavel(resp)

    const { data: listaFilhos } = await supabase.from('alunos').select('*, turmas(nome)').eq('responsavel_id', idResp).eq('ativo', true)
    setFilhos(listaFilhos || [])
    if (listaFilhos && listaFilhos.length > 0) setFilhoSelecionado(listaFilhos[0].id)

    const { data: listaCobrancas } = await supabase.from('cobrancas').select(`*, alunos(nome_completo)`).eq('responsavel_id', idResp).order('data_vencimento', { ascending: true })
    setCobrancas(listaCobrancas || [])
    
    setLoading(false)
  }

  // --- FUNÇÕES DE EDIÇÃO ---
  function iniciarEdicaoPerfil() {
    setFormEdicao(responsavel) // Copia dados atuais para o form
    setModoEdicao(true)
  }

  async function enviarSolicitacao() {
    const { error } = await supabase.from('solicitacoes_alteracao').insert({
      tipo_entidade: 'RESPONSAVEL',
      entidade_id: responsavel.id,
      dados_novos: formEdicao,
      mensagem_pai: 'Solicitação via Portal'
    })

    if (error) alert('Erro ao enviar: ' + error.message)
    else {
      alert('Sua solicitação foi enviada para a secretaria! Aguarde a aprovação.')
      setModoEdicao(false)
    }
  }

  function copiarPix(valor: number) {
    const codigo = `00020126580014BR.GOV.BCB.PIX0136123...VALOR:${valor.toFixed(2)}`
    navigator.clipboard.writeText(codigo)
    alert('Código Pix copiado!')
  }

  // HELPERS
  const formatarMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
  const formatarData = (d: string) => new Date(d).toLocaleDateString('pt-BR')

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-600 bg-gray-50">Carregando...</div>

  const filhoAtivo = filhos.find(f => f.id === filhoSelecionado)
  const cobrancasDoFilho = cobrancas.filter(c => c.aluno_id === filhoSelecionado)
  const pendentes = cobrancasDoFilho.filter(c => ['PENDENTE', 'ATRASADO', 'PARCIAL'].includes(c.status))
  const historico = cobrancasDoFilho.filter(c => c.status === 'PAGO')

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      
      {/* --- HEADER COM ABAS PRINCIPAIS --- */}
      <div className="bg-blue-700 text-white pt-8 pb-4 px-4 rounded-b-[2rem] shadow-lg relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold border border-white/30 overflow-hidden">
               {responsavel?.foto_url ? <img src={responsavel.foto_url} className="w-full h-full object-cover"/> : responsavel?.nome_completo[0]}
            </div>
            <div><p className="text-blue-200 text-[10px] uppercase font-bold">Bem-vindo</p><h1 className="text-lg font-bold leading-tight">{responsavel?.nome_completo.split(' ')[0]}</h1></div>
          </div>
          <button onClick={() => router.push('/portal')} className="p-2 bg-white/10 rounded-full"><LogOut size={18} /></button>
        </div>

        {/* ABAS SUPERIORES */}
        <div className="flex bg-blue-800/50 p-1 rounded-xl backdrop-blur-sm">
          <button 
            onClick={() => setAbaPrincipal('FILHOS')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${abaPrincipal === 'FILHOS' ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-200 hover:text-white'}`}
          >
            Meus Filhos
          </button>
          <button 
            onClick={() => setAbaPrincipal('PERFIL')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${abaPrincipal === 'PERFIL' ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-200 hover:text-white'}`}
          >
            Perfil Família
          </button>
        </div>
      </div>

      {/* --- CONTEÚDO: ABA FILHOS --- */}
      {abaPrincipal === 'FILHOS' && (
        <div className="px-4 mt-6 space-y-6">
          
          {/* CARROSSEL DE FILHOS (FULL WIDTH) */}
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide justify-center">
            {filhos.map(filho => {
              const isSelected = filhoSelecionado === filho.id
              return (
                <div key={filho.id} onClick={() => setFilhoSelecionado(filho.id)} className={`flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer transition-all ${isSelected ? 'scale-105 opacity-100' : 'opacity-60 scale-95'}`}>
                  <div className={`w-20 h-20 rounded-full overflow-hidden border-4 shadow-sm ${isSelected ? 'border-blue-500' : 'border-white'}`}>
                    {filho.foto_url ? <img src={filho.foto_url} className="w-full h-full object-cover"/> : <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 font-bold text-xl">{filho.nome_completo[0]}</div>}
                  </div>
                  <span className={`text-sm font-bold ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>{filho.nome_completo.split(' ')[0]}</span>
                </div>
              )
            })}
          </div>

          {/* SUB-ABAS DO FILHO */}
          <div className="flex border-b border-gray-200">
            <button onClick={() => setSubAbaFilho('FINANCEIRO')} className={`flex-1 pb-3 text-sm font-bold border-b-2 ${subAbaFilho === 'FINANCEIRO' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-400'}`}>Mensalidades</button>
            <button onClick={() => setSubAbaFilho('DADOS')} className={`flex-1 pb-3 text-sm font-bold border-b-2 ${subAbaFilho === 'DADOS' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-400'}`}>Dados do Aluno</button>
          </div>

          {/* CONTEÚDO SUB-ABA: FINANCEIRO */}
          {subAbaFilho === 'FINANCEIRO' && (
            <div className="space-y-4 animate-in fade-in">
               {pendentes.length === 0 ? (
                 <div className="bg-green-50 p-6 rounded-xl border border-green-100 text-center text-green-700"><CheckCircle size={32} className="mx-auto mb-2"/> Tudo pago!</div>
               ) : (
                 pendentes.map(cobranca => {
                   const vencido = new Date(cobranca.data_vencimento) < new Date()
                   return (
                    <div key={cobranca.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden ${vencido ? 'border-red-200' : 'border-gray-200'}`}>
                      <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => setExpandido(expandido === cobranca.id ? null : cobranca.id)}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${vencido ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>{vencido ? <AlertCircle size={24}/> : <Clock size={24}/>}</div>
                          <div><p className="font-bold text-gray-800 text-sm">{cobranca.descricao}</p><p className={`text-xs font-bold ${vencido ? 'text-red-500' : 'text-gray-400'}`}>Vence: {formatarData(cobranca.data_vencimento)}</p></div>
                        </div>
                        <div className="text-right"><p className="font-bold text-gray-800">{formatarMoeda(Number(cobranca.valor_original) - Number(cobranca.valor_pago || 0))}</p>{expandido === cobranca.id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}</div>
                      </div>
                      {expandido === cobranca.id && <div className="bg-gray-50 p-4 border-t border-gray-100"><button onClick={() => copiarPix(Number(cobranca.valor_original))} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"><Copy size={18}/> Copiar Pix</button></div>}
                    </div>
                   )
                 })
               )}
               
               {historico.length > 0 && (
                 <div className="pt-4">
                   <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Pago Recentemente</h3>
                   {historico.map(c => (
                     <div key={c.id} className="flex justify-between p-3 bg-white border border-gray-100 rounded-lg mb-2 text-sm">
                       <span className="flex items-center gap-2 text-gray-600"><CheckCircle size={14} className="text-green-500"/> {c.descricao}</span>
                       <button onClick={() => gerarReciboPDF(c, filhoAtivo, responsavel)}><FileText size={16} className="text-blue-500"/></button>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          )}

          {/* CONTEÚDO SUB-ABA: DADOS (SOMENTE LEITURA POR ENQUANTO) */}
          {subAbaFilho === 'DADOS' && filhoAtivo && (
            <div className="bg-white p-6 rounded-xl border border-gray-100 space-y-4 animate-in fade-in">
               <div><p className="text-xs text-gray-400 uppercase font-bold">Nome Completo</p><p className="font-medium text-gray-800">{filhoAtivo.nome_completo}</p></div>
               <div><p className="text-xs text-gray-400 uppercase font-bold">Nascimento</p><p className="font-medium text-gray-800">{formatarData(filhoAtivo.data_nascimento)}</p></div>
               <div><p className="text-xs text-gray-400 uppercase font-bold">Turma</p><p className="font-medium text-gray-800">{filhoAtivo.turmas?.nome}</p></div>
               <div className="bg-yellow-50 p-3 rounded text-sm text-yellow-800"><p className="font-bold">Restrições/Saúde:</p><p>{filhoAtivo.restricoes_alimentares || 'Nenhuma'}</p></div>
               <p className="text-xs text-center text-gray-400 mt-4">Para alterar dados do aluno, contate a secretaria.</p>
            </div>
          )}
        </div>
      )}

      {/* --- CONTEÚDO: ABA PERFIL (COM EDIÇÃO) --- */}
      {abaPrincipal === 'PERFIL' && (
        <div className="px-4 mt-6 space-y-6 animate-in slide-in-from-right-5">
          
          {/* CARD DE EDIÇÃO */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2"><User size={18} className="text-blue-600"/> Meus Dados</h3>
              {!modoEdicao ? (
                <button onClick={iniciarEdicaoPerfil} className="text-blue-600 text-xs font-bold border border-blue-200 px-3 py-1 rounded-full hover:bg-blue-50">Solicitar Correção</button>
              ) : (
                <button onClick={() => setModoEdicao(false)} className="text-gray-400"><X size={20}/></button>
              )}
            </div>

            <div className="space-y-4">
              {/* FORMULÁRIO DINÂMICO */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Nome</label>
                <input type="text" className={`w-full p-2 rounded border ${modoEdicao ? 'bg-white border-blue-300' : 'bg-gray-50 border-transparent'}`} 
                  disabled={!modoEdicao} 
                  value={modoEdicao ? formEdicao.nome_completo : responsavel.nome_completo}
                  onChange={e => setFormEdicao({...formEdicao, nome_completo: e.target.value})} 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Celular</label>
                <input type="text" className={`w-full p-2 rounded border ${modoEdicao ? 'bg-white border-blue-300' : 'bg-gray-50 border-transparent'}`} 
                  disabled={!modoEdicao} 
                  value={modoEdicao ? formEdicao.telefone_celular : responsavel.telefone_celular}
                  onChange={e => setFormEdicao({...formEdicao, telefone_celular: e.target.value})} 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">E-mail</label>
                <input type="text" className={`w-full p-2 rounded border ${modoEdicao ? 'bg-white border-blue-300' : 'bg-gray-50 border-transparent'}`} 
                  disabled={!modoEdicao} 
                  value={modoEdicao ? formEdicao.email : responsavel.email}
                  onChange={e => setFormEdicao({...formEdicao, email: e.target.value})} 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Endereço</label>
                <input type="text" className={`w-full p-2 rounded border ${modoEdicao ? 'bg-white border-blue-300' : 'bg-gray-50 border-transparent'}`} 
                  disabled={!modoEdicao} 
                  value={modoEdicao ? formEdicao.endereco_rua : responsavel.endereco_rua}
                  onChange={e => setFormEdicao({...formEdicao, endereco_rua: e.target.value})} 
                />
              </div>

              {modoEdicao && (
                <div className="pt-2">
                  <button onClick={enviarSolicitacao} className="w-full py-3 bg-green-600 text-white font-bold rounded-lg shadow-lg flex items-center justify-center gap-2">
                    <Save size={18}/> Enviar Solicitação
                  </button>
                  <p className="text-[10px] text-center text-gray-400 mt-2">Seus dados serão analisados pela secretaria antes de atualizar.</p>
                </div>
              )}
            </div>
          </div>

          {/* CARD CÔNJUGE (Somente Leitura) */}
          {responsavel.nome_secundario && (
             <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm opacity-75">
               <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><User size={18}/> Cônjuge</h3>
               <div className="space-y-2 text-sm">
                 <p><span className="font-bold">Nome:</span> {responsavel.nome_secundario}</p>
                 <p><span className="font-bold">Celular:</span> {responsavel.celular_secundario}</p>
               </div>
             </div>
          )}

        </div>
      )}

    </div>
  )
}