import { useFormContext, useWatch } from 'react-hook-form'
import { DollarSign, CalendarCheck } from 'lucide-react'
import { FinanceiroService } from '@/services/financeiroService'
import { useEffect, useState } from 'react'

export function FinanceiroForm() {
  const { register, setValue, control } = useFormContext()
  
  // Observa mudanças no formulário em tempo real para recalcular
  const valores = useWatch({ 
    control, 
    name: ['valor_mensalidade', 'valor_matricula', 'desconto_percentual', 'ano_letivo', 'turno_contratado'] 
  })
  
  const [mensalidade, matricula, desconto, ano, turno] = valores
  const [simulacao, setSimulacao] = useState<any[]>([])

  // Recalcula a prévia sempre que os valores mudam
  useEffect(() => {
    const parcelas = FinanceiroService.gerarCarneMatricula({
      anoLetivo: Number(ano) || 2026,
      diaVencimento: 10, // Apenas para visualização
      turno: turno || 'Manhã',
      valorMatricula: Number(matricula) || 0,
      valorMensalidade: Number(mensalidade) || 0,
      descontoPercentual: Number(desconto) || 0
    })
    // Pega só as primeiras 3 para não poluir a tela
    setSimulacao(parcelas.slice(0, 3))
  }, [mensalidade, matricula, desconto, ano, turno])

  const formatar = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  return (
    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 space-y-4">
      <div className="flex items-center gap-2 text-blue-800 border-b border-blue-200 pb-2 mb-4">
        <DollarSign size={20} /> 
        <h3 className="font-bold">Configuração Financeira</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Valor Matrícula</label>
          <input type="number" step="0.01" {...register('valor_matricula')} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Mensalidade Base</label>
          <input type="number" step="0.01" {...register('valor_mensalidade')} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Desconto (%)</label>
          <input type="number" {...register('desconto_percentual')} className="w-full p-2 border rounded text-blue-600 font-bold" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Dia Vencimento</label>
          <select {...register('dia_vencimento')} className="w-full p-2 border rounded">
            {[5, 10, 15, 20, 25].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white p-3 rounded-lg border border-blue-100 mt-4">
        <p className="text-xs font-bold text-gray-500 mb-2 uppercase flex items-center gap-1">
          <CalendarCheck size={14}/> Prévia do Carnê ({simulacao.length > 0 ? '12 parcelas' : '...'})
        </p>
        <div className="space-y-1">
          {simulacao.map((p, i) => (
            <div key={i} className="flex justify-between text-xs text-gray-700 border-b border-gray-50 last:border-0 py-1">
              <span>{p.descricao}</span>
              <span className="font-bold">{formatar(p.valor_original)}</span>
            </div>
          ))}
          {simulacao.length > 0 && <div className="text-center text-xs text-gray-400 mt-1">... e mais 9 parcelas</div>}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <input type="checkbox" {...register('gerar_cobrancas')} id="gerar" className="w-4 h-4" />
        <label htmlFor="gerar" className="text-sm font-medium text-blue-900 cursor-pointer">
          Gerar financeiro automaticamente agora
        </label>
      </div>
    </div>
  )
}