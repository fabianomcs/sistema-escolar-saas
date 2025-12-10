-- --------------------------------------------------------
-- DOCUMENTAÇÃO INICIAL
-- Autor: Fabiano (Fundador)
-- Objetivo: Estrutura inicial para gestão escolar SaaS
-- --------------------------------------------------------

-- 1. TABELA DE ESCOLAS (TENANTS)
-- Prepara o terreno para quando você tiver 10, 100 escolas.
-- Cada escola terá seu ID único.
create table public.escolas (
  id uuid default gen_random_uuid() primary key, -- Identificador único global
  nome_fantasia text not null,
  razao_social text,
  cnpj text unique, -- CNPJ não pode repetir
  email_contato text,
  telefone_suporte text,
  created_at timestamp with time zone default now() -- Data de criação automática
);

-- 2. TABELA DE RESPONSÁVEIS FINANCEIROS
-- Quem paga a conta. Separado do aluno pois pode ter vários filhos.
create table public.responsaveis (
  id uuid default gen_random_uuid() primary key,
  escola_id uuid references public.escolas(id), -- Vínculo: a qual escola ele pertence?
  nome_completo text not null,
  cpf text not null, -- Essencial para emitir Boleto/Pix no Asaas
  email text not null, -- Para enviar a nota fiscal e cobrança
  telefone_celular text not null, -- Para cobrança via WhatsApp
  endereco_rua text,
  endereco_numero text,
  endereco_bairro text,
  endereco_cep text,
  asaas_customer_id text, -- AQUI guardaremos o ID dele lá no sistema de pagamento
  created_at timestamp with time zone default now()
);

-- 3. TABELA DE ALUNOS
-- Os estudantes vinculados a um responsável.
create table public.alunos (
  id uuid default gen_random_uuid() primary key,
  escola_id uuid references public.escolas(id),
  responsavel_id uuid references public.responsaveis(id), -- Quem é o pai/mãe?
  nome_completo text not null,
  data_nascimento date,
  turma_atual text, -- Ex: "5º Ano B"
  matricula_escolar text, -- O número da matrícula interna da escola
  ativo boolean default true, -- Se sair da escola, marcamos como false
  created_at timestamp with time zone default now()
);

-- 4. TABELA DE MENSALIDADES (COBRANÇAS)
-- O coração financeiro.
create table public.cobrancas (
  id uuid default gen_random_uuid() primary key,
  escola_id uuid references public.escolas(id),
  aluno_id uuid references public.alunos(id),
  responsavel_id uuid references public.responsaveis(id),
  
  valor_original numeric(10,2) not null, -- Ex: 500.00
  data_vencimento date not null,
  descricao text, -- Ex: "Mensalidade Março/2025"
  
  -- Controle de Status
  status text check (status in ('PENDENTE', 'PAGO', 'ATRASADO', 'CANCELADO')) default 'PENDENTE',
  
  -- Integração Asaas
  asaas_cobranca_id text, -- ID da cobrança no Asaas
  asaas_url_pagamento text, -- Link para o pai pagar (Pix/Boleto)
  
  data_pagamento timestamp with time zone, -- Quando foi pago de fato
  valor_pago numeric(10,2), -- Quanto foi pago (pode ter juros/multa)
  
  -- Nota Fiscal
  nota_fiscal_emitida boolean default false,
  link_nota_fiscal text, -- PDF da nota
  
  created_at timestamp with time zone default now()
);

-- 5. SEGURANÇA (Row Level Security - RLS)
-- Isso impede que a Escola A veja dados da Escola B no futuro.
-- Por enquanto, habilitamos mas criamos uma política aberta para você testar.
alter table public.escolas enable row level security;
alter table public.responsaveis enable row level security;
alter table public.alunos enable row level security;
alter table public.cobrancas enable row level security;

-- Política provisória: Liberar acesso total (APENAS PARA DESENVOLVIMENTO)
create policy "Acesso Total Dev" on public.escolas for all using (true);
create policy "Acesso Total Dev" on public.responsaveis for all using (true);
create policy "Acesso Total Dev" on public.alunos for all using (true);
create policy "Acesso Total Dev" on public.cobrancas for all using (true);