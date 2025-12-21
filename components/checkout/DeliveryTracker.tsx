'use client';

import { motion } from 'framer-motion';
import { 
  Package, 
  UserCheck, 
  Truck, 
  CheckCircle, 
  Clock,
  XCircle
} from 'lucide-react';

type DeliveryStatus = 'PENDING' | 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED';

interface TimelineEvent {
  status: DeliveryStatus;
  timestamp?: string;
}

interface DeliveryTrackerProps {
  currentStatus: DeliveryStatus;
  timeline?: {
    assigned?: string;
    delivered?: string;
  };
  compact?: boolean;
  className?: string;
}

export default function DeliveryTracker({
  currentStatus,
  timeline,
  compact = false,
  className = '',
}: DeliveryTrackerProps) {
  
  // Define the delivery stages
  const stages = [
    {
      status: 'PENDING' as DeliveryStatus,
      label: 'Order Placed',
      icon: Package,
      description: 'Order received and being processed',
    },
    {
      status: 'ASSIGNED' as DeliveryStatus,
      label: 'Rider Assigned',
      icon: UserCheck,
      description: 'Rider assigned to your order',
    },
    {
      status: 'PICKED_UP' as DeliveryStatus,
      label: 'Picked Up',
      icon: Package,
      description: 'Order picked up by rider',
    },
    {
      status: 'IN_TRANSIT' as DeliveryStatus,
      label: 'In Transit',
      icon: Truck,
      description: 'On the way to your location',
    },
    {
      status: 'DELIVERED' as DeliveryStatus,
      label: 'Delivered',
      icon: CheckCircle,
      description: 'Order delivered successfully',
    },
  ];

  // Get current stage index
  const getCurrentStageIndex = () => {
    if (currentStatus === 'FAILED') return -1;
    return stages.findIndex(stage => stage.status === currentStatus);
  };

  const currentStageIndex = getCurrentStageIndex();

  // Determine if a stage is completed, current, or upcoming
  const getStageState = (index: number) => {
    if (currentStatus === 'FAILED') {
      return 'failed';
    }
    if (index < currentStageIndex) return 'completed';
    if (index === currentStageIndex) return 'current';
    return 'upcoming';
  };

  // Get stage colors
  const getStageColors = (state: string) => {
    switch (state) {
      case 'completed':
        return {
          icon: 'bg-green-500 text-white border-green-500',
          line: 'bg-green-500',
          text: 'text-green-700',
          label: 'text-gray-900 font-semibold',
        };
      case 'current':
        return {
          icon: 'bg-primary-500 text-white border-primary-500 ring-4 ring-primary-100',
          line: 'bg-gray-300',
          text: 'text-primary-700',
          label: 'text-gray-900 font-bold',
        };
      case 'upcoming':
        return {
          icon: 'bg-gray-200 text-gray-400 border-gray-300',
          line: 'bg-gray-300',
          text: 'text-gray-500',
          label: 'text-gray-600',
        };
      case 'failed':
        return {
          icon: 'bg-red-500 text-white border-red-500',
          line: 'bg-red-500',
          text: 'text-red-700',
          label: 'text-gray-900 font-semibold',
        };
      default:
        return {
          icon: 'bg-gray-200 text-gray-400 border-gray-300',
          line: 'bg-gray-300',
          text: 'text-gray-500',
          label: 'text-gray-600',
        };
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string | undefined): string => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('en-GH', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get timestamp for stage
  const getStageTimestamp = (status: DeliveryStatus): string | undefined => {
    if (status === 'ASSIGNED' || status === 'PICKED_UP') {
      return timeline?.assigned;
    }
    if (status === 'DELIVERED') {
      return timeline?.delivered;
    }
    return undefined;
  };

  if (compact) {
    // Compact horizontal progress bar
    return (
      <div className={`w-full ${className}`}>
        <div className="flex items-center justify-between mb-2">
          {stages.map((stage, index) => {
            const state = getStageState(index);
            const colors = getStageColors(state);
            const Icon = stage.icon;
            
            return (
              <div key={stage.status} className="flex items-center flex-1">
                {/* Stage Icon */}
                <div className="relative flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      border-2 ${colors.icon} transition-all duration-300
                    `}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.div>
                  
                  {/* Label below icon */}
                  <span className={`text-xs mt-1 text-center ${colors.label}`}>
                    {stage.label.split(' ')[0]}
                  </span>
                </div>
                
                {/* Connector Line */}
                {index < stages.length - 1 && (
                  <div className="flex-1 h-1 mx-2 relative">
                    <div className="absolute inset-0 bg-gray-300 rounded-full" />
                    {state === 'completed' && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className={`absolute inset-0 ${colors.line} rounded-full`}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Full vertical timeline view
  return (
    <div className={`w-full ${className}`}>
      {currentStatus === 'FAILED' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
              <XCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-red-900">Delivery Failed</h3>
              <p className="text-sm text-red-700 mt-1">
                There was an issue with your delivery. Please contact support for assistance.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="relative">
        {stages.map((stage, index) => {
          const state = getStageState(index);
          const colors = getStageColors(state);
          const Icon = stage.icon;
          const timestamp = getStageTimestamp(stage.status);
          const isLast = index === stages.length - 1;
          
          return (
            <motion.div
              key={stage.status}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="relative flex gap-4 pb-8"
            >
              {/* Vertical Line */}
              {!isLast && (
                <div className="absolute left-5 top-12 w-0.5 h-full -ml-px">
                  <div className="w-full h-full bg-gray-300" />
                  {state === 'completed' && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: '100%' }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`absolute inset-0 ${colors.line}`}
                    />
                  )}
                </div>
              )}

              {/* Stage Icon */}
              <div className={`
                relative z-10 w-10 h-10 rounded-full flex items-center justify-center
                border-2 flex-shrink-0 ${colors.icon} transition-all duration-300
              `}>
                {state === 'current' ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <Clock className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>

              {/* Stage Content */}
              <div className="flex-1 pt-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className={`text-base ${colors.label} transition-colors`}>
                      {stage.label}
                    </h3>
                    <p className={`text-sm mt-0.5 ${colors.text}`}>
                      {stage.description}
                    </p>
                  </div>
                  
                  {/* Timestamp */}
                  {timestamp && state !== 'upcoming' && (
                    <span className="text-xs text-gray-600 whitespace-nowrap">
                      {formatTimestamp(timestamp)}
                    </span>
                  )}
                </div>

                {/* Current stage indicator */}
                {state === 'current' && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-50 border border-primary-200 rounded-full"
                  >
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-primary-700">
                      In Progress
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
