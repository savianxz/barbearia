-- ═══════════════════════════════════════════════════════════════
-- ATUALIZAÇÃO: Permitir status 'confirmed' na tabela appointments
-- Execute no SQL Editor do Supabase
-- ═══════════════════════════════════════════════════════════════

-- 1. Remove a constraint atual
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_status_check;

-- 2. Adiciona a constraint atualizada
ALTER TABLE public.appointments 
ADD CONSTRAINT appointments_status_check 
CHECK (status IN ('scheduled', 'confirmed', 'completed', 'canceled'));
