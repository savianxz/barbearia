import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase/client';
import { authService, validateAdminAccess } from '../services/auth';
import type { SignUpParams, AuthResponse, AdminAccessResult } from '../services/auth';
import type { AuthState } from '../types/auth';

interface AuthContextType extends AuthState {
  adminAccess: AdminAccessResult | null;
  signUp: (params: SignUpParams) => Promise<AuthResponse<{ user: User | null; session: Session | null }>>;
  signIn: (email: string, password: string) => Promise<AuthResponse<{ user: User; session: Session }>>;
  signOut: () => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    staff: null,
    loading: true,
    error: null,
  });
  const [adminAccess, setAdminAccess] = useState<AdminAccessResult | null>(null);

  /**
   * Carrega o profile e valida o acesso administrativo.
   * Fonte exclusiva: tabela public.profiles via validateAdminAccess().
   */
  const loadProfileAndAccess = async (user: User) => {
    const { data: profileData, error: profileError } = await authService.getProfile(user.id);

    if (profileError) {
      console.error('[AuthContext] Erro ao carregar profile:', profileError);
    }

    const access = await validateAdminAccess(user);
    setAdminAccess(access);

    setState(prev => ({
      ...prev,
      profile: profileData || null,
      staff: access.staff || null,
      loading: false,
      error: profileError,
    }));
  };

  const refreshProfile = async () => {
    if (!state.user) return;
    setState(prev => ({ ...prev, loading: true }));
    await loadProfileAndAccess(state.user);
  };

  useEffect(() => {
    console.log('[Audit] AuthProvider inicializado');
    let isMounted = true;

    async function initializeAuth() {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('[Audit] AuthProvider - Erro ao obter sessão:', sessionError.message);
        if (isMounted) setState(prev => ({ ...prev, loading: false, error: sessionError.message }));
        return;
      }

      if (session?.user && isMounted) {
        console.log('[Audit] AuthProvider - Sessão encontrada para user.id:', session.user.id);
        setState(prev => ({ ...prev, user: session.user, loading: true }));
        await loadProfileAndAccess(session.user);
      } else if (isMounted) {
        console.log('[Audit] AuthProvider - Nenhuma sessão ativa.');
        setState(prev => ({ ...prev, loading: false }));
      }
    }

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        console.log('[Audit] AuthProvider - onAuthStateChange evento:', event);

        if (session?.user) {
          console.log('[Audit] AuthProvider - onAuthStateChange user.id:', session.user.id);
          setState(prev => ({ ...prev, user: session.user, loading: true }));
          await loadProfileAndAccess(session.user);
        } else {
          setAdminAccess(null);
          setState({ user: null, profile: null, staff: null, loading: false, error: null });
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignUp = async (params: SignUpParams) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    const result = await authService.signUp(params);
    if (result.error) setState(prev => ({ ...prev, loading: false, error: result.error }));
    return result;
  };

  const handleSignIn = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    const result = await authService.signIn(email, password);
    if (result.error) setState(prev => ({ ...prev, loading: false, error: result.error }));
    // Profile e adminAccess serão carregados automaticamente via onAuthStateChange
    return result;
  };

  const handleSignOut = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    localStorage.removeItem('fstreet_mock_session');
    const result = await authService.signOut();
    setAdminAccess(null);
    setState({ user: null, profile: null, staff: null, loading: false, error: null });
    return result;
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        adminAccess,
        signUp: handleSignUp,
        signIn: handleSignIn,
        signOut: handleSignOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
