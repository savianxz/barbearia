// ─── Re-export base types used by CRM ─────────────────────────────────────
export type { Customer, Appointment } from '../booking/types';

// ─── Customer Metrics ──────────────────────────────────────────────────────

/**
 * Computed behavioural metrics for a single customer.
 * All fields are derived from appointment history — never stored manually.
 */
export interface CustomerMetrics {
  lastAppointmentDate: string | null;   // YYYY-MM-DD of most recent completed visit
  daysSinceLastVisit: number | null;    // Calendar days since that visit
  totalAppointments: number;            // Count of confirmed + completed appointments
  totalSpent: number;                   // Sum of servicePrice for all visits
  averageTicket: number;                // totalSpent / totalAppointments
  averageFrequencyDays: number | null;  // Mean days between consecutive visits (null if < 2 visits)
  estimatedNextVisitDate: string | null;// lastAppointmentDate + averageFrequencyDays
  daysUntilEstimatedReturn: number | null;
  favoriteBarber: string | null;        // barberId with most visits
  favoriteBarberName: string | null;
  favoriteService: string | null;       // serviceId with most visits
  favoriteServiceName: string | null;
  lastContactDate: string | null;       // Date of last outbound notification sent
  loyaltyScore: number;                 // 0–100 composite score
}

// ─── Customer Segments ─────────────────────────────────────────────────────

/**
 * Mutually exclusive segment assigned to each customer automatically.
 * Priority order (highest → lowest): vip, loyal, club_eligible, at_risk, inactive, never_returned, new
 */
export type CrmSegment =
  | 'loyal'           // Consistent frequency and return
  | 'at_risk'         // Overdue past their average return window
  | 'inactive'        // No visit in N+ days (configurable)
  | 'never_returned'  // Only 1 visit, never came back
  | 'new'             // First visit within last M days
  | 'regular';        // Catch-all for those who don't fit other priorities

// ─── CRM Customer ─────────────────────────────────────────────────────────

/** A customer enriched with CRM metrics and segment classification. */
export interface CrmCustomer {
  id: string;
  name: string;
  whatsapp: string;
  email?: string;
  shopId: string;
  wantsReminders: boolean;
  wantsPromotions: boolean;
  isClubMember: boolean;
  createdAt: string;
  metrics: CustomerMetrics;
  segment: CrmSegment;
}

// ─── CRM Configuration ────────────────────────────────────────────────────

/**
 * Per-shop thresholds and scoring weights.
 * Stored in the DB; configurable via the admin panel.
 */
export interface CrmConfig {
  shopId: string;

  // Segment thresholds (days)
  newCustomerWindowDays: number;       // e.g. 30 — considered "new" if first visit within 30 days
  inactiveDays: number;                // e.g. 90 — no visit in 90 days → inactive
  atRiskMultiplier: number;            // e.g. 1.5 — overdue by 1.5× their avg frequency → at_risk

  // VIP thresholds
  vipMinSpend: number;                 // e.g. 500 — total spend to qualify for VIP
  vipMinVisits: number;                // e.g. 8   — minimum visits to qualify for VIP
  vipMinLoyaltyScore: number;          // e.g. 75

  // Club eligible
  clubEligibleMinVisits: number;       // e.g. 6   — frequent visitor not yet on club plan

  // Loyalty score weights (must sum to 100)
  scoreWeightRecency: number;          // e.g. 30
  scoreWeightFrequency: number;        // e.g. 30
  scoreWeightMonetary: number;         // e.g. 25
  scoreWeightVisitCount: number;       // e.g. 15
}

// ─── CRM Notifications ────────────────────────────────────────────────────

export type NotificationChannel = 'whatsapp' | 'email' | 'push';
export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'cancelled';

/**
 * Template keys map to message templates stored server-side.
 * Adapters (Twilio, Z-API, Resend) will resolve these when integrated.
 */
export type NotificationTemplateKey =
  | 'win_back_at_risk'       // "Saudades de você! Que tal marcar um horário?"
  | 'win_back_inactive'      // "Faz tempo! Seu corte está aguardando."
  | 'reminder_upcoming'      // "Lembrete: seu horário é amanhã às {time}."
  | 'vip_exclusive'          // "Oferta exclusiva para clientes VIP"
  | 'club_invite'            // "Você tem perfil para o Clube F Street!"
  | 'first_return_nudge'     // "Volte e complete sua transformação."
  | 'birthday_promo';        // "Feliz aniversário! Presente especial te aguarda."

export interface CrmNotification {
  id: string;
  shopId: string;
  customerId: string;
  customerName: string;
  customerWhatsapp: string;
  customerEmail?: string;
  channel: NotificationChannel;
  templateKey: NotificationTemplateKey;
  payload: Record<string, string>;    // Variables for template rendering
  scheduledAt: string;               // ISO datetime
  sentAt: string | null;
  status: NotificationStatus;
  segment: CrmSegment;               // Segment that triggered this notification
  createdAt: string;
}

// ─── CRM Insights ─────────────────────────────────────────────────────────

export type InsightSeverity = 'info' | 'warning' | 'critical';

/** Macro-level insight generated from the full customer base. */
export interface CrmInsight {
  id: string;
  shopId: string;
  title: string;
  description: string;
  severity: InsightSeverity;
  segment: CrmSegment | 'all';
  count: number;
  totalValue?: number;               // Revenue at stake (for at_risk / inactive)
  actionLabel?: string;              // CTA label e.g. "Enviar campanha"
  actionKey?: string;                // Internal action identifier
  generatedAt: string;
}

// ─── Service Response ─────────────────────────────────────────────────────

export interface CrmServiceResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}
