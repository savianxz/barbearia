import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Check, Sparkles, AlertCircle, User, Smartphone, Mail, Clock, Scissors, CalendarDays, Star, MessageCircle, Shield, ArrowRight } from 'lucide-react';
import type { Barber, Service } from '../../types/scheduling';
import { availabilityService } from '../../services/availabilityService';
import type { BookingStep } from '../../hooks/useBooking';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  step: BookingStep;
  barber: Barber | 'first-available' | null;
  service: Service | null;
  date: string | null;
  time: string | null;
  name: string;
  whatsapp: string;
  email: string;
  notes: string;
  wantsReminders: boolean;
  wantsPromotions: boolean;
  confirmationCode: string | null;
  isSubmitting: boolean;
  submitError: string | null;
  selectBarber: (barber: Barber | 'first-available') => void;
  selectService: (service: Service) => void;
  selectDate: (date: string) => void;
  selectTime: (time: string) => void;
  setCustomerDetails: (details: {
    name: string;
    whatsapp: string;
    email?: string;
    notes?: string;
    wantsReminders: boolean;
    wantsPromotions: boolean;
  }) => void;
  prevStep: () => void;
  nextStep: () => void;
  submitBooking: (details: {
    name: string;
    whatsapp: string;
    email?: string;
    notes?: string;
    wantsReminders: boolean;
    wantsPromotions: boolean;
  }) => Promise<boolean>;
  validateCustomTime: (timeStr: string) => Promise<string | null>;
  validationReason: any | null;
  suggestions: any | null;
  barbers: Barber[];
  services: Service[];
  shopName: string;
  shopId: string;
}

