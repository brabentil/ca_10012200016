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
  deliveryFee
}: CartSummaryProps) {
  const router = useRouter();
  const { items, itemCount, totalAmount } = useCartStore();

  // Use provided delivery fee or none
  const calculatedDeliveryFee = deliveryFee || 0;
  
  // Calculate total
  const orderTotal = totalAmount + calculatedDeliveryFee;

  const handleCheckout = () => {
    if (items.length === 0) return;
    router.push('/checkout');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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

          {/* Delivery Fee - only show if provided */}
          {deliveryFee !== undefined && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-gray-400" />
                <p className="text-sm text-gray-600">Delivery:</p>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {formatPrice(calculatedDeliveryFee)}
              </p>
            </div>
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
