'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore, CartItem as CartItemType } from '@/lib/stores/cart';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Handle quantity decrease
  const handleDecrease = async () => {
    if (isUpdating || item.quantity <= 1) return;
    
    setIsUpdating(true);
    const newQuantity = item.quantity - 1;
    
    try {
      // Optimistically update UI
      updateQuantity(item.product_id, newQuantity);
      
      // API call to update cart on server
      const response = await fetch(`/api/cart/items/${item.cart_item_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      
      if (!response.ok) {
        // Revert on failure
        updateQuantity(item.product_id, item.quantity);
        toast.error('Failed to update quantity');
      }
    } catch (error) {
      updateQuantity(item.product_id, item.quantity);
      toast.error('Failed to update quantity');
    } finally {
      setTimeout(() => setIsUpdating(false), 300);
    }
  };

  // Handle quantity increase
  const handleIncrease = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    const newQuantity = item.quantity + 1;
    
    try {
      // Optimistically update UI
      updateQuantity(item.product_id, newQuantity);
      
      // API call to update cart on server
      const response = await fetch(`/api/cart/items/${item.cart_item_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      
      if (!response.ok) {
        // Revert on failure
        updateQuantity(item.product_id, item.quantity);
        toast.error('Failed to update quantity');
      }
    } catch (error) {
      updateQuantity(item.product_id, item.quantity);
      toast.error('Failed to update quantity');
    } finally {
      setTimeout(() => setIsUpdating(false), 300);
    }
  };

  // Handle product removal
  const handleRemove = async () => {
    if (isRemoving) return;
    
    setIsRemoving(true);
    
    try {
      // API call to remove from cart
      const response = await fetch(`/api/cart/items/${item.cart_item_id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Delay for exit animation
        setTimeout(() => {
          removeItem(item.product_id);
          toast.success('Item removed from cart');
        }, 300);
      } else {
        setIsRemoving(false);
        toast.error('Failed to remove item');
      }
    } catch (error) {
      setIsRemoving(false);
      toast.error('Failed to remove item');
    }
  };

  // Calculate item total
  const itemTotal = item.price * item.quantity;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
        transition={{ duration: 0.3 }}
        className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 ${
          isRemoving ? 'opacity-50' : 'opacity-100'
        }`}
      >
        <div className="p-4">
          <div className="flex gap-4">
            {/* Product Image */}
            <Link 
              href={`/products/${item.product_id}`}
              className="relative shrink-0 group"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 relative rounded-md overflow-hidden bg-gray-100">
                <Image
                  src={item.image_url}
                  alt={item.product_name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 96px, 112px"
                />
              </div>
              
              {/* Condition Badge */}
              {item.condition && (
                <div className="absolute top-0 left-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs px-2 py-1 rounded-tl-md rounded-br-md font-semibold shadow-md">
                  {item.condition.toUpperCase()}
                </div>
              )}
            </Link>

            {/* Product Details */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <Link 
                    href={`/products/${item.product_id}`}
                    className="group"
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
                      {item.product_name}
                    </h3>
                  </Link>
                  
                  {/* Condition Label */}
                  <p className="text-sm text-gray-500 mt-1">
                    Condition: <span className="font-medium text-gray-700">{item.condition}</span>
                  </p>
                </div>

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemove}
                  disabled={isRemoving}
                  className="shrink-0 h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Price and Quantity Controls */}
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mt-3">
                {/* Price */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <p className="text-lg sm:text-xl font-bold text-primary-600">
                      {formatPrice(item.price)}
                    </p>
                    <span className="text-xs text-gray-500">per item</span>
                  </div>
                  
                  {/* Item Total */}
                  {item.quantity > 1 && (
                    <p className="text-sm text-gray-600">
                      Total: <span className="font-semibold text-gray-900">{formatPrice(itemTotal)}</span>
                    </p>
                  )}
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 hidden sm:inline">Quantity:</span>
                  <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleDecrease}
                      disabled={isUpdating || item.quantity <= 1}
                      className="h-9 w-9 rounded-none hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    
                    <div className="w-12 h-9 flex items-center justify-center border-x-2 border-gray-300 bg-gray-50">
                      <span className={`text-sm font-bold ${isUpdating ? 'opacity-50' : ''}`}>
                        {item.quantity}
                      </span>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleIncrease}
                      disabled={isUpdating}
                      className="h-9 w-9 rounded-none hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* In Stock Notice */}
              <div className="flex items-center gap-1 mt-3 text-xs text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium">In Stock</span>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-start gap-2 text-xs text-gray-600">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-blue-600" />
              <p>
                <span className="font-medium text-gray-900">Campus Delivery:</span> Delivered within 24-48 hours to your dorm room
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
