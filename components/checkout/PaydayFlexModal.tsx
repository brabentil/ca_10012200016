'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, DollarSign, CheckCircle, Info, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

interface PaydayFlexModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderAmount: number;
  onContinue?: () => void;
}

export default function PaydayFlexModal({
  isOpen,
  onClose,
  orderAmount,
  onContinue,
}: PaydayFlexModalProps) {
  const firstPayment = orderAmount * 0.5;
  const secondPayment = orderAmount - firstPayment;

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
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
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              {/* Header */}
              <div className="mb-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payday Flex</h2>
                <p className="text-sm text-gray-600">
                  Split your payment into two easy installments
                </p>
              </div>

              {/* How it Works */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-2 mb-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <h3 className="font-semibold text-blue-900">How it works:</h3>
                </div>
                <ol className="space-y-2 text-sm text-blue-900 ml-7">
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">1.</span>
                    <span>Pay 50% of your order total now</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">2.</span>
                    <span>Select your next payday (7-30 days away)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">3.</span>
                    <span>Pay the remaining 50% on your selected date</span>
                  </li>
                </ol>
              </div>

              {/* Payment Breakdown */}
              <div className="space-y-4 mb-6">
                <h3 className="font-bold text-gray-900 mb-3">Your Payment Plan</h3>
                
                {/* First Payment */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">1</span>
                      </div>
                      <span className="font-semibold text-gray-900">First Payment</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-xs font-semibold text-green-700">Pay Now</span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1 ml-10">
                    <span className="text-2xl font-bold text-green-700">
                      {formatPrice(firstPayment)}
                    </span>
                    <span className="text-sm text-green-600">(50%)</span>
                  </div>
                </motion.div>

                {/* Second Payment */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">2</span>
                      </div>
                      <span className="font-semibold text-gray-900">Second Payment</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span className="text-xs font-semibold text-blue-700">On Payday</span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1 ml-10">
                    <span className="text-2xl font-bold text-blue-700">
                      {formatPrice(secondPayment)}
                    </span>
                    <span className="text-sm text-blue-600">(50%)</span>
                  </div>
                </motion.div>

                {/* Total */}
                <div className="border-t-2 border-gray-200 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-semibold">Total Order Amount:</span>
                    <span className="text-2xl font-bold text-primary-600">
                      {formatPrice(orderAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary-600" />
                  Why Choose Payday Flex?
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>No interest or hidden fees</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Flexible payment schedule aligned with your payday</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Receive your items immediately after first payment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Automatic payment reminder before due date</span>
                  </li>
                </ul>
              </div>

              {/* Important Note */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-6">
                <p className="text-xs text-orange-900">
                  <strong>Important:</strong> Your order will be processed once you complete the first payment. 
                  The remaining amount will be charged on your selected payday. Make sure you have sufficient 
                  funds on the payment date.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 h-12"
                >
                  Go Back
                </Button>
                <Button
                  onClick={handleContinue}
                  className="flex-1 h-12 bg-primary-600 hover:bg-primary-700 text-white font-semibold"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Select Payday
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
