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

export const authService = {
  /**
   * Registra um novo usuário no Supabase Auth e insere metadados que
   * serão processados pela trigger do banco de dados para criar o Profile.
   */
  async signUp(params: SignUpParams): Promise<AuthResponse<{ user: User | null; session: Session | null }>> {
    try {
      const { email, password, name, whatsapp, role = 'customer', shopId = null, wantsReminders = true, wantsPromotions = false } = params;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            whatsapp,
            role,
            shop_id: shopId,
            wants_reminders: wantsReminders,
            wants_promotions: wantsPromotions,
          },
        },
      });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: { user: data.user, session: data.session }, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Erro inesperado ao realizar cadastro.' };
    }
  },

  /**
   * Autentica o usuário com email e senha.
   */
  async signIn(email: string, password: string): Promise<AuthResponse<{ user: User; session: Session }>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { data: null, error: error.message };
      }

      if (!data.user || !data.session) {
        return { data: null, error: 'Sessão inválida após login.' };
      }

      return { data: { user: data.user, session: data.session }, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Erro inesperado ao fazer login.' };
    }
  },

  /**
   * Finaliza a sessão atual do usuário.
   */
  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error ? error.message : null };
    } catch (err: any) {
      return { error: err.message || 'Erro inesperado ao deslogar.' };
    }
  },

  /**
   * Obtém o profile complementar do usuário através de seu ID.
   */
  async getProfile(userId: string): Promise<AuthResponse<Profile>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data as Profile, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Erro inesperado ao buscar perfil.' };
    }
  },

  /**
   * Recupera a sessão atual ativa e o perfil do usuário correspondente.
   */
  async getCurrentSession(): Promise<AuthResponse<{ user: User | null; profile: Profile | null }>> {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        return { data: null, error: sessionError.message };
      }

      if (!session || !session.user) {
        return { data: { user: null, profile: null }, error: null };
      }

      const { data: profile, error: profileError } = await this.getProfile(session.user.id);

      if (profileError) {
        return { data: { user: session.user, profile: null }, error: profileError };
      }

      return { data: { user: session.user, profile }, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Erro inesperado ao recuperar sessão atual.' };
    }
  }
};
