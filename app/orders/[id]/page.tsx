'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Package,
  MapPin,
  Calendar,
  DollarSign,
  CreditCard,
  Truck,
  User,
  Phone,
  ShoppingBag,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/ui/back-button';
import { Card } from '@/components/ui/card';
import OrderStatusBadge from '@/components/checkout/OrderStatusBadge';
import DeliveryTracker from '@/components/checkout/DeliveryTracker';
import RiderInfo from '@/components/checkout/RiderInfo';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import Image from 'next/image';

type OrderStatus = 'pending' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled';
type PaymentStatus = 'PENDING' | 'PAID' | 'PARTIAL' | 'FAILED';
type DeliveryStatus = 'PENDING' | 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED';

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  priceAtPurchase: number;
  itemTotal: number;
  product: {
    id: string;
    title: string;
    size: string;
    color: string;
    condition: string;
    image: string | null;
  };
}

interface OrderDetails {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  deliveryAddress: string;
  campusZone: string;
  items: OrderItem[];
  payment: {
    id: string;
    paymentMethod: string;
    paymentStatus: PaymentStatus;
    amount: number;
    installmentPlan: boolean;
    paidAmount: number | null;
    remainingAmount: number | null;
    paydayDate: string | null;
  } | null;
  delivery: {
    id: string;
    deliveryStatus: DeliveryStatus;
    deliveryAddress: string;
    zoneId: string;
    assignedAt: string | null;
    deliveredAt: string | null;
    rider: {
      name: string;
      phone: string;
      zoneId: string;
    } | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch order details
  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        credentials: 'include',
      });

      if (response.status === 401) {
        toast.error('Session expired. Please login again');
        router.push('/login');
        return;
      }

      if (response.status === 404) {
        setError('Order not found');
        return;
      }

      if (response.status === 403) {
        toast.error('Access denied');
        router.push('/orders');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      const data = await response.json();
      
      if (data.success) {
        setOrder(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch order details');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Failed to load order details');
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get payment method display name
  const getPaymentMethodName = (method: string): string => {
    const methods: { [key: string]: string } = {
      'MOBILE_MONEY': 'Mobile Money',
      'INSTALLMENT': 'Payday Flex',
      'CARD': 'Card Payment',
    };
    return methods[method] || method;
  };

  // Get payment status color
  const getPaymentStatusColor = (status: PaymentStatus): string => {
    switch (status) {
      case 'PAID':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'PENDING':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'PARTIAL':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'FAILED':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {error || 'Order Not Found'}
            </h2>
            <p className="text-gray-600 mb-6">
              We couldn't find the order you're looking for.
            </p>
            <BackButton 
              href="/orders"
              label="Back to Orders"
              variant="default"
            />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link href="/orders">
            <Button variant="outline" className="border-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
        </motion.div>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Order #{order.orderNumber}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Placed on {formatDate(order.createdAt)}</span>
              </div>
            </div>

            <OrderStatusBadge status={order.status} size="lg" />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Tracking */}
            {order.delivery && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="overflow-hidden">
                  <div className="bg-gradient-to-r from-primary-500 to-primary-700 px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-white" />
                      <h2 className="text-white font-bold text-lg">Delivery Tracking</h2>
                    </div>
                  </div>
                  <div className="p-6">
                    <DeliveryTracker
                      currentStatus={order.delivery.deliveryStatus}
                      timeline={{
                        assigned: order.delivery.assignedAt || undefined,
                        delivered: order.delivery.deliveredAt || undefined,
                      }}
                    />
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Rider Information */}
            {order.delivery?.rider && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <RiderInfo
                  rider={{
                    id: order.delivery.id,
                    name: order.delivery.rider.name,
                    phone: order.delivery.rider.phone,
                    zone: {
                      code: order.delivery.rider.zoneId,
                      name: order.campusZone,
                    },
                  }}
                />
              </motion.div>
            )}

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="overflow-hidden">
                <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-gray-700" />
                    <h2 className="font-bold text-lg text-gray-900">
                      Order Items ({order.items.length})
                    </h2>
                  </div>
                </div>
                <div className="divide-y divide-gray-200">
                  {order.items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="relative w-24 h-24 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
                          {item.product.image ? (
                            <Image
                              src={item.product.image}
                              alt={item.product.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <Link 
                            href={`/products/${item.productId}`}
                            className="font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2"
                          >
                            {item.product.title}
                          </Link>
                          
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                              Size: {item.product.size}
                            </span>
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                              Color: {item.product.color}
                            </span>
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                              {item.product.condition}
                            </span>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <span className="text-sm text-gray-600">
                              Qty: {item.quantity}
                            </span>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">
                                {formatPrice(item.priceAtPurchase)} each
                              </p>
                              <p className="text-base font-bold text-gray-900">
                                {formatPrice(item.itemTotal)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar - Right Column (1/3) */}
          <div className="space-y-6">
            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="overflow-hidden">
                <div className="bg-primary-600 px-6 py-4">
                  <h2 className="text-white font-bold text-lg">Order Summary</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-semibold text-green-600">Free</span>
                  </div>
                  <div className="pt-4 border-t-2 border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-primary-600">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Payment Information */}
            {order.payment && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="overflow-hidden">
                  <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-gray-700" />
                      <h2 className="font-bold text-lg text-gray-900">Payment Details</h2>
                    </div>
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Method</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {getPaymentMethodName(order.payment.paymentMethod)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className={`
                        inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border
                        ${getPaymentStatusColor(order.payment.paymentStatus)}
                      `}>
                        {order.payment.paymentStatus}
                      </span>
                    </div>

                    {order.payment.installmentPlan && (
                      <>
                        <div className="pt-3 border-t border-gray-200">
                          <p className="text-xs font-semibold text-gray-700 mb-2">
                            Payday Flex Plan
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Paid Amount</span>
                              <span className="font-semibold text-green-600">
                                {formatPrice(order.payment.paidAmount || 0)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Remaining</span>
                              <span className="font-semibold text-orange-600">
                                {formatPrice(order.payment.remainingAmount || 0)}
                              </span>
                            </div>
                            {order.payment.paydayDate && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Due Date</span>
                                <span className="font-semibold text-gray-900">
                                  {new Date(order.payment.paydayDate).toLocaleDateString('en-GH', {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {order.payment.paymentStatus === 'PARTIAL' && (
                          <Link href={`/orders/${order.id}/payday-flex`} className="block">
                            <Button className="w-full bg-orange-600 hover:bg-orange-700 mt-3">
                              <DollarSign className="w-4 h-4 mr-2" />
                              Pay Remaining Amount
                            </Button>
                          </Link>
                        )}
                      </>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Delivery Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="overflow-hidden">
                <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-700" />
                    <h2 className="font-bold text-lg text-gray-900">Delivery Address</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {order.campusZone}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.deliveryAddress}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-3"
            >
              {order.delivery && order.delivery.deliveryStatus !== 'DELIVERED' && (
                <Link href={`/orders/${order.id}/track`}>
                  <Button className="w-full bg-primary-600 hover:bg-primary-700">
                    <Truck className="w-4 h-4 mr-2" />
                    Track Delivery
                  </Button>
                </Link>
              )}

              <Link href="/orders">
                <Button variant="outline" className="w-full border-2">
                  <Package className="w-4 h-4 mr-2" />
                  View All Orders
                </Button>
              </Link>
            </motion.div>

            {/* Help Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">
                    Need Help?
                  </h3>
                  <p className="text-xs text-blue-700">
                    Contact our support team for any questions about your order, delivery, or payment.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
