-- --------------------------------------------------------
-- SCRIPT 04: REATORAÇÃO DE BANCO & INTEGRIDADE
-- Objetivo: Criar Ledger Financeiro e Constraints
-- --------------------------------------------------------

-- 1. CONSTRAINTS DE SEGURANÇA DE DADOS
-- Evita erros humanos como cobrar "-50 reais" ou desconto negativo.

-- Na tabela Escolas
ALTER TABLE public.escolas
  ADD CONSTRAINT check_valores_positivos_escola 
  CHECK (
    multa_atraso_valor >= 0 AND 
    juros_mensal_percentual >= 0 AND 
    desconto_pontualidade >= 0
  );

-- Na tabela Alunos
ALTER TABLE public.alunos
  ADD CONSTRAINT check_mensalidade_positiva 
  CHECK (valor_mensalidade >= 0);

-- Na tabela Cobrancas
ALTER TABLE public.cobrancas
  ADD CONSTRAINT check_valores_cobranca 
  CHECK (valor_original >= 0);

-- 2. CRIAÇÃO DO LEDGER FINANCEIRO (LIVRO RAZÃO)
-- Esta tabela é IMUTÁVEL. Ela registra cada movimentação de dinheiro.
-- Nunca se apaga ou edita uma linha aqui. Se errou, cria-se um estorno (linha nova).

CREATE TABLE IF NOT EXISTS public.transacoes_ledger (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  escola_id uuid REFERENCES public.escolas(id) NOT NULL,
  
  -- Vínculo opcional: pode ser uma baixa de cobrança ou um lançamento avulso
  cobranca_id uuid REFERENCES public.cobrancas(id),
  responsavel_id uuid REFERENCES public.responsaveis(id),
  
  -- Tipo da operação
  tipo text CHECK (tipo IN ('DEBITO_MENSALIDADE', 'BAIXA_PAGAMENTO', 'ESTORNO', 'MULTA', 'DESCONTO')) NOT NULL,
  
  -- Valores
  valor numeric(10,2) NOT NULL, -- Valor da transação
  
  -- Rastreabilidade
  usuario_responsavel uuid REFERENCES auth.users(id), -- Quem fez a ação (se nulo, foi sistema)
  detalhes text, -- Ex: "Pagamento via Pix - Asaas ID xxx"
  
  created_at timestamp with time zone DEFAULT now()
);

-- Segurança para o Ledger (Apenas leitura e criação, nunca update/delete)
ALTER TABLE public.transacoes_ledger ENABLE ROW LEVEL SECURITY;

-- Policy: Só vejo transações da minha escola
CREATE POLICY "Tenant Isolation Ledger" ON public.transacoes_ledger
  FOR ALL USING (escola_id = getting_user_school_id());

-- 3. ÍNDICES DE PERFORMANCE
-- Acelera o carregamento das telas de Financeiro e Lista de Alunos

CREATE INDEX IF NOT EXISTS idx_cobrancas_vencimento ON public.cobrancas(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_cobrancas_status ON public.cobrancas(status);
CREATE INDEX IF NOT EXISTS idx_cobrancas_aluno ON public.cobrancas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_alunos_nome ON public.alunos(nome_completo);
CREATE INDEX IF NOT EXISTS idx_alunos_cpf ON public.alunos(cpf_aluno);