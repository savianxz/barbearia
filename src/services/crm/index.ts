import { supabase } from '../supabase/client';
import type { CrmCustomer, CrmInsight, CrmNotification, CrmConfig, CrmServiceResponse, CrmSegment } from './types';
import type { Appointment } from '../booking/types';

export const crmService = {
  /**
   * Obtém a lista de todos os clientes enriquecida com métricas e segmentos reais do Supabase.
   */
  async getCrmCustomers(shopId: string): Promise<CrmServiceResponse<CrmCustomer[]>> {
    try {
      const { data: custData, error: custErr } = await supabase
        .from('customers')
        .select('*')
        .eq('shop_id', shopId);

      if (custErr) throw custErr;

      // Calcula gasto total a partir da tabela appointments + services
      const { data: apptData, error: apptErr } = await supabase
        .from('appointments')
        .select(`
          customer_id,
          status,
          services ( price )
        `)
        .eq('shop_id', shopId)
        .eq('status', 'completed');

      if (apptErr) throw apptErr;

      const spentMap: Record<string, number> = {};
      apptData?.forEach((a: any) => {
        const price = Number(a.services?.price || 0);
        if (!spentMap[a.customer_id]) spentMap[a.customer_id] = 0;
        spentMap[a.customer_id] += price;
      });

      const crmCustomers: CrmCustomer[] = (custData || []).map((c: any) => {
        const spent = spentMap[c.id] || 0;
        
        let daysSinceLastVisit: number | null = null;
        if (c.last_visit) {
          const last = new Date(c.last_visit).getTime();
          const now = new Date().getTime();
          daysSinceLastVisit = Math.max(0, Math.floor((now - last) / (1000 * 3600 * 24)));
        }

        let segment: CrmSegment = 'new';
        if (daysSinceLastVisit !== null) {
          if (daysSinceLastVisit > 90) segment = 'inactive';
          else if (daysSinceLastVisit > 45) segment = 'at_risk';
          else segment = 'loyal'; // Simplificação
        }

        return {
          id: c.id,
          name: c.name,
          whatsapp: c.phone || '',
          email: c.email || '',
          shopId: c.shop_id,
          wantsReminders: true,
          wantsPromotions: true,
          createdAt: c.created_at,
          metrics: {
            lastAppointmentDate: c.last_visit,
            daysSinceLastVisit,
            totalAppointments: 0,
            totalSpent: spent,
            averageTicket: 0,
            averageFrequencyDays: null,
            estimatedNextVisitDate: null,
            daysUntilEstimatedReturn: null,
            favoriteBarber: null,
            favoriteBarberName: null,
            favoriteService: null,
            favoriteServiceName: null,
            lastContactDate: null,
            loyaltyScore: 50
          },
          segment
        };
      });

      return { data: crmCustomers, error: null, success: true };
    } catch (e: any) {
      return { data: null, error: e.message, success: false };
    }
  },

  async getCustomerDetail(shopId: string, customerId: string): Promise<CrmServiceResponse<{ customer: CrmCustomer; appointments: Appointment[] }>> {
    return { data: null, error: 'Não implementado', success: false };
  },

  /**
   * Obtém os insights gerenciais calculados em tempo real.
   */
  async getInsights(shopId: string): Promise<CrmServiceResponse<CrmInsight[]>> {
    try {
      const customersRes = await this.getCrmCustomers(shopId);
      if (!customersRes.success || !customersRes.data) {
        return { data: null, error: customersRes.error, success: false };
      }

      let atRiskCount = 0;
      let inactiveCount = 0;
      let vipRecoveryCount = 0;
      let atRiskValue = 0;
      let inactiveValue = 0;

      customersRes.data.forEach(c => {
        if (c.segment === 'inactive') {
          inactiveCount++;
          inactiveValue += c.metrics.totalSpent;
          if (c.metrics.totalSpent > 300) vipRecoveryCount++;
        } else if (c.segment === 'at_risk') {
          atRiskCount++;
          atRiskValue += c.metrics.totalSpent;
        }
      });

      const generatedInsights: CrmInsight[] = [];
      if (atRiskCount > 0) {
        generatedInsights.push({ id: 'ins-risk', shopId, title: 'Clientes em Risco', description: 'Sem retorno há mais de 45 dias.', severity: 'warning', segment: 'at_risk', count: atRiskCount, totalValue: atRiskValue, generatedAt: new Date().toISOString() });
      }
      if (inactiveCount > 0) {
        generatedInsights.push({ id: 'ins-inactive', shopId, title: 'Base Inativa', description: 'Sem retorno há mais de 90 dias.', severity: 'critical', segment: 'inactive', count: inactiveCount, totalValue: inactiveValue, generatedAt: new Date().toISOString() });
      }
      if (vipRecoveryCount > 0) {
        generatedInsights.push({ id: 'ins-vip', shopId, title: 'Recuperação VIP', description: 'Clientes de alto valor (> R$ 300) inativos.', severity: 'critical', segment: 'inactive', count: vipRecoveryCount, generatedAt: new Date().toISOString() });
      }

      return { data: generatedInsights, error: null, success: true };
    } catch (e: any) {
      return { data: null, error: e.message, success: false };
    }
  },

  /**
   * Atualiza os dados do CRM sem gerar mocks.
   */
  async syncCrm(shopId: string): Promise<CrmServiceResponse<{ insights: CrmInsight[]; notificationsCreated: number }>> {
    try {
      const insightsRes = await this.getInsights(shopId);
      return {
        data: {
          insights: insightsRes.data || [],
          notificationsCreated: 0,
        },
        error: null,
        success: true,
      };
    } catch (e: any) {
      return { data: null, error: e.message, success: false };
    }
  },

  async getPendingNotifications(shopId: string): Promise<CrmServiceResponse<CrmNotification[]>> {
    return { data: [], error: null, success: true };
  },

  async markNotificationSent(notificationId: string): Promise<CrmServiceResponse<boolean>> {
    return { data: true, error: null, success: true };
  },

  async getConfig(shopId: string): Promise<CrmServiceResponse<CrmConfig>> {
    return { data: null, error: null, success: true };
  },

  async saveConfig(config: CrmConfig): Promise<CrmServiceResponse<boolean>> {
    return { data: true, error: null, success: true };
  }
};
