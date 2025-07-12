-- Vou usar um email válido e criar o profile diretamente
-- Primeiro, vamos limpar qualquer usuário existente com este email
DELETE FROM public.profiles 
WHERE id IN (
  SELECT au.id 
  FROM auth.users au 
  WHERE au.email = 'master@gmail.com'
);

-- Criar função para facilitar criação de usuário master após signup
CREATE OR REPLACE FUNCTION public.make_user_master(user_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Buscar o ID do usuário pelo email
  SELECT au.id INTO user_id
  FROM auth.users au
  WHERE au.email = user_email;
  
  -- Se encontrou o usuário, atualizar para master
  IF user_id IS NOT NULL THEN
    UPDATE public.profiles 
    SET permissao = 'master',
        nome = 'Master Admin'
    WHERE id = user_id;
  END IF;
END;
$$;