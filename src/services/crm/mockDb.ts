import type { CrmConfig, CrmNotification } from './types';
import type { Customer, Appointment } from '../booking/types';
import { mockDb as bookingMockDb } from '../booking/mockDb';

const KEY_PREFIX = 'fstreet_crm_';
const KEYS = {
  CONFIG: `${KEY_PREFIX}config`,
  NOTIFICATIONS: `${KEY_PREFIX}notifications`,
};

// Configuração padrão do CRM para a barbearia
const DEFAULT_CRM_CONFIG: CrmConfig = {
  shopId: 'f-street',
  newCustomerWindowDays: 30,
  inactiveDays: 90,
  atRiskMultiplier: 1.4,
  vipMinSpend: 400,
  vipMinVisits: 8,
  vipMinLoyaltyScore: 70,
  clubEligibleMinVisits: 6,
  scoreWeightRecency: 30,
  scoreWeightFrequency: 30,
  scoreWeightMonetary: 25,
  scoreWeightVisitCount: 15,
};

// Histórico rico de clientes do CRM para testes realistas
export const RICH_CRM_CUSTOMERS: Customer[] = [
  {
    id: 'cust_crm_vip',
    name: 'Bruno Souza (VIP)',
    whatsapp: '5519999991111',
    email: 'bruno.vip@gmail.com',
    wantsReminders: true,
    wantsPromotions: true,
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'cust_crm_loyal',
    name: 'Rafael Lima (Leal)',
    whatsapp: '5519999992222',
    email: 'rafael.loyal@gmail.com',
    wantsReminders: true,
    wantsPromotions: false,
    createdAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'cust_crm_at_risk',
    name: 'Carlos Santos (Em Risco)',
    whatsapp: '5519999993333',
    email: 'carlos.risk@gmail.com',
    wantsReminders: true,
    wantsPromotions: true,
    createdAt: '2026-04-01T10:00:00Z',
  },
  {
    id: 'cust_crm_inactive',
    name: 'Marcos Oliveira (Inativo)',
    whatsapp: '5519999994444',
    email: 'marcos.inactive@gmail.com',
    wantsReminders: true,
    wantsPromotions: false,
    createdAt: '2025-06-01T10:00:00Z',
  },
  {
    id: 'cust_crm_never_returned',
    name: 'Thiago Silva (Não Retornou)',
    whatsapp: '5519999995555',
    email: 'thiago.one@gmail.com',
    wantsReminders: true,
    wantsPromotions: true,
    createdAt: '2026-05-01T10:00:00Z',
  },
  {
    id: 'cust_crm_new',
    name: 'Gabriel Costa (Novo)',
    whatsapp: '5519999996666',
    email: 'gabriel.new@gmail.com',
    wantsReminders: true,
    wantsPromotions: true,
    createdAt: '2026-07-09T10:00:00Z',
  },
  {
    id: 'cust_crm_club',
    name: 'Lucas Pereira (Apto ao Clube)',
    whatsapp: '5519999997777',
    email: 'lucas.club@gmail.com',
    wantsReminders: true,
    wantsPromotions: true,
    createdAt: '2026-01-10T10:00:00Z',
  }
];

