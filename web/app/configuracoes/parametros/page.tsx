'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Save, ArrowLeft, Percent, AlertCircle, CalendarClock, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ParametrosPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [escolaId, setEscolaId] = useState('')

  const [form, setForm] = useState({
    multa_atraso_valor: 0.25,
    juros_mensal_percentual: 1.00,
    desconto_pontualidade: 7.00,
    dia_limite_desconto: 5,
    desconto_irmaos_percentual: 10.00 // <--- NOVO
  })

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase.from('escolas').select('*').limit(1).single()
      if (data) {
        setEscolaId(data.id)
        setForm({
          multa_atraso_valor: data.multa_atraso_valor || 0.25,
          juros_mensal_percentual: data.juros_mensal_percentual || 1.00,
          desconto_pontualidade: data.desconto_pontualidade || 7.00,
          dia_limite_desconto: data.dia_limite_desconto || 5,
          desconto_irmaos_percentual: data.desconto_irmaos_percentual || 10.00
        })
      }
      setLoading(false)
    }
    carregar()
  }, [])

  async function salvar() {
    setSalvando(true)
    const { error } = await supabase.from('escolas').update(form).eq('id', escolaId)
    setSalvando(false)
    if (error) alert('Erro: ' + error.message)
    else alert('Parâmetros atualizados com sucesso!')
  }

  if (loading) return <div className="p-10 text-center text-gray-500">Carregando...</div>

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft size={20}/></button>
        <h1 className="text-2xl font-bold text-gray-800">Parâmetros Financeiros</h1>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-8">
        
        {/* MULTAS E JUROS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-red-600 border-b pb-2 mb-4"><AlertCircle size={20}/> <h3 className="font-bold">Atrasos e Multas</h3></div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Multa Diária (R$)</label>
              <input type="number" step="0.01" className="w-full p-3 border rounded-lg" value={form.multa_atraso_valor} onChange={e => setForm({...form, multa_atraso_valor: Number(e.target.value)})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Juros ao Mês (%)</label>
              <div className="relative">
                <input type="number" step="0.01" className="w-full p-3 border rounded-lg pr-8" value={form.juros_mensal_percentual} onChange={e => setForm({...form, juros_mensal_percentual: Number(e.target.value)})} />
                <Percent size={14} className="absolute right-3 top-4 text-gray-400"/>
              </div>
            </div>
          </div>
        </div>

        {/* DESCONTOS */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2 text-green-600 border-b pb-2 mb-4"><CalendarClock size={20}/> <h3 className="font-bold">Descontos Automáticos</h3></div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Pontualidade (R$)</label>
              <input type="number" step="0.01" className="w-full p-3 border rounded-lg" value={form.desconto_pontualidade} onChange={e => setForm({...form, desconto_pontualidade: Number(e.target.value)})} />
              <p className="text-xs text-gray-500 mt-1">Valor fixo deduzido se pagar em dia.</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Dia Limite (Útil)</label>
              <input type="number" className="w-full p-3 border rounded-lg" value={form.dia_limite_desconto} onChange={e => setForm({...form, dia_limite_desconto: Number(e.target.value)})} />
            </div>
          </div>

          {/* DESCONTO IRMÃOS */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-4">
             <div className="flex items-center gap-2 mb-2">
                <Users size={18} className="text-blue-600"/>
                <label className="block text-sm font-bold text-blue-800">Desconto para Irmão Mais Velho (%)</label>
             </div>
             <div className="relative w-32">
                <input type="number" step="0.1" className="w-full p-2 border border-blue-200 rounded text-blue-900 font-bold" value={form.desconto_irmaos_percentual} onChange={e => setForm({...form, desconto_irmaos_percentual: Number(e.target.value)})} />
                <Percent size={14} className="absolute right-3 top-3 text-blue-400"/>
             </div>
             <p className="text-xs text-blue-600 mt-2">Aplicado automaticamente na matrícula do filho mais velho.</p>
          </div>
        </div>

        <button onClick={salvar} disabled={salvando} className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md flex justify-center items-center">
          <Save size={20} className="mr-2"/> {salvando ? 'Salvando...' : 'Salvar Configurações'}
        </button>

      </div>
    </div>
  )
}