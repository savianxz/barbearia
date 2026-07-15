import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  /** Rota de fallback caso o usuário não esteja logado ou não tenha permissão */
  fallbackRedirect?: string;
}

/**
 * Componente guardião de rotas e componentes protegidos.
 * Valida o estado de autenticação e a Role do usuário com base no AuthContext.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  fallbackRedirect = '/login'
}) => {
  const { user, staff, loading } = useAuth();

  // Se ainda estiver carregando a sessão, podemos exibir um loading screen minimalista e premium
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-bg-dark z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-gold animate-pulse">
            Carregando...
          </span>
        </div>
      </div>
    );
  }

  // Se não houver usuário logado
  if (!user) {
    // Para simplificar a arquitetura limpa sem bibliotecas adicionais de rotas externas (como react-router),
    // apenas redirecionamos via window.location ou podemos optar por retornar nulo caso o pai gerencie.
    // Usaremos redirecionamento simples ou retorno nulo.
    if (typeof window !== 'undefined') {
      window.location.href = fallbackRedirect;
    }
    return null;
  }

  const effectiveRole = staff?.role || 'customer';

  // Se houver restrição de Role e a Role atual do usuário não for permitida
  if (allowedRoles && !allowedRoles.includes(effectiveRole)) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6 text-center">
        <div className="max-w-md border border-border-premium bg-card-dark p-8 flex flex-col items-center gap-6">
          <div className="w-12 h-12 rounded-full bg-red-950/20 border border-red-500/30 flex items-center justify-center text-red-500 text-xl font-bold">
            !
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-white uppercase tracking-wider mb-2">
              Acesso Restrito
            </h1>
            <p className="text-text-secondary text-xs font-light leading-relaxed">
              Você não possui permissão para visualizar esta página com sua conta atual.
            </p>
          </div>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.href = '/';
              }
            }}
            className="px-6 py-3 border border-border-premium hover:border-gold hover:text-gold transition-colors font-semibold text-xs tracking-widest uppercase"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
