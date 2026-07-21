import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Award, ChevronDown } from 'lucide-react';

interface HeroProps {
  onOpenBooking: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenBooking }) => {
  return (
    <section className="relative w-full overflow-hidden flex items-center justify-center bg-black min-h-[100svh]">
      {/* Background Image — no parallax on mobile (performance) */}
      <motion.div
        className="absolute inset-0 z-0 bg-cover bg-center brightness-[0.28]"
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1.02, opacity: 1 }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1920&auto=format&fit=crop)',
        }}
      />

      {/* Gradients */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-bg-dark via-bg-dark/30 to-black/70" />
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at center, rgba(9,9,9,0) 20%, rgba(9,9,9,0.75) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-20 w-full max-w-5xl mx-auto px-5 sm:px-8 flex flex-col items-center text-center pt-20 pb-10 sm:pb-24">

        {/* Badge */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-2 px-3 py-1.5 border border-gold/30 bg-gold/5 rounded-full mb-5 md:mb-8"
        >
          <Award className="w-3 h-3 md:w-3.5 md:h-3.5 text-gold" />
          <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest text-gold">
            Barbearia Artesanal
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.28, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-[2.1rem] leading-[1.1] sm:text-5xl md:text-7xl font-bold tracking-tight text-white mb-4 md:mb-6 uppercase font-display"
        >
          Redefinindo
          <br className="hidden sm:block" />
          {' '}o Cuidado{' '}
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold-hover to-gold font-display italic">
            Masculino
          </span>
        </motion.h1>

        {/* Subtitle — shorter on mobile */}
        <motion.p
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.42, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-sm md:text-lg text-text-secondary max-w-lg md:max-w-2xl font-light tracking-wide mb-8 md:mb-12 leading-relaxed"
        >
          <span className="md:hidden">
            Corte, barba e acabamento feitos com cuidado. Agende o seu horário agora.
          </span>
          <span className="hidden md:inline">
            Marque em segundos, chegue no horário, saia com um corte que você vai querer repetir. Sem enrolação, sem espera.
          </span>
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto"
        >
          {/* Primary CTA — full width mobile */}
          <button
            onClick={onOpenBooking}
            className="group relative overflow-hidden w-full sm:w-auto px-8 min-h-[56px] bg-gold hover:bg-gold-hover text-bg-dark font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2.5 transition-all duration-300 active:scale-[0.97]"
          >
            <Calendar className="w-4 h-4 transition-transform group-hover:scale-110" />
            Agendar Agora
            {/* Shimmer sweep on hover */}
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          </button>

          {/* Secondary CTA */}
          <a
            href="#servicos"
            className="w-full sm:w-auto px-8 min-h-[56px] border border-border-premium hover:border-white/40 text-white/80 hover:text-white font-semibold text-xs tracking-widest uppercase transition-all duration-300 flex items-center justify-center active:scale-[0.97]"
          >
            Ver Serviços
          </a>
        </motion.div>

        {/* Trust badges — visible on mobile too */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="flex items-center gap-6 mt-8 md:mt-10"
        >
          {[
            { label: '5★ Avaliações', value: '4.9' },
            { label: 'Clientes Atendidos', value: '2k+' },
            { label: 'Anos de Experiência', value: '8+' },
          ].map((badge) => (
            <div key={badge.label} className="flex flex-col items-center">
              <span className="text-lg md:text-2xl font-bold text-gold font-display">{badge.value}</span>
              <span className="text-[9px] md:text-[10px] text-text-secondary uppercase tracking-widest font-semibold text-center">
                {badge.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 cursor-pointer"
        onClick={() => document.getElementById('sobre')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <span className="text-[9px] uppercase font-bold tracking-[0.3em] text-text-secondary">Scroll</span>
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-4 h-4 text-gold" />
        </motion.div>
      </motion.div>
    </section>
  );
};
