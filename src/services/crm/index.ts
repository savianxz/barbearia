import { supabase } from '../supabase/client';
import type { CrmCustomer, CrmInsight, CrmNotification, CrmConfig, CrmServiceResponse } from './types';
import type { Appointment } from '../booking/types';

export const crmService = {
  /**
   * Obtém a lista de todos os clientes enriquecida com métricas e segmentos reais do Supabase.
   */
  async getCrmCustomers(shopId: string): Promise<CrmServiceResponse<CrmCustomer[]>> {
    try {
      const { data, error } = await supabase
        .rpc('get_crm_customers', { p_shop_id: shopId });

      if (error) throw error;

      const crmCustomers: CrmCustomer[] = (data || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        whatsapp: c.phone || '',
        email: c.email || '',
        shopId: c.shop_id,
        wantsReminders: true,
        wantsPromotions: true,
        isClubMember: c.is_club_member || false,
        createdAt: c.created_at,
        metrics: {
          lastAppointmentDate: c.last_appointment_date,
          daysSinceLastVisit: c.days_since_last_visit,
          totalAppointments: c.total_appointments || 0,
          totalSpent: c.total_spent || 0,
          averageTicket: (c.total_spent && c.total_appointments) ? (c.total_spent / c.total_appointments) : 0,
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
        segment: c.segment || 'regular'
      }));

      return { data: crmCustomers, error: null, success: true };
    } catch (e: any) {
      return { data: null, error: e.message, success: false };
    }
  },

  async getCustomerDetail(_shopId: string, _customerId: string): Promise<CrmServiceResponse<{ customer: CrmCustomer; appointments: Appointment[] }>> {
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

  async getPendingNotifications(_shopId: string): Promise<CrmServiceResponse<CrmNotification[]>> {
    return { data: [], error: null, success: true };
  },

  async markNotificationSent(_notificationId: string): Promise<CrmServiceResponse<boolean>> {
    return { data: true, error: null, success: true };
  },

  async getConfig(_shopId: string): Promise<CrmServiceResponse<CrmConfig>> {
    return { data: null, error: null, success: true };
  },

  async saveConfig(_config: CrmConfig): Promise<CrmServiceResponse<boolean>> {
    return { data: true, error: null, success: true };
  },

  async toggleClubMembership(customerId: string, isClubMember: boolean): Promise<CrmServiceResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('customers')
        .update({ is_club_member: isClubMember })
        .eq('id', customerId);
        
      if (error) throw error;
      return { data: true, error: null, success: true };
    } catch (e: any) {
      return { data: null, error: e.message, success: false };
    }
  }
};
