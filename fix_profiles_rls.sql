-- ─── RLS: Políticas da tabela profiles ───────────────────────────────────────
-- Garante que usuários autenticados consigam ler o próprio profile.
-- Executar no Supabase SQL Editor.

-- 1. Habilitar RLS (se ainda não estiver ativo)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas antigas conflitantes (se existirem)
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 3. Criar política: usuário autenticado lê SOMENTE o próprio profile
CREATE POLICY "profiles_select_own"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 4. Criar política: usuário autenticado atualiza SOMENTE o próprio profile
CREATE POLICY "profiles_update_own"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 5. Política de inserção via service_role (trigger handle_new_user)
-- Isso garante que a trigger continue funcionando
DROP POLICY IF EXISTS "profiles_insert_service" ON public.profiles;
CREATE POLICY "profiles_insert_service"
ON public.profiles
FOR INSERT
TO service_role
WITH CHECK (true);
