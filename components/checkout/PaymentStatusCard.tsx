'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  CreditCard,
  ArrowRight,
  TrendingUp,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

type PaymentStatus = 'PENDING' | 'PAID' | 'PARTIAL' | 'OVERDUE' | 'FAILED';

interface InstallmentDetails {
  firstPayment: {
    amount: number;
    status: 'PAID' | 'PENDING';
    paidAt?: string;
  };
  secondPayment: {
    amount: number;
    status: 'PAID' | 'PENDING' | 'OVERDUE';
    dueDate: string;
  };
}

interface PaymentStatusCardProps {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  status: PaymentStatus;
  installmentDetails: InstallmentDetails;
  onPayNow?: () => void;
  onViewDetails?: () => void;
  compact?: boolean;
}

export default function PaymentStatusCard({
  orderId,
  orderNumber,
  totalAmount,
  status,
  installmentDetails,
  onPayNow,
  onViewDetails,
  compact = false,
}: PaymentStatusCardProps) {
  const [daysUntilDue, setDaysUntilDue] = useState<number>(0);
  const [isOverdue, setIsOverdue] = useState(false);

  // Calculate days until due and check if overdue
  useEffect(() => {
    const calculateDaysUntilDue = () => {
      const dueDate = new Date(installmentDetails.secondPayment.dueDate);
      const today = new Date();
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      setDaysUntilDue(diffDays);
      setIsOverdue(diffDays < 0);
    };

    calculateDaysUntilDue();
    const interval = setInterval(calculateDaysUntilDue, 1000 * 60 * 60); // Update every hour

    return () => clearInterval(interval);
  }, [installmentDetails.secondPayment.dueDate]);

  // Calculate progress percentage
  const paymentsCompleted = installmentDetails.firstPayment.status === 'PAID' ? 1 : 0;
  const totalPayments = 2;
  const progressPercentage = (paymentsCompleted / totalPayments) * 100;

  // Get status badge configuration
  const getStatusConfig = () => {
    if (status === 'PAID') {
      return {
        icon: CheckCircle,
        text: 'Fully Paid',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-700',
        iconColor: 'text-green-600',
      };
    }
    if (status === 'OVERDUE' || isOverdue) {
      return {
        icon: AlertCircle,
        text: 'Payment Overdue',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-700',
        iconColor: 'text-red-600',
      };
    }
    if (status === 'PARTIAL') {
      return {
        icon: Clock,
        text: 'Partial Payment',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-700',
        iconColor: 'text-blue-600',
      };
    }
    return {
      icon: Clock,
      text: 'Payment Pending',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-700',
      iconColor: 'text-yellow-600',
    };
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-GH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Compact version for lists/summaries
  if (compact) {
    return (
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {/* Left: Status and Progress */}
            <div className="flex items-center gap-3 flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusConfig.bgColor}`}>
                <StatusIcon className={`w-5 h-5 ${statusConfig.iconColor}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">Order #{orderNumber}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                    {paymentsCompleted}/{totalPayments} Paid
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Due: {formatDate(installmentDetails.secondPayment.dueDate)}</span>
                  {!isOverdue && daysUntilDue > 0 && (
                    <span className="text-gray-500">({daysUntilDue} days)</span>
                  )}
                  {isOverdue && (
                    <span className="text-red-600 font-semibold">({Math.abs(daysUntilDue)} days overdue)</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Amount and Action */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm text-gray-600">Remaining</div>
                <div className="text-lg font-bold text-primary-600">
                  GH₵ {installmentDetails.secondPayment.amount.toFixed(2)}
                </div>
              </div>
              {installmentDetails.secondPayment.status !== 'PAID' && onPayNow && (
                <Button
                  onClick={onPayNow}
                  size="sm"
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  Pay Now
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full detailed version
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary-50 to-blue-50 border-b-2 border-primary-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Payment Status</h3>
              <p className="text-sm text-gray-600">Order #{orderNumber}</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full border-2 ${statusConfig.bgColor} ${statusConfig.borderColor}`}>
            <div className="flex items-center gap-2">
              <StatusIcon className={`w-5 h-5 ${statusConfig.iconColor}`} />
              <span className={`font-semibold ${statusConfig.textColor}`}>
                {statusConfig.text}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Payment Progress</span>
            <span className="text-sm font-bold text-primary-600">
              {paymentsCompleted} of {totalPayments} payments completed
            </span>
          </div>
          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-green-600 rounded-full"
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500">0%</span>
            <span className="text-xs text-gray-500">50%</span>
            <span className="text-xs text-gray-500">100%</span>
          </div>
        </div>

        {/* Payment Timeline */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Payment Schedule
          </h4>

          {/* First Payment */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-4 rounded-lg border-2 ${
              installmentDetails.firstPayment.status === 'PAID'
                ? 'bg-green-50 border-green-200'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {installmentDetails.firstPayment.status === 'PAID' ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <Clock className="w-6 h-6 text-gray-400" />
                )}
                <div>
                  <div className="font-semibold text-gray-900">First Payment (50%)</div>
                  <div className="text-sm text-gray-600">
                    {installmentDetails.firstPayment.status === 'PAID'
                      ? `Paid on ${installmentDetails.firstPayment.paidAt ? formatDate(installmentDetails.firstPayment.paidAt) : 'Order date'}`
                      : 'Payment pending'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  GH₵ {installmentDetails.firstPayment.amount.toFixed(2)}
                </div>
                {installmentDetails.firstPayment.status === 'PAID' && (
                  <div className="text-xs font-semibold text-green-600">PAID</div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Connector Line */}
          <div className="flex justify-center">
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>

          {/* Second Payment */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`p-4 rounded-lg border-2 ${
              installmentDetails.secondPayment.status === 'PAID'
                ? 'bg-green-50 border-green-200'
                : isOverdue
                ? 'bg-red-50 border-red-200'
                : 'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {installmentDetails.secondPayment.status === 'PAID' ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : isOverdue ? (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                ) : (
                  <Calendar className="w-6 h-6 text-blue-600" />
                )}
                <div>
                  <div className="font-semibold text-gray-900">Second Payment (50%)</div>
                  <div className="text-sm text-gray-600">
                    Due: {formatDate(installmentDetails.secondPayment.dueDate)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  GH₵ {installmentDetails.secondPayment.amount.toFixed(2)}
                </div>
                {installmentDetails.secondPayment.status === 'PAID' && (
                  <div className="text-xs font-semibold text-green-600">PAID</div>
                )}
              </div>
            </div>

            {/* Due Date Countdown */}
            {installmentDetails.secondPayment.status !== 'PAID' && (
              <div className={`p-3 rounded-lg ${isOverdue ? 'bg-red-100' : 'bg-blue-100'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className={`w-4 h-4 ${isOverdue ? 'text-red-600' : 'text-blue-600'}`} />
                    <span className={`text-sm font-semibold ${isOverdue ? 'text-red-700' : 'text-blue-700'}`}>
                      {isOverdue
                        ? `${Math.abs(daysUntilDue)} days overdue`
                        : daysUntilDue === 0
                        ? 'Due today'
                        : `${daysUntilDue} days remaining`}
                    </span>
                  </div>
                  {!isOverdue && daysUntilDue <= 3 && (
                    <span className="text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                      Due soon
                    </span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Total Amount */}
        <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-700">Total Order Amount</span>
            <span className="text-2xl font-bold text-primary-600">
              GH₵ {totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Important Notice for Overdue */}
        {isOverdue && installmentDetails.secondPayment.status !== 'PAID' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4"
          >
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-orange-800">
                <p className="font-semibold mb-1">Payment Overdue</p>
                <p>
                  Your second installment payment is overdue. Please complete the payment to avoid any service interruptions.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {installmentDetails.secondPayment.status !== 'PAID' && onPayNow && (
            <Button
              onClick={onPayNow}
              className={`flex-1 h-12 text-base font-semibold ${
                isOverdue
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-primary-600 hover:bg-primary-700'
              }`}
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Pay Remaining Amount
            </Button>
          )}
          {onViewDetails && (
            <Button
              onClick={onViewDetails}
              variant="outline"
              className={`h-12 text-base font-semibold border-2 ${
                installmentDetails.secondPayment.status !== 'PAID' ? 'flex-1' : 'w-full'
              }`}
            >
              View Full Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
