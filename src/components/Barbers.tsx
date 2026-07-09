import React from 'react';
import { motion } from 'framer-motion';
import { Star, Crown } from 'lucide-react';
import { shop, type Barber } from '../data/mockData';

interface BarbersProps {
  onSelectBarber: (barber: Barber) => void;
}

export const Barbers: React.FC<BarbersProps> = ({ onSelectBarber }) => {
  return (
    <section id="barbeiros" className="py-24 sm:py-32 bg-bg-dark border-b border-border-premium relative overflow-hidden">
      {/* Subtle ambient lighting */}
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-gold/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-24">
          <motion.span 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-xs uppercase font-bold tracking-[0.25em] text-gold mb-4 block"
          >
            Mestres da Lâmina & Tesoura
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight text-white mb-6 uppercase"
          >
            Nossos Barbeiros
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-text-secondary text-base font-light tracking-wide max-w-xl mx-auto"
          >
            Uma curadoria de profissionais de elite. Especializados em fundir técnicas clássicas com o design contemporâneo masculino.
          </motion.p>
        </div>

        {/* Grid of Barbers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {shop.barbers.map((barber, index) => (
            <motion.div
              key={barber.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.8, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="group relative flex flex-col bg-card-dark border border-border-premium overflow-hidden transition-all duration-300 hover:border-gold/30 hover:shadow-[0_20px_40px_rgba(212,175,55,0.06)]"
            >
              {/* Photo Area */}
              <div className="relative aspect-[4/5] overflow-hidden bg-neutral-900">
                <img 
                  src={barber.image} 
                  alt={barber.name} 
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 group-hover:filter grayscale-[20%] group-hover:grayscale-0"
                />
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-card-dark via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300" />
                
                {/* Floating Rating Tag */}
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-bg-dark/85 backdrop-blur-md border border-border-premium px-2.5 py-1 text-xs">
                  <Star className="w-3 h-3 text-gold fill-gold" />
                  <span className="font-semibold text-white">{barber.rating.toFixed(1)}</span>
                </div>
              </div>

              {/* Information Area */}
              <div className="p-6 flex flex-col flex-grow justify-between relative z-10 -mt-10 bg-card-dark border-t border-border-premium/50">
                <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display text-xl font-semibold text-white tracking-wide uppercase">
                    {barber.name}
                  </h3>
                  {barber.isFounder && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-gold/10 border border-gold/30 text-[9px] uppercase tracking-widest font-bold text-gold">
                      <Crown className="w-2.5 h-2.5" /> Fundador
                    </span>
                  )}
                </div>
                <div className="text-[11px] uppercase tracking-wider font-bold text-gold mb-3">
                  {barber.role}
                </div>
                  <p className="text-text-secondary text-xs leading-relaxed font-light mb-6 min-h-[48px]">
                    {barber.bio}
                  </p>

                  {/* Specialties List */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {barber.specialties.map((spec) => (
                      <span 
                        key={spec} 
                        className="text-[9px] uppercase tracking-widest text-text-secondary border border-border-premium px-2 py-0.5"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Select Button */}
                <button
                  onClick={() => onSelectBarber(barber)}
                  className="w-full py-3 bg-neutral-900 border border-border-premium hover:border-gold hover:bg-gold hover:text-bg-dark font-bold text-xs tracking-widest uppercase transition-premium"
                >
                  Escolher Barbeiro
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
