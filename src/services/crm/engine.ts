import type { Customer, Appointment, CustomerMetrics, CrmSegment, CrmConfig, CrmInsight, CrmNotification, CrmCustomer } from './types';

// Helper: calcula diferença em dias entre duas datas formatadas YYYY-MM-DD
export function getDaysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1 + 'T00:00:00');
  const d2 = new Date(date2 + 'T00:00:00');
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

// Helper: formata data Date para YYYY-MM-DD local
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper: adiciona dias a uma data formatada YYYY-MM-DD
export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

/**
 * Calcula todas as métricas analíticas de um cliente baseando-se no histórico de agendamentos.
 */
export function calculateMetrics(
  customer: Customer,
  appointments: Appointment[],
  config: CrmConfig,
  todayStr: string,
  lastContactDate: string | null = null
): CustomerMetrics {
  // Apenas agendamentos deste cliente que foram concluídos ou confirmados
  const validAppts = appointments
    .filter(a => a.customerId === customer.id && (a.status === 'completed' || a.status === 'confirmed'))
    .sort((a, b) => a.date.localeCompare(b.date)); // Ordenação cronológica

  const totalAppointments = validAppts.length;
  const totalSpent = validAppts.reduce((sum, a) => sum + a.servicePrice, 0);
  const averageTicket = totalAppointments > 0 ? totalSpent / totalAppointments : 0;

  let lastAppointmentDate: string | null = null;
  let daysSinceLastVisit: number | null = null;

  // Encontra o último atendimento válido que ocorreu até a data de hoje (ou o mais recente em geral)
  const pastAppts = validAppts.filter(a => a.date <= todayStr);
  const lastAppt = pastAppts.length > 0 ? pastAppts[pastAppts.length - 1] : null;

  if (lastAppt) {
    lastAppointmentDate = lastAppt.date;
    daysSinceLastVisit = getDaysBetween(lastAppointmentDate, todayStr);
  }

  // Frequência média entre cortes (em dias)
  let averageFrequencyDays: number | null = null;
  if (pastAppts.length >= 2) {
    let diffSum = 0;
    for (let i = 1; i < pastAppts.length; i++) {
      diffSum += getDaysBetween(pastAppts[i - 1].date, pastAppts[i].date);
    }
    averageFrequencyDays = Math.round(diffSum / (pastAppts.length - 1));
  }

  // Próxima visita estimada
  let estimatedNextVisitDate: string | null = null;
  let daysUntilEstimatedReturn: number | null = null;

  if (lastAppointmentDate && averageFrequencyDays !== null) {
    // Se tiver frequência, estima com base nela
    estimatedNextVisitDate = addDays(lastAppointmentDate, averageFrequencyDays);
  } else if (lastAppointmentDate) {
    // Se só tiver uma visita, assume uma média padrão de mercado (ex: 30 dias)
    estimatedNextVisitDate = addDays(lastAppointmentDate, 30);
  }

  if (estimatedNextVisitDate) {
    daysUntilEstimatedReturn = getDaysBetween(todayStr, estimatedNextVisitDate);
  }

  // Identificar Barbeiro Favorito
  let favoriteBarber: string | null = null;
  let favoriteBarberName: string | null = null;
  if (totalAppointments > 0) {
    const barberCounts: Record<string, { name: string; count: number }> = {};
    validAppts.forEach(a => {
      if (!barberCounts[a.barberId]) {
        barberCounts[a.barberId] = { name: a.barberName, count: 0 };
      }
      barberCounts[a.barberId].count++;
    });

    let maxCount = -1;
    Object.entries(barberCounts).forEach(([id, data]) => {
      if (data.count > maxCount) {
        maxCount = data.count;
        favoriteBarber = id;
        favoriteBarberName = data.name;
      }
    });
  }

  // Identificar Serviço Favorito
  let favoriteService: string | null = null;
  let favoriteServiceName: string | null = null;
  if (totalAppointments > 0) {
    const serviceCounts: Record<string, { name: string; count: number }> = {};
    validAppts.forEach(a => {
      if (!serviceCounts[a.serviceId]) {
        serviceCounts[a.serviceId] = { name: a.serviceName, count: 0 };
      }
      serviceCounts[a.serviceId].count++;
    });

    let maxCount = -1;
    Object.entries(serviceCounts).forEach(([id, data]) => {
      if (data.count > maxCount) {
        maxCount = data.count;
        favoriteService = id;
        favoriteServiceName = data.name;
      }
    });
  }

  // Calcular score de fidelidade composto (0-100)
  const loyaltyScore = calculateLoyaltyScore(
    totalAppointments,
    totalSpent,
    daysSinceLastVisit,
    averageFrequencyDays,
    config
  );

  return {
    lastAppointmentDate,
    daysSinceLastVisit,
    totalAppointments,
    totalSpent,
    averageTicket,
    averageFrequencyDays,
    estimatedNextVisitDate,
    daysUntilEstimatedReturn,
    favoriteBarber,
    favoriteBarberName,
    favoriteService,
    favoriteServiceName,
    lastContactDate,
    loyaltyScore,
  };
}

