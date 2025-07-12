-- Migração completa: Usuários da tabela usuarios para Supabase Auth
-- Parte 1: Criar tabela profiles para dados complementares

-- Criar tabela profiles para dados adicionais dos usuários
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  consultor_id BIGINT REFERENCES public.consultores(id),
  permissao TEXT NOT NULL DEFAULT 'user',
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Permitir acesso completo a profiles" 
ON public.profiles 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Criar função para criar usuário no Supabase Auth via SQL
CREATE OR REPLACE FUNCTION public.create_auth_user_and_profile(
  p_email TEXT,
  p_password TEXT,
  p_nome TEXT,
  p_consultor_id BIGINT DEFAULT NULL,
  p_permissao TEXT DEFAULT 'user'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Gerar UUID para o novo usuário
  new_user_id := gen_random_uuid();
  
  -- Inserir na tabela auth.users (simulação - na prática seria via API)
  -- Como não podemos inserir diretamente em auth.users via SQL,
  -- esta função serve como template para a migração via dashboard
  
  -- Inserir no profiles
  INSERT INTO public.profiles (
    id,
    nome,
    consultor_id,
    permissao,
    ativo
  ) VALUES (
    new_user_id,
    p_nome,
    p_consultor_id,
    p_permissao,
    true
  );
  
  RETURN new_user_id;
END;
$$;

-- Criar função para sincronizar novos usuários do auth com profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inserir dados básicos no profiles quando um usuário é criado no auth
  INSERT INTO public.profiles (
    id,
    nome,
    permissao,
    ativo
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    'user',
    true
  );
  
  RETURN NEW;
END;
$$;

-- Criar trigger para auto-criar profiles quando usuário é criado no auth
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar updated_at em profiles
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profiles_updated_at();

-- Script para mostrar dados a serem migrados (para referência)
-- Os usuários da tabela usuarios que precisam ser migrados:
SELECT 
  id,
  email,
  nome,
  consultor_id,
  permissao,
  ativo,
  'Precisa ser migrado para auth.users' as status
FROM public.usuarios 
WHERE ativo = true
ORDER BY created_at;

-- Inserir um usuário administrador no sistema auth (via função)
-- Este usuário poderá ser criado manualmente no dashboard
-- Email: admin@sistema.com
-- Password: Admin123!
-- Nome: Administrador do Sistema