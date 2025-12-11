import { IPaymentGateway, CobrancaInput, ClienteGateway, CobrancaGateway } from './payment-gateway.interface'
import { Responsavel } from '@/types/app.types'

const ASAAS_URL = process.env.ASAAS_API_URL || 'https://sandbox.asaas.com/api/v3'
const ASAAS_KEY = process.env.ASAAS_API_KEY

export class AsaasGateway implements IPaymentGateway {
  
  private async request(endpoint: string, method: string, body?: any) {
    if (!ASAAS_KEY) throw new Error('ASAAS_API_KEY não configurada')

    const response = await fetch(`${ASAAS_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_KEY
      },
      body: body ? JSON.stringify(body) : undefined
    })

    const data = await response.json()
    if (!response.ok) {
      console.error('Erro Asaas:', data)
      throw new Error(data.errors?.[0]?.description || 'Erro na comunicação com Asaas')
    }
    return data
  }

  async criarCliente(responsavel: Responsavel): Promise<ClienteGateway> {
    // 1. Tenta buscar cliente pelo CPF primeiro para não duplicar
    const busca = await this.request(`/customers?cpfCnpj=${responsavel.cpf}`, 'GET')
    
    if (busca.data && busca.data.length > 0) {
      return { id_gateway: busca.data[0].id }
    }

    // 2. Se não existe, cria novo
    const novo = await this.request('/customers', 'POST', {
      name: responsavel.nome_completo,
      cpfCnpj: responsavel.cpf,
      email: responsavel.email,
      mobilePhone: responsavel.telefone_celular,
      notificationDisabled: false // Asaas envia SMS/Email automático se true
    })

    return { id_gateway: novo.id }
  }

  async criarCobranca(clienteIdGateway: string, cobranca: CobrancaInput): Promise<CobrancaGateway> {
    const payload = {
      customer: clienteIdGateway,
      billingType: 'UNDEFINED', // Permite que o cliente escolha Pix ou Boleto no link
      value: cobranca.valor,
      dueDate: cobranca.vencimento.toISOString().split('T')[0], // YYYY-MM-DD
      description: cobranca.descricao,
      externalReference: cobranca.referencia_externa_id, // Nosso UUID para vincular depois
      postalService: false // Não enviar pelo correio
    }

    const res = await this.request('/payments', 'POST', payload)

    return {
      id_gateway: res.id,
      url_pagamento: res.bankSlipUrl || res.invoiceUrl, // Preferência pelo link do boleto/pix
      url_comprovante: res.invoiceUrl
    }
  }

  async cancelarCobranca(idGateway: string): Promise<boolean> {
    try {
      await this.request(`/payments/${idGateway}`, 'DELETE')
      return true
    } catch (e) {
      console.error('Falha ao cancelar no Asaas', e)
      return false
    }
  }
}