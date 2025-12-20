'use client';

import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import { Package, Search } from 'lucide-react';

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

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
}

const ProductGridSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden animate-pulse"
        >
          {/* Image skeleton */}
          <div className="w-full aspect-square bg-gray-200" />
          
          {/* Content skeleton */}
          <div className="p-4 space-y-3">
            {/* Category */}
            <div className="h-4 w-20 bg-gray-200 rounded" />
            
            {/* Title */}
            <div className="space-y-2">
              <div className="h-5 w-full bg-gray-200 rounded" />
              <div className="h-5 w-3/4 bg-gray-200 rounded" />
            </div>
            
            {/* Rating */}
            <div className="h-4 w-32 bg-gray-200 rounded" />
            
            {/* Price */}
            <div className="h-6 w-24 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

const EmptyState = ({ message, description }: { message: string; description: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="w-24 h-24 bg-gradient-to-br from-primary-50 to-primary-100 rounded-full flex items-center justify-center mb-6">
        <Package className="w-12 h-12 text-primary-400" />
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{message}</h3>
      <p className="text-gray-600 text-center max-w-md mb-8">{description}</p>
      
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Search className="w-4 h-4" />
        <span>Try adjusting your filters or search terms</span>
      </div>
    </motion.div>
  );
};

export default function ProductGrid({ 
  products, 
  isLoading = false,
  emptyMessage = "No products found",
  emptyDescription = "We couldn't find any products matching your criteria."
}: ProductGridProps) {
  // Loading state
  if (isLoading) {
    return <ProductGridSkeleton />;
  }

  // Empty state
  if (!products || products.length === 0) {
    return <EmptyState message={emptyMessage} description={emptyDescription} />;
  }

  // Products grid
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <ProductCard
            key={product.product_id}
            product={product}
            index={index}
          />
        ))}
      </div>

      {/* Results count */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-8 text-center"
      >
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{products.length}</span> {products.length === 1 ? 'product' : 'products'}
        </p>
      </motion.div>
    </motion.div>
  );
}
