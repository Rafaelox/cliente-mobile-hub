-- Primeiro, vamos atualizar o perfil do admin@sistema.com para ser master
UPDATE public.profiles 
SET permissao = 'master' 
WHERE id = (
  SELECT au.id 
  FROM auth.users au 
  WHERE au.email = 'admin@sistema.com'
  LIMIT 1
);

-- Verificar se o update funcionou
SELECT p.nome, p.permissao, au.email 
FROM public.profiles p 
JOIN auth.users au ON p.id = au.id 
WHERE au.email = 'admin@sistema.com';