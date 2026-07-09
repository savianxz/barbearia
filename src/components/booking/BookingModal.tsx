import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ChevronLeft, ChevronRight, User, Check, Sparkles, 
  Phone, FileText, AlertCircle 
} from 'lucide-react';
import { shop, getAvailableTimeSlots, type Barber, type Service } from '../../data/mockData';
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
  phone: string;
  notes: string;
  agreedToTerms: boolean;
  isSubmitting: boolean;
  selectBarber: (barber: Barber | 'first-available') => void;
  selectService: (service: Service) => void;
  selectDate: (date: string) => void;
  selectTime: (time: string) => void;
  setCustomerDetails: (details: { name: string; phone: string; notes?: string; agreedToTerms: boolean }) => void;
  prevStep: () => void;
  nextStep: () => void;
  submitBooking: () => Promise<boolean>;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  step,
  barber,
  service,
  date,
  time,
  name,
  phone,
  notes,
  agreedToTerms,
  isSubmitting,
  selectBarber,
  selectService,
  selectDate,
  selectTime,
  setCustomerDetails,
  prevStep,
  submitBooking
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Form local states for step 5
  const [formName, setFormName] = useState(name);
  const [formPhone, setFormPhone] = useState(phone);
  const [formNotes, setFormNotes] = useState(notes);
  const [formAgreed, setFormAgreed] = useState(agreedToTerms);
  const [formError, setFormError] = useState('');

  // Sync local states if the props change (e.g. on reset)
  useEffect(() => {
    if (isOpen) {
      setFormName(name);
      setFormPhone(phone);
      setFormNotes(notes);
      setFormAgreed(agreedToTerms);
      setFormError('');
    }
  }, [isOpen, name, phone, notes, agreedToTerms]);

  // Phone Masking: (XX) XXXXX-XXXX
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.substring(0, 11);
    
    if (value.length > 6) {
      value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7)}`;
    } else if (value.length > 2) {
      value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }
    setFormPhone(value);
    setFormError('');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Por favor, informe seu nome completo.');
      return;
    }
    if (formPhone.replace(/\D/g, '').length < 10) {
      setFormError('Por favor, informe um telefone de contato válido.');
      return;
    }
    if (!formAgreed) {
      setFormError('Você precisa concordar com os termos de comparecimento.');
      return;
    }

    setCustomerDetails({
      name: formName,
      phone: formPhone,
      notes: formNotes,
      agreedToTerms: formAgreed
    });

    // We call submitBooking via next tick to ensure setCustomerDetails state is flushed.
    // However, since we pass form values directly, we will construct submission inside our hook.
    // To solve state lag, we can call setCustomerDetails and then immediately trigger submit.
    // Let's call submitBooking directly and let the hook handle it since we synchronized.
  };

  useEffect(() => {
    // Whenever our local details are updated and valid, and we are on step 5, and the user triggers submission:
    if (step === 5 && name === formName && phone === formPhone && agreedToTerms === formAgreed && name && phone && agreedToTerms && isSubmitting === false) {
      // Just waiting for the submit button click
    }
  }, [step, name, phone, agreedToTerms, formName, formPhone, formAgreed, isSubmitting]);

  const triggerSubmit = async () => {
    if (!formName.trim()) {
      setFormError('Por favor, informe seu nome completo.');
      return;
    }
    if (formPhone.replace(/\D/g, '').length < 10) {
      setFormError('Por favor, informe um telefone de contato válido.');
      return;
    }
    if (!formAgreed) {
      setFormError('Você precisa concordar com os termos de comparecimento.');
      return;
    }

    // Update hook state
    setCustomerDetails({
      name: formName,
      phone: formPhone,
      notes: formNotes,
      agreedToTerms: formAgreed
    });

    // Wait a brief tick for react state update then execute submit
    setTimeout(async () => {
      await submitBooking();
    }, 50);
  };

  // Calendar Engine
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month]);
  const firstDayOfWeek = useMemo(() => new Date(year, month, 1).getDay(), [year, month]);

  const handlePrevMonth = () => {
    const today = new Date();
    if (year > today.getFullYear() || (year === today.getFullYear() && month > today.getMonth())) {
      setCurrentCalendarDate(new Date(year, month - 1, 1));
    }
  };

  const handleNextMonth = () => {
    setCurrentCalendarDate(new Date(year, month + 1, 1));
  };

  // Generate calendar days
  const calendarCells = useMemo(() => {
    const cells = [];
    // Empty cells for alignment
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push(null);
    }
    // Month days
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(year, month, d));
    }
    return cells;
  }, [daysInMonth, firstDayOfWeek, year, month]);

  // Format Date for readability
  const formattedSelectedDate = useMemo(() => {
    if (!date) return '';
    const d = new Date(date + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  }, [date]);

  // Time Slots categorization
  const availableSlotsList = useMemo(() => {
    if (!date) return [];
    const bId = barber === 'first-available' || !barber ? 'first-available' : barber.id;
    return getAvailableTimeSlots(bId, date);
  }, [barber, date]);

  const categorizedSlots = useMemo(() => {
    const morning: string[] = [];
    const afternoon: string[] = [];
    const evening: string[] = [];

    availableSlotsList.forEach(slot => {
      const hour = parseInt(slot.split(':')[0]);
      if (hour < 12) {
        morning.push(slot);
      } else if (hour < 18) {
        afternoon.push(slot);
      } else {
        evening.push(slot);
      }
    });

    return { morning, afternoon, evening };
  }, [availableSlotsList]);

  if (!isOpen) return null;

  // Slide transitions for steps
  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const stepTransition = { duration: 0.4, ease: "easeOut" } as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      {/* Backdrop close area */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-2xl bg-card-dark border border-border-premium shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh] z-10"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border-premium flex items-center justify-between bg-card-dark">
          <div className="flex items-center gap-3">
            {step > 1 && step < 6 && (
              <button
                onClick={prevStep}
                className="p-1.5 border border-border-premium hover:border-gold hover:text-gold transition-colors text-text-secondary"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-gold">Agendamento {shop.name}</span>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                {step === 1 && 'Escolha o Barbeiro'}
                {step === 2 && 'Escolha o Serviço'}
                {step === 3 && 'Escolha o Dia'}
                {step === 4 && 'Escolha o Horário'}
                {step === 5 && 'Suas Informações'}
                {step === 6 && 'Agendamento Confirmado'}
              </h3>
            </div>
          </div>
          
          {step < 6 && (
            <button
              onClick={onClose}
              className="p-1.5 border border-border-premium hover:border-white hover:text-white transition-colors text-text-secondary"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {step < 6 && (
          <div className="w-full h-1 bg-neutral-900 flex">
            {[1, 2, 3, 4, 5].map((i) => (
              <div 
                key={i} 
                className={`h-full flex-1 transition-all duration-500 ${
                  i <= step ? 'bg-gold' : 'bg-transparent'
                }`}
              />
            ))}
          </div>
        )}

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-grow bg-card-dark">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: BARBEIRO */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={stepTransition}
                className="flex flex-col gap-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {shop.barbers.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => selectBarber(b)}
                      className="group flex gap-4 p-4 text-left border border-border-premium bg-neutral-900 hover:border-gold/30 hover:bg-card-elevated transition-premium relative overflow-hidden"
                    >
                      <div className="w-16 h-16 bg-neutral-800 overflow-hidden flex-shrink-0">
                        <img src={b.image} alt={b.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <h4 className="font-display font-semibold text-white tracking-wide uppercase text-sm mb-1 group-hover:text-gold transition-colors">{b.name}</h4>
                        <span className="text-[10px] text-gold uppercase tracking-wider font-semibold mb-1">{b.role}</span>
                        <span className="text-[10px] text-text-secondary">{b.experience}</span>
                      </div>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="w-4 h-4 text-gold" />
                      </div>
                    </button>
                  ))}

                  {/* Option 4: Primeiro Horário Disponível */}
                  <button
                    onClick={() => selectBarber('first-available')}
                    className="group sm:col-span-2 flex items-center justify-between p-5 text-left border border-dashed border-gold/40 bg-gold/5 hover:border-gold hover:bg-gold/10 transition-premium"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 border border-dashed border-gold/30 flex items-center justify-center bg-black/40 text-gold">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-gold uppercase tracking-wider text-sm mb-0.5">Primeiro Horário Disponível</h4>
                        <p className="text-text-secondary text-xs font-light">Selecione esta opção para ver a maior disponibilidade de agenda da casa.</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gold" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: SERVIÇO */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={stepTransition}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-3">
                  {shop.services.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => selectService(s)}
                      className="group flex items-center justify-between p-4 border border-border-premium bg-neutral-900 hover:border-gold/30 hover:bg-card-elevated transition-premium text-left"
                    >
                      <div className="pr-4 max-w-[70%]">
                        <h4 className="font-semibold text-white tracking-wide text-xs uppercase group-hover:text-gold transition-colors duration-300">{s.name}</h4>
                        <p className="text-text-secondary text-[11px] font-light mt-1 line-clamp-1">{s.description}</p>
                      </div>
                      <div className="flex items-center gap-4 text-right flex-shrink-0">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-text-secondary uppercase tracking-widest font-semibold">Preço</span>
                          <span className="text-sm font-bold text-gold">R$ {s.price}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] text-text-secondary uppercase tracking-widest font-semibold">Tempo</span>
                          <span className="text-xs font-semibold text-white">{s.duration} min</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 3: CALENDÁRIO */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={stepTransition}
                className="flex flex-col gap-6"
              >
                {/* Calendar Card */}
                <div className="border border-border-premium p-6 bg-neutral-900">
                  {/* Calendar Nav */}
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="font-semibold text-white text-sm uppercase tracking-wider">
                      {monthNames[month]} {year}
                    </h4>
                    <div className="flex gap-2">
                      <button 
                        onClick={handlePrevMonth}
                        className="p-1 border border-border-premium hover:border-white text-text-secondary hover:text-white transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={handleNextMonth}
                        className="p-1 border border-border-premium hover:border-white text-text-secondary hover:text-white transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Calendar Weekdays Headers */}
                  <div className="grid grid-cols-7 gap-2 mb-3 text-center">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                      <span key={day} className="text-[10px] uppercase font-bold text-text-secondary tracking-widest">{day}</span>
                    ))}
                  </div>

                  {/* Calendar Days Grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {calendarCells.map((dayDate, idx) => {
                      if (!dayDate) return <div key={`empty-${idx}`} />;
                      
                      const dayNum = dayDate.getDate();
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      
                      // Check if day is Sunday
                      const isSunday = dayDate.getDay() === 0;
                      
                      // Check if in the past
                      const isPast = dayDate < today;
                      
                      const isDisabled = isPast || isSunday;
                      
                      // Format current date as YYYY-MM-DD
                      const dateStr = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;
                      
                      const isSelected = date === dateStr;

                      return (
                        <button
                          key={`day-${dayNum}`}
                          disabled={isDisabled}
                          onClick={() => selectDate(dateStr)}
                          className={`aspect-square text-xs font-semibold flex items-center justify-center transition-all ${
                            isDisabled 
                              ? 'text-neutral-700 cursor-not-allowed bg-transparent' 
                              : isSelected
                                ? 'bg-gold text-bg-dark font-bold'
                                : 'text-white bg-card-dark hover:border-gold hover:text-gold border border-border-premium'
                          }`}
                        >
                          {dayNum}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: HORÁRIO */}
            {step === 4 && (
              <motion.div
                key="step4"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={stepTransition}
                className="flex flex-col gap-6"
              >
                <div className="bg-neutral-900 border border-border-premium p-4 text-center">
                  <span className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold block mb-1">Data Selecionada</span>
                  <span className="text-sm font-semibold text-gold uppercase tracking-wider">{formattedSelectedDate}</span>
                </div>

                <div className="flex flex-col gap-6">
                  {/* Morning Slots */}
                  {categorizedSlots.morning.length > 0 && (
                    <div>
                      <h5 className="text-[10px] uppercase font-bold tracking-widest text-text-secondary mb-3 border-b border-border-premium/50 pb-1.5">Período da Manhã</h5>
                      <div className="grid grid-cols-4 gap-2.5">
                        {categorizedSlots.morning.map(slot => (
                          <button
                            key={slot}
                            onClick={() => selectTime(slot)}
                            className="py-3 border border-border-premium bg-card-dark hover:border-gold hover:bg-gold hover:text-bg-dark text-white font-semibold text-xs transition-premium"
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Afternoon Slots */}
                  {categorizedSlots.afternoon.length > 0 && (
                    <div>
                      <h5 className="text-[10px] uppercase font-bold tracking-widest text-text-secondary mb-3 border-b border-border-premium/50 pb-1.5">Período da Tarde</h5>
                      <div className="grid grid-cols-4 gap-2.5">
                        {categorizedSlots.afternoon.map(slot => (
                          <button
                            key={slot}
                            onClick={() => selectTime(slot)}
                            className="py-3 border border-border-premium bg-card-dark hover:border-gold hover:bg-gold hover:text-bg-dark text-white font-semibold text-xs transition-premium"
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Evening Slots */}
                  {categorizedSlots.evening.length > 0 && (
                    <div>
                      <h5 className="text-[10px] uppercase font-bold tracking-widest text-text-secondary mb-3 border-b border-border-premium/50 pb-1.5">Período da Noite</h5>
                      <div className="grid grid-cols-4 gap-2.5">
                        {categorizedSlots.evening.map(slot => (
                          <button
                            key={slot}
                            onClick={() => selectTime(slot)}
                            className="py-3 border border-border-premium bg-card-dark hover:border-gold hover:bg-gold hover:text-bg-dark text-white font-semibold text-xs transition-premium"
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {availableSlotsList.length === 0 && (
                    <div className="py-12 text-center text-text-secondary text-xs">
                      Não há horários disponíveis para esta data. Por favor, volte e escolha outro dia.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 5: FORMULÁRIO */}
            {step === 5 && (
              <motion.div
                key="step5"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={stepTransition}
                className="flex flex-col gap-6"
              >
                {/* Booking Summary Box */}
                <div className="border border-border-premium bg-neutral-900 p-5 flex flex-col gap-3">
                  <h4 className="text-[10px] uppercase font-bold tracking-widest text-gold border-b border-border-premium/50 pb-2">Resumo da Reserva</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-text-secondary uppercase tracking-widest font-semibold">Barbeiro</span>
                      <span className="text-white font-semibold">{barber === 'first-available' ? 'Primeiro Disponível' : barber?.name}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-text-secondary uppercase tracking-widest font-semibold">Serviço</span>
                      <span className="text-white font-semibold">{service?.name}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-text-secondary uppercase tracking-widest font-semibold">Data</span>
                      <span className="text-white font-semibold">{formattedSelectedDate}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-text-secondary uppercase tracking-widest font-semibold">Horário / Valor</span>
                      <span className="text-white font-semibold">{time}h • R$ {service?.price}</span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
                  {/* Name Input */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="name-input" className="text-[10px] uppercase font-bold tracking-widest text-text-secondary flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-gold" /> Nome Completo
                    </label>
                    <input
                      id="name-input"
                      type="text"
                      required
                      placeholder="Ex: Marcus Sterling"
                      value={formName}
                      onChange={(e) => {
                        setFormName(e.target.value);
                        setFormError('');
                      }}
                      className="w-full bg-neutral-900 border border-border-premium focus:border-gold focus:outline-none p-3.5 text-xs text-white placeholder-neutral-600 transition-premium"
                    />
                  </div>

                  {/* Phone Input */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="phone-input" className="text-[10px] uppercase font-bold tracking-widest text-text-secondary flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-gold" /> Telefone para Contato
                    </label>
                    <input
                      id="phone-input"
                      type="tel"
                      required
                      placeholder="Ex: (11) 99999-9999"
                      value={formPhone}
                      onChange={handlePhoneChange}
                      className="w-full bg-neutral-900 border border-border-premium focus:border-gold focus:outline-none p-3.5 text-xs text-white placeholder-neutral-600 transition-premium"
                    />
                  </div>

                  {/* Notes Input */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="notes-input" className="text-[10px] uppercase font-bold tracking-widest text-text-secondary flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-gold" /> Observações (Opcional)
                    </label>
                    <textarea
                      id="notes-input"
                      rows={2}
                      placeholder="Alguma restrição ou pedido especial?"
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      className="w-full bg-neutral-900 border border-border-premium focus:border-gold focus:outline-none p-3.5 text-xs text-white placeholder-neutral-600 transition-premium resize-none"
                    />
                  </div>

                  {/* Terms Checkbox */}
                  <label className="flex items-start gap-3 cursor-pointer mt-2 group select-none">
                    <input
                      type="checkbox"
                      checked={formAgreed}
                      onChange={(e) => {
                        setFormAgreed(e.target.checked);
                        setFormError('');
                      }}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 border flex items-center justify-center flex-shrink-0 transition-colors ${
                      formAgreed ? 'bg-gold border-gold text-bg-dark' : 'border-border-premium bg-transparent group-hover:border-gold'
                    }`}>
                      {formAgreed && <Check className="w-3.5 h-3.5 font-bold" />}
                    </div>
                    <span className="text-[10px] text-text-secondary leading-normal font-light">
                      Confirmo os dados do agendamento e me comprometo a comparecer no horário estipulado. Avisarei com no mínimo 2 horas de antecedência em caso de imprevistos.
                    </span>
                  </label>

                  {formError && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 bg-red-950/20 border border-red-500/20 text-red-400 text-xs font-semibold mt-2"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {formError}
                    </motion.div>
                  )}

                  {/* Confirm Button */}
                  <button
                    type="button"
                    onClick={triggerSubmit}
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gold hover:bg-gold-hover text-bg-dark font-bold text-xs tracking-widest uppercase transition-premium flex items-center justify-center gap-2 mt-6 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-bg-dark border-t-transparent rounded-full animate-spin" />
                        Processando Agendamento...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Confirmar Agendamento
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* STEP 6: TELA DE SUCESSO */}
            {step === 6 && (
              <motion.div
                key="step6"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={stepTransition}
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                {/* Elegant drawing Checkmark Circle */}
                <div className="relative mb-6">
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 150 }}
                    className="w-20 h-20 rounded-full border border-gold flex items-center justify-center bg-gold/5"
                  >
                    <motion.svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor" 
                      className="w-10 h-10 text-gold"
                    >
                      <motion.path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M5 13l4 4L19 7" 
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
                      />
                    </motion.svg>
                  </motion.div>
                  {/* Decorative particles */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <span className="absolute w-2 h-2 bg-gold/40 rounded-full animate-ping" />
                  </div>
                </div>

                <h2 className="font-display text-2xl font-bold uppercase tracking-wider text-white mb-2">Agendamento Realizado!</h2>
                <p className="text-text-secondary text-xs font-light max-w-sm mb-8 leading-relaxed">
                  Seu horário foi reservado com sucesso no nosso sistema. Enviamos um SMS com os detalhes de confirmação.
                </p>

                {/* Final Summary Card */}
                <div className="w-full max-w-md border border-border-premium bg-neutral-900 p-6 flex flex-col gap-4 text-left mb-8">
                  <div className="flex justify-between items-center border-b border-border-premium/50 pb-3">
                    <span className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">Protocolo</span>
                    <span className="text-xs font-mono font-bold text-white uppercase">VC-{Math.floor(Math.random() * 900000 + 100000)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-light">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-text-secondary uppercase tracking-widest font-semibold mb-0.5">Cliente</span>
                      <span className="text-white font-semibold">{name}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-text-secondary uppercase tracking-widest font-semibold mb-0.5">Barbeiro</span>
                      <span className="text-white font-semibold">{barber === 'first-available' ? 'Primeiro Disponível' : barber?.name}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-text-secondary uppercase tracking-widest font-semibold mb-0.5">Serviço</span>
                      <span className="text-white font-semibold">{service?.name}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-text-secondary uppercase tracking-widest font-semibold mb-0.5">Data & Hora</span>
                      <span className="text-white font-semibold text-gold uppercase">{formattedSelectedDate} • {time}h</span>
                    </div>
                  </div>
                </div>

                {/* Close/Return button */}
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-neutral-900 border border-border-premium hover:border-gold hover:text-gold text-white font-semibold text-xs tracking-widest uppercase transition-premium cursor-pointer"
                >
                  Voltar para o site
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
