import { supabase } from './supabase/client';

export const availabilityService = {
  /**
   * Checa se existe conflito de horário para um barbeiro
   */
  async checkAvailability(barberId: string, startIso: string, endIso: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('appointments')
      .select('id')
      .eq('barber_id', barberId)
      .neq('status', 'cancelled')
      .lt('start_time', endIso)
      .gt('end_time', startIso)
      .limit(1);

    if (error) throw error;
    return data.length === 0;
  },

  /**
   * Resolve "Primeiro Disponível": retorna o UUID do primeiro barbeiro ativo da
   * loja que estiver livre no intervalo dado, ou null se nenhum estiver livre.
   */
  async findFirstAvailableBarber(shopId: string, startIso: string, endIso: string): Promise<string | null> {
    // 1. Busca todos os barbeiros ativos da loja, em ordem de criação (determinístico)
    const { data: barbers, error: barbersError } = await supabase
      .from('barbers')
      .select('id')
      .eq('shop_id', shopId)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (barbersError || !barbers || barbers.length === 0) return null;

    // 2. Busca os barbeiros que JÁ têm agendamento conflitante no intervalo escolhido
    const { data: busyAppointments } = await supabase
      .from('appointments')
      .select('barber_id')
      .eq('shop_id', shopId)
      .neq('status', 'cancelled')
      .lt('start_time', endIso)
      .gt('end_time', startIso);

    const busyBarberIds = new Set((busyAppointments || []).map(a => a.barber_id));

    // 3. Retorna o primeiro barbeiro que NÃO está ocupado
    const freeBarber = barbers.find(b => !busyBarberIds.has(b.id));
    return freeBarber?.id ?? null;
  },

  /**
   * Puxa horários disponíveis para uma data
   */
  async getAvailableSlots(shopId: string, barberId: string, durationMinutes: number, dateStr: string): Promise<string[]> {
    // Horário fixo das 09:00 às 18:00
    const startHour = 9;
    const endHour = 18;
    const interval = 30; // 30 min
    const slots: string[] = [];

    const fromDate = new Date(`${dateStr}T00:00:00`).toISOString();
    const toDate = new Date(`${dateStr}T23:59:59`).toISOString();
    
    let query = supabase.from('appointments').select('start_time, end_time').eq('shop_id', shopId).gte('start_time', fromDate).lte('start_time', toDate).neq('status', 'cancelled');
    if (barberId !== 'first-available') {
      query = query.eq('barber_id', barberId);
    }
    const { data: appointments } = await query;
    const busy = (appointments || []).map(a => {
      const s = new Date(a.start_time);
      const e = new Date(a.end_time);
      return { start: s.getHours() * 60 + s.getMinutes(), end: e.getHours() * 60 + e.getMinutes() };
    });

    for (let h = startHour; h < endHour; h++) {
      for (let m = 0; m < 60; m += interval) {
        const tStart = h * 60 + m;
        const tEnd = tStart + durationMinutes;

        if (tEnd > endHour * 60) continue;

        const now = new Date();
        const slotDate = new Date(`${dateStr}T00:00:00`);
        if (slotDate.toDateString() === now.toDateString() && tStart <= now.getHours() * 60 + now.getMinutes()) {
          continue;
        }

        const isConflict = busy.some(b => tStart < b.end && tEnd > b.start);
        if (!isConflict) {
          slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
        }
      }
    }
    return slots;
  }
};
