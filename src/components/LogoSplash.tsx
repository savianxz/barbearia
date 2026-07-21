import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors } from 'lucide-react';

interface LogoSplashProps {
  shop: { name?: string; logo_url?: string } | null | undefined;
  visible: boolean;
  onComplete: () => void;
}

export function LogoSplash({ shop, visible, onComplete }: LogoSplashProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!visible) {
      // Trigger fade-out
      setExiting(true);
      const t = setTimeout(onComplete, 320); // Matches exit duration
      return () => clearTimeout(t);
    }
  }, [visible, onComplete]);

  const logoUrl = shop?.logo_url;
  const shopName = shop?.name || '';
  // Fallback: show first 2 initials when no logo_url
  const initials = shopName
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase();

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#090909]"
          aria-hidden="true"
        >
          {/* Logo mark */}
          <motion.div
            initial={{ opacity: 0, scale: 0.82, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.55,
              ease: [0.16, 1, 0.3, 1], // custom spring-like ease-out
              delay: 0.04,
            }}
            className="flex flex-col items-center gap-5"
          >
            {/* Logo container */}
            <div className="relative">
              {/* Glow ring */}
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full bg-[#D4AF37]/10 blur-2xl scale-[1.8]"
              />
              {/* Logo box */}
              <div className="relative w-24 h-24 border border-[#D4AF37]/30 rounded-2xl bg-black/60 flex items-center justify-center overflow-hidden shadow-2xl">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={shopName}
                    className="w-20 h-20 object-contain"
                    draggable={false}
                  />
                ) : initials ? (
                  <span className="text-3xl font-bold text-[#D4AF37] tracking-widest font-mono">
                    {initials}
                  </span>
                ) : (
                  <Scissors className="w-10 h-10 text-[#D4AF37]" />
                )}
              </div>
            </div>

            {/* Shop name */}
            {shopName && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
                className="text-white/70 text-sm font-semibold tracking-[0.3em] uppercase"
              >
                {shopName}
              </motion.p>
            )}
          </motion.div>

          {/* Bottom loading bar */}
          <motion.div
            className="absolute bottom-10 w-16 h-0.5 bg-white/10 rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div
              className="h-full bg-[#D4AF37]/60 rounded-full"
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ duration: 1.2, delay: 0.45, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.1 }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
