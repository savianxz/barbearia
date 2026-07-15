-- ==============================================================================
-- MIGRAÇÃO DE ARQUITETURA: Profiles -> Staff
-- ==============================================================================

BEGIN; -- Inicia a transação para garantir rollback automático em caso de falha

-- 1. Criar a nova tabela staff
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'barber', 'platform_admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(profile_id, shop_id)
);

-- Habilitar RLS
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- 2. Migrar os dados existentes (Donos, Barbeiros, Admins) da profiles para a staff
-- A migração NÃO apagará dados de clientes (eles apenas ficam sem staff, o que é o correto)
INSERT INTO public.staff (profile_id, shop_id, role)
SELECT id, shop_id, role 
FROM public.profiles 
WHERE role IN ('owner', 'barber', 'platform_admin');

-- 3. Atualizar a trigger de criação de usuário para respeitar a nova arquitetura
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_role TEXT;
    new_shop_id UUID;
BEGIN
    new_role := coalesce(new.raw_user_meta_data->>'role', 'customer');
    
    -- Verifica se shop_id é nulo ou vazio no json, para evitar erro de cast UUID
    IF new.raw_user_meta_data->>'shop_id' IS NOT NULL AND new.raw_user_meta_data->>'shop_id' != '' THEN
        new_shop_id := (new.raw_user_meta_data->>'shop_id')::uuid;
    ELSE
        new_shop_id := null;
    END IF;

    -- Insere apenas os dados globais de perfil em public.profiles
    -- A tabela profiles continua sendo a principal âncora de identidade
    INSERT INTO public.profiles (id, name, whatsapp, email, wants_reminders, wants_promotions)
    VALUES (
        new.id,
        coalesce(new.raw_user_meta_data->>'name', 'Cliente'),
        coalesce(new.raw_user_meta_data->>'whatsapp', ''),
        new.email,
        coalesce((new.raw_user_meta_data->>'wants_reminders')::boolean, true),
        coalesce((new.raw_user_meta_data->>'wants_promotions')::boolean, false)
    );

    -- Se for um funcionário/admin, insere também na tabela staff
    IF new_role IN ('owner', 'barber', 'platform_admin') THEN
        INSERT INTO public.staff (profile_id, shop_id, role)
        VALUES (new.id, new_shop_id, new_role);
    END IF;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Atualizar as funções de RLS para checarem a tabela staff e não a profiles
CREATE OR REPLACE FUNCTION auth_user_role() 
RETURNS text 
LANGUAGE sql 
SECURITY DEFINER 
SET search_path = public
AS $$
  SELECT role FROM public.staff WHERE profile_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION auth_user_shop_id() 
RETURNS uuid 
LANGUAGE sql 
SECURITY DEFINER 
SET search_path = public
AS $$
  SELECT shop_id FROM public.staff WHERE profile_id = auth.uid() LIMIT 1;
$$;

-- 5. Criar políticas RLS para a tabela staff
CREATE POLICY "SaaS_staff_self_select" ON public.staff FOR SELECT TO authenticated USING (profile_id = auth.uid());
CREATE POLICY "SaaS_staff_platform_admin" ON public.staff FOR ALL TO authenticated USING (auth_user_role() = 'platform_admin');
CREATE POLICY "SaaS_staff_owner" ON public.staff FOR ALL TO authenticated USING (auth_user_role() = 'owner' AND auth_user_shop_id() = shop_id);

-- 6. Índices para performance nas foreign keys
CREATE INDEX IF NOT EXISTS idx_staff_profile_id ON public.staff(profile_id);
CREATE INDEX IF NOT EXISTS idx_staff_shop_id ON public.staff(shop_id);

-- 7. Remover as colunas antigas da tabela profiles (Ação destrutiva controlada)
-- Isso evita inconsistência de dados (ter role na profile e role na staff e elas divergirem)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS shop_id;

COMMIT; -- Confirma a transação apenas se tudo der certo
-- FIM DA MIGRAÇÃO
