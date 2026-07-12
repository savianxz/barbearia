-- ─── 1. Atualizações na tabela SHOPS ──────────────────────────────────────────
ALTER TABLE public.shops 
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- ─── 2. Atualizações na tabela PROFILES ───────────────────────────────────────
-- Renomear name para full_name se necessário
DO $$
BEGIN
  IF EXISTS(SELECT *
    FROM information_schema.columns
    WHERE table_name='profiles' and column_name='name')
  THEN
      ALTER TABLE "public"."profiles" RENAME COLUMN "name" TO "full_name";
  END IF;
END $$;

-- Adicionar novas colunas para controle de autenticação e segurança
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS failed_attempts INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;


-- ─── 3. Atualizar Função handle_new_user ──────────────────────────────────────
-- Atualizando a trigger de criação de profile para o auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        shop_id, 
        full_name, 
        whatsapp, 
        email, 
        role, 
        wants_reminders, 
        wants_promotions,
        is_active,
        failed_attempts
    )
    VALUES (
        new.id,
        coalesce((new.raw_user_meta_data->>'shop_id')::uuid, null),
        coalesce(new.raw_user_meta_data->>'name', coalesce(new.raw_user_meta_data->>'full_name', 'Cliente')),
        coalesce(new.raw_user_meta_data->>'whatsapp', ''),
        new.email,
        coalesce(new.raw_user_meta_data->>'role', 'customer'),
        coalesce((new.raw_user_meta_data->>'wants_reminders')::boolean, true),
        coalesce((new.raw_user_meta_data->>'wants_promotions')::boolean, false),
        true,
        0
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─── 4. RPCs de Segurança (Security Definer) ──────────────────────────────────

-- A. Obter status do usuário antes do login
CREATE OR REPLACE FUNCTION public.get_user_status_by_email(user_email TEXT)
RETURNS TABLE (
    user_id UUID,
    is_active BOOLEAN,
    failed_attempts INT,
    locked_until TIMESTAMPTZ,
    role TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT id, profiles.is_active, profiles.failed_attempts, profiles.locked_until, profiles.role
    FROM public.profiles
    WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- B. Incrementar falhas de login e bloquear após 5 tentativas
CREATE OR REPLACE FUNCTION public.handle_failed_login(user_email TEXT)
RETURNS VOID AS $$
DECLARE
    v_profile_id UUID;
    v_attempts INT;
BEGIN
    SELECT id, failed_attempts INTO v_profile_id, v_attempts 
    FROM public.profiles 
    WHERE email = user_email;

    IF v_profile_id IS NOT NULL THEN
        v_attempts := v_attempts + 1;
        IF v_attempts >= 5 THEN
            UPDATE public.profiles 
            SET failed_attempts = v_attempts,
                locked_until = now() + interval '15 minutes'
            WHERE id = v_profile_id;
        ELSE
            UPDATE public.profiles 
            SET failed_attempts = v_attempts
            WHERE id = v_profile_id;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- C. Registrar login com sucesso e limpar histórico de falhas
CREATE OR REPLACE FUNCTION public.handle_successful_login(user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles
    SET failed_attempts = 0,
        locked_until = NULL,
        last_login = now()
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
