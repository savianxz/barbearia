/**
 * Booking Service Layer
 * ─────────────────────────────────────────────────────────────────────────
 * Camada de abstração pronta para integração com Supabase, Firebase ou
 * qualquer outro backend. Por enquanto todas as funções são mockadas.
 *
 * O cliente nunca percebe que existe um sistema de autenticação:
 * ele apenas confirma o agendamento e tudo acontece automaticamente.
 * ─────────────────────────────────────────────────────────────────────────
 */

// ─── INTERFACES ──────────────────────────────────────────────────────────────

export interface Customer {
  id?: string;
  name: string;
  whatsapp: string;
  email?: string;
  wantsReminders: boolean;
  wantsPromotions: boolean;
  createdAt?: string;
  /** Auto-generated password for the "invisible" account */
  passwordHash?: string;
}

export interface Appointment {
  id?: string;
  customerId?: string;
  barberId: string;
  barberName: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  date: string;        // YYYY-MM-DD
  time: string;        // HH:MM
  notes?: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt?: string;
  confirmationCode?: string;
}

export interface AppointmentDetails {
  customer: Customer;
  appointment: Appointment;
}

export interface Shop {
  id: string;
  name: string;
  address: string;
  phone: string;
  instagram: string;
  whatsappLink: string;
}

// ─── RESPONSE TYPES ──────────────────────────────────────────────────────────

export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// ─── MOCK FUNCTIONS (Ready for backend integration) ──────────────────────────

/**
 * Creates or retrieves an existing customer silently.
 * The user will never perceive this as "creating an account".
 *
 * TODO: Replace with Supabase `auth.signUp()` + `profiles` table insert.
 */
export const createCustomer = async (
  customer: Omit<Customer, 'id' | 'createdAt' | 'passwordHash'>
): Promise<ServiceResponse<Customer>> => {
  try {
    // Simulates network latency
    await new Promise(resolve => setTimeout(resolve, 400));

    const result: Customer = {
      ...customer,
      id: `cust_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      createdAt: new Date().toISOString(),
      // Auto-generated password — invisible to the user
      passwordHash: `auto_${Math.random().toString(36).slice(2, 16)}`,
    };

    console.info('[bookingService] Customer created (mock):', result.id);
    return { data: result, error: null, success: true };
  } catch (err) {
    return { data: null, error: 'Erro ao criar cliente.', success: false };
  }
};

/**
 * Creates a new appointment linked to a customer.
 *
 * TODO: Replace with Supabase `appointments` table insert.
 */
export const createAppointment = async (
  appointment: Omit<Appointment, 'id' | 'createdAt' | 'confirmationCode' | 'status'>
): Promise<ServiceResponse<Appointment>> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 600));

    const result: Appointment = {
      ...appointment,
      id: `appt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      status: 'confirmed',
      confirmationCode: `FS-${Math.floor(Math.random() * 900000 + 100000)}`,
      createdAt: new Date().toISOString(),
    };

    console.info('[bookingService] Appointment created (mock):', result.confirmationCode);
    return { data: result, error: null, success: true };
  } catch (err) {
    return { data: null, error: 'Erro ao criar agendamento.', success: false };
  }
};

/**
 * Sends a WhatsApp confirmation message to the customer.
 *
 * TODO: Integrate with WhatsApp Business API (via Twilio, Z-API, or Evolution API).
 */
export const sendWhatsappConfirmation = async (
  details: AppointmentDetails
): Promise<ServiceResponse<void>> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 200));

    const msg = [
      `✅ *Agendamento Confirmado - F Street*`,
      ``,
      `Olá, *${details.customer.name}*!`,
      ``,
      `✂️ Serviço: ${details.appointment.serviceName}`,
      `👤 Barbeiro: ${details.appointment.barberName}`,
      `📅 Data: ${details.appointment.date}`,
      `🕐 Horário: ${details.appointment.time}`,
      ``,
      `Código: *${details.appointment.confirmationCode}*`,
      ``,
      `Para cancelar ou remarcar, responda esta mensagem.`,
    ].join('\n');

    console.info('[bookingService] WhatsApp message (mock):', msg);
    return { data: undefined, error: null, success: true };
  } catch (err) {
    return { data: null, error: 'Erro ao enviar WhatsApp.', success: false };
  }
};

/**
 * Sends an email confirmation to the customer.
 *
 * TODO: Integrate with Resend, SendGrid, or Brevo.
 */
export const sendEmailConfirmation = async (
  details: AppointmentDetails
): Promise<ServiceResponse<void>> => {
  try {
    if (!details.customer.email) return { data: undefined, error: null, success: true };

    await new Promise(resolve => setTimeout(resolve, 200));
    console.info('[bookingService] Email sent (mock) to:', details.customer.email);
    return { data: undefined, error: null, success: true };
  } catch (err) {
    return { data: null, error: 'Erro ao enviar e-mail.', success: false };
  }
};

/**
 * Orchestrates the full booking flow:
 * 1. Creates the customer (invisible account)
 * 2. Creates the appointment
 * 3. Sends WhatsApp confirmation
 * 4. Sends email confirmation (if email provided)
 */
export const processBooking = async (
  customerData: Omit<Customer, 'id' | 'createdAt' | 'passwordHash'>,
  appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'confirmationCode' | 'status'>
): Promise<ServiceResponse<{ customer: Customer; appointment: Appointment }>> => {
  const customerRes = await createCustomer(customerData);
  if (!customerRes.success || !customerRes.data) {
    return { data: null, error: customerRes.error, success: false };
  }

  const apptRes = await createAppointment({
    ...appointmentData,
    customerId: customerRes.data.id,
  });
  if (!apptRes.success || !apptRes.data) {
    return { data: null, error: apptRes.error, success: false };
  }

  const details: AppointmentDetails = {
    customer: customerRes.data,
    appointment: apptRes.data,
  };

  // Fire-and-forget notifications (don't block the success screen)
  sendWhatsappConfirmation(details).catch(console.error);
  sendEmailConfirmation(details).catch(console.error);

  return {
    data: { customer: customerRes.data, appointment: apptRes.data },
    error: null,
    success: true,
  };
};
