'use client';

import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Check } from 'lucide-react';

interface SimilarityBadgeProps {
  similarity: number; // 0-100 or 0-1 (will handle both)
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

export default function SimilarityBadge({
  similarity,
  size = 'md',
  showIcon = true,
  showLabel = true,
  animated = true,
  className = '',
}: SimilarityBadgeProps) {
  // Normalize similarity to percentage (0-100)
  const percentage = similarity > 1 ? similarity : similarity * 100;
  const roundedPercentage = Math.round(percentage);

  // Determine color scheme based on similarity
  const getColorScheme = () => {
    if (percentage >= 90) {
      return {
        bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
        text: 'text-white',
        border: 'border-green-400',
        icon: 'text-white',
        label: 'Excellent Match',
        ringColor: 'ring-green-400',
      };
    } else if (percentage >= 75) {
      return {
        bg: 'bg-gradient-to-r from-blue-500 to-cyan-600',
        text: 'text-white',
        border: 'border-blue-400',
        icon: 'text-white',
        label: 'Great Match',
        ringColor: 'ring-blue-400',
      };
    } else if (percentage >= 60) {
      return {
        bg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
        text: 'text-white',
        border: 'border-yellow-400',
        icon: 'text-white',
        label: 'Good Match',
        ringColor: 'ring-yellow-400',
      };
    } else {
      return {
        bg: 'bg-gradient-to-r from-gray-500 to-gray-600',
        text: 'text-white',
        border: 'border-gray-400',
        icon: 'text-white',
        label: 'Fair Match',
        ringColor: 'ring-gray-400',
      };
    }
  };

  const colorScheme = getColorScheme();

  // Size variants
  const sizeClasses = {
    sm: {
      container: 'px-2 py-1 text-xs',
      icon: 'w-3 h-3',
      gap: 'gap-1',
    },
    md: {
      container: 'px-3 py-1.5 text-sm',
      icon: 'w-4 h-4',
      gap: 'gap-1.5',
    },
    lg: {
      container: 'px-4 py-2 text-base',
      icon: 'w-5 h-5',
      gap: 'gap-2',
    },
  };

  const currentSize = sizeClasses[size];

  // Select appropriate icon
  const Icon = percentage >= 90 ? Check : percentage >= 75 ? TrendingUp : Sparkles;

  const badgeContent = (
    <div
      className={`
        inline-flex items-center ${currentSize.gap} ${currentSize.container}
        ${colorScheme.bg} ${colorScheme.text}
        font-bold rounded-full shadow-lg
        border-2 ${colorScheme.border}
        ${className}
      `}
    >
      {/* Icon */}
      {showIcon && (
        <Icon className={`${currentSize.icon} ${colorScheme.icon}`} />
      )}

      {/* Percentage */}
      <span className="font-extrabold">
        {roundedPercentage}%
      </span>

      {/* Label (optional) */}
      {showLabel && size !== 'sm' && (
        <span className="font-medium opacity-90 hidden sm:inline">
          {colorScheme.label}
        </span>
      )}
    </div>
  );

  if (!animated) {
    return badgeContent;
  }

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      whileHover={{ scale: 1.05 }}
      className="inline-block"
    >
      {badgeContent}
      
      {/* Animated ring pulse for high matches */}
      {percentage >= 75 && (
        <motion.div
          className={`absolute inset-0 rounded-full ring-2 ${colorScheme.ringColor} opacity-0`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.div>
  );
}

// Compact variant for use in product cards
export function CompactSimilarityBadge({
  similarity,
  className = '',
}: {
  similarity: number;
  className?: string;
}) {
  const percentage = similarity > 1 ? similarity : similarity * 100;
  const roundedPercentage = Math.round(percentage);

  const getBgColor = () => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`
        inline-flex items-center justify-center
        ${getBgColor()} text-white
        font-bold text-xs
        rounded-full
        w-12 h-12
        shadow-lg
        ${className}
      `}
    >
      <div className="text-center">
        <div className="text-sm leading-none">{roundedPercentage}%</div>
        <div className="text-[8px] leading-none opacity-80 mt-0.5">match</div>
      </div>
    </motion.div>
  );
}

// Badge with progress ring
export function RingSimilarityBadge({
  similarity,
  size = 60,
  className = '',
}: {
  similarity: number;
  size?: number;
  className?: string;
}) {
  const percentage = similarity > 1 ? similarity : similarity * 100;
  const roundedPercentage = Math.round(percentage);

  // Calculate circle properties
  const strokeWidth = size / 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getStrokeColor = () => {
    if (percentage >= 90) return '#22c55e'; // green-500
    if (percentage >= 75) return '#3b82f6'; // blue-500
    if (percentage >= 60) return '#eab308'; // yellow-500
    return '#6b7280'; // gray-500
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getStrokeColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      
      {/* Centered text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">{roundedPercentage}%</div>
          <div className="text-[10px] text-gray-600">match</div>
        </div>
      </div>
    </div>
  );
}
