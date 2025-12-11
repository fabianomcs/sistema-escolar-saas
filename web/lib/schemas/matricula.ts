import { z } from 'zod'

export const schemaMatricula = z.object({
  // Dados Pessoais
  nome_completo: z.string().min(3, "Nome muito curto"),
  data_nascimento: z.string().refine(val => !isNaN(Date.parse(val)), "Data inválida"),
  cpf_aluno: z.string().optional(),
  
  // Acadêmico
  turma_id: z.string().uuid("Turma inválida"),
  turno_contratado: z.enum(['Manhã', 'Tarde', 'Integral']),
  ano_letivo: z.number().int(),
  
  // Financeiro
  responsavel_id: z.string().uuid("Responsável obrigatório"),
  dia_vencimento: z.number().min(1).max(31),
  valor_mensalidade: z.number().positive("Valor deve ser positivo"),
  valor_matricula: z.number().min(0),
  desconto_percentual: z.number().min(0).max(100).default(0),
  
  // Controle
  gerar_cobrancas: z.boolean().default(true)
})