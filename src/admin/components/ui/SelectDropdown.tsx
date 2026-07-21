import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface SelectDropdownProps {
  value: string;
  onChange: (val: string) => void;
  options: SelectOption[];
  placeholder?: string;
}

export const SelectDropdown: React.FC<SelectDropdownProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Selecione...'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div className="relative w-full text-[13px]" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white/5 border rounded-xl p-3 text-left flex items-center justify-between transition-all ${
          isOpen ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]' : 'border-white/10 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]'
        }`}
      >
        <div className="flex items-center gap-2">
          {selectedOption ? (
            <>
              {selectedOption.icon && <span className="text-white/50">{selectedOption.icon}</span>}
              <span className="text-white font-medium">{selectedOption.label}</span>
            </>
          ) : (
            <span className="text-white/40">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl shadow-black overflow-hidden"
          >
            <div className="max-h-60 overflow-y-auto scrollbar-none py-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-white/5 ${
                    value === option.value ? 'bg-white/5 text-[#D4AF37]' : 'text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {option.icon && (
                      <span className={`${value === option.value ? 'text-[#D4AF37]' : 'text-white/50'}`}>
                        {option.icon}
                      </span>
                    )}
                    <span className="font-medium">{option.label}</span>
                  </div>
                  {value === option.value && <Check className="w-4 h-4 text-[#D4AF37]" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
