-- ==========================================
-- SCRIPT: setup_business_rls.sql
-- OBJETIVO: Configurar RLS e isolamento multi-tenant (100% via auth_user_shop_id)
-- TABELAS: shops, barbers, customers, services, appointments
-- ==========================================

-- 1. Habilitar o RLS em todas as tabelas principais
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 2. Limpeza de Policies Antigas (Idempotência)
-- ==========================================

-- SHOPS
DROP POLICY IF EXISTS "shops_select_policy" ON public.shops;
DROP POLICY IF EXISTS "shops_insert_policy" ON public.shops;
DROP POLICY IF EXISTS "shops_update_policy" ON public.shops;
DROP POLICY IF EXISTS "shops_delete_policy" ON public.shops;

-- BARBERS
DROP POLICY IF EXISTS "barbers_select_policy" ON public.barbers;
DROP POLICY IF EXISTS "barbers_insert_policy" ON public.barbers;
DROP POLICY IF EXISTS "barbers_update_policy" ON public.barbers;
DROP POLICY IF EXISTS "barbers_delete_policy" ON public.barbers;

-- CUSTOMERS
DROP POLICY IF EXISTS "customers_select_policy" ON public.customers;
DROP POLICY IF EXISTS "customers_insert_policy" ON public.customers;
DROP POLICY IF EXISTS "customers_update_policy" ON public.customers;
DROP POLICY IF EXISTS "customers_delete_policy" ON public.customers;

-- SERVICES
DROP POLICY IF EXISTS "services_select_policy" ON public.services;
DROP POLICY IF EXISTS "services_insert_policy" ON public.services;
DROP POLICY IF EXISTS "services_update_policy" ON public.services;
DROP POLICY IF EXISTS "services_delete_policy" ON public.services;

-- APPOINTMENTS
DROP POLICY IF EXISTS "appointments_select_policy" ON public.appointments;
DROP POLICY IF EXISTS "appointments_insert_policy" ON public.appointments;
DROP POLICY IF EXISTS "appointments_update_policy" ON public.appointments;
DROP POLICY IF EXISTS "appointments_delete_policy" ON public.appointments;


-- ==========================================
-- 3. Criação das Novas Policies (Isolamento por shop_id)
-- ==========================================

---------------------------------------------
-- TABELA: shops
-- Atenção: A própria tabela de lojas usa a coluna "id" em vez de "shop_id"
---------------------------------------------
CREATE POLICY "shops_select_policy" ON public.shops
  FOR SELECT USING (id = auth_user_shop_id());

CREATE POLICY "shops_insert_policy" ON public.shops
  FOR INSERT WITH CHECK (id = auth_user_shop_id());

CREATE POLICY "shops_update_policy" ON public.shops
  FOR UPDATE USING (id = auth_user_shop_id()) WITH CHECK (id = auth_user_shop_id());

CREATE POLICY "shops_delete_policy" ON public.shops
  FOR DELETE USING (id = auth_user_shop_id());

---------------------------------------------
-- TABELA: barbers
---------------------------------------------
CREATE POLICY "barbers_select_policy" ON public.barbers
  FOR SELECT USING (shop_id = auth_user_shop_id());

CREATE POLICY "barbers_insert_policy" ON public.barbers
  FOR INSERT WITH CHECK (shop_id = auth_user_shop_id());

CREATE POLICY "barbers_update_policy" ON public.barbers
  FOR UPDATE USING (shop_id = auth_user_shop_id()) WITH CHECK (shop_id = auth_user_shop_id());

CREATE POLICY "barbers_delete_policy" ON public.barbers
  FOR DELETE USING (shop_id = auth_user_shop_id());

---------------------------------------------
-- TABELA: customers
---------------------------------------------
CREATE POLICY "customers_select_policy" ON public.customers
  FOR SELECT USING (shop_id = auth_user_shop_id());

CREATE POLICY "customers_insert_policy" ON public.customers
  FOR INSERT WITH CHECK (shop_id = auth_user_shop_id());

CREATE POLICY "customers_update_policy" ON public.customers
  FOR UPDATE USING (shop_id = auth_user_shop_id()) WITH CHECK (shop_id = auth_user_shop_id());

CREATE POLICY "customers_delete_policy" ON public.customers
  FOR DELETE USING (shop_id = auth_user_shop_id());

---------------------------------------------
-- TABELA: services
---------------------------------------------
CREATE POLICY "services_select_policy" ON public.services
  FOR SELECT USING (shop_id = auth_user_shop_id());

CREATE POLICY "services_insert_policy" ON public.services
  FOR INSERT WITH CHECK (shop_id = auth_user_shop_id());

CREATE POLICY "services_update_policy" ON public.services
  FOR UPDATE USING (shop_id = auth_user_shop_id()) WITH CHECK (shop_id = auth_user_shop_id());

CREATE POLICY "services_delete_policy" ON public.services
  FOR DELETE USING (shop_id = auth_user_shop_id());

---------------------------------------------
-- TABELA: appointments
---------------------------------------------
CREATE POLICY "appointments_select_policy" ON public.appointments
  FOR SELECT USING (shop_id = auth_user_shop_id());

CREATE POLICY "appointments_insert_policy" ON public.appointments
  FOR INSERT WITH CHECK (shop_id = auth_user_shop_id());

CREATE POLICY "appointments_update_policy" ON public.appointments
  FOR UPDATE USING (shop_id = auth_user_shop_id()) WITH CHECK (shop_id = auth_user_shop_id());

CREATE POLICY "appointments_delete_policy" ON public.appointments
  FOR DELETE USING (shop_id = auth_user_shop_id());


-- ==========================================
-- 4. Consulta de Verificação de Policies Criadas
-- Execute essa query separadamente para validar o diagnóstico
-- ==========================================
/*
SELECT 
    tablename AS tabela,
    COUNT(policyname) AS total_policies
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('shops', 'barbers', 'customers', 'services', 'appointments')
GROUP BY tablename
ORDER BY tablename;
*/
