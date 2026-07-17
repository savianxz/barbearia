import { supabase } from '../supabase/client';
import type { UserRole, Profile, StaffRecord } from '../../types/auth';
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
  staff: StaffRecord | null;
  reason?: string;
}

const ADMIN_ROLES: UserRole[] = ['platform_admin', 'owner', 'barber'];

/**
 * Única função responsável por validar acesso administrativo.
 * Fonte exclusiva de autorização: tabela public.staff (e profiles para identidade).
 * Jamais lê user.user_metadata ou app_metadata para autorização.
 */
export async function validateAdminAccess(user: User): Promise<AdminAccessResult> {
  console.group('AUTHORIZATION');
  console.log('User ID:', user.id);

  // 1. Busca o perfil básico (DEBUG MODE: sem maybeSingle)
  const { data: profileDataRaw, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id);

  console.log("USER ID:", user.id);
  console.log("PROFILE DATA:", profileDataRaw);
  console.log("PROFILE ERROR:", profileError);

  const profile = profileDataRaw?.[0];

  if (profileError) {
    console.error('Supabase error fetching profile:', profileError.message);
    console.groupEnd();
    return { authorized: false, profile: null, staff: null, reason: `Erro ao buscar perfil: ${profileError.message}` };
  }

  if (!profile) {
    console.log('RESULTADO: NEGADO — perfil não encontrado');
    console.groupEnd();
    return { authorized: false, profile: null, staff: null, reason: 'Perfil não encontrado na base de dados.' };
  }

  if (!profile.is_active) {
    console.log('RESULTADO: NEGADO — conta inativa');
    console.groupEnd();
    return { authorized: false, profile: profile as Profile, staff: null, reason: 'Conta inativa. Entre em contato com o suporte.' };
  }

  // 2. Busca o registro administrativo (staff)
  const { data: staff, error: staffError } = await supabase
    .from('staff')
    .select('*')
    .eq('profile_id', user.id)
    .maybeSingle();

  if (staffError) {
    console.error('Supabase error fetching staff record:', staffError.message);
    console.groupEnd();
    return { authorized: false, profile: profile as Profile, staff: null, reason: `Erro ao buscar permissões: ${staffError.message}` };
  }

  console.log('Staff Record:', staff);

  if (!staff) {
    console.log('RESULTADO: NEGADO — usuário não possui registro de staff (não é funcionário/admin)');
    console.groupEnd();
    return {
      authorized: false,
      profile: profile as Profile,
      staff: null,
      reason: 'Esta conta não possui registro de funcionário vinculado a nenhuma loja.',
    };
  }

  if (!ADMIN_ROLES.includes(staff.role as UserRole)) {
    console.log(`RESULTADO: NEGADO — role "${staff.role}" não possui acesso administrativo`);
    console.groupEnd();
    return {
      authorized: false,
      profile: profile as Profile,
      staff: staff as StaffRecord,
      reason: `Esta conta não possui permissões administrativas. Role atual: "${staff.role}".`,
    };
  }

  console.log('RESULTADO: AUTORIZADO');
  console.groupEnd();
  return { authorized: true, profile: profile as Profile, staff: staff as StaffRecord };
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
    // RPCs de auditoria (get_user_status_by_email, handle_failed_login, handle_successful_login)
    // foram removidas temporariamente — as funções não existem no banco ainda.
    // O login depende exclusivamente do Supabase Auth + validateAdminAccess() no AuthContext.

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { data: null, error: 'Email ou senha incorretos.' };
    }

    if (!data.user || !data.session) {
      return { data: null, error: 'Sessão inválida após login.' };
    }

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
