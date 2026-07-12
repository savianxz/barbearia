import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, MessageCircle, Clock, Send } from 'lucide-react';
import { crmService } from '../../services/crm';
import type { CrmNotification, CrmSegment } from '../../services/crm/types';

const segmentLabels: Record<string, string> = {
  at_risk: 'Em Risco', inactive: 'Inativos', never_returned: 'Sem Retorno',
  vip: 'VIP', loyal: 'Fiel', club_eligible: 'Clube', new: 'Novo',
};

const templateSuggestions = [
  {
    segment: 'at_risk' as CrmSegment,
    title: 'Reativação — Em Risco',
    preview: 'Ei, {nome}! Faz um tempinho que não te vemos aqui na F Street. Que tal marcar seu horário? 💈',
    channel: 'WhatsApp',
    color: 'border-orange-500/25 bg-orange-500/5',
    accent: 'text-orange-400',
  },
  {
    segment: 'inactive' as CrmSegment,
    title: 'Reativação — Inativos',
    preview: '{nome}, sentimos sua falta! Seu próximo corte está aguardando. Agende agora 👇',
    channel: 'WhatsApp',
    color: 'border-red-500/25 bg-red-500/5',
    accent: 'text-red-400',
  },
  {
    segment: 'never_returned' as CrmSegment,
    title: 'Primeiro Retorno',
    preview: 'Olá {nome}! Sua experiência na F Street foi boa? Gostaríamos de te receber novamente. ✂️',
    channel: 'WhatsApp',
    color: 'border-neutral-500/25 bg-neutral-800/30',
    accent: 'text-neutral-400',
  },
  {
    segment: 'club_eligible' as CrmSegment,
    title: 'Convite — Clube F Street',
    preview: '{nome}, você tem o perfil ideal para o nosso Clube! Corte ilimitado por R$ 84,90/mês. Quer saber mais?',
    channel: 'WhatsApp',
    color: 'border-[#D4AF37]/25 bg-[#D4AF37]/5',
    accent: 'text-[#D4AF37]',
  },
  {
    segment: 'vip' as CrmSegment,
    title: 'Oferta Exclusiva VIP',
    preview: '{nome}, como nosso cliente VIP você tem acesso a uma condição especial este mês. 🌟',
    channel: 'WhatsApp',
    color: 'border-emerald-500/25 bg-emerald-500/5',
    accent: 'text-emerald-400',
  },
];

export const MarketingPage: React.FC = () => {
  const [pending, setPending] = useState<CrmNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    crmService.getPendingNotifications('f-street').then(r => {
      setPending(r.data ?? []);
      setLoading(false);
    });
  }, []);

  const handleMarkSent = async (id: string) => {
    await crmService.markNotificationSent(id);
    const r = await crmService.getPendingNotifications('f-street');
    setPending(r.data ?? []);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Templates */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="text-[11px] font-semibold tracking-widest uppercase text-white/30 mb-3 flex items-center gap-2">
          <Megaphone className="w-3.5 h-3.5" /> Templates de Campanha
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {templateSuggestions.map((t, i) => (
            <motion.div
              key={t.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`border rounded-xl p-4 ${t.color}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className={`text-[12px] font-bold ${t.accent}`}>{t.title}</p>
                <span className="text-[9px] font-semibold bg-white/8 border border-white/10 px-1.5 py-0.5 rounded-full text-white/40 flex-shrink-0">
                  {t.channel}
                </span>
              </div>
              <p className="text-[11px] text-white/40 leading-relaxed mb-3">"{t.preview}"</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold bg-white/6 px-2 py-0.5 rounded-full text-white/30">
                  {segmentLabels[t.segment]}
                </span>
                <button className={`flex items-center gap-1 text-[10px] font-semibold ${t.accent} hover:opacity-80 transition-opacity cursor-pointer`}>
                  <Send className="w-3 h-3" /> Usar template
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Pending notifications queue */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h3 className="text-[11px] font-semibold tracking-widest uppercase text-white/30 mb-3 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5" /> Fila de Envios Pendentes ({pending.length})
        </h3>

        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-[#111111] border border-white/6 rounded-xl animate-pulse" />)}
          </div>
        ) : pending.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <MessageCircle className="w-8 h-8 text-white/10 mb-3" />
            <p className="text-sm text-white/30">Nenhum envio pendente.</p>
            <p className="text-xs text-white/20 mt-1">Sincronize o CRM para gerar sugestões de envio.</p>
          </div>
        ) : (
          <div className="bg-[#111111] border border-white/6 rounded-xl divide-y divide-white/4">
            {pending.map(n => (
              <div key={n.id} className="px-4 py-3.5 flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-white">{n.customerName}</p>
                  <p className="text-[11px] text-white/35">{n.templateKey.replace(/_/g, ' ')} · {n.channel}</p>
                </div>
                <span className="text-[10px] text-white/25 flex-shrink-0 hidden sm:block">
                  {new Date(n.scheduledAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                </span>
                <button
                  onClick={() => handleMarkSent(n.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer flex-shrink-0"
                >
                  <Send className="w-3 h-3" /> Marcar Enviado
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
