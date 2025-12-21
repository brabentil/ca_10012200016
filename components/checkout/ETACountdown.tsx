'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingDown, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ETACountdownProps {
  estimatedArrival?: string | null;
  status: 'PENDING' | 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED';
  compact?: boolean;
  className?: string;
}

export default function ETACountdown({
  estimatedArrival,
  status,
  compact = false,
  className = '',
}: ETACountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<{
    minutes: number;
    seconds: number;
    isOverdue: boolean;
  } | null>(null);

  useEffect(() => {
    if (!estimatedArrival || status === 'DELIVERED' || status === 'FAILED') {
      setTimeRemaining(null);
      return;
    }

    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const eta = new Date(estimatedArrival).getTime();
      const difference = eta - now;

      if (difference <= 0) {
        return { minutes: 0, seconds: 0, isOverdue: true };
      }

      const minutes = Math.floor(difference / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return { minutes, seconds, isOverdue: false };
    };

    // Initial calculation
    setTimeRemaining(calculateTimeRemaining());

    // Update every second
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, [estimatedArrival, status]);

  // Format ETA time
  const formatETA = (etaString: string): string => {
    const date = new Date(etaString);
    return date.toLocaleTimeString('en-GH', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get urgency color
  const getUrgencyColor = () => {
    if (!timeRemaining) return 'text-gray-600';
    if (timeRemaining.isOverdue) return 'text-red-600';
    if (timeRemaining.minutes <= 5) return 'text-orange-600';
    if (timeRemaining.minutes <= 15) return 'text-yellow-600';
    return 'text-green-600';
  };

  const urgencyColor = getUrgencyColor();

  // Status messages
  if (status === 'DELIVERED') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${className}`}
      >
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-green-900">Delivered!</p>
              <p className="text-xs text-green-700">Your order has been delivered</p>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  if (status === 'FAILED') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${className}`}
      >
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-red-900">Delivery Failed</p>
              <p className="text-xs text-red-700">Please contact support</p>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  if (!estimatedArrival || !timeRemaining) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${className}`}
      >
        <Card className="p-4 bg-gray-50 border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">Calculating ETA...</p>
              <p className="text-xs text-gray-600">Please wait</p>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  if (compact) {
    // Compact inline view
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <Clock className={`w-4 h-4 ${urgencyColor}`} />
        <span className={`text-sm font-semibold ${urgencyColor}`}>
          {timeRemaining.isOverdue ? (
            'Arriving soon'
          ) : (
            `${timeRemaining.minutes}m ${timeRemaining.seconds}s`
          )}
        </span>
      </div>
    );
  }

  // Full card view
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${className}`}
    >
      <Card className="overflow-hidden">
        {/* Animated gradient header */}
        <motion.div
          animate={{
            background: timeRemaining.isOverdue
              ? ['linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)']
              : timeRemaining.minutes <= 5
              ? ['linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)']
              : ['linear-gradient(135deg, #003399 0%, #002677 100%)', 'linear-gradient(135deg, #002677 0%, #003399 100%)'],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="px-6 py-4"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-white" />
            <h3 className="text-white font-bold text-lg">Estimated Arrival</h3>
          </div>
        </motion.div>

        <div className="p-6">
          {/* Large Countdown Display */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-4">
              {/* Minutes */}
              <div>
                <motion.div
                  key={timeRemaining.minutes}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`text-5xl font-bold ${urgencyColor}`}
                >
                  {timeRemaining.minutes.toString().padStart(2, '0')}
                </motion.div>
                <p className="text-xs text-gray-600 mt-1 font-medium">MINUTES</p>
              </div>

              {/* Separator */}
              <div className={`text-4xl font-bold ${urgencyColor} pb-6`}>:</div>

              {/* Seconds */}
              <div>
                <motion.div
                  key={timeRemaining.seconds}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`text-5xl font-bold ${urgencyColor}`}
                >
                  {timeRemaining.seconds.toString().padStart(2, '0')}
                </motion.div>
                <p className="text-xs text-gray-600 mt-1 font-medium">SECONDS</p>
              </div>
            </div>

            {/* ETA Time */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <TrendingDown className="w-4 h-4 text-gray-600" />
              <p className="text-sm text-gray-700">
                Expected by <span className="font-bold">{formatETA(estimatedArrival)}</span>
              </p>
            </div>
          </div>

          {/* Status Message */}
          {timeRemaining.isOverdue ? (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-3"
            >
              <p className="text-sm text-red-800">
                <span className="font-semibold">Running slightly late.</span> Your rider will arrive shortly!
              </p>
            </motion.div>
          ) : timeRemaining.minutes <= 5 ? (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-orange-50 border border-orange-200 rounded-lg p-3"
            >
              <p className="text-sm text-orange-800">
                <span className="font-semibold">Almost there!</span> Your order will arrive in a few minutes.
              </p>
            </motion.div>
          ) : timeRemaining.minutes <= 15 ? (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"
            >
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">On the way!</span> Your rider is heading to your location.
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-3"
            >
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Tip:</span> Please be available to receive your order when the rider arrives.
              </p>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
