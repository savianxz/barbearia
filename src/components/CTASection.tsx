import React from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';

interface CTASectionProps {
  onOpenBooking: () => void;
}

export const CTASection: React.FC<CTASectionProps> = ({ onOpenBooking }) => {
  return (
    <section className="py-28 bg-black border-b border-border-premium relative overflow-hidden flex items-center justify-center">
      {/* Premium Gradient Background Grid */}
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      
      {/* Light aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gold/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.span
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-xs uppercase font-bold tracking-[0.3em] text-gold mb-6 block"
        >
          Reserva Instantânea
        </motion.span>
        
        <motion.h2
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-display font-bold tracking-tight text-white mb-6 uppercase leading-tight"
        >
          Pronto para elevar <br className="sm:hidden" /> seu estilo?
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-text-secondary text-base sm:text-lg max-w-xl mx-auto font-light leading-relaxed mb-12"
        >
          Garanta o seu horário na barbearia de luxo preferida da cidade em menos de 30 segundos. Sem cadastros demorados, sem complicações.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex justify-center"
        >
          <button
            onClick={onOpenBooking}
            className="px-10 py-5 bg-gold hover:bg-gold-hover text-bg-dark font-bold text-xs tracking-widest uppercase transition-all duration-300 glow-gold-hover flex items-center gap-3 group"
          >
            <Calendar className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
            Agendar Horário Agora
          </button>
        </motion.div>
      </div>
    </section>
  );
};
