import { useFormContext } from 'react-hook-form'
import { GraduationCap } from 'lucide-react'

export function DadosPessoaisForm({ turmas }: { turmas: any[] }) {
  const { register, formState: { errors } } = useFormContext()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-blue-600 border-b pb-2 mb-4">
        <GraduationCap size={20} /> 
        <h3 className="font-bold">Dados do Aluno</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-700 mb-1">Nome Completo *</label>
          <input 
            {...register('nome_completo')}
            type="text" 
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
            placeholder="Nome do aluno"
          />
          {errors.nome_completo && <span className="text-xs text-red-500">{errors.nome_completo.message as string}</span>}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Nascimento *</label>
          <input 
            {...register('data_nascimento')}
            type="date" 
            className="w-full p-3 border rounded-lg"
          />
          {errors.data_nascimento && <span className="text-xs text-red-500">{errors.data_nascimento.message as string}</span>}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">CPF (Opcional)</label>
          <input 
            {...register('cpf_aluno')}
            type="text" 
            placeholder="000.000.000-00"
            className="w-full p-3 border rounded-lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 md:col-span-2">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Turno *</label>
            <select {...register('turno_contratado')} className="w-full p-3 border rounded-lg bg-white">
              <option value="Manhã">Manhã</option>
              <option value="Tarde">Tarde</option>
              <option value="Integral">Integral</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Turma *</label>
            <select {...register('turma_id')} className="w-full p-3 border rounded-lg bg-white">
              <option value="">Selecione...</option>
              {turmas.map(t => (
                <option key={t.id} value={t.id}>{t.nome} ({t.turno})</option>
              ))}
            </select>
            {errors.turma_id && <span className="text-xs text-red-500">{errors.turma_id.message as string}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}