-- ==============================================================================
-- SAAS SECURE RLS POLICIES (Supabase)
-- ==============================================================================
-- 1. Criação de funções auxiliares (Security Definer) para evitar recursão infinita 
-- ao verificar o papel e o shop_id do usuário logado na tabela profiles.
-- ==============================================================================

CREATE OR REPLACE FUNCTION auth_user_role() 
RETURNS text 
LANGUAGE sql 
SECURITY DEFINER 
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION auth_user_shop_id() 
RETURNS uuid 
LANGUAGE sql 
SECURITY DEFINER 
SET search_path = public
AS $$
  SELECT shop_id FROM public.profiles WHERE id = auth.uid();
$$;

-- ==============================================================================
-- 2. Habilitar RLS em todas as tabelas essenciais
-- ==============================================================================

ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 3. Limpar políticas antigas (prevenção de conflitos)
-- ==============================================================================

-- Removendo políticas antigas conhecidas (caso existam)
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Staff can manage customers" ON public.customers;
DROP POLICY IF EXISTS "Public can insert customers" ON public.customers;
DROP POLICY IF EXISTS "Public can update own customer by phone" ON public.customers;
DROP POLICY IF EXISTS "Staff can manage appointments" ON public.appointments;
DROP POLICY IF EXISTS "Public can view appointments for availability" ON public.appointments;
DROP POLICY IF EXISTS "Public can insert appointments" ON public.appointments;


-- ==============================================================================
-- 4. Criação das novas Políticas Estritas (Bloqueio total de Acesso Público)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- SHOPS
-- ------------------------------------------------------------------------------
CREATE POLICY "SaaS_shops_platform_admin" ON public.shops FOR ALL TO authenticated 
USING (auth_user_role() = 'platform_admin');

CREATE POLICY "SaaS_shops_owner" ON public.shops FOR ALL TO authenticated 
USING (auth_user_role() = 'owner' AND auth_user_shop_id() = id);

CREATE POLICY "SaaS_shops_barber_select" ON public.shops FOR SELECT TO authenticated 
USING (auth_user_role() = 'barber' AND auth_user_shop_id() = id);


-- ------------------------------------------------------------------------------
-- PROFILES
-- ------------------------------------------------------------------------------
CREATE POLICY "SaaS_profiles_self_select" ON public.profiles FOR SELECT TO authenticated 
USING (id = auth.uid());

CREATE POLICY "SaaS_profiles_self_update" ON public.profiles FOR UPDATE TO authenticated 
USING (id = auth.uid());

CREATE POLICY "SaaS_profiles_platform_admin" ON public.profiles FOR ALL TO authenticated 
USING (auth_user_role() = 'platform_admin');

CREATE POLICY "SaaS_profiles_owner" ON public.profiles FOR ALL TO authenticated 
USING (auth_user_role() = 'owner' AND auth_user_shop_id() = shop_id);

CREATE POLICY "SaaS_profiles_barber_select" ON public.profiles FOR SELECT TO authenticated 
USING (auth_user_role() = 'barber' AND auth_user_shop_id() = shop_id);



-- ------------------------------------------------------------------------------
-- CUSTOMERS
-- ------------------------------------------------------------------------------
CREATE POLICY "SaaS_customers_platform_admin" ON public.customers FOR ALL TO authenticated 
USING (auth_user_role() = 'platform_admin');

CREATE POLICY "SaaS_customers_staff" ON public.customers FOR ALL TO authenticated 
USING (auth_user_role() IN ('owner', 'barber') AND auth_user_shop_id() = shop_id);


-- ------------------------------------------------------------------------------
-- SERVICES
-- ------------------------------------------------------------------------------
CREATE POLICY "SaaS_services_platform_admin" ON public.services FOR ALL TO authenticated 
USING (auth_user_role() = 'platform_admin');

CREATE POLICY "SaaS_services_owner" ON public.services FOR ALL TO authenticated 
USING (auth_user_role() = 'owner' AND auth_user_shop_id() = shop_id);

CREATE POLICY "SaaS_services_barber_select" ON public.services FOR SELECT TO authenticated 
USING (auth_user_role() = 'barber' AND auth_user_shop_id() = shop_id);


-- ------------------------------------------------------------------------------
-- BARBERS
-- ------------------------------------------------------------------------------
CREATE POLICY "SaaS_barbers_platform_admin" ON public.barbers FOR ALL TO authenticated 
USING (auth_user_role() = 'platform_admin');

CREATE POLICY "SaaS_barbers_owner" ON public.barbers FOR ALL TO authenticated 
USING (auth_user_role() = 'owner' AND auth_user_shop_id() = shop_id);

CREATE POLICY "SaaS_barbers_barber_select" ON public.barbers FOR SELECT TO authenticated 
USING (auth_user_role() = 'barber' AND auth_user_shop_id() = shop_id);


-- ------------------------------------------------------------------------------
-- APPOINTMENTS
-- ------------------------------------------------------------------------------
CREATE POLICY "SaaS_appointments_platform_admin" ON public.appointments FOR ALL TO authenticated 
USING (auth_user_role() = 'platform_admin');

CREATE POLICY "SaaS_appointments_owner" ON public.appointments FOR ALL TO authenticated 
USING (auth_user_role() = 'owner' AND auth_user_shop_id() = shop_id);

CREATE POLICY "SaaS_appointments_barber" ON public.appointments FOR ALL TO authenticated 
USING (auth_user_role() = 'barber' AND auth_user_shop_id() = shop_id);

-- ==============================================================================
-- FIM DO SCRIPT
-- ==============================================================================
