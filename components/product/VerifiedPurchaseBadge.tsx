'use client';

import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

interface VerifiedPurchaseBadgeProps {
  className?: string;
  size?: 'sm' | 'md';
}

export default function VerifiedPurchaseBadge({
  className = '',
  size = 'md',
}: VerifiedPurchaseBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`
        inline-flex items-center gap-1.5
        bg-green-50 text-green-700 border border-green-200 
        rounded-full font-medium
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <ShieldCheck className={iconSizes[size]} />
      <span>Verified Purchase</span>
    </motion.div>
  );
}
