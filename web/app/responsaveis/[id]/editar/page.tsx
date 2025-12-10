'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import { Save, ArrowLeft, MapPin, User, Users } from 'lucide-react'
import { maskCPF, maskPhone } from '@/app/utils/formatters'
import AvatarUpload from '@/components/AvatarUpload'
import { registrarLog } from '@/app/utils/logger' // <--- 1. IMPORT

export default function EditarResponsavelPage() {
  const router = useRouter()
  const params = useParams()
  const idResp = params?.id as string
  const [loading, setLoading] = useState(true)
  const [loadingCep, setLoadingCep] = useState(false)

  // Estado para diff
  const [dadosOriginais, setDadosOriginais] = useState<any>(null)

  const [form, setForm] = useState({
    foto_url: '',
    nome_completo: '',
    cpf: '',
    rg: '',
    escolaridade: '',
    profissao: '',
    local_trabalho: '',
    telefone_comercial: '',
    email: '',
    telefone_celular: '',
    nome_secundario: '',
    cpf_secundario: '',
    rg_secundario: '',
    escolaridade_secundario: '',
    profissao_secundario: '',
    email_secundario: '',
    celular_secundario: '',
    endereco_cep: '',
    endereco_rua: '',
    endereco_numero: '',
    endereco_bairro: '',
    endereco_cidade: '',
    endereco_uf: ''
  })

  const niveisEscolaridade = ["Fundamental Incompleto", "Fundamental Completo", "Médio Incompleto", "Médio Completo", "Superior Incompleto", "Superior Completo", "Pós-Graduação / Especialização", "Mestrado / Doutorado"]

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase.from('responsaveis').select('*').eq('id', idResp).single()
      if (data) {
        setDadosOriginais(data) // <--- Guardando original
        
        setForm({
          foto_url: data.foto_url || '',
          nome_completo: data.nome_completo || '',
          cpf: data.cpf || '',
          rg: data.rg || '',
          escolaridade: data.escolaridade || '',
          profissao: data.profissao || '',
          local_trabalho: data.local_trabalho || '',
          telefone_comercial: data.telefone_comercial || '',
          email: data.email || '',
          telefone_celular: data.telefone_celular || '',
          nome_secundario: data.nome_secundario || '',
          cpf_secundario: data.cpf_secundario || '',
          rg_secundario: data.rg_secundario || '',
          escolaridade_secundario: data.escolaridade_secundario || '',
          profissao_secundario: data.profissao_secundario || '',
          email_secundario: data.email_secundario || '',
          celular_secundario: data.celular_secundario || '',
          endereco_cep: data.endereco_cep || '',
          endereco_rua: data.endereco_rua || '',
          endereco_numero: data.endereco_numero || '',
          endereco_bairro: data.endereco_bairro || '',
          endereco_cidade: data.endereco_cidade || '',
          endereco_uf: data.endereco_uf || ''
        })
      }
      setLoading(false)
    }
    carregar()
  }, [idResp])

  async function buscarCep() {
    const cepLimpo = form.endereco_cep.replace(/\D/g, '')
    if (cepLimpo.length !== 8) return
    setLoadingCep(true)
    try {
      const resp = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const dados = await resp.json()
      if (!dados.erro) {
        setForm(prev => ({ ...prev, endereco_rua: dados.logradouro, endereco_bairro: dados.bairro, endereco_cidade: dados.localidade, endereco_uf: dados.uf }))
      } else alert('CEP não encontrado!')
    } catch (err) { console.error(err) }
    setLoadingCep(false)
  }

  async function salvar() {
    setLoading(true)
    const { error } = await supabase.from('responsaveis').update(form).eq('id', idResp)
    setLoading(false)

    if (error) alert('Erro ao atualizar: ' + error.message)
    else {
      // --- LOG ---
      await registrarLog(
        'EDICAO_RESPONSAVEL',
        `Atualizou cadastro de: ${form.nome_completo}`,
        `Responsável: ${form.cpf}`,
        { antes: dadosOriginais, depois: form }
      )
      // ----------

      alert('Dados atualizados com sucesso!')
      router.push(`/responsaveis/${idResp}`)
    }
  }

  if (loading) return <div className="p-10 text-center text-gray-500">Carregando dados...</div>

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft size={20} /></button>
        <h1 className="text-2xl font-bold text-gray-800">Editar Responsável</h1>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-8">
        <div className="flex justify-center mb-6"><AvatarUpload tamanho={120} urlAtual={form.foto_url} onUpload={(url) => setForm(prev => ({ ...prev, foto_url: url }))} /></div>

        {/* 1. PRINCIPAL */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-blue-600 border-b pb-2 mb-4"><User size={20} /> <h3 className="font-bold">Principal</h3></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700">Nome Completo</label><input type="text" className="w-full p-2 border border-gray-300 rounded-lg" value={form.nome_completo} onChange={e => setForm({...form, nome_completo: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-gray-700">Escolaridade</label><select className="w-full p-2 border rounded-lg bg-white" value={form.escolaridade} onChange={e => setForm({...form, escolaridade: e.target.value})}><option value="">Selecione...</option>{niveisEscolaridade.map(n => <option key={n} value={n}>{n}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div><label className="block text-sm font-medium text-gray-700">CPF</label><input type="text" className="w-full p-2 border rounded-lg" value={form.cpf} maxLength={14} onChange={e => setForm({...form, cpf: maskCPF(e.target.value)})} /></div>
            <div><label className="block text-sm font-medium text-gray-700">RG</label><input type="text" className="w-full p-2 border rounded-lg" value={form.rg} onChange={e => setForm({...form, rg: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-gray-700">Celular</label><input type="text" className="w-full p-2 border rounded-lg" value={form.telefone_celular} maxLength={15} onChange={e => setForm({...form, telefone_celular: maskPhone(e.target.value)})} /></div>
            <div><label className="block text-sm font-medium text-gray-700">E-mail</label><input type="text" className="w-full p-2 border rounded-lg" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
            <div><label className="block text-sm font-medium text-gray-700">Profissão</label><input type="text" className="w-full p-2 border rounded-lg" value={form.profissao} onChange={e => setForm({...form, profissao: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-gray-700">Local Trabalho</label><input type="text" className="w-full p-2 border rounded-lg" value={form.local_trabalho} onChange={e => setForm({...form, local_trabalho: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-gray-700">Tel. Comercial</label><input type="text" className="w-full p-2 border rounded-lg" value={form.telefone_comercial} onChange={e => setForm({...form, telefone_comercial: maskPhone(e.target.value)})} /></div>
          </div>
        </div>

        {/* 2. SECUNDÁRIO */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-gray-600 border-b pb-2 mb-4"><Users size={20} /> <h3 className="font-bold">Secundário</h3></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700">Nome</label><input type="text" className="w-full p-2 border rounded-lg" value={form.nome_secundario} onChange={e => setForm({...form, nome_secundario: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-gray-700">Escolaridade</label><select className="w-full p-2 border rounded-lg bg-white" value={form.escolaridade_secundario} onChange={e => setForm({...form, escolaridade_secundario: e.target.value})}>{niveisEscolaridade.map(n => <option key={n} value={n}>{n}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700">CPF</label><input type="text" className="w-full p-2 border rounded-lg" value={form.cpf_secundario} maxLength={14} onChange={e => setForm({...form, cpf_secundario: maskCPF(e.target.value)})} /></div>
            <div><label className="block text-sm font-medium text-gray-700">Celular</label><input type="text" className="w-full p-2 border rounded-lg" value={form.celular_secundario} maxLength={15} onChange={e => setForm({...form, celular_secundario: maskPhone(e.target.value)})} /></div>
            <div><label className="block text-sm font-medium text-gray-700">Profissão</label><input type="text" className="w-full p-2 border rounded-lg" value={form.profissao_secundario} onChange={e => setForm({...form, profissao_secundario: e.target.value})} /></div>
          </div>
        </div>

        {/* 3. ENDEREÇO */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-blue-600 border-b pb-2 mb-4"><MapPin size={20} /> <h3 className="font-bold">Endereço</h3></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div><label className="block text-sm font-medium text-gray-700">CEP</label><div className="relative"><input type="text" className="w-full p-2 border rounded-lg" value={form.endereco_cep} maxLength={9} onChange={e => setForm({...form, endereco_cep: e.target.value})} onBlur={buscarCep} />{loadingCep && <div className="absolute right-2 top-3 h-4 w-4 border-2 border-blue-500 rounded-full animate-spin border-t-transparent"></div>}</div></div>
            <div className="md:col-span-3"><label className="block text-sm font-medium text-gray-700">Endereço</label><input type="text" className="w-full p-2 border rounded-lg bg-gray-50" value={form.endereco_rua} onChange={e => setForm({...form, endereco_rua: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-gray-700">Número</label><input id="numero-casa" type="text" className="w-full p-2 border rounded-lg" value={form.endereco_numero} onChange={e => setForm({...form, endereco_numero: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-gray-700">Bairro</label><input type="text" className="w-full p-2 border rounded-lg bg-gray-50" value={form.endereco_bairro} onChange={e => setForm({...form, endereco_bairro: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-gray-700">Cidade</label><input type="text" className="w-full p-2 border rounded-lg bg-gray-50" value={form.endereco_cidade} onChange={e => setForm({...form, endereco_cidade: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-gray-700">UF</label><input type="text" className="w-full p-2 border rounded-lg bg-gray-50" value={form.endereco_uf} onChange={e => setForm({...form, endereco_uf: e.target.value})} /></div>
          </div>
        </div>

        <button onClick={salvar} disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg flex justify-center items-center">
          <Save size={20} className="mr-2"/> {loading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </div>
  )
}