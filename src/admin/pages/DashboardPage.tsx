import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, Users, DollarSign, TrendingUp, Clock,
  MessageCircle, AlertTriangle, Zap, RefreshCw, Plus
} from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { StatusBadge } from '../components/ui/Badge';
import { bookingService } from '../../services/booking';
import { crmService } from '../../services/crm';
import type { Appointment } from '../../services/booking/types';
import type { CrmInsight } from '../../services/crm/types';

const TODAY = new Date().toISOString().split('T')[0];
const fmt = (n: number) => `R$ ${n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

export const DashboardPage: React.FC = () => {
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [insights, setInsights] = useState<CrmInsight[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const all = bookingService.getAppointments();
    const todays = all.filter(a => a.date === TODAY).sort((a, b) => a.startTime.localeCompare(b.startTime));
    setTodayAppointments(todays);
    const ins = await crmService.getInsights('f-street');
    setInsights(ins.data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const revenue = todayAppointments.filter(a => a.status === 'completed').reduce((s, a) => s + a.servicePrice, 0);
  const confirmed = todayAppointments.filter(a => a.status === 'confirmed').length;
  const pending   = todayAppointments.filter(a => a.status === 'pending').length;
  const atRiskInsight = insights.find(i => i.segment === 'at_risk');
  const inactiveInsight = insights.find(i => i.segment === 'inactive');

  const severityColor: Record<string, string> = {
    critical: 'border-red-500/30 bg-red-500/5',
    warning:  'border-orange-500/30 bg-orange-500/5',
    info:     'border-blue-500/30 bg-blue-500/5',
  };

  const quickActions = [
    { label: 'Novo Agendamento', icon: <Plus className="w-4 h-4" />, color: 'bg-[#D4AF37] text-black hover:bg-[#F3D66E]' },
    { label: 'Sincronizar CRM',  icon: <RefreshCw className="w-4 h-4" />, color: 'bg-white/8 text-white/70 hover:bg-white/12 hover:text-white' },
    { label: 'Ver Agenda',       icon: <Calendar className="w-4 h-4" />, color: 'bg-white/8 text-white/70 hover:bg-white/12 hover:text-white' },
    { label: 'Clientes em Risco', icon: <AlertTriangle className="w-4 h-4" />, color: 'bg-white/8 text-white/70 hover:bg-white/12 hover:text-white' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <StatCard
          label="Agendamentos Hoje"
          value={todayAppointments.length}
          sub={`${confirmed} confirmados · ${pending} pendentes`}
          icon={<Calendar className="w-4 h-4" />}
          accent="gold"
        />
        <StatCard
          label="Receita do Dia"
          value={fmt(revenue)}
          sub="Serviços concluídos"
          icon={<DollarSign className="w-4 h-4" />}
          accent="green"
          trend={12}
        />
        <StatCard
          label="Recuperar Clientes"
          value={atRiskInsight?.count ?? 0}
          sub="Em risco de churn"
          icon={<Users className="w-4 h-4" />}
          accent="red"
        />
        <StatCard
          label="Inativos"
          value={inactiveInsight?.count ?? 0}
          sub="Sem visita há 90+ dias"
          icon={<TrendingUp className="w-4 h-4" />}
          accent="blue"
        />
      </motion.div>

      {/* Quick actions */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <h2 className="text-[11px] font-semibold tracking-widest uppercase text-white/30 mb-3">Ações Rápidas</h2>
        <div className="flex flex-wrap gap-2">
          {quickActions.map(a => (
            <button key={a.label} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold transition-all duration-150 cursor-pointer ${a.color}`}>
              {a.icon}
              {a.label}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Today's appointments */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="lg:col-span-3 bg-[#111111] border border-white/6 rounded-xl overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-white/6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-white/30" />
              <h2 className="text-[13px] font-semibold text-white">Agenda de Hoje</h2>
            </div>
            <span className="text-[11px] text-white/30">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
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
          ) : todayAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="w-8 h-8 text-white/10 mb-3" />
              <p className="text-sm text-white/30">Nenhum agendamento para hoje.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/4 max-h-80 overflow-y-auto scrollbar-none">
              {todayAppointments.map(appt => (
                <div key={appt.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-white/2 transition-colors">
                  {/* Time */}
                  <div className="w-14 flex-shrink-0 text-center">
                    <p className="text-[13px] font-bold text-[#D4AF37]">{appt.startTime}</p>
                    <p className="text-[10px] text-white/25">{appt.endTime}</p>
                  </div>

                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-[#D4AF37]/15 flex items-center justify-center flex-shrink-0">
                    <span className="text-[11px] font-bold text-[#D4AF37]">
                      {(appt.barberName || 'B').charAt(0)}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-white truncate">{appt.serviceName}</p>
                    <p className="text-[11px] text-white/40 truncate">{appt.barberName}</p>
                  </div>

                  {/* Status + price */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <StatusBadge status={(appt.status === 'pending' ? 'scheduled' : appt.status === 'cancelled' ? 'canceled' : appt.status) as any} small />
                    <span className="text-[11px] text-white/40">R$ {appt.servicePrice.toFixed(0)}</span>
                  </div>

                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/55${appt.confirmationCode?.slice(-8) ?? ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-colors flex-shrink-0 cursor-pointer"
                    onClick={e => e.stopPropagation()}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* CRM Insights */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="lg:col-span-2 bg-[#111111] border border-white/6 rounded-xl overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-white/6 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#D4AF37]" />
            <h2 className="text-[13px] font-semibold text-white">Insights CRM</h2>
          </div>
          <div className="p-3 space-y-2 max-h-80 overflow-y-auto scrollbar-none">
            {insights.length === 0 ? (
              <p className="text-center text-white/25 text-xs py-8">Nenhum insight disponível.</p>
            ) : (
              insights.slice(0, 6).map(insight => (
                <div
                  key={insight.id}
                  className={`p-3 rounded-lg border ${severityColor[insight.severity] ?? 'border-white/8 bg-white/3'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[12px] font-semibold text-white leading-snug">{insight.title}</p>
                    <span className="text-[11px] font-bold text-white/40 flex-shrink-0">{insight.count}</span>
                  </div>
                  <p className="text-[11px] text-white/40 mt-1 line-clamp-2">{insight.description}</p>
                  {insight.actionLabel && (
                    <button className="mt-2 text-[10px] font-semibold text-[#D4AF37] hover:text-[#F3D66E] transition-colors cursor-pointer">
                      {insight.actionLabel} →
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
