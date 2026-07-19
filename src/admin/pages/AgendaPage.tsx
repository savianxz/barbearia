import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, MessageCircle, Clock, CheckCircle, X, Calendar, User, Scissors, DollarSign, List, LayoutGrid } from 'lucide-react';
import { StatusBadge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { useAuth } from '../../contexts/AuthContext';
import { useAppointments, useCancelAppointment, useFinalizeAppointment, useUpdateAppointmentStatus } from '../../hooks/useAppointments';
import { useBarbers } from '../../hooks/useBarbers';
import { useRealtimeAppointments } from '../../hooks/useRealtimeAppointments';
import type { AppointmentWithDetails } from '../../types/scheduling';
import { ConfirmDialog, Toast } from '../components/AdminDialogs';

function formatDate(d: Date) { return d.toISOString().split('T')[0]; }
function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function getStartOfWeek(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day; // Domingo como primeiro dia
  return new Date(date.setDate(diff));
}
function displayDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}
function formatTime(isoString: string) {
  const d = new Date(isoString);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export const AgendaPage: React.FC = () => {
  const { staff } = useAuth();
  const shopId = staff?.shop_id ?? '';

  useRealtimeAppointments(shopId); // Listen to realtime updates

  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [selectedBarber, setSelectedBarber] = useState<string>('all');

  const startTarget = viewMode === 'day' ? new Date(selectedDate + 'T00:00:00') : getStartOfWeek(new Date(selectedDate + 'T00:00:00'));
  const endTarget = viewMode === 'day' ? new Date(selectedDate + 'T23:59:59') : addDays(getStartOfWeek(new Date(selectedDate + 'T00:00:00')), 6);
  endTarget.setHours(23, 59, 59, 999);

  const startIso = startTarget.toISOString();
  const endIso = endTarget.toISOString();

  const { data: allAppointments = [], isLoading } = useAppointments(shopId, startIso, endIso);
  const { data: barbers = [] } = useBarbers(shopId);

  const finalizeMut = useFinalizeAppointment(shopId);
  const cancelMut = useCancelAppointment(shopId);
  const statusMut = useUpdateAppointmentStatus(shopId);

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [drawerAppt, setDrawerAppt] = useState<AppointmentWithDetails | null>(null);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [finalizeTarget, setFinalizeTarget] = useState<AppointmentWithDetails | null>(null);
  const [finalPriceStr, setFinalPriceStr] = useState<string>('');
  const [priceWarning, setPriceWarning] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);

  const filteredAppointments = allAppointments.filter(a => {
    if (selectedBarber !== 'all' && a.barber_id !== selectedBarber) return false;
    return true;
  });

  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      await cancelMut.mutateAsync(cancelTarget);
      showToast('Agendamento cancelado.');
      if (drawerAppt?.id === cancelTarget) setDrawerAppt(prev => prev ? { ...prev, status: 'canceled' } : null);
    } catch (e: any) { showToast(e.message ?? 'Erro ao cancelar', 'error'); }
    setCancelTarget(null);
  };

  const handleFinalize = async () => {
    if (!finalizeTarget) return;
    try {
      let price = parseFloat(finalPriceStr.replace(',', '.'));
      if (isNaN(price)) price = finalizeTarget.total_price;
      
      if (price < 0.01) {
        showToast('O valor mínimo deve ser R$ 0,01', 'error');
        return;
      }
      
      await finalizeMut.mutateAsync({ id: finalizeTarget.id, finalPrice: price });
      showToast('Atendimento finalizado!');
      if (drawerAppt?.id === finalizeTarget.id) {
        setDrawerAppt(prev => prev ? { ...prev, status: 'completed', total_price: price } : null);
      }
    } catch (e: any) { showToast(e.message ?? 'Erro ao finalizar', 'error'); }
    setFinalizeTarget(null);
  };
  
  const handlePriceChange = (val: string) => {
    setFinalPriceStr(val);
    if (!finalizeTarget) return;
    
    const price = parseFloat(val.replace(',', '.'));
    if (!isNaN(price) && finalizeTarget.total_price > 0) {
      const discount = 1 - (price / finalizeTarget.total_price);
      if (discount > 0.5) {
        setPriceWarning('Aviso: O valor está com mais de 50% de desconto.');
      } else if (price > finalizeTarget.total_price * 2) {
        setPriceWarning('Aviso: O valor é mais que o dobro do original.');
      } else {
        setPriceWarning(null);
      }
    } else {
      setPriceWarning(null);
    }
  };

  const handleConfirmStatus = async () => {
    if (!confirmTarget) return;
    try {
      await statusMut.mutateAsync({ id: confirmTarget, status: 'confirmed' as 'confirmed' });
      showToast('Atendimento confirmado!');
      if (drawerAppt?.id === confirmTarget) setDrawerAppt(prev => prev ? { ...prev, status: 'confirmed' as 'confirmed' } : null);
    } catch (e: any) { showToast(e.message ?? 'Erro ao confirmar', 'error'); }
    setConfirmTarget(null);
  };

  // Nav Helpers
  const goPrev = () => setSelectedDate(formatDate(addDays(new Date(selectedDate + 'T12:00:00'), viewMode === 'day' ? -1 : -7)));
  const goNext = () => setSelectedDate(formatDate(addDays(new Date(selectedDate + 'T12:00:00'), viewMode === 'day' ? 1 : 7)));
  const goToday = () => setSelectedDate(formatDate(new Date()));

  // Render Daily Timeline
  const renderDailyView = () => (
    <div className="space-y-3 pb-8">
      {filteredAppointments.length === 0 ? (
        <EmptyState icon={<Clock className="w-6 h-6" />} title="Sem agendamentos" description="Não há agendamentos para este dia." />
      ) : (
        filteredAppointments.map((appt, i) => (
          <motion.div key={appt.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            onClick={() => setDrawerAppt(appt)}
            className="bg-[#111111] border border-white/6 rounded-xl p-4 flex items-center gap-4 hover:border-white/15 hover:bg-white/[0.02] transition-all cursor-pointer group">
            <div className="flex-shrink-0 text-center w-14">
              <p className="text-[15px] font-bold text-white group-hover:text-[#D4AF37] transition-colors">{formatTime(appt.start_time)}</p>
              <p className="text-[10px] text-white/25 mt-0.5">{formatTime(appt.end_time)}</p>
            </div>
            <div className="w-px h-10 bg-white/10 flex-shrink-0" />
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border border-white/10" style={{ backgroundColor: appt.barber?.color ? `${appt.barber.color}20` : '#D4AF3720', borderColor: appt.barber?.color ? `${appt.barber.color}40` : '#D4AF3740' }}>
              <span className="text-[13px] font-bold" style={{ color: appt.barber?.color ?? '#D4AF37' }}>{appt.barber?.name.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-[14px] font-bold text-white truncate">{appt.customer?.name}</p>
                <StatusBadge status={appt.status} small />
              </div>
              <p className="text-[12px] text-white/40 mt-0.5 truncate">{appt.service?.name} · {appt.barber?.name}</p>
            </div>
            <div className="flex-shrink-0 text-right hidden sm:block px-4">
              <p className="text-[14px] font-bold text-[#D4AF37]">R$ {appt.total_price.toFixed(0)}</p>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );

  // Render Weekly View
  const renderWeeklyView = () => {
    const days = Array.from({ length: 7 }, (_, i) => addDays(startTarget, i));
    const hours = Array.from({ length: 11 }, (_, i) => i + 9); // 9h às 19h

    return (
      <div className="bg-[#111] border border-white/6 rounded-2xl overflow-hidden flex flex-col h-[600px]">
        {/* Header Days */}
        <div className="grid grid-cols-8 border-b border-white/6 bg-white/5 flex-shrink-0">
          <div className="border-r border-white/6 p-2 flex items-center justify-center">
            <Clock className="w-4 h-4 text-white/30" />
          </div>
          {days.map((d, i) => {
            const isToday = formatDate(d) === formatDate(new Date());
            return (
              <div key={i} className={`p-3 text-center border-r border-white/6 last:border-0 ${isToday ? 'bg-[#D4AF37]/10' : ''}`}>
                <p className="text-[10px] uppercase font-bold text-white/40">{d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</p>
                <p className={`text-[15px] font-bold mt-0.5 ${isToday ? 'text-[#D4AF37]' : 'text-white'}`}>{d.getDate()}</p>
              </div>
            );
          })}
        </div>

        {/* Scrollable Grid */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none relative">
          <div className="grid grid-cols-8 min-h-full">
            {/* Time labels column */}
            <div className="border-r border-white/6 flex flex-col">
              {hours.map(h => (
                <div key={h} className="h-16 border-b border-white/6 flex justify-center pt-2">
                  <span className="text-[11px] font-semibold text-white/30">{String(h).padStart(2, '0')}:00</span>
                </div>
              ))}
            </div>
            
            {/* Days columns */}
            {days.map((d, i) => {
              const dayStr = formatDate(d);
              const dayAppts = filteredAppointments.filter(a => a.start_time.startsWith(dayStr));

              return (
                <div key={i} className="border-r border-white/6 last:border-0 relative">
                  {hours.map(h => (
                    <div key={h} className="h-16 border-b border-white/6/50" />
                  ))}

                  {/* Absolute positioned appointments */}
                  {dayAppts.map(appt => {
                    const sDate = new Date(appt.start_time);
                    const eDate = new Date(appt.end_time);
                    const startMins = (sDate.getHours() - 9) * 60 + sDate.getMinutes();
                    const duration = (eDate.getTime() - sDate.getTime()) / 60000;
                    
                    const top = (startMins / 60) * 64; // 4rem = 64px
                    const height = (duration / 60) * 64;

                    // Exclude if out of bounds (before 9am)
                    if (startMins < 0) return null;

                    return (
                      <div key={appt.id} onClick={() => setDrawerAppt(appt)}
                        className="absolute inset-x-1 rounded-md p-1.5 overflow-hidden text-left cursor-pointer border hover:z-10 transition-colors"
                        style={{
                          top: `${top}px`, height: `${height}px`,
                          backgroundColor: appt.barber?.color ? `${appt.barber.color}25` : '#D4AF3725',
                          borderColor: appt.barber?.color ? `${appt.barber.color}40` : '#D4AF3740'
                        }}
                      >
                        <p className="text-[10px] font-bold text-white truncate leading-tight">{appt.customer?.name}</p>
                        {height > 35 && <p className="text-[9px] text-white/60 truncate leading-tight">{formatTime(appt.start_time)} - {appt.service?.name}</p>}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto flex h-full">
      <AnimatePresence>{toast && <Toast message={toast.msg} type={toast.type} />}</AnimatePresence>

      <div className="flex-1 space-y-6">
        {/* Nav & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-white font-bold text-xl min-w-[200px]">
              {viewMode === 'day' ? displayDate(selectedDate) : `Semana de ${displayDate(formatDate(startTarget)).split(' de ')[0]} a ${displayDate(formatDate(endTarget)).split(' de ')[0]}`}
            </h2>
            <div className="flex gap-1 bg-[#111] p-1 rounded-xl border border-white/10">
              <button onClick={() => setViewMode('day')} className={`px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer flex items-center gap-2 ${viewMode === 'day' ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20' : 'text-white/40 hover:text-white'}`}>
                <List className="w-3.5 h-3.5" /> Dia
              </button>
              <button onClick={() => setViewMode('week')} className={`px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer flex items-center gap-2 ${viewMode === 'week' ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20' : 'text-white/40 hover:text-white'}`}>
                <LayoutGrid className="w-3.5 h-3.5" /> Semana
              </button>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button onClick={goPrev} className="w-9 h-9 rounded-xl bg-white/6 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={goToday} className="px-4 h-9 rounded-xl bg-white/6 text-[12px] font-bold text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer uppercase tracking-wider">Hoje</button>
            <button onClick={goNext} className="w-9 h-9 rounded-xl bg-white/6 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          <button onClick={() => setSelectedBarber('all')} className={`flex-shrink-0 px-4 py-2 rounded-xl text-[12px] font-bold transition-all cursor-pointer uppercase tracking-wider ${selectedBarber === 'all' ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30' : 'bg-[#111] border border-white/6 text-white/40 hover:text-white hover:bg-white/5'}`}>
            Todos os Barbeiros
          </button>
          {barbers.map(b => (
            <button key={b.id} onClick={() => setSelectedBarber(b.id)} className={`flex-shrink-0 px-4 py-2 rounded-xl text-[12px] font-bold transition-all cursor-pointer uppercase tracking-wider flex items-center gap-2 ${selectedBarber === b.id ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30' : 'bg-[#111] border border-white/6 text-white/40 hover:text-white hover:bg-white/5'}`}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.color }} />
              {b.name}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-24"><div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" /></div>
        ) : viewMode === 'day' ? renderDailyView() : renderWeeklyView()}
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {drawerAppt && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawerAppt(null)} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-[#0A0A0A] border-l border-white/10 shadow-2xl overflow-y-auto flex flex-col">
              
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#111]">
                <h2 className="text-[16px] font-bold text-white flex items-center gap-2"><Calendar className="w-4 h-4 text-[#D4AF37]" /> Detalhes do Agendamento</h2>
                <button onClick={() => setDrawerAppt(null)} className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
              </div>

              <div className="flex-1 p-6 space-y-8">
                <div className="flex items-center justify-between">
                  <StatusBadge status={drawerAppt.status} />
                  <p className="text-[12px] text-white/40 font-mono">ID: {drawerAppt.id.slice(0, 8)}</p>
                </div>

                <div className="bg-[#111] border border-white/6 rounded-2xl p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0"><User className="w-5 h-5 text-white/50" /></div>
                    <div className="flex-1">
                      <p className="text-[15px] font-bold text-white">{drawerAppt.customer?.name}</p>
                      <p className="text-[12px] text-white/40 mt-0.5">{drawerAppt.customer?.phone}</p>
                    </div>
                    <a href={`https://wa.me/${drawerAppt.customer?.phone?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer"><MessageCircle className="w-5 h-5" /></a>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-4 text-[11px] text-white/40">
                    <p><strong>{drawerAppt.customer?.total_visits}</strong> visitas ao total</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-white/30">Resumo</h3>
                  <div className="bg-[#111] border border-white/6 rounded-2xl p-1 divide-y divide-white/5">
                    <div className="flex items-center gap-3 p-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/50"><Scissors className="w-4 h-4" /></div>
                      <div className="flex-1"><p className="text-[10px] text-white/40">Serviço</p><p className="text-[13px] font-semibold text-white">{drawerAppt.service?.name}</p></div>
                    </div>
                    <div className="flex items-center gap-3 p-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/50"><User className="w-4 h-4" /></div>
                      <div className="flex-1"><p className="text-[10px] text-white/40">Profissional</p><p className="text-[13px] font-semibold text-white">{drawerAppt.barber?.name}</p></div>
                    </div>
                    <div className="flex items-center gap-3 p-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/50"><Clock className="w-4 h-4" /></div>
                      <div className="flex-1"><p className="text-[10px] text-white/40">Data e Hora</p><p className="text-[13px] font-semibold text-white">{displayDate(formatDate(new Date(drawerAppt.start_time)))} às {formatTime(drawerAppt.start_time)}</p></div>
                    </div>
                    <div className="flex items-center gap-3 p-3">
                      <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]"><DollarSign className="w-4 h-4" /></div>
                      <div className="flex-1"><p className="text-[10px] text-white/40">Valor</p><p className="text-[15px] font-bold text-[#D4AF37]">R$ {drawerAppt.total_price.toFixed(2)}</p></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ações */}
              {(drawerAppt.status === 'scheduled' || drawerAppt.status === 'confirmed') && (
                <div className="p-6 border-t border-white/10 bg-[#111] space-y-3">
                  {drawerAppt.status === 'scheduled' && (
                    <button onClick={() => setConfirmTarget(drawerAppt.id)} className="w-full py-3.5 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 font-bold text-[13px] tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer">
                      <CheckCircle className="w-4 h-4" /> Confirmar Presença
                    </button>
                  )}
                  <button onClick={() => {
                    setFinalizeTarget(drawerAppt);
                    setFinalPriceStr(drawerAppt.total_price.toFixed(2));
                  }} className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-[13px] tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20">
                    <CheckCircle className="w-5 h-5" /> Finalizar Atendimento
                  </button>
                  <button onClick={() => setCancelTarget(drawerAppt.id)} className="w-full py-3.5 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 font-bold text-[13px] tracking-widest uppercase transition-all cursor-pointer">
                    Cancelar / Não Compareceu
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Dialogs */}
      <ConfirmDialog isOpen={!!cancelTarget} title="Cancelar Agendamento" message="Tem certeza que deseja cancelar? O horário ficará livre novamente." confirmLabel="Sim, Cancelar" danger onConfirm={handleCancel} onCancel={() => setCancelTarget(null)} />
      <ConfirmDialog isOpen={!!confirmTarget} title="Confirmar Presença" message="Marcar este agendamento como confirmado?" confirmLabel="Confirmar" onConfirm={handleConfirmStatus} onCancel={() => setConfirmTarget(null)} />
      
      {/* Finalize Dialog Custom */}
      <AnimatePresence>
        {finalizeTarget && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFinalizeTarget(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-sm bg-[#111] border border-white/10 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-2">Finalizar Atendimento</h3>
              <p className="text-sm text-white/50 mb-6">Confirme o valor final cobrado do cliente.</p>
              
              <div className="mb-6">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-white/30 mb-2">Valor Final (R$)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={finalPriceStr}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white font-bold text-lg focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                  />
                </div>
                {priceWarning && <p className="text-amber-400 text-[11px] mt-2 font-semibold">{priceWarning}</p>}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setFinalizeTarget(null)} className="flex-1 py-3 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 font-bold text-[13px] transition-all">
                  Voltar
                </button>
                <button onClick={handleFinalize} className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-[13px] shadow-lg shadow-emerald-500/20 transition-all">
                  Finalizar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
