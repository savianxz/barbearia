import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronRight } from 'lucide-react';
import { shop, type Service } from '../data/mockData';

interface ServicesProps {
  onSelectService: (service: Service) => void;
}

export const Services: React.FC<ServicesProps> = ({ onSelectService }) => {
  const [activeCategory, setActiveCategory] = useState<'cabelo' | 'barba' | 'tratamentos'>('cabelo');

  const categories = [
    { id: 'cabelo', label: 'Cabelo' },
    { id: 'barba', label: 'Barba' },
    { id: 'tratamentos', label: 'Tratamentos' },
  ] as const;

  const filteredServices = shop.services.filter((s) => s.category === activeCategory);

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

        {/* Category Tab Bar — horizontal scroll on mobile */}
        <div className="flex justify-start md:justify-center mb-8 md:mb-16 overflow-x-auto scrollbar-none pb-1 px-0">
          <div className="flex border border-border-premium p-1 bg-card-dark flex-shrink-0 min-w-full md:min-w-0 w-full md:w-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`relative flex-1 md:flex-none px-4 md:px-6 py-3 text-xs font-semibold uppercase tracking-widest transition-colors duration-200 ${
                  activeCategory === category.id ? 'text-bg-dark font-bold' : 'text-text-secondary hover:text-white'
                }`}
              >
                {activeCategory === category.id && (
                  <motion.div
                    layoutId="activeCategoryTab"
                    className="absolute inset-0 bg-gold"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── MOBILE: Vertical full-width cards ── */}
        <motion.div layout className="flex flex-col gap-3 md:hidden">
          <AnimatePresence mode="popLayout">
            {filteredServices.map((service) => (
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
                  {/* Name + price row */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-base font-display font-semibold text-white uppercase tracking-wide leading-tight flex-grow">
                      {service.name}
                    </h3>
                    <span className="text-2xl font-bold text-gold flex-shrink-0 leading-tight">
                      R${service.price}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-text-secondary text-xs leading-relaxed font-light mb-4">
                    {service.description}
                  </p>

                  {/* Duration + CTA row */}
                  <div className="flex items-center gap-3">
                    {/* Duration badge */}
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 border border-border-premium flex-shrink-0">
                      <Clock className="w-3.5 h-3.5 text-gold" />
                      <span className="text-xs font-semibold text-white">{service.duration} min</span>
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() => onSelectService(service)}
                      className="flex-grow min-h-[48px] bg-neutral-900 border border-border-premium hover:border-gold hover:bg-gold hover:text-bg-dark font-bold text-xs tracking-widest uppercase transition-all duration-250 flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      Agendar
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* ── DESKTOP: 3-column grid (original layout) ── */}
        <motion.div layout className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredServices.map((service) => (
              <motion.div
                layout
                key={service.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="group relative flex flex-col justify-between p-8 bg-card-dark border border-border-premium hover:border-gold/30 hover:shadow-[0_20px_40px_rgba(212,175,55,0.04)] transition-all duration-300 overflow-hidden"
              >
                {/* Hover accent lines */}
                <div className="absolute top-0 left-0 w-[2px] h-0 bg-gold transition-all duration-500 group-hover:h-full" />
                <div className="absolute bottom-0 right-0 w-[2px] h-0 bg-gold transition-all duration-500 group-hover:h-full" />

                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-display text-white group-hover:text-gold uppercase tracking-wide transition-colors duration-300">
                      {service.name}
                    </h3>
                  </div>
                  <p className="text-text-secondary text-xs leading-relaxed font-light mb-8">
                    {service.description}
                  </p>
                </div>

                <div className="border-t border-border-premium/50 pt-6 mt-auto">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold">Valor</span>
                      <span className="text-xl font-bold text-gold">R$ {service.price}</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold">Duração</span>
                      <span className="text-sm font-semibold text-white flex items-center gap-1.5 justify-end">
                        <Clock className="w-3.5 h-3.5 text-gold" />
                        {service.duration} min
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onSelectService(service)}
                    className="w-full py-3 bg-neutral-900 border border-border-premium group-hover:border-gold group-hover:bg-gold group-hover:text-bg-dark font-bold text-xs tracking-widest uppercase transition-premium"
                  >
                    Agendar Serviço
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};
