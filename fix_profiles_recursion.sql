-- ==============================================================================
-- CORREÇÃO DE RECURSÃO NA TABELA PROFILES
-- ==============================================================================
-- O problema ocorria porque, ao dar um SELECT em profiles, o PostgreSQL 
-- avaliava TODAS as políticas da tabela. As políticas de admin/owner/barber 
-- chamavam a função auth_user_role(), que por sua vez fazia um SELECT em profiles, 
-- gerando um ciclo (loop de recursão) se a função não estivesse isolada corretamente.
-- ==============================================================================

-- 1. Removemos as políticas problemáticas que faziam subconsulta na própria tabela profiles
DROP POLICY IF EXISTS "SaaS_profiles_platform_admin" ON public.profiles;
DROP POLICY IF EXISTS "SaaS_profiles_owner" ON public.profiles;
DROP POLICY IF EXISTS "SaaS_profiles_barber_select" ON public.profiles;

-- 2. Mantemos apenas as políticas diretas (sem subconsultas). 
-- O usuário poderá ler e atualizar seu próprio perfil de forma atômica.
-- (Essas políticas já existem, estou apenas recriando para garantir a integridade caso tenham sido apagadas)

DROP POLICY IF EXISTS "SaaS_profiles_self_select" ON public.profiles;
CREATE POLICY "SaaS_profiles_self_select" ON public.profiles 
FOR SELECT TO authenticated 
USING (id = auth.uid());

DROP POLICY IF EXISTS "SaaS_profiles_self_update" ON public.profiles;
CREATE POLICY "SaaS_profiles_self_update" ON public.profiles 
FOR UPDATE TO authenticated 
USING (id = auth.uid());

-- OBSERVAÇÃO: Como o frontend da aplicação (React) não faz consultas à tabela "profiles"
-- pedindo dados de outros usuários (ele consulta as tabelas "barbers" e "customers"),
-- não há necessidade de políticas complexas permitindo que o owner leia todos os profiles.
-- Apenas o "self_select" é suficiente para o login (validateAdminAccess) funcionar perfeitamente.
