'use client'

import { useState } from 'react'
import { Dialog } from '@/components/ui/dialog' // Se estiver usando Shadcn/UI ou implemente um modal simples
import { X, DollarSign, Calendar, CreditCard, CheckCircle2 } from 'lucide-react'
import { realizarBaixaManual } from '@/actions/baixa-manual'
import { toast } from 'sonner'

interface ModalBaixaProps {
  cobranca: any
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ModalBaixaManual({ cobranca, isOpen, onClose, onSuccess }: ModalBaixaProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    valor_pago: cobranca?.valor_original || 0,
    data_pagamento: new Date().toISOString().split('T')[0],
    forma_pagamento: 'DINHEIRO',
    observacao: ''
  })

  // Atualiza o valor se a cobrança mudar
  if (cobranca && form.valor_pago === 0 && cobranca.valor_original) {
      setForm(prev => ({...prev, valor_pago: cobranca.valor_original}))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const resultado = await realizarBaixaManual({
      cobranca_id: cobranca.id,
      valor_pago: Number(form.valor_pago),
      data_pagamento: form.data_pagamento, // Ajustar para ISO string completa se o banco exigir timestamp
      forma_pagamento: form.forma_pagamento,
      observacao: form.observacao
    })

    setLoading(false)

    if (resultado.error) {
      toast.error(resultado.error)
    } else {
      toast.success('Pagamento registrado com sucesso!')
      onSuccess()
      onClose()
    }
  }

  if (!isOpen || !cobranca) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-blue-600 p-6 flex justify-between items-start text-white">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <DollarSign size={24} className="text-blue-200"/> Receber Pagamento
            </h2>
            <p className="text-blue-100 text-sm mt-1">{cobranca.descricao}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Valor Recebido</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">R$</span>
                <input 
                  type="number" step="0.01" 
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.valor_pago}
                  onChange={e => setForm({...form, valor_pago: Number(e.target.value)})}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data Pagto.</label>
              <div className="relative">
                <input 
                  type="date" 
                  className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.data_pagamento}
                  onChange={e => setForm({...form, data_pagamento: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Forma de Pagamento</label>
            <div className="grid grid-cols-2 gap-2">
              {['DINHEIRO', 'PIX_PRESENCIAL', 'CARTAO_DEBITO', 'CARTAO_CREDITO'].map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => setForm({...form, forma_pagamento: tipo})}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                    form.forma_pagamento === tipo 
                    ? 'bg-blue-50 border-blue-500 text-blue-700' 
                    : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                  }`}
                >
                  {tipo.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Observações</label>
             <textarea 
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ex: Pago com nota de 100, troco de 50..."
                rows={2}
                value={form.observacao}
                onChange={e => setForm({...form, observacao: e.target.value})}
             />
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-100 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Processando...' : <><CheckCircle2 size={20}/> Confirmar Baixa</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}