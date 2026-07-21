import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentService } from '../services/appointmentService';
import type { CreateBookingData } from '../services/appointmentService';

export const APPOINTMENTS_KEY = (shopId: string, start: string, end: string) => ['appointments', shopId, start, end] as const;

export function useAppointments(shopId: string, startDate: string, endDate: string) {
  return useQuery({
    queryKey: APPOINTMENTS_KEY(shopId, startDate, endDate),
    queryFn: async () => {
      const { data, error } = await appointmentService.getAppointments(shopId, startDate, endDate);
      if (error) throw new Error(error);
      return data ?? [];
    },
    enabled: !!shopId && !!startDate && !!endDate,
  });
}

export function useCreateAppointment(shopId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBookingData) => appointmentService.createAppointment(data).then(r => {
      if (r.error) throw new Error(r.error);
      return r.data!;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments', shopId] });
    },
  });
}

export function useFinalizeAppointment(shopId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, finalPrice, paymentMethod, paymentNotes, paymentStatus }: { id: string; finalPrice?: number; paymentMethod?: 'cash' | 'card' | 'pix' | 'mixed'; paymentNotes?: string; paymentStatus?: 'pending'|'paid' }) => 
      appointmentService.finalizeAppointment(id, finalPrice, paymentMethod, paymentNotes, paymentStatus).then(r => {
        if (r.error) throw new Error(r.error);
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', shopId] });
      queryClient.invalidateQueries({ queryKey: ['customers', shopId] });
    },
  });
}

export function useEditFinishedAppointment(shopId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, staffId, status, finalPrice, paymentMethod, paymentNotes, paymentStatus }: { 
      id: string; 
      staffId: string;
      status: 'completed' | 'cancelled' | 'no_show';
      finalPrice?: number; 
      paymentMethod?: 'cash' | 'card' | 'pix' | 'mixed' | ''; 
      paymentNotes?: string; 
      paymentStatus?: 'pending'|'paid'|'' 
    }) => 
      appointmentService.editFinishedAppointment(id, shopId, staffId, status, finalPrice, paymentMethod, paymentNotes, paymentStatus).then(r => {
        if (r.error) throw new Error(r.error);
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', shopId] });
      queryClient.invalidateQueries({ queryKey: ['customers', shopId] });
    },
  });
}

export function useCancelAppointment(shopId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => appointmentService.cancelAppointment(id).then(r => {
      if (r.error) throw new Error(r.error);
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments', shopId] });
    },
  });
}

export function useUpdateAppointmentStatus(shopId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: import('../types/scheduling').AppointmentStatus }) => 
      appointmentService.updateStatus(id, status).then(r => {
        if (r.error) throw new Error(r.error);
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments', shopId] });
    },
  });
}
