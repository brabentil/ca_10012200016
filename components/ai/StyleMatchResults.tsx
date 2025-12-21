'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heart, ShoppingCart, Sparkles, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import SimilarityBadge, { CompactSimilarityBadge } from './SimilarityBadge';
import apiClient from '@/lib/api-client';

interface StyleMatchProduct {
  id: number;
  title: string;
  description: string;
  category: string;
  size: string | null;
  color: string | null;
  brand: string | null;
  condition: 'new' | 'like-new' | 'good' | 'fair';
  price: number;
  stock: number;
  primaryImage: string | null;
  similarityScore: number; // 0-1 decimal from API
}

interface StyleMatchResultsProps {
  matches: StyleMatchProduct[];
  isLoading?: boolean;
  showTopMatchBanner?: boolean;
}

const LoadingSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg border border-gray-300 overflow-hidden animate-pulse"
        >
          {/* Image skeleton */}
          <div className="w-full aspect-square bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_200%] animate-shimmer" />
          
          {/* Content skeleton */}
          <div className="p-4 space-y-3">
            {/* Match badge skeleton */}
            <div className="h-6 w-20 bg-gray-200 rounded-full" />
            
            {/* Title */}
            <div className="space-y-2">
              <div className="h-5 w-full bg-gray-200 rounded" />
              <div className="h-5 w-3/4 bg-gray-200 rounded" />
            </div>
            
            {/* Category + Condition */}
            <div className="flex gap-2">
              <div className="h-4 w-16 bg-gray-200 rounded-full" />
              <div className="h-4 w-16 bg-gray-200 rounded-full" />
            </div>
            
            {/* Price */}
            <div className="h-6 w-24 bg-gray-200 rounded" />
            
            {/* Button */}
            <div className="h-10 w-full bg-gray-200 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
};

const EmptyState = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="w-24 h-24 bg-gradient-to-br from-primary-50 to-primary-100 rounded-full flex items-center justify-center mb-6">
        <Sparkles className="w-12 h-12 text-primary-600" />
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 mb-2">No matches found</h3>
      <p className="text-gray-600 text-center max-w-md mb-8">
        We couldn't find any products matching your style. Try uploading a different image.
      </p>
    </motion.div>
  );
};

