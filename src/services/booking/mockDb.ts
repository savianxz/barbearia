import type { BarberSchedule, TimeBlock, Appointment, Customer, Shop } from './types';

const KEY_PREFIX = 'fstreet_v2_';
const KEYS = {
  SHOPS: `${KEY_PREFIX}shops`,
  APPOINTMENTS: `${KEY_PREFIX}appointments`,
  CUSTOMERS: `${KEY_PREFIX}customers`,
  BLOCKS: `${KEY_PREFIX}blocks`,
  SCHEDULES: `${KEY_PREFIX}schedules`,
};

// Barbearia Padrão (SaaS Ready)
const DEFAULT_SHOPS: Shop[] = [
  {
    id: 'f-street',
    name: 'Barbearia F Street',
    address: 'Rua Floriano Peixoto, 488 - Centro, Espírito Santo do Pinhal - SP',
    phone: '+55 19 99405-0238',
    instagram: '@barbeariafstreet',
    whatsappLink: 'https://wa.me/5519994050238',
    precision: '15' // Valor inicial: 15 minutos (Pode ser: '5', '10', '15', 'libre')
  }
];

// Dados Iniciais Estáticos / Padrão com escalas personalizadas e múltiplas pausas
const DEFAULT_SCHEDULES: BarberSchedule[] = [
  {
    barberId: 'felipe',
    shopId: 'f-street',
    weeklyConfig: {
      0: { isOpen: true, startTime: '14:00', endTime: '20:00' }, // Domingo
      1: { isOpen: true, startTime: '09:00', endTime: '18:00' }, // Segunda
      2: { isOpen: true, startTime: '08:00', endTime: '20:00' }, // Terça
      3: { isOpen: false, startTime: '00:00', endTime: '00:00' }, // Quarta (Folga)
      4: { isOpen: true, startTime: '13:00', endTime: '20:00' }, // Quinta
      5: { isOpen: true, startTime: '09:00', endTime: '19:00' }, // Sexta
      6: { isOpen: true, startTime: '09:00', endTime: '16:00' }  // Sábado
    },
    pauses: [
      { startTime: '12:00', endTime: '13:00', label: 'Almoço' },
      { startTime: '16:30', endTime: '16:45', label: 'Café da Tarde' }
    ]
  },
  {
    barberId: 'edmar',
    shopId: 'f-street',
    weeklyConfig: {
      0: { isOpen: false, startTime: '00:00', endTime: '00:00' }, // Domingo
      1: { isOpen: false, startTime: '00:00', endTime: '00:00' }, // Segunda
      2: { isOpen: true, startTime: '10:00', endTime: '19:00' },
      3: { isOpen: true, startTime: '10:00', endTime: '19:00' },
      4: { isOpen: true, startTime: '10:00', endTime: '19:00' },
      5: { isOpen: true, startTime: '10:00', endTime: '19:00' },
      6: { isOpen: true, startTime: '10:00', endTime: '19:00' }  // Sábado
    },
    pauses: [
      { startTime: '13:00', endTime: '14:00', label: 'Almoço' }
    ]
  },
  {
    barberId: 'ingrid',
    shopId: 'f-street',
    weeklyConfig: {
      0: { isOpen: false, startTime: '00:00', endTime: '00:00' }, // Domingo
      1: { isOpen: true, startTime: '09:00', endTime: '18:00' },
      2: { isOpen: false, startTime: '00:00', endTime: '00:00' }, // Terça
      3: { isOpen: true, startTime: '09:00', endTime: '18:00' },
      4: { isOpen: false, startTime: '00:00', endTime: '00:00' }, // Quinta
      5: { isOpen: true, startTime: '09:00', endTime: '18:00' },
      6: { isOpen: true, startTime: '09:00', endTime: '16:00' }  // Sábado
    },
    pauses: [
      { startTime: '12:30', endTime: '13:30', label: 'Almoço' }
    ]
  },
  {
    barberId: 'miranda',
    shopId: 'f-street',
    weeklyConfig: {
      0: { isOpen: false, startTime: '00:00', endTime: '00:00' }, // Domingo
      1: { isOpen: true, startTime: '09:00', endTime: '20:00' },
      2: { isOpen: true, startTime: '09:00', endTime: '20:00' },
      3: { isOpen: true, startTime: '09:00', endTime: '20:00' },
      4: { isOpen: true, startTime: '09:00', endTime: '20:00' },
      5: { isOpen: true, startTime: '09:00', endTime: '20:00' },
      6: { isOpen: false, startTime: '00:00', endTime: '00:00' } // Sábado
    },
    pauses: [
      { startTime: '12:00', endTime: '13:00', label: 'Almoço' }
    ]
  }
];

