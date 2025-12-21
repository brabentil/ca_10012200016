'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin,
  Clock,
  Package,
  Loader2,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/ui/back-button';
import { Card } from '@/components/ui/card';
import OrderStatusBadge from '@/components/checkout/OrderStatusBadge';
import DeliveryTracker from '@/components/checkout/DeliveryTracker';
import RiderInfo from '@/components/checkout/RiderInfo';
import DeliveryMap from '@/components/checkout/DeliveryMap';
import ETACountdown from '@/components/checkout/ETACountdown';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

type DeliveryStatus = 'PENDING' | 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED';
type OrderStatus = 'pending' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled';

interface DeliveryTracking {
  id: string;
  orderId: string;
  orderNumber: string;
  status: DeliveryStatus;
  deliveryAddress: string;
  rider: {
    id: string;
    name: string;
    phone: string;
    zone: {
      code: string;
      name: string;
    };
  } | null;
  timeline: {
    assigned: string | null;
    delivered: string | null;
  };
  estimatedArrival: string | null;
  orderTotal: number;
  orderStatus: OrderStatus;
}

export default function TrackDeliveryPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [tracking, setTracking] = useState<DeliveryTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isPolling, setIsPolling] = useState(true);

  // Refs for tracking previous state
  const prevStatusRef = useRef<DeliveryStatus | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch delivery tracking data
  const fetchTracking = async (showLoading = false) => {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetch(`/api/deliveries/track/${orderId}`, {
        credentials: 'include',
      });

      if (response.status === 401) {
        toast.error('Session expired. Please login again');
        router.push('/login');
        return;
      }

      if (response.status === 404) {
        setError('Delivery tracking not available for this order');
        setIsPolling(false);
        return;
      }

      if (response.status === 403) {
        toast.error('Access denied');
        router.push('/orders');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch tracking information');
      }

      const data = await response.json();
      
      if (data.success) {
        const newTracking = data.data;
        
        // Check if status changed and show toast notification
        if (prevStatusRef.current && prevStatusRef.current !== newTracking.status) {
          showStatusChangeNotification(prevStatusRef.current, newTracking.status);
        }
        
        prevStatusRef.current = newTracking.status;
        setTracking(newTracking);
        setLastUpdated(new Date());

        // Stop polling if delivered or failed
        if (newTracking.status === 'DELIVERED' || newTracking.status === 'FAILED') {
          setIsPolling(false);
        }
      } else {
        throw new Error(data.message || 'Failed to fetch tracking information');
      }
    } catch (error) {
      console.error('Error fetching tracking:', error);
      if (showLoading) {
        setError('Failed to load tracking information');
        toast.error('Failed to load tracking information');
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  // Show toast notification when status changes
  const showStatusChangeNotification = (oldStatus: DeliveryStatus, newStatus: DeliveryStatus) => {
    const statusMessages: { [key in DeliveryStatus]: { message: string; type: 'success' | 'info' | 'error' } } = {
      PENDING: { message: 'Delivery is being prepared', type: 'info' },
      ASSIGNED: { message: 'Rider has been assigned to your order! 🎉', type: 'success' },
      PICKED_UP: { message: 'Your order has been picked up! 📦', type: 'success' },
      IN_TRANSIT: { message: 'Your order is on the way! 🚚', type: 'success' },
      DELIVERED: { message: 'Your order has been delivered! ✨', type: 'success' },
      FAILED: { message: 'Delivery attempt failed. Contact support.', type: 'error' },
    };

    const notification = statusMessages[newStatus];
    if (notification) {
      if (notification.type === 'error') {
        toast.error(notification.message);
      } else if (notification.type === 'success') {
        toast.success(notification.message);
      } else {
        toast.info(notification.message);
      }
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchTracking(true);
  }, [orderId]);

  // Set up polling
  useEffect(() => {
    if (!isPolling) {
      // Clear any existing interval
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    // Poll every 30 seconds
    pollingIntervalRef.current = setInterval(() => {
      fetchTracking(false);
    }, 30000);

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [isPolling, orderId]);

  // Manual refresh
  const handleRefresh = () => {
    fetchTracking(false);
    toast.success('Tracking information refreshed');
  };

  // Format last updated time
  const formatLastUpdated = (): string => {
    if (!lastUpdated) return '';
    
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
    
    if (diffSeconds < 60) {
      return 'Just now';
    } else if (diffSeconds < 3600) {
      const minutes = Math.floor(diffSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else {
      return lastUpdated.toLocaleTimeString('en-GH', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  // Get status-based message
  const getStatusMessage = (): string => {
    if (!tracking) return '';

    switch (tracking.status) {
      case 'PENDING':
        return 'Your order is being prepared for delivery';
      case 'ASSIGNED':
        return 'A rider has been assigned to your delivery';
      case 'PICKED_UP':
        return 'Your order is with the rider';
      case 'IN_TRANSIT':
        return 'Your order is on its way to you';
      case 'DELIVERED':
        return 'Your order has been successfully delivered';
      case 'FAILED':
        return 'Delivery attempt was unsuccessful';
      default:
        return 'Tracking your delivery';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading tracking information...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !tracking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {error || 'Tracking Not Available'}
            </h2>
            <p className="text-gray-600 mb-6">
              We couldn't find tracking information for this order.
            </p>
            <Link href={`/orders/${orderId}`}>
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Order Details
              </Button>
            </Link>
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
          <Link href={`/orders/${orderId}`}>
            <Button variant="outline" className="border-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Order Details
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
                Track Delivery
              </h1>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-600">Order #{tracking.orderNumber}</span>
                <span className="text-gray-400">•</span>
                <OrderStatusBadge status={tracking.orderStatus} size="sm" />
              </div>
            </div>

            <Button
              onClick={handleRefresh}
              variant="outline"
              className="border-2"
              disabled={!isPolling}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${!isPolling ? '' : 'animate-pulse'}`} />
              Refresh
            </Button>
          </div>

          {/* Status Message */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 bg-gradient-to-r from-primary-500 to-primary-700 rounded-lg p-6 text-white"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                {tracking.status === 'DELIVERED' ? (
                  <CheckCircle className="w-6 h-6" />
                ) : tracking.status === 'FAILED' ? (
                  <AlertCircle className="w-6 h-6" />
                ) : (
                  <Package className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-1">{getStatusMessage()}</h2>
                <p className="text-primary-100 text-sm">
                  {tracking.deliveryAddress}
                </p>
                {lastUpdated && (
                  <p className="text-primary-200 text-xs mt-2">
                    Last updated: {formatLastUpdated()}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* ETA Countdown */}
            {tracking.estimatedArrival && tracking.status !== 'DELIVERED' && tracking.status !== 'FAILED' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <ETACountdown
                  estimatedArrival={tracking.estimatedArrival}
                  status={tracking.status}
                />
              </motion.div>
            )}

            {/* Delivery Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="overflow-hidden">
                <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-700" />
                      <h2 className="font-bold text-lg text-gray-900">Delivery Progress</h2>
                    </div>
                    {isPolling && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs text-gray-600">Live tracking</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  <DeliveryTracker
                    currentStatus={tracking.status}
                    timeline={{
                      assigned: tracking.timeline.assigned || undefined,
                      delivered: tracking.timeline.delivered || undefined,
                    }}
                  />
                </div>
              </Card>
            </motion.div>

            {/* Campus Map */}
            {tracking.rider && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="overflow-hidden">
                  <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-gray-700" />
                      <h2 className="font-bold text-lg text-gray-900">Delivery Zone</h2>
                    </div>
                  </div>
                  <div className="p-6">
                    <DeliveryMap currentZone={tracking.rider.zone} />
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Delivery Status Messages */}
            <AnimatePresence>
              {tracking.status === 'DELIVERED' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-green-50 border-2 border-green-200 rounded-lg p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-green-900 mb-1">
                        Delivery Complete! 🎉
                      </h3>
                      <p className="text-sm text-green-700">
                        Your order was successfully delivered on{' '}
                        {tracking.timeline.delivered && 
                          new Date(tracking.timeline.delivered).toLocaleString('en-GH', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        }
                      </p>
                      <p className="text-sm text-green-600 mt-2">
                        We hope you love your items! Don't forget to leave a review.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {tracking.status === 'FAILED' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-red-50 border-2 border-red-200 rounded-lg p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-red-900 mb-1">
                        Delivery Failed
                      </h3>
                      <p className="text-sm text-red-700 mb-3">
                        We couldn't complete the delivery. This might be due to address issues or unavailability.
                      </p>
                      <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
                        Contact Support
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar - Right Column (1/3) */}
          <div className="space-y-6">
            {/* Rider Information */}
            {tracking.rider ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <RiderInfo
                  rider={{
                    id: tracking.rider.id,
                    name: tracking.rider.name,
                    phone: tracking.rider.phone,
                    zone: tracking.rider.zone,
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="p-6">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Awaiting Rider Assignment
                    </h3>
                    <p className="text-sm text-gray-600">
                      A rider will be assigned to your order soon
                    </p>
                  </div>
                </Card>
              </motion.div>
            )}

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
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Order Number</p>
                    <p className="font-semibold text-gray-900">#{tracking.orderNumber}</p>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Order Total</p>
                    <p className="text-xl font-bold text-primary-600">
                      {formatPrice(tracking.orderTotal)}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Delivery Address</p>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-900">{tracking.deliveryAddress}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Help Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">
                    Tracking Updates
                  </h3>
                  <p className="text-xs text-blue-700 mb-2">
                    This page automatically refreshes every 30 seconds. You'll receive notifications when your delivery status changes.
                  </p>
                  {tracking.rider && (
                    <p className="text-xs text-blue-600">
                      <strong>Tip:</strong> The rider will call when they arrive at your location.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
