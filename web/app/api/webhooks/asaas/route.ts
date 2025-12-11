import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Usamos createClient direto pois é uma rota de API (Server-to-Server), 
// não tem sessão de usuário logado aqui. Usamos a chave SERVICE_ROLE.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // <--- ATENÇÃO: Precisa dessa chave no .env.local
)

export async function POST(request: Request) {
  try {
    // 1. Segurança: Verificar Token do Webhook (Opcional mas recomendado)
    const token = request.headers.get('asaas-access-token')
    const secret = process.env.ASAAS_WEBHOOK_SECRET
    
    if (secret && token !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const event = await request.json()
    console.log(`[Webhook Asaas] Evento: ${event.event} - ID: ${event.payment.id}`)

    // 2. Processar Evento
    const evento = event.event
    const pagamento = event.payment
    
    // O Asaas manda o nosso UUID no campo 'externalReference' se a gente enviou na criação
    // Se não tiver, tentamos achar pelo asaas_cobranca_id (se já tivermos salvo antes)
    const nossoId = pagamento.externalReference

    if (evento === 'PAYMENT_RECEIVED' || evento === 'PAYMENT_CONFIRMED') {
      
      // A. Buscar a cobrança no nosso banco
      const { data: cobrancaLocal } = await supabaseAdmin
        .from('cobrancas')
        .select('*')
        .or(`id.eq.${nossoId},asaas_cobranca_id.eq.${pagamento.id}`)
        .single()

      if (!cobrancaLocal) {
        console.warn('Cobrança não encontrada no sistema:', pagamento.id)
        return NextResponse.json({ received: true }) // Retorna 200 pro Asaas não ficar tentando
      }

      // B. Atualizar status para PAGO
      await supabaseAdmin.from('cobrancas').update({
        status: 'PAGO',
        data_pagamento: new Date().toISOString(), // Data da baixa
        valor_pago: pagamento.value,
        forma_pagamento: pagamento.billingType,
        asaas_cobranca_id: pagamento.id // Garante que tá salvo
      }).eq('id', cobrancaLocal.id)

      // C. Lançar no Ledger (Livro Caixa)
      // Importante: Precisamos saber a escola_id. Já temos na cobrancaLocal.
      await supabaseAdmin.from('transacoes_ledger').insert({
        escola_id: cobrancaLocal.escola_id,
        cobranca_id: cobrancaLocal.id,
        tipo: 'BAIXA_PAGAMENTO',
        valor: pagamento.value,
        detalhes: `Pagamento Asaas (${pagamento.billingType}) - Ref: ${pagamento.id}`,
        created_at: new Date().toISOString()
      })

    } else if (evento === 'PAYMENT_OVERDUE') {
      // Opcional: Marcar como ATRASADO automaticamente
      // (Geralmente calculamos atraso dinamicamente pela data, mas pode ser útil persistir)
    }

    return NextResponse.json({ received: true })

  } catch (err: any) {
    console.error('Erro no Webhook:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}