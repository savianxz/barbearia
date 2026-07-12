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
 * Verifica se há sobreposição considerando um buffer em minutos ao redor do intervalo do agendamento existente (2).
 */
export const checkOverlapWithBuffer = (
  start1: string,
  end1: string,
  start2: string,
  end2: string,
  bufferMinutes: number
): boolean => {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  // O agendamento existente bloqueia o intervalo [s2 - buffer, e2 + buffer]
  return s1 < e2 + bufferMinutes && e1 > s2 - bufferMinutes;
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
  if (dateStr < block.startDate || dateStr > block.endDate) {
    return false;
  }

  if (!block.isRecurring) {
    return true;
  }

  if (block.recurrenceRule) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const weekday = dateObj.getDay();

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
 * considerando escala diária, pautas, agendamentos, bloqueios, precisão do Shop e o buffer.
 */
export const getBarberSlotsForDay = (
  schedule: BarberSchedule,
  appointments: Appointment[],
  blocks: TimeBlock[],
  serviceDuration: number,
  dateStr: string,
  precision: AgendaPrecision,
  bufferMinutes: number = 0,
  lastStartAllowedTime?: string
): string[] => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const weekday = dateObj.getDay();

  const daily = schedule.weeklyConfig[weekday];
  if (!daily || !daily.isOpen) {
    return [];
  }

  const workStartMins = timeToMinutes(daily.startTime);
  const workEndMins = timeToMinutes(daily.endTime);

  // Considerar último horário permitido para iniciar atendimento
  let lastStartMins = workEndMins - serviceDuration;
  if (lastStartAllowedTime) {
    const limit = timeToMinutes(lastStartAllowedTime);
    lastStartMins = Math.min(lastStartMins, limit);
  }

  let gridStep = 15;
  if (precision === '5') gridStep = 5;
  else if (precision === '10') gridStep = 10;
  else if (precision === '15') gridStep = 15;
  else if (precision === 'libre') gridStep = 5; // Grid de 5 min para flexibilidade no modo livre

  const todayStr = getTodayDateStr();
  const nowMinutes = todayStr === dateStr ? timeToMinutes(getCurrentTimeStr()) : -1;

  const activeAppts = appointments.filter(
    appt => appt.barberId === schedule.barberId &&
            appt.date === dateStr &&
            appt.status !== 'cancelled'
  );

  const activeBlocks = blocks.filter(
    block => block.barberId === schedule.barberId &&
             isBlockActiveOnDate(block, dateStr)
  );

  const availableSlots: string[] = [];

  for (let current = workStartMins; current <= lastStartMins; current += gridStep) {
    const slotStartStr = minutesToTime(current);
    const slotEndStr = minutesToTime(current + serviceDuration);

    if (todayStr === dateStr && current <= nowMinutes) {
      continue;
    }

    // A. Garantir limite de expediente
    if (current + serviceDuration > workEndMins) {
      continue;
    }

    // B. Checar colisão com pausas
    let overlapsPause = false;
    for (const pause of schedule.pauses) {
      if (checkOverlap(slotStartStr, slotEndStr, pause.startTime, pause.endTime)) {
        overlapsPause = true;
        break;
      }
    }
    if (overlapsPause) continue;

    // C. Checar colisão com agendamentos existentes (considerando o buffer)
    let overlapsAppt = false;
    for (const appt of activeAppts) {
      if (checkOverlapWithBuffer(slotStartStr, slotEndStr, appt.startTime, appt.endTime, bufferMinutes)) {
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

    availableSlots.push(slotStartStr);
  }

  return availableSlots;
};

/**
 * Calcula a união dos slots disponíveis para todos os barbeiros ativos
 */
export const getUnionSlotsForDay = (
  schedules: BarberSchedule[],
  appointments: Appointment[],
  blocks: TimeBlock[],
  serviceDuration: number,
  dateStr: string,
  precision: AgendaPrecision,
  bufferMinutes: number = 0,
  lastStartAllowedTime?: string
): string[] => {
  const uniqueSlots = new Set<string>();

  for (const schedule of schedules) {
    const slots = getBarberSlotsForDay(schedule, appointments, blocks, serviceDuration, dateStr, precision, bufferMinutes, lastStartAllowedTime);
    slots.forEach(s => uniqueSlots.add(s));
  }

  return Array.from(uniqueSlots).sort((a, b) => {
    return timeToMinutes(a) - timeToMinutes(b);
  });
};

export type ConflictReason =
  | 'dia_sem_expediente'
  | 'barbearia_fechada'
  | 'servico_ultrapassa_expediente'
  | 'horario_almoco'
  | 'bloqueio_manual'
  | 'conflito_agendamento'
  | 'conflito_buffer'
  | 'horario_passado';

export interface BookingSuggestions {
  suggestedAlternativeToday: string | null;
  suggestedAlternativeTomorrow: { date: string; time: string } | null;
  nearbyAlternatives: string[];
}

export interface DetailedValidationResult {
  isValid: boolean;
  reason?: ConflictReason;
  suggestions?: BookingSuggestions;
}

/**
 * Valida um horário específico retornando a razão exata do conflito e sugestões automáticas.
 */
export const validateBookingWithReason = (
  schedules: BarberSchedule[],
  appointments: Appointment[],
  blocks: TimeBlock[],
  barberId: string,
  serviceDuration: number,
  dateStr: string,
  timeStr: string,
  precision: AgendaPrecision,
  bufferMinutes: number = 0,
  lastStartAllowedTime?: string
): DetailedValidationResult => {
  const startTimeMins = timeToMinutes(timeStr);
  const endTimeMins = startTimeMins + serviceDuration;
  const endTimeStr = minutesToTime(endTimeMins);

  // 1. Checar se é no passado
  const todayStr = getTodayDateStr();
  if (todayStr === dateStr && startTimeMins <= timeToMinutes(getCurrentTimeStr())) {
    const suggestions = findSuggestions(schedules, appointments, blocks, barberId, serviceDuration, dateStr, timeStr, precision, bufferMinutes, lastStartAllowedTime);
    return { isValid: false, reason: 'horario_passado', suggestions };
  }

  // Obter as agendas a validar (uma específica ou todas se for "first-available")
  const targetSchedules = barberId === 'first-available'
    ? schedules
    : schedules.filter(s => s.barberId === barberId);

  if (targetSchedules.length === 0) {
    return { isValid: false, reason: 'dia_sem_expediente' };
  }

  // Para validarmos o motivo, precisamos analisar os conflitos.
  // Se for "first-available", o horário é VÁLIDO se pelo menos um barbeiro puder atender.
  // Se for um barbeiro específico, o horário é válido se esse barbeiro puder atender.
  // Se todos falharem, nós agregamos a razão do fracasso.
  
  const checkBarber = (sched: BarberSchedule): { isValid: boolean; reason?: ConflictReason } => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const weekday = dateObj.getDay();

    const daily = sched.weeklyConfig[weekday];
    if (!daily || !daily.isOpen) {
      return { isValid: false, reason: 'dia_sem_expediente' };
    }

    const workStartMins = timeToMinutes(daily.startTime);
    const workEndMins = timeToMinutes(daily.endTime);

    // Fora do expediente
    if (startTimeMins < workStartMins || startTimeMins > workEndMins) {
      return { isValid: false, reason: 'barbearia_fechada' };
    }

    // Limite de início
    if (lastStartAllowedTime && startTimeMins > timeToMinutes(lastStartAllowedTime)) {
      return { isValid: false, reason: 'barbearia_fechada' };
    }

    // Ultrapassa horário de fechamento
    if (endTimeMins > workEndMins) {
      return { isValid: false, reason: 'servico_ultrapassa_expediente' };
    }

    // Pausas/Almoço
    for (const pause of sched.pauses) {
      if (checkOverlap(timeStr, endTimeStr, pause.startTime, pause.endTime)) {
        return { isValid: false, reason: 'horario_almoco' };
      }
    }

    // Bloqueio manual
    const activeBlocks = blocks.filter(
      b => b.barberId === sched.barberId && isBlockActiveOnDate(b, dateStr)
    );
    for (const block of activeBlocks) {
      if (checkOverlap(timeStr, endTimeStr, block.startTime, block.endTime)) {
        return { isValid: false, reason: 'bloqueio_manual' };
      }
    }

    // Agendamentos existentes (sem buffer primeiro)
    const activeAppts = appointments.filter(
      a => a.barberId === sched.barberId && a.date === dateStr && a.status !== 'cancelled'
    );
    for (const appt of activeAppts) {
      if (checkOverlap(timeStr, endTimeStr, appt.startTime, appt.endTime)) {
        return { isValid: false, reason: 'conflito_agendamento' };
      }
    }

    // Conflito com buffer
    if (bufferMinutes > 0) {
      for (const appt of activeAppts) {
        if (checkOverlapWithBuffer(timeStr, endTimeStr, appt.startTime, appt.endTime, bufferMinutes)) {
          return { isValid: false, reason: 'conflito_buffer' };
        }
      }
    }

    return { isValid: true };
  };

  // Avaliar todos os barbeiros alvos
  const results = targetSchedules.map(checkBarber);
  const validBarber = results.find(r => r.isValid);

  if (validBarber) {
    return { isValid: true };
  }

  // Se nenhum barbeiro está livre, extrair a razão predominante
  // Prioridade de razões de erro: conflito_agendamento > conflito_buffer > bloqueio_manual > horario_almoco > servico_ultrapassa_expediente > barbearia_fechada > dia_sem_expediente
  const priorityOrder: ConflictReason[] = [
    'conflito_agendamento',
    'conflito_buffer',
    'bloqueio_manual',
    'horario_almoco',
    'servico_ultrapassa_expediente',
    'barbearia_fechada',
    'dia_sem_expediente',
  ];

  let selectedReason: ConflictReason = 'barbearia_fechada';
  for (const reason of priorityOrder) {
    if (results.some(r => r.reason === reason)) {
      selectedReason = reason;
      break;
    }
  }

  // Calcular sugestões
  const suggestions = findSuggestions(
    schedules,
    appointments,
    blocks,
    barberId,
    serviceDuration,
    dateStr,
    timeStr,
    precision,
    bufferMinutes,
    lastStartAllowedTime
  );

  return {
    isValid: false,
    reason: selectedReason,
    suggestions,
  };
};

/**
 * Encontra sugestões automáticas baseando-se nos slots livres calculados.
 */
export const findSuggestions = (
  schedules: BarberSchedule[],
  appointments: Appointment[],
  blocks: TimeBlock[],
  barberId: string,
  serviceDuration: number,
  dateStr: string,
  timeStr: string,
  precision: AgendaPrecision,
  bufferMinutes: number = 0,
  lastStartAllowedTime?: string
): BookingSuggestions => {
  const targetSchedules = barberId === 'first-available'
    ? schedules
    : schedules.filter(s => s.barberId === barberId);

  // 1. Obter todos os slots livres de hoje
  const todaySlots = getUnionSlotsForDay(
    targetSchedules,
    appointments,
    blocks,
    serviceDuration,
    dateStr,
    precision,
    bufferMinutes,
    lastStartAllowedTime
  );

  const targetMins = timeToMinutes(timeStr);

  // Cenário 1: Próximo horário disponível hoje
  let suggestedAlternativeToday: string | null = null;
  // Achar o primeiro slot livre de hoje após o horário digitado
  const afterSlots = todaySlots.filter(s => timeToMinutes(s) > targetMins);
  if (afterSlots.length > 0) {
    suggestedAlternativeToday = afterSlots[0];
  } else if (todaySlots.length > 0) {
    // Se não há depois, sugerir o último livre do dia
    suggestedAlternativeToday = todaySlots[todaySlots.length - 1];
  }

  // Cenário 3: 3 alternativas próximas (antes ou depois)
  const nearbyAlternatives = [...todaySlots]
    .sort((a, b) => Math.abs(timeToMinutes(a) - targetMins) - Math.abs(timeToMinutes(b) - targetMins))
    .slice(0, 3)
    .sort((a, b) => timeToMinutes(a) - timeToMinutes(b)); // Reordenar por hora crescente

  // Cenário 2: Próximo horário disponível nos dias seguintes (se hoje estiver esgotado)
  let suggestedAlternativeTomorrow: { date: string; time: string } | null = null;

  if (todaySlots.length === 0) {
    // Varrer até 7 dias no futuro para encontrar qualquer vaga
    const startObj = new Date(dateStr + 'T00:00:00');
    for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
      const nextDate = new Date(startObj);
      nextDate.setDate(startObj.getDate() + dayOffset);
      const nextDateStr = nextDate.toISOString().split('T')[0];

      const nextDaySlots = getUnionSlotsForDay(
        targetSchedules,
        appointments,
        blocks,
        serviceDuration,
        nextDateStr,
        precision,
        bufferMinutes,
        lastStartAllowedTime
      );

      if (nextDaySlots.length > 0) {
        suggestedAlternativeTomorrow = {
          date: nextDateStr,
          time: nextDaySlots[0],
        };
        break;
      }
    }
  }

  return {
    suggestedAlternativeToday,
    suggestedAlternativeTomorrow,
    nearbyAlternatives,
  };
};
