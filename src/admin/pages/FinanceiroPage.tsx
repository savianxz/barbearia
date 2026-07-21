import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, TrendingUp, Scissors, Users, Clock, AlertCircle } from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { useAppointments, useFinalizeAppointment } from '../../hooks/useAppointments';
import { useAuth } from '../../contexts/AuthContext';
import type { AppointmentWithDetails } from '../../types/scheduling';

const fmt = (n: number) => `R$ ${n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

type Range = 'today' | 'week' | 'month' | 'all';

function getDateRange(range: Range): { start: string; end: string } {
  const now = new Date();
  
  if (range === 'today') {
    const today = now.toISOString().split('T')[0];
    return { start: `${today}T00:00:00`, end: `${today}T23:59:59` };
  }
  
  if (range === 'week') {
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    const end = new Date(now);
    return { start: `${start.toISOString().split('T')[0]}T00:00:00`, end: `${end.toISOString().split('T')[0]}T23:59:59` };
  }
  
  if (range === 'month') {
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    // Gambiarra simples para último dia do mês:
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
    return { start: `${year}-${month}-01T00:00:00`, end: `${year}-${month}-${lastDay}T23:59:59` };
  }
  
  // 'all'
  return { start: '2020-01-01T00:00:00', end: '2099-12-31T23:59:59' };
}

const ranges: { value: Range; label: string }[] = [
  { value: 'today', label: 'Hoje' },
  { value: 'week',  label: '7 dias' },
  { value: 'month', label: 'Este mês' },
  { value: 'all',   label: 'Todos' },
];

export const FinanceiroPage: React.FC = () => {
  const { staff } = useAuth();
  const shopId = staff?.shop_id ?? '';

  const [range, setRange] = useState<Range>('month');
  
  const { start, end } = useMemo(() => getDateRange(range), [range]);
  
  const { data: allAppointments = [], isLoading } = useAppointments(shopId, start, end);
  const finalizeMut = useFinalizeAppointment(shopId);

  const [finalizeTarget, setFinalizeTarget] = useState<AppointmentWithDetails | null>(null);
  const [finalPriceStr, setFinalPriceStr] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash'|'card'|'pix'|'mixed'|''>('');
  const [paymentNotes, setPaymentNotes] = useState<string>('');

  const handleFinalize = async () => {
    if (!finalizeTarget) return;
    if (!paymentMethod) return alert('Selecione uma forma de pagamento.');
    try {
      let price = parseFloat(finalPriceStr.replace(',', '.'));
      if (isNaN(price)) price = finalizeTarget.total_price;
      if (price < 0.01) return alert('O valor mínimo deve ser R$ 0,01');
      
      await finalizeMut.mutateAsync({
        id: finalizeTarget.id,
        finalPrice: price,
        paymentStatus: 'paid',
        paymentMethod: paymentMethod as any,
        paymentNotes: paymentMethod === 'mixed' ? paymentNotes : undefined
      });
      setFinalizeTarget(null);
    } catch (e: any) { alert(e.message ?? 'Erro ao finalizar'); }
  };

  const completed = allAppointments.filter(a => a.status === 'completed' && a.payment_status === 'paid');
  const pendingAppointments = allAppointments.filter(a => a.status === 'completed' && a.payment_status === 'pending');
  
  const revenue = completed.reduce((sum, a) => sum + Number(a.total_price || 0), 0);
  const pendingValue = pendingAppointments.reduce((sum, a) => sum + Number(a.total_price || 0), 0);
  const avgTicket = completed.length ? revenue / completed.length : 0;

  // Formas de pagamento
  const paymentMap: Record<string, number> = { cash: 0, card: 0, pix: 0, mixed: 0 };
  completed.forEach(a => {
    const method = a.payment_method;
    if (method && paymentMap[method] !== undefined) {
      paymentMap[method] += Number(a.total_price || 0);
    }
  });

  // Receita por barbeiro
  const barberMap: Record<string, { name: string; revenue: number; count: number }> = {};
  completed.forEach(a => {
    const bId = a.barber_id;
    const bName = a.barber?.name || 'Desconhecido';
    if (!barberMap[bId]) barberMap[bId] = { name: bName, revenue: 0, count: 0 };
    barberMap[bId].revenue += Number(a.total_price || 0);
    barberMap[bId].count += 1;
  });
  const byBarber = Object.values(barberMap).sort((a, b) => b.revenue - a.revenue);

  // Serviços mais vendidos
  const serviceMap: Record<string, { name: string; revenue: number; count: number }> = {};
  completed.forEach(a => {
    const sId = a.service_id;
    const sName = a.service?.name || 'Serviço Excluído';
    if (!serviceMap[sId]) serviceMap[sId] = { name: sName, revenue: 0, count: 0 };
    // Atualmente estamos usando a prop total_price do appointment para a receita real,
    // o que é correto caso existam descontos. Assumimos o preço total pago.
    serviceMap[sId].revenue += Number(a.total_price || 0);
    serviceMap[sId].count += 1;
  });
  const topServices = Object.values(serviceMap).sort((a, b) => b.revenue - a.revenue).slice(0, 8);

  const maxBarberRev = byBarber[0]?.revenue || 1;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Range filter */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex gap-2">
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
        </div>
        
        {isLoading && (
          <div className="w-5 h-5 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        )}
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="grid grid-cols-2 lg:grid-cols-5 gap-3"
      >
        <StatCard label="Receita Total"       value={fmt(revenue)}              icon={<DollarSign className="w-4 h-4" />} accent="gold" />
        <StatCard label="Aguardando Pagamento" value={fmt(pendingValue)}         icon={<TrendingUp className="w-4 h-4" />} accent="red" />
        <StatCard label="Atendimentos"        value={completed.length}           icon={<Scissors className="w-4 h-4" />}  accent="green" />
        <StatCard label="Ticket Médio"        value={fmt(avgTicket)}             icon={<TrendingUp className="w-4 h-4" />} accent="blue" />
        <StatCard label="Clientes Atendidos"  value={new Set(completed.map(a => a.customer_id)).size} icon={<Users className="w-4 h-4" />} accent="default" />
      </motion.div>

      {/* Payment methods */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <div className="bg-[#111111] border border-white/6 rounded-xl p-4 flex items-center justify-between">
          <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Dinheiro</span>
          <span className="text-[13px] font-bold text-emerald-400">{fmt(paymentMap.cash)}</span>
        </div>
        <div className="bg-[#111111] border border-white/6 rounded-xl p-4 flex items-center justify-between">
          <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Cartão</span>
          <span className="text-[13px] font-bold text-blue-400">{fmt(paymentMap.card)}</span>
        </div>
        <div className="bg-[#111111] border border-white/6 rounded-xl p-4 flex items-center justify-between">
          <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Pix</span>
          <span className="text-[13px] font-bold text-purple-400">{fmt(paymentMap.pix)}</span>
        </div>
        <div className="bg-[#111111] border border-white/6 rounded-xl p-4 flex items-center justify-between">
          <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Misto</span>
          <span className="text-[13px] font-bold text-[#D4AF37]">{fmt(paymentMap.mixed)}</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue by barber */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-[#111111] border border-white/6 rounded-xl p-5"
        >
          <h3 className="text-[11px] font-semibold tracking-widest uppercase text-white/30 mb-4">Receita por Barbeiro</h3>
          {byBarber.length === 0 && !isLoading ? (
            <p className="text-white/25 text-sm text-center py-6">Nenhum dado neste período.</p>
          ) : (
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
          )}
        </motion.div>

        {/* Top services */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-[#111111] border border-white/6 rounded-xl p-5"
        >
          <h3 className="text-[11px] font-semibold tracking-widest uppercase text-white/30 mb-4">Serviços Mais Vendidos</h3>
          {topServices.length === 0 && !isLoading ? (
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

      {/* Pending List */}
      {pendingAppointments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <h3 className="text-[11px] font-semibold tracking-widest uppercase text-amber-400">Pagamentos Pendentes</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingAppointments.map(appt => (
              <div 
                key={appt.id} 
                onClick={() => {
                  setFinalizeTarget(appt);
                  setFinalPriceStr(appt.total_price.toFixed(2));
                  setPaymentMethod('');
                  setPaymentNotes('');
                }}
                className="bg-[#111] border border-white/10 rounded-xl p-4 cursor-pointer hover:border-amber-500/40 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-[13px] font-bold text-white">{appt.customer?.name}</p>
                    <p className="text-[11px] text-white/40">{appt.service?.name}</p>
                  </div>
                  <span className="text-[13px] font-bold text-amber-400">R$ {appt.total_price.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/30 text-[10px] uppercase font-bold tracking-widest">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(appt.start_time).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Finalize Dialog (Pagamento) */}
      <AnimatePresence>
        {finalizeTarget && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFinalizeTarget(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-sm bg-[#111] border border-white/10 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-2">Confirmar Pagamento</h3>
              <p className="text-sm text-white/50 mb-6">Confirme o valor final e a forma de pagamento de {finalizeTarget.customer?.name}.</p>
              
              <div className="mb-6">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-white/30 mb-2">Valor Final (R$)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={finalPriceStr}
                    onChange={(e) => setFinalPriceStr(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white font-bold text-lg focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-white/30 mb-2">Forma de Pagamento *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[13px] text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                >
                  <option value="" disabled>Selecione...</option>
                  <option value="cash">Dinheiro</option>
                  <option value="pix">Pix</option>
                  <option value="card">Cartão (Crédito/Débito)</option>
                  <option value="mixed">Misto (Ex: Dinheiro + Pix)</option>
                </select>
              </div>

              {paymentMethod === 'mixed' && (
                <div className="mb-6">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-white/30 mb-2">Detalhes da Divisão</label>
                  <input
                    type="text"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="Ex: R$ 20 Pix + R$ 30 Dinheiro"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => setFinalizeTarget(null)} className="flex-1 py-3 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 font-bold text-[13px] transition-all">
                  Cancelar
                </button>
                <button onClick={handleFinalize} className="flex-[2] py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all">
                  Confirmar Pagamento
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
