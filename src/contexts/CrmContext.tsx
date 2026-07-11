import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { CrmCustomer, CrmInsight, CrmNotification, CrmConfig } from '../services/crm/types';
import { crmService } from '../services/crm';

interface CrmContextType {
  crmCustomers: CrmCustomer[];
  insights: CrmInsight[];
  pendingNotifications: CrmNotification[];
  config: CrmConfig | null;
  loading: boolean;
  error: string | null;
  refreshCrm: () => Promise<void>;
  syncCrm: () => Promise<void>;
  markNotificationSent: (notificationId: string) => Promise<boolean>;
  updateConfig: (newConfig: CrmConfig) => Promise<boolean>;
}

const CrmContext = createContext<CrmContextType | undefined>(undefined);

export const CrmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [crmCustomers, setCrmCustomers] = useState<CrmCustomer[]>([]);
  const [insights, setInsights] = useState<CrmInsight[]>([]);
  const [pendingNotifications, setPendingNotifications] = useState<CrmNotification[]>([]);
  const [config, setConfig] = useState<CrmConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shopId = 'f-street'; // Configuração fixa padrão para a barbearia inicial

  const refreshCrm = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [customersRes, insightsRes, notificationsRes, configRes] = await Promise.all([
        crmService.getCrmCustomers(shopId),
        crmService.getInsights(shopId),
        crmService.getPendingNotifications(shopId),
        crmService.getConfig(shopId),
      ]);

      if (customersRes.success && customersRes.data) {
        setCrmCustomers(customersRes.data);
      } else {
        setError(customersRes.error);
      }

      if (insightsRes.success && insightsRes.data) {
        setInsights(insightsRes.data);
      }

      if (notificationsRes.success && notificationsRes.data) {
        setPendingNotifications(notificationsRes.data);
      }

      if (configRes.success && configRes.data) {
        setConfig(configRes.data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao atualizar dados do CRM.');
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  const syncCrm = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await crmService.syncCrm(shopId);
      if (res.success && res.data) {
        // Atualiza a lista após rodar a engine e enfileirar as mensagens de resgate
        await refreshCrm();
      } else {
        setError(res.error);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao sincronizar CRM.');
    } finally {
      setLoading(false);
    }
  }, [shopId, refreshCrm]);

  const markNotificationSent = useCallback(async (notificationId: string): Promise<boolean> => {
    try {
      const res = await crmService.markNotificationSent(notificationId);
      if (res.success) {
        // Atualiza as notificações pendentes localmente para melhor UX
        setPendingNotifications(prev => prev.filter(n => n.id !== notificationId));
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  }, []);

  const updateConfig = useCallback(async (newConfig: CrmConfig): Promise<boolean> => {
    try {
      const res = await crmService.saveConfig(newConfig);
      if (res.success) {
        setConfig(newConfig);
        await refreshCrm();
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  }, [refreshCrm]);

  // Executa uma carga inicial
  useEffect(() => {
    refreshCrm();
  }, [refreshCrm]);

  return (
    <CrmContext.Provider
      value={{
        crmCustomers,
        insights,
        pendingNotifications,
        config,
        loading,
        error,
        refreshCrm,
        syncCrm,
        markNotificationSent,
        updateConfig,
      }}
    >
      {children}
    </CrmContext.Provider>
  );
};

export const useCrm = () => {
  const context = useContext(CrmContext);
  if (context === undefined) {
    throw new Error('useCrm deve ser usado dentro de um CrmProvider');
  }
  return context;
};
