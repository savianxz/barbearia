import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, Users, DollarSign, TrendingDown,
  Clock, MessageCircle, AlertTriangle, Plus, RefreshCw
} from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { StatusBadge } from '../components/ui/Badge';
import { supabase } from '../../services/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import type { AppointmentStatus } from '../../types/scheduling';

// ── Tipos locais ───────────────────────────────────────────────────────────────

interface TodayAppointment {
  id: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  customer_name: string;
  customer_phone: string;
  barber_name: string | null;
  service_name: string;
  service_price: number;
}

interface DashboardStats {
  totalCustomers: number;
  inactiveCustomers: number;  // sem visita há 30+ dias
  atRiskCustomers: number;    // sem visita há 60+ dias
  todayRevenue: number;
  todayAppointments: TodayAppointment[];
  confirmedCount: number;
  pendingCount: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  `R$ ${n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

const todayIso = () => new Date().toISOString().split('T')[0];

function formatTime(iso: string): string {
  // "2026-07-12T14:30:00+00:00" → "14:30"
  return iso.slice(11, 16);
}

// ── Componente ─────────────────────────────────────────────────────────────────

export const DashboardPage: React.FC = () => {
  const { staff } = useAuth();
  const shopId = staff?.shop_id ?? '';

  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    inactiveCustomers: 0,
    atRiskCustomers: 0,
    todayRevenue: 0,
    todayAppointments: [],
    confirmedCount: 0,
    pendingCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!shopId) return;
    setLoading(true);
    setError(null);

    const today = todayIso();
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // 1. Total de clientes
    const { count: totalCustomers, error: custErr } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('shop_id', shopId);

    if (custErr) { setError(custErr.message); setLoading(false); return; }

    // 2. Clientes inativos (sem visita há 30+ dias — last_visit < 30 dias atrás)
    const { count: inactiveCustomers, error: inactErr } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('shop_id', shopId)
      .lt('last_visit', thirtyDaysAgo.toISOString().split('T')[0]);

    // 3. Clientes em risco (sem visita há 60+ dias)
    const { count: atRiskCustomers, error: riskErr } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('shop_id', shopId)
      .lt('last_visit', sixtyDaysAgo.toISOString().split('T')[0]);

    // 4. Agendamentos de hoje
    const { data: apptData, error: apptErr } = await supabase
      .from('appointments')
      .select(`
        id,
        start_time,
        end_time,
        status,
        customers ( name, phone ),
        barbers ( name ),
        services ( name, price )
      `)
      .eq('shop_id', shopId)
      .gte('start_time', `${today}T00:00:00`)
      .lte('start_time', `${today}T23:59:59`)
      .order('start_time', { ascending: true });

    if (apptErr) { setError(apptErr.message); setLoading(false); return; }

    const appointments: TodayAppointment[] = (apptData ?? []).map((a: any) => ({
      id: a.id,
      start_time: a.start_time,
      end_time: a.end_time,
      status: a.status,
      customer_name: a.customers?.name ?? '—',
      customer_phone: a.customers?.phone ?? '',
      barber_name: a.barbers?.name ?? null,
      service_name: a.services?.name ?? '—',
      service_price: a.services?.price ?? 0,
    }));

    const todayRevenue = appointments
      .filter(a => a.status === 'completed')
      .reduce((sum, a) => sum + a.service_price, 0);

    const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;
    const pendingCount   = appointments.filter(a => a.status === 'scheduled').length;

    setStats({
      totalCustomers: totalCustomers ?? 0,
      inactiveCustomers: inactiveCustomers ?? 0,
      atRiskCustomers: atRiskCustomers ?? 0,
      todayRevenue,
      todayAppointments: appointments,
      confirmedCount,
      pendingCount,
    });

    setLoading(false);
  }, [shopId]);

  useEffect(() => { load(); }, [load]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">

      {/* Erro de carregamento */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4 text-red-400 text-sm">
          Erro ao carregar dados: {error}
        </div>
      )}

      {/* KPIs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <StatCard
          label="Agendamentos Hoje"
          value={loading ? '—' : stats.todayAppointments.length}
          sub={loading ? 'Carregando...' : `${stats.confirmedCount} confirmados · ${stats.pendingCount} pendentes`}
          icon={<Calendar className="w-4 h-4" />}
          accent="gold"
        />
        <StatCard
          label="Receita do Dia"
          value={loading ? '—' : fmt(stats.todayRevenue)}
          sub="Serviços concluídos"
          icon={<DollarSign className="w-4 h-4" />}
          accent="green"
        />
        <StatCard
          label="Clientes"
          value={loading ? '—' : stats.totalCustomers}
          sub="Total cadastrado"
          icon={<Users className="w-4 h-4" />}
          accent="blue"
        />
        <StatCard
          label="Inativos"
          value={loading ? '—' : stats.inactiveCustomers}
          sub="Sem visita há 30+ dias"
          icon={<TrendingDown className="w-4 h-4" />}
          accent="red"
        />
      </motion.div>

      {/* Ações rápidas */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <h2 className="text-[11px] font-semibold tracking-widest uppercase text-white/30 mb-3">Ações Rápidas</h2>
        <div className="flex flex-wrap gap-2">
          {/* Botão funcional: apenas "Novo Agendamento" será implementado; os outros são ocultados até ter implementação real */}
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold transition-all duration-150 cursor-pointer bg-[#D4AF37] text-black hover:bg-[#F3D66E]">
            <Plus className="w-4 h-4" />
            Novo Agendamento
          </button>
          <button
            onClick={load}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold transition-all duration-150 cursor-pointer bg-white/8 text-white/70 hover:bg-white/12 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          {/* Botões não implementados ficam ocultos até terem funcionalidade real */}
          {stats.atRiskCustomers > 0 && (
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold transition-all duration-150 cursor-not-allowed opacity-50 bg-white/8 text-white/70" disabled title="Em breve">
              <AlertTriangle className="w-4 h-4" />
              {stats.atRiskCustomers} Clientes em Risco
            </button>
          )}
        </div>
      </motion.div>

      {/* Agenda de Hoje */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-[#111111] border border-white/6 rounded-xl overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-white/6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-white/30" />
            <h2 className="text-[13px] font-semibold text-white">Agenda de Hoje</h2>
          </div>
          <span className="text-[11px] text-white/30">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>

        {loading ? (
          <div className="divide-y divide-white/4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/6 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-32 bg-white/6 rounded animate-pulse" />
                  <div className="h-2 w-20 bg-white/4 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : stats.todayAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="w-8 h-8 text-white/10 mb-3" />
            <p className="text-sm text-white/30">Nenhum agendamento para hoje.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/4 max-h-80 overflow-y-auto scrollbar-none">
            {stats.todayAppointments.map(appt => (
              <div key={appt.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-white/2 transition-colors">
                {/* Horário */}
                <div className="w-14 flex-shrink-0 text-center">
                  <p className="text-[13px] font-bold text-[#D4AF37]">{formatTime(appt.start_time)}</p>
                  <p className="text-[10px] text-white/25">{formatTime(appt.end_time)}</p>
                </div>

                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-[#D4AF37]/15 flex items-center justify-center flex-shrink-0">
                  <span className="text-[11px] font-bold text-[#D4AF37]">
                    {(appt.barber_name || 'B').charAt(0)}
                  </span>
                </div>

                {/* Detalhes */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-white truncate">{appt.service_name}</p>
                  <p className="text-[11px] text-white/40 truncate">{appt.customer_name} · {appt.barber_name ?? 'Barbeiro'}</p>
                </div>

                {/* Status + preço */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <StatusBadge status={appt.status} small />
                  <span className="text-[11px] text-white/40">R$ {appt.service_price.toFixed(0)}</span>
                </div>

                {/* WhatsApp */}
                {appt.customer_phone && (
                  <a
                    href={`https://wa.me/55${appt.customer_phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-colors flex-shrink-0 cursor-pointer"
                    onClick={e => e.stopPropagation()}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
