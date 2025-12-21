'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Calendar,
  DollarSign,
  Package,
  CreditCard,
  Info,
  CheckCircle,
  AlertCircle,
  FileText,
  Truck,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/ui/back-button';
import { Card } from '@/components/ui/card';
import PaymentStatusCard from '@/components/checkout/PaymentStatusCard';
import InstallmentSummary from '@/components/checkout/InstallmentSummary';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils';

interface PaymentData {
  id: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  method: string;
  status: 'PENDING' | 'PAID' | 'PARTIAL' | 'OVERDUE' | 'FAILED';
  installmentPlan: boolean;
  paidAmount: number | null;
  remainingAmount: number | null;
  paydayDate: string | null;
  transactionRef: string;
  createdAt: string;
  updatedAt: string;
  order: {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    createdAt: string;
  };
  customer: {
    id: string;
    email: string;
    name: string;
  };
}

export default function PaydayFlexDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    fetchPaymentDetails();
  }, [orderId]);

  const fetchPaymentDetails = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/payments/${orderId}`, {
        withCredentials: true,
      });

      if (response.data.success) {
        const data = response.data.data;
        
        // Validate that this is a Payday Flex payment
        if (!data.installmentPlan) {
          toast.error('This is not a Payday Flex order');
          router.push(`/orders`);
          return;
        }

        setPaymentData(data);
      } else {
        toast.error(response.data.message || 'Failed to load payment details');
        router.push('/orders');
      }
    } catch (error: any) {
      console.error('Fetch payment details error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load payment details';
      toast.error(errorMessage);
      
      if (error.response?.status === 401) {
        router.push('/login');
      } else {
        router.push('/orders');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayNow = async () => {
    if (!paymentData) return;

    setIsProcessingPayment(true);
    try {
      // Redirect to payment for second installment
      toast.info('Redirecting to payment...');
      
      // In production, this would initialize a new payment for the remaining amount
      // For now, we'll show a message
      toast.success('Payment feature will be available soon');
      
      // Refresh payment data
      await fetchPaymentDetails();
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Failed to process payment');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleViewOrder = () => {
    router.push(`/orders/${orderId}`);
  };

  // Calculate installment details
  const getInstallmentDetails = () => {
    if (!paymentData) return null;

    const firstPayment = paymentData.paidAmount || paymentData.amount * 0.5;
    const secondPayment = paymentData.remainingAmount || paymentData.amount - firstPayment;

    return {
      firstPayment: {
        amount: firstPayment,
        status: paymentData.paidAmount && paymentData.paidAmount > 0 ? ('PAID' as const) : ('PENDING' as const),
        paidAt: paymentData.paidAmount && paymentData.paidAmount > 0 ? paymentData.createdAt : undefined,
      },
      secondPayment: {
        amount: secondPayment,
        status: paymentData.status === 'PAID' 
          ? ('PAID' as const) 
          : paymentData.status === 'OVERDUE' 
          ? ('OVERDUE' as const) 
          : ('PENDING' as const),
        dueDate: paymentData.paydayDate || new Date().toISOString(),
      },
    };
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-GH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get order status badge color
  const getOrderStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'OUT_FOR_DELIVERY':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-primary-600 text-white py-6">
          <div className="container mx-auto px-4">
            <div className="animate-pulse">
              <div className="h-8 bg-primary-500 rounded w-64 mb-2"></div>
              <div className="h-4 bg-primary-500 rounded w-48"></div>
            </div>
          </div>
        </div>

        {/* Loading Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded-xl mb-6"></div>
              <div className="h-96 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return null;
  }

  const installmentDetails = getInstallmentDetails();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-8"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/orders"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Orders</span>
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Calendar className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">Payday Flex Payment</h1>
                <p className="text-white/90">
                  Order #{paymentData.orderNumber} • Installment Plan
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Payment Status Card */}
          {installmentDetails && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <PaymentStatusCard
                orderId={paymentData.orderId}
                orderNumber={paymentData.orderNumber}
                totalAmount={paymentData.amount}
                status={paymentData.status}
                installmentDetails={installmentDetails}
                onPayNow={handlePayNow}
                onViewDetails={handleViewOrder}
              />
            </motion.div>
          )}

          {/* Installment Summary */}
          {installmentDetails && paymentData.paydayDate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 border-2 border-gray-200">
                <InstallmentSummary
                  totalAmount={paymentData.amount}
                  firstPaymentDate={paymentData.createdAt}
                  secondPaymentDate={paymentData.paydayDate}
                  firstPaymentStatus={installmentDetails.firstPayment.status}
                  secondPaymentStatus={installmentDetails.secondPayment.status}
                />
              </Card>
            </motion.div>
          )}

          {/* Order Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 border-2 border-gray-200">
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-200">
                <Package className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-bold text-gray-900">Order Information</h3>
              </div>

              <div className="space-y-4">
                {/* Order Number */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Order Number:</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    #{paymentData.orderNumber}
                  </span>
                </div>

                {/* Order Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Order Status:</span>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full border ${getOrderStatusColor(
                      paymentData.order.status
                    )}`}
                  >
                    {paymentData.order.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Order Date */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Order Date:</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatDate(paymentData.order.createdAt)}
                  </span>
                </div>

                {/* Total Amount */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Total Amount:</span>
                  </div>
                  <span className="text-lg font-bold text-primary-600">
                    {formatPrice(paymentData.order.totalAmount)}
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Payment Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 border-2 border-gray-200">
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-200">
                <CreditCard className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-bold text-gray-900">Payment Details</h3>
              </div>

              <div className="space-y-4">
                {/* Payment Method */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Payment Method:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    Payday Flex (Installment)
                  </span>
                </div>

                {/* Transaction Reference */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Transaction Ref:</span>
                  <span className="text-xs font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                    {paymentData.transactionRef}
                  </span>
                </div>

                {/* Amount Paid */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Amount Paid:</span>
                  <span className="text-sm font-semibold text-green-600">
                    {formatPrice(paymentData.paidAmount || 0)}
                  </span>
                </div>

                {/* Remaining Amount */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Remaining:</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {formatPrice(paymentData.remainingAmount || 0)}
                  </span>
                </div>

                {/* Payday Date */}
                {paymentData.paydayDate && (
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <span className="text-sm text-gray-600">Payday Date:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatDate(paymentData.paydayDate)}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Customer Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6 border-2 border-gray-200">
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-200">
                <User className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-bold text-gray-900">Customer Information</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Name:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {paymentData.customer.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="text-sm text-gray-900">{paymentData.customer.email}</span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex gap-4"
          >
            <Button
              onClick={handleViewOrder}
              variant="outline"
              className="flex-1 h-12 text-base border-2"
            >
              <Package className="w-5 h-5 mr-2" />
              View Order Details
            </Button>
            <Button
              onClick={() => router.push('/orders')}
              variant="outline"
              className="flex-1 h-12 text-base border-2"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Orders
            </Button>
          </motion.div>

          {/* Help Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4"
          >
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Need Help?</p>
                <p>
                  If you have any questions about your Payday Flex payment or need to update your
                  payment date, please contact our support team.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
