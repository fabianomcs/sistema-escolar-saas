import { Aluno, Responsavel } from "@/types/app.types"

export interface CobrancaInput {
  valor: number
  vencimento: Date
  descricao: string
  referencia_externa_id: string // ID da cobrança no nosso banco (UUID)
}

export interface ClienteGateway {
  id_gateway: string // ID do cliente no Asaas (cus_0000...)
}

export interface CobrancaGateway {
  id_gateway: string // ID da cobrança no Asaas (pay_0000...)
  url_pagamento: string
  url_comprovante?: string
}

export interface IPaymentGateway {
  /**
   * Cria ou recupera um cliente no gateway de pagamento
   */
  criarCliente(responsavel: Responsavel): Promise<ClienteGateway>

  /**
   * Gera uma cobrança (Boleto/Pix)
   */
  criarCobranca(clienteIdGateway: string, cobranca: CobrancaInput): Promise<CobrancaGateway>
  
  /**
   * (Opcional) Cancela uma cobrança
   */
  cancelarCobranca(idGateway: string): Promise<boolean>
}