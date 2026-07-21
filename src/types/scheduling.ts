// Tipos centrais do sistema de agendamento

export interface Barber {
  id: string;
  shop_id: string;
  profile_id: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  color: string;
  is_active: boolean;
  display_order: number;
  is_featured: boolean;
  created_at: string;
}

export type CreateBarberInput = Omit<Barber, 'id' | 'created_at'>;
export type UpdateBarberInput = Partial<Omit<Barber, 'id' | 'shop_id' | 'created_at'>>;

export interface Service {
  id: string;
  shop_id: string;
  name: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  created_at: string;
  is_combo?: boolean;
  combo_includes?: string | null;
  exclusive_barber_id?: string | null;
}

export type CreateServiceInput = Omit<Service, 'id' | 'created_at'>;
export type UpdateServiceInput = Partial<Omit<Service, 'id' | 'shop_id' | 'created_at'>>;

// ─── CLIENTES ──────────────────────────────────────────────────

export interface Customer {
  id: string;
  shop_id: string;
  name: string;
  phone: string;
  email: string | null;
  is_club_member: boolean;
  created_at: string;
}

// ─── AGENDAMENTOS ──────────────────────────────────────────────

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export interface Appointment {
  id: string;
  shop_id: string;
  customer_id: string;
  barber_id: string;
  service_id: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  payment_status?: 'pending' | 'paid';
  payment_method?: 'cash' | 'card' | 'pix' | 'mixed';
  payment_notes?: string;
  total_price: number;
  notes: string | null;
  created_at: string;
}

// Representação estendida (com joins) comumente usada na UI
export interface AppointmentWithDetails extends Appointment {
  customer: Pick<Customer, 'name' | 'phone'>;
  barber: Pick<Barber, 'name' | 'color'>;
  service: Pick<Service, 'name' | 'duration_minutes'>;
}