// Gerar datas no passado relativo à data simulada de hoje (2026-07-11)
export const RICH_CRM_APPOINTMENTS: Appointment[] = [
  // ── Bruno Souza (VIP): 10 atendimentos, muito frequente (~15 dias), gasto total: R$ 510
  ...[
    { date: '2026-02-15', price: 50, barber: 'felipe', bName: 'Felipe', service: 'corte', sName: 'Corte' },
    { date: '2026-03-02', price: 50, barber: 'felipe', bName: 'Felipe', service: 'corte', sName: 'Corte' },
    { date: '2026-03-17', price: 60, barber: 'felipe', bName: 'Felipe', service: 'corte-barba', sName: 'Corte & Barba' },
    { date: '2026-04-01', price: 50, barber: 'felipe', bName: 'Felipe', service: 'corte', sName: 'Corte' },
    { date: '2026-04-16', price: 50, barber: 'edmar', bName: 'Edmar', service: 'corte', sName: 'Corte' },
    { date: '2026-05-02', price: 50, barber: 'felipe', bName: 'Felipe', service: 'corte', sName: 'Corte' },
    { date: '2026-05-17', price: 60, barber: 'felipe', bName: 'Felipe', service: 'corte-barba', sName: 'Corte & Barba' },
    { date: '2026-06-02', price: 50, barber: 'felipe', bName: 'Felipe', service: 'corte', sName: 'Corte' },
    { date: '2026-06-18', price: 80, barber: 'felipe', bName: 'Felipe', service: 'barboterapia', sName: 'Barboterapia' },
    { date: '2026-07-04', price: 60, barber: 'felipe', bName: 'Felipe', service: 'corte-barba', sName: 'Corte & Barba' },
  ].map((a, idx) => ({
    id: `appt_crm_vip_${idx}`,
    shopId: 'f-street',
    customerId: 'cust_crm_vip',
    barberId: a.barber,
    barberName: a.bName,
    serviceId: a.service,
    serviceName: a.sName,
    servicePrice: a.price,
    serviceDuration: 45,
    date: a.date,
    startTime: '10:00',
    endTime: '10:45',
    status: 'completed' as const,
    confirmationCode: `VIP-${idx}`,
    createdAt: new Date(a.date).toISOString(),
    updatedAt: new Date(a.date).toISOString(),
  })),

  // ── Rafael Lima (Leal): 5 atendimentos, regularidade mensal (~30 dias), gasto total R$ 250
  ...[
    { date: '2026-03-05', price: 50 },
    { date: '2026-04-04', price: 50 },
    { date: '2026-05-04', price: 50 },
    { date: '2026-06-03', price: 50 },
    { date: '2026-07-02', price: 50 },
  ].map((a, idx) => ({
    id: `appt_crm_loyal_${idx}`,
    shopId: 'f-street',
    customerId: 'cust_crm_loyal',
    barberId: 'edmar',
    barberName: 'Edmar',
    serviceId: 'corte',
    serviceName: 'Corte',
    servicePrice: a.price,
    serviceDuration: 45,
    date: a.date,
    startTime: '14:00',
    endTime: '14:45',
    status: 'completed' as const,
    confirmationCode: `LOY-${idx}`,
    createdAt: new Date(a.date).toISOString(),
    updatedAt: new Date(a.date).toISOString(),
  })),

  // ── Carlos Santos (Em Risco): 4 atendimentos, última há 42 dias (costumava ir a cada ~18 dias)
  ...[
    { date: '2026-04-10', price: 50 },
    { date: '2026-04-28', price: 50 },
    { date: '2026-05-14', price: 60 },
    { date: '2026-05-30', price: 50 },
  ].map((a, idx) => ({
    id: `appt_crm_risk_${idx}`,
    shopId: 'f-street',
    customerId: 'cust_crm_at_risk',
    barberId: 'ingrid',
    barberName: 'Ingrid',
    serviceId: 'corte',
    serviceName: 'Corte',
    servicePrice: a.price,
    serviceDuration: 45,
    date: a.date,
    startTime: '16:00',
    endTime: '16:45',
    status: 'completed' as const,
    confirmationCode: `RSK-${idx}`,
    createdAt: new Date(a.date).toISOString(),
    updatedAt: new Date(a.date).toISOString(),
  })),

  // ── Marcos Oliveira (Inativo): 6 atendimentos em 2025, sumido há mais de 140 dias
  ...[
    { date: '2025-09-10', price: 50 },
    { date: '2025-10-12', price: 50 },
    { date: '2025-11-15', price: 50 },
    { date: '2025-12-14', price: 50 },
    { date: '2026-01-15', price: 50 },
    { date: '2026-02-15', price: 50 },
  ].map((a, idx) => ({
    id: `appt_crm_inact_${idx}`,
    shopId: 'f-street',
    customerId: 'cust_crm_inactive',
    barberId: 'miranda',
    barberName: 'Miranda',
    serviceId: 'corte',
    serviceName: 'Corte',
    servicePrice: a.price,
    serviceDuration: 45,
    date: a.date,
    startTime: '11:00',
    endTime: '11:45',
    status: 'completed' as const,
    confirmationCode: `INA-${idx}`,
    createdAt: new Date(a.date).toISOString(),
    updatedAt: new Date(a.date).toISOString(),
  })),

  // ── Thiago Silva (Não Retornou): Apenas 1 atendimento há 71 dias
  {
    id: 'appt_crm_never_1',
    shopId: 'f-street',
    customerId: 'cust_crm_never_returned',
    barberId: 'felipe',
    barberName: 'Felipe',
    serviceId: 'corte',
    serviceName: 'Corte',
    servicePrice: 50,
    serviceDuration: 45,
    date: '2026-05-01',
    startTime: '09:00',
    endTime: '09:45',
    status: 'completed' as const,
    confirmationCode: 'NEV-1',
    createdAt: '2026-05-01T09:00:00Z',
    updatedAt: '2026-05-01T09:00:00Z',
  },

  // ── Gabriel Costa (Novo): Criado há 2 dias
  {
    id: 'appt_crm_new_1',
    shopId: 'f-street',
    customerId: 'cust_crm_new',
    barberId: 'edmar',
    barberName: 'Edmar',
    serviceId: 'corte',
    serviceName: 'Corte',
    servicePrice: 50,
    serviceDuration: 45,
    date: '2026-07-09',
    startTime: '10:00',
    endTime: '10:45',
    status: 'completed' as const,
    confirmationCode: 'NEW-1',
    createdAt: '2026-07-09T10:00:00Z',
    updatedAt: '2026-07-09T10:00:00Z',
  },

  // ── Lucas Pereira (Apto ao Clube): 8 atendimentos, super frequente (~20 dias), última há 7 dias
  ...[
    { date: '2026-02-10', price: 50 },
    { date: '2026-03-02', price: 50 },
    { date: '2026-03-22', price: 50 },
    { date: '2026-04-11', price: 50 },
    { date: '2026-05-01', price: 50 },
    { date: '2026-05-21', price: 50 },
    { date: '2026-06-10', price: 50 },
    { date: '2026-07-04', price: 50 },
  ].map((a, idx) => ({
    id: `appt_crm_club_${idx}`,
    shopId: 'f-street',
    customerId: 'cust_crm_club',
    barberId: 'ingrid',
    barberName: 'Ingrid',
    serviceId: 'corte',
    serviceName: 'Corte',
    servicePrice: a.price,
    serviceDuration: 45,
    date: a.date,
    startTime: '15:30',
    endTime: '16:15',
    status: 'completed' as const,
    confirmationCode: `CLB-${idx}`,
    createdAt: new Date(a.date).toISOString(),
    updatedAt: new Date(a.date).toISOString(),
  })),
];

