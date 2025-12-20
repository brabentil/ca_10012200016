'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Truck, Receipt, AlertCircle, Package } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useCartStore } from '@/lib/stores/cart';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';

interface OrderSummaryProps {
  deliveryFee?: number;
  showItems?: boolean;
}

export default function OrderSummary({ 
  deliveryFee = 0,
  showItems = true 
}: OrderSummaryProps) {
  const { items, totalAmount, itemCount } = useCartStore();

  // Calculate totals
  const subtotal = totalAmount;
  const delivery = deliveryFee;
  const orderTotal = subtotal + delivery;

  // Check if delivery is free
  const isFreeDelivery = delivery === 0;

  return (
    <div className="space-y-4">
      {/* Order Summary Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2"
      >
        <Receipt className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-bold text-gray-900">Order Summary</h3>
      </motion.div>

      {/* Free Delivery Notice */}
      {isFreeDelivery && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex gap-3 bg-green-50 p-3 rounded-lg border-2 border-green-200"
        >
          <div className="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center mt-0.5">
            <Truck className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-900">
              Your order qualifies for FREE Campus Delivery!
            </p>
            <p className="text-xs text-green-700 mt-0.5">
              Delivered within 24-48 hours on campus
            </p>
          </div>
        </motion.div>
      )}

      {/* Items List */}
      {showItems && items.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4 bg-gray-50 border-2 border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-gray-600" />
              <h4 className="text-sm font-bold text-gray-900">
                Items in your order ({itemCount})
              </h4>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {items.map((item, index) => (
                <motion.div
                  key={item.cart_item_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3 pb-3 border-b border-gray-200 last:border-0 last:pb-0"
                >
                  {/* Product Image */}
                  <div className="relative w-16 h-16 flex-shrink-0 bg-white rounded-md border border-gray-200 overflow-hidden">
                    <Image
                      src={item.image_url || '/placeholder-image.jpg'}
                      alt={item.product_name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-semibold text-gray-900 line-clamp-2">
                      {item.product_name}
                    </h5>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-600">
                        Condition: {item.condition}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-600">
                        Qty: {item.quantity}
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-gray-500">
                        {formatPrice(item.price)} each
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Price Breakdown */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-5 border-2 border-gray-200">
          <div className="space-y-3">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'}):
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {formatPrice(subtotal)}
              </p>
            </div>

            {/* Delivery Fee */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Truck className="w-4 h-4 text-gray-600" />
                <p className="text-sm text-gray-700">Delivery Fee:</p>
              </div>
              <p className="text-sm font-semibold">
                {isFreeDelivery ? (
                  <span className="text-green-600 font-bold">FREE</span>
                ) : (
                  <span className="text-gray-900">{formatPrice(delivery)}</span>
                )}
              </p>
            </div>

            {/* Divider */}
            <div className="border-t-2 border-gray-300 pt-3">
              <div className="flex items-center justify-between">
                <p className="text-base font-bold text-gray-900">Order Total:</p>
                <p className="text-xl font-bold text-primary-600">
                  {formatPrice(orderTotal)}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Additional Information */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        {/* Security Notice */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <svg 
            className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" 
              clipRule="evenodd" 
            />
          </svg>
          <div className="flex-1">
            <p className="text-xs font-semibold text-blue-900">
              Secure Checkout
            </p>
            <p className="text-xs text-blue-700 mt-0.5">
              Your payment information is encrypted and secure
            </p>
          </div>
        </div>

        {/* Delivery Information */}
        <div className="flex items-start gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-900">
              Delivery Information
            </p>
            <ul className="text-xs text-gray-600 mt-1 space-y-0.5 list-disc list-inside">
              <li>All deliveries are made within campus zones</li>
              <li>You&apos;ll receive tracking updates via SMS</li>
              <li>Estimated delivery: 24-48 hours</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Payment Methods Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="p-3 bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-lg"
      >
        <p className="text-xs font-semibold text-gray-900 mb-2">
          Payment methods accepted:
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="bg-white px-2 py-1 rounded border border-gray-200 text-xs font-semibold text-gray-700">
            Mobile Money
          </span>
          <span className="bg-white px-2 py-1 rounded border border-gray-200 text-xs font-semibold text-gray-700">
            Payday Flex
          </span>
          <span className="bg-gradient-to-r from-orange-400 to-orange-600 text-white px-2 py-1 rounded text-xs font-bold">
            0% Interest
          </span>
        </div>
      </motion.div>
    </div>
  );
}
