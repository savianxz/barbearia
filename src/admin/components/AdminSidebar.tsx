import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Calendar, Users, Scissors, Star,
  Brain, DollarSign, Crown, Megaphone, Settings,
  X, ChevronRight, LogOut
} from 'lucide-react';
import type { AdminPage } from '../AdminApp';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase/client';

interface NavItem {
  id: AdminPage;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard',    label: 'Dashboard',    icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'agenda',       label: 'Agenda',       icon: <Calendar className="w-4 h-4" /> },
  { id: 'clientes',     label: 'Clientes',     icon: <Users className="w-4 h-4" /> },
  { id: 'barbeiros',    label: 'Barbeiros',    icon: <Scissors className="w-4 h-4" /> },
  { id: 'servicos',     label: 'Serviços',     icon: <Star className="w-4 h-4" /> },
  { id: 'crm',          label: 'CRM',          icon: <Brain className="w-4 h-4" />, badge: 'Smart' },
  { id: 'financeiro',   label: 'Financeiro',   icon: <DollarSign className="w-4 h-4" /> },
  { id: 'clube',        label: 'Clube',        icon: <Crown className="w-4 h-4" /> },
  { id: 'marketing',    label: 'Marketing',    icon: <Megaphone className="w-4 h-4" /> },
  { id: 'configuracoes',label: 'Configurações',icon: <Settings className="w-4 h-4" /> },
];

interface AdminSidebarProps {
  activePage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const SidebarContent: React.FC<AdminSidebarProps> = ({ activePage, onNavigate, onMobileClose }) => {
  const { profile, staff, signOut } = useAuth();
  const [shopData, setShopData] = React.useState<{ slug: string, name: string, logo_url: string | null } | null>(null);

  React.useEffect(() => {
    if (staff?.shop_id) {
      supabase.from('shops').select('slug, name, logo_url').eq('id', staff.shop_id).single()
        .then(({ data }) => {
          if (data) setShopData(data);
        });
    }
  }, [staff?.shop_id]);

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  const getRoleLabel = (role?: string) => {
    if (role === 'platform_admin') return 'Admin';
    if (role === 'owner') return 'Dono';
    if (role === 'barber') return 'Barbeiro';
    return 'Staff';
  };

  const nameInitials = profile?.full_name ? profile.full_name.slice(0, 1).toUpperCase() : 'A';

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A] border-r border-white/6">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4 border-b border-white/6">
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-md flex items-center justify-center overflow-hidden ${shopData?.logo_url ? 'bg-[#111] border border-white/10' : 'bg-[#D4AF37]'}`}>
            {shopData?.logo_url ? (
              <img src={shopData.logo_url} alt={shopData.name} className="w-full h-full object-contain p-0.5" />
            ) : (
              <span className="text-[10px] font-black text-black">
                {shopData?.name ? shopData.name.substring(0, 2).toUpperCase() : 'FS'}
              </span>
            )}
          </div>
          <div>
            <p className="text-[13px] font-bold text-white tracking-wide leading-none">{shopData?.name || 'F Street'}</p>
            <p className="text-[10px] text-white/30 mt-0.5">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-none">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); onMobileClose(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 group cursor-pointer ${
                  isActive
                    ? 'bg-[#D4AF37]/10 text-[#D4AF37]'
                    : 'text-white/40 hover:text-white/80 hover:bg-white/4'
                }`}
              >
                <span className={`flex-shrink-0 transition-colors ${isActive ? 'text-[#D4AF37]' : 'text-white/30 group-hover:text-white/60'}`}>
                  {item.icon}
                </span>
                <span className="text-[13px] font-medium flex-1">{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] font-bold tracking-wider bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/20 px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3 h-3 text-[#D4AF37]/60" />}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/6 flex flex-col gap-2">
        <button
          onClick={() => { window.location.href = shopData?.slug ? `/${shopData.slug}` : '/'; }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/35 hover:text-white/70 hover:bg-white/4 transition-all duration-150 cursor-pointer text-[12px] font-medium"
        >
          <ChevronRight className="w-3.5 h-3.5 rotate-180 text-white/30" />
          <span>Voltar ao Site</span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/5 transition-all duration-150 cursor-pointer text-[12px] font-medium"
        >
          <LogOut className="w-3.5 h-3.5 text-red-400/50" />
          <span>Sair da Conta</span>
        </button>

        <div className="flex items-center gap-2.5 px-3 mt-2 border-t border-white/4 pt-3">
          <div className="w-7 h-7 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[11px] font-bold text-[#D4AF37] flex-shrink-0">
            {nameInitials}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-white/70 truncate">{profile?.full_name || 'Carregando...'}</p>
            <p className="text-[9px] uppercase tracking-wider text-white/30 font-semibold">{getRoleLabel(staff?.role)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AdminSidebar: React.FC<AdminSidebarProps> = (props) => {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 h-screen sticky top-0">
        <SidebarContent {...props} onMobileClose={() => {}} />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {props.mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={props.onMobileClose}
              className="fixed inset-0 z-40 bg-black/70 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-64 lg:hidden"
            >
              <div className="relative h-full">
                <SidebarContent {...props} />
                <button
                  onClick={props.onMobileClose}
                  className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center text-white/60 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
