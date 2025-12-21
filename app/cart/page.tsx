'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Trash2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/ui/back-button';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import EmptyState from '@/components/ui/EmptyState';
import { useCartStore } from '@/lib/stores/cart';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';

export default function CartPage() {
  const { items, itemCount, clearCart, setCart } = useCartStore();
  const [isClearing, setIsClearing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch cart from API on mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await apiClient.get('/cart');
        if (response.data.success) {
          setCart(response.data.data.items || []);
        }
      } catch (error) {
        console.error('Failed to fetch cart:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCart();
  }, [setCart]);

  // Handle clear cart
  const handleClearCart = async () => {
    if (isClearing) return;

    const confirmed = window.confirm('Are you sure you want to remove all items from your cart?');
    if (!confirmed) return;

    setIsClearing(true);

    try {
      // Clear local cart store (cart only exists in localStorage)
      clearCart();
      toast.success('Cart cleared successfully');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    } finally {
      setIsClearing(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  // Show empty state if no items
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EmptyState type="cart" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <BackButton href="/products" label="Continue Shopping" className="mb-4" />
        
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary-600 p-3 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Shopping Cart</h1>
                <p className="text-sm text-gray-600 mt-0.5">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>

            {/* Clear Cart Button - Desktop */}
            <Button
              variant="outline"
              onClick={handleClearCart}
              disabled={isClearing}
              className="hidden sm:flex items-center gap-2 border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
            >
              <Trash2 className="h-4 w-4" />
              Clear Cart
            </Button>
          </div>

          {/* Continue Shopping Link */}
          <BackButton 
            href="/products"
            label="Continue Shopping"
            variant="link"
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {/* Cart Items List */}
              {items.map((item, index) => (
                <motion.div
                  key={item.cart_item_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <CartItem item={item} />
                </motion.div>
              ))}
            </div>

            {/* Clear Cart Button - Mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 sm:hidden"
            >
              <Button
                variant="outline"
                onClick={handleClearCart}
                disabled={isClearing}
                className="w-full border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart
              </Button>
            </motion.div>

            {/* Delivery Information */}


            {/* Security Notice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <div className="bg-green-500 rounded-full p-1 shrink-0">
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 text-sm mb-1">
                    Safe & Secure Shopping
                  </h3>
                  <p className="text-xs text-green-700 leading-relaxed">
                    Your payment information is encrypted and protected. 
                    All transactions are processed securely through Paystack.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Cart Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="sticky top-4"
            >
              <CartSummary showCheckoutButton={true} />
            </motion.div>
          </div>
        </div>

        {/* Bottom Actions - Mobile */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 sm:hidden"
        >
          <BackButton 
            href="/products"
            label="Continue Shopping"
            variant="outline"
            className="w-full border-2 border-gray-300"
          />
        </motion.div>
      </div>
    </div>
  );
}
