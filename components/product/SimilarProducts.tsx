'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import ProductCard from './ProductCard';

interface Product {
  product_id: string;
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

interface SimilarProductsProps {
  products: Product[];
  title?: string;
  subtitle?: string;
}

export default function SimilarProducts({ 
  products, 
  title = "Similar Products",
  subtitle = "You might also like these items"
}: SimilarProductsProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Check scroll position to show/hide arrows
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      setScrollPosition(scrollLeft);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, [products]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.8; // Scroll 80% of container width
      const targetScroll = direction === 'left' 
        ? container.scrollLeft - scrollAmount 
        : container.scrollLeft + scrollAmount;
      
      container.scrollTo({
        left: targetScroll,
        behavior: 'smooth',
      });
    }
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* Header Section */}
      <div className="mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="flex items-center gap-3 mb-2"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {subtitle && (
              <p className="text-sm text-gray-600">{subtitle}</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Carousel Container */}
      <div className="relative group">
        {/* Desktop Navigation Arrows */}
        <AnimatePresence>
          {canScrollLeft && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => scroll('left')}
              className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white border-2 border-gray-200 rounded-full items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:border-primary-500 hover:bg-primary-50"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-6 h-6 text-gray-900" />
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {canScrollRight && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => scroll('right')}
              className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white border-2 border-gray-200 rounded-full items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:border-primary-500 hover:bg-primary-50"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6 text-gray-900" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Scrollable Products Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {products.map((product, index) => (
            <motion.div
              key={product.product_id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px] snap-start"
            >
              <ProductCard product={product} index={index} />
            </motion.div>
          ))}
        </div>

        {/* Mobile Scroll Indicators */}
        <div className="lg:hidden mt-4 flex justify-center gap-2">
          {Array.from({ length: Math.ceil(products.length / 2) }).map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                Math.floor(scrollPosition / (scrollContainerRef.current?.clientWidth || 1)) === index
                  ? 'w-8 bg-primary-500'
                  : 'w-1.5 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Desktop Scroll Hint */}
      {products.length > 4 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="hidden lg:flex items-center justify-center gap-2 mt-6 text-sm text-gray-500"
        >
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
              <ChevronLeft className="w-4 h-4" />
            </div>
            <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
          <span>Hover to navigate</span>
        </motion.div>
      )}

      {/* View All Link */}
      {products.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-6 text-center"
        >
          <a
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 border-2 border-primary-200 hover:border-primary-300 rounded-lg transition-all duration-300 hover:scale-105"
          >
            <span>View All Products</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </motion.div>
      )}

      {/* Custom CSS for hiding scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </motion.div>
  );
}
