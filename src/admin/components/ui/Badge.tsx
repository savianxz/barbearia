import React from 'react';
import type { CrmSegment } from '../../../services/crm/types';
import type { AppointmentStatus } from '../../../types/scheduling';

// ── Segment Badge ──────────────────────────────────────────────────────────────

const segmentConfig: Record<CrmSegment, { label: string; color: string }> = {
  loyal:          { label: 'Fiel',          color: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' },
  at_risk:        { label: 'Em Risco',      color: 'bg-orange-500/15 text-orange-400 border border-orange-500/30' },
  inactive:       { label: 'Inativo',       color: 'bg-red-500/15 text-red-400 border border-red-500/30' },
  never_returned: { label: 'Sem Retorno',   color: 'bg-neutral-700/40 text-neutral-400 border border-neutral-600/30' },
  new:            { label: 'Novo',          color: 'bg-violet-500/15 text-violet-400 border border-violet-500/30' },
  regular:        { label: 'Regular',       color: 'bg-slate-500/15 text-slate-400 border border-slate-500/30' },
};

const statusConfig: Record<AppointmentStatus, { label: string; color: string; dot: string }> = {
  scheduled:  { label: 'Agendado',   color: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',      dot: 'bg-amber-400' },
  confirmed:  { label: 'Confirmado', color: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30', dot: 'bg-emerald-400' },
  canceled:   { label: 'Cancelado',  color: 'bg-red-500/15 text-red-400 border border-red-500/30',            dot: 'bg-red-400' },
  completed:  { label: 'Concluído',  color: 'bg-neutral-700/40 text-neutral-300 border border-neutral-600/30', dot: 'bg-neutral-400' },
};

interface SegmentBadgeProps { segment: CrmSegment; small?: boolean }
export const SegmentBadge: React.FC<SegmentBadgeProps> = ({ segment, small }) => {
  const cfg = segmentConfig[segment];
  return (
    <span className={`inline-flex items-center rounded-full font-semibold tracking-wide ${cfg.color} ${small ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[10px]'}`}>
      {cfg.label}
    </span>
  );
};

interface StatusBadgeProps { status: AppointmentStatus; small?: boolean }
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, small }) => {
  const cfg = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold tracking-wide ${cfg.color} ${small ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[10px]'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};
