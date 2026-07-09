import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Phone, Navigation } from 'lucide-react';
import { shop } from '../data/mockData';

export const Location: React.FC = () => {
  const handleOpenMaps = () => {
    window.open(shop.addressMapLink, '_blank');
  };

  return (
    <section id="localizacao" className="py-24 sm:py-32 bg-bg-dark border-b border-border-premium relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gold/5 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-stretch">
          
          {/* Contact Details & Hours */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <motion.span 
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-xs uppercase font-bold tracking-[0.25em] text-gold mb-4 block"
              >
                Atendimento & Endereço
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-white mb-8 uppercase"
              >
                Localização & <br />
                <span className="text-text-secondary font-light">Funcionamento</span>
              </motion.h2>

              {/* Address detail */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex gap-4 items-start mb-8"
              >
                <div className="p-3 border border-border-premium bg-card-dark text-gold flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-1">Nosso Espaço</h4>
                  <p className="text-text-secondary text-sm leading-relaxed font-light">
                    {shop.address}
                  </p>
                </div>
              </motion.div>

              {/* Operational Hours */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="border-t border-border-premium/50 pt-8 mb-8"
              >
                <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gold" /> Horários de Atendimento
                </h4>
                <div className="flex flex-col gap-3">
                  {shop.businessHours.map((item) => (
                    <div key={item.days} className="flex justify-between items-center text-sm font-light">
                      <span className="text-text-secondary">{item.days}</span>
                      <span className={`font-semibold ${item.hours === 'Fechado' ? 'text-neutral-600' : 'text-white'}`}>
                        {item.hours}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 mt-8"
            >
              <button
                onClick={handleOpenMaps}
                className="flex-1 py-4 bg-gold text-bg-dark font-bold text-xs tracking-widest uppercase hover:bg-gold-hover transition-colors duration-300 flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                Como Chegar (Google Maps)
              </button>
              
              <a
                href={`tel:${shop.phoneRaw}`}
                className="px-6 py-4 border border-border-premium hover:border-white text-white font-semibold text-xs tracking-widest uppercase transition-colors duration-300 flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4 text-gold" />
                {shop.phone}
              </a>
            </motion.div>
          </div>

          {/* Premium Custom Map Representation */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 relative flex items-center justify-center border border-border-premium bg-card-dark overflow-hidden min-h-[350px] lg:min-h-[450px]"
          >
            {/* Dark Styled Map Grid Graphics (Abstract Grid SVG for premium tech vibe) */}
            <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />
            
            {/* Map Art Concept */}
            <div className="relative z-10 w-full h-full p-8 flex flex-col justify-between items-center text-center">
              {/* Elegant Graphic Element */}
              <div className="w-full max-w-md border border-dashed border-border-premium p-6 relative bg-bg-dark/80 backdrop-blur-sm mt-auto mb-auto">
                <span className="absolute -top-3 left-6 px-3 bg-card-dark text-[10px] uppercase font-bold tracking-widest text-gold border border-border-premium">
                  {shop.name.toUpperCase()}
                </span>
                <p className="text-xs text-text-secondary leading-relaxed font-light mb-6">
                  Nosso espaço premium fica localizado na tradicional Rua Floriano Peixoto em Espírito Santo do Pinhal - SP. Venha nos visitar para desfrutar de um café ou bebida cortesia enquanto recebe o melhor atendimento.
                </p>
                <div className="flex justify-center items-center gap-2 text-gold">
                  <span className="w-2 h-2 bg-gold rounded-full animate-ping" />
                  <span className="text-[10px] uppercase font-bold tracking-widest">Atendimento com Hora Marcada</span>
                </div>
              </div>
            </div>
            
            {/* Abstract geographic styling in the background */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" xmlns="http://www.w3.org/2000/svg">
              <path d="M 0 100 Q 150 150 300 100 T 600 200 T 900 150 T 1200 300" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="2" />
              <path d="M 100 0 Q 300 200 200 400 T 400 600" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1.5" />
              <path d="M 500 0 Q 600 300 550 600" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="3" />
              <circle cx="300" cy="220" r="80" fill="none" stroke="rgba(212, 175, 55, 0.15)" strokeWidth="1" strokeDasharray="5,5" />
              <circle cx="300" cy="220" r="10" fill="rgba(212, 175, 55, 0.8)" className="animate-pulse" />
              <circle cx="300" cy="220" r="3" fill="#090909" />
            </svg>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
