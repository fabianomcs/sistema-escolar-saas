'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { AsaasGateway } from '@/lib/gateways/asaas-gateway'
import { IPaymentGateway } from '@/lib/gateways/payment-gateway.interface'

export type PaymentResponse = {
  success: boolean
  url?: string
  message?: string
}

export async function gerarLinkPagamentoAction(cobrancaId: string): Promise<PaymentResponse> {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
           try {
             cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
           } catch {}
        },
      },
    }
  )

  // 1. Buscar a Cobrança + Responsável
  const { data: cobranca, error } = await supabase
    .from('cobrancas')
    .select(`
      *,
      responsaveis (*)
    `)
    .eq('id', cobrancaId)
    .single()

  if (error || !cobranca) {
    return { success: false, message: 'Cobrança não encontrada.' }
  }

  // 2. Atalho: Se já tem link gerado, retorna ele e economiza chamada de API
  if (cobranca.asaas_url_pagamento) {
    return { success: true, url: cobranca.asaas_url_pagamento }
  }

  // 3. Integração com Gateway (Lazy Creation)
  try {
    const gateway: IPaymentGateway = new AsaasGateway()
    const responsavel = cobranca.responsaveis

    // A. Verifica/Cria Cliente no Asaas
    let customerIdGateway = responsavel.asaas_customer_id

    if (!customerIdGateway) {
      // Se este pai nunca pagou nada, cria o cadastro dele no Asaas agora
      const clienteAsaas = await gateway.criarCliente(responsavel)
      customerIdGateway = clienteAsaas.id_gateway

      // Salva para não precisar criar de novo no futuro
      await supabase
        .from('responsaveis')
        .update({ asaas_customer_id: customerIdGateway })
        .eq('id', responsavel.id)
    }

    // B. Cria a Cobrança no Asaas
    const novaCobranca = await gateway.criarCobranca(customerIdGateway, {
      valor: cobranca.valor_original, // Ou valor atualizado com juros se quiser implementar depois
      vencimento: new Date(cobranca.data_vencimento),
      descricao: cobranca.descricao || 'Mensalidade Escolar',
      referencia_externa_id: cobranca.id
    })

    // C. Salva o Link no Banco para a próxima vez
    const { error: updateError } = await supabase
      .from('cobrancas')
      .update({
        asaas_cobranca_id: novaCobranca.id_gateway,
        asaas_url_pagamento: novaCobranca.url_pagamento
      })
      .eq('id', cobranca.id)

    if (updateError) {
      console.error('Erro ao salvar link:', updateError)
      // Não travamos o usuário, retornamos o link mesmo se falhar o update (na proxima ele gera de novo ou corrigimos)
    }

    return { success: true, url: novaCobranca.url_pagamento }

  } catch (err: any) {
    console.error('Erro Gateway:', err)
    return { success: false, message: 'Erro ao conectar com banco: ' + err.message }
  }
}