import { supabase } from '../supabase/client';
import type { ShopSettings, Barber, Service } from '../../types/settings';

export const settingsService = {
  /**
   * Obtém as configurações gerais da barbearia (tenant atual do usuário logado)
   */
  async getShopSettings(shopId: string): Promise<{ data: ShopSettings | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('id', shopId)
        .single();

      if (error) throw error;
      return { data: data as ShopSettings, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Erro ao carregar configurações da barbearia.' };
    }
  },

  /**
   * Atualiza as configurações da barbearia
   */
  async updateShopSettings(shopId: string, updates: Partial<ShopSettings>): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('shops')
        .update(updates)
        .eq('id', shopId);

      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Erro ao atualizar configurações da barbearia.' };
    }
  },

  /**
   * Obtém a lista de barbeiros
   */
  async getBarbers(shopId: string): Promise<{ data: Barber[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .eq('shop_id', shopId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return { data: data as Barber[], error: null };
    } catch (err: any) {
      return { data: [], error: err.message || 'Erro ao carregar equipe.' };
    }
  },

  /**
   * Adiciona ou atualiza um barbeiro
   */
  async saveBarber(barber: Partial<Barber>): Promise<{ data: Barber | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('barbers')
        .upsert(barber)
        .select()
        .single();

      if (error) throw error;
      return { data: data as Barber, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Erro ao salvar barbeiro.' };
    }
  },

  /**
   * Remove um barbeiro
   */
  async deleteBarber(barberId: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('barbers')
        .delete()
        .eq('id', barberId);

      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Erro ao remover barbeiro.' };
    }
  },

  /**
   * Obtém a lista de serviços
   */
  async getServices(shopId: string): Promise<{ data: Service[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('shop_id', shopId)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      return { data: data as Service[], error: null };
    } catch (err: any) {
      return { data: [], error: err.message || 'Erro ao carregar serviços.' };
    }
  },

  /**
   * Adiciona ou atualiza um serviço
   */
  async saveService(service: Partial<Service>): Promise<{ data: Service | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('services')
        .upsert(service)
        .select()
        .single();

      if (error) throw error;
      return { data: data as Service, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Erro ao salvar serviço.' };
    }
  },

  /**
   * Remove um serviço
   */
  async deleteService(serviceId: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Erro ao remover serviço.' };
    }
  }
};
