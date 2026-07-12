-- ═══════════════════════════════════════════════════════════════
-- CORE DO SISTEMA DE AGENDAMENTO — Barbeiros e Serviços
-- Execute este script no SQL Editor do Supabase
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Recriar tabela BARBERS com estrutura nova ─────────────
-- (DROP + CREATE garante campos corretos, inclusive color e phone)
DROP TABLE IF EXISTS public.barbers CASCADE;

CREATE TABLE public.barbers (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id     UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    profile_id  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name        TEXT NOT NULL,
    phone       TEXT,
    email       TEXT,
    avatar_url  TEXT,
    color       TEXT NOT NULL DEFAULT '#D4AF37',
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice para buscas por barbearia
CREATE INDEX barbers_shop_idx ON public.barbers (shop_id);

-- ─── 2. Recriar tabela SERVICES com estrutura nova ────────────
DROP TABLE IF EXISTS public.services CASCADE;

CREATE TABLE public.services (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id          UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    name             TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 30 CHECK (duration_minutes > 0),
    price            NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
    is_active        BOOLEAN NOT NULL DEFAULT true,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX services_shop_idx ON public.services (shop_id);

-- ─── 3. Row Level Security ────────────────────────────────────
ALTER TABLE public.barbers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa autenticada pode ler (para o widget de agendamento público)
CREATE POLICY "Public can read active barbers"  ON public.barbers  FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read active services" ON public.services FOR SELECT USING (is_active = true);

-- Apenas admin/owner/barber do mesmo shop podem gerenciar
CREATE POLICY "Staff can manage barbers" ON public.barbers
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.shop_id = barbers.shop_id
            AND profiles.role IN ('platform_admin', 'owner', 'barber')
        )
    );

CREATE POLICY "Staff can manage services" ON public.services
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.shop_id = services.shop_id
            AND profiles.role IN ('platform_admin', 'owner', 'barber')
        )
    );
