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

  // Calculate discount if original price exists (for now, no discount)
  const originalPrice = 0;
  const discountPercent = 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group"
    >
      <div className="bg-white text-black p-4 border border-gray-300 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300">
          {/* Image Container */}
          <div className="relative w-full h-[260px] mb-2">
            <Link href={`/products/${product.product_id}`}>
              {productImage ? (
                <img
                  src={productImage}
                  alt={product.name}
                  onError={() => setImageError(true)}
                  className="w-full h-full object-cover scale-90 group-hover:scale-100 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <ShoppingCart className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </Link>

            {/* Sliding Action Buttons - Amazon Style */}
            <div className="w-12 h-24 absolute bottom-10 right-0 border border-gray-400 bg-white rounded-md flex flex-col translate-x-20 group-hover:translate-x-0 transition-transform duration-300">
              <button
                onClick={handleAddToCart}
                className="w-full h-full border-b border-gray-400 flex items-center justify-center text-xl bg-transparent hover:bg-secondary-500 hover:text-white cursor-pointer duration-300"
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
              <button
                onClick={handleWishlistToggle}
                className={`w-full h-full flex items-center justify-center text-xl cursor-pointer duration-300 ${
                  isWishlisted ? 'bg-red-500 text-white' : 'bg-transparent hover:bg-secondary-500 hover:text-white'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* NEW Badge for Like New condition */}
            {product.condition === 'Like New' && (
              <div className="absolute top-2 right-2 bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                NEW
              </div>
            )}
          </div>

          <hr className="my-2" />

          {/* Product Info - Amazon Style */}
          <div className="px-2 py-3 flex flex-col gap-1">
            {/* Product Name */}
            <Link href={`/products/${product.product_id}`}>
              <p className="text-base font-medium line-clamp-1 hover:text-primary-600 transition-colors">
                {product.name}
              </p>
            </Link>

            {/* Category + Condition Badges */}
            <div className="flex items-center gap-2">
              <p className="text-xs px-2 py-0.5 bg-gray-100 rounded-full capitalize">
                {product.category}
              </p>
              <p className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                {product.condition}
              </p>
            </div>

            {/* Rating */}
            {product.average_rating && (
              <div className="flex items-center gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.average_rating!)
                        ? 'fill-secondary-500 text-secondary-500'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="text-xs text-gray-500 ml-1">
                  ({product.average_rating.toFixed(1)})
                </span>
              </div>
            )}

            {/* Price */}
            <p className="flex items-center gap-2 mt-1">
              <span className="text-primary-600 font-semibold">
                {formatPrice(product.price)}
              </span>
            </p>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="h-10 font-medium bg-primary-600 text-white rounded-md hover:bg-secondary-500 hover:text-white duration-300 mt-2 flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" /> Add to Cart
            </button>
          </div>
        </div>
    </motion.div>
  );
}
