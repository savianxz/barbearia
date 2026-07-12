import { useState, useCallback } from 'react';
import type { Barber, Service } from '../types/scheduling';
import { appointmentService } from '../services/appointmentService';
import { availabilityService } from '../services/availabilityService';

export type BookingStep = 1 | 2 | 3 | 4 | 5 | 6;

export interface BookingState {
  isOpen: boolean;
  step: BookingStep;
  barber: Barber | 'first-available' | null;
  service: Service | null;
  date: string | null;       // Format YYYY-MM-DD
  time: string | null;       // Format HH:MM
  name: string;
  whatsapp: string;
  email: string;
  notes: string;
  wantsReminders: boolean;
  wantsPromotions: boolean;
  confirmationCode: string | null;
}

const initialBookingState: Omit<BookingState, 'isOpen'> = {
  step: 1,
  barber: null,
  service: null,
  date: null,
  time: null,
  name: '',
  whatsapp: '',
  email: '',
  notes: '',
  wantsReminders: true,
  wantsPromotions: false,
  confirmationCode: null,
};

export const useBooking = (shopId?: string) => {
  const [isOpen, setIsOpen] = useState(false);
  const [booking, setBooking] = useState<Omit<BookingState, 'isOpen'>>(initialBookingState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [validationReason, setValidationReason] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any>(null);

  const openBooking = useCallback((initialBarber?: Barber | 'first-available', initialService?: Service) => {
    setBooking({
      ...initialBookingState,
      barber: initialBarber || null,
      service: initialService || null,
      step: initialBarber ? 2 : 1,
    });
    setSubmitError(null);
    setValidationReason(null);
    setSuggestions(null);
    setIsOpen(true);
  }, []);

  const closeBooking = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => {
      setBooking(initialBookingState);
      setIsSubmitting(false);
      setSubmitError(null);
      setValidationReason(null);
      setSuggestions(null);
    }, 300);
  }, []);

  const selectBarber = useCallback((barber: Barber | 'first-available') => {
    setBooking(prev => ({ ...prev, barber, date: null, time: null, step: 2 }));
    setValidationReason(null); setSuggestions(null);
  }, []);

  const selectService = useCallback((service: Service) => {
    setBooking(prev => ({ ...prev, service, date: null, time: null, step: 3 }));
    setValidationReason(null); setSuggestions(null);
  }, []);

  const selectDate = useCallback((dateStr: string) => {
    setBooking(prev => ({ ...prev, date: dateStr, time: null }));
    setValidationReason(null); setSuggestions(null);
  }, []);

  const selectTime = useCallback((timeStr: string) => {
    setBooking(prev => ({ ...prev, time: timeStr }));
    setValidationReason(null); setSuggestions(null);
  }, []);

  const setCustomerDetails = useCallback((details: { name: string; whatsapp: string; email?: string; notes?: string; wantsReminders: boolean; wantsPromotions: boolean; }) => {
    setBooking(prev => ({ ...prev, name: details.name, whatsapp: details.whatsapp, email: details.email || '', notes: details.notes || '', wantsReminders: details.wantsReminders, wantsPromotions: details.wantsPromotions }));
  }, []);

  const validateCustomTime = useCallback(async (timeStr: string): Promise<string | null> => {
    if (!booking.barber || !booking.service || !booking.date || !shopId) return 'Dados insuficientes para validar o horário.';

    const barberId = booking.barber === 'first-available' ? 'first-available' : (booking.barber as Barber).id;
    const startIso = new Date(`${booking.date}T${timeStr}:00`).toISOString();
    
    const [h, m] = timeStr.split(':').map(Number);
    const end = new Date(new Date(`${booking.date}T00:00:00`).setHours(h, m + booking.service.duration_minutes));
    const endIso = end.toISOString();

    try {
      const isAvailable = await availabilityService.checkAvailability(barberId, startIso, endIso);
      if (!isAvailable) return 'Horário indisponível.';
      return null;
    } catch (e: any) {
      return e.message;
    }
  }, [booking.barber, booking.service, booking.date, shopId]);

  const nextStep = useCallback(() => {
    setBooking(prev => {
      if (prev.step === 1 && !prev.barber) return prev;
      if (prev.step === 2 && !prev.service) return prev;
      if (prev.step === 3 && !prev.date) return prev;
      if (prev.step === 4 && !prev.time) return prev;
      return { ...prev, step: (prev.step + 1) as BookingStep };
    });
  }, []);

  const prevStep = useCallback(() => {
    setBooking(prev => {
      if (prev.step === 1) return prev;
      return { ...prev, step: (prev.step - 1) as BookingStep };
    });
  }, []);

  const submitBooking = useCallback(async (customerDetails: { name: string; whatsapp: string; email?: string; notes?: string; wantsReminders: boolean; wantsPromotions: boolean; }): Promise<boolean> => {
    if (!booking.barber || !booking.service || !booking.date || !booking.time || !shopId) return false;

    setIsSubmitting(true);
    setSubmitError(null);

    const barberId = booking.barber === 'first-available' ? 'first-available' : (booking.barber as Barber).id;
    
    // Calcula ISOs
    const startIso = new Date(`${booking.date}T${booking.time}:00`).toISOString();
    const [h, m] = booking.time.split(':').map(Number);
    const end = new Date(new Date(`${booking.date}T00:00:00`).setHours(h, m + booking.service.duration_minutes));
    const endIso = end.toISOString();

    const res = await appointmentService.createAppointment({
      shop_id: shopId,
      customer_name: customerDetails.name,
      customer_phone: customerDetails.whatsapp,
      barber_id: barberId,
      service_id: booking.service.id,
      start_time: startIso,
      end_time: endIso,
      total_price: booking.service.price,
    });

    setIsSubmitting(false);

    if (res.data) {
      setBooking(prev => ({
        ...prev,
        ...customerDetails,
        email: customerDetails.email || '',
        notes: customerDetails.notes || '',
        confirmationCode: res.data!.id.slice(0, 8),
        step: 6,
      }));
      return true;
    }

    setSubmitError(res.error || 'Erro ao processar agendamento.');
    return false;
  }, [booking, shopId]);

  return {
    isOpen, isSubmitting, submitError, validationReason, suggestions,
    ...booking,
    openBooking, closeBooking, selectBarber, selectService, selectDate, selectTime, setCustomerDetails,
    nextStep, prevStep, submitBooking, validateCustomTime,
  };
};
