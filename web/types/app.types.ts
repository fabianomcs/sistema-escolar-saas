import { Database } from './database.types'

// 1. Helper para pegar o tipo de uma linha direto do banco (atalho)
export type Row<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertDto<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateDto<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// 2. Tipos de Entidades Puras (Espelho do Banco)
export type Escola = Row<'escolas'>
export type Aluno = Row<'alunos'>
export type Responsavel = Row<'responsaveis'>
export type Turma = Row<'turmas'>
export type Cobranca = Row<'cobrancas'>
export type TransacaoLedger = Row<'transacoes_ledger'>
export type UserProfile = Row<'users_profiles'>

// 3. Tipos Compostos (Joins comuns no Frontend)
// Usado quando você faz um .select('*, turmas(nome)')
export interface AlunoCompleto extends Aluno {
  turmas?: {
    nome: string
    turno: string
  } | null
  responsaveis?: {
    nome_completo: string
    cpf: string
    telefone_celular: string
  } | null
}

export interface CobrancaCompleta extends Cobranca {
  alunos?: {
    nome_completo: string
    matricula_escolar?: string
  } | null
  responsaveis?: {
    nome_completo: string
  } | null
}

// 4. Tipos de Formulários (DTOs - Data Transfer Objects)
// O que o formulário de matrícula envia para a API (pode ter campos extras que não são colunas diretas)
export interface MatriculaFormInput {
  // Dados Pessoais
  nome_completo: string
  data_nascimento: string
  naturalidade?: string
  cpf_aluno?: string
  rg_numero?: string
  
  // Acadêmico
  turma_id: string
  turno_contratado: 'Manhã' | 'Tarde' | 'Integral'
  ano_letivo: number
  
  // Financeiro
  responsavel_id: string
  dia_vencimento: number
  valor_mensalidade: number
  desconto_percentual: number
  
  // Filiação
  nome_mae?: string
  nome_pai?: string
  
  // Saúde & Extras
  carteira_sus?: string
  tipo_sanguineo?: string
  alergias?: string // mapeia para restricoes_alimentares ou obs
  possui_necessidade_especial: boolean
  
  // Controle de UI (não vai pro banco alunos, mas decide se gera cobranças)
  gerar_cobrancas: boolean 
}

export interface BaixaPagamentoInput {
  cobranca_id: string
  valor_pago: number
  data_pagamento: Date | string
  forma_pagamento: string
  observacao?: string
}