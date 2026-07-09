import React from 'react';
import { motion } from 'framer-motion';
import { shop } from '../data/mockData';

export const WhatsAppFAB: React.FC = () => {
  const handleOpenWhatsApp = () => {
    window.open(shop.whatsappLink, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Outer pulsing ring */}
      <div className="absolute inset-0 rounded-none bg-gold/15 animate-ping opacity-60 scale-125" />
      
      {/* Interactive FAB Button */}
      <motion.button
        onClick={handleOpenWhatsApp}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 bg-card-dark border border-gold hover:border-gold-hover text-gold hover:text-gold-hover flex items-center justify-center shadow-[0_10px_30px_rgba(212,175,55,0.15)] transition-colors duration-300 relative z-10 cursor-pointer"
        aria-label="Falar no WhatsApp"
      >
        {/* Custom Premium Gold WhatsApp SVG Icon */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="22" 
          height="22" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
        </svg>
      </motion.button>
    </div>
  );
};
