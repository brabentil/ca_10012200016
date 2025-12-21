'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ChevronLeft, ChevronRight, Search, Package } from 'lucide-react';
import ProductGrid from '@/components/product/ProductGrid';
import ProductFilters from '@/components/product/ProductFilters';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';

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

interface FilterOptions {
  categories: string[];
  sizes: string[];
  colors: string[];
  conditions: string[];
  minPrice: number;
  maxPrice: number;
}

interface ActiveFilters {
  category?: string;
  size?: string;
  color?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 12;

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, [currentPage, activeFilters]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(activeFilters.category && { category: activeFilters.category }),
        ...(activeFilters.size && { size: activeFilters.size }),
        ...(activeFilters.color && { color: activeFilters.color }),
        ...(activeFilters.condition && { condition: activeFilters.condition }),
        ...(activeFilters.minPrice && { min_price: activeFilters.minPrice.toString() }),
        ...(activeFilters.maxPrice && { max_price: activeFilters.maxPrice.toString() }),
        ...(activeFilters.search && { search: activeFilters.search }),
      });

      const response = await apiClient.get(`/products?${params.toString()}`);
      
      if (response.data.success) {
        // Transform backend response to match frontend Product interface
        const transformedProducts = (response.data.data || []).map((product: any) => ({
          product_id: product.id,
          name: product.title,
          price: parseFloat(product.price),
          condition: product.condition === 'LIKE_NEW' ? 'Like New' : 
                    product.condition === 'GOOD' ? 'Good' :
                    product.condition === 'FAIR' ? 'Fair' :
                    product.condition === 'VINTAGE' ? 'Good' : 'Good',
          images: product.images?.map((img: any) => img.imageUrl) || [],
          category: product.category,
          seller_id: product.sellerId,
          is_available: product.stock > 0,
          average_rating: product.averageRating,
          total_reviews: product.reviewCount,
        }));
        
        setProducts(transformedProducts);
        setTotalProducts(response.data.pagination?.total || 0);
        setTotalPages(response.data.pagination?.pages || 1);
      }
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast.error(error.response?.data?.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltersChange = (filters: ActiveFilters) => {
    setActiveFilters(filters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveFilters({ ...activeFilters, search: searchQuery });
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSearchQuery('');
    setCurrentPage(1);
  };

  const activeFilterCount = Object.keys(activeFilters).filter(
    (key) => key !== 'search' && activeFilters[key as keyof ActiveFilters] !== undefined
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">All Products</h1>
            <p className="text-gray-600">
              {isLoading ? 'Loading products...' : `${totalProducts} items available`}
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            onSubmit={handleSearch}
            className="mt-6"
          >
            <div className="relative max-w-2xl">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full h-12 pl-12 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveFilters({ ...activeFilters, search: undefined });
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </motion.form>

          {/* Mobile Filter Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="lg:hidden mt-4"
          >
            <Button
              onClick={() => setFiltersOpen(true)}
              className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-all"
            >
              <SlidersHorizontal className="w-5 h-5 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-secondary-500 text-white text-xs font-bold rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="hidden lg:block w-72 flex-shrink-0"
          >
            <div className="sticky top-8">
              <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
                {/* Filters Header with Blue Background */}
                <div className="bg-primary-600 text-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-5 h-5" />
                      <h2 className="text-lg font-bold">Filters</h2>
                    </div>
                    {activeFilterCount > 0 && (
                      <button
                        onClick={clearFilters}
                        className="text-sm font-semibold hover:underline"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Filters Content */}
                <div className="p-4">
                  <ProductFilters
                    onFilterChange={handleFiltersChange}
                  />
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Products Grid */}
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex-1"
          >
            {/* Active Filters Display */}
            {activeFilterCount > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {Object.entries(activeFilters).map(([key, value]) => {
                  if (!value || key === 'search') return null;
                  return (
                    <div
                      key={key}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 border border-primary-200 rounded-md text-sm font-medium text-primary-700"
                    >
                      <span className="capitalize">{key}: {value}</span>
                      <button
                        onClick={() => {
                          const newFilters = { ...activeFilters };
                          delete newFilters[key as keyof ActiveFilters];
                          setActiveFilters(newFilters);
                        }}
                        className="hover:text-primary-900 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Products Grid or Empty State */}
            {!isLoading && products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white border border-gray-300 rounded-lg shadow-sm p-12 text-center"
              >
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search query
                </p>
                {activeFilterCount > 0 && (
                  <Button
                    onClick={clearFilters}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg px-6 py-2"
                  >
                    Clear All Filters
                  </Button>
                )}
              </motion.div>
            ) : (
              <ProductGrid products={products} isLoading={isLoading} />
            )}

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mt-8 flex items-center justify-center gap-2"
              >
                <Button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="h-10 px-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>

                {/* Page Numbers */}
                <div className="flex gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`h-10 w-10 font-semibold border rounded-lg transition-all ${
                          currentPage === pageNum
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-primary-500 hover:text-primary-600'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <Button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="h-10 px-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </motion.div>
            )}

            {/* Page Info */}
            {!isLoading && products.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mt-4 text-center text-sm text-gray-600"
              >
                Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalProducts)} of {totalProducts} products
              </motion.div>
            )}
          </motion.main>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFiltersOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-full max-w-sm bg-white z-50 overflow-y-auto lg:hidden"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Filters</h2>
                  <button
                    onClick={() => setFiltersOpen(false)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-600" />
                  </button>
                </div>

                {/* Clear All Button */}
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => {
                      clearFilters();
                      setFiltersOpen(false);
                    }}
                    className="w-full mb-4 h-10 bg-red-50 hover:bg-red-100 text-red-700 font-semibold border-2 border-red-200 rounded-lg transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}

                {/* Filters */}
                <ProductFilters
                  onFilterChange={(filters: ActiveFilters) => {
                    handleFiltersChange(filters);
                    setFiltersOpen(false);
                  }}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
