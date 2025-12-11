'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner' // Notificações bonitas

// Nossos novos arquivos criados
import { DadosPessoaisForm } from '@/components/forms/matricula/DadosPessoaisForm'
import { ResponsavelSelect } from '@/components/forms/matricula/ResponsavelSelect'
import { FinanceiroForm } from '@/components/forms/matricula/FinanceiroForm'
import { matricularAlunoAction, schemaMatricula } from '@/actions/matricular-aluno'

export default function NovoAlunoPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // Listas para os selects
  const [turmas, setTurmas] = useState<any[]>([])
  const [responsaveis, setResponsaveis] = useState<any[]>([])

  // Configuração do Formulário com Zod (Validação automática)
  const methods = useForm({
    resolver: zodResolver(schemaMatricula),
    defaultValues: {
      ano_letivo: 2026,
      turno_contratado: 'Manhã',
      desconto_percentual: 0,
      dia_vencimento: 10,
      gerar_cobrancas: true,
      valor_matricula: 0,
      valor_mensalidade: 0
    }
  })

  // Carregar dados iniciais (Turmas e Responsáveis)
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    async function carregar() {
      const { data: t } = await supabase.from('turmas').select('*').order('nome')
      const { data: r } = await supabase.from('responsaveis').select('id, nome_completo, cpf').order('nome_completo')
      
      if (t) setTurmas(t)
      if (r) setResponsaveis(r)
    }
    carregar()
  }, [])

  // Função de Envio (Submit)
  async function onSubmit(data: any) {
    // Transforma o objeto do form em FormData para enviar ao Server Action
    const formData = new FormData()
    Object.keys(data).forEach(key => {
      formData.append(key, data[key])
    })

    // Inicia a transição para o servidor
    startTransition(async () => {
      const resultado = await matricularAlunoAction(null, formData)

      if (resultado.success) {
        toast.success(resultado.message)
        router.push('/alunos')
      } else {
        toast.error('Erro na matrícula', {
          description: resultado.message
        })
        console.error(resultado.errors)
      }
    })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      
      {/* Cabeçalho */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Nova Matrícula</h1>
          <p className="text-gray-500 text-sm">Preencha os dados para gerar o contrato</p>
        </div>
      </div>

      {/* O FormProvider passa os dados para todos os filhos (DadosPessoais, Financeiro, etc) */}
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <DadosPessoaisForm turmas={turmas} />
          </div>

          <ResponsavelSelect responsaveis={responsaveis} />
          
          <FinanceiroForm />

          {/* Botão Salvar Flutuante ou Fixo */}
          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" /> Processando...
                </>
              ) : (
                <>
                  <Save size={24} /> Concluir Matrícula
                </>
              )}
            </button>
          </div>

        </form>
      </FormProvider>
    </div>
  )
}