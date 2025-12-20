'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingBag, Truck, Shield, ArrowRight, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/stores/cart';
import { formatPrice } from '@/lib/utils';

interface CartSummaryProps {
  showCheckoutButton?: boolean;
  deliveryFee?: number;
}

export default function CartSummary({ 
  showCheckoutButton = true,
  deliveryFee = 0 
}: CartSummaryProps) {
  const router = useRouter();
  const { items, itemCount, totalAmount } = useCartStore();

  // Calculate delivery based on cart total or use provided delivery fee
  const calculatedDeliveryFee = deliveryFee !== undefined ? deliveryFee : (totalAmount >= 100 ? 0 : 5);
  
  // Free delivery threshold
  const freeDeliveryThreshold = 100;
  const amountToFreeDelivery = freeDeliveryThreshold - totalAmount;
  const isEligibleForFreeDelivery = totalAmount >= freeDeliveryThreshold;

  // Calculate total
  const orderTotal = totalAmount + calculatedDeliveryFee;

  const handleCheckout = () => {
    if (items.length === 0) return;
    router.push('/checkout');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Free Delivery Notice */}
      {!isEligibleForFreeDelivery && calculatedDeliveryFee > 0 && totalAmount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 p-3"
        >
          <div className="flex items-start gap-2">
            <Truck className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-xs text-blue-800">
              <p className="font-semibold">Add {formatPrice(amountToFreeDelivery)} more for FREE delivery!</p>
              <p className="text-blue-600 mt-0.5">Free campus delivery on orders over {formatPrice(freeDeliveryThreshold)}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Free Delivery Banner */}
      {(isEligibleForFreeDelivery || calculatedDeliveryFee === 0) && totalAmount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200 p-3"
        >
          <div className="flex items-center gap-2">
            <div className="bg-green-500 rounded-full p-1.5">
              <Truck className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-800">
                🎉 You qualify for FREE Delivery!
              </p>
              <p className="text-xs text-green-600 mt-0.5">
                Your order will be delivered to your dorm within 24-48 hours
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="p-6">
        {/* Order Summary Header */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
          <ShoppingBag className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
          {/* Items Subtotal */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-600">Items ({itemCount}):</p>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              {formatPrice(totalAmount)}
            </p>
          </div>

          {/* Delivery Fee */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-gray-400" />
              <p className="text-sm text-gray-600">Delivery:</p>
            </div>
            <div className="text-right">
              {calculatedDeliveryFee === 0 ? (
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-green-600">FREE</span>
                  <Tag className="h-3.5 w-3.5 text-green-600" />
                </div>
              ) : (
                <p className="text-sm font-semibold text-gray-900">
                  {formatPrice(calculatedDeliveryFee)}
                </p>
              )}
            </div>
          </div>

          {/* Savings indicator */}
          {calculatedDeliveryFee === 0 && totalAmount > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1 text-xs text-green-600 ml-6"
            >
              <span>You saved {formatPrice(5)} on delivery!</span>
            </motion.div>
          )}
        </div>

        {/* Order Total */}
        <div className="flex items-center justify-between mb-6 py-3 bg-gray-50 px-4 rounded-lg border border-gray-200">
          <p className="text-base font-bold text-gray-900">Order Total:</p>
          <p className="text-2xl font-bold text-primary-600">
            {formatPrice(orderTotal)}
          </p>
        </div>

        {/* Checkout Button */}
        {showCheckoutButton && (
          <Button
            onClick={handleCheckout}
            disabled={items.length === 0}
            className="w-full h-12 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        )}

        {/* Security & Info */}
        <div className="mt-6 space-y-3">
          {/* Security Notice */}
          <div className="flex items-start gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
            <Shield className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900">Secure Checkout</p>
              <p className="mt-0.5">Your payment information is encrypted and secure</p>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="flex items-start gap-2 text-xs text-gray-600 bg-blue-50 p-3 rounded-lg">
            <Truck className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900">Campus Delivery</p>
              <p className="mt-0.5">Fast delivery to your dorm room within 24-48 hours</p>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="border-t border-gray-200 pt-3">
            <p className="text-xs font-semibold text-gray-700 mb-2">We Accept:</p>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="bg-white border border-gray-200 rounded px-2 py-1 text-xs font-semibold text-gray-700 shadow-sm">
                Mobile Money
              </div>
              <div className="bg-white border border-gray-200 rounded px-2 py-1 text-xs font-semibold text-gray-700 shadow-sm">
                Payday Flex
              </div>
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded px-2 py-1 text-xs font-semibold shadow-sm">
                0% Interest
              </div>
            </div>
          </div>
        </div>

        {/* Empty Cart Message */}
        {items.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center text-sm text-gray-500"
          >
            <p>Your cart is empty</p>
            <Button
              variant="outline"
              onClick={() => router.push('/products')}
              className="mt-3 text-sm"
            >
              Continue Shopping
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
