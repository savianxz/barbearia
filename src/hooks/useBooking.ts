import { useState, useCallback } from 'react';
import type { Barber, Service } from '../data/mockData';
import { processBooking } from '../services/bookingService';

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

export const useBooking = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [booking, setBooking] = useState<Omit<BookingState, 'isOpen'>>(initialBookingState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openBooking = useCallback((initialBarber?: Barber | 'first-available', initialService?: Service) => {
    setBooking({
      ...initialBookingState,
      barber: initialBarber || null,
      service: initialService || null,
      step: initialBarber ? 2 : 1,
    });
    setIsOpen(true);
  }, []);

  const closeBooking = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => {
      setBooking(initialBookingState);
      setIsSubmitting(false);
    }, 300);
  }, []);

  const selectBarber = useCallback((barber: Barber | 'first-available') => {
    setBooking(prev => ({
      ...prev,
      barber,
      date: null,
      time: null,
      step: 2,
    }));
  }, []);

  const selectService = useCallback((service: Service) => {
    setBooking(prev => ({
      ...prev,
      service,
      date: null,
      time: null,
      step: 3,
    }));
  }, []);

  const selectDate = useCallback((dateStr: string) => {
    setBooking(prev => ({
      ...prev,
      date: dateStr,
      time: null,
      // Do NOT auto-advance — user must click "Ver Horários" button
    }));
  }, []);

  const selectTime = useCallback((timeStr: string) => {
    setBooking(prev => ({
      ...prev,
      time: timeStr,
      step: 5,
    }));
  }, []);

  const setCustomerDetails = useCallback((details: {
    name: string;
    whatsapp: string;
    email?: string;
    notes?: string;
    wantsReminders: boolean;
    wantsPromotions: boolean;
  }) => {
    setBooking(prev => ({
      ...prev,
      name: details.name,
      whatsapp: details.whatsapp,
      email: details.email || '',
      notes: details.notes || '',
      wantsReminders: details.wantsReminders,
      wantsPromotions: details.wantsPromotions,
    }));
  }, []);

  const nextStep = useCallback(() => {
    setBooking(prev => {
      if (prev.step === 1 && !prev.barber) return prev;
      if (prev.step === 2 && !prev.service) return prev;
      if (prev.step === 3 && !prev.date) return prev;
      if (prev.step === 4 && !prev.time) return prev;
      const next = (prev.step + 1) as BookingStep;
      return { ...prev, step: next };
    });
  }, []);

  const prevStep = useCallback(() => {
    setBooking(prev => {
      if (prev.step === 1) return prev;
      const next = (prev.step - 1) as BookingStep;
      return { ...prev, step: next };
    });
  }, []);

  const setStep = useCallback((step: BookingStep) => {
    setBooking(prev => ({ ...prev, step }));
  }, []);

  const submitBooking = useCallback(async (customerDetails: {
    name: string;
    whatsapp: string;
    email?: string;
    notes?: string;
    wantsReminders: boolean;
    wantsPromotions: boolean;
  }): Promise<boolean> => {
    if (!booking.barber || !booking.service || !booking.date || !booking.time) {
      return false;
    }

    setIsSubmitting(true);

    const barberName =
      booking.barber === 'first-available'
        ? 'Primeiro Disponível'
        : (booking.barber as Barber).name;

    const barberId =
      booking.barber === 'first-available'
        ? 'first-available'
        : (booking.barber as Barber).id;

    const result = await processBooking(
      {
        name: customerDetails.name,
        whatsapp: customerDetails.whatsapp,
        email: customerDetails.email,
        wantsReminders: customerDetails.wantsReminders,
        wantsPromotions: customerDetails.wantsPromotions,
      },
      {
        barberId,
        barberName,
        serviceId: booking.service.id,
        serviceName: booking.service.name,
        servicePrice: booking.service.price,
        serviceDuration: booking.service.duration,
        date: booking.date,
        time: booking.time,
        notes: customerDetails.notes,
      }
    );

    setIsSubmitting(false);

    if (result.success && result.data) {
      setBooking(prev => ({
        ...prev,
        name: customerDetails.name,
        whatsapp: customerDetails.whatsapp,
        email: customerDetails.email || '',
        notes: customerDetails.notes || '',
        wantsReminders: customerDetails.wantsReminders,
        wantsPromotions: customerDetails.wantsPromotions,
        confirmationCode: result.data!.appointment.confirmationCode || null,
        step: 6,
      }));
      return true;
    }

    return false;
  }, [booking]);

  return {
    isOpen,
    isSubmitting,
    ...booking,
    openBooking,
    closeBooking,
    selectBarber,
    selectService,
    selectDate,
    selectTime,
    setCustomerDetails,
    nextStep,
    prevStep,
    setStep,
    submitBooking,
  };
};
