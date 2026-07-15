import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Power, PowerOff, User, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  useBarbers,
  useCreateBarber,
  useUpdateBarber,
  useDeleteBarber,
  useToggleBarber,
} from '../../hooks/useBarbers';
import type { Barber, CreateBarberInput, UpdateBarberInput } from '../../types/scheduling';
import { Modal, ConfirmDialog, Toast } from '../components/AdminDialogs';

const PRESET_COLORS = [
  '#D4AF37', '#E07B54', '#5B8DD9', '#7DCE82', '#C46BB0',
  '#E8C547', '#6B9BC4', '#D97B6C', '#72B8A0', '#B07DC4',
];

const inputCls = 'w-full bg-[#0D0D0D] border border-white/10 rounded-lg px-3 py-2.5 text-[13px] text-white placeholder:text-white/25 focus:outline-none focus:border-[#D4AF37]/60 transition-colors';
const labelCls = 'block text-[10px] uppercase tracking-wider font-semibold text-white/30 mb-1.5';

// ─── Form ─────────────────────────────────────────────────────
interface BarberFormProps {
  initial: Partial<Barber>;
  shopId: string;
  onSave: (d: CreateBarberInput | UpdateBarberInput) => void;
  loading: boolean;
}

const BarberForm: React.FC<BarberFormProps> = ({ initial, shopId, onSave, loading }) => {
  const [name, setName]   = useState(initial.name ?? '');
  const [phone, setPhone] = useState(initial.phone ?? '');
  const [email, setEmail] = useState(initial.email ?? '');
  const [color, setColor] = useState(initial.color ?? '#D4AF37');

  return (
    <form onSubmit={e => { e.preventDefault(); if (!name.trim()) return; onSave({ name: name.trim(), phone: phone || null, email: email || null, color, shop_id: shopId, profile_id: null, avatar_url: null, is_active: initial.is_active ?? true }); }} className="space-y-4">
      <div>
        <label className={labelCls}>Nome *</label>
        <input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="Nome do profissional" autoFocus />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Telefone</label>
          <input className={inputCls} value={phone} onChange={e => setPhone(e.target.value)} placeholder="(11) 99999-9999" />
        </div>
        <div>
          <label className={labelCls}>E-mail</label>
          <input type="email" className={inputCls} value={email} onChange={e => setEmail(e.target.value)} placeholder="barbeiro@email.com" />
        </div>
      </div>
      <div>
        <label className={labelCls}>Cor na Agenda</label>
        <div className="flex items-center gap-2 flex-wrap">
          {PRESET_COLORS.map(c => (
            <button key={c} type="button" onClick={() => setColor(c)} style={{ backgroundColor: c }}
              className={`w-7 h-7 rounded-full transition-all cursor-pointer ${color === c ? 'ring-2 ring-white/80 ring-offset-2 ring-offset-[#111] scale-110' : 'hover:scale-105'}`}
            />
          ))}
          <input type="color" value={color} onChange={e => setColor(e.target.value)}
            className="w-7 h-7 rounded-full cursor-pointer bg-transparent border-2 border-white/20 overflow-hidden" />
        </div>
      </div>
      <div className="pt-2 flex justify-end">
        <button type="submit" disabled={loading || !name.trim()}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#D4AF37] hover:bg-[#F3D66E] disabled:opacity-50 text-black font-bold text-[12px] tracking-widest uppercase rounded-xl transition-all cursor-pointer">
          {loading && <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />}
          Salvar
        </button>
      </div>
    </form>
  );
};