/**
 * Calcula uma nota composta de fidelidade de 0 a 100 com pesos parametrizáveis.
 */
export function calculateLoyaltyScore(
  totalAppointments: number,
  totalSpent: number,
  daysSinceLastVisit: number | null,
  averageFrequency: number | null,
  config: CrmConfig
): number {
  if (totalAppointments === 0) return 0;

  // 1. Recência (Geralmente 30% do peso)
  let scoreRecency = 0;
  if (daysSinceLastVisit !== null) {
    if (daysSinceLastVisit <= 15) scoreRecency = 100;
    else if (daysSinceLastVisit <= 30) scoreRecency = 85;
    else if (daysSinceLastVisit <= 45) scoreRecency = 60;
    else if (daysSinceLastVisit <= config.inactiveDays) scoreRecency = 30;
    else scoreRecency = 0;
  }

  // 2. Frequência (Geralmente 30% do peso)
  let scoreFrequency = 0;
  if (averageFrequency !== null) {
    if (averageFrequency <= 15) scoreFrequency = 100;
    else if (averageFrequency <= 30) scoreFrequency = 85;
    else if (averageFrequency <= 45) scoreFrequency = 70;
    else if (averageFrequency <= 60) scoreFrequency = 45;
    else scoreFrequency = 20;
  } else {
    // Se tem apenas 1 atendimento, ganha um score base mediano por ter iniciado
    scoreFrequency = 40;
  }

  // 3. Valor Total Gasto (Geralmente 25% do peso)
  const scoreMonetary = Math.min(100, Math.round((totalSpent / config.vipMinSpend) * 100));

  // 4. Quantidade de visitas (Geralmente 15% do peso)
  const scoreVisitCount = Math.min(100, Math.round((totalAppointments / config.vipMinVisits) * 100));

  // Soma ponderada
  const finalScore =
    (scoreRecency * config.scoreWeightRecency +
      scoreFrequency * config.scoreWeightFrequency +
      scoreMonetary * config.scoreWeightMonetary +
      scoreVisitCount * config.scoreWeightVisitCount) /
    100;

  return Math.min(100, Math.max(0, Math.round(finalScore)));
}

/**
 * Classifica um cliente em um segmento de fidelidade único.
 */
export function classifySegment(metrics: CustomerMetrics, config: CrmConfig): CrmSegment {
  const { totalAppointments, daysSinceLastVisit, averageFrequencyDays, totalSpent, loyaltyScore } = metrics;

  // Sem visitas
  if (totalAppointments === 0 || daysSinceLastVisit === null) {
    return 'new';
  }

  // 1. Inativo: Sem comparecer há mais de N dias
  if (daysSinceLastVisit > config.inactiveDays) {
    return 'inactive';
  }

  // 2. VIP: Gasto acumulado alto, muitas visitas e score de fidelidade alto
  if (totalSpent >= config.vipMinSpend && totalAppointments >= config.vipMinVisits && loyaltyScore >= config.vipMinLoyaltyScore) {
    return 'vip';
  }

  // 3. Em risco: O cliente demorou muito mais que o tempo de frequência médio dele para retornar
  if (averageFrequencyDays !== null) {
    const threshold = averageFrequencyDays * config.atRiskMultiplier;
    if (daysSinceLastVisit > threshold) {
      return 'at_risk';
    }
  } else {
    // Se não tem média, mas passou de 45 dias desde o único corte
    if (totalAppointments === 1 && daysSinceLastVisit > 45) {
      return 'never_returned';
    }
  }

  // 4. Elegível para o clube de benefícios: Visitas muito frequentes mas não VIP completo ainda
  if (totalAppointments >= config.clubEligibleMinVisits && averageFrequencyDays !== null && averageFrequencyDays <= 30) {
    return 'club_eligible';
  }

  // 5. Leal: Consistente, visitas regulares dentro do prazo esperado
  if (totalAppointments >= 3) {
    return 'loyal';
  }

  // 6. Novo Cliente: Criado recentemente, poucas visitas
  if (daysSinceLastVisit <= config.newCustomerWindowDays && totalAppointments <= 2) {
    return 'new';
  }

  // Padrão/Default caso nenhuma regra seja muito estrita
  return 'loyal';
}

