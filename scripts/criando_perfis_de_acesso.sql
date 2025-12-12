-- SCRIPT DE CRIAÇÃO DE USUÁRIOS DE TESTE (PERFIS)
DO $$
DECLARE
  v_escola_id uuid;
  v_pai_resp_id uuid;
BEGIN
  -- 1. Buscar a Escola Principal (Criada no Seed)
  SELECT id INTO v_escola_id FROM public.escolas LIMIT 1;
  
  IF v_escola_id IS NULL THEN
    RAISE EXCEPTION 'Nenhuma escola encontrada. Rode o script 02_dados_ficticios_seed.sql primeiro.';
  END IF;

  -- ===================================================
  -- USUÁRIO 1: SUPERUSUÁRIO (Dono do SaaS)
  -- ===================================================
  UPDATE public.users_profiles
  SET 
    roles = ARRAY['admin']::public.app_role[],
    is_superuser = true,
    nome_completo = 'Super Admin Global',
    escola_id = v_escola_id -- Superusuário pode ter uma escola "home" ou ser null
  WHERE email = 'super@admin.com';

  -- ===================================================
  -- USUÁRIO 2: DIRETOR (Admin da Escola)
  -- ===================================================
  UPDATE public.users_profiles
  SET 
    roles = ARRAY['admin']::public.app_role[],
    is_superuser = false,
    nome_completo = 'Diretor Skinner',
    escola_id = v_escola_id
  WHERE email = 'diretor@escola.com';

  -- ===================================================
  -- USUÁRIO 3: SECRETARIA (Operacional)
  -- ===================================================
  UPDATE public.users_profiles
  SET 
    roles = ARRAY['secretaria']::public.app_role[],
    is_superuser = false,
    nome_completo = 'Secretária Claudia',
    escola_id = v_escola_id
  WHERE email = 'secretaria@escola.com';

  -- ===================================================
  -- USUÁRIO 4: RESPONSÁVEL (Pai/Mãe)
  -- ===================================================
  -- A. Atualiza o perfil de acesso
  UPDATE public.users_profiles
  SET 
    roles = ARRAY['responsavel']::public.app_role[],
    is_superuser = false,
    nome_completo = 'Pai de Teste',
    escola_id = v_escola_id
  WHERE email = 'pai@escola.com';

  -- B. CRÍTICO: Para o portal funcionar, este email precisa existir na tabela de Negócio (responsaveis)
  -- Vamos verificar se já existe ou criar um Responsável "real" para este login
  
  -- Tenta achar pelo email
  SELECT id INTO v_pai_resp_id FROM public.responsaveis WHERE email = 'pai@escola.com' LIMIT 1;

  -- Se não existir, cria o registro financeiro/acadêmico do pai
  IF v_pai_resp_id IS NULL THEN
    INSERT INTO public.responsaveis (escola_id, nome_completo, cpf, email, telefone_celular)
    VALUES (v_escola_id, 'Pai de Teste da Silva', '999.888.777-66', 'pai@escola.com', '(11) 98765-4321')
    RETURNING id INTO v_pai_resp_id;
    
    -- E cria um filho para ele ter o que ver no portal
    INSERT INTO public.alunos (escola_id, responsavel_id, nome_completo, data_nascimento, turma_atual)
    VALUES (v_escola_id, v_pai_resp_id, 'Filho do Teste Jr', '2015-05-20', '3º Ano A');
    
    -- E uma cobrança para ele pagar
    INSERT INTO public.cobrancas (escola_id, aluno_id, responsavel_id, valor_original, data_vencimento, descricao, status)
    VALUES (
      v_escola_id, 
      (SELECT id FROM public.alunos WHERE responsavel_id = v_pai_resp_id LIMIT 1), 
      v_pai_resp_id, 
      1200.00, 
      (now() + interval '5 days')::date, -- Vence daqui 5 dias
      'Mensalidade Teste', 
      'PENDENTE'
    );
  END IF;

  RAISE NOTICE 'Usuários de teste configurados com sucesso na escola %!', v_escola_id;
END $$;