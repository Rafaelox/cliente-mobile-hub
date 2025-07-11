-- Criar um usuário de teste no sistema de auth do Supabase
-- Como não podemos inserir diretamente na tabela auth.users, vamos criar uma função
-- que permite criar usuários programaticamente

-- Inserir um usuário de teste via SQL (alternativa)
-- Nota: Para testes, recomendo usar o dashboard do Supabase para criar usuários
-- ou usar a função signUp do frontend

-- Verificar usuários existentes na tabela usuarios
SELECT email, nome FROM usuarios LIMIT 5;