/**
 * Gera insights gerenciais macro sobre a base de clientes do CRM.
 */
export function generateInsights(crmCustomers: CrmCustomer[], todayStr: string): CrmInsight[] {
  const insights: CrmInsight[] = [];
  const shopId = crmCustomers[0]?.shopId || 'f-street';

  // Contagem por segmentos
  const countBySegment = crmCustomers.reduce((acc, c) => {
    acc[c.segment] = (acc[c.segment] || 0) + 1;
    return acc;
  }, {} as Record<CrmSegment, number>);

  const getCount = (seg: CrmSegment) => countBySegment[seg] || 0;

  // 1. Insight: Clientes inativos que gastavam muito (Risco de Perda de Faturamento)
  const inactiveVipCustomers = crmCustomers.filter(
    c => c.segment === 'inactive' && c.metrics.totalSpent >= 300
  );
  if (inactiveVipCustomers.length > 0) {
    const valueAtRisk = inactiveVipCustomers.reduce((sum, c) => sum + c.metrics.averageTicket, 0);
    insights.push({
      id: `insight_${shopId}_lost_revenue`,
      shopId,
      title: 'Recupere Clientes Inativos VIP',
      description: `${inactiveVipCustomers.length} clientes VIP não retornam há algum tempo. Valor estimado pendente: R$ ${valueAtRisk.toFixed(2)}.`,
      severity: 'critical',
      segment: 'inactive',
      count: inactiveVipCustomers.length,
      totalValue: valueAtRisk,
      actionLabel: 'Ver Clientes Inativos',
      actionKey: 'view_inactive_vips',
      generatedAt: todayStr,
    });
  }

  // 2. Insight: Clientes prestes a precisar de corte (Oportunidade ativa)
  const readyToCut = crmCustomers.filter(c => {
    if (c.segment === 'inactive' || c.segment === 'never_returned') return false;
    const daysUntilReturn = c.metrics.daysUntilEstimatedReturn;
    // Retornaria entre -5 e +2 dias a partir de hoje
    return daysUntilReturn !== null && daysUntilReturn >= -5 && daysUntilReturn <= 2;
  });

  if (readyToCut.length > 0) {
    const potentialRevenue = readyToCut.reduce((sum, c) => sum + c.metrics.averageTicket, 0);
    insights.push({
      id: `insight_${shopId}_ready_to_cut`,
      shopId,
      title: 'Cortes Sugeridos para Hoje',
      description: `${readyToCut.length} clientes estão no período estimado de retorno. Envie lembretes personalizados.`,
      severity: 'info',
      segment: 'all',
      count: readyToCut.length,
      totalValue: potentialRevenue,
      actionLabel: 'Enviar Campanha WhatsApp',
      actionKey: 'send_return_reminder_campaign',
      generatedAt: todayStr,
    });
  }

  // 3. Insight: Clientes em Risco que precisam de resgate
  const atRiskCount = getCount('at_risk');
  if (atRiskCount > 0) {
    const atRiskCustomers = crmCustomers.filter(c => c.segment === 'at_risk');
    const potentialLoss = atRiskCustomers.reduce((sum, c) => sum + c.metrics.averageTicket, 0);
    insights.push({
      id: `insight_${shopId}_at_risk_resque`,
      shopId,
      title: 'Alerta: Clientes em Risco',
      description: `${atRiskCount} clientes leais ultrapassaram o tempo habitual de retorno. Agende uma mensagem de reengajamento.`,
      severity: 'warning',
      segment: 'at_risk',
      count: atRiskCount,
      totalValue: potentialLoss,
      actionLabel: 'Ver Clientes em Risco',
      actionKey: 'view_at_risk_list',
      generatedAt: todayStr,
    });
  }

  // 4. Insight: Candidatos ao Clube de Assinatura
  const clubCandidates = getCount('club_eligible');
  if (clubCandidates > 0) {
    insights.push({
      id: `insight_${shopId}_club_promotion`,
      shopId,
      title: 'Novos Candidatos para o Clube',
      description: `${clubCandidates} clientes têm frequência alta e estão prontos para receber o convite do clube de fidelidade.`,
      severity: 'info',
      segment: 'club_eligible',
      count: clubCandidates,
      actionLabel: 'Convidar para o Clube',
      actionKey: 'invite_to_club_campaign',
      generatedAt: todayStr,
    });
  }

  return insights;
}

