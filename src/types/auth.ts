import type { User as SupabaseUser } from '@supabase/supabase-js';

export type UserRole = 'platform_admin' | 'owner' | 'barber' | 'customer';

export interface Profile {
  id: string;
  shop_id: string | null;
  full_name: string;
  whatsapp: string;
  email: string | null;
  role: UserRole;
  wants_reminders: boolean;
  wants_promotions: boolean;
  is_active: boolean;
  last_login: string | null;
  failed_attempts: number;
  locked_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: SupabaseUser | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}
