'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft, MapPin, User, Users, MessageCircle, CheckCircle, Briefcase, GraduationCap, FileText } from 'lucide-react'
import { maskCPF, maskPhone, validarCPF } from '@/app/utils/formatters'
import AvatarUpload from '@/components/AvatarUpload'

export default function NovoResponsavelPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingCep, setLoadingCep] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  const [form, setForm] = useState({
    foto_url: '',
    
    // Responsável Principal
    nome_completo: '',
    cpf: '',
    rg: '', // Novo
    escolaridade: '', // Novo
    profissao: '', // Novo
    local_trabalho: '', // Novo
    telefone_comercial: '', // Novo
    email: '',
    telefone_celular: '',
    
    // Segundo Responsável (Opcional)
    nome_secundario: '',
    cpf_secundario: '',
    rg_secundario: '', // Novo
    escolaridade_secundario: '', // Novo
    profissao_secundario: '', // Novo
    email_secundario: '',
    celular_secundario: '',

    // Endereço (Compartilhado)
    endereco_cep: '',
    endereco_rua: '',
    endereco_numero: '',
    endereco_bairro: '',
    endereco_cidade: '',
    endereco_uf: ''
  })

  // Lista de Escolaridade
  const niveisEscolaridade = [
    "Fundamental Incompleto", "Fundamental Completo",
    "Médio Incompleto", "Médio Completo",
    "Superior Incompleto", "Superior Completo",
    "Pós-Graduação / Especialização",
    "Mestrado / Doutorado"
  ]

  // --- BUSCA CEP ---
  async function buscarCep() {
    const cepLimpo = form.endereco_cep.replace(/\D/g, '')
    if (cepLimpo.length !== 8) return

    setLoadingCep(true)
    try {
      const resp = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const dados = await resp.json()
      if (!dados.erro) {
        setForm(prev => ({
          ...prev,
          endereco_rua: dados.logradouro,
          endereco_bairro: dados.bairro,
          endereco_cidade: dados.localidade,
          endereco_uf: dados.uf
        }))
        document.getElementById('numero-casa')?.focus()
      } else {
        alert('CEP não encontrado!')
      }
    } catch (err) { console.error(err) }
    setLoadingCep(false)
  }

  // --- SALVAR ---
  async function salvar() {
    // Validação Principal
    if (!form.nome_completo || !form.cpf || !form.email || !form.telefone_celular) {
      return alert('Preencha os dados obrigatórios do Responsável Principal (*)')
    }
    if (!validarCPF(form.cpf)) return alert('CPF do Principal inválido!')

    setLoading(true)
    const { data: escola } = await supabase.from('escolas').select('id').single()

    const { error } = await supabase.from('responsaveis').insert({
      escola_id: escola?.id,
      ...form
    })

    setLoading(false)

    if (error) alert('Erro ao salvar: ' + error.message)
    else setSucesso(true)
  }

  // --- GERADOR DE LINK WHATSAPP ---
  const gerarLinkZap = (nome: string, cpf: string, celular: string) => {
    if (!celular) return '#'
    const celLimpo = celular.replace(/\D/g, '')
    const primeiroNome = nome.split(' ')[0]
    const senha = `${primeiroNome.toLowerCase()}@${cpf.replace(/\D/g, '').slice(-4)}`
    const msg = `Olá ${primeiroNome}! Cadastro realizado na Escola.\n\nAcesse o portal financeiro:\nLogin: ${cpf}\nSenha: ${senha}\n\nLink: https://escola.com.br/portal`
    return `https://wa.me/55${celLimpo}?text=${encodeURIComponent(msg)}`
  }

  // --- TELA DE SUCESSO ---
  if (sucesso) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg border border-green-100 text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Cadastro Realizado!</h2>
        
        <div className="space-y-3">
          <p className="text-gray-600">Envie os acessos para os responsáveis:</p>
          
          <a href={gerarLinkZap(form.nome_completo, form.cpf, form.telefone_celular)} target="_blank" 
            className="w-full py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 flex justify-center items-center shadow-md">
            <MessageCircle size={20} className="mr-2"/> 
            WhatsApp Principal ({form.nome_completo.split(' ')[0]})
          </a>

          {form.nome_secundario && (
            <a href={gerarLinkZap(form.nome_secundario, form.cpf_secundario, form.celular_secundario)} target="_blank" 
              className="w-full py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 flex justify-center items-center shadow-md">
              <MessageCircle size={20} className="mr-2"/> 
              WhatsApp Secundário ({form.nome_secundario.split(' ')[0]})
            </a>
          )}

          <button onClick={() => router.push('/responsaveis')} className="w-full py-3 text-gray-500 hover:bg-gray-50 rounded-lg">
            Voltar para Lista
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft size={20} /></button>
        <h1 className="text-2xl font-bold text-gray-800">Novo Cadastro Familiar</h1>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-8">
        
        {/* 1. RESPONSÁVEL PRINCIPAL */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-blue-600 border-b pb-2 mb-4">
            <User size={20} /> <h3 className="font-bold">Responsável Financeiro (Principal)</h3>
          </div>

          <div className="flex justify-center mb-6">
            <AvatarUpload tamanho={120} onUpload={(url) => setForm(prev => ({ ...prev, foto_url: url }))} />
          </div>

          {/* Dados Pessoais */}
          <h4 className="text-xs font-bold text-gray-400 uppercase">Dados Pessoais</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Nome Completo *</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded-lg"
                value={form.nome_completo} onChange={e => setForm({...form, nome_completo: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Escolaridade</label>
              <select className="w-full p-2 border border-gray-300 rounded-lg bg-white" value={form.escolaridade} onChange={e => setForm({...form, escolaridade: e.target.value})}>
                <option value="">Selecione...</option>
                {niveisEscolaridade.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          {/* Documentos e Contato */}
          <h4 className="text-xs font-bold text-gray-400 uppercase mt-2">Documentos & Contato</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">CPF *</label>
              <input type="text" className={`w-full p-2 border rounded-lg ${form.cpf && !validarCPF(form.cpf) ? 'border-red-500' : 'border-gray-300'}`}
                value={form.cpf} maxLength={14} onChange={e => setForm({...form, cpf: maskCPF(e.target.value)})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">RG</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded-lg"
                value={form.rg} onChange={e => setForm({...form, rg: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Celular (WhatsApp) *</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded-lg"
                value={form.telefone_celular} maxLength={15} onChange={e => setForm({...form, telefone_celular: maskPhone(e.target.value)})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">E-mail *</label>
              <input type="email" className="w-full p-2 border border-gray-300 rounded-lg"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
          </div>

          {/* Profissional */}
          <h4 className="text-xs font-bold text-gray-400 uppercase mt-2">Profissional</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Profissão</label>
              <div className="relative">
                <input type="text" className="w-full p-2 border border-gray-300 rounded-lg pl-8"
                  value={form.profissao} onChange={e => setForm({...form, profissao: e.target.value})} />
                <Briefcase size={14} className="absolute left-2.5 top-3 text-gray-400"/>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Local de Trabalho</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded-lg"
                value={form.local_trabalho} onChange={e => setForm({...form, local_trabalho: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tel. Comercial</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded-lg"
                value={form.telefone_comercial} maxLength={15} onChange={e => setForm({...form, telefone_comercial: maskPhone(e.target.value)})} />
            </div>
          </div>
        </div>

        {/* 2. SEGUNDO RESPONSÁVEL */}
        <div className="space-y-4 bg-gray-50 p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 text-gray-600 border-b pb-2 mb-4">
            <Users size={20} /> <h3 className="font-bold">Segundo Responsável (Cônjuge)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded-lg"
                value={form.nome_secundario} onChange={e => setForm({...form, nome_secundario: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Escolaridade</label>
              <select className="w-full p-2 border border-gray-300 rounded-lg bg-white" value={form.escolaridade_secundario} onChange={e => setForm({...form, escolaridade_secundario: e.target.value})}>
                <option value="">Selecione...</option>
                {niveisEscolaridade.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Profissão</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded-lg"
                value={form.profissao_secundario} onChange={e => setForm({...form, profissao_secundario: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">CPF</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded-lg"
                value={form.cpf_secundario} maxLength={14} onChange={e => setForm({...form, cpf_secundario: maskCPF(e.target.value)})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">RG</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded-lg"
                value={form.rg_secundario} onChange={e => setForm({...form, rg_secundario: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Celular</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded-lg"
                value={form.celular_secundario} maxLength={15} onChange={e => setForm({...form, celular_secundario: maskPhone(e.target.value)})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">E-mail</label>
              <input type="email" className="w-full p-2 border border-gray-300 rounded-lg"
                value={form.email_secundario} onChange={e => setForm({...form, email_secundario: e.target.value})} />
            </div>
          </div>
        </div>

        {/* 3. ENDEREÇO */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-blue-600 border-b pb-2 mb-4">
            <MapPin size={20} /> <h3 className="font-bold">Endereço da Família</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">CEP</label>
              <div className="relative">
                <input type="text" className="w-full p-2 border border-gray-300 rounded-lg"
                  value={form.endereco_cep} maxLength={9} onChange={e => setForm({...form, endereco_cep: e.target.value})} onBlur={buscarCep} />
                {loadingCep && <div className="absolute right-2 top-3 h-4 w-4 border-2 border-blue-500 rounded-full animate-spin border-t-transparent"></div>}
              </div>
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700">Endereço</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50" readOnly value={form.endereco_rua} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Número</label>
              <input id="numero-casa" type="text" className="w-full p-2 border border-gray-300 rounded-lg"
                value={form.endereco_numero} onChange={e => setForm({...form, endereco_numero: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bairro</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50" readOnly value={form.endereco_bairro} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cidade</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50" readOnly value={form.endereco_cidade} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">UF</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50" readOnly value={form.endereco_uf} />
            </div>
          </div>
        </div>

        <button onClick={salvar} disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg flex justify-center items-center">
          <Save size={20} className="mr-2"/> {loading ? 'Salvando...' : 'Cadastrar Família'}
        </button>
      </div>
    </div>
  )
}