'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Filter, 
  Search, 
  ArrowRight,
  ShoppingBag,
  Calendar,
  MapPin,
  DollarSign,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import OrderStatusBadge from '@/components/checkout/OrderStatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

type OrderStatus = 'pending' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled';
type PaymentStatus = 'PENDING' | 'PAID' | 'PARTIAL' | 'FAILED';

interface OrderItem {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  deliveryAddress: string;
  campusZone: string;
  itemCount: number;
  paymentStatus: PaymentStatus;
  deliveryStatus: string | null;
  createdAt: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch orders
  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);

    try {
      // Build query params
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/orders?${params.toString()}`, {
        credentials: 'include',
      });

      if (response.status === 401) {
        toast.error('Session expired. Please login again');
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data);
        setTotalPages(data.pagination?.pages || 1);
      } else {
        throw new Error(data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Filter orders by search query
  const filteredOrders = orders.filter(order => 
    order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Status filter options
  const statusFilters = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'out_for_delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary-600 p-3 rounded-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="text-sm text-gray-600 mt-0.5">
                Track and manage your orders
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 space-y-4"
        >
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by order number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="w-5 h-5 text-gray-600 flex-shrink-0" />
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => {
                  setStatusFilter(filter.value);
                  setPage(1);
                }}
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all
                  ${statusFilter === filter.value
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }
                `}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading your orders...</p>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          /* Empty State */
          <EmptyState
            type="orders"
            title={searchQuery ? 'No orders found' : undefined}
            description={searchQuery ? `No orders match "${searchQuery}"` : undefined}
          />
        ) : (
          /* Orders List */
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  layout
                >
                  <Card className="hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                    <div className="p-6">
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                            <ShoppingBag className="w-6 h-6 text-primary-600" />
                          </div>
                          <div>
                            <Link 
                              href={`/orders/${order.id}`}
                              className="text-lg font-bold text-gray-900 hover:text-primary-600 transition-colors"
                            >
                              #{order.orderNumber}
                            </Link>
                            <div className="flex items-center gap-2 mt-1">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <p className="text-sm text-gray-600">
                                {formatDate(order.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <OrderStatusBadge 
                          status={order.status} 
                          size="md"
                          animated={false}
                        />
                      </div>

                      {/* Order Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 pt-4 border-t border-gray-200">
                        {/* Total Amount */}
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Total</p>
                            <p className="text-base font-bold text-gray-900">
                              {formatPrice(order.totalAmount)}
                            </p>
                          </div>
                        </div>

                        {/* Item Count */}
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Package className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Items</p>
                            <p className="text-base font-bold text-gray-900">
                              {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                            </p>
                          </div>
                        </div>

                        {/* Delivery Zone */}
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Zone</p>
                            <p className="text-base font-bold text-gray-900">
                              {order.campusZone}
                            </p>
                          </div>
                        </div>

                        {/* Payment Status */}
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Payment</p>
                            <span className={`
                              inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border
                              ${getPaymentStatusColor(order.paymentStatus)}
                            `}>
                              {order.paymentStatus}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                        <Link href={`/orders/${order.id}`} className="flex-1">
                          <Button className="w-full bg-primary-600 hover:bg-primary-700">
                            <Package className="w-4 h-4 mr-2" />
                            View Details
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>

                        {order.deliveryStatus && order.deliveryStatus !== 'DELIVERED' && (
                          <Link href={`/orders/${order.id}/track`} className="flex-1">
                            <Button variant="outline" className="w-full border-2">
                              <MapPin className="w-4 h-4 mr-2" />
                              Track Delivery
                            </Button>
                          </Link>
                        )}

                        {order.paymentStatus === 'PARTIAL' && (
                          <Link href={`/orders/${order.id}/payday-flex`} className="flex-1">
                            <Button variant="outline" className="w-full border-2 border-orange-300 text-orange-600 hover:bg-orange-50">
                              <DollarSign className="w-4 h-4 mr-2" />
                              Pay Remaining
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center gap-2 mt-8"
              >
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border-2"
                >
                  Previous
                </Button>
                
                <div className="flex items-center gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPage(i + 1)}
                      className={`
                        w-10 h-10 rounded-lg font-semibold transition-all
                        ${page === i + 1
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                        }
                      `}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="border-2"
                >
                  Next
                </Button>
              </motion.div>
            )}
          </div>
        )}

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <Package className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                Need help with your order?
              </h3>
              <p className="text-xs text-blue-700">
                Contact our support team for assistance with tracking, delivery, or payment issues.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
