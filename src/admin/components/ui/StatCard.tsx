import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: number; // percentage, positive = up, negative = down
  icon?: React.ReactNode;
  accent?: 'gold' | 'green' | 'red' | 'blue' | 'default';
  onClick?: () => void;
}

const accentMap = {
  gold:    { border: 'border-[#D4AF37]/30', icon: 'bg-[#D4AF37]/10 text-[#D4AF37]', trend: 'text-[#D4AF37]' },
  green:   { border: 'border-emerald-500/30', icon: 'bg-emerald-500/10 text-emerald-400', trend: 'text-emerald-400' },
  red:     { border: 'border-red-500/30', icon: 'bg-red-500/10 text-red-400', trend: 'text-red-400' },
  blue:    { border: 'border-blue-500/30', icon: 'bg-blue-500/10 text-blue-400', trend: 'text-blue-400' },
  default: { border: 'border-white/8', icon: 'bg-white/5 text-white/60', trend: 'text-white/60' },
};

export const StatCard: React.FC<StatCardProps> = ({
  label, value, sub, trend, icon, accent = 'default', onClick
}) => {
  const colors = accentMap[accent];
  const isPositive = trend !== undefined && trend > 0;
  const isNegative = trend !== undefined && trend < 0;

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={`relative bg-[#111111] border ${colors.border} p-5 rounded-xl cursor-default group transition-all duration-200 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-white/40 mb-2">{label}</p>
          <p className="text-2xl font-bold text-white leading-none">{value}</p>
          {sub && <p className="text-[12px] text-white/40 mt-1.5">{sub}</p>}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 ${isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-white/40'}`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : isNegative ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
              <span className="text-[11px] font-semibold">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colors.icon}`}>
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
};
