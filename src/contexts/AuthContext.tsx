import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase/client';
import { authService } from '../services/auth';
import type { SignUpParams, AuthResponse } from '../services/auth';
import type { AuthState } from '../types/auth';

interface AuthContextType extends AuthState {
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
    loading: true,
    error: null,
  });

  const refreshProfile = async (currentUser: User | null = state.user) => {
    if (!currentUser) {
      setState(prev => ({ ...prev, profile: null, loading: false }));
      return;
    }

    setState(prev => ({ ...prev, loading: true }));
    const { data: profileData, error } = await authService.getProfile(currentUser.id);
    
    setState(prev => ({
      ...prev,
      profile: profileData,
      error: error,
      loading: false,
    }));
  };

  useEffect(() => {
    let isMounted = true;

    // 1. Check current session on mount
    async function initializeAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && isMounted) {
          const { data: profileData, error } = await authService.getProfile(session.user.id);
          setState({
            user: session.user,
            profile: profileData,
            loading: false,
            error: error,
          });
        } else if (isMounted) {
          setState(prev => ({ ...prev, loading: false }));
        }
      } catch (err: any) {
        console.error('[AuthContext] Erro ao inicializar sessão:', err);
        if (isMounted) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: err.message || 'Erro ao carregar sessão inicial.',
          }));
        }
      }
    }

    initializeAuth();

    // 2. Real-time auth subscription listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return;

        if (session?.user) {
          const { data: profileData, error } = await authService.getProfile(session.user.id);
          setState({
            user: session.user,
            profile: profileData,
            loading: false,
            error: error,
          });
        } else {
          setState({
            user: null,
            profile: null,
            loading: false,
            error: null,
          });
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
    if (result.error) {
      setState(prev => ({ ...prev, loading: false, error: result.error }));
    }
    return result;
  };

  const handleSignIn = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    const result = await authService.signIn(email, password);
    if (result.error) {
      setState(prev => ({ ...prev, loading: false, error: result.error }));
    }
    return result;
  };

  const handleSignOut = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    const result = await authService.signOut();
    if (!result.error) {
      setState({
        user: null,
        profile: null,
        loading: false,
        error: null,
      });
    } else {
      setState(prev => ({ ...prev, loading: false, error: result.error }));
    }
    return result;
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signUp: handleSignUp,
        signIn: handleSignIn,
        signOut: handleSignOut,
        refreshProfile: () => refreshProfile(state.user),
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
