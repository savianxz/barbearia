import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import type { Service, CreateServiceInput, UpdateServiceInput } from '../../types/scheduling';

const inputCls = 'w-full bg-[#0D0D0D] border border-white/10 rounded-lg px-3 py-2.5 text-[13px] text-white placeholder:text-white/25 focus:outline-none focus:border-[#D4AF37]/60 transition-colors';
const labelCls = 'block text-[10px] uppercase tracking-wider font-semibold text-white/30 mb-1.5';

export interface ServiceFormProps {
  initial: Partial<Service>;
  shopId: string;
  onSave(d: CreateServiceInput | UpdateServiceInput): void;
  loading: boolean;
}

export const ServiceForm: React.FC<ServiceFormProps> = ({ initial, shopId, onSave, loading }) => {
  const [name, setName]       = useState(initial.name ?? '');
  const [duration, setDuration] = useState(String(initial.duration_minutes ?? 30));
  const [price, setPrice]     = useState(String(initial.price ?? ''));

  const mins = parseInt(duration) || 0;
  const durationLabel = mins >= 60
    ? `${Math.floor(mins / 60)}h${mins % 60 > 0 ? ` ${mins % 60}min` : ''}`
    : `${mins}min`;

  return (
    <form onSubmit={e => {
      e.preventDefault();
      if (!name.trim() || !duration || !price) return;
      onSave({ name: name.trim(), duration_minutes: mins, price: parseFloat(price) || 0, shop_id: shopId, is_active: initial.is_active ?? true });
    }} className="space-y-4">
      <div>
        <label className={labelCls}>Nome do Serviço *</label>
        <input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Corte Masculino Clássico" autoFocus />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Duração (minutos) *</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input type="number" min="5" step="5" className={`${inputCls} pl-9`} value={duration} onChange={e => setDuration(e.target.value)} placeholder="30" />
          </div>
        </div>
        <div>
          <label className={labelCls}>Preço (R$) *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-white/30 font-semibold">R$</span>
            <input type="number" min="0" step="0.50" className={`${inputCls} pl-9`} value={price} onChange={e => setPrice(e.target.value)} placeholder="50.00" />
          </div>
        </div>
      </div>
      {mins > 0 && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-white/3 border border-white/6 rounded-lg">
          <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="text-[12px] text-white/60">Duração: <strong className="text-white">{durationLabel}</strong></span>
        </div>
      )}
      <div className="pt-2 flex justify-end">
        <button type="submit" disabled={loading || !name.trim() || !duration || !price}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#D4AF37] hover:bg-[#F3D66E] disabled:opacity-50 text-black font-bold text-[12px] tracking-widest uppercase rounded-xl transition-all cursor-pointer">
          {loading && <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />}
          Salvar
        </button>
      </div>
    </form>
  );
};
