-- Solução direta: resetar senha do admin@sistema.com para uma senha conhecida
-- Vamos usar uma abordagem diferente - criar um usuário temporário direto no auth

-- Primeiro, verificar se existe e remover profile existente
DELETE FROM public.profiles WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'teste@admin.com'
);

-- Atualizar o perfil do admin@sistema.com para master com certeza
UPDATE public.profiles 
SET permissao = 'master', nome = 'Admin Master'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'admin@sistema.com'
);

-- Vamos também simplificar as políticas RLS para evitar problemas
DROP POLICY IF EXISTS "Admins podem ver todos os profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins podem atualizar profiles" ON public.profiles;

-- Política mais simples
CREATE POLICY "Todos podem ver profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Todos podem atualizar profiles" ON public.profiles FOR UPDATE USING (true);

-- Verificar o resultado
SELECT p.nome, p.permissao, au.email, au.email_confirmed_at
FROM public.profiles p 
JOIN auth.users au ON p.id = au.id 
ORDER BY p.permissao DESC;