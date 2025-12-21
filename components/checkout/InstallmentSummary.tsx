'use client';

import { motion } from 'framer-motion';
import { Calendar, DollarSign, CheckCircle, Clock, ArrowRight, CreditCard } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface InstallmentSummaryProps {
  totalAmount: number;
  firstPaymentDate?: string | Date;
  secondPaymentDate: string | Date;
  firstPaymentStatus?: 'PAID' | 'PENDING';
  secondPaymentStatus?: 'PAID' | 'PENDING' | 'OVERDUE';
  compact?: boolean;
  showHeader?: boolean;
}

export default function InstallmentSummary({
  totalAmount,
  firstPaymentDate,
  secondPaymentDate,
  firstPaymentStatus = 'PENDING',
  secondPaymentStatus = 'PENDING',
  compact = false,
  showHeader = true,
}: InstallmentSummaryProps) {
  // Calculate 50/50 split
  const firstPayment = totalAmount * 0.5;
  const secondPayment = totalAmount - firstPayment;

  // Format date for display
  const formatDate = (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-GH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get status icon and color
  const getStatusConfig = (status: 'PAID' | 'PENDING' | 'OVERDUE') => {
    switch (status) {
      case 'PAID':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'Paid',
        };
      case 'OVERDUE':
        return {
          icon: Clock,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'Overdue',
        };
      default:
        return {
          icon: Clock,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          label: 'Pending',
        };
    }
  };

  const firstStatusConfig = getStatusConfig(firstPaymentStatus);
  const secondStatusConfig = getStatusConfig(secondPaymentStatus);
  const FirstStatusIcon = firstStatusConfig.icon;
  const SecondStatusIcon = secondStatusConfig.icon;

  // Compact version for checkout review
  if (compact) {
    return (
      <Card className="p-4 border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50">
        <div className="space-y-3">
          {showHeader && (
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <CreditCard className="w-4 h-4 text-primary-600" />
              <h4 className="text-sm font-bold text-gray-900">Payday Flex Payment</h4>
            </div>
          )}

          {/* Payment Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-xs font-bold text-green-700">50%</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">First Payment</p>
                <p className="text-xs text-gray-600">Pay today</p>
              </div>
            </div>
            <p className="text-sm font-bold text-gray-900">GH₵ {firstPayment.toFixed(2)}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-xs font-bold text-blue-700">50%</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">Second Payment</p>
                <p className="text-xs text-gray-600">{formatDate(secondPaymentDate)}</p>
              </div>
            </div>
            <p className="text-sm font-bold text-gray-900">GH₵ {secondPayment.toFixed(2)}</p>
          </div>

          {/* Total */}
          <div className="pt-2 border-t-2 border-gray-300 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">Total</p>
            <p className="text-lg font-bold text-primary-600">GH₵ {totalAmount.toFixed(2)}</p>
          </div>
        </div>
      </Card>
    );
  }

  // Full detailed version
  return (
    <div className="space-y-4">
      {/* Header */}
      {showHeader && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Payment Schedule</h3>
            <p className="text-sm text-gray-600">50/50 Installment Plan</p>
          </div>
        </motion.div>
      )}

      {/* Payment Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        {/* First Payment Card */}
        <Card
          className={`p-5 border-2 ${
            firstPaymentStatus === 'PAID'
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
              : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full ${
                  firstPaymentStatus === 'PAID' ? 'bg-green-500' : 'bg-gray-400'
                } flex items-center justify-center shadow-md`}
              >
                <span className="text-lg font-bold text-white">1</span>
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900">First Payment</h4>
                <p className="text-sm text-gray-600">50% of total amount</p>
              </div>
            </div>
            <div
              className={`px-3 py-1.5 rounded-full border-2 ${firstStatusConfig.bgColor} ${firstStatusConfig.borderColor}`}
            >
              <div className="flex items-center gap-1.5">
                <FirstStatusIcon className={`w-4 h-4 ${firstStatusConfig.color}`} />
                <span className={`text-xs font-semibold ${firstStatusConfig.color}`}>
                  {firstStatusConfig.label}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">
                  {firstPaymentDate ? formatDate(firstPaymentDate) : 'Pay at checkout'}
                </span>
              </div>
              <span className="text-2xl font-bold text-gray-900">GH₵ {firstPayment.toFixed(2)}</span>
            </div>
            <div className="text-xs text-gray-600 bg-white/60 rounded px-2 py-1 inline-block">
              50% of order total
            </div>
          </div>
        </Card>

        {/* Connector Arrow */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2 text-gray-400">
            <div className="w-px h-6 bg-gray-300"></div>
            <ArrowRight className="w-5 h-5" />
            <div className="w-px h-6 bg-gray-300"></div>
          </div>
        </div>

        {/* Second Payment Card */}
        <Card
          className={`p-5 border-2 ${
            secondPaymentStatus === 'PAID'
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
              : secondPaymentStatus === 'OVERDUE'
              ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200'
              : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full ${
                  secondPaymentStatus === 'PAID'
                    ? 'bg-green-500'
                    : secondPaymentStatus === 'OVERDUE'
                    ? 'bg-red-500'
                    : 'bg-blue-500'
                } flex items-center justify-center shadow-md`}
              >
                <span className="text-lg font-bold text-white">2</span>
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900">Second Payment</h4>
                <p className="text-sm text-gray-600">Remaining 50%</p>
              </div>
            </div>
            <div
              className={`px-3 py-1.5 rounded-full border-2 ${secondStatusConfig.bgColor} ${secondStatusConfig.borderColor}`}
            >
              <div className="flex items-center gap-1.5">
                <SecondStatusIcon className={`w-4 h-4 ${secondStatusConfig.color}`} />
                <span className={`text-xs font-semibold ${secondStatusConfig.color}`}>
                  {secondStatusConfig.label}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">Due: {formatDate(secondPaymentDate)}</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">GH₵ {secondPayment.toFixed(2)}</span>
            </div>
            <div className="text-xs text-gray-600 bg-white/60 rounded px-2 py-1 inline-block">
              50% of order total
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Total Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-5 bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 mb-1">Total Order Amount</p>
              <p className="text-xs text-gray-600">
                2 payments of GH₵ {firstPayment.toFixed(2)} each
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary-600">GH₵ {totalAmount.toFixed(2)}</p>
              <p className="text-xs text-primary-700 font-semibold">No fees • No interest</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Info Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-3"
      >
        <p className="text-xs text-blue-800">
          <span className="font-semibold">Note:</span> Your second payment will be automatically processed on the selected payday. Make sure you have sufficient funds available.
        </p>
      </motion.div>
    </div>
  );
}
