import { Database } from './database.types'

// 1. Helpers para tipagem do Supabase
export type Row<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertDto<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateDto<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// 2. Tipos de Entidades (Definidos manualmente para garantir sincronia com schema_final_mvp.sql)

export interface Escola {
  id: string
  nome_fantasia: string
  razao_social: string | null
  cnpj: string | null
  email_contato: string | null
  telefone_suporte: string | null
  logo_url: string | null
  endereco_rua: string | null
  endereco_numero: string | null
  endereco_bairro: string | null
  endereco_cidade: string | null
  endereco_uf: string | null
  endereco_cep: string | null
  multa_atraso_valor: number | null
  juros_mensal_percentual: number | null
  desconto_pontualidade: number | null
  dia_limite_desconto: number | null
  desconto_irmaos_percentual: number | null
  created_at: string | null
}

export interface TabelaPreco {
  id: string
  escola_id: string | null
  ano_letivo: number | null
  nivel: string
  turno: string
  valor_matricula: number | null
  valor_mensalidade: number | null
  valor_janeiro: number | null
  created_at: string | null
}

export interface Responsavel {
  id: string
  escola_id: string | null
  foto_url: string | null
  // Principal
  nome_completo: string
  cpf: string
  rg: string | null
  email: string
  telefone_celular: string
  profissao: string | null
  local_trabalho: string | null
  telefone_comercial: string | null
  escolaridade: string | null
  // Secundário
  nome_secundario: string | null
  cpf_secundario: string | null
  rg_secundario: string | null
  email_secundario: string | null
  celular_secundario: string | null
  profissao_secundario: string | null
  escolaridade_secundario: string | null
  // Endereço (Nomes corrigidos conforme SQL)
  endereco_rua: string | null
  endereco_numero: string | null
  endereco_bairro: string | null
  endereco_cep: string | null
  endereco_cidade: string | null
  endereco_uf: string | null
  // Sistema
  asaas_customer_id: string | null
  created_at: string | null
}

export interface Turma {
  id: string
  escola_id: string | null
  nome: string
  nivel: string
  turno: 'Manhã' | 'Tarde' | 'Integral' | null
  capacidade: number | null
  ano_letivo: number | null
  created_at: string | null
}

export interface Aluno {
  id: string
  escola_id: string | null
  responsavel_id: string | null
  turma_id: string | null
  foto_url: string | null
  // Civil
  nome_completo: string
  data_nascimento: string | null
  naturalidade: string | null
  uf_nascimento: string | null
  nacionalidade: string | null
  rg_numero: string | null
  cpf_aluno: string | null
  // Acadêmico
  matricula_escolar: string | null
  turno_contratado: string | null
  ativo: boolean | null
  // Financeiro
  valor_mensalidade: number | null
  desconto_percentual: number | null
  dia_vencimento: number | null
  // Filiação
  nome_mae: string | null
  telefone_mae: string | null
  nome_pai: string | null
  telefone_pai: string | null
  responsavel_pedagogico: string | null
  // Saúde
  carteira_sus: string | null
  tipo_sanguineo: string | null
  plano_saude: string | null
  restricoes_alimentares: string | null
  possui_necessidade_especial: boolean | null
  cid_necessidade: string | null
  remedios_continuos: string | null
  observacoes_pedagogicas: string | null
  // Outros
  autoriza_imagem: boolean | null
  restrucao_judicial: string | null
  created_at: string | null
}

export interface Cobranca {
  id: string
  escola_id: string | null
  aluno_id: string | null
  responsavel_id: string | null
  descricao: string | null
  valor_original: number
  data_vencimento: string
  status: 'PENDENTE' | 'PAGO' | 'ATRASADO' | 'CANCELADO' | 'PARCIAL' | null
  data_pagamento: string | null
  valor_pago: number | null
  forma_pagamento: string | null
  observacao: string | null
  asaas_cobranca_id: string | null
  asaas_url_pagamento: string | null
  link_nota_fiscal: string | null
  created_at: string | null
}

export interface TransacaoLedger {
   // Se houver tabela transacoes_ledger, adicione aqui. 
   // Baseado no arquivo anterior, mantive o placeholder se necessário, 
   // mas removi a dependência direta de Row se não estiver no schema MVP.
   id: string
   // ... campos ...
}

// 3. Tipos Auxiliares de Aplicação

export interface UserProfile {
  id: string
  escola_id: string | null
  roles: ('admin' | 'secretaria' | 'responsavel')[] | null 
  is_superuser: boolean 
  nome_completo: string | null
  email: string | null
}

// 4. Tipos Compostos (Joins comuns no Frontend)
export interface AlunoCompleto extends Aluno {
  turmas?: Turma | null
  responsaveis?: {
    id?: string 
    nome_completo: string
    cpf: string
    telefone_celular: string
    email: string
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

// 5. Tipos de Formulários (DTOs)
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
  alergias?: string // Mapear para restricoes_alimentares ou remedios no submit
  possui_necessidade_especial: boolean
  cid_necessidade?: string
  
  // Controle de UI
  gerar_cobrancas: boolean 
}

export interface BaixaPagamentoInput {
  cobranca_id: string
  valor_pago: number
  data_pagamento: Date | string
  forma_pagamento: string
  observacao?: string
}