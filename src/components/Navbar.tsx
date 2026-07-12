import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Calendar, MessageCircle } from 'lucide-react';
import { shop } from '../data/mockData';

interface NavbarProps {
  onOpenBooking: () => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenBooking, onOpenAdmin }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const menuItems = [
    { name: 'A Barbearia', href: '#sobre' },
    { name: 'Clube', href: '#clube' },
    { name: 'Barbeiros', href: '#barbeiros' },
    { name: 'Serviços', href: '#servicos' },
    { name: 'Galeria', href: '#galeria' },
    { name: 'Avaliações', href: '#avaliacoes' },
    { name: 'Localização', href: '#localizacao' },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-40 border-b transition-all duration-300 ${
          scrolled
            ? 'border-border-premium bg-[rgba(9,9,9,0.95)] backdrop-blur-xl'
            : 'border-transparent bg-transparent'
        }`}
      >
        {/* Mobile: 60px height | Desktop: 80px height */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[60px] md:h-20 flex items-center justify-between">
          
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group" aria-label={`${shop.name} — Início`}>
            <div className="w-9 h-9 md:w-11 md:h-11 border border-border-premium bg-black/60 flex items-center justify-center overflow-hidden group-hover:border-gold/50 transition-colors duration-300 flex-shrink-0">
              <img
                src="/images/logo.jpg"
                alt={`${shop.name} Logo`}
                className="w-7 h-7 md:w-9 md:h-9 object-contain"
              />
            </div>
            <span className="font-display text-base md:text-lg tracking-widest text-white group-hover:text-gold transition-colors duration-300">
              {shop.logo}
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="relative text-sm text-text-secondary hover:text-white transition-colors duration-300 py-2 font-medium tracking-wide group"
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-gold transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onOpenAdmin}
              className="px-4 py-2.5 border border-neutral-850 hover:border-gold/30 text-text-secondary hover:text-white bg-transparent hover:bg-neutral-900/60 transition-all duration-300 font-semibold text-xs tracking-widest uppercase flex items-center gap-1.5 cursor-pointer"
            >
              Painel Admin
            </button>
            <button
              onClick={onOpenBooking}
              className="px-6 py-2.5 border border-gold text-gold hover:text-bg-dark bg-transparent hover:bg-gold glow-gold-hover transition-all duration-300 font-semibold text-xs tracking-widest uppercase flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              Agendar Horário
            </button>
          </div>

          {/* Mobile: Agendar button + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenBooking}
              className="flex items-center gap-1.5 px-3 py-2 bg-gold text-bg-dark font-bold text-[11px] tracking-widest uppercase tap-target"
            >
              <Calendar className="w-3.5 h-3.5" />
              Agendar
            </button>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="tap-target text-text-secondary hover:text-white transition-colors ml-1"
              aria-label="Abrir menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ── FULLSCREEN MOBILE MENU ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 md:hidden"
          >
            {/* Blur backdrop */}
            <div
              className="absolute inset-0 bg-[rgba(9,9,9,0.97)] backdrop-blur-xl"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Menu panel sliding in from top */}
            <motion.div
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative flex flex-col h-full px-6 pt-safe"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header row */}
              <div className="flex items-center justify-between h-[60px]">
                <a href="#" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5">
                  <div className="w-9 h-9 border border-border-premium bg-black/60 flex items-center justify-center overflow-hidden">
                    <img src="/images/logo.jpg" alt={`${shop.name} Logo`} className="w-7 h-7 object-contain" />
                  </div>
                  <span className="font-display text-base tracking-widest text-white">{shop.logo}</span>
                </a>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="tap-target text-text-secondary hover:text-white transition-colors"
                  aria-label="Fechar menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Divider */}
              <div className="h-px bg-border-premium mb-10" />

              {/* Nav links — large, easy to tap */}
              <nav className="flex flex-col gap-1 flex-grow">
                {menuItems.map((item, i) => (
                  <motion.button
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.04, duration: 0.3 }}
                    onClick={() => handleNavClick(item.href)}
                    className="group text-left py-4 flex items-center justify-between border-b border-border-premium/40 last:border-0"
                  >
                    <span className="text-2xl font-display font-semibold text-white group-hover:text-gold transition-colors duration-200 tracking-wide uppercase">
                      {item.name}
                    </span>
                    <span className="text-gold opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                  </motion.button>
                ))}
              </nav>

              {/* Bottom CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="flex flex-col gap-3 pb-safe mt-6"
              >
                {/* Painel Admin */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="w-full min-h-[52px] flex items-center justify-center gap-2 border border-gold/45 text-gold hover:bg-gold/5 transition-colors font-semibold text-xs tracking-widest uppercase cursor-pointer"
                >
                  Painel Admin
                </button>
                {/* WhatsApp */}
                <a
                  href={shop.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full min-h-[52px] flex items-center justify-center gap-2 border border-border-premium text-white hover:border-white transition-colors font-semibold text-xs tracking-widest uppercase"
                >
                  <MessageCircle className="w-4 h-4" />
                  Falar no WhatsApp
                </a>

                {/* Agendar — primary CTA */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenBooking();
                  }}
                  className="btn-mobile bg-gold hover:bg-gold-hover text-bg-dark"
                >
                  <Calendar className="w-4 h-4" />
                  Agendar Horário
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
