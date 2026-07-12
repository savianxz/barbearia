-- ─── 1. Atualizações na tabela SHOPS (Configurações JSONB) ────────────────────
ALTER TABLE public.shops 
ADD COLUMN IF NOT EXISTS business_hours JSONB DEFAULT '{
  "0": { "isOpen": false, "openTime": "09:00", "closeTime": "18:00" },
  "1": { "isOpen": true,  "openTime": "09:00", "closeTime": "19:00" },
  "2": { "isOpen": true,  "openTime": "09:00", "closeTime": "19:00" },
  "3": { "isOpen": true,  "openTime": "09:00", "closeTime": "19:00" },
  "4": { "isOpen": true,  "openTime": "09:00", "closeTime": "19:00" },
  "5": { "isOpen": true,  "openTime": "09:00", "closeTime": "19:00" },
  "6": { "isOpen": true,  "openTime": "09:00", "closeTime": "18:00" }
}'::jsonb,
ADD COLUMN IF NOT EXISTS booking_settings JSONB DEFAULT '{
  "precision": "30",
  "buffer": 0,
  "advance_notice": 1,
  "cancellation_policy": "flexible"
}'::jsonb,
ADD COLUMN IF NOT EXISTS setup_progress JSONB DEFAULT '{
  "informacoes": false,
  "horarios": false,
  "equipe": false,
  "servicos": false,
  "agenda": false
}'::jsonb;
