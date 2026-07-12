import React from 'react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 px-6 text-center"
  >
    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center mb-4 text-white/30">
      {icon}
    </div>
    <h3 className="text-sm font-semibold text-white/60 mb-1">{title}</h3>
    {description && <p className="text-xs text-white/30 max-w-xs">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </motion.div>
);
