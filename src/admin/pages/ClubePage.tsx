import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Check } from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { crmService } from '../../services/crm';
import { shop } from '../../data/mockData';
import type { CrmCustomer } from '../../services/crm/types';

const { membership } = shop;

export const ClubePage: React.FC = () => {
  const [eligible, setEligible] = useState<CrmCustomer[]>([]);
  const [members, setMembers] = useState<CrmCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    crmService.getCrmCustomers('f-street').then(r => {
      const all = r.data ?? [];
      setEligible(all.filter(c => !c.isClubMember && c.segment === 'loyal'));
      setMembers(all.filter(c => c.isClubMember));
      setLoading(false);
    });
  }, []);

  const recurringRevenue = members.length * membership.price;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Club plan highlight */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/25 rounded-2xl p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="text-[17px] font-bold text-white">{membership.name}</h2>
            </div>
            <p className="text-[28px] font-black text-[#D4AF37]">
              R$ {membership.price.toFixed(2).replace('.', ',')}
              <span className="text-[14px] font-normal text-white/40">/{membership.period}</span>
            </p>
            <p className="text-[13px] text-white/50 mt-1">{membership.ctaText}</p>
          </div>
          <div className="space-y-1.5">
            {membership.benefits.slice(0, 3).map(b => (
              <div key={b} className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                <span className="text-[11px] text-white/60">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="grid grid-cols-2 lg:grid-cols-3 gap-3"
      >
        <StatCard
          label="Membros Ativos"
          value={members.length}
          sub="VIP + Fiéis"
          icon={<Crown className="w-4 h-4" />}
          accent="gold"
        />
        <StatCard
          label="Receita Recorrente"
          value={`R$ ${recurringRevenue.toFixed(0)}`}
          sub="Se todos aderissem"
          accent="green"
        />
        <StatCard
          label="Aptos ao Clube"
          value={eligible.length}
          sub="Aguardando convite"
          accent="blue"
        />
      </motion.div>

      {/* Eligible customers */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h3 className="text-[11px] font-semibold tracking-widest uppercase text-white/30 mb-3">
          Clientes Aptos ao Clube
        </h3>
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-[#111111] border border-white/6 rounded-xl h-16 animate-pulse" />
            ))}
          </div>
        ) : eligible.length === 0 ? (
          <p className="text-white/25 text-sm py-8 text-center">Nenhum cliente elegível no momento.</p>
        ) : (
          <div className="bg-[#111111] border border-white/6 rounded-xl divide-y divide-white/4">
            {eligible.map(c => {
              const waMsg = encodeURIComponent(
                `Olá ${c.name.split(' ')[0]}! Você tem o perfil perfeito para o nosso ${membership.name}. Por apenas R$ ${membership.price.toFixed(0)}/mês você tem acesso a corte ilimitado. Quer saber mais?`
              );
              return (
                <div key={c.id} className="px-4 py-4 flex items-center gap-4 hover:bg-white/2 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-[12px] font-bold text-[#D4AF37]">{c.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-white">{c.name}</p>
                    <p className="text-[11px] text-white/35">
                      {c.metrics.totalAppointments} visitas · R$ {c.metrics.totalSpent.toFixed(0)} gasto total
                    </p>
                  </div>
                  <div className="hidden sm:block text-right flex-shrink-0">
                    <p className="text-[11px] text-white/25">Freq. média</p>
                    <p className="text-[12px] font-bold text-white">
                      {c.metrics.averageFrequencyDays ? `${Math.round(c.metrics.averageFrequencyDays)}d` : '—'}
                    </p>
                  </div>
                  <a
                    href={`https://wa.me/55${c.whatsapp.replace(/\D/g, '')}?text=${waMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/25 text-[#D4AF37] hover:bg-[#D4AF37]/20 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer flex-shrink-0"
                  >
                    <Crown className="w-3 h-3" />
                    Convidar
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