// Agendamentos iniciais salvando startTime, endTime e Duração
const DEFAULT_APPOINTMENTS: Appointment[] = [
  {
    id: 'appt_mock_1',
    shopId: 'f-street',
    customerId: 'cust_mock_1',
    barberId: 'felipe',
    barberName: 'Felipe',
    serviceId: 'corte',
    serviceName: 'Corte',
    servicePrice: 50,
    serviceDuration: 45, // Corte dura 45 min
    date: '2026-07-15',
    startTime: '09:05',  // Ocupa de 09:05 até 09:50
    endTime: '09:50',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    confirmationCode: 'FS-905095'
  },
  {
    id: 'appt_mock_2',
    shopId: 'f-street',
    customerId: 'cust_mock_2',
    barberId: 'edmar',
    barberName: 'Edmar',
    serviceId: 'barboterapia',
    serviceName: 'Barboterapia',
    servicePrice: 80,
    serviceDuration: 45,
    date: '2026-07-15',
    startTime: '15:00',  // Ocupa de 15:00 até 15:45
    endTime: '15:45',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    confirmationCode: 'FS-150015'
  }
];

// Bloqueios complexos pontuais e recorrentes
const DEFAULT_BLOCKS: TimeBlock[] = [
  {
    id: 'block_mock_1',
    barberId: 'edmar',
    shopId: 'f-street',
    type: 'curso',
    title: 'Curso de Especialização',
    startDate: '2026-07-15',
    endDate: '2026-07-17', // Bloqueio de múltiplos dias
    startTime: '14:00',
    endTime: '16:00',
    isRecurring: false
  },
  {
    id: 'block_mock_2',
    barberId: 'miranda',
    shopId: 'f-street',
    type: 'reuniao',
    title: 'Reunião Geral Semanal',
    startDate: '2026-07-01',
    endDate: '2026-12-31',
    startTime: '14:00',
    endTime: '15:30',
    isRecurring: true,
    recurrenceRule: {
      frequency: 'weekly',
      weekdays: [1, 3] // Toda segunda (1) e quarta (3)
    }
  }
];

const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: 'cust_mock_1',
    name: 'Bruno Souza',
    whatsapp: '5519999999999',
    wantsReminders: true,
    wantsPromotions: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cust_mock_2',
    name: 'Rafael Lima',
    whatsapp: '5519888888888',
    wantsReminders: true,
    wantsPromotions: true,
    createdAt: new Date().toISOString()
  }
];

// Helper para ler/escrever do LocalStorage com tolerância para SSR
const isClient = typeof window !== 'undefined';

function getStorageItem<T>(key: string, defaultValue: T): T {
  if (!isClient) return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Erro ao carregar chave ${key} do localStorage`, e);
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  if (!isClient) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Erro ao salvar chave ${key} no localStorage`, e);
  }
}

export const mockDb = {
  getShops(): Shop[] {
    return getStorageItem(KEYS.SHOPS, DEFAULT_SHOPS);
  },

  saveShop(shop: Shop): void {
    const shops = this.getShops();
    const index = shops.findIndex(s => s.id === shop.id);
    if (index >= 0) {
      shops[index] = shop;
    } else {
      shops.push(shop);
    }
    setStorageItem(KEYS.SHOPS, shops);
  },

  getSchedules(): BarberSchedule[] {
    return getStorageItem(KEYS.SCHEDULES, DEFAULT_SCHEDULES);
  },

  getAppointments(): Appointment[] {
    return getStorageItem(KEYS.APPOINTMENTS, DEFAULT_APPOINTMENTS);
  },

  saveAppointment(appt: Appointment): void {
    const appts = this.getAppointments();
    const index = appts.findIndex(a => a.id === appt.id);
    if (index >= 0) {
      appts[index] = appt;
    } else {
      appts.push(appt);
    }
    setStorageItem(KEYS.APPOINTMENTS, appts);
  },

  getTimeBlocks(): TimeBlock[] {
    return getStorageItem(KEYS.BLOCKS, DEFAULT_BLOCKS);
  },

  saveTimeBlock(block: TimeBlock): void {
    const blocks = this.getTimeBlocks();
    blocks.push(block);
    setStorageItem(KEYS.BLOCKS, blocks);
  },

  saveTimeBlocks(blocks: TimeBlock[]): void {
    setStorageItem(KEYS.BLOCKS, blocks);
  },

  saveSchedule(sched: BarberSchedule): void {
    const schedules = this.getSchedules();
    const idx = schedules.findIndex(s => s.barberId === sched.barberId && s.shopId === sched.shopId);
    if (idx >= 0) {
      schedules[idx] = sched;
    } else {
      schedules.push(sched);
    }
    setStorageItem(KEYS.SCHEDULES, schedules);
  },

  getCustomers(): Customer[] {
    return getStorageItem(KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
  },

  saveCustomer(cust: Customer): void {
    const custs = this.getCustomers();
    const index = custs.findIndex(c => c.id === cust.id);
    if (index >= 0) {
      custs[index] = cust;
    } else {
      custs.push(cust);
    }
    setStorageItem(KEYS.CUSTOMERS, custs);
  }
};
