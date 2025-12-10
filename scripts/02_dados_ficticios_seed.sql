-- SCRIPT DE POPULAÇÃO DE DADOS (SEED)
-- Autor: Fabiano (Tech Lead)
-- Data: 29/11/2025

DO $$
DECLARE
  v_escola_id uuid;
  v_resp_joao uuid;
  v_resp_maria uuid;
  v_resp_carlos uuid;
  v_resp_ana uuid;
  v_resp_pedro uuid;
  -- Variáveis para loops
  i integer;
  v_resp_temp uuid;
  v_aluno_temp uuid;
BEGIN

  -- 1. CRIAR A ESCOLA PILOTO
  INSERT INTO public.escolas (nome_fantasia, razao_social, cnpj, email_contato)
  VALUES ('Colégio Futuro Brilhante', 'Futuro Brilhante Educacional LTDA', '12.345.678/0001-99', 'financeiro@futurobrilhante.com.br')
  RETURNING id INTO v_escola_id;

  RAISE NOTICE 'Escola Criada com ID: %', v_escola_id;

  -- 2. CRIAR 5 RESPONSÁVEIS "PRINCIPAIS" (DADOS RICOS)
  
  -- Responsável 1: João Silva (Pai de 2)
  INSERT INTO public.responsaveis (escola_id, nome_completo, cpf, email, telefone_celular, endereco_bairro)
  VALUES (v_escola_id, 'João da Silva', '111.111.111-11', 'joao@email.com', '(11) 99999-1111', 'Centro')
  RETURNING id INTO v_resp_joao;

  -- Responsável 2: Maria Oliveira (Mãe solo)
  INSERT INTO public.responsaveis (escola_id, nome_completo, cpf, email, telefone_celular, endereco_bairro)
  VALUES (v_escola_id, 'Maria Oliveira', '222.222.222-22', 'maria@email.com', '(11) 99999-2222', 'Jardins')
  RETURNING id INTO v_resp_maria;

  -- Responsável 3: Carlos Santos (Pai inadimplente)
  INSERT INTO public.responsaveis (escola_id, nome_completo, cpf, email, telefone_celular, endereco_bairro)
  VALUES (v_escola_id, 'Carlos Santos', '333.333.333-33', 'carlos@email.com', '(11) 99999-3333', 'Vila Nova')
  RETURNING id INTO v_resp_carlos;
  
  -- Responsável 4: Ana Costa
  INSERT INTO public.responsaveis (escola_id, nome_completo, cpf, email, telefone_celular, endereco_bairro)
  VALUES (v_escola_id, 'Ana Costa', '444.444.444-44', 'ana@email.com', '(11) 99999-4444', 'Centro')
  RETURNING id INTO v_resp_ana;

  -- Responsável 5: Pedro Alves
  INSERT INTO public.responsaveis (escola_id, nome_completo, cpf, email, telefone_celular, endereco_bairro)
  VALUES (v_escola_id, 'Pedro Alves', '555.555.555-55', 'pedro@email.com', '(11) 99999-5555', 'Sul')
  RETURNING id INTO v_resp_pedro;

  -- 3. CRIAR ALUNOS (Vinculados aos pais acima)
  
  -- Filhos do João (Irmãos)
  INSERT INTO public.alunos (escola_id, responsavel_id, nome_completo, turma_atual, nome_pai, nome_mae)
  VALUES (v_escola_id, v_resp_joao, 'Lucas Silva', '5º Ano A', 'João da Silva', 'Helena Silva');
  
  INSERT INTO public.alunos (escola_id, responsavel_id, nome_completo, turma_atual, nome_pai, nome_mae)
  VALUES (v_escola_id, v_resp_joao, 'Beatriz Silva', '3º Ano B', 'João da Silva', 'Helena Silva');

  -- Filho da Maria
  INSERT INTO public.alunos (escola_id, responsavel_id, nome_completo, turma_atual, nome_mae)
  VALUES (v_escola_id, v_resp_maria, 'Enzo Oliveira', '1º Ano A', 'Maria Oliveira');

  -- Filho do Carlos
  INSERT INTO public.alunos (escola_id, responsavel_id, nome_completo, turma_atual, nome_pai)
  VALUES (v_escola_id, v_resp_carlos, 'Gabriel Santos', '9º Ano C', 'Carlos Santos');

  -- 4. GERAR MAIS 26 ALUNOS E RESPONSÁVEIS GENÉRICOS (Para volume)
  FOR i IN 1..26 LOOP
    -- Cria um pai genérico
    INSERT INTO public.responsaveis (escola_id, nome_completo, cpf, email, telefone_celular)
    VALUES (v_escola_id, 'Responsavel Genérico ' || i, '000.000.000-' || i, 'pai'||i||'@teste.com', '(11) 90000-' || i)
    RETURNING id INTO v_resp_temp;

    -- Cria um aluno genérico para esse pai
    INSERT INTO public.alunos (escola_id, responsavel_id, nome_completo, turma_atual, nome_mae)
    VALUES (v_escola_id, v_resp_temp, 'Aluno Teste ' || i, 'Turma X', 'Mãe Genérica ' || i)
    RETURNING id INTO v_aluno_temp;

    -- Gera 3 cobranças para cada um (Jan, Fev, Mar)
    
    -- Janeiro (PAGO)
    INSERT INTO public.cobrancas (escola_id, aluno_id, responsavel_id, valor_original, data_vencimento, descricao, status, data_pagamento, valor_pago)
    VALUES (v_escola_id, v_aluno_temp, v_resp_temp, 500.00, '2025-01-10', 'Mensalidade Jan/25', 'PAGO', '2025-01-09', 500.00);

    -- Fevereiro (PAGO)
    INSERT INTO public.cobrancas (escola_id, aluno_id, responsavel_id, valor_original, data_vencimento, descricao, status, data_pagamento, valor_pago)
    VALUES (v_escola_id, v_aluno_temp, v_resp_temp, 500.00, '2025-02-10', 'Mensalidade Fev/25', 'PAGO', '2025-02-10', 500.00);
    
    -- Março (PENDENTE ou ATRASADO aleatoriamente)
    IF (i % 3 = 0) THEN -- A cada 3, um está atrasado
        INSERT INTO public.cobrancas (escola_id, aluno_id, responsavel_id, valor_original, data_vencimento, descricao, status)
        VALUES (v_escola_id, v_aluno_temp, v_resp_temp, 500.00, '2025-03-10', 'Mensalidade Mar/25', 'ATRASADO');
    ELSE
        INSERT INTO public.cobrancas (escola_id, aluno_id, responsavel_id, valor_original, data_vencimento, descricao, status)
        VALUES (v_escola_id, v_aluno_temp, v_resp_temp, 500.00, '2025-04-10', 'Mensalidade Abr/25', 'PENDENTE');
    END IF;

  END LOOP;

END $$;