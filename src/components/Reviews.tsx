import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { shop } from '../data/mockData';

export const Reviews: React.FC = () => {
  return (
    <section id="avaliacoes" className="py-24 sm:py-32 bg-bg-dark border-b border-border-premium relative overflow-hidden">
      {/* Decorative background light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 blur-[180px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-24">
          <motion.span 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-xs uppercase font-bold tracking-[0.25em] text-gold mb-4 block"
          >
            A Palavra de Quem Frequenta
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight text-white mb-6 uppercase"
          >
            Avaliações de Clientes
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-text-secondary text-base font-light tracking-wide max-w-xl mx-auto"
          >
            Mais do que um corte, proporcionamos uma experiência de bem-estar valorizada por homens exigentes.
          </motion.p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {shop.reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 35, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ 
                duration: 0.8, 
                delay: index * 0.12, 
                type: 'spring', 
                damping: 25, 
                stiffness: 100 
              }}
              className="bg-card-dark border border-border-premium p-8 relative flex flex-col justify-between hover:border-gold/20 transition-colors duration-300"
            >
              {/* Quote Mark */}
              <Quote className="absolute top-6 right-8 w-10 h-10 text-neutral-800 pointer-events-none" />

              <div>
                {/* Stars */}
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-gold fill-gold" />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-text-primary text-sm font-light leading-relaxed tracking-wide mb-8 italic">
                  "{review.text}"
                </p>
              </div>

              {/* Author Info */}
              <div className="flex items-center justify-between border-t border-border-premium/50 pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-none border border-border-premium overflow-hidden bg-neutral-900">
                    <img 
                      src={review.avatar} 
                      alt={review.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">{review.name}</h4>
                    <span className="text-[10px] text-gold uppercase tracking-widest font-semibold">Cliente VIP</span>
                  </div>
                </div>
                
                <span className="text-[10px] text-text-secondary uppercase font-semibold tracking-wider">
                  {review.date}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
