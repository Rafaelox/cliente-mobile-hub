-- Criptografar senhas existentes na tabela usuarios
UPDATE usuarios 
SET senha = crypt(senha, gen_salt('bf'))
WHERE senha NOT LIKE '$2%'; -- Só atualiza senhas que não estão já criptografadas

-- Criar função para criptografar senhas automaticamente em novos inserts/updates
CREATE OR REPLACE FUNCTION public.encrypt_password()
RETURNS TRIGGER AS $$
BEGIN
  -- Se a senha foi modificada e não está criptografada, criptografar
  IF NEW.senha IS DISTINCT FROM OLD.senha AND NEW.senha NOT LIKE '$2%' THEN
    NEW.senha = crypt(NEW.senha, gen_salt('bf'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para criptografar senhas automaticamente
DROP TRIGGER IF EXISTS encrypt_password_trigger ON usuarios;
CREATE TRIGGER encrypt_password_trigger
  BEFORE INSERT OR UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.encrypt_password();