'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Power, Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface RiderAvailabilityToggleProps {
  riderId: string;
  currentAvailability: boolean;
  riderName?: string;
  onSuccess?: (newAvailability: boolean) => void;
  variant?: 'default' | 'compact' | 'card';
  showLabel?: boolean;
}

/**
 * RiderAvailabilityToggle Component
 * Quick on/off switch for rider availability status
 */
export default function RiderAvailabilityToggle({
  riderId,
  currentAvailability,
  riderName,
  onSuccess,
  variant = 'default',
  showLabel = true,
}: RiderAvailabilityToggleProps) {
  const [isAvailable, setIsAvailable] = useState(currentAvailability);
  const [isUpdating, setIsUpdating] = useState(false);

  /**
   * Toggle rider availability via API
   */
  const handleToggle = async () => {
    const newAvailability = !isAvailable;
    
    setIsUpdating(true);

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        toast.error('Not authenticated');
        return;
      }

      const response = await fetch(`/api/admin/riders/${riderId}/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ isAvailable: newAvailability }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update availability');
      }

      // Update local state
      setIsAvailable(newAvailability);

      // Show success toast
      const statusText = newAvailability ? 'Online' : 'Offline';
      toast.success(
        riderName 
          ? `${riderName} is now ${statusText.toLowerCase()}`
          : `Status updated to ${statusText.toLowerCase()}`
      );

      // Call success callback
      onSuccess?.(newAvailability);
    } catch (error) {
      console.error('Toggle availability error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to update availability'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Render compact variant
  if (variant === 'compact') {
    return (
      <motion.button
        onClick={handleToggle}
        disabled={isUpdating}
        whileHover={!isUpdating ? { scale: 1.05 } : {}}
        whileTap={!isUpdating ? { scale: 0.95 } : {}}
        className={`
          relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-medium text-sm
          transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60
          ${isAvailable 
            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }
        `}
      >
        {isUpdating ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Power className={`w-3.5 h-3.5 ${isAvailable ? 'text-green-600' : 'text-gray-500'}`} />
        )}
        {isAvailable ? 'Online' : 'Offline'}
      </motion.button>
    );
  }

  // Render card variant
  if (variant === 'card') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`
                p-2.5 rounded-full transition-colors
                ${isAvailable ? 'bg-green-50' : 'bg-gray-100'}
              `}
            >
              <Power
                className={`w-5 h-5 ${isAvailable ? 'text-green-600' : 'text-gray-500'}`}
              />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Availability Status</h4>
              <p className="text-xs text-gray-600">
                {isAvailable ? 'Accepting deliveries' : 'Not accepting deliveries'}
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            onClick={handleToggle}
            disabled={isUpdating}
            className={`
              relative inline-flex h-7 w-12 items-center rounded-full
              transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
              disabled:cursor-not-allowed disabled:opacity-50
              ${isAvailable 
                ? 'bg-green-500 focus:ring-green-500' 
                : 'bg-gray-300 focus:ring-gray-400'
              }
            `}
          >
            <span className="sr-only">Toggle availability</span>
            <motion.span
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`
                inline-flex items-center justify-center h-5 w-5 rounded-full bg-white shadow-lg
                transform transition-transform
                ${isAvailable ? 'translate-x-6' : 'translate-x-1'}
              `}
            >
              <AnimatePresence mode="wait">
                {isUpdating ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                  >
                    <Loader2 className="w-3 h-3 animate-spin text-gray-500" />
                  </motion.div>
                ) : isAvailable ? (
                  <motion.div
                    key="check"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                  >
                    <Check className="w-3 h-3 text-green-600" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="x"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                  >
                    <X className="w-3 h-3 text-gray-500" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.span>
          </button>
        </div>

        {/* Status Indicator */}
        <div className="mt-3 flex items-center gap-2">
          <motion.div
            animate={{
              scale: isAvailable ? [1, 1.2, 1] : 1,
              opacity: isAvailable ? [1, 0.8, 1] : 1,
            }}
            transition={{
              duration: 2,
              repeat: isAvailable ? Infinity : 0,
              repeatType: 'loop',
            }}
            className={`
              w-2 h-2 rounded-full
              ${isAvailable ? 'bg-green-500' : 'bg-gray-400'}
            `}
          />
          <span className="text-xs font-medium text-gray-700">
            {isAvailable ? 'Online' : 'Offline'}
          </span>
        </div>
      </motion.div>
    );
  }

  // Default variant (toggle switch with label)
  return (
    <div className="flex items-center gap-3">
      {showLabel && (
        <div>
          <label htmlFor={`rider-toggle-${riderId}`} className="text-sm font-medium text-gray-700">
            Availability
          </label>
          <p className="text-xs text-gray-500">
            {isAvailable ? 'Online' : 'Offline'}
          </p>
        </div>
      )}

      {/* Toggle Switch */}
      <button
        id={`rider-toggle-${riderId}`}
        onClick={handleToggle}
        disabled={isUpdating}
        className={`
          relative inline-flex h-8 w-14 items-center rounded-full
          transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
          disabled:cursor-not-allowed disabled:opacity-50
          ${isAvailable 
            ? 'bg-[#003399] focus:ring-[#003399]' 
            : 'bg-gray-300 focus:ring-gray-400'
          }
        `}
      >
        <span className="sr-only">Toggle rider availability</span>
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`
            inline-flex items-center justify-center h-6 w-6 rounded-full bg-white shadow-lg
            transform transition-transform
            ${isAvailable ? 'translate-x-7' : 'translate-x-1'}
          `}
        >
          <AnimatePresence mode="wait">
            {isUpdating ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, rotate: -180 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 180 }}
              >
                <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-500" />
              </motion.div>
            ) : isAvailable ? (
              <motion.div
                key="check"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
              >
                <Check className="w-3.5 h-3.5 text-[#003399]" />
              </motion.div>
            ) : (
              <motion.div
                key="x"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
              >
                <X className="w-3.5 h-3.5 text-gray-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.span>
      </button>

      {/* Status Badge */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={`
          px-2.5 py-1 rounded-full text-xs font-medium
          ${isAvailable 
            ? 'bg-green-100 text-green-700' 
            : 'bg-gray-100 text-gray-700'
          }
        `}
      >
        {isAvailable ? 'Available' : 'Unavailable'}
      </motion.div>
    </div>
  );
}
