import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, MessageCircle, RefreshCw, AlertTriangle, TrendingDown, Zap, Users } from 'lucide-react';
import { SegmentBadge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { crmService } from '../../services/crm';
import type { CrmCustomer, CrmInsight, CrmNotification, CrmSegment } from '../../services/crm/types';

const severityIcon: Record<string, React.ReactNode> = {
  critical: <AlertTriangle className="w-4 h-4 text-red-400" />,
  warning:  <TrendingDown className="w-4 h-4 text-orange-400" />,
  info:     <Zap className="w-4 h-4 text-blue-400" />,
};
const severityBorder: Record<string, string> = {
  critical: 'border-red-500/25 bg-red-500/5',
  warning:  'border-orange-500/25 bg-orange-500/5',
  info:     'border-blue-500/25 bg-blue-500/5',
};

const recoverySegments: CrmSegment[] = ['at_risk', 'inactive', 'never_returned'];

export const CrmPage: React.FC = () => {
  const [insights, setInsights] = useState<CrmInsight[]>([]);
  const [customers, setCustomers] = useState<CrmCustomer[]>([]);
  const [notifications, setNotifications] = useState<CrmNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeSegment, setActiveSegment] = useState<CrmSegment | 'all'>('all');

  const load = async () => {
    setLoading(true);
    const [ins, custs, notifs] = await Promise.all([
      crmService.getInsights('f-street'),
      crmService.getCrmCustomers('f-street'),
      crmService.getPendingNotifications('f-street'),
    ]);
    setInsights(ins.data ?? []);
    setCustomers(custs.data ?? []);
    setNotifications(notifs.data ?? []);
    setLoading(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    await crmService.syncCrm('f-street');
    await load();
    setSyncing(false);
  };

  useEffect(() => { load(); }, []);

  const recoveryCustomers = customers.filter(c => recoverySegments.includes(c.segment));
  const displayCustomers = activeSegment === 'all'
    ? recoveryCustomers
    : recoveryCustomers.filter(c => c.segment === activeSegment);

  const templateMessages: Record<string, string> = {
    at_risk:        'Ei, {nome}! Faz um tempinho que não te vemos aqui na F Street. Que tal marcar seu horário? 💈',
    inactive:       '{nome}, sentimos sua falta! Seu próximo corte está aguardando. Acesse o link e agende agora.',
    never_returned: 'Olá {nome}! Sua experiência na F Street foi boa? Gostaríamos de te ver novamente. ✂️',
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header action */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-bold text-white">Recuperação Inteligente</h2>
          <p className="text-[12px] text-white/30 mt-0.5">{recoveryCustomers.length} clientes precisam de atenção</p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/25 rounded-xl text-[12px] font-semibold transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Sincronizando...' : 'Sincronizar CRM'}
        </button>
      </motion.div>

      {/* Insights */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <h3 className="text-[11px] font-semibold tracking-widest uppercase text-white/30 mb-3">Insights Automáticos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="bg-[#111111] border border-white/6 rounded-xl p-4 animate-pulse">
                <div className="h-3 w-32 bg-white/8 rounded mb-2" />
                <div className="h-2 w-full bg-white/5 rounded" />
              </div>
            ))
          ) : insights.length === 0 ? (
            <p className="text-white/25 text-sm col-span-3 py-4">Nenhum insight disponível. Sincronize o CRM.</p>
          ) : (
            insights.map(ins => (
              <div key={ins.id} className={`border rounded-xl p-4 ${severityBorder[ins.severity] ?? 'border-white/8 bg-white/3'}`}>
                <div className="flex items-start gap-2 mb-2">
                  {severityIcon[ins.severity]}
                  <p className="text-[12px] font-semibold text-white leading-snug flex-1">{ins.title}</p>
                  <span className="text-[13px] font-bold text-white flex-shrink-0">{ins.count}</span>
                </div>
                <p className="text-[11px] text-white/40 leading-relaxed">{ins.description}</p>
                {ins.totalValue && ins.totalValue > 0 && (
                  <p className="text-[11px] font-semibold text-[#D4AF37] mt-2">
                    R$ {ins.totalValue.toFixed(0)} em risco
                  </p>
                )}
                {ins.actionLabel && (
                  <button className="mt-2 text-[11px] font-semibold text-[#D4AF37] hover:text-[#F3D66E] transition-colors cursor-pointer">
                    {ins.actionLabel} →
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Recovery queue */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[11px] font-semibold tracking-widest uppercase text-white/30">Fila de Recuperação</h3>
          <div className="flex gap-1.5">
            {(['all', ...recoverySegments] as const).map(seg => (
              <button
                key={seg}
                onClick={() => setActiveSegment(seg)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  activeSegment === seg ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30' : 'bg-white/6 text-white/35 hover:text-white'
                }`}
              >
                {seg === 'all' ? 'Todos' : seg === 'at_risk' ? 'Em Risco' : seg === 'inactive' ? 'Inativos' : 'Sem Retorno'}
              </button>
            ))}
          </div>
        </div>

        {displayCustomers.length === 0 ? (
          <EmptyState icon={<Users className="w-6 h-6" />} title="Nenhum cliente neste segmento" />
        ) : (
          <div className="bg-[#111111] border border-white/6 rounded-xl divide-y divide-white/4">
            {displayCustomers.map(c => {
              const msgTemplate = templateMessages[c.segment] ?? '';
              const waMsg = encodeURIComponent(msgTemplate.replace('{nome}', c.name.split(' ')[0]));
              const returnPct = c.metrics.daysUntilEstimatedReturn !== null
                ? Math.max(0, Math.min(100, Math.round((1 - c.metrics.daysUntilEstimatedReturn / 30) * 100)))
                : null;
              return (
                <div key={c.id} className="px-4 py-4 flex items-center gap-4 hover:bg-white/2 transition-colors">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-[12px] font-bold text-[#D4AF37]">{c.name.charAt(0)}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-semibold text-white">{c.name}</p>
                      <SegmentBadge segment={c.segment} small />
                    </div>
                    <p className="text-[11px] text-white/35 mt-0.5">
                      Último atendimento: {c.metrics.lastAppointmentDate
                        ? `há ${c.metrics.daysSinceLastVisit} dias`
                        : 'nunca retornou'}
                    </p>
                  </div>

                  {/* Return probability */}
                  {returnPct !== null && (
                    <div className="hidden sm:block text-center flex-shrink-0">
                      <p className="text-[9px] uppercase tracking-wider text-white/25 mb-1">Prob. Retorno</p>
                      <p className={`text-[14px] font-bold ${returnPct > 60 ? 'text-emerald-400' : returnPct > 30 ? 'text-amber-400' : 'text-red-400'}`}>
                        {returnPct}%
                      </p>
                    </div>
                  )}

                  {/* Ticket */}
                  <div className="hidden md:block text-right flex-shrink-0">
                    <p className="text-[9px] uppercase tracking-wider text-white/25 mb-0.5">Gasto Total</p>
                    <p className="text-[13px] font-bold text-white">R$ {c.metrics.totalSpent.toFixed(0)}</p>
                  </div>

                  {/* WhatsApp action */}
                  <a
                    href={`https://wa.me/55${c.whatsapp.replace(/\D/g, '')}?text=${waMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer flex-shrink-0"
                  >
                    <MessageCircle className="w-3 h-3" />
                    WhatsApp
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Pending notifications */}
      {notifications.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <h3 className="text-[11px] font-semibold tracking-widest uppercase text-white/30 mb-3">
            Fila de Notificações ({notifications.length})
          </h3>
          <div className="bg-[#111111] border border-white/6 rounded-xl divide-y divide-white/4">
            {notifications.slice(0, 5).map(n => (
              <div key={n.id} className="px-4 py-3 flex items-center gap-3">
                <Brain className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-white">{n.customerName}</p>
                  <p className="text-[11px] text-white/35">{n.templateKey.replace(/_/g, ' ')} · {n.channel}</p>
                </div>
                <span className="text-[10px] text-white/25 flex-shrink-0">
                  {new Date(n.scheduledAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
