'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Eye, Star } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/lib/stores/cart';
import { toast } from 'sonner';

interface Product {
  product_id: number;
  name: string;
  price: number;
  condition: 'Like New' | 'Good' | 'Fair' | 'Worn';
  images: string[];
  category: string;
  seller_id?: number;
  average_rating?: number;
  total_reviews?: number;
  is_available?: boolean;
}

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { addItem } = useCartStore();

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Add to cart via Zustand store
    addItem({
      cart_item_id: Date.now(), // Temporary ID until backend assigns one
      product_id: product.product_id,
      quantity: 1,
      product_name: product.name,
      price: product.price,
      image_url: product.images[0] || '',
      condition: product.condition,
    });
    
    toast.success('Added to cart');
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Like New':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Good':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Fair':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Worn':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const productImage = !imageError && product.images && product.images.length > 0
    ? product.images[0]
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group"
    >
      <Link href={`/products/${product.product_id}`}>
        <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-primary-300 hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            {productImage ? (
              <img
                src={productImage}
                alt={product.name}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <ShoppingCart className="w-16 h-16 text-gray-400" />
              </div>
            )}

            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300">
              <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                {/* Wishlist Button */}
                <button
                  onClick={handleWishlistToggle}
                  className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                    isWishlisted
                      ? 'bg-red-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-red-50'
                  }`}
                  aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart
                    className={`w-5 h-5 transition-all ${
                      isWishlisted ? 'fill-white' : ''
                    }`}
                  />
                </button>

                {/* Quick View Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Quick view modal would open here
                    toast.info('Quick view coming soon');
                  }}
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-50 transition-colors"
                  aria-label="Quick view"
                >
                  <Eye className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              {/* Condition Badge */}
              <div className="absolute top-3 left-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border-2 backdrop-blur-sm ${getConditionColor(
                    product.condition
                  )}`}
                >
                  {product.condition}
                </span>
              </div>

              {/* Quick Add to Cart */}
              <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                <button
                  onClick={handleAddToCart}
                  className="w-full h-11 bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white font-semibold rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all duration-300"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>

            {/* Out of Stock Overlay */}
            {product.is_available === false && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <div className="bg-white px-4 py-2 rounded-lg shadow-lg">
                  <p className="font-bold text-gray-900">Out of Stock</p>
                </div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-4">
            {/* Category */}
            <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-1">
              {product.category}
            </p>

            {/* Product Name */}
            <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-700 transition-colors">
              {product.name}
            </h3>

            {/* Rating */}
            {product.average_rating && product.total_reviews && (
              <div className="flex items-center gap-1 mb-2">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(product.average_rating || 0)
                          ? 'fill-secondary-400 text-secondary-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-600">
                  ({product.total_reviews})
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-primary-700">
                  {formatPrice(product.price)}
                </p>
              </div>
              
              {/* Trust Badge */}
              <div className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs font-semibold text-green-700">Verified</span>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Campus Pickup</span>
                <span className="font-semibold text-primary-600">Free</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
