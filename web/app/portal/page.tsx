'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { LogIn, User, Lock, ArrowRight, AlertCircle } from 'lucide-react'
import { maskCPF } from '@/app/utils/formatters'

export default function PortalLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  
  const [credenciais, setCredenciais] = useState({ cpf: '', senha: '' })

  async function fazerLogin(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)

    try {
      // 1. Busca responsável pelo CPF
      const { data: resp, error } = await supabase
        .from('responsaveis')
        .select('*')
        .eq('cpf', credenciais.cpf)
        .single()

      if (error || !resp) throw new Error('CPF não encontrado.')

      // 2. Valida Senha Lógica
      const primeiroNome = resp.nome_completo.split(' ')[0].toLowerCase()
      const ultimosDigitos = credenciais.cpf.replace(/\D/g, '').slice(-4)
      const senhaCorreta = `${primeiroNome}@${ultimosDigitos}`

      if (credenciais.senha !== senhaCorreta) {
        throw new Error(`Senha incorreta. Dica: ${primeiroNome}@${ultimosDigitos}`)
      }

      // 3. Salva sessão e redireciona
      sessionStorage.setItem('portal_responsavel_id', resp.id)
      router.push('/portal/home')

    } catch (err: any) {
      setErro(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
            <User size={32}/>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Bem-vindo(a)</h1>
          <p className="text-gray-500 text-sm">Digite seus dados para acessar</p>
        </div>

        <form onSubmit={fazerLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">CPF</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" placeholder="000.000.000-00" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500"
                value={credenciais.cpf} onChange={e => setCredenciais({...credenciais, cpf: maskCPF(e.target.value)})} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="password" placeholder="nome@1234" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500"
                value={credenciais.senha} onChange={e => setCredenciais({...credenciais, senha: e.target.value})} />
            </div>
          </div>

          {erro && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2"><AlertCircle size={16}/> {erro}</div>}

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2">
            {loading ? 'Entrando...' : <>Acessar <ArrowRight size={20} /></>}
          </button>
        </form>
      </div>
    </div>
  )
}