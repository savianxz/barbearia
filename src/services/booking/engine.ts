import type { BarberSchedule, TimeBlock, Appointment, AgendaPrecision } from './types';

/**
 * Converte string formatada "HH:MM" para minutos absolutos.
 */
export const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Converte minutos absolutos para string "HH:MM".
 */
export const minutesToTime = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

/**
 * Soma minutos a um horário no formato "HH:MM" e retorna o horário final calculado.
 */
export const calculateEndTime = (startTime: string, durationMinutes: number): string => {
  const startMins = timeToMinutes(startTime);
  return minutesToTime(startMins + durationMinutes);
};

/**
 * Verifica se há sobreposição entre dois intervalos de tempo.
 * Retorna true se houver qualquer interseção (s1 < e2 E e1 > s2).
 */
export const checkOverlap = (start1: string, end1: string, start2: string, end2: string): boolean => {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return s1 < e2 && e1 > s2;
};

/**
 * Retorna a data local atual formatada em "YYYY-MM-DD".
 */
export const getTodayDateStr = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Retorna a hora local atual formatada em "HH:MM".
 */
export const getCurrentTimeStr = (): string => {
  const d = new Date();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Verifica se um determinado bloqueio de agenda está ativo na data consultada.
 * Suporta bloqueios pontuais (único dia), intervalo de datas e recorrentes.
 */
export const isBlockActiveOnDate = (block: TimeBlock, dateStr: string): boolean => {
  // 1. Verificar limites da data
  if (dateStr < block.startDate || dateStr > block.endDate) {
    return false;
  }

  // 2. Se não for recorrente, e passou no intervalo de datas acima, está ativo
  if (!block.isRecurring) {
    return true;
  }

  // 3. Se for recorrente, checar regra de recorrência
  if (block.recurrenceRule) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const weekday = dateObj.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

    const { frequency, weekdays } = block.recurrenceRule;

    if (frequency === 'daily') {
      return true;
    }

    if (frequency === 'weekly' && weekdays) {
      return weekdays.includes(weekday);
    }
  }

  return false;
};

/**
 * Calcula os horários de início disponíveis ("HH:MM") para um barbeiro específico
 * considerando escala diária, múltiplas pausas, agendamentos, bloqueios e precisão do Shop.
 */
export const getBarberSlotsForDay = (
  schedule: BarberSchedule,
  appointments: Appointment[],
  blocks: TimeBlock[],
  serviceDuration: number,
  dateStr: string,
  precision: AgendaPrecision
): string[] => {
  // Identifica o dia da semana da data consultada
  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const weekday = dateObj.getDay();

  // Verifica escala do barbeiro para esse dia da semana
  const daily = schedule.weeklyConfig[weekday];
  if (!daily || !daily.isOpen) {
    return []; // Não trabalha ou folga
  }

  const startMinutes = timeToMinutes(daily.startTime);
  const endMinutes = timeToMinutes(daily.endTime);

  // Define o incremento do grid em minutos
  let gridStep = 15;
  if (precision === '5') gridStep = 5;
  else if (precision === '10') gridStep = 10;
  else if (precision === '15') gridStep = 15;
  else if (precision === 'libre') gridStep = 15; // Grid sugerido para UI em modo livre

  const todayStr = getTodayDateStr();
  const nowMinutes = todayStr === dateStr ? timeToMinutes(getCurrentTimeStr()) : -1;

  // Filtra agendamentos ativos na data
  const activeAppts = appointments.filter(
    appt => appt.barberId === schedule.barberId &&
            appt.date === dateStr &&
            appt.status !== 'cancelled'
  );

  // Filtra bloqueios ativos na data
  const activeBlocks = blocks.filter(
    block => block.barberId === schedule.barberId &&
             isBlockActiveOnDate(block, dateStr)
  );

  const availableSlots: string[] = [];

  // Geração e filtragem dos intervalos
  for (let current = startMinutes; current <= endMinutes - serviceDuration; current += gridStep) {
    const slotStartStr = minutesToTime(current);
    const slotEndStr = minutesToTime(current + serviceDuration);

    // Se for hoje, remove horários do passado
    if (todayStr === dateStr && current <= nowMinutes) {
      continue;
    }

    // A. Garantir limite de expediente (já garantido por loop limit, mas checa segurança)
    if (current + serviceDuration > endMinutes) {
      continue;
    }

    // B. Checar colisão com múltiplas pausas
    let overlapsPause = false;
    for (const pause of schedule.pauses) {
      if (checkOverlap(slotStartStr, slotEndStr, pause.startTime, pause.endTime)) {
        overlapsPause = true;
        break;
      }
    }
    if (overlapsPause) continue;

    // C. Checar colisão com agendamentos existentes
    let overlapsAppt = false;
    for (const appt of activeAppts) {
      if (checkOverlap(slotStartStr, slotEndStr, appt.startTime, appt.endTime)) {
        overlapsAppt = true;
        break;
      }
    }
    if (overlapsAppt) continue;

    // D. Checar colisão com bloqueios ativos
    let overlapsBlock = false;
    for (const block of activeBlocks) {
      if (checkOverlap(slotStartStr, slotEndStr, block.startTime, block.endTime)) {
        overlapsBlock = true;
        break;
      }
    }
    if (overlapsBlock) continue;

    // Slot livre!
    availableSlots.push(slotStartStr);
  }

  return availableSlots;
};

/**
 * Calcula a união dos slots disponíveis para todos os barbeiros ativos
 * para a opção "Primeiro Disponível" (first-available).
 */
export const getUnionSlotsForDay = (
  schedules: BarberSchedule[],
  appointments: Appointment[],
  blocks: TimeBlock[],
  serviceDuration: number,
  dateStr: string,
  precision: AgendaPrecision
): string[] => {
  const uniqueSlots = new Set<string>();

  for (const schedule of schedules) {
    const slots = getBarberSlotsForDay(schedule, appointments, blocks, serviceDuration, dateStr, precision);
    slots.forEach(s => uniqueSlots.add(s));
  }

  return Array.from(uniqueSlots).sort((a, b) => {
    return timeToMinutes(a) - timeToMinutes(b);
  });
};
