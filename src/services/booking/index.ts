import { mockDb } from './mockDb';
import {
  getBarberSlotsForDay,
  getUnionSlotsForDay,
  calculateEndTime,
  checkOverlap,
  isBlockActiveOnDate,
  timeToMinutes,
  minutesToTime,
  getTodayDateStr,
  getCurrentTimeStr
} from './engine';
import type { Customer, Appointment, ServiceResponse, BarberSchedule } from './types';

export type { Customer, Appointment, ServiceResponse, BarberSchedule, TimeBlock, AgendaPrecision, Shop } from './types';

export const bookingService = {
  /**
   * Busca a lista de horários de início sugeridos ("HH:MM") baseado na precisão da agenda da barbearia.
   */
  async getAvailableSlots(
    shopId: string,
    barberId: string,
    serviceDuration: number,
    dateStr: string
  ): Promise<ServiceResponse<string[]>> {
    try {
      // Simula latência de rede (200ms)
      await new Promise(resolve => setTimeout(resolve, 200));

      const shops = mockDb.getShops();
      const shop = shops.find(s => s.id === shopId);
      if (!shop) {
        return { data: null, error: 'Barbearia não encontrada.', success: false };
      }

      const schedules = mockDb.getSchedules();
      const appointments = mockDb.getAppointments();
      const blocks = mockDb.getTimeBlocks();

      let slots: string[] = [];

      if (barberId === 'first-available' || !barberId) {
        const shopSchedules = schedules.filter(s => s.shopId === shopId);
        slots = getUnionSlotsForDay(shopSchedules, appointments, blocks, serviceDuration, dateStr, shop.precision);
      } else {
        const schedule = schedules.find(s => s.barberId === barberId && s.shopId === shopId);
        if (!schedule) {
          return { data: [], error: 'Agenda do barbeiro não encontrada para esta barbearia.', success: false };
        }
        slots = getBarberSlotsForDay(schedule, appointments, blocks, serviceDuration, dateStr, shop.precision);
      }

      return { data: slots, error: null, success: true };
    } catch (err: any) {
      return { data: null, error: err.message || 'Erro ao buscar disponibilidade.', success: false };
    }
  },

  /**
   * Verifica se há conflitos e valida a disponibilidade de um horário específico (intervalo completo de início a fim).
   */
  async validateBooking(
    shopId: string,
    barberId: string,
    serviceDuration: number,
    dateStr: string,
    timeStr: string
  ): Promise<ServiceResponse<boolean>> {
    try {
      const schedules = mockDb.getSchedules();
      const appointments = mockDb.getAppointments();
      const blocks = mockDb.getTimeBlocks();

      const startTimeMins = timeToMinutes(timeStr);
      const endTimeMins = startTimeMins + serviceDuration;
      const endTimeStr = minutesToTime(endTimeMins);

      // Validar se o horário de início já passou no relógio (caso seja hoje)
      const todayStr = getTodayDateStr();
      if (todayStr === dateStr && startTimeMins <= timeToMinutes(getCurrentTimeStr())) {
        return { data: false, error: 'O horário selecionado já passou.', success: true };
      }

      const checkBarberAvailable = (sched: BarberSchedule): boolean => {
        const [year, month, day] = dateStr.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day);
        const weekday = dateObj.getDay();

        // Escala diária de trabalho
        const daily = sched.weeklyConfig[weekday];
        if (!daily || !daily.isOpen) {
          return false;
        }

        const workStartMins = timeToMinutes(daily.startTime);
        const workEndMins = timeToMinutes(daily.endTime);

        // Agendamento deve caber inteiramente dentro do expediente de trabalho
        if (startTimeMins < workStartMins || endTimeMins > workEndMins) {
          return false;
        }

        // Checar pausas
        for (const pause of sched.pauses) {
          if (checkOverlap(timeStr, endTimeStr, pause.startTime, pause.endTime)) {
            return false;
          }
        }

        // Checar conflito com agendamentos confirmados
        const activeAppts = appointments.filter(
          appt => appt.barberId === sched.barberId &&
                  appt.date === dateStr &&
                  appt.status !== 'cancelled'
        );
        for (const appt of activeAppts) {
          if (checkOverlap(timeStr, endTimeStr, appt.startTime, appt.endTime)) {
            return false;
          }
        }

        // Checar conflito com bloqueios ativos (pontuais/recorrentes)
        const activeBlocks = blocks.filter(
          block => block.barberId === sched.barberId &&
                   isBlockActiveOnDate(block, dateStr)
        );
        for (const block of activeBlocks) {
          if (checkOverlap(timeStr, endTimeStr, block.startTime, block.endTime)) {
            return false;
          }
        }

        return true;
      };

      if (barberId === 'first-available') {
        const shopSchedules = schedules.filter(s => s.shopId === shopId);
        const hasAny = shopSchedules.some(checkBarberAvailable);
        return { data: hasAny, error: hasAny ? null : 'Sem barbeiros disponíveis para esse intervalo.', success: true };
      } else {
        const schedule = schedules.find(s => s.barberId === barberId && s.shopId === shopId);
        if (!schedule) {
          return { data: false, error: 'Escala do barbeiro não configurada.', success: false };
        }
        const isFree = checkBarberAvailable(schedule);
        return { data: isFree, error: isFree ? null : 'Horário indisponível (conflito de escala, pausas ou bloqueios).', success: true };
      }
    } catch (err: any) {
      return { data: false, error: err.message || 'Erro ao validar agendamento.', success: false };
    }
  },

  /**
   * Processa o agendamento completo salvando o startTime, endTime e Duração.
   */
  async createBooking(
    customerData: {
      name: string;
      whatsapp: string;
      email?: string;
      wantsReminders: boolean;
      wantsPromotions: boolean;
    },
    appointmentData: {
      shopId: string;
      barberId: string;
      barberName: string;
      serviceId: string;
      serviceName: string;
      servicePrice: number;
      serviceDuration: number;
      date: string;
      time: string;
      notes?: string;
    }
  ): Promise<ServiceResponse<{ customer: Customer; appointment: Appointment }>> {
    try {
      // Simula latência de rede (500ms)
      await new Promise(resolve => setTimeout(resolve, 500));

      const { shopId, barberId, barberName, serviceId, serviceName, servicePrice, serviceDuration, date, time, notes } = appointmentData;

      // 1. Validar disponibilidade do intervalo
      const valRes = await this.validateBooking(shopId, barberId, serviceDuration, date, time);
      if (!valRes.success || !valRes.data) {
        return { data: null, error: valRes.error || 'O horário selecionado não está mais disponível.', success: false };
      }

      // 2. Definir o barbeiro final se for "Primeiro Disponível"
      let finalBarberId = barberId;
      let finalBarberName = barberName;

      if (barberId === 'first-available') {
        const schedules = mockDb.getSchedules().filter(s => s.shopId === shopId);
        const appointments = mockDb.getAppointments();
        const blocks = mockDb.getTimeBlocks();
        
        let assignedBarberId = '';
        for (const schedule of schedules) {
          const slots = getBarberSlotsForDay(schedule, appointments, blocks, serviceDuration, date, '15');
          if (slots.includes(time)) {
            assignedBarberId = schedule.barberId;
            break;
          }
        }
        if (!assignedBarberId) {
          // Fallback completo usando validação detalhada
          for (const schedule of schedules) {
            const tempVal = await this.validateBooking(shopId, schedule.barberId, serviceDuration, date, time);
            if (tempVal.success && tempVal.data) {
              assignedBarberId = schedule.barberId;
              break;
            }
          }
        }

        if (!assignedBarberId) {
          return { data: null, error: 'Não há barbeiros livres disponíveis para este horário.', success: false };
        }
        finalBarberId = assignedBarberId;
        const nameMap: Record<string, string> = {
          felipe: 'Felipe',
          edmar: 'Edmar',
          ingrid: 'Ingrid',
          miranda: 'Miranda'
        };
        finalBarberName = nameMap[finalBarberId] || finalBarberId;
      }

      // 3. Obter ou criar cadastro de cliente silencioso
      const customers = mockDb.getCustomers();
      let customer = customers.find(c => c.whatsapp === customerData.whatsapp);
      if (!customer) {
        customer = {
          id: `cust_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          name: customerData.name,
          whatsapp: customerData.whatsapp,
          email: customerData.email,
          wantsReminders: customerData.wantsReminders,
          wantsPromotions: customerData.wantsPromotions,
          createdAt: new Date().toISOString(),
          passwordHash: `auto_${Math.random().toString(36).slice(2, 12)}`
        };
        mockDb.saveCustomer(customer);
      }

      // 4. Calcular o horário final (endTime) baseando-se no início e duração
      const calculatedEnd = calculateEndTime(time, serviceDuration);

      // 5. Salvar o agendamento no banco de dados mockado
      const appointment: Appointment = {
        id: `appt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        shopId,
        customerId: customer.id,
        barberId: finalBarberId,
        barberName: finalBarberName,
        serviceId,
        serviceName,
        servicePrice,
        startTime: time,
        endTime: calculatedEnd,
        serviceDuration,
        date,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        confirmationCode: `FS-${Math.floor(Math.random() * 900000 + 100000)}`,
        notes
      };

      mockDb.saveAppointment(appointment);

      return {
        data: { customer, appointment },
        error: null,
        success: true
      };
    } catch (err: any) {
      return { data: null, error: err.message || 'Erro ao registrar agendamento.', success: false };
    }
  },

  /**
   * Cancela o agendamento alterando o status para 'cancelled'.
   */
  async cancelBooking(appointmentId: string): Promise<ServiceResponse<boolean>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));

      const appointments = mockDb.getAppointments();
      const appt = appointments.find(a => a.id === appointmentId);
      if (!appt) {
        return { data: false, error: 'Agendamento não encontrado.', success: false };
      }

      appt.status = 'cancelled';
      appt.updatedAt = new Date().toISOString();
      mockDb.saveAppointment(appt);

      return { data: true, error: null, success: true };
    } catch (err: any) {
      return { data: false, error: err.message || 'Erro ao cancelar agendamento.', success: false };
    }
  },

  /**
   * Reagenda validando o conflito do novo intervalo completo de início a fim.
   */
  async rescheduleBooking(
    appointmentId: string,
    newDate: string,
    newTime: string
  ): Promise<ServiceResponse<Appointment>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const appointments = mockDb.getAppointments();
      const appt = appointments.find(a => a.id === appointmentId);
      if (!appt) {
        return { data: null, error: 'Agendamento não encontrado.', success: false };
      }

      // Validar nova disponibilidade do intervalo completo
      const valRes = await this.validateBooking(appt.shopId, appt.barberId, appt.serviceDuration, newDate, newTime);
      if (!valRes.success || !valRes.data) {
        return { data: null, error: 'O novo horário selecionado colide ou está indisponível.', success: false };
      }

      appt.date = newDate;
      appt.startTime = newTime;
      appt.endTime = calculateEndTime(newTime, appt.serviceDuration);
      appt.status = 'confirmed';
      appt.updatedAt = new Date().toISOString();
      mockDb.saveAppointment(appt);

      return { data: appt, error: null, success: true };
    } catch (err: any) {
      return { data: null, error: err.message || 'Erro ao reagendar compromisso.', success: false };
    }
  }
};
