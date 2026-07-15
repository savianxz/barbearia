-- Script: fix_barbers_rls.sql
-- Description: Fix RLS policies for the barbers table, using the auth_user_shop_id() function.

-- 1. Certifique-se de que o RLS está ativado
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;

-- 2. Remover as policies antigas caso existam
DROP POLICY IF EXISTS "barbers_select_policy" ON public.barbers;
DROP POLICY IF EXISTS "barbers_insert_policy" ON public.barbers;
DROP POLICY IF EXISTS "barbers_update_policy" ON public.barbers;
DROP POLICY IF EXISTS "barbers_delete_policy" ON public.barbers;

-- 3. Criar as novas policies restritas ao shop_id do usuário logado (via staff)

-- SELECT: Permite visualizar apenas os barbeiros do próprio shop_id
CREATE POLICY "barbers_select_policy" ON public.barbers
  FOR SELECT
  USING (shop_id = auth_user_shop_id());

-- INSERT: Permite inserir apenas se o shop_id bater com o do usuário autenticado
CREATE POLICY "barbers_insert_policy" ON public.barbers
  FOR INSERT
  WITH CHECK (shop_id = auth_user_shop_id());

-- UPDATE: Permite atualizar apenas barbeiros que pertençam ao shop_id do usuário, 
-- e impede alterar o shop_id do barbeiro para um diferente
CREATE POLICY "barbers_update_policy" ON public.barbers
  FOR UPDATE
  USING (shop_id = auth_user_shop_id())
  WITH CHECK (shop_id = auth_user_shop_id());

-- DELETE: Permite excluir apenas barbeiros do próprio shop_id
CREATE POLICY "barbers_delete_policy" ON public.barbers
  FOR DELETE
  USING (shop_id = auth_user_shop_id());

-- Confirmação
DO $$ 
BEGIN 
  RAISE NOTICE 'Policies para a tabela barbers recriadas com sucesso usando auth_user_shop_id().'; 
END $$;
