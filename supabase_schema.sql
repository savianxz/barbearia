-- ─── 1. EXTENSIONS & UTILITIES ────────────────────────────────────────────────
-- Habilita extensão para geração de UUID caso não esteja ativa
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Função global para atualização automática do updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ─── 2. TABELAS ─────────────────────────────────────────────────────────────

-- TABELA: shops (Tenants / Barbearias)
CREATE TABLE IF NOT EXISTS public.shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    tagline TEXT,
    about_text TEXT,
    phone TEXT,
    instagram_url TEXT,
    whatsapp_link TEXT,
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TABELA: profiles (Usuários estendidos do auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    shop_id UUID REFERENCES public.shops(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    email TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'barber', 'owner', 'platform_admin')),
    wants_reminders BOOLEAN NOT NULL DEFAULT true,
    wants_promotions BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TABELA: barbers (Barbeiros vinculados a uma barbearia)
CREATE TABLE IF NOT EXISTS public.barbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    experience TEXT,
    rating NUMERIC(3,2) NOT NULL DEFAULT 5.00 CHECK (rating >= 0 AND rating <= 5),
    reviews_count INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    bio TEXT,
    specialties TEXT[] DEFAULT '{}',
    is_founder BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TABELA: services (Serviços das barbearias)
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('cabelo', 'barba', 'tratamentos')),
    description TEXT,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    duration INTEGER NOT NULL CHECK (duration > 0), -- em minutos
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TABELA: appointments (Agenda / Reservas de horários)
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    barber_id UUID REFERENCES public.barbers(id) ON DELETE SET NULL,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    confirmation_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ─── 3. ÍNDICES (Otimização de Consultas & Multi-tenancy) ─────────────────────
CREATE INDEX IF NOT EXISTS appointments_shop_date_idx ON public.appointments (shop_id, date);
CREATE INDEX IF NOT EXISTS barbers_shop_idx ON public.barbers (shop_id);
CREATE INDEX IF NOT EXISTS services_shop_idx ON public.services (shop_id);
CREATE INDEX IF NOT EXISTS profiles_shop_whatsapp_idx ON public.profiles (shop_id, whatsapp);


-- ─── 4. TRIGGERS: updated_at ──────────────────────────────────────────────────
CREATE TRIGGER set_updated_at_shops
    BEFORE UPDATE ON public.shops
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER set_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER set_updated_at_barbers
    BEFORE UPDATE ON public.barbers
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER set_updated_at_services
    BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER set_updated_at_appointments
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- ─── 5. AUTOMAÇÃO: Criação Automática de Profiles do Auth.users ─────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, shop_id, name, whatsapp, email, role, wants_reminders, wants_promotions)
    VALUES (
        new.id,
        coalesce((new.raw_user_meta_data->>'shop_id')::uuid, null),
        coalesce(new.raw_user_meta_data->>'name', 'Cliente'),
        coalesce(new.raw_user_meta_data->>'whatsapp', ''),
        new.email,
        coalesce(new.raw_user_meta_data->>'role', 'customer'),
        coalesce((new.raw_user_meta_data->>'wants_reminders')::boolean, true),
        coalesce((new.raw_user_meta_data->>'wants_promotions')::boolean, false)
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
