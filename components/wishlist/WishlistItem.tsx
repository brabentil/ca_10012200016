'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Trash2, Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/stores/cart';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

export interface WishlistItemType {
  id: string;
  productId: string;
  product: {
    id: string;
    title: string;
    price: number;
    condition: string;
    images: Array<{ imageUrl: string }>;
    category: string;
  };
  createdAt: string;
}

interface WishlistItemProps {
  item: WishlistItemType;
  onRemove?: (productId: string) => void;
}

export default function WishlistItem({ item, onRemove }: WishlistItemProps) {
  const { addItem, items } = useCartStore();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Check if item is already in cart
  const isInCart = items.some(cartItem => cartItem.product_id === item.productId);

  // Get product image
  const productImage = item.product.images?.[0]?.imageUrl || '/images/placeholder-product.png';

  // Handle add to cart
  const handleAddToCart = async () => {
    if (isAddingToCart || isInCart) return;

    setIsAddingToCart(true);

    try {
      // Add to cart via API
      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: item.productId,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }

      const data = await response.json();

      // Update local cart store
      addItem({
        cart_item_id: data.data.id,
        product_id: item.productId,
        quantity: 1,
        product_name: item.product.title,
        price: item.product.price,
        image_url: productImage,
        condition: item.product.condition,
      });

      // Remove from wishlist after successful add to cart
      await handleRemove(true);

      toast.success('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Handle remove from wishlist
  const handleRemove = async (silent = false) => {
    if (isRemoving) return;

    setIsRemoving(true);

    try {
      const response = await fetch(`/api/wishlist/${item.productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove from wishlist');
      }

      // Call parent callback for UI update
      if (onRemove) {
        setTimeout(() => {
          onRemove(item.productId);
        }, 300);
      }

      if (!silent) {
        toast.success('Removed from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      setIsRemoving(false);
      toast.error('Failed to remove from wishlist');
    }
  };

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
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Product Image */}
            <Link 
              href={`/products/${item.productId}`}
              className="relative shrink-0 group mx-auto sm:mx-0"
            >
              <div className="w-32 h-32 sm:w-36 sm:h-36 relative rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                <Image
                  src={productImage}
                  alt={item.product.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 128px, 144px"
                />
              </div>
              
              {/* Condition Badge */}
              {item.product.condition && (
                <div className="absolute top-0 left-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs px-2 py-1 rounded-tl-md rounded-br-md font-semibold shadow-md">
                  {item.product.condition.toUpperCase()}
                </div>
              )}

              {/* Wishlist Heart Icon */}
              <div className="absolute top-0 right-0 bg-red-500 text-white p-1.5 rounded-tr-md rounded-bl-md shadow-md">
                <Heart className="h-3.5 w-3.5 fill-white" />
              </div>
            </Link>

            {/* Product Details */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col h-full">
                {/* Title and Remove Button */}
                <div className="flex justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <Link 
                      href={`/products/${item.productId}`}
                      className="group"
                    >
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
                        {item.product.title}
                      </h3>
                    </Link>
                    
                    {/* Category */}
                    <p className="text-sm text-gray-500 mt-1">
                      {item.product.category}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove()}
                    disabled={isRemoving}
                    className="shrink-0 h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Condition Label */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-gray-500">Condition:</span>
                  <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                    {item.product.condition}
                  </span>
                </div>

                {/* Price and Actions */}
                <div className="mt-auto flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                  {/* Price */}
                  <div>
                    <p className="text-2xl font-bold text-primary-600">
                      {formatPrice(item.product.price)}
                    </p>
                  </div>

                  {/* Add to Cart Button */}
                  <Button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || isInCart}
                    className={`w-full sm:w-auto ${
                      isInCart
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800'
                    } text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300`}
                  >
                    {isAddingToCart ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : isInCart ? (
                      <>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        In Cart
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Added Date */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Added on {new Date(item.createdAt).toLocaleDateString('en-GH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
