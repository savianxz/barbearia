import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, Eye, EyeOff } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { signIn, user, adminAccess, signOut, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Consumir exclusivamente o resultado de validateAdminAccess()
  // Nenhuma lógica de permissão vive aqui.
  if (user && adminAccess && !adminAccess.authorized) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center p-6 select-none font-sans antialiased">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(214,175,55,0.06),transparent_50%)] pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[390px] bg-[#0E0E0E] border border-white/6 rounded-2xl p-7 shadow-2xl relative z-10 text-center space-y-5"
        >
          <div className="w-12 h-12 rounded-full bg-red-950/20 border border-red-500/30 flex items-center justify-center text-red-500 text-xl font-bold mx-auto">
            !
          </div>
          <div>
            <h1 className="text-base font-bold text-white uppercase tracking-wider mb-2">Acesso Restrito</h1>
            <p className="text-white/40 text-[12px] font-light leading-relaxed">
              {adminAccess.reason || 'Esta conta não possui permissões administrativas.'}
            </p>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full py-3 border border-white/10 hover:border-red-500/30 hover:bg-red-500/5 text-white/60 hover:text-red-400 font-semibold text-xs tracking-widest uppercase rounded-lg transition-all cursor-pointer"
          >
            Sair e trocar de conta
          </button>
        </motion.div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setLocalError('Preencha todos os campos.');
      return;
    }

    setLoading(true);
    setLocalError(null);

    try {
      const res = await signIn(email, password);
      if (res.error) {
        setLocalError(res.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-6 select-none font-sans antialiased">
      {/* Background radial soft light gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(214,175,55,0.06),transparent_50%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-[390px] bg-[#0E0E0E] border border-white/6 rounded-2xl p-8 shadow-2xl relative z-10"
      >
        {/* Header */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div className="text-center">
            <h1 className="text-base font-bold text-white uppercase tracking-widest">Painel Administrativo</h1>
            <p className="text-white/30 text-[11px] mt-1 tracking-wide">Acesso restrito à equipe</p>
          </div>
        </div>

        {/* Error display */}
        {(localError || authError) && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 px-4 py-3 rounded-lg bg-red-950/30 border border-red-500/20 flex items-start gap-2"
          >
            <span className="text-red-400 text-[11px] leading-relaxed">{localError || authError}</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-white/40 uppercase tracking-widest mb-2">
              E-mail
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              autoComplete="email"
              className="w-full bg-white/4 border border-white/8 rounded-lg px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#D4AF37]/40 focus:ring-1 focus:ring-[#D4AF37]/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-white/40 uppercase tracking-widest mb-2">
              Senha
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full bg-white/4 border border-white/8 rounded-lg px-4 py-3 pr-11 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#D4AF37]/40 focus:ring-1 focus:ring-[#D4AF37]/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            id="admin-login-btn"
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-[#D4AF37] hover:bg-[#C9A227] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-xs tracking-widest uppercase rounded-lg transition-all"
          >
            {loading ? 'Autenticando...' : 'Entrar'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
