import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Calendar, ChevronDown, Award } from 'lucide-react';

interface HeroProps {
  onOpenBooking: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenBooking }) => {
  const { scrollY } = useScroll();
  
  // Create a light parallax effect for the background image
  const backgroundY = useTransform(scrollY, [0, 800], [0, 200]);
  const textY = useTransform(scrollY, [0, 800], [0, -100]);
  const textOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-black">
      {/* Background Image with Parallax */}
      <motion.div 
        className="absolute inset-0 z-0 bg-cover bg-center brightness-[0.3] scale-105"
        initial={{ scale: 1.15, opacity: 0 }}
        animate={{ scale: 1.05, opacity: 1 }}
        transition={{ duration: 1.8, ease: "easeOut" }}
        // Using a premium dark barber shop setting
        style={{
          y: backgroundY,
          backgroundImage: 'url(https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1920&auto=format&fit=crop)'
        }}
      />

      {/* Luxury Radial/Vignette Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-bg-dark via-transparent to-black/70" />
      <div className="absolute inset-0 z-10 bg-radial-gradient-vance pointer-events-none" 
           style={{
             backgroundImage: 'radial-gradient(circle at center, rgba(9, 9, 9, 0) 20%, rgba(9, 9, 9, 0.8) 100%)'
           }} 
      />

      {/* Content Container */}
      <motion.div 
        style={{ y: textY, opacity: textOpacity }}
        className="relative z-20 max-w-5xl mx-auto px-6 text-center flex flex-col items-center pt-20"
      >
        {/* Subtle Badge */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-2 px-3 py-1.5 border border-gold/30 bg-gold/5 rounded-full mb-8"
        >
          <Award className="w-3.5 h-3.5 text-gold" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-gold">
            A Experiência Masculina Definitiva
          </span>
        </motion.div>

        {/* Hero Headlines */}
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 uppercase leading-[1.08] font-display"
        >
          Redefinindo o Conceito de <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold-hover to-gold font-display italic">
            Cuidado Masculino
          </span>
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-base sm:text-lg md:text-xl text-text-secondary max-w-2xl font-light tracking-wide mb-12 leading-relaxed"
        >
          Agendamento expresso em menos de 30 segundos. Sofisticação clássica, técnicas cirúrgicas modernas e um ambiente de puro luxo reservado para você.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <button
            onClick={onOpenBooking}
            className="w-full sm:w-auto px-8 py-4 bg-gold hover:bg-gold-hover text-bg-dark font-bold text-xs tracking-widest uppercase glow-gold transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <Calendar className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Agendar Horário
          </button>
          
          <a
            href="#servicos"
            className="w-full sm:w-auto px-8 py-4 border border-border-premium hover:border-white text-white hover:bg-white/5 font-semibold text-xs tracking-widest uppercase transition-colors duration-300 text-center"
          >
            Conhecer Serviços
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center gap-2 cursor-pointer"
        onClick={() => document.getElementById('sobre')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <span className="text-[9px] uppercase font-bold tracking-[0.3em] text-text-secondary">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ChevronDown className="w-4 h-4 text-gold" />
        </motion.div>
      </motion.div>
    </section>
  );
};
