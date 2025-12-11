-- --------------------------------------------------------
-- SCRIPT DE SEGURANÇA (HARDENING) & MULTI-TENANCY
-- Objetivo: Isolar dados por escola e gerenciar permissões
-- --------------------------------------------------------

-- 1. LIMPEZA DE POLÍTICAS INSEGURAS (REMOVE "ACESSO TOTAL")
-- Removemos as políticas antigas que permitiam acesso irrestrito a qualquer um.
drop policy if exists "Acesso Total" on public.escolas;
drop policy if exists "Acesso Total" on public.tabela_precos;
drop policy if exists "Acesso Total" on public.responsaveis;
drop policy if exists "Acesso Total" on public.turmas;
drop policy if exists "Acesso Total" on public.alunos;
drop policy if exists "Acesso Total" on public.cobrancas;
drop policy if exists "Acesso Total" on public.logs_atividades;
drop policy if exists "Acesso Total" on public.solicitacoes_alteracao;
drop policy if exists "Acesso Total" on public.autorizados_buscar;

-- 2. CRIAÇÃO DE ROLES E PERFIL DE USUÁRIO
-- Define os tipos de usuários permitidos no sistema
drop type if exists public.app_role;
create type public.app_role as enum ('admin', 'secretaria', 'responsavel');

-- Tabela que vincula o usuário do Supabase (auth.users) a uma Escola específica
create table if not exists public.users_profiles (
  id uuid references auth.users on delete cascade primary key, -- Vínculo direto com a autenticação
  escola_id uuid references public.escolas(id),
  role public.app_role default 'responsavel',
  email text,
  nome_completo text,
  created_at timestamp with time zone default now()
);

-- Habilita segurança nesta tabela também (ninguém deve ver perfil dos outros)
alter table public.users_profiles enable row level security;

-- 3. TRIGGER PARA CRIAÇÃO AUTOMÁTICA DE PERFIL
-- Quando um usuário se cadastra, cria automaticamente uma entrada em users_profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users_profiles (id, email, nome_completo, role)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    'responsavel' -- Padrão: todo mundo entra como pai/responsável até ser promovido
  );
  return new;
end;
$$ language plpgsql security definer;

-- Remove trigger antigo se existir para evitar duplicação
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. POLÍTICAS DE ISOLAMENTO (ROW LEVEL SECURITY)
-- A regra de ouro: O usuário só vê linhas onde a escola_id é igual à escola_id do perfil dele.

-- Função auxiliar para pegar o ID da escola do usuário logado (Cache friendly)
create or replace function getting_user_school_id()
returns uuid as $$
  select escola_id from public.users_profiles where id = auth.uid() limit 1;
$$ language sql stable;

-- A. Policy para USERS_PROFILES (Usuário vê apenas o próprio perfil)
create policy "Ver próprio perfil" on public.users_profiles
  for select using (auth.uid() = id);

create policy "Editar próprio perfil" on public.users_profiles
  for update using (auth.uid() = id);

-- B. Policy para ESCOLAS (Usuário só vê os dados da escola que ele pertence)
create policy "Ver minha escola" on public.escolas
  for select using (id = getting_user_school_id());

-- C. Policy para TABELAS GERAIS (Alunos, Turmas, Cobranças, etc)
-- Aplica a regra: "escola_id da linha deve ser igual à minha escola_id"

-- ALUNOS
create policy "Tenant Isolation Alunos" on public.alunos
  for all using (escola_id = getting_user_school_id());

-- TURMAS
create policy "Tenant Isolation Turmas" on public.turmas
  for all using (escola_id = getting_user_school_id());

-- RESPONSAVEIS
create policy "Tenant Isolation Responsaveis" on public.responsaveis
  for all using (escola_id = getting_user_school_id());

-- COBRANCAS
create policy "Tenant Isolation Cobrancas" on public.cobrancas
  for all using (escola_id = getting_user_school_id());

-- TABELA DE PREÇOS
create policy "Tenant Isolation Precos" on public.tabela_precos
  for select using (escola_id = getting_user_school_id());

-- LOGS
create policy "Tenant Isolation Logs" on public.logs_atividades
  for all using (
    -- Logs geralmente não tem escola_id direto no seu esquema original, 
    -- vamos assumir que você adicionará ou filtrará pelo usuário.
    -- Se o log tiver usuario_id, usamos ele. Se for global, admin vê tudo.
    -- Para este MVP, vamos restringir ao usuário dono da ação:
    usuario = 'Diretoria (Admin)' OR -- Legado
    auth.uid()::text = usuario -- Futuro
  );

-- SOLICITAÇÕES
create policy "Tenant Isolation Solicitacoes" on public.solicitacoes_alteracao
  for all using (
    -- Aqui precisamos de um join complexo pois a tabela não tem escola_id explícito no schema original
    -- Recomendo adicionar escola_id nesta tabela também. Por enquanto, bloqueamos acesso direto.
    false 
  );

-- AUTORIZADOS A BUSCAR
create policy "Tenant Isolation Autorizados" on public.autorizados_buscar
  for all using (escola_id = getting_user_school_id());