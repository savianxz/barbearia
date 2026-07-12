import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Users } from 'lucide-react';
import { SegmentBadge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { crmService } from '../../services/crm';
import type { CrmCustomer, CrmSegment } from '../../services/crm/types';

const segments: { value: CrmSegment | 'all'; label: string }[] = [
  { value: 'all',           label: 'Todos' },
  { value: 'vip',           label: 'VIP' },
  { value: 'loyal',         label: 'Fiéis' },
  { value: 'club_eligible', label: 'Clube' },
  { value: 'at_risk',       label: 'Em Risco' },
  { value: 'inactive',      label: 'Inativos' },
  { value: 'never_returned',label: 'Sem Retorno' },
  { value: 'new',           label: 'Novos' },
];

const loyaltyScore = (score: number) => {
  const pct = Math.round(score);
  const color = pct >= 70 ? 'bg-[#D4AF37]' : pct >= 40 ? 'bg-blue-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] text-white/40 w-7 text-right">{pct}</span>
    </div>
  );
};

export const ClientesPage: React.FC = () => {
  const [customers, setCustomers] = useState<CrmCustomer[]>([]);
  const [filtered, setFiltered] = useState<CrmCustomer[]>([]);
  const [search, setSearch] = useState('');
  const [segment, setSegment] = useState<CrmSegment | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    crmService.getCrmCustomers('f-street').then(r => {
      setCustomers(r.data ?? []);
      setFiltered(r.data ?? []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let result = customers;
    if (segment !== 'all') result = result.filter(c => c.segment === segment);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q) || c.whatsapp.includes(q));
    }
    setFiltered(result);
  }, [search, segment, customers]);

  return (
    <div className="p-6 space-y-5 max-w-6xl mx-auto">
      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome ou WhatsApp..."
            className="w-full bg-[#111111] border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-[13px] text-white placeholder:text-white/25 focus:outline-none focus:border-[#D4AF37]/40 transition-colors"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {segments.map(s => (
            <button
              key={s.value}
              onClick={() => setSegment(s.value)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
                segment === s.value ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30' : 'bg-white/6 text-white/40 hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Count */}
      <p className="text-[11px] text-white/30">{filtered.length} cliente{filtered.length !== 1 ? 's' : ''}</p>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[#111111] border border-white/6 rounded-xl p-5 space-y-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/8" />
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-white/8 rounded" />
                  <div className="h-2 w-16 bg-white/5 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Users className="w-6 h-6" />} title="Nenhum cliente encontrado" description="Tente ajustar os filtros." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="bg-[#111111] border border-white/6 rounded-xl p-4 hover:border-white/12 transition-all group"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-[13px] font-bold text-[#D4AF37]">{c.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-white leading-none">{c.name}</p>
                    <p className="text-[11px] text-white/30 mt-0.5">{c.whatsapp}</p>
                  </div>
                </div>
                <SegmentBadge segment={c.segment} small />
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-white/25 mb-0.5">Último Atend.</p>
                  <p className="text-[12px] font-semibold text-white">
                    {c.metrics.lastAppointmentDate
                      ? new Date(c.metrics.lastAppointmentDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-white/25 mb-0.5">Ticket Médio</p>
                  <p className="text-[12px] font-semibold text-white">
                    {c.metrics.averageTicket > 0 ? `R$ ${c.metrics.averageTicket.toFixed(0)}` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-white/25 mb-0.5">Visitas</p>
                  <p className="text-[12px] font-semibold text-white">{c.metrics.totalAppointments}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-white/25 mb-0.5">Barbeiro Fav.</p>
                  <p className="text-[12px] font-semibold text-white truncate">{c.metrics.favoriteBarberName ?? '—'}</p>
                </div>
              </div>

              {/* Loyalty score */}
              <div>
                <p className="text-[9px] uppercase tracking-wider text-white/25 mb-1">Score de Fidelidade</p>
                {loyaltyScore(c.metrics.loyaltyScore)}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
