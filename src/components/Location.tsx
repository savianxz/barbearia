import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Phone, Navigation } from 'lucide-react';
import { shop } from '../data/mockData';

export const Location: React.FC = () => {
  const handleOpenMaps = () => {
    // Opens Google Maps Directions from user's current location (auto-detected by Google Maps)
    window.open(
      'https://www.google.com/maps/dir/?api=1&destination=Rua+Floriano+Peixoto,+488,+Esp%C3%ADrito+Santo+do+Pinhal,+SP,+Brasil&travelmode=driving',
      '_blank'
    );
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

          {/* Real Google Maps Embed */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 relative flex flex-col border border-border-premium bg-card-dark overflow-hidden min-h-[350px] lg:min-h-[500px]"
          >
            {/* Header badge */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-bg-dark/90 backdrop-blur-sm border border-border-premium px-3 py-1.5">
              <span className="w-2 h-2 bg-gold rounded-full animate-ping" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-gold">{shop.name}</span>
            </div>

            {/* Google Maps Iframe */}
            <div className="flex-1 w-full relative" style={{ minHeight: '350px' }}>
              <iframe
                title="Localização Barbearia F Street"
                src="https://maps.google.com/maps?q=Rua+Floriano+Peixoto,+488,+Esp%C3%ADrito+Santo+do+Pinhal,+SP,+Brasil&hl=pt-BR&z=17&output=embed"
                className="absolute inset-0 w-full h-full border-0 grayscale contrast-[1.1] brightness-75"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ filter: 'grayscale(30%) contrast(1.1) brightness(0.8) saturate(1.3)' }}
              />
              {/* Dark overlay on top edges */}
              <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-card-dark/50 to-transparent pointer-events-none z-[1]" />
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card-dark to-transparent pointer-events-none z-[1]" />
            </div>

            {/* Bottom action bar */}
            <div className="relative z-10 p-4 bg-card-dark border-t border-border-premium flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-left">
                <div className="p-2 bg-gold/10 border border-gold/30">
                  <MapPin className="w-4 h-4 text-gold" />
                </div>
                <div>
                  <p className="text-white text-xs font-semibold tracking-wide">Rua Floriano Peixoto, 488</p>
                  <p className="text-text-secondary text-[10px] font-light">Centro, Espírito Santo do Pinhal - SP</p>
                </div>
              </div>
              <button
                onClick={() => window.open('https://www.google.com/maps/dir/?api=1&destination=Rua+Floriano+Peixoto,+488,+Esp%C3%ADrito+Santo+do+Pinhal,+SP,+Brasil&destination_place_id=ChIJ&travelmode=driving', '_blank')}
                className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-gold text-bg-dark font-bold text-[10px] tracking-widest uppercase hover:bg-gold-hover transition-colors duration-300"
              >
                <Navigation className="w-3.5 h-3.5" />
                Traçar Rota
              </button>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
