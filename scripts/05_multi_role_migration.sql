-- --------------------------------------------------------
-- MIGRAÇÃO PARA MULTI-ROLE E SUPERUSUÁRIO
-- Objetivo: Permitir múltiplos perfis por usuário e admin global
-- --------------------------------------------------------

-- 1. Adicionar colunas novas
ALTER TABLE public.users_profiles 
ADD COLUMN IF NOT EXISTS roles public.app_role[] DEFAULT '{responsavel}',
ADD COLUMN IF NOT EXISTS is_superuser boolean DEFAULT false;

-- 2. Migrar dados antigos (Quem era 'admin' vira array ['admin'])
UPDATE public.users_profiles 
SET roles = ARRAY[role];

-- 3. Remover a coluna antiga (Opcional, mas recomendado para limpeza)
-- Vamos manter por enquanto como 'role_legacy' se quiser backup, ou dropar.
-- Para o tutorial, vamos dropar para forçar o uso da nova lógica.
ALTER TABLE public.users_profiles DROP COLUMN role;

-- 4. Atualizar o Trigger de Novos Usuários
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users_profiles (id, email, nome_completo, roles)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    ARRAY['responsavel']::public.app_role[] -- Padrão: Array com 1 item
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Função Auxiliar para verificar permissão (Simplifica RLS)
-- Retorna TRUE se o usuário tem o papel X ou é Superusuário
CREATE OR REPLACE FUNCTION public.has_role(required_role public.app_role)
RETURNS boolean AS $$
DECLARE
  current_roles public.app_role[];
  is_super boolean;
BEGIN
  SELECT roles, is_superuser INTO current_roles, is_super
  FROM public.users_profiles
  WHERE id = auth.uid();

  IF is_super THEN 
    RETURN true; 
  END IF;

  RETURN required_role = ANY(current_roles);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 6. Atualizar a Função de Isolamento de Escola (Superusuário vê tudo)
CREATE OR REPLACE FUNCTION getting_user_school_id()
RETURNS uuid AS $$
DECLARE
  v_escola_id uuid;
  v_is_superuser boolean;
BEGIN
  SELECT escola_id, is_superuser INTO v_escola_id, v_is_superuser
  FROM public.users_profiles 
  WHERE id = auth.uid();
  
  -- Se for superusuário, retornamos NULL ou lidamos nas policies.
  -- Para manter simples: Superusuário deve "escolher" uma escola para gerenciar ou ter acesso bypass.
  -- Vamos manter a lógica: Se é superuser, a RLS abaixo vai liberar.
  
  RETURN v_escola_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- 7. ATUALIZAR POLICIES (Exemplo Crítico: Alunos)
-- Superusuário vê tudo. Usuário comum vê se for da escola dele.

DROP POLICY IF EXISTS "Tenant Isolation Alunos" ON public.alunos;

CREATE POLICY "Tenant Isolation Alunos" ON public.alunos
FOR ALL USING (
  (SELECT is_superuser FROM public.users_profiles WHERE id = auth.uid()) = true
  OR
  escola_id = getting_user_school_id()
);

-- (Repetir essa lógica de Policy para as outras tabelas se necessário, 
-- ou confiar que o Superusuário vai se atribuir à escola que quer gerenciar via update no banco)