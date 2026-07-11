import type { CrmCustomer, CrmInsight, CrmNotification, CrmConfig, CrmServiceResponse } from './types';
import type { Appointment } from '../booking/types';
import { mockDb as bookingMockDb } from '../booking/mockDb';
import { crmMockDb } from './mockDb';
import { calculateMetrics, classifySegment, generateInsights, buildNotificationQueue } from './engine';

// Para consistência de testes, usamos o dia de hoje definido no sistema ou 2026-07-11
const MOCK_TODAY = '2026-07-11';

export const crmService = {
  /**
   * Inicializa o banco de dados do CRM com dados realistas se necessário.
   */
  initialize(): void {
    crmMockDb.seedDatabase();
  },

  /**
   * Obtém a lista de todos os clientes enriquecida com métricas e segmentos.
   */
  async getCrmCustomers(shopId: string): Promise<CrmServiceResponse<CrmCustomer[]>> {
    try {
      this.initialize();

      const customers = bookingMockDb.getCustomers();
      const appointments = bookingMockDb.getAppointments();
      const config = crmMockDb.getConfig(shopId);
      const notifications = crmMockDb.getNotifications();

      // Mapear última notificação enviada por cliente
      const lastContactMap: Record<string, string> = {};
      notifications
        .filter(n => n.shopId === shopId && n.status === 'sent' && n.sentAt)
        .forEach(n => {
          const dateStr = n.sentAt!.split('T')[0];
          const current = lastContactMap[n.customerId];
          if (!current || dateStr.localeCompare(current) > 0) {
            lastContactMap[n.customerId] = dateStr;
          }
        });

      const crmCustomers: CrmCustomer[] = customers.map(cust => {
        const lastContact = lastContactMap[cust.id] || null;
        const metrics = calculateMetrics(cust, appointments, config, MOCK_TODAY, lastContact);
        const segment = classifySegment(metrics, config);

        return {
          id: cust.id,
          name: cust.name,
          whatsapp: cust.whatsapp,
          email: cust.email,
          shopId,
          wantsReminders: cust.wantsReminders,
          wantsPromotions: cust.wantsPromotions,
          createdAt: cust.createdAt,
          metrics,
          segment,
        };
      });

      return { data: crmCustomers, error: null, success: true };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Erro desconhecido', success: false };
    }
  },

  /**
   * Detalhes de um cliente específico no CRM.
   */
  async getCustomerDetail(
    shopId: string,
    customerId: string
  ): Promise<CrmServiceResponse<{ customer: CrmCustomer; appointments: Appointment[] }>> {
    try {
      this.initialize();

      const customers = bookingMockDb.getCustomers();
      const customer = customers.find(c => c.id === customerId);

      if (!customer) {
        return { data: null, error: 'Cliente não encontrado', success: false };
      }

      const allAppointments = bookingMockDb.getAppointments();
      const customerAppointments = allAppointments
        .filter(a => a.customerId === customerId)
        .sort((a, b) => b.date.localeCompare(a.date)); // Mais recentes primeiro

      const config = crmMockDb.getConfig(shopId);
      const notifications = crmMockDb.getNotifications();

      // Último contato
      const lastSentNotif = notifications
        .filter(n => n.customerId === customerId && n.status === 'sent' && n.sentAt)
        .sort((a, b) => b.sentAt!.localeCompare(a.sentAt!))[0];
      const lastContact = lastSentNotif ? lastSentNotif.sentAt!.split('T')[0] : null;

      const metrics = calculateMetrics(customer, allAppointments, config, MOCK_TODAY, lastContact);
      const segment = classifySegment(metrics, config);

      const crmCustomer: CrmCustomer = {
        id: customer.id,
        name: customer.name,
        whatsapp: customer.whatsapp,
        email: customer.email,
        shopId,
        wantsReminders: customer.wantsReminders,
        wantsPromotions: customer.wantsPromotions,
        createdAt: customer.createdAt,
        metrics,
        segment,
      };

      return {
        data: { customer: crmCustomer, appointments: customerAppointments },
        error: null,
        success: true,
      };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Erro desconhecido', success: false };
    }
  },

  /**
   * Obtém os insights gerenciais do CRM.
   */
  async getInsights(shopId: string): Promise<CrmServiceResponse<CrmInsight[]>> {
    try {
      const customersRes = await this.getCrmCustomers(shopId);
      if (!customersRes.success || !customersRes.data) {
        return { data: null, error: customersRes.error, success: false };
      }

      const insights = generateInsights(customersRes.data, MOCK_TODAY);
      return { data: insights, error: null, success: true };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Erro desconhecido', success: false };
    }
  },

  /**
   * Executa a sincronização do CRM: recalcula segmentos, gera insights e enfileira novas notificações.
   */
  async syncCrm(shopId: string): Promise<CrmServiceResponse<{ insights: CrmInsight[]; notificationsCreated: number }>> {
    try {
      const customersRes = await this.getCrmCustomers(shopId);
      if (!customersRes.success || !customersRes.data) {
        return { data: null, error: customersRes.error, success: false };
      }

      const existingNotifications = crmMockDb.getNotifications();

      // Gera novas notificações sugeridas
      const newNotifications = buildNotificationQueue(customersRes.data, MOCK_TODAY, existingNotifications);

      if (newNotifications.length > 0) {
        crmMockDb.saveNotifications(newNotifications);
      }

      const insights = generateInsights(customersRes.data, MOCK_TODAY);

      return {
        data: {
          insights,
          notificationsCreated: newNotifications.length,
        },
        error: null,
        success: true,
      };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Erro desconhecido', success: false };
    }
  },

  /**
   * Obtém a fila de notificações pendentes do CRM.
   */
  async getPendingNotifications(shopId: string): Promise<CrmServiceResponse<CrmNotification[]>> {
    try {
      const allNotifs = crmMockDb.getNotifications();
      const pending = allNotifs
        .filter(n => n.shopId === shopId && n.status === 'pending')
        .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

      return { data: pending, error: null, success: true };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Erro desconhecido', success: false };
    }
  },

  /**
   * Altera o status de uma notificação para "enviada".
   */
  async markNotificationSent(notificationId: string): Promise<CrmServiceResponse<boolean>> {
    try {
      crmMockDb.updateNotificationStatus(notificationId, 'sent', new Date().toISOString());
      return { data: true, error: null, success: true };
    } catch (e) {
      return { data: false, error: e instanceof Error ? e.message : 'Erro desconhecido', success: false };
    }
  },

  /**
   * Obtém a configuração atual do CRM.
   */
  async getConfig(shopId: string): Promise<CrmServiceResponse<CrmConfig>> {
    try {
      const config = crmMockDb.getConfig(shopId);
      return { data: config, error: null, success: true };
    } catch (e) {
      return { data: null, error: e instanceof Error ? e.message : 'Erro desconhecido', success: false };
    }
  },

  /**
   * Salva uma nova configuração para o CRM.
   */
  async saveConfig(config: CrmConfig): Promise<CrmServiceResponse<boolean>> {
    try {
      crmMockDb.saveConfig(config);
      return { data: true, error: null, success: true };
    } catch (e) {
      return { data: false, error: e instanceof Error ? e.message : 'Erro desconhecido', success: false };
    }
  }
};
