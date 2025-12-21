'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Trash2, ShoppingCart, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/ui/back-button';
import WishlistItem, { WishlistItemType } from '@/components/wishlist/WishlistItem';
import EmptyState from '@/components/ui/EmptyState';
import { toast } from 'sonner';

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);

  // Fetch wishlist items
  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/wishlist', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWishlistItems(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle remove item from wishlist
  const handleRemoveItem = (productId: string) => {
    setWishlistItems(prev => prev.filter(item => item.productId !== productId));
  };

  // Handle clear wishlist
  const handleClearWishlist = async () => {
    if (isClearing || wishlistItems.length === 0) return;

    const confirmed = window.confirm('Are you sure you want to remove all items from your wishlist?');
    if (!confirmed) return;

    setIsClearing(true);

    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        toast.error('Please login to continue');
        setIsClearing(false);
        return;
      }

      // Remove all items one by one
      const deletePromises = wishlistItems.map(item =>
        fetch(`/api/wishlist/${item.productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
      );

      await Promise.all(deletePromises);

      setWishlistItems([]);
      toast.success('Wishlist cleared successfully');
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast.error('Failed to clear wishlist');
    } finally {
      setIsClearing(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading your wishlist...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no items
  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EmptyState type="wishlist" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-red-500 to-pink-600 p-3 rounded-lg shadow-lg">
                <Heart className="h-6 w-6 text-white fill-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Wishlist</h1>
                <p className="text-sm text-gray-600 mt-0.5">
                  {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>

            {/* Clear Wishlist Button - Desktop */}
            <Button
              variant="outline"
              onClick={handleClearWishlist}
              disabled={isClearing}
              className="hidden sm:flex items-center gap-2 border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
            >
              <Trash2 className="h-4 w-4" />
              {isClearing ? 'Clearing...' : 'Clear Wishlist'}
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

        {/* Wishlist Items Grid */}
        <div className="space-y-4 mb-6">
          {wishlistItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <WishlistItem 
                item={item} 
                onRemove={handleRemoveItem}
              />
            </motion.div>
          ))}
        </div>

        {/* Clear Wishlist Button - Mobile */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="sm:hidden"
        >
          <Button
            variant="outline"
            onClick={handleClearWishlist}
            disabled={isClearing}
            className="w-full border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isClearing ? 'Clearing...' : 'Clear Wishlist'}
          </Button>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Add to Cart Info */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-500 rounded-full p-2 shrink-0">
                <ShoppingCart className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 text-sm mb-1">
                  Quick Add to Cart
                </h3>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Click "Add to Cart" on any item to move it to your shopping cart. 
                  Items will be automatically removed from your wishlist.
                </p>
              </div>
            </div>
          </div>

          {/* Save for Later */}
          <div className="bg-gradient-to-br from-pink-50 to-red-100 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="bg-red-500 rounded-full p-2 shrink-0">
                <Heart className="h-4 w-4 text-white fill-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 text-sm mb-1">
                  Save Your Favorites
                </h3>
                <p className="text-xs text-red-700 leading-relaxed">
                  Your wishlist is saved across devices. Browse and shop at your own pace 
                  and buy when you're ready.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link href="/products">
            <Button 
              variant="outline" 
              className="w-full sm:w-auto border-2 border-primary-300 text-primary-700 hover:bg-primary-50 font-semibold px-8"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
          
          <Link href="/cart">
            <Button 
              className="w-full sm:w-auto bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold px-8 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              View Cart
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
