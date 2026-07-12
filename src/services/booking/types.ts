export interface Customer {
  id: string;
  name: string;
  whatsapp: string;
  email?: string;
  wantsReminders: boolean;
  wantsPromotions: boolean;
  createdAt: string;
  passwordHash?: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Appointment {
  id: string;
  shopId: string;
  customerId?: string;
  barberId: string;
  barberName: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  date: string;            // YYYY-MM-DD
  startTime: string;       // HH:MM
  endTime: string;         // HH:MM
  serviceDuration: number; // in minutes
  status: AppointmentStatus;
  notes?: string;
  confirmationCode: string;
  createdAt: string;
  updatedAt: string;
}

export type AgendaPrecision = '5' | '10' | '15' | 'libre';

export interface Shop {
  id: string;
  name: string;
  address: string;
  phone: string;
  instagram: string;
  whatsappLink: string;
  precision: AgendaPrecision;
  buffer?: number;                 // Buffer between appointments in minutes
  lastStartAllowedTime?: string;   // Last allowed time to start an appointment (HH:MM)
}

export interface DailySchedule {
  isOpen: boolean;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
}

export interface BarberSchedule {
  barberId: string;
  shopId: string;
  weeklyConfig: Record<number, DailySchedule>; // Key: 0 (Sunday) to 6 (Saturday)
  pauses: {
    startTime: string; // HH:MM
    endTime: string;   // HH:MM
    label?: string;
  }[];
}

export type BlockType = 'curso' | 'ferias' | 'feriado' | 'reuniao' | 'manual';

export interface TimeBlock {
  id: string;
  barberId: string;
  shopId: string;
  type: BlockType;
  title?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  isRecurring: boolean;
  recurrenceRule?: {
    frequency: 'daily' | 'weekly';
    weekdays?: number[]; // [1, 2] for Monday, Tuesday
  };
}

export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface AppointmentDetails {
  customer: Customer;
  appointment: Appointment;
}
