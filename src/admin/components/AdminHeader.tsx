import React from 'react';
import { Menu, Bell } from 'lucide-react';
import type { AdminPage } from '../AdminApp';

const pageTitles: Record<AdminPage, { title: string; description: string }> = {
  dashboard:     { title: 'Dashboard',      description: 'Visão geral do dia' },
  agenda:        { title: 'Agenda',         description: 'Agendamentos e timeline' },
  clientes:      { title: 'Clientes',       description: 'Base de clientes e histórico' },
  barbeiros:     { title: 'Barbeiros',      description: 'Equipe e desempenho' },
  servicos:      { title: 'Serviços',       description: 'Catálogo e preços' },
  crm:           { title: 'Smart CRM',      description: 'Inteligência e recuperação de clientes' },
  financeiro:    { title: 'Financeiro',     description: 'Receita e análises' },
  clube:         { title: 'Clube F Street', description: 'Membros e fidelização' },
  marketing:     { title: 'Marketing',      description: 'Campanhas e automações' },
  configuracoes: { title: 'Configurações',  description: 'Barbearia, agenda e equipe' },
};

interface AdminHeaderProps {
  activePage: AdminPage;
  onMenuOpen: () => void;
  action?: React.ReactNode;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ activePage, onMenuOpen, action }) => {
  const { title, description } = pageTitles[activePage];

  return (
    <header className="sticky top-0 z-30 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/6 px-6 py-4 flex items-center justify-between gap-4">
      {/* Mobile menu trigger */}
      <button
        onClick={onMenuOpen}
        className="lg:hidden w-9 h-9 rounded-lg bg-white/6 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-[15px] font-bold text-white leading-none">{title}</h1>
        <p className="text-[11px] text-white/30 mt-0.5 leading-none hidden sm:block">{description}</p>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {action}
        <button className="w-9 h-9 rounded-lg bg-white/6 flex items-center justify-center text-white/40 hover:text-white transition-colors cursor-pointer relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#D4AF37] rounded-full" />
        </button>
      </div>
    </header>
  );
};
