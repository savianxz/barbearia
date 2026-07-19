import { supabase } from './supabase/client';
import type { Appointment, AppointmentWithDetails, AppointmentStatus } from '../types/scheduling';
import { availabilityService } from './availabilityService';

type ApiResult<T> = { data: T | null; error: string | null };

export interface CreateBookingData {
  shop_id: string;
  customer_name: string;
  customer_phone: string;
  barber_id: string;
  service_id: string;
  start_time: string;
  end_time: string;
  total_price: number;
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
          customer:customers (name, phone, total_visits),
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
   * Cria um agendamento novo com Upsert no cliente
   */
  async createAppointment(data: CreateBookingData): Promise<ApiResult<Appointment>> {
    try {
      const isAvailable = await availabilityService.checkAvailability(data.barber_id, data.start_time, data.end_time);
      if (!isAvailable) {
        throw new Error('Este horário não está mais disponível para este profissional.');
      }

      let customerId = '';
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('shop_id', data.shop_id)
        .eq('phone', data.customer_phone)
        .single();

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const { data: newCustomer, error: cError } = await supabase
          .from('customers')
          .insert({ shop_id: data.shop_id, name: data.customer_name, phone: data.customer_phone, total_visits: 0, total_spent: 0 })
          .select('id')
          .single();

        if (cError) throw cError;
        customerId = newCustomer.id;
      }

      const { data: appointment, error: aError } = await supabase
        .from('appointments')
        .insert({
          shop_id: data.shop_id,
          customer_id: customerId,
          barber_id: data.barber_id,
          service_id: data.service_id,
          start_time: data.start_time,
          end_time: data.end_time,
          status: 'scheduled',
          total_price: data.total_price,
        })
        .select()
        .single();

      if (aError) throw aError;
      return { data: appointment as Appointment, error: null };
    } catch (e: any) {
      return { data: null, error: e.message };
    }
  },

  async cancelAppointment(id: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.from('appointments').update({ status: 'canceled' }).eq('id', id);
      if (error) throw error;
      return { error: null };
    } catch (e: any) {
      return { error: e.message };
    }
  },

  async finalizeAppointment(id: string, finalPrice?: number): Promise<{ error: string | null }> {
    try {
      const { data: appt, error: getErr } = await supabase.from('appointments').select('status').eq('id', id).single();
      if (getErr) throw getErr;
      if (appt.status === 'completed') throw new Error('Agendamento já foi finalizado.');
      if (appt.status === 'canceled') throw new Error('Não é possível finalizar um agendamento cancelado.');

      const updateData: any = { status: 'completed' };
      if (finalPrice !== undefined) {
        updateData.total_price = finalPrice;
      }

      const { error: updErr } = await supabase.from('appointments').update(updateData).eq('id', id);
      if (updErr) throw updErr;

      return { error: null };
    } catch (e: any) {
      return { error: e.message };
    }
  }
};
