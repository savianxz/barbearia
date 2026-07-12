import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen, title, message, confirmLabel = 'Confirmar', danger = false, onConfirm, onCancel,
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="bg-[#111] border border-white/8 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl"
        >
          <div className="flex items-start gap-4">
            {danger && (
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
            )}
            <div>
              <h3 className="text-[14px] font-bold text-white">{title}</h3>
              <p className="text-[12px] text-white/50 mt-1 leading-relaxed">{message}</p>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 text-[12px] font-semibold transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-2.5 rounded-xl text-[12px] font-bold tracking-wide transition-all cursor-pointer ${
                danger
                  ? 'bg-red-500/90 hover:bg-red-500 text-white'
                  : 'bg-[#D4AF37] hover:bg-[#F3D66E] text-black'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, title, onClose, children }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-6 backdrop-blur-sm"
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
          className="bg-[#111] border border-white/8 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg shadow-2xl"
        >
          <div className="flex items-center justify-between p-6 border-b border-white/6">
            <h2 className="text-[15px] font-bold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

interface ToastProps {
  message: string;
  type: 'success' | 'error';
}

export const Toast: React.FC<ToastProps> = ({ message, type }) => (
  <motion.div
    initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-[12px] font-semibold ${
      type === 'success'
        ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
        : 'bg-red-500/10 border-red-500/25 text-red-400'
    }`}
  >
    <span>{type === 'success' ? '✓' : '✕'}</span>
    {message}
  </motion.div>
);