// ── STEPPER CONFIG ───────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Barbeiro' },
  { id: 2, label: 'Serviço' },
  { id: 3, label: 'Data' },
  { id: 4, label: 'Horário' },
  { id: 5, label: 'Confirmar' },
];

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  step,
  barber,
  service,
  date,
  time,
  name,
  whatsapp,
  email,
  notes,
  wantsReminders,
  wantsPromotions,
  confirmationCode,
  isSubmitting,
  submitError,
  selectBarber,
  selectService,
  selectDate,
  selectTime,
  prevStep,
  nextStep,
  submitBooking,
  validateCustomTime,
  validationReason: _validationReason,
  suggestions,
  barbers,
  services,
  shopName,
  shopId,
}) => {
  // ── Body scroll lock ───────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // ── Step 5 local form state ────────────────────────────────────────────────
  const [formName, setFormName] = useState(name);
  const [formWhatsapp, setFormWhatsapp] = useState(whatsapp);
  const [formEmail, setFormEmail] = useState(email);
  const [formNotes, setFormNotes] = useState(notes);
  const [formReminders, setFormReminders] = useState(wantsReminders);
  const [formPromotions, setFormPromotions] = useState(wantsPromotions);
  const [formError, setFormError] = useState('');
  const [submitProgress, setSubmitProgress] = useState(0);
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFormName(name); setFormWhatsapp(whatsapp); setFormEmail(email);
      setFormNotes(notes); setFormReminders(wantsReminders);
      setFormPromotions(wantsPromotions); setFormError(''); setSubmitProgress(0);
    }
  }, [isOpen, name, whatsapp, email, notes, wantsReminders, wantsPromotions]);

  // ── WhatsApp mask ──────────────────────────────────────────────────────────
  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 6) v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
    else if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
    else if (v.length > 0) v = `(${v}`;
    setFormWhatsapp(v);
    setFormError('');
  };

  // ── Custom time input state and validation ───────────────────────────────
  const [customTime, setCustomTime] = useState('');
  const [customTimeError, setCustomTimeError] = useState<string | null>(null);
  const [validatingCustomTime, setValidatingCustomTime] = useState(false);

  // Sync customTime when time selection changes
  useEffect(() => {
    if (isOpen) {
      setCustomTime(time || '');
      setCustomTimeError(null);
    }
  }, [isOpen, time]);

  const handleCustomTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.slice(0, 4);

    let formatted = val;
    if (val.length > 2) {
      const hh = parseInt(val.slice(0, 2));
      const mm = parseInt(val.slice(2));

      // Limit hours to 0-23
      const validHH = Math.min(Math.max(hh, 0), 23);
      const strHH = String(validHH).padStart(2, '0');

      // Limit minutes to 0-59
      const validMM = Math.min(Math.max(mm, 0), 59);
      const strMM = String(validMM).padStart(2, '0');

      formatted = `${strHH}:${val.length === 3 ? val.slice(2) : strMM}`;
    }

    setCustomTime(formatted);
    setCustomTimeError(null);

    // If a full valid time (HH:MM) is typed, validate against the engine before selecting
    if (formatted.length === 5) {
      setValidatingCustomTime(true);
      validateCustomTime(formatted).then(err => {
        setValidatingCustomTime(false);
        if (err) {
          setCustomTimeError(err);
        } else {
          selectTime(formatted);
        }
      });
    }
  };

  // ── Ripple ─────────────────────────────────────────────────────────────────
  const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setTimeout(() => setRipple(null), 700);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleConfirm = async (e: React.MouseEvent<HTMLButtonElement>) => {
    handleRipple(e);
    if (!formName.trim()) { setFormError('Por favor, informe seu nome completo.'); return; }
    if (formWhatsapp.replace(/\D/g, '').length < 10) { setFormError('Informe um WhatsApp válido com DDD.'); return; }
    setSubmitProgress(0);
    const interval = setInterval(() => setSubmitProgress(p => p >= 90 ? 90 : p + 15), 150);
    const ok = await submitBooking({ name: formName, whatsapp: formWhatsapp, email: formEmail, notes: formNotes, wantsReminders: formReminders, wantsPromotions: formPromotions });
    clearInterval(interval);
    setSubmitProgress(100);
    if (!ok) setFormError(submitError || 'Ocorreu um erro. Verifique o horário e tente novamente.');
  };

  // ── Calendar ───────────────────────────────────────────────────────────────
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month]);
  const firstDayOfWeek = useMemo(() => new Date(year, month, 1).getDay(), [year, month]);

  const handlePrevMonth = () => {
    const today = new Date();
    if (year > today.getFullYear() || (year === today.getFullYear() && month > today.getMonth())) {
      setCurrentCalendarDate(new Date(year, month - 1, 1));
    }
  };
  const handleNextMonth = () => setCurrentCalendarDate(new Date(year, month + 1, 1));

  const calendarCells = useMemo(() => {
    const cells: (Date | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    return cells;
  }, [daysInMonth, firstDayOfWeek, year, month]);

  const formattedSelectedDate = useMemo(() => {
    if (!date) return '';
    const d = new Date(date + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  }, [date]);

  const [availableSlotsList, setAvailableSlotsList] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (!date) {
      setAvailableSlotsList([]);
      return;
    }
    const selectedDate = date;
    const bId = barber === 'first-available' || !barber ? 'first-available' : barber.id;
    const duration = service?.duration_minutes ?? 30;

    let active = true;
    async function loadSlots() {
      setLoadingSlots(true);
      try {
        const res = await availabilityService.getAvailableSlots(shopId, bId, duration, selectedDate);
        if (active) {
          setAvailableSlotsList(res);
        }
      } catch (err) {
        console.error('Erro ao carregar slots:', err);
      } finally {
        if (active) setLoadingSlots(false);
      }
    }

    loadSlots();
    return () => {
      active = false;
    };
  }, [barber, date, service, isOpen]);

  const categorizedSlots = useMemo(() => {
    const morning: string[] = [], afternoon: string[] = [], evening: string[] = [];
    availableSlotsList.forEach(slot => {
      const h = parseInt(slot.split(':')[0]);
      if (h < 12) morning.push(slot);
      else if (h < 18) afternoon.push(slot);
      else evening.push(slot);
    });
    return { morning, afternoon, evening };
  }, [availableSlotsList]);

  if (!isOpen) return null;

  const barberName = barber === 'first-available' ? 'Primeiro Disponível' : barber?.name ?? '';
  const barberImage = barber && barber !== 'first-available' ? barber.avatar_url : null;

  const stepVariants = {
    initial: { opacity: 0, x: 16 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -16 },
  };
  const stepTransition = { duration: 0.22, ease: 'easeOut' } as const;

  // ── STEP HEADER TEXT ───────────────────────────────────────────────────────
  const stepTitle = [
    '', 'Escolha o Barbeiro', 'Escolha o Serviço',
    'Escolha o Dia', 'Escolha o Horário', 'Só falta um passo ✨', 'Agendamento Confirmado',
  ][step] ?? '';

  // ── MINI SUMMARY BAR (steps 2-5) ─────────────────────────────────────────
  const showSummaryBar = step >= 2 && step <= 5;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={step < 6 ? onClose : undefined} />

      {/* ── Modal Sheet ── */}
      {/* Mobile: slides from bottom, full-width sheet. Desktop: centered card */}
      <motion.div
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 300 }}
        className={`
          relative w-full bg-card-dark border-t sm:border border-border-premium
          shadow-[0_-20px_60px_rgba(0,0,0,0.7)] sm:shadow-[0_40px_80px_rgba(0,0,0,0.85)]
          flex flex-col z-10
          max-h-[92dvh] sm:max-h-[90vh]
          sm:max-w-2xl sm:mx-auto sm:rounded-none
          ${step === 5 ? 'lg:max-w-4xl' : 'sm:max-w-2xl'}
        `}
      >
        {/* ── DRAG HANDLE (mobile only) ─── */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        {/* ── STEPPER (steps 1-5) ── */}
        {step < 6 && (
          <div className="px-4 sm:px-6 pt-2 pb-3 sm:pt-5 sm:pb-4 flex-shrink-0">
            {/* Step label row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {step > 1 && step < 6 && (
                  <button
                    onClick={prevStep}
                    className="tap-target text-text-secondary hover:text-white transition-colors -ml-1"
                    aria-label="Voltar"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-gold block">
                    {shopName} · Passo {step} de 5
                  </span>
                  <h3 className="text-sm md:text-base font-semibold uppercase tracking-wider text-white leading-tight">
                    {stepTitle}
                  </h3>
                </div>
              </div>
              {step < 6 && (
                <button
                  onClick={onClose}
                  className="tap-target text-text-secondary hover:text-white transition-colors flex-shrink-0"
                  aria-label="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Visual stepper dots */}
            <div className="flex items-center gap-1.5">
              {STEPS.map((s) => (
                <div key={s.id} className="flex items-center gap-1.5 flex-1">
                  <div className={`h-1.5 flex-1 transition-all duration-400 ${
                    s.id < step ? 'bg-gold' : s.id === step ? 'bg-gold' : 'bg-white/10'
                  }`} />
                </div>
              ))}
            </div>

            {/* Mini summary bar for steps 2-5 */}
            {showSummaryBar && (
              <div className="flex items-center gap-2 mt-3 overflow-x-auto scrollbar-none">
                {step >= 2 && barberName && (
                  <span className="flex-shrink-0 flex items-center gap-1 px-2 py-1 bg-neutral-900 border border-border-premium text-[10px] text-white font-medium">
                    <User className="w-3 h-3 text-gold" /> {barberName.split(' ')[0]}
                  </span>
                )}
                {step >= 3 && service && (
                  <span className="flex-shrink-0 flex items-center gap-1 px-2 py-1 bg-neutral-900 border border-border-premium text-[10px] text-white font-medium">
                    <Scissors className="w-3 h-3 text-gold" /> {service.name}
                  </span>
                )}
                {step >= 4 && date && (
                  <span className="flex-shrink-0 flex items-center gap-1 px-2 py-1 bg-neutral-900 border border-border-premium text-[10px] text-gold font-semibold capitalize">
                    <CalendarDays className="w-3 h-3" /> {formattedSelectedDate.split(',')[0]}
                  </span>
                )}
                {step >= 5 && time && (
                  <span className="flex-shrink-0 flex items-center gap-1 px-2 py-1 bg-gold/10 border border-gold/30 text-[10px] text-gold font-bold">
                    <Clock className="w-3 h-3" /> {time}h
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── SCROLLABLE CONTENT ── */}
        <div className="overflow-y-auto flex-grow overscroll-contain">
          <AnimatePresence mode="wait">

            {/* ═══ STEP 1: BARBEIRO ═══════════════════════════════════════ */}
            {step === 1 && (
              <motion.div key="s1" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={stepTransition}
                className="p-4 sm:p-6 flex flex-col gap-3">
                {barbers.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => selectBarber(b)}
                    className="group flex items-center gap-4 p-4 text-left border border-border-premium bg-neutral-900 hover:border-gold/30 active:scale-[0.99] transition-all duration-200 w-full"
                  >
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-neutral-800 overflow-hidden flex-shrink-0">
                       <img src={b.avatar_url ?? ''} alt={b.name} loading="lazy" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col flex-grow text-left min-w-0">
                      <h4 className="font-display font-semibold text-white tracking-wide uppercase text-sm group-hover:text-gold transition-colors">{b.name}</h4>
                      <span className="text-[10px] text-text-secondary mt-0.5 truncate">Barbeiro Profissional</span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Star className="w-3 h-3 text-gold fill-gold" />
                      <span className="text-xs font-semibold text-white">5.0</span>
                    </div>
                  </button>
                ))}

                {/* First Available */}
                <button
                  onClick={() => selectBarber('first-available')}
                  className="group flex items-center gap-4 p-4 text-left border border-dashed border-gold/40 bg-gold/5 hover:border-gold hover:bg-gold/10 active:scale-[0.99] transition-all duration-200 w-full"
                >
                  <div className="w-12 h-12 border border-dashed border-gold/30 flex items-center justify-center bg-black/40 text-gold flex-shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col flex-grow">
                    <h4 className="font-display font-bold text-gold uppercase tracking-wider text-sm">Primeiro Horário Disponível</h4>
                    <p className="text-text-secondary text-[11px] font-light">Maior disponibilidade de agenda</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gold flex-shrink-0" />
                </button>
              </motion.div>
            )}

            {/* ═══ STEP 2: SERVIÇO ════════════════════════════════════════ */}
            {step === 2 && (
              <motion.div key="s2" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={stepTransition}
                className="p-4 sm:p-6 flex flex-col gap-3">
                {services.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => selectService(s)}
                    className="group flex items-center justify-between p-4 border border-border-premium bg-neutral-900 hover:border-gold/30 active:scale-[0.99] transition-all duration-200 text-left w-full min-h-[64px]"
                  >
                    <div className="flex flex-col pr-4 min-w-0 flex-grow">
                      <h4 className="font-semibold text-white tracking-wide text-sm uppercase group-hover:text-gold transition-colors truncate">{s.name}</h4>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 text-right">
                      <div className="flex flex-col">
                        <span className="text-base font-bold text-gold">R${s.price}</span>
                        <span className="text-[10px] text-text-secondary">{s.duration_minutes}min</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gold/50 group-hover:text-gold transition-colors" />
                    </div>
                  </button>
                ))}
              </motion.div>
            )}

            {/* ═══ STEP 3: CALENDÁRIO ═════════════════════════════════════ */}
            {step === 3 && (
              <motion.div key="s3" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={stepTransition}
                className="p-4 sm:p-6 flex flex-col gap-4">
                <div className="border border-border-premium p-4 sm:p-6 bg-neutral-900">
                  {/* Month navigation */}
                  <div className="flex items-center justify-between mb-5">
                    <h4 className="font-semibold text-white text-sm uppercase tracking-wider">{monthNames[month]} {year}</h4>
                    <div className="flex gap-2">
                      <button onClick={handlePrevMonth} className="tap-target text-text-secondary hover:text-white transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                      <button onClick={handleNextMonth} className="tap-target text-text-secondary hover:text-white transition-colors"><ChevronRight className="w-5 h-5" /></button>
                    </div>
                  </div>

                  {/* Day-of-week headers */}
                  <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                    {['D','S','T','Q','Q','S','S'].map((d, i) => (
                      <span key={i} className="text-[10px] uppercase font-bold text-text-secondary">{d}</span>
                    ))}
                  </div>

                  {/* Calendar cells — min 44px for touch */}
                  <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                    {calendarCells.map((dayDate, idx) => {
                      if (!dayDate) return <div key={`e-${idx}`} />;
                      const today = new Date(); today.setHours(0, 0, 0, 0);
                      const isSunday = dayDate.getDay() === 0;
                      const isPast = dayDate < today;
                      const isDisabled = isPast || isSunday;
                      const dateStr = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;
                      const isSelected = date === dateStr;
                      return (
                        <button
                          key={`d-${dayDate.getDate()}`}
                          disabled={isDisabled}
                          onClick={() => selectDate(dateStr)}
                          className={`
                            min-h-[44px] text-sm font-semibold flex items-center justify-center transition-all duration-150 active:scale-95
                            ${isDisabled ? 'text-neutral-700 cursor-not-allowed' :
                              isSelected ? 'bg-gold text-bg-dark font-bold ring-2 ring-gold ring-offset-1 ring-offset-neutral-900' :
                              'text-white bg-card-dark hover:bg-gold/10 hover:text-gold border border-border-premium'}
                          `}
                        >
                          {dayDate.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Date confirm + proceed */}
                {date ? (
                  <motion.div key="date-confirm" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
                    <div className="flex items-center justify-between bg-neutral-900 border border-gold/30 px-4 py-3">
                      <div>
                        <span className="text-[9px] uppercase font-bold tracking-widest text-text-secondary block">Data selecionada</span>
                        <span className="text-sm font-semibold text-gold capitalize">{formattedSelectedDate}</span>
                      </div>
                      <Check className="w-4 h-4 text-gold" />
                    </div>
                    <button onClick={nextStep}
                      className="w-full min-h-[56px] bg-gold hover:bg-gold-hover text-bg-dark font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-200">
                      Ver Horários
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                ) : (
                  <p className="text-center text-xs text-text-secondary font-light">Toque em um dia para continuar</p>
                )}
              </motion.div>
            )}

            {/* ═══ STEP 4: HORÁRIO ════════════════════════════════════════ */}
            {step === 4 && (
              <motion.div key="s4" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={stepTransition}
                className="p-4 sm:p-6 flex flex-col gap-5">
                <div className="bg-neutral-900 border border-border-premium px-4 py-3 text-center">
                  <span className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold block mb-0.5">Data</span>
                  <span className="text-sm font-semibold text-gold uppercase tracking-wider capitalize">{formattedSelectedDate}</span>
                </div>

                {(['morning', 'afternoon', 'evening'] as const).map((period) => {
                  const slots = categorizedSlots[period];
                  if (!slots.length) return null;
                  const label = { morning: '☀️ Manhã', afternoon: '🌤 Tarde', evening: '🌙 Noite' }[period];
                  return (
                    <div key={period}>
                      <h5 className="text-[10px] uppercase font-bold tracking-widest text-text-secondary mb-3 border-b border-border-premium/40 pb-1.5">{label}</h5>
                      {/* 3 cols on mobile (wider tap targets), 4 on desktop */}
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {slots.map((slot) => {
                          const isSelected = time === slot;
                          return (
                            <button
                              key={slot}
                              onClick={() => selectTime(slot)}
                              className={`
                                min-h-[52px] border font-semibold text-sm transition-all duration-200 active:scale-95
                                ${isSelected
                                  ? 'bg-gold border-gold text-bg-dark font-bold ring-2 ring-gold ring-offset-1 ring-offset-neutral-900'
                                  : 'border-border-premium bg-card-dark hover:border-gold hover:bg-gold/10 hover:text-gold text-white'}
                              `}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {loadingSlots ? (
                  <div className="py-10 flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] uppercase font-bold tracking-widest text-gold animate-pulse">
                      Buscando horários...
                    </span>
                  </div>
                ) : availableSlotsList.length === 0 ? (
                  <div className="py-10 text-center text-text-secondary text-sm">
                    Sem horários disponíveis. Volte e escolha outro dia.
                  </div>
                ) : null}

                {/* ── Custom/Personalized time input section ── */}
                <div className="flex flex-col gap-2 border-t border-border-premium/50 pt-4 mt-2">
                  <label htmlFor="custom-time-input" className="text-[10px] uppercase font-bold tracking-widest text-text-secondary flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gold" /> Ou digite um horário personalizado (Ex: 12:20):
                  </label>
                  <div className="relative">
                    <input
                      id="custom-time-input"
                      type="text"
                      inputMode="numeric"
                      placeholder="HH:MM"
                      value={customTime}
                      onChange={handleCustomTimeChange}
                      className={`w-full bg-neutral-900 border focus:outline-none p-4 min-h-[52px] text-base text-white placeholder-neutral-600 transition-colors duration-200
                        ${customTimeError ? 'border-red-500/60 focus:border-red-500' : 'border-border-premium focus:border-gold'}`}
                    />
                    {validatingCustomTime && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                    )}
                    {!validatingCustomTime && time === customTime && customTime.length === 5 && !customTimeError && (
                      <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold" />
                    )}
                  </div>
                  {customTimeError && (
                    <div className="flex flex-col gap-3 text-[11px] mt-1.5">
                      <div className="flex items-center gap-2 text-red-400 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{customTimeError}</span>
                      </div>

                      {/* Suggestions list */}
                      {suggestions && (
                        <div className="bg-neutral-950 border border-neutral-800 p-3 flex flex-col gap-2.5 rounded-sm">
                          {/* Scenario 2: No more slots today */}
                          {suggestions.suggestedAlternativeTomorrow && (
                            <div className="flex flex-col gap-1.5">
                              <span className="text-text-secondary font-medium">Hoje não há mais horários disponíveis para este serviço.</span>
                              <div className="flex flex-wrap gap-2 items-center justify-between mt-1">
                                <span className="text-gold font-bold">Próximo disponível: {
                                  suggestions.suggestedAlternativeTomorrow.date === (() => {
                                    const tomorrow = new Date();
                                    tomorrow.setDate(tomorrow.getDate() + 1);
                                    return tomorrow.toISOString().split('T')[0];
                                  })() ? 'Amanhã' : suggestions.suggestedAlternativeTomorrow.date.split('-').reverse().slice(0, 2).join('/')
                                } às {suggestions.suggestedAlternativeTomorrow.time}h</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (suggestions.suggestedAlternativeTomorrow) {
                                      selectDate(suggestions.suggestedAlternativeTomorrow.date);
                                      selectTime(suggestions.suggestedAlternativeTomorrow.time);
                                      setCustomTime(suggestions.suggestedAlternativeTomorrow.time);
                                    }
                                  }}
                                  className="px-2.5 py-1.5 bg-gold hover:bg-gold-hover text-bg-dark font-bold text-[9px] uppercase tracking-wider transition-colors duration-200 cursor-pointer active:scale-95"
                                >
                                  Agendar amanhã às {suggestions.suggestedAlternativeTomorrow.time}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Scenario 1: Slot today */}
                          {!suggestions.suggestedAlternativeTomorrow && suggestions.suggestedAlternativeToday && (
                            <div className="flex flex-col gap-1.5">
                              <span className="text-text-secondary font-medium">Esse horário não está disponível.</span>
                              <div className="flex flex-wrap gap-2 items-center justify-between mt-1">
                                <span className="text-gold font-bold">Próximo horário disponível: {suggestions.suggestedAlternativeToday}h</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (suggestions.suggestedAlternativeToday) {
                                      selectTime(suggestions.suggestedAlternativeToday);
                                      setCustomTime(suggestions.suggestedAlternativeToday);
                                    }
                                  }}
                                  className="px-2.5 py-1.5 bg-gold hover:bg-gold-hover text-bg-dark font-bold text-[9px] uppercase tracking-wider transition-colors duration-200 cursor-pointer active:scale-95"
                                >
                                  Usar {suggestions.suggestedAlternativeToday}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Scenario 3: Multiple suggestions */}
                          {suggestions.nearbyAlternatives && suggestions.nearbyAlternatives.length > 0 && (
                            <div className="flex flex-col gap-1.5 border-t border-neutral-900 pt-2.5 mt-1">
                              <span className="text-text-secondary font-medium">Outras opções próximas:</span>
                              <div className="flex flex-wrap gap-2">
                                {suggestions.nearbyAlternatives.map((altTime: string) => (
                                  <button
                                    key={altTime}
                                    type="button"
                                    onClick={() => {
                                      selectTime(altTime);
                                      setCustomTime(altTime);
                                    }}
                                    className="px-2.5 py-1 bg-neutral-900 hover:bg-gold/10 hover:text-gold text-white font-semibold text-[10px] border border-border-premium transition-all duration-200 cursor-pointer"
                                  >
                                    {altTime}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Manual Time Selection Confirmation Section */}
                {time ? (
                  <motion.div key="time-confirm" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3 mt-2">
                    <div className="flex items-center justify-between bg-neutral-900 border border-gold/30 px-4 py-3">
                      <div>
                        <span className="text-[9px] uppercase font-bold tracking-widest text-text-secondary block">Horário selecionado</span>
                        <span className="text-sm font-semibold text-gold">{time}h</span>
                      </div>
                      <Check className="w-4 h-4 text-gold" />
                    </div>
                    <button onClick={nextStep}
                      className="w-full min-h-[56px] bg-gold hover:bg-gold-hover text-bg-dark font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-200">
                      Confirmar Horário
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                ) : (
                  <p className="text-center text-xs text-text-secondary font-light">Selecione ou digite um horário para continuar</p>
                )}
              </motion.div>
            )}

            {/* ═══ STEP 5: CONFIRMAÇÃO ════════════════════════════════════ */}
            {step === 5 && (
              <motion.div key="s5" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={stepTransition}
                className="flex flex-col">
                {/* Content is scrollable */}
                <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
                  <p className="text-text-secondary text-xs font-light tracking-wide">
                    Confirme seus dados para reservar. Nenhuma senha necessária.
                  </p>

                  {/* ── DESKTOP: 2 columns. MOBILE: 1 column (summary first, then form) ── */}
                  <div className="flex flex-col lg:grid lg:grid-cols-5 gap-6">

                    {/* MOBILE ORDER 1: Resumo do Agendamento */}
                    <div className="lg:col-span-2 lg:order-2">
                      <div className="border border-border-premium bg-neutral-900 p-4 sm:p-6 flex flex-col gap-4">
                        <div className="flex items-center gap-2 border-b border-border-premium pb-3">
                          <CalendarDays className="w-4 h-4 text-gold" />
                          <h4 className="text-xs uppercase font-bold tracking-widest text-white">Resumo</h4>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {/* Barber */}
                          <div className="flex items-center gap-2.5 col-span-2 sm:col-span-1">
                            {barberImage ? (
                              <img src={barberImage} alt={barberName} className="w-10 h-10 object-cover border border-border-premium flex-shrink-0" />
                            ) : (
                              <div className="w-10 h-10 bg-card-dark border border-border-premium flex items-center justify-center flex-shrink-0">
                                <Star className="w-4 h-4 text-gold" />
                              </div>
                            )}
                            <div>
                              <span className="text-[9px] uppercase tracking-widest text-text-secondary font-semibold flex items-center gap-1">Barbeiro</span>
                              <span className="text-sm font-semibold text-white">{barberName}</span>
                            </div>
                          </div>
                          {/* Service */}
                          <div className="flex items-center gap-2.5 col-span-2 sm:col-span-1">
                            <div className="w-10 h-10 bg-card-dark border border-border-premium flex items-center justify-center flex-shrink-0">
                              <Scissors className="w-4 h-4 text-gold" />
                            </div>
                            <div>
                              <span className="text-[9px] uppercase tracking-widest text-text-secondary font-semibold">Serviço</span>
                              <span className="text-sm font-semibold text-white block">{service?.name}</span>
                            </div>
                          </div>
                          {/* Date */}
                          <div>
                            <span className="text-[9px] uppercase tracking-widest text-text-secondary font-semibold flex items-center gap-1 mb-1"><CalendarDays className="w-3 h-3 text-gold" />Data</span>
                            <span className="text-sm font-semibold text-white block capitalize">{formattedSelectedDate.split(',').slice(0, 2).join(',')}</span>
                          </div>
                          {/* Time */}
                          <div>
                            <span className="text-[9px] uppercase tracking-widest text-text-secondary font-semibold flex items-center gap-1 mb-1"><Clock className="w-3 h-3 text-gold" />Horário</span>
                            <span className="text-xl font-bold text-gold">{time}h</span>
                          </div>
                        </div>

                        <div className="border-t border-border-premium pt-3 flex items-center justify-between">
                          <span className="text-[10px] uppercase text-text-secondary tracking-widest font-semibold">Valor do Serviço</span>
                          <span className="text-lg font-bold text-gold">R$ {service?.price}</span>
                        </div>
                      </div>
                    </div>

                    {/* MOBILE ORDER 2: Seus Dados */}
                    <div className="lg:col-span-3 lg:order-1 flex flex-col gap-5">
                      <div className="flex items-center gap-2 border-b border-border-premium pb-3">
                        <User className="w-4 h-4 text-gold" />
                        <h4 className="text-xs uppercase font-bold tracking-widest text-white">Seus Dados</h4>
                      </div>

                      {/* Name */}
                      <div className="flex flex-col gap-2">
                        <label htmlFor="bk-name" className="text-[10px] uppercase font-bold tracking-widest text-text-secondary flex items-center gap-1.5">
                          <User className="w-3 h-3 text-gold" /> Nome Completo *
                        </label>
                        <input id="bk-name" type="text" autoComplete="name" placeholder="Ex: João Silva"
                          value={formName} onChange={e => { setFormName(e.target.value); setFormError(''); }}
                          className="w-full bg-neutral-900 border border-border-premium focus:border-gold focus:outline-none p-4 min-h-[52px] text-base text-white placeholder-neutral-600 transition-colors duration-200" />
                      </div>

                      {/* WhatsApp */}
                      <div className="flex flex-col gap-2">
                        <label htmlFor="bk-whatsapp" className="text-[10px] uppercase font-bold tracking-widest text-text-secondary flex items-center gap-1.5">
                          <Smartphone className="w-3 h-3 text-gold" /> WhatsApp *
                        </label>
                        <input id="bk-whatsapp" type="tel" autoComplete="tel" placeholder="(19) 99999-9999"
                          value={formWhatsapp} onChange={handleWhatsappChange}
                          className="w-full bg-neutral-900 border border-border-premium focus:border-gold focus:outline-none p-4 min-h-[52px] text-base text-white placeholder-neutral-600 transition-colors duration-200" />
                      </div>

                      {/* Email */}
                      <div className="flex flex-col gap-2">
                        <label htmlFor="bk-email" className="text-[10px] uppercase font-bold tracking-widest text-text-secondary flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-gold" /> Email <span className="text-neutral-600 font-normal normal-case">(Opcional)</span>
                        </label>
                        <input id="bk-email" type="email" autoComplete="email" placeholder="joao@email.com"
                          value={formEmail} onChange={e => setFormEmail(e.target.value)}
                          className="w-full bg-neutral-900 border border-border-premium focus:border-gold focus:outline-none p-4 min-h-[52px] text-base text-white placeholder-neutral-600 transition-colors duration-200" />
                      </div>

                      {/* Checkboxes */}
                      <div className="flex flex-col gap-4 pt-1">
                        <label className="flex items-start gap-3 cursor-pointer group select-none">
                          <input type="checkbox" className="sr-only" checked={formReminders} onChange={e => setFormReminders(e.target.checked)} />
                          <div className={`w-5 h-5 border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${formReminders ? 'bg-gold border-gold text-bg-dark' : 'border-border-premium'}`}>
                            {formReminders && <Check className="w-3 h-3" />}
                          </div>
                          <span className="text-xs text-text-secondary leading-relaxed font-light">Quero receber lembretes do meu agendamento.</span>
                        </label>
                        <label className="flex items-start gap-3 cursor-pointer group select-none">
                          <input type="checkbox" className="sr-only" checked={formPromotions} onChange={e => setFormPromotions(e.target.checked)} />
                          <div className={`w-5 h-5 border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${formPromotions ? 'bg-gold border-gold text-bg-dark' : 'border-border-premium'}`}>
                            {formPromotions && <Check className="w-3 h-3" />}
                          </div>
                          <span className="text-xs text-text-secondary leading-relaxed font-light">Quero receber promoções e novidades da {shopName}.</span>
                        </label>
                      </div>

                      {/* Privacy */}
                      <div className="flex items-start gap-2 p-3 bg-neutral-900/60 border border-border-premium/40">
                        <Shield className="w-3.5 h-3.5 text-gold/70 flex-shrink-0 mt-0.5" />
                        <p className="text-[10px] text-neutral-500 leading-relaxed font-light">Seus dados são usados apenas para facilitar seus agendamentos.</p>
                      </div>

                      {/* Error */}
                      <AnimatePresence>
                        {formError && (
                          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="flex items-center gap-2 p-3 bg-red-950/20 border border-red-500/20 text-red-400 text-xs font-semibold">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {formError}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* ── STICKY CONFIRM BUTTON (bottom of modal) ── */}
                <div className="sticky bottom-0 bg-card-dark border-t border-border-premium p-4 sm:p-5 pb-safe flex-shrink-0 z-10">
                  <button
                    ref={btnRef}
                    disabled={isSubmitting}
                    onClick={handleConfirm}
                    className="relative w-full min-h-[56px] bg-gold hover:bg-gold-hover text-bg-dark font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2.5 overflow-hidden active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed group"
                  >
                    {ripple && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0.4 }} animate={{ scale: 8, opacity: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="absolute w-12 h-12 rounded-full bg-white/30 pointer-events-none"
                        style={{ left: ripple.x - 24, top: ripple.y - 24 }}
                      />
                    )}
                    {isSubmitting ? (
                      <>
                        <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-bg-dark border-t-transparent rounded-full" />
                        Reservando seu horário...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Confirmar Agendamento
                        <ArrowRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                      </>
                    )}
                  </button>

                  {/* Submit progress bar */}
                  {isSubmitting && (
                    <motion.div className="absolute bottom-0 left-0 h-[2px] bg-gold"
                      initial={{ width: '0%' }} animate={{ width: `${submitProgress}%` }}
                      transition={{ duration: 0.15 }} />
                  )}
                </div>
              </motion.div>
            )}

            {/* ═══ STEP 6: SUCESSO ════════════════════════════════════════ */}
            {step === 6 && (
              <motion.div key="s6" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={stepTransition}
                className="p-6 sm:p-8 flex flex-col items-center text-center">

                {/* Success icon */}
                <div className="relative mb-6">
                  <motion.div
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 14, stiffness: 130, delay: 0.1 }}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-gold/30 flex items-center justify-center bg-gold/5"
                  >
                    <motion.div
                      initial={{ scale: 0.3, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', damping: 10, stiffness: 160, delay: 0.2 }}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gold/15 border border-gold flex items-center justify-center"
                    >
                      <motion.svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-7 h-7 text-gold">
                        <motion.path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"
                          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.4, duration: 0.5 }} />
                      </motion.svg>
                    </motion.div>
                  </motion.div>
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                    className="absolute -top-1 -right-1 w-3 h-3 bg-gold rounded-full animate-ping" />
                </div>

                <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                  className="font-display text-xl sm:text-3xl font-bold uppercase tracking-wider text-white mb-2">
                  Agendamento Confirmado!
                </motion.h2>
                <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                  className="text-text-secondary text-sm font-light max-w-sm mb-6 leading-relaxed">
                  Seu horário foi reservado com sucesso.
                </motion.p>

                {/* Summary card */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
                  className="w-full max-w-sm border border-border-premium bg-neutral-900 p-5 flex flex-col gap-4 text-left mb-4">
                  {confirmationCode && (
                    <div className="flex justify-between items-center border-b border-border-premium pb-3">
                      <span className="text-[9px] uppercase tracking-widest text-text-secondary font-bold">Protocolo</span>
                      <span className="text-sm font-mono font-bold text-gold">{confirmationCode}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-text-secondary font-semibold mb-1 block">Barbeiro</span>
                      <span className="text-sm text-white font-semibold">{barberName}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-text-secondary font-semibold mb-1 block">Serviço</span>
                      <span className="text-sm text-white font-semibold">{service?.name}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-text-secondary font-semibold mb-1 block">Data</span>
                      <span className="text-sm text-white font-semibold capitalize">{formattedSelectedDate.split(',').slice(0,2).join(',')}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-text-secondary font-semibold mb-1 block">Horário</span>
                      <span className="text-xl font-bold text-gold">{time}h</span>
                    </div>
                  </div>
                </motion.div>

                {/* WhatsApp notice */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                  className="flex items-center gap-3 bg-green-950/20 border border-green-500/20 px-4 py-3 w-full max-w-sm mb-5">
                  <MessageCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <p className="text-green-400 text-xs font-light leading-relaxed">Em instantes você receberá uma confirmação no WhatsApp.</p>
                </motion.div>

                {/* Action buttons */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.95 }}
                  className="flex flex-col gap-3 w-full max-w-sm mb-6">
                  <button onClick={onClose}
                    className="w-full min-h-[56px] bg-gold hover:bg-gold-hover text-bg-dark font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-200">
                    <Check className="w-4 h-4" /> Perfeito, obrigado!
                  </button>
                  <button onClick={onClose}
                    className="w-full min-h-[52px] border border-border-premium hover:border-white/40 text-text-secondary hover:text-white font-semibold text-xs tracking-widest uppercase transition-all duration-200 active:scale-[0.98]">
                    Voltar ao Início
                  </button>
                </motion.div>

                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
                  className="text-neutral-700 text-[10px] font-light max-w-xs leading-relaxed">
                  Também criamos sua Área do Cliente para que seus próximos agendamentos sejam ainda mais rápidos.
                </motion.p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
