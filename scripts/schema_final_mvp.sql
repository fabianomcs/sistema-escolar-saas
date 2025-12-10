-- --------------------------------------------------------
-- SCHEMA COMPLETO - ESCOLA FÁCIL (MVP)
-- Gerado em: Dezembro/2025
-- --------------------------------------------------------

-- 1. TABELA DE ESCOLAS (Configurações Globais)
create table public.escolas (
  id uuid default gen_random_uuid() primary key,
  nome_fantasia text not null,
  razao_social text,
  cnpj text unique,
  email_contato text,
  telefone_suporte text,
  logo_url text,
  -- Endereço
  endereco_rua text,
  endereco_numero text,
  endereco_bairro text,
  endereco_cidade text,
  endereco_uf text,
  endereco_cep text,
  -- Parâmetros Financeiros
  multa_atraso_valor numeric(10,2) DEFAULT 0.25,
  juros_mensal_percentual numeric(5,2) DEFAULT 1.00,
  desconto_pontualidade numeric(10,2) DEFAULT 7.00,
  dia_limite_desconto integer DEFAULT 5,
  desconto_irmaos_percentual numeric(5,2) DEFAULT 10.00,
  created_at timestamp with time zone default now()
);

-- 2. TABELA DE PREÇOS (Anual)
create table public.tabela_precos (
  id uuid default gen_random_uuid() primary key,
  escola_id uuid references public.escolas(id),
  ano_letivo integer default 2026,
  nivel text not null, -- Ex: "Berçário", "Fundamental I"
  turno text not null, -- "Parcial", "Integral"
  valor_matricula numeric(10,2) default 0,
  valor_mensalidade numeric(10,2) default 0,
  valor_janeiro numeric(10,2) default 0, -- Diferenciado para Integral
  created_at timestamp with time zone default now()
);

-- 3. RESPONSÁVEIS (Financeiro e Família)
create table public.responsaveis (
  id uuid default gen_random_uuid() primary key,
  escola_id uuid references public.escolas(id),
  foto_url text,
  -- Principal
  nome_completo text not null,
  cpf text unique not null,
  rg text,
  email text not null,
  telefone_celular text not null,
  profissao text,
  local_trabalho text,
  telefone_comercial text,
  escolaridade text,
  -- Secundário (Cônjuge)
  nome_secundario text,
  cpf_secundario text,
  rg_secundario text,
  email_secundario text,
  celular_secundario text,
  profissao_secundario text,
  escolaridade_secundario text,
  -- Endereço
  endereco_rua text,
  endereco_numero text,
  endereco_bairro text,
  endereco_cep text,
  endereco_cidade text,
  endereco_uf text,
  -- Sistema
  asaas_customer_id text,
  created_at timestamp with time zone default now()
);

-- 4. TURMAS
create table public.turmas (
  id uuid default gen_random_uuid() primary key,
  escola_id uuid references public.escolas(id),
  nome text not null, -- Ex: "1º Ano A"
  nivel text not null, -- Vinculo com Tabela de Preços
  turno text check (turno in ('Manhã', 'Tarde', 'Integral')) default 'Manhã',
  capacidade integer default 30,
  ano_letivo integer default 2026,
  created_at timestamp with time zone default now()
);

-- 5. ALUNOS
create table public.alunos (
  id uuid default gen_random_uuid() primary key,
  escola_id uuid references public.escolas(id),
  responsavel_id uuid references public.responsaveis(id),
  turma_id uuid references public.turmas(id),
  foto_url text,
  -- Civil
  nome_completo text not null,
  data_nascimento date,
  naturalidade text,
  uf_nascimento text,
  nacionalidade text default 'Brasileira',
  rg_numero text,
  cpf_aluno text,
  -- Acadêmico
  matricula_escolar text,
  turno_contratado text default 'Manhã', -- O que paga (pode diferir da turma)
  ativo boolean default true,
  -- Financeiro (Contrato)
  valor_mensalidade numeric(10,2),
  desconto_percentual numeric(5,2) default 0,
  dia_vencimento integer default 10,
  -- Filiação
  nome_mae text,
  telefone_mae text,
  nome_pai text,
  telefone_pai text,
  responsavel_pedagogico text,
  -- Saúde & Inclusão
  carteira_sus text,
  tipo_sanguineo text,
  plano_saude text,
  restricoes_alimentares text,
  possui_necessidade_especial boolean default false,
  cid_necessidade text,
  remedios_continuos text,
  observacoes_pedagogicas text,
  -- Jurídico
  autoriza_imagem boolean default true,
  restrucao_judicial text,
  created_at timestamp with time zone default now()
);

