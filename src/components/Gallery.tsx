import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { shop } from '../data/mockData';

export const Gallery: React.FC = () => {
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

  // Close lightbox on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedItemIndex(null);
      if (e.key === 'ArrowRight' && selectedItemIndex !== null) handleNext();
      if (e.key === 'ArrowLeft' && selectedItemIndex !== null) handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemIndex]);

  const handlePrev = () => {
    if (selectedItemIndex === null) return;
    setSelectedItemIndex(prev => (prev !== null && prev > 0 ? prev - 1 : shop.gallery.length - 1));
  };

  const handleNext = () => {
    if (selectedItemIndex === null) return;
    setSelectedItemIndex(prev => (prev !== null && prev < shop.gallery.length - 1 ? prev + 1 : 0));
  };

  const currentItem = selectedItemIndex !== null ? shop.gallery[selectedItemIndex] : null;

  return (
    <section id="galeria" className="py-24 sm:py-32 bg-bg-dark border-b border-border-premium relative overflow-hidden">
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
            Galeria Conceito
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight text-white mb-6 uppercase"
          >
            Estilo F Street
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-text-secondary text-base font-light tracking-wide max-w-xl mx-auto"
          >
            Nossa curadoria visual de cortes, barbas e a identidade urbana do nosso clube de cuidados.
          </motion.p>
        </div>

        {/* Premium Framer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {shop.gallery.map((item, index) => {
            const isLarge = index === 0 || index === 5;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
                onClick={() => setSelectedItemIndex(index)}
                className={`group relative overflow-hidden bg-neutral-900 border border-border-premium cursor-pointer ${
                  isLarge ? 'md:col-span-2 aspect-[16/9]' : 'aspect-square'
                }`}
              >
                <img
                  src={item.url}
                  alt={item.caption}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-6">
                  <div className="flex justify-end">
                    <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                      <ZoomIn className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold tracking-widest text-gold mb-1.5 block">Conceito</span>
                    <h4 className="text-white text-xs uppercase font-semibold tracking-wider font-display">{item.caption}</h4>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {currentItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
            onClick={() => setSelectedItemIndex(null)}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedItemIndex(null)}
              className="absolute top-6 right-6 p-2 border border-border-premium hover:border-white text-text-secondary hover:text-white transition-colors z-50"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Navigation buttons */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-6 top-1/2 -translate-y-1/2 p-3 border border-border-premium bg-card-dark/40 text-text-secondary hover:text-white transition-colors z-40 hidden sm:block"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-3 border border-border-premium bg-card-dark/40 text-text-secondary hover:text-white transition-colors z-40 hidden sm:block"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Lightbox Content Container */}
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative max-w-5xl max-h-[80vh] flex flex-col items-center z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={currentItem.url}
                alt={currentItem.caption}
                className="max-w-full max-h-[72vh] object-contain border border-border-premium shadow-2xl"
              />
              
              <div className="mt-4 text-center">
                <span className="text-[10px] text-gold uppercase tracking-widest font-semibold block mb-1">Visualização Ampliada</span>
                <h4 className="text-white text-sm font-semibold uppercase tracking-wider">{currentItem.caption}</h4>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
