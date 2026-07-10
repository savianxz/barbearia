import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { shop } from '../data/mockData';

export const WhatsAppFAB: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleOpen = () => {
    window.open(shop.whatsappLink, '_blank');
  };

  return (
    <div
      className="fixed right-4 z-40"
      style={{ bottom: 'max(20px, env(safe-area-inset-bottom, 20px))' }}
    >
      {/* Desktop tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: 8, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-card-dark border border-border-premium px-3 py-1.5 text-xs font-semibold text-white shadow-lg hidden md:block"
          >
            Falar no WhatsApp
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full w-0 h-0 border-t-[5px] border-b-[5px] border-l-[5px] border-t-transparent border-b-transparent border-l-border-premium" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button — 48px on mobile (discrete), 56px on desktop */}
      <motion.button
        onClick={handleOpen}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        whileTap={{ scale: 0.93 }}
        className="w-12 h-12 md:w-14 md:h-14 bg-card-dark border border-gold/60 hover:border-gold text-gold hover:text-gold-hover flex items-center justify-center shadow-[0_8px_24px_rgba(212,175,55,0.12)] hover:shadow-[0_12px_32px_rgba(212,175,55,0.22)] transition-all duration-300 relative"
        aria-label="Falar no WhatsApp"
      >
        {/* Subtle pulse — desktop only (no ping on mobile = perf) */}
        <span className="absolute inset-0 rounded-none bg-gold/10 animate-ping opacity-40 hidden md:block" />

        <MessageCircle className="w-5 h-5 md:w-5.5 md:h-5.5 relative z-10" />
      </motion.button>
    </div>
  );
};
