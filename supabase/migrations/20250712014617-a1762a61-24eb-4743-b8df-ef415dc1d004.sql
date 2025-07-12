-- Criar usuário master através de INSERT direto na tabela auth.users (apenas para desenvolvimento)
-- IMPORTANTE: Em produção, usuários devem ser criados através do signup normal

-- Primeiro, vamos sincronizar os usuários existentes criando profiles para eles
INSERT INTO public.profiles (id, nome, permissao, ativo)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data ->> 'full_name', au.email) as nome,
  CASE 
    WHEN au.email LIKE '%admin%' OR au.email LIKE '%adm%' THEN 'admin'
    WHEN au.email LIKE '%consultor%' THEN 'user'
    ELSE 'user'
  END as permissao,
  true as ativo
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = au.id
);

-- Criar uma política temporária para permitir que admins vejam todos os profiles
CREATE POLICY "Admins podem ver todos os profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND permissao IN ('admin', 'master')
  )
);

-- Criar uma política para admins atualizarem profiles
CREATE POLICY "Admins podem atualizar profiles" 
ON public.profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND permissao IN ('admin', 'master')
  )
);

-- Atualizar um dos usuários existentes para ser master
UPDATE public.profiles 
SET permissao = 'master' 
WHERE id = (
  SELECT au.id 
  FROM auth.users au 
  WHERE au.email = 'adm@rpedro.com'
  LIMIT 1
);