const StyleMatchCard = ({ product, index }: { product: StyleMatchProduct; index: number }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Convert similarity score (0-1) to percentage (0-100)
  const similarityPercentage = product.similarityScore * 100;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const response = await apiClient.post('/cart/items', {
        productId: product.id,
        quantity: 1,
      });
      
      if (response.data.success) {
        toast.success('Added to cart');
      }
    } catch (error: any) {
      console.error('Add to cart error:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to add to cart');
    }
  };

  const getConditionDisplay = (condition: string) => {
    switch (condition) {
      case 'new':
        return 'New';
      case 'like-new':
        return 'Like New';
      case 'good':
        return 'Good';
      case 'fair':
        return 'Fair';
      default:
        return condition;
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new':
      case 'like-new':
        return 'bg-green-100 text-green-700';
      case 'good':
        return 'bg-blue-100 text-blue-700';
      case 'fair':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group"
    >
      <div className="bg-white text-black p-4 border border-gray-300 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-primary-400">
        {/* Image Container */}
        <div className="relative w-full h-[260px] mb-2">
          <Link href={`/products/${product.id}`}>
            {product.primaryImage && !imageError ? (
              <img
                src={product.primaryImage}
                alt={product.title}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover scale-90 group-hover:scale-100 transition-transform duration-300 rounded-md"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-md">
                <ShoppingCart className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </Link>

          {/* Compact Similarity Badge - Top Right */}
          <div className="absolute top-2 right-2">
            <CompactSimilarityBadge similarity={similarityPercentage} />
          </div>

          {/* Sliding Action Buttons */}
          <div className="w-12 h-24 absolute bottom-10 right-0 border border-gray-400 bg-white rounded-md flex flex-col translate-x-20 group-hover:translate-x-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full h-full border-b border-gray-400 flex items-center justify-center text-xl bg-transparent hover:bg-secondary-500 hover:text-white cursor-pointer duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Best Match Badge for top result */}
          {index === 0 && similarityPercentage >= 90 && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-primary-600 to-secondary-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
              <TrendingUp className="w-3 h-3" />
              Best Match
            </div>
          )}

          {/* Out of Stock Overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md">
              <span className="bg-white text-gray-900 px-4 py-2 rounded-md font-semibold">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        <hr className="my-2" />

        {/* Product Info */}
        <div className="px-2 py-3 flex flex-col gap-2">
          {/* Similarity Badge - Full Display */}
          <div className="flex justify-start">
            <SimilarityBadge 
              similarity={similarityPercentage} 
              size="sm" 
              showLabel={false}
            />
          </div>

          {/* Product Name */}
          <Link href={`/products/${product.id}`}>
            <p className="text-base font-medium line-clamp-2 hover:text-primary-600 transition-colors min-h-[48px]">
              {product.title}
            </p>
          </Link>

          {/* Category + Condition Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full capitalize">
              {product.category}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${getConditionColor(product.condition)}`}>
              {getConditionDisplay(product.condition)}
            </span>
          </div>

          {/* Additional Info */}
          <div className="flex items-center gap-2 text-xs text-gray-600 flex-wrap">
            {product.brand && (
              <span className="flex items-center gap-1">
                <span className="font-medium">Brand:</span> {product.brand}
              </span>
            )}
            {product.size && (
              <span className="flex items-center gap-1">
                <span className="font-medium">Size:</span> {product.size}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mt-1">
            <p className="text-lg font-semibold text-primary-600">
              {formatPrice(product.price)}
            </p>
            {product.stock > 0 && product.stock <= 5 && (
              <span className="text-xs text-orange-600 font-medium">
                Only {product.stock} left
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="h-10 font-medium bg-primary-600 text-white rounded-md hover:bg-secondary-500 duration-300 mt-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-4 h-4" />
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default function StyleMatchResults({
  matches,
  isLoading = false,
  showTopMatchBanner = true,
}: StyleMatchResultsProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  // Empty state
  if (!matches || matches.length === 0) {
    return <EmptyState />;
  }

  // Calculate match statistics
  const topMatch = matches[0];
  const topMatchPercentage = (topMatch.similarityScore * 100).toFixed(1);
  const averageMatch = (matches.reduce((sum, m) => sum + m.similarityScore, 0) / matches.length * 100).toFixed(1);
  const excellentMatches = matches.filter(m => m.similarityScore >= 0.9).length;
  const greatMatches = matches.filter(m => m.similarityScore >= 0.75 && m.similarityScore < 0.9).length;

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-primary-600" />
              Style Matches
            </h2>
            <p className="text-gray-600 mt-1">
              Found {matches.length} similar {matches.length === 1 ? 'product' : 'products'} matching your style
            </p>
          </div>

          {/* Match Statistics */}
          <div className="flex items-center gap-3">
            <div className="text-center px-4 py-2 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg border border-primary-200">
              <p className="text-xs text-gray-600 font-medium">Avg Match</p>
              <p className="text-lg font-bold text-primary-600">{averageMatch}%</p>
            </div>
            {excellentMatches > 0 && (
              <div className="text-center px-4 py-2 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                <p className="text-xs text-gray-600 font-medium">Excellent</p>
                <p className="text-lg font-bold text-green-600">{excellentMatches}</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Match Banner */}
        {showTopMatchBanner && topMatch.similarityScore >= 0.75 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="bg-gradient-to-r from-primary-600 via-secondary-500 to-primary-600 bg-[length:200%_100%] animate-gradient text-white p-4 rounded-xl shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg">Amazing Match Found!</p>
                <p className="text-sm opacity-90">
                  Your top match is <span className="font-semibold">{topMatchPercentage}%</span> similar to your uploaded style
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {matches.map((product, index) => (
          <StyleMatchCard key={product.id} product={product} index={index} />
        ))}
      </div>

      {/* Results Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="text-center py-8 border-t border-gray-200"
      >
        <p className="text-gray-600 text-sm">
          Powered by AI Visual Search • Results sorted by similarity
        </p>
        <p className="text-gray-500 text-xs mt-2">
          Match scores are calculated using advanced image recognition technology
        </p>
      </motion.div>
    </div>
  );
}
