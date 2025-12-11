'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Save, Building, Search, ArrowLeft } from 'lucide-react'
import AvatarUpload from '@/components/AvatarUpload'
import { useRouter } from 'next/navigation'

export default function DadosEscolaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingCep, setLoadingCep] = useState(false)
  const [escolaId, setEscolaId] = useState('')

  const [form, setForm] = useState({
    nome_fantasia: '',
    razao_social: '',
    cnpj: '',
    email_contato: '',
    telefone_suporte: '',
    logo_url: '',
    endereco_rua: '',
    endereco_numero: '',
    endereco_bairro: '',
    endereco_cidade: '',
    endereco_uf: '',
    endereco_cep: ''
  })

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase.from('escolas').select('*').limit(1).single()
      if (data) {
        setEscolaId(data.id)
        setForm({
          nome_fantasia: data.nome_fantasia || '',
          razao_social: data.razao_social || '',
          cnpj: data.cnpj || '',
          email_contato: data.email_contato || '',
          telefone_suporte: data.telefone_suporte || '',
          logo_url: data.logo_url || '',
          endereco_rua: data.endereco_rua || '',
          endereco_numero: data.endereco_numero || '',
          endereco_bairro: data.endereco_bairro || '',
          endereco_cidade: data.endereco_cidade || '',
          endereco_uf: data.endereco_uf || '',
          endereco_cep: data.endereco_cep || ''
        })
      }
    }
    carregar()
  }, [])

  // --- BUSCA CEP CORRIGIDA ---
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
        // Foca no número
        document.getElementById('num_escola')?.focus()
      } else {
        alert('CEP não encontrado!')
      }
    } catch (err) { console.error(err) }
    setLoadingCep(false)
  }

  async function salvar() {
    setLoading(true)
    const { error } = await supabase.from('escolas').update(form).eq('id', escolaId)
    setLoading(false)
    if (error) alert('Erro: ' + error.message)
    else {
      alert('Dados salvos com sucesso!')
      router.refresh()
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft size={20} /></button>
        <h1 className="text-2xl font-bold text-gray-800">Dados da Instituição</h1>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-8">
        
        <div className="flex flex-col items-center justify-center border-b pb-8">
          <p className="mb-4 text-sm font-bold text-gray-500 uppercase">Logotipo Oficial</p>
          <AvatarUpload tamanho={150} urlAtual={form.logo_url} onUpload={(url) => setForm(prev => ({ ...prev, logo_url: url }))} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-1">Nome Fantasia</label>
            <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" value={form.nome_fantasia} onChange={e => setForm({...form, nome_fantasia: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Razão Social</label>
            <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" value={form.razao_social} onChange={e => setForm({...form, razao_social: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">CNPJ</label>
            <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" value={form.cnpj} onChange={e => setForm({...form, cnpj: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">E-mail</label>
            <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" value={form.email_contato} onChange={e => setForm({...form, email_contato: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Telefone</label>
            <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" value={form.telefone_suporte} onChange={e => setForm({...form, telefone_suporte: e.target.value})} />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-50">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Building size={20}/> Endereço</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">CEP</label>
              <div className="relative">
                <input type="text" className="w-full p-2 border border-gray-300 rounded" value={form.endereco_cep} onChange={e => setForm({...form, endereco_cep: e.target.value})} onBlur={buscarCep} maxLength={9} placeholder="00000-000"/>
                {loadingCep && <div className="absolute right-2 top-3 w-4 h-4 border-2 border-blue-500 rounded-full animate-spin border-t-transparent"></div>}
              </div>
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-600">Rua</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded bg-gray-50" value={form.endereco_rua} onChange={e => setForm({...form, endereco_rua: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Número</label>
              <input id="num_escola" type="text" className="w-full p-2 border border-gray-300 rounded" value={form.endereco_numero} onChange={e => setForm({...form, endereco_numero: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Bairro</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded bg-gray-50" value={form.endereco_bairro} onChange={e => setForm({...form, endereco_bairro: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Cidade</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded bg-gray-50" value={form.endereco_cidade} onChange={e => setForm({...form, endereco_cidade: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">UF</label>
              <input type="text" className="w-full p-2 border border-gray-300 rounded bg-gray-50" value={form.endereco_uf} onChange={e => setForm({...form, endereco_uf: e.target.value})} />
            </div>
          </div>
        </div>

        <button onClick={salvar} disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md flex justify-center items-center">
          <Save size={20} className="mr-2"/> {loading ? 'Salvando...' : 'Salvar Alterações'}
        </button>

      </div>
    </div>
  )
}