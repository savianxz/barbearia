import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Power, PowerOff, Scissors, Clock, DollarSign, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  useServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
  useToggleService,
} from '../../hooks/useServices';
import type { Service, CreateServiceInput, UpdateServiceInput } from '../../types/scheduling';
import { Modal, ConfirmDialog, Toast } from '../components/AdminDialogs';

const inputCls = 'w-full bg-[#0D0D0D] border border-white/10 rounded-lg px-3 py-2.5 text-[13px] text-white placeholder:text-white/25 focus:outline-none focus:border-[#D4AF37]/60 transition-colors';
const labelCls = 'block text-[10px] uppercase tracking-wider font-semibold text-white/30 mb-1.5';

// ─── Form ─────────────────────────────────────────────────────
interface ServiceFormProps {
  initial: Partial<Service>;
  shopId: string;
  onSave(d: CreateServiceInput | UpdateServiceInput): void;
  loading: boolean;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ initial, shopId, onSave, loading }) => {
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

// ─── Page ─────────────────────────────────────────────────────
export const ServicosPage: React.FC = () => {
  const { staff } = useAuth();
  const shopId = staff?.shop_id ?? '';

  const { data: services = [], isLoading, isError, refetch } = useServices(shopId);
  const createMutation = useCreateService(shopId);
  const updateMutation = useUpdateService(shopId);
  const deleteMutation = useDeleteService(shopId);
  const toggleMutation = useToggleService(shopId);

  const [toast, setToast]               = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [formOpen, setFormOpen]         = useState(false);
  const [editTarget, setEditTarget]     = useState<Service | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;

  const handleSave = async (data: CreateServiceInput | UpdateServiceInput) => {
    try {
      if (editTarget) {
        await updateMutation.mutateAsync({ id: editTarget.id, input: data as UpdateServiceInput });
        showToast('Serviço atualizado!');
      } else {
        await createMutation.mutateAsync(data as CreateServiceInput);
        showToast('Serviço adicionado!');
      }
      setFormOpen(false);
    } catch (e: any) {
      showToast(e.message ?? 'Erro ao salvar.', 'error');
    }
  };

  const handleToggle = async (s: Service) => {
    try {
      await toggleMutation.mutateAsync({ id: s.id, is_active: !s.is_active });
      showToast(`${s.name} ${!s.is_active ? 'ativado' : 'desativado'}`);
    } catch (e: any) {
      showToast(e.message ?? 'Erro ao atualizar.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      showToast('Serviço removido.');
    } catch (e: any) {
      showToast(e.message ?? 'Erro ao remover.', 'error');
    }
    setDeleteTarget(null);
  };

  const active   = services.filter(s => s.is_active);
  const inactive = services.filter(s => !s.is_active);
  const avgPrice    = active.length ? active.reduce((s, x) => s + x.price, 0) / active.length : 0;
  const avgDuration = active.length ? active.reduce((s, x) => s + x.duration_minutes, 0) / active.length : 0;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">

      <AnimatePresence>{toast && <Toast message={toast.msg} type={toast.type} />}</AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Serviços</h1>
          <p className="text-[12px] text-white/40 mt-0.5">
            {isLoading ? 'Carregando...' : `${active.length} serviço${active.length !== 1 ? 's' : ''} ativo${active.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => refetch()} className="p-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all cursor-pointer">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => { setEditTarget(null); setFormOpen(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] hover:bg-[#F3D66E] text-black font-bold text-[12px] tracking-widest uppercase rounded-xl transition-all cursor-pointer shadow-lg shadow-[#D4AF37]/10">
            <Plus className="w-4 h-4" /> Novo Serviço
          </button>
        </div>
      </div>

      {/* Stats */}
      {!isLoading && active.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-3 gap-3">
          {[
            { icon: Scissors, label: 'Serviços Ativos', value: active.length },
            { icon: DollarSign, label: 'Ticket Médio', value: `R$ ${avgPrice.toFixed(0)}` },
            { icon: Clock, label: 'Duração Média', value: `${Math.round(avgDuration)}min` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-[#0E0E0E] border border-white/6 rounded-xl p-4 text-center">
              <div className="w-8 h-8 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Icon className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <p className="text-[18px] font-bold text-white">{value}</p>
              <p className="text-[10px] text-white/30 mt-0.5">{label}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 border border-dashed border-red-500/20 rounded-2xl">
          <p className="text-[13px] text-red-400">Erro ao carregar dados do Supabase.</p>
          <button onClick={() => refetch()} className="text-[12px] text-white/50 hover:text-white underline cursor-pointer">Tentar novamente</button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && services.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 gap-4 text-center border border-dashed border-white/10 rounded-2xl">
          <div className="w-14 h-14 bg-white/4 rounded-2xl flex items-center justify-center">
            <Scissors className="w-7 h-7 text-white/20" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-white/40">Nenhum serviço cadastrado</p>
            <p className="text-[11px] text-white/25 mt-1">Clique em "Novo Serviço" para adicionar</p>
          </div>
        </motion.div>
      )}

      {/* List */}
      {!isLoading && !isError && services.length > 0 && (
        <div className="space-y-6">
          <section className="space-y-3">
            <p className="text-[10px] uppercase tracking-widest font-bold text-white/30">Ativos ({active.length})</p>
            <div className="bg-[#0E0E0E] border border-white/6 rounded-2xl overflow-hidden divide-y divide-white/4">
              {active.map((s, i) => (
                <ServiceRow key={s.id} service={s} index={i}
                  onEdit={() => { setEditTarget(s); setFormOpen(true); }}
                  onToggle={() => handleToggle(s)}
                  onDelete={() => setDeleteTarget(s)}
                />
              ))}
            </div>
          </section>

          {inactive.length > 0 && (
            <section className="space-y-3">
              <p className="text-[10px] uppercase tracking-widest font-bold text-white/20">Inativos ({inactive.length})</p>
              <div className="bg-[#0E0E0E] border border-white/6 rounded-2xl overflow-hidden divide-y divide-white/4 opacity-50">
                {inactive.map((s, i) => (
                  <ServiceRow key={s.id} service={s} index={i}
                    onEdit={() => { setEditTarget(s); setFormOpen(true); }}
                    onToggle={() => handleToggle(s)}
                    onDelete={() => setDeleteTarget(s)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={formOpen} title={editTarget ? 'Editar Serviço' : 'Novo Serviço'} onClose={() => setFormOpen(false)}>
        <ServiceForm key={editTarget?.id ?? 'new'} initial={editTarget ?? {}} shopId={shopId} onSave={handleSave} loading={isMutating} />
      </Modal>

      {/* Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Remover serviço"
        message={`Tem certeza que deseja remover "${deleteTarget?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Remover"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

// ─── Row ──────────────────────────────────────────────────────
const ServiceRow: React.FC<{ service: Service; index: number; onEdit(): void; onToggle(): void; onDelete(): void }> =
  ({ service: s, index, onEdit, onToggle, onDelete }) => {
    const mins = s.duration_minutes;
    const durationLabel = mins >= 60 ? `${Math.floor(mins / 60)}h${mins % 60 > 0 ? ` ${mins % 60}min` : ''}` : `${mins}min`;
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.03 }}
        className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors group">
        <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/15 flex items-center justify-center flex-shrink-0">
          <Scissors className="w-4 h-4 text-[#D4AF37]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-white">{s.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Clock className="w-3 h-3 text-white/30" />
            <span className="text-[11px] text-white/35">{durationLabel}</span>
          </div>
        </div>
        <p className="text-[16px] font-bold text-[#D4AF37] flex-shrink-0">R$ {s.price.toFixed(2)}</p>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-2 rounded-lg hover:bg-white/8 text-white/40 hover:text-white transition-all cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={onToggle} className={`p-2 rounded-lg transition-all cursor-pointer ${s.is_active ? 'hover:bg-orange-400/8 text-white/40 hover:text-orange-400' : 'hover:bg-emerald-400/8 text-white/40 hover:text-emerald-400'}`}>
            {s.is_active ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
          </button>
          <button onClick={onDelete} className="p-2 rounded-lg hover:bg-red-500/8 text-white/40 hover:text-red-400 transition-all cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </motion.div>
    );
  };
