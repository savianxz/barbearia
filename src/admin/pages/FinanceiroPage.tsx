import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Scissors, Users } from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { bookingService } from '../../services/booking';
import { shop } from '../../data/mockData';
import type { Appointment } from '../../services/booking/types';

const fmt = (n: number) => `R$ ${n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

type Range = 'today' | 'week' | 'month' | 'all';

function filterByRange(appointments: Appointment[], range: Range): Appointment[] {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  if (range === 'today') return appointments.filter(a => a.date === today);
  if (range === 'week') {
    const start = new Date(now); start.setDate(now.getDate() - 7);
    return appointments.filter(a => a.date >= start.toISOString().split('T')[0]);
  }
  if (range === 'month') {
    const m = today.slice(0, 7);
    return appointments.filter(a => a.date.startsWith(m));
  }
  return appointments;
}

const ranges: { value: Range; label: string }[] = [
  { value: 'today', label: 'Hoje' },
  { value: 'week',  label: '7 dias' },
  { value: 'month', label: 'Este mês' },
  { value: 'all',   label: 'Todos' },
];

export const FinanceiroPage: React.FC = () => {
  const [range, setRange] = useState<Range>('month');
  const [all, setAll] = useState<Appointment[]>([]);

  useEffect(() => {
    setAll(bookingService.getAppointments());
  }, []);

  const completed = filterByRange(all, range).filter(a => a.status === 'completed');
  const revenue   = completed.reduce((s, a) => s + a.servicePrice, 0);
  const avgTicket = completed.length ? revenue / completed.length : 0;

  // Revenue by barber
  const byBarber = shop.barbers.map(b => {
    const appts = completed.filter(a => a.barberId === b.id);
    return { name: b.name, revenue: appts.reduce((s, a) => s + a.servicePrice, 0), count: appts.length };
  }).sort((a, b) => b.revenue - a.revenue);

  // Top services
  const serviceMap: Record<string, { name: string; revenue: number; count: number }> = {};
  completed.forEach(a => {
    if (!serviceMap[a.serviceId]) serviceMap[a.serviceId] = { name: a.serviceName, revenue: 0, count: 0 };
    serviceMap[a.serviceId].revenue += a.servicePrice;
    serviceMap[a.serviceId].count += 1;
  });
  const topServices = Object.values(serviceMap).sort((a, b) => b.revenue - a.revenue).slice(0, 8);

  const maxBarberRev = byBarber[0]?.revenue || 1;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Range filter */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
        {ranges.map(r => (
          <button
            key={r.value}
            onClick={() => setRange(r.value)}
            className={`px-4 py-2 rounded-xl text-[12px] font-semibold transition-all cursor-pointer ${
              range === r.value
                ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30'
                : 'bg-white/6 text-white/40 hover:text-white hover:bg-white/10'
            }`}
          >
            {r.label}
          </button>
        ))}
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <StatCard label="Receita Total"       value={fmt(revenue)}              icon={<DollarSign className="w-4 h-4" />} accent="gold" />
        <StatCard label="Atendimentos"        value={completed.length}           icon={<Scissors className="w-4 h-4" />}  accent="green" />
        <StatCard label="Ticket Médio"        value={fmt(avgTicket)}             icon={<TrendingUp className="w-4 h-4" />} accent="blue" />
        <StatCard label="Clientes Atendidos"  value={new Set(completed.map(a => a.customerId)).size} icon={<Users className="w-4 h-4" />} accent="default" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue by barber */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-[#111111] border border-white/6 rounded-xl p-5"
        >
          <h3 className="text-[11px] font-semibold tracking-widest uppercase text-white/30 mb-4">Receita por Barbeiro</h3>
          <div className="space-y-3">
            {byBarber.map(b => (
              <div key={b.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-semibold text-white">{b.name}</span>
                  <div className="text-right">
                    <span className="text-[13px] font-bold text-[#D4AF37]">{fmt(b.revenue)}</span>
                    <span className="text-[11px] text-white/30 ml-2">({b.count} serv.)</span>
                  </div>
                </div>
                <div className="h-1.5 bg-white/6 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(b.revenue / maxBarberRev) * 100}%` }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="h-full bg-[#D4AF37] rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top services */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-[#111111] border border-white/6 rounded-xl p-5"
        >
          <h3 className="text-[11px] font-semibold tracking-widest uppercase text-white/30 mb-4">Serviços Mais Vendidos</h3>
          {topServices.length === 0 ? (
            <p className="text-white/25 text-sm text-center py-6">Nenhum serviço concluído neste período.</p>
          ) : (
            <div className="divide-y divide-white/4">
              {topServices.map((svc, i) => (
                <div key={svc.name} className="py-2.5 flex items-center gap-3">
                  <span className="text-[11px] font-bold text-white/20 w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-white truncate">{svc.name}</p>
                    <p className="text-[10px] text-white/30">{svc.count}× realizados</p>
                  </div>
                  <span className="text-[13px] font-bold text-white flex-shrink-0">{fmt(svc.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