/**
 * Cria a fila de notificações sugeridas automaticamente com base no comportamento de cada cliente.
 */
export function buildNotificationQueue(
  crmCustomers: CrmCustomer[],
  todayStr: string,
  existingNotifications: CrmNotification[] = []
): CrmNotification[] {
  const newNotifications: CrmNotification[] = [];

  crmCustomers.forEach(customer => {
    const { metrics, segment } = customer;

    // Se o cliente não deseja receber lembretes ou promoções, não cria
    if (!customer.wantsReminders) return;

    // Helper para checar se já existe uma notificação recente desse tipo para evitar spam
    const hasRecentNotification = (templateKey: string) => {
      return existingNotifications.some(
        n =>
          n.customerId === customer.id &&
          n.templateKey === templateKey &&
          getDaysBetween(n.createdAt.split('T')[0], todayStr) <= 15
      );
    };

    // 1. Se o cliente está Em Risco e não recebeu mensagem recente
    if (segment === 'at_risk' && !hasRecentNotification('win_back_at_risk')) {
      newNotifications.push({
        id: `notif_${customer.id}_at_risk_${todayStr}`,
        shopId: customer.shopId,
        customerId: customer.id,
        customerName: customer.name,
        customerWhatsapp: customer.whatsapp,
        customerEmail: customer.email,
        channel: 'whatsapp',
        templateKey: 'win_back_at_risk',
        payload: {
          name: customer.name,
          favoriteService: metrics.favoriteServiceName || 'serviço',
          favoriteBarber: metrics.favoriteBarberName || 'barbeiro',
        },
        scheduledAt: new Date().toISOString(),
        sentAt: null,
        status: 'pending',
        segment: 'at_risk',
        createdAt: new Date().toISOString(),
      });
    }

    // 2. Se o cliente está Inativo e ainda não foi contactado para reengajar
    if (segment === 'inactive' && !hasRecentNotification('win_back_inactive')) {
      newNotifications.push({
        id: `notif_${customer.id}_inactive_${todayStr}`,
        shopId: customer.shopId,
        customerId: customer.id,
        customerName: customer.name,
        customerWhatsapp: customer.whatsapp,
        customerEmail: customer.email,
        channel: 'whatsapp',
        templateKey: 'win_back_inactive',
        payload: {
          name: customer.name,
        },
        scheduledAt: new Date().toISOString(),
        sentAt: null,
        status: 'pending',
        segment: 'inactive',
        createdAt: new Date().toISOString(),
      });
    }

    // 3. Se o cliente é elegível para o clube de assinatura
    if (segment === 'club_eligible' && !hasRecentNotification('club_invite') && customer.wantsPromotions) {
      newNotifications.push({
        id: `notif_${customer.id}_club_${todayStr}`,
        shopId: customer.shopId,
        customerId: customer.id,
        customerName: customer.name,
        customerWhatsapp: customer.whatsapp,
        customerEmail: customer.email,
        channel: 'whatsapp',
        templateKey: 'club_invite',
        payload: {
          name: customer.name,
          visits: String(metrics.totalAppointments),
        },
        scheduledAt: new Date().toISOString(),
        sentAt: null,
        status: 'pending',
        segment: 'club_eligible',
        createdAt: new Date().toISOString(),
      });
    }
  });

  return newNotifications;
}
