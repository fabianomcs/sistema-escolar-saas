'use server'

// 1. Importação atualizada com o novo nome para evitar conflitos
import { createSupabaseServerClient } from '@/lib/supabase-server' 
import { revalidatePath } from 'next/cache'

interface BaixaManualInput {
  cobranca_id: string
  valor_pago: number
  data_pagamento: string
  forma_pagamento: string
  observacao?: string
}

export async function realizarBaixaManual(input: BaixaManualInput) {
  // 2. Usando a função com o novo nome
  const supabase = await createSupabaseServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Usuário não autenticado' }

  const { data: cobranca, error: fetchError } = await supabase
    .from('cobrancas')
    .select('status, valor_original')
    .eq('id', input.cobranca_id)
    .single()

  if (fetchError || !cobranca) return { error: 'Cobrança não encontrada' }
  if (cobranca.status === 'PAGO') return { error: 'Cobrança já está paga' }

  const { error: updateError } = await supabase
    .from('cobrancas')
    .update({
      status: 'PAGO',
      valor_pago: input.valor_pago,
      data_pagamento: input.data_pagamento,
      forma_pagamento: input.forma_pagamento,
      observacao: input.observacao,
    })
    .eq('id', input.cobranca_id)

  if (updateError) return { error: 'Erro ao atualizar cobrança: ' + updateError.message }

  await supabase.from('logs_atividades').insert({
    acao: 'BAIXA_MANUAL',
    usuario: user.email,
    entidade_afetada: `Cobranca: ${input.cobranca_id}`,
    detalhes: `Recebido R$ ${input.valor_pago} via ${input.forma_pagamento}. Obs: ${input.observacao || ''}`
  })

  revalidatePath('/financeiro')
  // Dica: Usar revalidatePath com 'layout' atualiza todas as rotas aninhadas
  revalidatePath('/(sistema)', 'layout') 
  
  return { success: true }
}