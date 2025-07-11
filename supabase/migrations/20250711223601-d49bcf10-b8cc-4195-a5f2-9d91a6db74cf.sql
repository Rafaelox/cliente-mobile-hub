-- Atualizar a senha do usuário admin para garantir que funcione
UPDATE auth.users 
SET encrypted_password = crypt('admin1234', gen_salt('bf'))
WHERE email = 'adm@rpedro.com';