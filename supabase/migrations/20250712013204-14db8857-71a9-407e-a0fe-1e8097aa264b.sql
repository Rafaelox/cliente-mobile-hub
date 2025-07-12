-- Corrigir tabela profiles para integração adequada com Supabase Auth
-- Remover campos desnecessários e adicionar FK correta para auth.users

-- Primeiro, salvar dados existentes em uma tabela temporária
CREATE TABLE IF NOT EXISTS profiles_backup AS 
SELECT * FROM public.profiles;

-- Dropar a tabela profiles atual
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Recriar tabela profiles com estrutura correta
CREATE TABLE public.profiles (
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
CREATE POLICY "Usuários podem ver seus próprios profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seus próprios profiles" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Sistema pode inserir profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

-- Atualizar função para sincronizar novos usuários do auth com profiles
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

-- Recriar trigger para auto-criar profiles quando usuário é criado no auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
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
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profiles_updated_at();

-- Remover funções de login customizado que não são mais necessárias
DROP FUNCTION IF EXISTS public.custom_login(text, text);
DROP FUNCTION IF EXISTS public.create_custom_user(text, text, text, text, bigint);
DROP FUNCTION IF EXISTS public.update_custom_user(uuid, text, text, text, boolean, text, bigint);
DROP FUNCTION IF EXISTS public.delete_custom_user(uuid);
DROP FUNCTION IF EXISTS public.create_auth_user_and_profile(text, text, text, bigint, text);