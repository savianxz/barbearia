import React from 'react';
import { motion } from 'framer-motion';
import { Star, Sparkles, ChevronRight } from 'lucide-react';
import type { Barber } from '../types/scheduling';

interface BarbersProps {
  barbers: Barber[];
  onSelectBarber: (barber: Barber | 'first-available') => void;
}

export const Barbers: React.FC<BarbersProps> = ({ barbers, onSelectBarber }) => {
  const activeBarbers = barbers.filter(b => b.is_active);

  return (
    <section id="barbeiros" className="py-16 sm:py-24 md:py-32 bg-bg-dark border-b border-border-premium relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-gold/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 md:mb-24">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-[10px] uppercase font-bold tracking-[0.25em] text-gold mb-3 block"
          >
            Mestres da Lâmina & Tesoura
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-2xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight text-white mb-4 uppercase"
          >
            Nossos Barbeiros
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-text-secondary text-sm md:text-base font-light tracking-wide max-w-xl mx-auto"
          >
            Uma curadoria de profissionais de elite. Técnicas clássicas e design contemporâneo masculino.
          </motion.p>
        </div>

        {activeBarbers.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-border-premium bg-card-dark max-w-2xl mx-auto">
            <p className="text-text-secondary text-sm font-light">
              Nenhum profissional cadastrado no momento.
            </p>
          </div>
        ) : (
          <>
            {/* ── MOBILE: Vertical list cards ──────────────────── */}
            <div className="flex flex-col gap-4 md:hidden">
              {activeBarbers.map((barber, index) => (
                <motion.div
                  key={barber.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className={`relative bg-card-dark border overflow-hidden active:scale-[0.99] transition-transform duration-150 ${barber.is_featured ? 'border-2 border-gold shadow-[0_0_15px_rgba(212,175,55,0.15)]' : 'border-border-premium'}`}
                >
                  {barber.is_featured && (
                    <div className="absolute top-0 right-0 bg-gold text-black text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-bl-sm shadow-sm z-20">
                      Em Destaque
                    </div>
                  )}
                  <div className="flex gap-4 p-4">
                    {/* Photo */}
                    <div 
                      className="relative w-24 h-24 flex-shrink-0 overflow-hidden bg-neutral-900 flex items-center justify-center text-4xl font-bold text-black"
                      style={{ backgroundColor: barber.color || '#D4AF37' }}
                    >
                      {barber.avatar_url ? (
                        <img src={barber.avatar_url} alt={barber.name} loading="lazy" className="w-full h-full object-cover" />
                      ) : (
                        barber.name.charAt(0).toUpperCase()
                      )}
                      {/* Rating badge */}
                      <div className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5 bg-bg-dark/90 backdrop-blur-sm border border-border-premium px-1.5 py-0.5">
                        <Star className="w-2.5 h-2.5 text-gold fill-gold" />
                        <span className="text-[10px] font-bold text-white">5.0</span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex flex-col justify-between flex-grow min-w-0 py-0.5">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <h3 className="font-display font-semibold text-white text-base uppercase tracking-wide">
                            {barber.name}
                          </h3>
                        </div>
                        <div className="text-[10px] uppercase tracking-wider font-bold text-gold mb-1.5">
                          Barbeiro Profissional
                        </div>
                        <p className="text-text-secondary text-[11px] leading-relaxed font-light line-clamp-2">
                          Especialista em cortes clássicos e design de barba, focado em excelência e precisão.
                        </p>
                      </div>

                      {/* Specialties */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {['Corte Clássico', 'Degradê'].map((spec) => (
                          <span
                            key={spec}
                            className="text-[8px] uppercase tracking-widest text-text-secondary border border-border-premium px-1.5 py-0.5"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Select button — full width */}
                  <div className="px-4 pb-4">
                    <button
                      onClick={() => onSelectBarber(barber)}
                      className="w-full min-h-[52px] bg-neutral-900 border border-border-premium hover:border-gold hover:bg-gold hover:text-bg-dark font-bold text-xs tracking-widest uppercase transition-all duration-250 flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      Escolher {barber.name.split(' ')[0]}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}

              {/* First Available — special card */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: activeBarbers.length * 0.08 }}
                className="border border-dashed border-gold/40 bg-gold/5 overflow-hidden"
              >
                <button
                  onClick={() => onSelectBarber('first-available')}
                  className="w-full flex items-center gap-4 p-4 text-left active:scale-[0.99] transition-transform duration-150"
                >
                  <div className="w-12 h-12 border border-dashed border-gold/30 flex items-center justify-center bg-black/40 text-gold flex-shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-display font-bold text-gold uppercase tracking-wider text-sm mb-0.5">
                      Primeiro Horário Disponível
                    </h4>
                    <p className="text-text-secondary text-[11px] font-light leading-relaxed">
                      Maior disponibilidade de agenda — agende agora mesmo.
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gold flex-shrink-0" />
                </button>
              </motion.div>
            </div>

            {/* ── DESKTOP: 4-column grid (original) ───────────── */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-8">
              {activeBarbers.map((barber, index) => (
                <motion.div
                  key={barber.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.8, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className={`group relative flex flex-col bg-card-dark border overflow-hidden transition-all duration-300 hover:border-gold/30 hover:shadow-[0_20px_40px_rgba(212,175,55,0.06)] ${barber.is_featured ? 'border-2 border-gold shadow-[0_0_20px_rgba(212,175,55,0.15)]' : 'border-border-premium'}`}
                >
                  {barber.is_featured && (
                    <div className="absolute top-0 right-0 bg-gold text-black text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-bl-md shadow-sm z-20">
                      Recomendado
                    </div>
                  )}
                  {/* Photo */}
                  <div 
                    className="relative aspect-[4/5] overflow-hidden bg-neutral-900 flex items-center justify-center text-7xl font-bold text-black"
                    style={{ backgroundColor: barber.color || '#D4AF37' }}
                  >
                    {barber.avatar_url ? (
                      <img src={barber.avatar_url} alt={barber.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                    ) : (
                      barber.name.charAt(0).toUpperCase()
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-card-dark via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300" />
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-bg-dark/85 backdrop-blur-md border border-border-premium px-2.5 py-1 text-xs">
                      <Star className="w-3 h-3 text-gold fill-gold" />
                      <span className="font-semibold text-white">5.0</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-6 flex flex-col flex-grow justify-between relative z-10 -mt-10 bg-card-dark border-t border-border-premium/50">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-display text-xl font-semibold text-white tracking-wide uppercase">{barber.name}</h3>
                      </div>
                      <div className="text-[11px] uppercase tracking-wider font-bold text-gold mb-3">Barbeiro Profissional</div>
                      <p className="text-text-secondary text-xs leading-relaxed font-light mb-6 min-h-[48px]">Especialista em cortes clássicos e design de barba, focado em excelência e precisão.</p>
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {['Corte Clássico', 'Degradê'].map((spec) => (
                          <span key={spec} className="text-[9px] uppercase tracking-widest text-text-secondary border border-border-premium px-2 py-0.5">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => onSelectBarber(barber)}
                      className="w-full py-3 bg-neutral-900 border border-border-premium hover:border-gold hover:bg-gold hover:text-bg-dark font-bold text-xs tracking-widest uppercase transition-premium"
                    >
                      Escolher Barbeiro
                    </button>
                  </div>
                </motion.div>
              ))}

              {/* First Available card — desktop */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: activeBarbers.length * 0.15 }}
                className="group flex flex-col border border-dashed border-gold/40 bg-gold/5 hover:border-gold hover:bg-gold/10 transition-premium overflow-hidden cursor-pointer"
                onClick={() => onSelectBarber('first-available')}
              >
                <div className="flex-grow flex flex-col items-center justify-center p-8 gap-4 text-center">
                  <div className="w-16 h-16 border border-dashed border-gold/30 flex items-center justify-center bg-black/40 text-gold">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-gold uppercase tracking-wider text-sm mb-2">Primeiro Horário Disponível</h4>
                    <p className="text-text-secondary text-xs font-light leading-relaxed">Selecione esta opção para a maior disponibilidade de agenda.</p>
                  </div>
                </div>
                <div className="p-6 border-t border-border-premium/30">
                  <button
                    onClick={() => onSelectBarber('first-available')}
                    className="w-full py-3 border border-gold/40 text-gold hover:bg-gold hover:text-bg-dark font-bold text-xs tracking-widest uppercase transition-premium"
                  >
                    Ver Disponibilidade
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
