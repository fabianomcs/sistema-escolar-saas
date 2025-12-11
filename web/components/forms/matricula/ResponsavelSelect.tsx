import { useFormContext } from 'react-hook-form'
import { Users } from 'lucide-react'

export function ResponsavelSelect({ responsaveis }: { responsaveis: any[] }) {
  const { register, formState: { errors } } = useFormContext()

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 space-y-4">
      <div className="flex items-center gap-2 text-gray-700 border-b pb-2">
        <Users size={20} /> 
        <h3 className="font-bold">Responsável Financeiro</h3>
      </div>
      
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Selecione o Pai/Mãe/Responsável *</label>
        <select 
          {...register('responsavel_id')}
          className="w-full p-3 border border-blue-200 rounded-lg bg-blue-50 font-medium"
        >
          <option value="">Selecione da lista...</option>
          {responsaveis.map(r => (
            <option key={r.id} value={r.id}>
              {r.nome_completo} (CPF: {r.cpf})
            </option>
          ))}
        </select>
        {errors.responsavel_id && <span className="text-xs text-red-500">Selecione um responsável</span>}
        
        <p className="text-xs text-gray-500 mt-2">
          Não encontrou? <a href="/responsaveis/novo" target="_blank" className="text-blue-600 hover:underline">Cadastrar novo responsável</a>
        </p>
      </div>
    </div>
  )
}