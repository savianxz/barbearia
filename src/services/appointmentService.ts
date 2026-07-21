import { supabase } from './supabase/client';
import type { Appointment, AppointmentWithDetails, AppointmentStatus } from '../types/scheduling';

type ApiResult<T> = { data: T | null; error: string | null };

export interface CreateBookingData {
  shop_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  barber_id: string;
  service_id: string;
  start_time: string;
  // end_time e total_price são calculados pelo backend (RPC + trigger)
}

export const appointmentService = {
  /**
   * Obtém os agendamentos da barbearia dentro de um intervalo de datas
   */
  async getAppointments(shopId: string, fromDate: string, toDate: string): Promise<ApiResult<AppointmentWithDetails[]>> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          customer:customers (name, phone),
          barber:barbers (name, color),
          service:services (name, duration_minutes)
        `)
        .eq('shop_id', shopId)
        .gte('start_time', fromDate)
        .lte('start_time', toDate)
        .order('start_time', { ascending: true });

      if (error) throw error;
      return { data: data as any as AppointmentWithDetails[], error: null };
    } catch (e: any) {
      return { data: null, error: e.message };
    }
  },

  /**
   * Atualiza o status do agendamento (ex: Confirmar atendimento)
   */
  async updateStatus(id: string, status: AppointmentStatus): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
      if (error) throw error;
      return { error: null };
    } catch (e: any) {
      return { error: e.message };
    }
  },

  /**
   * Cria um agendamento público via RPC (SECURITY DEFINER).
   * O end_time é calculado no backend via duration_minutes do serviço.
   * O total_price é calculado pela trigger validate_appointment_business_hours,
   * respeitando overrides por barbeiro — NUNCA confiamos no valor do frontend.
   */
  async createAppointment(data: CreateBookingData): Promise<ApiResult<Appointment>> {
    try {
      const { data: appointmentId, error } = await supabase.rpc('create_public_appointment', {
        p_shop_id: data.shop_id,
        p_barber_id: data.barber_id,
        p_service_id: data.service_id,
        p_start_time: data.start_time,
        p_customer_name: data.customer_name,
        p_customer_phone: data.customer_phone,
        p_customer_email: data.customer_email ?? null,
      });

      if (error) throw error;

      // Busca o appointment completo para retornar ao frontend (ex: para o código de confirmação)
      const { data: appointment, error: fetchErr } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .single();

      if (fetchErr) {
        // Se não conseguir buscar os detalhes (RLS de anon), retorna um objeto mínimo
        return { data: { id: appointmentId } as unknown as Appointment, error: null };
      }

      return { data: appointment as Appointment, error: null };
    } catch (e: any) {
      return { data: null, error: e.message };
    }
  },

  async cancelAppointment(id: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id);
      if (error) throw error;
      return { error: null };
    } catch (e: any) {
      return { error: e.message };
    }
  },

  async finalizeAppointment(
    id: string, 
    finalPrice?: number, 
    paymentMethod?: 'cash' | 'card' | 'pix' | 'mixed', 
    paymentNotes?: string,
    paymentStatus?: 'pending' | 'paid'
  ): Promise<{ error: string | null }> {
    try {
      const { data: appt, error: getErr } = await supabase.from('appointments').select('status, customer_id, total_price, payment_status').eq('id', id).single();
      if (getErr) throw getErr;
      if (appt.status === 'completed' && appt.payment_status === 'paid') throw new Error('Agendamento já foi finalizado e pago.');
      if (appt.status === 'cancelled') throw new Error('Não é possível finalizar um agendamento cancelado.');

      const updateData: any = { status: 'completed' };
      if (finalPrice !== undefined) updateData.total_price = finalPrice;
      if (paymentMethod) updateData.payment_method = paymentMethod;
      if (paymentNotes) updateData.payment_notes = paymentNotes;
      if (paymentStatus) updateData.payment_status = paymentStatus;

      const { error: updErr } = await supabase.from('appointments').update(updateData).eq('id', id);
      if (updErr) throw updErr;

      return { error: null };
    } catch (e: any) {
      return { error: e.message };
    }
  },

  async editFinishedAppointment(
    id: string,
    shopId: string,
    staffId: string,
    status: 'completed' | 'cancelled' | 'no_show',
    finalPrice?: number,
    paymentMethod?: 'cash' | 'card' | 'pix' | 'mixed' | '',
    paymentNotes?: string,
    paymentStatus?: 'pending' | 'paid' | ''
  ): Promise<{ error: string | null }> {
    try {
      const { data: appt, error: getErr } = await supabase
        .from('appointments')
        .select('shop_id')
        .eq('id', id)
        .single();
        
      if (getErr) throw getErr;
      if (appt.shop_id !== shopId) throw new Error('Acesso negado. O agendamento pertence a outra loja.');

      const updateData: any = { 
        status,
        edited_by: staffId,
        edited_at: new Date().toISOString()
      };
      
      if (status === 'completed') {
        if (finalPrice !== undefined) updateData.total_price = finalPrice;
        if (paymentMethod) updateData.payment_method = paymentMethod;
        if (paymentNotes) updateData.payment_notes = paymentNotes;
        if (paymentStatus) updateData.payment_status = paymentStatus;
      } else {
        updateData.payment_status = 'pending';
        updateData.payment_method = null;
        updateData.payment_notes = null;
      }

      const { error: updErr } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', id)
        .eq('shop_id', shopId);
        
      if (updErr) throw updErr;

      return { error: null };
    } catch (e: any) {
      return { error: e.message };
    }
  }
};
