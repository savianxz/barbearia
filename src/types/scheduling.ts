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
  total_visits: number;
  total_spent: number;
  last_visit: string | null;
  created_at: string;
}

// ─── AGENDAMENTOS ──────────────────────────────────────────────

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'canceled';

export interface Appointment {
  id: string;
  shop_id: string;
  customer_id: string;
  barber_id: string;
  service_id: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  total_price: number;
  notes: string | null;
  created_at: string;
}

// Representação estendida (com joins) comumente usada na UI
export interface AppointmentWithDetails extends Appointment {
  customer: Pick<Customer, 'name' | 'phone' | 'total_visits'>;
  barber: Pick<Barber, 'name' | 'color'>;
  service: Pick<Service, 'name' | 'duration_minutes'>;
}