-- 6. COBRANÇAS (Financeiro)
create table public.cobrancas (
  id uuid default gen_random_uuid() primary key,
  escola_id uuid references public.escolas(id),
  aluno_id uuid references public.alunos(id),
  responsavel_id uuid references public.responsaveis(id),
  
  descricao text, -- Ex: "Mensalidade Março/2025"
  valor_original numeric(10,2) not null,
  data_vencimento date not null,
  
  -- Controle de Status (Inclui PARCIAL)
  status text check (status in ('PENDENTE', 'PAGO', 'ATRASADO', 'CANCELADO', 'PARCIAL')) default 'PENDENTE',
  
  -- Baixa
  data_pagamento timestamp with time zone,
  valor_pago numeric(10,2),
  forma_pagamento text, -- Pix, Dinheiro, Cartão
  observacao text,
  
  -- Integração Asaas
  asaas_cobranca_id text,
  asaas_url_pagamento text,
  link_nota_fiscal text,
  
  created_at timestamp with time zone default now()
);

-- 7. LOGS DE AUDITORIA (Segurança)
create table public.logs_atividades (
  id uuid default gen_random_uuid() primary key,
  data_hora timestamp with time zone default now(),
  usuario text,
  acao text, -- Ex: 'BAIXA_FINANCEIRA'
  detalhes text,
  entidade_afetada text,
  dados_tecnicos jsonb
);

-- 8. SOLICITAÇÕES DE ALTERAÇÃO (Portal dos Pais)
create table public.solicitacoes_alteracao (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  status text default 'PENDENTE', -- PENDENTE, APROVADO, REJEITADO
  tipo_entidade text not null, -- 'RESPONSAVEL'
  entidade_id uuid not null,
  dados_novos jsonb not null,
  mensagem_pai text
);

-- 9. AUTORIZADOS A BUSCAR
create table public.autorizados_buscar (
  id uuid default gen_random_uuid() primary key,
  escola_id uuid references public.escolas(id),
  aluno_id uuid references public.alunos(id) on delete cascade,
  nome_completo text not null,
  parentesco text not null,
  cpf text,
  telefone text,
  foto_url text,
  created_at timestamp with time zone default now()
);

-- HABILITAR SEGURANÇA (RLS) - MODO DESENVOLVIMENTO (LIBERADO)
alter table public.escolas enable row level security;
alter table public.tabela_precos enable row level security;
alter table public.responsaveis enable row level security;
alter table public.turmas enable row level security;
alter table public.alunos enable row level security;
alter table public.cobrancas enable row level security;
alter table public.logs_atividades enable row level security;
alter table public.solicitacoes_alteracao enable row level security;
alter table public.autorizados_buscar enable row level security;

-- Políticas Genéricas de Acesso Total (Para o MVP funcionar sem login complexo)
create policy "Acesso Total" on public.escolas for all using (true);
create policy "Acesso Total" on public.tabela_precos for all using (true);
create policy "Acesso Total" on public.responsaveis for all using (true);
create policy "Acesso Total" on public.turmas for all using (true);
create policy "Acesso Total" on public.alunos for all using (true);
create policy "Acesso Total" on public.cobrancas for all using (true);
create policy "Acesso Total" on public.logs_atividades for all using (true);
create policy "Acesso Total" on public.solicitacoes_alteracao for all using (true);
create policy "Acesso Total" on public.autorizados_buscar for all using (true);