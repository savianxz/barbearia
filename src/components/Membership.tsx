import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { shop } from '../data/mockData';

export const Membership: React.FC = () => {
  const { membership } = shop;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } }
  };

  const handleJoinClub = () => {
    window.open(shop.whatsappLink, '_blank');
  };

  return (
    <section id="clube" className="py-24 sm:py-32 bg-bg-dark border-b border-border-premium relative overflow-hidden">
      {/* Visual gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gold/5 blur-[160px] rounded-full pointer-events-none" />
      
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
            Assinatura Exclusiva
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight text-white mb-6 uppercase"
          >
            {membership.name}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-text-secondary text-base font-light tracking-wide max-w-xl mx-auto"
          >
            Liberdade total para manter seu visual sempre impecável por um valor fixo mensal reduzido.
          </motion.p>
        </div>

        {/* Pricing/Feature Board */}
        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="w-full max-w-3xl bg-neutral-900 border border-gold/25 p-8 sm:p-12 relative flex flex-col md:flex-row justify-between items-stretch shadow-[0_20px_50px_rgba(212,175,55,0.06)] overflow-hidden"
          >
            {/* Subtle glow border corners */}
            <div className="absolute top-0 left-0 w-20 h-[1px] bg-gold" />
            <div className="absolute top-0 left-0 w-[1px] h-20 bg-gold" />
            <div className="absolute bottom-0 right-0 w-20 h-[1px] bg-gold" />
            <div className="absolute bottom-0 right-0 w-[1px] h-20 bg-gold" />

            {/* Left Col: Pricing Title */}
            <div className="md:w-1/2 flex flex-col justify-between border-b md:border-b-0 md:border-r border-border-premium/50 pb-8 md:pb-0 md:pr-12 mb-8 md:mb-0">
              <div>
                <div className="flex items-center gap-2 text-gold mb-4">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-bold tracking-widest">Acesso Ilimitado</span>
                </div>
                <h3 className="text-2xl font-display font-semibold text-white uppercase tracking-wider mb-2">
                  Corte Mensal Ilimitado
                </h3>
                <p className="text-text-secondary text-xs font-light leading-relaxed mb-8">
                  Corte o cabelo quantas vezes quiser com qualquer barbeiro da nossa equipe. Perfeito para homens que gostam de manter o alinhamento semanal ou quinzenal.
                </p>
              </div>

              <div>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-sm font-semibold text-text-secondary">R$</span>
                  <span className="text-5xl font-bold text-white tracking-tight">
                    {membership.price.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-xs text-text-secondary">/ {membership.period}</span>
                </div>

                <button
                  onClick={handleJoinClub}
                  className="w-full py-4 bg-gold hover:bg-gold-hover text-bg-dark font-bold text-xs tracking-widest uppercase transition-premium glow-gold flex items-center justify-center gap-2"
                >
                  {membership.ctaText}
                </button>
              </div>
            </div>

            {/* Right Col: Benefits List */}
            <div className="md:w-1/2 md:pl-12 flex flex-col justify-center">
              <h4 className="text-[10px] uppercase font-bold tracking-widest text-text-secondary mb-6">Vantagens Exclusivas</h4>
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex flex-col gap-4"
              >
                {membership.benefits.map((benefit, i) => (
                  <motion.div 
                    key={i} 
                    variants={itemVariants}
                    className="flex gap-3.5 items-start text-xs font-light"
                  >
                    <div className="p-0.5 bg-gold/10 border border-gold/30 text-gold flex-shrink-0">
                      <Check className="w-3.5 h-3.5 font-bold" />
                    </div>
                    <span className="text-text-primary leading-normal">{benefit}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>

          </motion.div>
        </div>

      </div>
    </section>
  );
};
