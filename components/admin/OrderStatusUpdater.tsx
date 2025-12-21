'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Loader2, AlertCircle, Package } from 'lucide-react';
import { toast } from 'sonner';

// Order status options
const ORDER_STATUSES = [
  { value: 'CONFIRMED', label: 'Confirmed', color: 'text-blue-600' },
  { value: 'PROCESSING', label: 'Processing', color: 'text-yellow-600' },
  { value: 'SHIPPED', label: 'Shipped', color: 'text-orange-600' },
  { value: 'DELIVERED', label: 'Delivered', color: 'text-green-600' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'text-red-600' },
] as const;

type OrderStatus = typeof ORDER_STATUSES[number]['value'];

interface OrderStatusUpdaterProps {
  orderIds: string[];
  currentStatus?: OrderStatus;
  onSuccess?: () => void;
  variant?: 'inline' | 'modal';
}

/**
 * OrderStatusUpdater Component
 * Bulk status updates for admin order management
 */
export default function OrderStatusUpdater({
  orderIds,
  currentStatus,
  onSuccess,
  variant = 'inline',
}: OrderStatusUpdaterProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>(currentStatus || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState(0);

  const isSingleOrder = orderIds.length === 1;
  const orderCountText = isSingleOrder ? '1 order' : `${orderIds.length} orders`;

  /**
   * Update order status via API
   */
  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update order');
    }

    return await response.json();
  };

  /**
   * Handle bulk status update
   */
  const handleUpdateStatus = async () => {
    if (!selectedStatus) {
      toast.error('Select Status');
      return;
    }

    if (selectedStatus === currentStatus && isSingleOrder) {
      toast.info('Status Unchanged');
      return;
    }

    setIsUpdating(true);
    setProgress(0);

    const selectedLabel = ORDER_STATUSES.find((s) => s.value === selectedStatus)?.label;

    try {
      const totalOrders = orderIds.length;
      let successCount = 0;
      let failCount = 0;

      // Update orders sequentially with progress tracking
      for (let i = 0; i < orderIds.length; i++) {
        try {
          await updateOrderStatus(orderIds[i], selectedStatus);
          successCount++;
        } catch (error) {
          console.error(`Failed to update order ${orderIds[i]}:`, error);
          failCount++;
        }

        // Update progress
        setProgress(((i + 1) / totalOrders) * 100);
      }

      // Show appropriate toast based on results
      if (failCount === 0) {
        toast.success(
          isSingleOrder
            ? `Status updated to ${selectedLabel}`
            : `${successCount} orders updated to ${selectedLabel}`
        );
      } else if (successCount > 0) {
        toast.warning(
          `${successCount} updated, ${failCount} failed`
        );
      } else {
        toast.error('Update failed');
      }

      // Reset and call success callback
      setProgress(0);
      onSuccess?.();
    } catch (error) {
      console.error('Bulk update error:', error);
      toast.error('Update failed');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: variant === 'modal' ? 20 : 0 }}
      animate={{ opacity: 1, y: 0 }}
      className={variant === 'modal' ? 'p-6 bg-white rounded-lg shadow-lg' : ''}
    >
      {/* Header */}
      {variant === 'modal' && (
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Update Status</h3>
            <p className="text-sm text-gray-600">{orderCountText}</p>
          </div>
        </div>
      )}

      {/* Status Selector */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          New Status
        </label>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
          disabled={isUpdating}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Select status...</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      {/* Progress Bar */}
      <AnimatePresence>
        {isUpdating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-2"
          >
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Updating...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className={`flex items-center gap-3 ${variant === 'modal' ? 'mt-6' : 'mt-4'}`}>
        <motion.button
          onClick={handleUpdateStatus}
          disabled={!selectedStatus || isUpdating}
          whileHover={!isUpdating && selectedStatus ? { scale: 1.02 } : {}}
          whileTap={!isUpdating && selectedStatus ? { scale: 0.98 } : {}}
          className="flex-1 px-6 py-3 bg-[#003399] text-white rounded-lg font-medium hover:bg-[#002266] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isUpdating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Update {orderCountText}
            </>
          )}
        </motion.button>
      </div>

      {/* Info Message */}
      {!isSingleOrder && !isUpdating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2"
        >
          <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-700">
            Orders will be updated sequentially. This may take a moment.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
