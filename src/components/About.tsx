import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Clock, Award } from 'lucide-react';
import { shop } from '../data/mockData';

export const About: React.FC = () => {
  const stats = [
    { value: '+8 anos', label: 'Liderando com Tradição' },
    { value: '5.000+', label: 'Clientes Satisfeitos' },
    { value: '4.9', label: 'Estrelas no Google' }
  ];

  const highlights = [
    {
      icon: <Award className="w-5 h-5 text-gold" />,
      title: 'Barbeiros de Elite',
      description: 'Nossa equipe é formada por profissionais especialistas em visagismo e atendimento premium.'
    },
    {
      icon: <Clock className="w-5 h-5 text-gold" />,
      title: 'Pontualidade Britânica',
      description: 'Respeitamos seu tempo. Nossos atendimentos começam exatamente no horário agendado, sem filas.'
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-gold" />,
      title: 'Biossegurança Máxima',
      description: 'Ferramentas de corte e navalhas esterilizadas individualmente para cada cliente em autoclave.'
    }
  ];

  return (
    <section id="sobre" className="py-24 sm:py-32 bg-bg-dark border-b border-border-premium relative overflow-hidden">
      {/* Decorative subtle ambient lights */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-gold/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          {/* Editorial Photograph */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-gold/10 to-transparent blur-lg opacity-50 group-hover:opacity-80 transition duration-1000" />
            <div className="relative overflow-hidden aspect-[4/5] border border-border-premium">
              <img 
                src="/images/fachada.png" 
                alt="Fachada da Barbearia F Street" 
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>
          </motion.div>

          {/* Institutional Content */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <motion.span 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-xs uppercase font-bold tracking-[0.25em] text-gold mb-4 block"
            >
              A Tradição Encontra a Modernidade
            </motion.span>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight text-white mb-6 uppercase"
            >
              {shop.name} <br />
              <span className="text-text-secondary font-light">Uma Experiência Ritualística</span>
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-text-secondary text-base leading-relaxed tracking-wide mb-10 font-light"
            >
              {shop.aboutText}
            </motion.p>

            {/* Differentiators */}
            <div className="flex flex-col gap-6 mb-12">
              {highlights.map((h, i) => (
                <motion.div 
                  key={h.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 * i + 0.3 }}
                  className="flex gap-4 items-start"
                >
                  <div className="p-2 border border-border-premium bg-card-dark rounded-none flex-shrink-0">
                    {h.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm tracking-wide mb-1 uppercase">{h.title}</h3>
                    <p className="text-text-secondary text-xs leading-relaxed font-light">{h.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4 border-t border-border-premium pt-10">
              {stats.map((s, i) => (
                <motion.div 
                  key={s.label}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 * i + 0.4 }}
                  className="text-center sm:text-left"
                >
                  <div className="text-2xl sm:text-3xl font-display font-bold text-gold tracking-tight mb-1">{s.value}</div>
                  <div className="text-[10px] text-text-secondary uppercase tracking-widest leading-normal">{s.label}</div>
                </motion.div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