const isClient = typeof window !== 'undefined';

function getStorageItem<T>(key: string, defaultValue: T): T {
  if (!isClient) return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Erro ao carregar chave ${key} do CRM mock`, e);
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  if (!isClient) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Erro ao salvar chave ${key} no CRM mock`, e);
  }
}

export const crmMockDb = {
  // Semeia o banco de dados principal de agendamentos e clientes se eles ainda não existirem lá
  seedDatabase(): void {
    const existingCustomers = bookingMockDb.getCustomers();
    const needsSeed = !existingCustomers.some(c => c.id.startsWith('cust_crm_'));

    if (needsSeed) {
      // Adicionar os clientes ricos
      RICH_CRM_CUSTOMERS.forEach(cust => {
        bookingMockDb.saveCustomer(cust);
      });

      // Adicionar os agendamentos ricos
      RICH_CRM_APPOINTMENTS.forEach(appt => {
        bookingMockDb.saveAppointment(appt);
      });
    }
  },

  getConfig(shopId: string): CrmConfig {
    const configs = getStorageItem<CrmConfig[]>(KEYS.CONFIG, [DEFAULT_CRM_CONFIG]);
    const config = configs.find(c => c.shopId === shopId);
    return config || { ...DEFAULT_CRM_CONFIG, shopId };
  },

  saveConfig(config: CrmConfig): void {
    const configs = getStorageItem<CrmConfig[]>(KEYS.CONFIG, [DEFAULT_CRM_CONFIG]);
    const index = configs.findIndex(c => c.shopId === config.shopId);
    if (index >= 0) {
      configs[index] = config;
    } else {
      configs.push(config);
    }
    setStorageItem(KEYS.CONFIG, configs);
  },

  getNotifications(): CrmNotification[] {
    return getStorageItem<CrmNotification[]>(KEYS.NOTIFICATIONS, []);
  },

  saveNotifications(notifs: CrmNotification[]): void {
    const current = this.getNotifications();
    
    // Mescla as notificações existentes com as novas, evitando duplicados
    const merged = [...current];
    notifs.forEach(newNotif => {
      const idx = merged.findIndex(n => n.id === newNotif.id);
      if (idx >= 0) {
        merged[idx] = newNotif;
      } else {
        merged.push(newNotif);
      }
    });

    setStorageItem(KEYS.NOTIFICATIONS, merged);
  },

  updateNotificationStatus(id: string, status: CrmNotification['status'], sentAt: string | null = null): void {
    const notifs = this.getNotifications();
    const idx = notifs.findIndex(n => n.id === id);
    if (idx >= 0) {
      notifs[idx].status = status;
      notifs[idx].sentAt = sentAt;
      setStorageItem(KEYS.NOTIFICATIONS, notifs);
    }
  }
};
