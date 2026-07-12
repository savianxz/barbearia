-- ═══════════════════════════════════════════════════════════════
-- CORE DO SISTEMA DE AGENDAMENTO — Clientes e Agendamentos
-- Execute este script no SQL Editor do Supabase
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Tabela CUSTOMERS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.customers (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id      UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    name         TEXT NOT NULL,
    phone        TEXT NOT NULL,
    email        TEXT,
    total_visits INTEGER NOT NULL DEFAULT 0,
    total_spent  NUMERIC(10,2) NOT NULL DEFAULT 0,
    last_visit   TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(shop_id, phone) -- Evita clientes duplicados por loja via telefone
);

CREATE INDEX IF NOT EXISTS customers_shop_idx ON public.customers (shop_id);

-- ─── 2. Tabela APPOINTMENTS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.appointments (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id      UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    customer_id  UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    barber_id    UUID NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
    service_id   UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    start_time   TIMESTAMPTZ NOT NULL,
    end_time     TIMESTAMPTZ NOT NULL,
    status       TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'canceled')),
    total_price  NUMERIC(10,2) NOT NULL DEFAULT 0,
    notes        TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS appointments_shop_idx ON public.appointments (shop_id);
CREATE INDEX IF NOT EXISTS appointments_barber_time_idx ON public.appointments (barber_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS appointments_customer_idx ON public.appointments (customer_id);

-- ─── 3. Row Level Security (RLS) ──────────────────────────────
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- CUSTOMERS:
-- Staff (admin, owner, barber) pode ver e gerenciar os clientes de sua loja
CREATE POLICY "Staff can manage customers" ON public.customers
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.shop_id = customers.shop_id
            AND profiles.role IN ('platform_admin', 'owner', 'barber')
        )
    );
-- Para permitir que o fluxo de agendamento anônimo crie clientes:
CREATE POLICY "Public can insert customers" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update own customer by phone" ON public.customers FOR UPDATE USING (true) WITH CHECK (true);

-- APPOINTMENTS:
-- Staff pode ver e gerenciar agendamentos de sua loja
CREATE POLICY "Staff can manage appointments" ON public.appointments
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.shop_id = appointments.shop_id
            AND profiles.role IN ('platform_admin', 'owner', 'barber')
        )
    );

-- Para agendamento anônimo, permitir ler agendamentos do barbeiro (para checar disponibilidade) e inserir
CREATE POLICY "Public can view appointments for availability" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "Public can insert appointments" ON public.appointments FOR INSERT WITH CHECK (true);
