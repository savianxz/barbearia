import { motion } from 'framer-motion';
import { Scissors } from 'lucide-react';

export function PlatformLanding() {
  return (
    <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-lg"
      >
        {/* Icon */}
        <div className="mx-auto w-16 h-16 border border-gold/30 flex items-center justify-center mb-8">
          <Scissors className="w-7 h-7 text-gold" />
        </div>

        {/* Heading */}
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white uppercase tracking-widest mb-4">
          Plataforma de<br />
          <span className="text-gold">Barbearias</span>
        </h1>

        <p className="text-text-secondary text-sm sm:text-base font-light leading-relaxed mb-8">
          Esta é uma plataforma multi-tenant para barbearias. Para acessar uma
          barbearia específica, utilize o link fornecido pelo seu barbeiro.
        </p>

        {/* URL example */}
        <div className="inline-flex items-center gap-2 px-5 py-3 border border-border-premium bg-white/[0.03] text-text-secondary text-sm font-mono">
          <span className="text-white/30">seusite.com/</span>
          <span className="text-gold">nome-da-barbearia</span>
        </div>
      </motion.div>
    </div>
  );
}
