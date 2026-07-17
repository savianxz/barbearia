import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, RefreshCw, AlertTriangle, TrendingDown, Zap, Users } from 'lucide-react';
import { SegmentBadge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { supabase } from '../../services/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import type { CrmSegment } from '../../services/crm/types';

// Tipos locais
interface CrmCustomerReal {
  id: string;
  name: string;
  whatsapp: string;
  lastVisit: string | null;
  daysSinceLastVisit: number | null;
  totalSpent: number;
  segment: CrmSegment;
  returnProbability: number | null;
}

interface CrmInsightReal {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  count: number;
  totalValue?: number;
  actionLabel?: string;
}

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

const recoverySegments: CrmSegment[] = ['at_risk', 'inactive'];

const calculateDays = (dateStr: string | null): number | null => {
  if (!dateStr) return null;
  const last = new Date(dateStr).getTime();
  const now = new Date().getTime();
  return Math.max(0, Math.floor((now - last) / (1000 * 3600 * 24)));
};

export const CrmPage: React.FC = () => {
  const { staff } = useAuth();
  const shopId = staff?.shop_id ?? '';

  const [insights, setInsights] = useState<CrmInsightReal[]>([]);
  const [customers, setCustomers] = useState<CrmCustomerReal[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeSegment, setActiveSegment] = useState<CrmSegment | 'all'>('all');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!shopId) return;
    setLoading(true);
    setError(null);

    // Buscar clientes da loja
    const { data: custData, error: custErr } = await supabase
      .from('customers')
      .select('id, name, phone, last_visit, total_spent')
      .eq('shop_id', shopId);

    if (custErr) { setError(custErr.message); setLoading(false); return; }

    const crmCustomers: CrmCustomerReal[] = [];
    let atRiskCount = 0;
    let inactiveCount = 0;
    let vipRecoveryCount = 0;
    let atRiskValue = 0;
    let inactiveValue = 0;

    for (const c of (custData || [])) {
      const days = calculateDays(c.last_visit);
      let segment: CrmSegment = 'new';
      
      if (days !== null) {
        if (days > 90) {
          segment = 'inactive';
          inactiveCount++;
          inactiveValue += Number(c.total_spent);
          if (c.total_spent > 300) {
            vipRecoveryCount++;
          }
        } else if (days > 45) {
          segment = 'at_risk';
          atRiskCount++;
          atRiskValue += Number(c.total_spent);
        } else {
          segment = 'loyal'; // Simplificação
        }
      }

      // Probabilidade de retorno (heurística simples para UI)
      let prob = null;
      if (days !== null) {
        prob = Math.max(0, Math.min(100, Math.round(100 - (days / 1.5))));
      }

      crmCustomers.push({
        id: c.id,
        name: c.name,
        whatsapp: c.phone || '',
        lastVisit: c.last_visit,
        daysSinceLastVisit: days,
        totalSpent: Number(c.total_spent),
        segment,
        returnProbability: prob
      });
    }

    // Gerar insights baseados nos números reais
    const generatedInsights: CrmInsightReal[] = [];
    
    if (atRiskCount > 0) {
      generatedInsights.push({
        id: 'ins-risk',
        title: 'Clientes em Risco de Evasão',
        description: 'Clientes que não retornam há mais de 45 dias.',
        severity: 'warning',
        count: atRiskCount,
        totalValue: atRiskValue,
      });
    }

    if (inactiveCount > 0) {
      generatedInsights.push({
        id: 'ins-inactive',
        title: 'Base Inativa',
        description: 'Clientes sem visitas há mais de 90 dias.',
        severity: 'critical',
        count: inactiveCount,
        totalValue: inactiveValue,
      });
    }

    if (vipRecoveryCount > 0) {
      generatedInsights.push({
        id: 'ins-vip',
        title: 'Recuperação VIP',
        description: 'Clientes de alto valor (> R$ 300) que estão inativos.',
        severity: 'critical',
        count: vipRecoveryCount,
      });
    }

    if (generatedInsights.length === 0) {
      generatedInsights.push({
        id: 'ins-ok',
        title: 'Retenção Saudável',
        description: 'Nenhum alerta crítico de evasão no momento.',
        severity: 'info',
        count: custData.length,
      });
    }

    setCustomers(crmCustomers);
    setInsights(generatedInsights);
    setLoading(false);
  }, [shopId]);

  const handleSync = async () => {
    setSyncing(true);
    await load();
    setSyncing(false);
  };

  useEffect(() => { load(); }, [load]);

  const recoveryCustomers = customers.filter(c => recoverySegments.includes(c.segment));
  const displayCustomers = activeSegment === 'all'
    ? recoveryCustomers
    : recoveryCustomers.filter(c => c.segment === activeSegment);

  const templateMessages: Record<string, string> = {
    at_risk:  'Ei, {nome}! Faz um tempinho que não te vemos na barbearia. Que tal marcar seu horário? 💈',
    inactive: '{nome}, sentimos sua falta! Seu próximo corte está aguardando. Acesse o link e agende agora.',
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4 text-red-400 text-sm">
          Erro ao carregar dados: {error}
        </div>
      )}

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
          {syncing ? 'Atualizando...' : 'Atualizar CRM'}
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
            <p className="text-white/25 text-sm col-span-3 py-4">Nenhum insight disponível. Atualize o CRM.</p>
          ) : (
            insights.map(ins => (
              <div key={ins.id} className={`border rounded-xl p-4 ${severityBorder[ins.severity] ?? 'border-white/8 bg-white/3'}`}>
                <div className="flex items-start gap-2 mb-2">
                  {severityIcon[ins.severity]}
                  <p className="text-[12px] font-semibold text-white leading-snug flex-1">{ins.title}</p>
                  <span className="text-[13px] font-bold text-white flex-shrink-0">{ins.count}</span>
                </div>
                <p className="text-[11px] text-white/40 leading-relaxed">{ins.description}</p>
                {ins.totalValue !== undefined && ins.totalValue > 0 && (
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
                {seg === 'all' ? 'Todos' : seg === 'at_risk' ? 'Em Risco' : 'Inativos'}
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
                      Último atendimento: {c.lastVisit
                        ? `há ${c.daysSinceLastVisit} dias`
                        : 'nunca retornou'}
                    </p>
                  </div>

                  {/* Return probability */}
                  {c.returnProbability !== null && (
                    <div className="hidden sm:block text-center flex-shrink-0">
                      <p className="text-[9px] uppercase tracking-wider text-white/25 mb-1">Prob. Retorno</p>
                      <p className={`text-[14px] font-bold ${c.returnProbability > 60 ? 'text-emerald-400' : c.returnProbability > 30 ? 'text-amber-400' : 'text-red-400'}`}>
                        {c.returnProbability}%
                      </p>
                    </div>
                  )}

                  {/* Ticket */}
                  <div className="hidden md:block text-right flex-shrink-0">
                    <p className="text-[9px] uppercase tracking-wider text-white/25 mb-0.5">Gasto Total</p>
                    <p className="text-[13px] font-bold text-white">R$ {c.totalSpent.toFixed(0)}</p>
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
    </div>
  );
};
