'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  CheckCircle, 
  Package, 
  Calendar, 
  CreditCard, 
  ArrowRight,
  Truck,
  ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface PaymentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  orderId: string;
  totalAmount: number;
  paymentMethod: 'MOBILE_MONEY' | 'INSTALLMENT';
  isInstallment?: boolean;
  firstPaymentAmount?: number;
  paydayDate?: string;
  onViewOrder?: () => void;
  onContinueShopping?: () => void;
}

export default function PaymentConfirmationModal({
  isOpen,
  onClose,
  orderNumber,
  orderId,
  totalAmount,
  paymentMethod,
  isInstallment = false,
  firstPaymentAmount,
  paydayDate,
  onViewOrder,
  onContinueShopping,
}: PaymentConfirmationModalProps) {
  
  // Trigger confetti animation on mount
  useEffect(() => {
    if (isOpen) {
      // Delay confetti slightly for better effect
      const timer = setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#003399', '#00BFFF', '#FFD700', '#32CD32'],
        });
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-GH', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Calculate estimated delivery date (24-48 hours)
  const getEstimatedDelivery = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    
    return `${tomorrow.toLocaleDateString('en-GH', { month: 'short', day: 'numeric' })} - ${dayAfter.toLocaleDateString('en-GH', { month: 'short', day: 'numeric' })}`;
  };

  const handleViewOrder = () => {
    if (onViewOrder) {
      onViewOrder();
    }
    onClose();
  };

  const handleContinueShopping = () => {
    if (onContinueShopping) {
      onContinueShopping();
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors z-10"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              {/* Success Animation Header */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 px-6 pt-8 pb-6 text-center border-b-2 border-green-100">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 200, 
                    damping: 15,
                    delay: 0.2 
                  }}
                  className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500 flex items-center justify-center shadow-lg"
                >
                  <CheckCircle className="w-12 h-12 text-white" />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-gray-900 mb-2"
                >
                  Payment Successful!
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm text-gray-600"
                >
                  Your order has been confirmed
                </motion.p>
              </div>

              {/* Order Details */}
              <div className="p-6 space-y-5">
                {/* Order Number */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <Package className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 mb-0.5">Order Number</p>
                      <p className="text-base font-bold text-gray-900">#{orderNumber}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Payment Information */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <CreditCard className="w-4 h-4 text-primary-600" />
                    <h3 className="text-sm font-bold text-gray-900">Payment Details</h3>
                  </div>

                  {/* Payment Method */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Payment Method:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {isInstallment ? 'Payday Flex' : 'Mobile Money'}
                    </span>
                  </div>

                  {/* Installment Payment Info */}
                  {isInstallment && firstPaymentAmount && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Paid Now (50%):</span>
                        <span className="text-sm font-semibold text-green-600">
                          {formatPrice(firstPaymentAmount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Remaining (50%):</span>
                        <span className="text-sm font-semibold text-blue-600">
                          {formatPrice(totalAmount - firstPaymentAmount)}
                        </span>
                      </div>
                      {paydayDate && (
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                          <span className="text-sm text-gray-600">Due Date:</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {formatDate(paydayDate)}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {/* Total Amount */}
                  <div className="flex items-center justify-between pt-3 border-t-2 border-gray-300">
                    <span className="text-sm font-semibold text-gray-900">Total Amount:</span>
                    <span className="text-xl font-bold text-primary-600">
                      {formatPrice(totalAmount)}
                    </span>
                  </div>
                </motion.div>

                {/* Delivery Information */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-blue-50 rounded-lg p-4 border border-blue-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <Truck className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-blue-900 mb-1">
                        Campus Delivery
                      </p>
                      <p className="text-xs text-blue-700">
                        Your order will be delivered to your dorm within 24-48 hours
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-xs font-medium text-blue-800">
                          Est. Delivery: {getEstimatedDelivery()}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Installment Notice */}
                {isInstallment && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"
                  >
                    <p className="text-xs text-yellow-800">
                      <span className="font-semibold">Reminder:</span> Your second payment of{' '}
                      {firstPaymentAmount && formatPrice(totalAmount - firstPaymentAmount)} will be due on{' '}
                      {paydayDate && formatDate(paydayDate)}. You'll receive a reminder before the due date.
                    </p>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="space-y-3 pt-2"
                >
                  <Button
                    onClick={handleViewOrder}
                    className="w-full h-12 text-base font-semibold bg-primary-600 hover:bg-primary-700"
                  >
                    <Package className="w-5 h-5 mr-2" />
                    View Order Details
                  </Button>

                  <Button
                    onClick={handleContinueShopping}
                    variant="outline"
                    className="w-full h-12 text-base font-semibold border-2"
                  >
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Continue Shopping
                  </Button>
                </motion.div>

                {/* Success Message */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.0 }}
                  className="text-center pt-2"
                >
                  <p className="text-xs text-gray-600">
                    A confirmation email has been sent to your registered email address.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
