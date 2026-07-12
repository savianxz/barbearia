import { supabase } from '../supabase/client';
import type { UserRole, Profile } from '../../types/auth';
import type { User, Session } from '@supabase/supabase-js';

export interface SignUpParams {
  email: string;
  password: string;
  name: string;
  whatsapp: string;
  role?: UserRole;
  shopId?: string | null;
  wantsReminders?: boolean;
  wantsPromotions?: boolean;
}

export interface AuthResponse<T> {
  data: T | null;
  error: string | null;
}

export interface AdminAccessResult {
  authorized: boolean;
  profile: Profile | null;
  reason?: string;
}

const ADMIN_ROLES: UserRole[] = ['platform_admin', 'owner', 'barber'];

/**
 * Única função responsável por validar acesso administrativo.
 * Fonte exclusiva de autorização: tabela public.profiles.
 * Jamais lê user.user_metadata ou app_metadata para autorização.
 */
export async function validateAdminAccess(user: User): Promise<AdminAccessResult> {
  console.group('AUTHORIZATION');
  console.log('User ID:', user.id);

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, shop_id, role, is_active')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error('Supabase error fetching profile:', profileError.message);
    console.groupEnd();
    return { authorized: false, profile: null, reason: `Erro ao buscar perfil: ${profileError.message}` };
  }

  console.log('Profile:', profile);
  console.log('Role:', profile?.role);
  console.log('Shop:', profile?.shop_id);
  console.log('Active:', profile?.is_active);

  if (!profile) {
    console.log('RESULTADO: NEGADO — perfil não encontrado');
    console.groupEnd();
    return { authorized: false, profile: null, reason: 'Perfil não encontrado na base de dados.' };
  }

  if (!profile.is_active) {
    console.log('RESULTADO: NEGADO — conta inativa');
    console.groupEnd();
    return { authorized: false, profile: profile as Profile, reason: 'Conta inativa. Entre em contato com o suporte.' };
  }

  if (!ADMIN_ROLES.includes(profile.role as UserRole)) {
    console.log(`RESULTADO: NEGADO — role "${profile.role}" não possui acesso administrativo`);
    console.groupEnd();
    return {
      authorized: false,
      profile: profile as Profile,
      reason: `Esta conta não possui permissões administrativas. Role atual: "${profile.role}".`,
    };
  }

  console.log('RESULTADO: AUTORIZADO');
  console.groupEnd();
  return { authorized: true, profile: profile as Profile };
}

export const authService = {
  /**
   * Registra um novo usuário no Supabase Auth.
   * Os metadados passados aqui servem apenas para popular a trigger
   * de criação do profile — nunca são usados para autorização.
   */
  async signUp(params: SignUpParams): Promise<AuthResponse<{ user: User | null; session: Session | null }>> {
    const { email, password, name, whatsapp, role = 'customer', shopId = null, wantsReminders = true, wantsPromotions = false } = params;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, whatsapp, role, shop_id: shopId, wants_reminders: wantsReminders, wants_promotions: wantsPromotions },
      },
    });

    if (error) return { data: null, error: error.message };
    return { data: { user: data.user, session: data.session }, error: null };
  },

  /**
   * Autentica o usuário com email e senha.
   * A validação de permissões administrativas NÃO ocorre aqui —
   * ocorre exclusivamente via validateAdminAccess() no AuthContext.
   */
  async signIn(email: string, password: string): Promise<AuthResponse<{ user: User; session: Session }>> {
    // 1. Verificar status pré-login (lock e inativação)
    const { data: statusData, error: statusError } = await supabase.rpc('get_user_status_by_email', {
      user_email: email,
    });

    if (statusError) {
      console.error('[auth.ts signIn] Erro ao verificar status:', statusError.message);
    }

    if (!statusError && statusData && statusData.length > 0) {
      const status = statusData[0];

      if (!status.is_active) {
        return { data: null, error: 'Sua conta está inativa. Entre em contato com o suporte.' };
      }

      if (status.locked_until) {
        const lockTime = new Date(status.locked_until).getTime();
        const nowTime = Date.now();
        if (lockTime > nowTime) {
          const minutesLeft = Math.ceil((lockTime - nowTime) / 60000);
          return { data: null, error: `Conta temporariamente bloqueada. Tente novamente em ${minutesLeft} minutos.` };
        }
      }
    }

    // 2. Login com Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      await supabase.rpc('handle_failed_login', { user_email: email });
      return { data: null, error: 'Email ou senha incorretos.' };
    }

    if (!data.user || !data.session) {
      return { data: null, error: 'Sessão inválida após login.' };
    }

    // 3. Registrar login bem-sucedido
    await supabase.rpc('handle_successful_login', { user_id: data.user.id });

    return { data: { user: data.user, session: data.session }, error: null };
  },

  /**
   * Finaliza a sessão do usuário.
   */
  async signOut(): Promise<{ error: string | null }> {
    const { error } = await supabase.auth.signOut();
    return { error: error ? error.message : null };
  },

  /**
   * Busca o profile completo do usuário por ID.
   * Fonte exclusiva: tabela public.profiles.
   * Nunca referencia user_metadata ou app_metadata.
   */
  async getProfile(userId: string): Promise<AuthResponse<Profile>> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('[auth.ts getProfile] Erro ao buscar profile:', error.message);
      return { data: null, error: error.message };
    }

    if (!data) {
      console.warn('[auth.ts getProfile] Nenhum profile encontrado para userId:', userId);
      return { data: null, error: 'Perfil não encontrado.' };
    }

    return { data: data as Profile, error: null };
  },
};