// ─── Page ─────────────────────────────────────────────────────
export const BarbeirosPage: React.FC = () => {
  const { staff } = useAuth();
  const shopId = staff?.shop_id ?? '';

  const { data: barbers = [], isLoading, isError, refetch } = useBarbers(shopId);
  const createMutation = useCreateBarber(shopId);
  const updateMutation = useUpdateBarber(shopId);
  const deleteMutation = useDeleteBarber(shopId);
  const toggleMutation = useToggleBarber(shopId);

  const [toast, setToast]               = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [formOpen, setFormOpen]         = useState(false);
  const [editTarget, setEditTarget]     = useState<Barber | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Barber | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;

  const handleSave = async (data: CreateBarberInput | UpdateBarberInput) => {
    try {
      if (editTarget) {
        await updateMutation.mutateAsync({ id: editTarget.id, input: data as UpdateBarberInput });
        showToast('Barbeiro atualizado!');
      } else {
        await createMutation.mutateAsync(data as CreateBarberInput);
        showToast('Barbeiro adicionado!');
      }
      setFormOpen(false);
    } catch (e: any) {
      showToast(e.message ?? 'Erro ao salvar.', 'error');
    }
  };

  const handleToggle = async (b: Barber) => {
    try {
      await toggleMutation.mutateAsync({ id: b.id, is_active: !b.is_active });
      showToast(`${b.name} ${!b.is_active ? 'ativado' : 'desativado'}`);
    } catch (e: any) {
      showToast(e.message ?? 'Erro ao atualizar.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      showToast('Barbeiro removido.');
    } catch (e: any) {
      showToast(e.message ?? 'Erro ao remover.', 'error');
    }
    setDeleteTarget(null);
  };

  const active   = barbers.filter(b => b.is_active);
  const inactive = barbers.filter(b => !b.is_active);

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">

      <AnimatePresence>{toast && <Toast message={toast.msg} type={toast.type} />}</AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Equipe</h1>
          <p className="text-[12px] text-white/40 mt-0.5">
            {isLoading ? 'Carregando...' : `${active.length} profissional${active.length !== 1 ? 'is' : ''} ativo${active.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => refetch()} className="p-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all cursor-pointer">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => { setEditTarget(null); setFormOpen(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] hover:bg-[#F3D66E] text-black font-bold text-[12px] tracking-widest uppercase rounded-xl transition-all cursor-pointer shadow-lg shadow-[#D4AF37]/10">
            <Plus className="w-4 h-4" /> Adicionar
          </button>
        </div>
      </div>

      {/* States */}
      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {isError && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 border border-dashed border-red-500/20 rounded-2xl">
          <p className="text-[13px] text-red-400">Erro ao carregar dados do Supabase.</p>
          <button onClick={() => refetch()} className="text-[12px] text-white/50 hover:text-white underline cursor-pointer">Tentar novamente</button>
        </div>
      )}

      {!isLoading && !isError && barbers.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 gap-4 text-center border border-dashed border-white/10 rounded-2xl">
          <div className="w-14 h-14 bg-white/4 rounded-2xl flex items-center justify-center">
            <User className="w-7 h-7 text-white/20" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-white/40">Nenhum profissional cadastrado</p>
            <p className="text-[11px] text-white/25 mt-1">Clique em "Adicionar" para começar</p>
          </div>
        </motion.div>
      )}

      {!isLoading && !isError && barbers.length > 0 && (
        <div className="space-y-8">
          {/* Active */}
          <section className="space-y-3">
            <p className="text-[10px] uppercase tracking-widest font-bold text-white/30">Ativos ({active.length})</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {active.map((b, i) => (
                <BarberCard key={b.id} barber={b} index={i}
                  onEdit={() => { setEditTarget(b); setFormOpen(true); }}
                  onToggle={() => handleToggle(b)}
                  onDelete={() => setDeleteTarget(b)}
                />
              ))}
            </div>
          </section>

          {inactive.length > 0 && (
            <section className="space-y-3">
              <p className="text-[10px] uppercase tracking-widest font-bold text-white/20">Inativos ({inactive.length})</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-55">
                {inactive.map((b, i) => (
                  <BarberCard key={b.id} barber={b} index={i}
                    onEdit={() => { setEditTarget(b); setFormOpen(true); }}
                    onToggle={() => handleToggle(b)}
                    onDelete={() => setDeleteTarget(b)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={formOpen} title={editTarget ? 'Editar Barbeiro' : 'Novo Profissional'} onClose={() => setFormOpen(false)}>
        <BarberForm key={editTarget?.id ?? 'new'} initial={editTarget ?? {}} shopId={shopId} onSave={handleSave} loading={isMutating} />
      </Modal>

      {/* Confirm delete */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Remover profissional"
        message={`Tem certeza que deseja remover ${deleteTarget?.name}? Esta ação não pode ser desfeita.`}
        confirmLabel="Remover"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

// ─── Card ──────────────────────────────────────────────────────
const BarberCard: React.FC<{ barber: Barber; index: number; onEdit(): void; onToggle(): void; onDelete(): void }> =
  ({ barber: b, index, onEdit, onToggle, onDelete }) => (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}
      className="bg-[#0E0E0E] border border-white/6 rounded-2xl p-5 group hover:border-white/12 transition-all">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-[18px] text-black"
          style={{ backgroundColor: b.color }}>
          {b.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[14px] font-bold text-white truncate">{b.name}</p>
            {!b.is_active && <span className="text-[9px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded-full">Inativo</span>}
          </div>
          {b.phone && <p className="text-[11px] text-white/40 mt-0.5">{b.phone}</p>}
          {b.email && <p className="text-[11px] text-white/30 truncate">{b.email}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
        <button onClick={onEdit} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-white/50 hover:text-white hover:bg-white/6 rounded-lg transition-all cursor-pointer">
          <Pencil className="w-3.5 h-3.5" /> Editar
        </button>
        <button onClick={onToggle} className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${b.is_active ? 'text-orange-400/80 hover:text-orange-400 hover:bg-orange-400/5' : 'text-emerald-400/80 hover:text-emerald-400 hover:bg-emerald-400/5'}`}>
          {b.is_active ? <><PowerOff className="w-3.5 h-3.5" /> Desativar</> : <><Power className="w-3.5 h-3.5" /> Ativar</>}
        </button>
        <button onClick={onDelete} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-red-400/60 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-all cursor-pointer">
          <Trash2 className="w-3.5 h-3.5" /> Remover
        </button>
      </div>
    </motion.div>
  );
