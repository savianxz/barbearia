import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronRight, Star } from 'lucide-react';
import type { Service } from '../types/scheduling';

interface ServicesProps {
  services: Service[];
  onSelectService: (service: Service) => void;
}

export const Services: React.FC<ServicesProps> = ({ services, onSelectService }) => {
  return (
    <section id="servicos" className="py-16 sm:py-24 md:py-32 bg-bg-dark border-b border-border-premium relative overflow-hidden">
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-gold/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-14 md:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-[10px] uppercase font-bold tracking-[0.25em] text-gold mb-3 block"
          >
            Menu de Especialidades
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-2xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight text-white mb-4 uppercase"
          >
            Serviços Exclusivos
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-text-secondary text-sm md:text-base font-light tracking-wide max-w-xl mx-auto"
          >
            Técnicas artesanais de precisão cirúrgica. Selecione o serviço ideal para o seu estilo.
          </motion.p>
        </div>

        {/* ── MOBILE: Vertical full-width cards ── */}
        <motion.div layout className="flex flex-col gap-6 md:hidden">
          {/* Mobile Combos */}
          {services.filter(s => s.is_combo).length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 mb-1 pl-2">
                <Star className="w-4 h-4 text-gold fill-gold/20" />
                <h3 className="font-display font-bold text-white uppercase tracking-widest text-[11px]">Combos & Custo-Benefício</h3>
              </div>
              <AnimatePresence mode="popLayout">
                {services.filter(s => s.is_combo).map((service) => {
                  const parts = (service.combo_includes || service.name).split('+').map(p => p.trim().toLowerCase());
                  const avulsos = services.filter(reg => !reg.is_combo);
                  let originalPrice = 0;
                  parts.forEach(part => {
                    const match = avulsos.find(reg => reg.name.toLowerCase() === part);
                    if (match) originalPrice += Number(match.price);
                  });
                  const savings = originalPrice > service.price ? originalPrice - service.price : 0;

                  return (
                    <motion.div
                      layout
                      key={service.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="bg-gold/5 border border-gold/40 hover:border-gold overflow-hidden relative"
                    >
                      <div className="absolute top-0 right-0 bg-gold text-black text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-bl-sm shadow-sm">
                        Em Alta
                      </div>
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="text-base font-display font-bold text-gold uppercase tracking-wide leading-tight flex-grow">
                            {service.name}
                          </h3>
                          <div className="flex flex-col items-end">
                            {savings > 0 && <span className="text-[10px] text-text-secondary line-through">R${originalPrice.toFixed(2)}</span>}
                            <span className="text-2xl font-bold text-gold flex-shrink-0 leading-tight">
                              R${service.price}
                            </span>
                          </div>
                        </div>

                        {service.combo_includes && service.combo_includes !== service.name && (
                          <p className="text-text-secondary text-xs leading-relaxed font-light mb-4">
                            Inclui: {service.combo_includes}
                          </p>
                        )}
                        {savings > 0 && (
                          <p className="text-[11px] text-green-400 font-medium mb-4">
                            Você economiza R$ {savings.toFixed(2).replace('.', ',')}
                          </p>
                        )}

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 border border-gold/30 flex-shrink-0">
                            <Clock className="w-3.5 h-3.5 text-gold" />
                            <span className="text-xs font-semibold text-white">{service.duration_minutes} min</span>
                          </div>
                          <button
                            onClick={() => onSelectService(service)}
                            className="flex-grow min-h-[48px] bg-gold text-bg-dark font-bold text-xs tracking-widest uppercase transition-all duration-250 flex items-center justify-center gap-2 active:scale-[0.98]"
                          >
                            Agendar <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* Mobile Avulsos */}
          {services.filter(s => !s.is_combo).length > 0 && (
            <div className="flex flex-col gap-3 mt-4">
              <h3 className="font-display font-bold text-white/50 uppercase tracking-widest text-[11px] mb-1 pl-2">Serviços Avulsos</h3>
              <AnimatePresence mode="popLayout">
                {services.filter(s => !s.is_combo).map((service) => (
                  <motion.div
                    layout
                    key={service.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-card-dark border border-border-premium overflow-hidden"
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-base font-display font-semibold text-white uppercase tracking-wide leading-tight flex-grow">
                          {service.name}
                        </h3>
                        <span className="text-2xl font-bold text-gold flex-shrink-0 leading-tight">
                          R${service.price}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-4">
                        <div className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 border border-border-premium flex-shrink-0">
                          <Clock className="w-3.5 h-3.5 text-gold" />
                          <span className="text-xs font-semibold text-white">{service.duration_minutes} min</span>
                        </div>
                        <button
                          onClick={() => onSelectService(service)}
                          className="flex-grow min-h-[48px] bg-neutral-900 border border-border-premium hover:border-gold hover:bg-gold hover:text-bg-dark font-bold text-xs tracking-widest uppercase transition-all duration-250 flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                          Agendar <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* ── DESKTOP: 3-column grid ── */}
        <motion.div layout className="hidden md:flex flex-col gap-12">
          
          {/* Desktop Combos */}
          {services.filter(s => s.is_combo).length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-5 h-5 text-gold fill-gold/20" />
                <h3 className="font-display font-bold text-white uppercase tracking-widest text-sm">Combos & Custo-Benefício</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                <AnimatePresence mode="popLayout">
                  {services.filter(s => s.is_combo).map((service) => {
                    const parts = (service.combo_includes || service.name).split('+').map(p => p.trim().toLowerCase());
                    const avulsos = services.filter(reg => !reg.is_combo);
                    let originalPrice = 0;
                    parts.forEach(part => {
                      const match = avulsos.find(reg => reg.name.toLowerCase() === part);
                      if (match) originalPrice += Number(match.price);
                    });
                    const savings = originalPrice > service.price ? originalPrice - service.price : 0;

                    return (
                      <motion.div
                        layout
                        key={service.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="group relative flex flex-col justify-between p-8 bg-gold/5 border border-gold/40 hover:border-gold hover:shadow-[0_20px_40px_rgba(212,175,55,0.1)] transition-all duration-300 overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 bg-gold text-black text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-bl-md shadow-sm">
                          Em Alta
                        </div>
                        <div>
                          <h3 className="text-xl font-display font-bold text-gold uppercase tracking-wider mb-2">
                            {service.name}
                          </h3>
                          {service.combo_includes && service.combo_includes !== service.name && (
                            <p className="text-text-secondary text-sm font-light leading-relaxed mb-4">
                              Inclui: {service.combo_includes}
                            </p>
                          )}
                          {savings > 0 && (
                            <p className="text-sm text-green-400 font-medium mb-6">
                              Você economiza R$ {savings.toFixed(2).replace('.', ',')}
                            </p>
                          )}
                        </div>
                        
                        <div className="mt-8 flex items-end justify-between">
                          <div className="flex flex-col">
                            {savings > 0 && <span className="text-xs text-text-secondary line-through">R$ {originalPrice.toFixed(2)}</span>}
                            <span className="text-3xl font-bold text-gold tracking-tight">
                              <span className="text-lg text-gold/60 font-normal mr-1">R$</span>
                              {service.price}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-white/70 flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-gold/50" />
                            {service.duration_minutes} min
                          </span>
                        </div>

                        <button
                          onClick={() => onSelectService(service)}
                          className="mt-8 w-full min-h-[56px] border border-gold bg-gold text-bg-dark hover:bg-gold-light hover:border-gold-light uppercase font-bold text-xs tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 active:scale-[0.98]"
                        >
                          Agendar Agora
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Desktop Avulsos */}
          {services.filter(s => !s.is_combo).length > 0 && (
            <div>
              <h3 className="font-display font-bold text-white/50 uppercase tracking-widest text-sm mb-6 mt-4">Serviços Avulsos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                <AnimatePresence mode="popLayout">
                  {services.filter(s => !s.is_combo).map((service) => (
                    <motion.div
                      layout
                      key={service.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="group relative flex flex-col justify-between p-8 bg-card-dark border border-border-premium hover:border-gold/30 hover:shadow-[0_20px_40px_rgba(212,175,55,0.04)] transition-all duration-300 overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-[2px] h-0 bg-gold transition-all duration-500 group-hover:h-full" />
                      <div className="absolute bottom-0 right-0 w-[2px] h-0 bg-gold transition-all duration-500 group-hover:h-full" />
                      
                      <div>
                        <h3 className="text-lg font-display font-semibold text-white uppercase tracking-wider mb-2">
                          {service.name}
                        </h3>
                        {service.combo_includes && service.combo_includes !== service.name && (
                          <p className="text-text-secondary text-sm font-light leading-relaxed mb-4">
                            {service.combo_includes}
                          </p>
                        )}
                      </div>

                      <div className="mt-8 flex items-end justify-between">
                        <span className="text-2xl font-bold text-gold tracking-tight">
                          <span className="text-sm text-gold/60 font-normal mr-1">R$</span>
                          {service.price}
                        </span>
                        <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-gold/50" />
                          {service.duration_minutes} min
                        </span>
                      </div>

                      <button
                        onClick={() => onSelectService(service)}
                        className="mt-8 w-full min-h-[56px] border border-border-premium group-hover:border-gold hover:bg-gold hover:text-bg-dark uppercase font-bold text-xs tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 active:scale-[0.98]"
                      >
                        Agendar Agora
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};
