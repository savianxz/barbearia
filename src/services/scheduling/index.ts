import { supabase } from '../supabase/client';
import type {
  Barber, CreateBarberInput, UpdateBarberInput,
  Service, CreateServiceInput, UpdateServiceInput,
} from '../../types/scheduling';

type ApiResult<T> = { data: T | null; error: string | null };

// ─── BARBEIROS ────────────────────────────────────────────────

export const barbersApi = {
  async list(shopId: string): Promise<ApiResult<Barber[]>> {
    try {
      const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .eq('shop_id', shopId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return { data: data as Barber[], error: null };
    } catch (e: any) {
      return { data: null, error: e.message };
    }
  },

  async create(input: CreateBarberInput): Promise<ApiResult<Barber>> {
    try {
      const { data, error } = await supabase
        .from('barbers')
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return { data: data as Barber, error: null };
    } catch (e: any) {
      return { data: null, error: e.message };
    }
  },

  async update(id: string, input: UpdateBarberInput): Promise<ApiResult<Barber>> {
    try {
      const { data, error } = await supabase
        .from('barbers')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { data: data as Barber, error: null };
    } catch (e: any) {
      return { data: null, error: e.message };
    }
  },

  async delete(id: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.from('barbers').delete().eq('id', id);
      if (error) throw error;
      return { error: null };
    } catch (e: any) {
      return { error: e.message };
    }
  },

  async toggleActive(id: string, is_active: boolean): Promise<ApiResult<Barber>> {
    return barbersApi.update(id, { is_active });
  },
};

// ─── SERVIÇOS ─────────────────────────────────────────────────

export const servicesApi = {
  async list(shopId: string): Promise<ApiResult<Service[]>> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('shop_id', shopId)
        .order('name', { ascending: true });
      if (error) throw error;
      return { data: data as Service[], error: null };
    } catch (e: any) {
      return { data: null, error: e.message };
    }
  },

  async create(input: CreateServiceInput): Promise<ApiResult<Service>> {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return { data: data as Service, error: null };
    } catch (e: any) {
      return { data: null, error: e.message };
    }
  },

  async update(id: string, input: UpdateServiceInput): Promise<ApiResult<Service>> {
    try {
      const { data, error } = await supabase
        .from('services')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { data: data as Service, error: null };
    } catch (e: any) {
      return { data: null, error: e.message };
    }
  },

  async delete(id: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
      return { error: null };
    } catch (e: any) {
      return { error: e.message };
    }
  },

  async toggleActive(id: string, is_active: boolean): Promise<ApiResult<Service>> {
    return servicesApi.update(id, { is_active });
  },
};

// ─── PUBLIC API (RPC) ─────────────────────────────────────────

export const publicApi = {
  async getShop(shopId?: string, slug?: string): Promise<ApiResult<any>> {
    try {
      const { data, error } = await supabase.rpc('get_public_shop', { p_shop_id: shopId || null, p_slug: slug || null }).maybeSingle();
      if (error) throw error;
      return { data, error: null };
    } catch (e: any) {
      return { data: null, error: e.message };
    }
  },
  async listBarbers(shopId: string): Promise<ApiResult<any[]>> {
    try {
      const { data, error } = await supabase.rpc('get_public_barbers', { p_shop_id: shopId });
      if (error) throw error;
      return { data: data || [], error: null };
    } catch (e: any) {
      return { data: null, error: e.message };
    }
  },
  async listServices(shopId: string): Promise<ApiResult<any[]>> {
    try {
      const { data, error } = await supabase.rpc('get_public_services', { p_shop_id: shopId });
      if (error) throw error;
      return { data: data || [], error: null };
    } catch (e: any) {
      return { data: null, error: e.message };
    }
  }
};
