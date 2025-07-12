-- Função para transformar usuário existente em master
CREATE OR REPLACE FUNCTION public.make_user_master_by_email(user_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
  result_msg TEXT;
BEGIN
  -- Buscar o ID do usuário pelo email
  SELECT au.id INTO user_id
  FROM auth.users au
  WHERE au.email = user_email;
  
  -- Se não encontrou o usuário
  IF user_id IS NULL THEN
    RETURN 'Usuário não encontrado com email: ' || user_email;
  END IF;
  
  -- Inserir ou atualizar o profile para master
  INSERT INTO public.profiles (id, nome, permissao, ativo)
  VALUES (user_id, 'Admin Master', 'master', true)
  ON CONFLICT (id) DO UPDATE SET
    permissao = 'master',
    nome = 'Admin Master',
    ativo = true;
    
  RETURN 'Usuário ' || user_email || ' configurado como MASTER com sucesso!';
END;
$$;

-- Executar a função para o email do usuário
SELECT public.make_user_master_by_email('rpedro@oxum.com.br');