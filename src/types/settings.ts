export interface BusinessDayHours {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface BusinessHours {
  [dayIndex: number]: BusinessDayHours;
}

export interface BookingSettings {
  precision: '5' | '10' | '15' | '30' | '60' | 'libre';
  buffer: number; // minutes
  advance_notice: number; // hours
  cancellation_policy: 'flexible' | 'strict';
}

export interface SetupProgress {
  informacoes: boolean;
  horarios: boolean;
  equipe: boolean;
  servicos: boolean;
  agenda: boolean;
}

export interface ShopSettings {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  tagline: string | null;
  about_text: string | null;
  phone: string | null;
  instagram_url: string | null;
  whatsapp_link: string | null;
  address: string | null;
  business_hours: BusinessHours;
  booking_settings: BookingSettings;
  setup_progress: SetupProgress;
}

export interface Barber {
  id: string;
  shop_id: string;
  profile_id: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  color: string | null;
  is_active: boolean;
  display_order: number;
  is_featured: boolean;
  created_at: string;
}

export interface Service {
  id: string;
  shop_id: string;
  name: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
}
