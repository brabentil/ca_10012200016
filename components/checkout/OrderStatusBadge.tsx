'use client';

import { motion } from 'framer-motion';
import { 
  Clock, 
  Package, 
  CheckCircle, 
  Truck, 
  User, 
  XCircle,
  PackageCheck 
} from 'lucide-react';

type OrderStatus = 'pending' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  animated?: boolean;
  className?: string;
}

export default function OrderStatusBadge({
  status,
  size = 'md',
  showIcon = true,
  animated = true,
  className = '',
}: OrderStatusBadgeProps) {
  
  // Status configuration with colors, labels, and icons
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending',
          icon: Clock,
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          border: 'border-gray-300',
          iconColor: 'text-gray-600',
          ringColor: 'ring-gray-300',
          description: 'Order received',
        };
      case 'processing':
        return {
          label: 'Processing',
          icon: Package,
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-300',
          iconColor: 'text-blue-600',
          ringColor: 'ring-blue-300',
          description: 'Being prepared',
        };
      case 'out_for_delivery':
        return {
          label: 'Out for Delivery',
          icon: Truck,
          bg: 'bg-orange-50',
          text: 'text-orange-700',
          border: 'border-orange-300',
          iconColor: 'text-orange-600',
          ringColor: 'ring-orange-300',
          description: 'On the way',
        };
      case 'delivered':
        return {
          label: 'Delivered',
          icon: PackageCheck,
          bg: 'bg-green-50',
          text: 'text-green-700',
          border: 'border-green-300',
          iconColor: 'text-green-600',
          ringColor: 'ring-green-300',
          description: 'Successfully delivered',
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          icon: XCircle,
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-300',
          iconColor: 'text-red-600',
          ringColor: 'ring-red-300',
          description: 'Order cancelled',
        };
      default:
        return {
          label: 'Unknown',
          icon: Clock,
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          border: 'border-gray-300',
          iconColor: 'text-gray-600',
          ringColor: 'ring-gray-300',
          description: 'Status unknown',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

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

  const badgeContent = (
    <div
      className={`
        inline-flex items-center ${currentSize.gap} ${currentSize.container}
        ${config.bg} ${config.text}
        font-semibold rounded-full 
        border ${config.border}
        ${className}
      `}
    >
      {showIcon && <Icon className={`${currentSize.icon} ${config.iconColor}`} />}
      <span>{config.label}</span>
    </div>
  );

  if (!animated) {
    return badgeContent;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="inline-block"
    >
      {badgeContent}
    </motion.div>
  );
}

// Compact variant for use in tables or lists
export function CompactOrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <OrderStatusBadge 
      status={status} 
      size="sm" 
      showIcon={true}
      animated={false}
    />
  );
}

// Large variant with additional details
export function DetailedOrderStatusBadge({ 
  status, 
  showDescription = false 
}: { 
  status: OrderStatus;
  showDescription?: boolean;
}) {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending',
          icon: Clock,
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          border: 'border-gray-300',
          iconColor: 'text-gray-600',
          description: 'Your order has been received and is awaiting confirmation',
        };
      case 'processing':
        return {
          label: 'Processing',
          icon: Package,
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-300',
          iconColor: 'text-blue-600',
          description: 'Your order is being prepared for delivery',
        };
      case 'out_for_delivery':
        return {
          label: 'Out for Delivery',
          icon: Truck,
          bg: 'bg-orange-50',
          text: 'text-orange-700',
          border: 'border-orange-300',
          iconColor: 'text-orange-600',
          description: 'Your order is on the way to your campus location',
        };
      case 'delivered':
        return {
          label: 'Delivered',
          icon: PackageCheck,
          bg: 'bg-green-50',
          text: 'text-green-700',
          border: 'border-green-300',
          iconColor: 'text-green-600',
          description: 'Your order has been successfully delivered',
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          icon: XCircle,
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-300',
          iconColor: 'text-red-600',
          description: 'This order has been cancelled',
        };
      default:
        return {
          label: 'Unknown',
          icon: Clock,
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          border: 'border-gray-300',
          iconColor: 'text-gray-600',
          description: 'Order status is unknown',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`
        flex items-start gap-3 p-4 rounded-lg border-2
        ${config.bg} ${config.border}
      `}
    >
      <div className={`
        flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
        ${config.bg} border-2 ${config.border}
      `}>
        <Icon className={`w-6 h-6 ${config.iconColor}`} />
      </div>
      <div className="flex-1">
        <h3 className={`text-lg font-bold ${config.text}`}>
          {config.label}
        </h3>
        {showDescription && (
          <p className={`text-sm mt-1 ${config.text} opacity-80`}>
            {config.description}
          </p>
        )}
      </div>
    </motion.div>
  );
}
