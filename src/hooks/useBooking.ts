import { useState, useCallback } from 'react';
import type { Barber, Service } from '../data/mockData';

export type BookingStep = 1 | 2 | 3 | 4 | 5 | 6;

export interface BookingState {
  isOpen: boolean;
  step: BookingStep;
  barber: Barber | 'first-available' | null;
  service: Service | null;
  date: string | null; // Format YYYY-MM-DD
  time: string | null; // Format HH:MM
  name: string;
  phone: string;
  notes: string;
  agreedToTerms: boolean;
}

const initialBookingState: Omit<BookingState, 'isOpen'> = {
  step: 1,
  barber: null,
  service: null,
  date: null,
  time: null,
  name: '',
  phone: '',
  notes: '',
  agreedToTerms: false
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
      step: initialBarber ? 2 : 1 // Skip step 1 if barber is preselected
    });
    setIsOpen(true);
  }, []);

  const closeBooking = useCallback(() => {
    setIsOpen(false);
    // Add brief delay to reset state to avoid flickering during close animation
    setTimeout(() => {
      setBooking(initialBookingState);
      setIsSubmitting(false);
    }, 300);
  }, []);

  const selectBarber = useCallback((barber: Barber | 'first-available') => {
    setBooking(prev => ({
      ...prev,
      barber,
      // If they change barber, we reset subsequent selections to maintain data consistency
      date: null,
      time: null,
      step: 2
    }));
  }, []);

  const selectService = useCallback((service: Service) => {
    setBooking(prev => ({
      ...prev,
      service,
      date: null,
      time: null,
      step: 3
    }));
  }, []);

  const selectDate = useCallback((dateStr: string) => {
    setBooking(prev => ({
      ...prev,
      date: dateStr,
      time: null, // Reset time if date changes
      step: 4
    }));
  }, []);

  const selectTime = useCallback((timeStr: string) => {
    setBooking(prev => ({
      ...prev,
      time: timeStr,
      step: 5
    }));
  }, []);

  const setCustomerDetails = useCallback((details: { name: string; phone: string; notes?: string; agreedToTerms: boolean }) => {
    setBooking(prev => ({
      ...prev,
      name: details.name,
      phone: details.phone,
      notes: details.notes || '',
      agreedToTerms: details.agreedToTerms
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
      // If we go back from step 2 and the barber was pre-selected upon opening, closing might be better,
      // but going to step 1 lets them change the barber.
      if (prev.step === 1) return prev;
      
      const next = (prev.step - 1) as BookingStep;
      return { ...prev, step: next };
    });
  }, []);

  const setStep = useCallback((step: BookingStep) => {
    setBooking(prev => ({ ...prev, step }));
  }, []);

  const submitBooking = useCallback(async () => {
    if (!booking.name || !booking.phone || !booking.agreedToTerms) {
      return false;
    }
    
    setIsSubmitting(true);
    
    // Simulate Supabase / API database write
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setBooking(prev => ({ ...prev, step: 6 }));
    return true;
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
    submitBooking
  };
};
