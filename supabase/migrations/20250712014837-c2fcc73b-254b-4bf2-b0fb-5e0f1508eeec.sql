-- Como não podemos acessar senhas existentes, vamos remover o usuário atual
-- e criar um novo através do sistema de auth do Supabase

-- Primeiro, remover o profile existente do adm@rpedro.com
DELETE FROM public.profiles 
WHERE id IN (
  SELECT au.id 
  FROM auth.users au 
  WHERE au.email = 'adm@rpedro.com'
);

-- O usuário será recriado através do signup da aplicação
-- Vamos criar também uma função helper para facilitar a criação de usuários master
CREATE OR REPLACE FUNCTION create_master_profile(user_id UUID, user_name TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, permissao, ativo)
  VALUES (user_id, user_name, 'master', true)
  ON CONFLICT (id) DO UPDATE SET
    permissao = 'master',
    ativo = true;
END;
$$;