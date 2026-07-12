import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminHeader } from './components/AdminHeader';
import { DashboardPage } from './pages/DashboardPage';
import { AgendaPage } from './pages/AgendaPage';
import { ClientesPage } from './pages/ClientesPage';
import { BarbeirosPage } from './pages/BarbeirosPage';
import { ServicosPage } from './pages/ServicosPage';
import { CrmPage } from './pages/CrmPage';
import { FinanceiroPage } from './pages/FinanceiroPage';
import { ClubePage } from './pages/ClubePage';
import { MarketingPage } from './pages/MarketingPage';
import { ConfiguracoesPage } from './pages/ConfiguracoesPage';
import { useAuth } from '../contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';

export type AdminPage =
  | 'dashboard'
  | 'agenda'
  | 'clientes'
  | 'barbeiros'
  | 'servicos'
  | 'crm'
  | 'financeiro'
  | 'clube'
  | 'marketing'
  | 'configuracoes';

const pageComponents: Record<AdminPage, React.ReactNode> = {
  dashboard:     <DashboardPage />,
  agenda:        <AgendaPage />,
  clientes:      <ClientesPage />,
  barbeiros:     <BarbeirosPage />,
  servicos:      <ServicosPage />,
  crm:           <CrmPage />,
  financeiro:    <FinanceiroPage />,
  clube:         <ClubePage />,
  marketing:     <MarketingPage />,
  configuracoes: <ConfiguracoesPage />,
};

interface AdminAppProps {
  initialPath?: string;
}

export const AdminApp: React.FC<AdminAppProps> = ({ initialPath = '/admin' }) => {
  const { user, adminAccess, loading } = useAuth();
  
  // Determine initial page from path
  const getInitialPage = (): AdminPage => {
    if (initialPath.startsWith('/settings')) return 'configuracoes';
    if (initialPath.startsWith('/dashboard')) return 'dashboard';
    
    // Check if it's /admin/something
    const parts = initialPath.split('/');
    if (parts.length > 2 && parts[1] === 'admin') {
      const sub = parts[2] as AdminPage;
      if (pageComponents[sub]) return sub;
    }
    return 'dashboard';
  };

  const [activePage, setActivePage] = useState<AdminPage>(getInitialPage());
  const [mobileOpen, setMobileOpen] = useState(false);

  // Sync URL when active page changes
  React.useEffect(() => {
    let targetUrl = `/admin/${activePage}`;
    if (activePage === 'dashboard') targetUrl = '/dashboard';
    if (activePage === 'configuracoes') targetUrl = '/settings';
    
    if (window.location.pathname !== targetUrl) {
      window.history.pushState({}, '', targetUrl);
    }
  }, [activePage]);

  // 1. Loading state view
  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center gap-4 select-none">
        <div className="w-9 h-9 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37]/80 animate-pulse">
          Autenticando...
        </span>
      </div>
    );
  }

  // Acesso controlado exclusivamente pelo resultado de validateAdminAccess()
  // Nenhuma lógica de permissão vive neste componente.
  if (!user || !adminAccess?.authorized) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white flex font-sans antialiased">
      {/* Sidebar */}
      <AdminSidebar
        activePage={activePage}
        onNavigate={setActivePage}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <AdminHeader
          activePage={activePage}
          onMenuOpen={() => setMobileOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              {pageComponents[activePage]}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
