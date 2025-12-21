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


    </div>
  );
}
