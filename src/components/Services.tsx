import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';
import { shop, type Service } from '../data/mockData';

interface ServicesProps {
  onSelectService: (service: Service) => void;
}

export const Services: React.FC<ServicesProps> = ({ onSelectService }) => {
  const [activeCategory, setActiveCategory] = useState<'cabelo' | 'barba' | 'tratamentos'>('cabelo');

  const categories = [
    { id: 'cabelo', label: 'Cabelo' },
    { id: 'barba', label: 'Barba' },
    { id: 'tratamentos', label: 'Tratamentos' }
  ] as const;

  const filteredServices = shop.services.filter(service => service.category === activeCategory);

  return (
    <section id="servicos" className="py-24 sm:py-32 bg-bg-dark border-b border-border-premium relative overflow-hidden">
      {/* Decorative ambient glow */}
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-gold/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <motion.span 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-xs uppercase font-bold tracking-[0.25em] text-gold mb-4 block"
          >
            Menu de Especialidades
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight text-white mb-6 uppercase"
          >
            Serviços Exclusivos
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-text-secondary text-base font-light tracking-wide max-w-xl mx-auto"
          >
            Técnicas artesanais de precisão cirúrgica. Selecione o serviço ideal para o seu momento e estilo.
          </motion.p>
        </div>

        {/* Categories Tab Bar */}
        <div className="flex justify-center mb-16 overflow-x-auto pb-4 scrollbar-none">
          <div className="flex border border-border-premium p-1.5 bg-card-dark rounded-none">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`relative px-6 py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors duration-300 rounded-none cursor-pointer ${
                  activeCategory === category.id ? 'text-bg-dark font-bold' : 'text-text-secondary hover:text-white'
                }`}
              >
                {activeCategory === category.id && (
                  <motion.div
                    layoutId="activeCategoryTab"
                    className="absolute inset-0 bg-gold"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid with Framer Motion AnimatePresence */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredServices.map((service) => (
              <motion.div
                layout
                key={service.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="group relative flex flex-col justify-between p-8 bg-card-dark border border-border-premium hover:border-gold/30 hover:shadow-[0_20px_40px_rgba(212,175,55,0.04)] transition-all duration-300 overflow-hidden"
              >
                {/* Gold Glow hover lines */}
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
