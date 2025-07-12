-- Correção da estrutura da tabela profiles para funcionar com Supabase Auth

-- Primeiro, vamos remover campos que não devem existir
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS email,
DROP COLUMN IF EXISTS senha_temp;

-- Adicionar constraint de foreign key para auth.users se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_id_fkey' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_id_fkey 
        FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Atualizar as políticas RLS para serem mais seguras
DROP POLICY IF EXISTS "Permitir acesso completo a profiles" ON public.profiles;

-- Política para usuários verem seu próprio perfil
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Política para usuários atualizarem seu próprio perfil
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Política para inserir perfil (será usado pelo trigger)
CREATE POLICY "Enable insert for service role" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

-- Política para admins/masters verem todos os perfis
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND permissao IN ('master', 'admin')
    )
);

-- Política para admins/masters atualizarem perfis
CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND permissao IN ('master', 'admin')
    )
);

-- Atualizar a função handle_new_user para funcionar corretamente
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

-- Recriar o trigger se não existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();