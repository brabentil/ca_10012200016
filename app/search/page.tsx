'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ChevronLeft, ChevronRight, Search, Package, ArrowLeft } from 'lucide-react';
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

interface ActiveFilters {
  category?: string;
  size?: string;
  color?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const [searchQuery, setSearchQuery] = useState(query);
  const itemsPerPage = 12;

  // Update search query when URL changes
  useEffect(() => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, [query]);

  // Fetch products
  useEffect(() => {
    if (query) {
      fetchProducts();
    } else {
      setProducts([]);
      setIsLoading(false);
    }
  }, [currentPage, activeFilters, query]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(activeFilters.category && { category: activeFilters.category }),
        ...(activeFilters.size && { size: activeFilters.size }),
        ...(activeFilters.color && { color: activeFilters.color }),
        ...(activeFilters.condition && { condition: activeFilters.condition }),
        ...(activeFilters.minPrice && { min_price: activeFilters.minPrice.toString() }),
        ...(activeFilters.maxPrice && { max_price: activeFilters.maxPrice.toString() }),
      });

      const response = await apiClient.get(`/products/search?${params.toString()}`);
      
      if (response.data.success) {
        setProducts(response.data.data.products || []);
        setTotalProducts(response.data.data.total || 0);
        setTotalPages(Math.ceil((response.data.data.total || 0) / itemsPerPage));
      }
    } catch (error: any) {
      console.error('Error searching products:', error);
      toast.error(error.response?.data?.message || 'Failed to search products');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltersChange = (filters: ActiveFilters) => {
    setActiveFilters(filters);
    setCurrentPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const clearFilters = () => {
    setActiveFilters({});
    setCurrentPage(1);
  };

  const activeFilterCount = Object.keys(activeFilters).filter(
    (key) => activeFilters[key as keyof ActiveFilters] !== undefined
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4"
          >
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {query ? `Search Results for "${query}"` : 'Search Products'}
            </h1>
            <p className="text-gray-600">
              {isLoading 
                ? 'Searching...' 
                : query 
                  ? `${totalProducts} ${totalProducts === 1 ? 'result' : 'results'} found`
                  : 'Enter a search query to find products'
              }
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
                className="w-full h-12 pl-12 pr-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 transition-colors"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </motion.form>

          {/* Mobile Filter Button */}
          {query && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="lg:hidden mt-4"
            >
              <Button
                onClick={() => setFiltersOpen(true)}
                className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white font-semibold border-2 border-primary-600 rounded-xl transition-all"
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
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {query ? (
          <div className="flex gap-8">
            {/* Desktop Filters Sidebar */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="hidden lg:block w-80 flex-shrink-0"
            >
              <div className="sticky top-8">
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                    {activeFilterCount > 0 && (
                      <button
                        onClick={clearFilters}
                        className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <ProductFilters
                    onFilterChange={handleFiltersChange}
                  />
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
                    if (!value) return null;
                    return (
                      <div
                        key={key}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 border-2 border-primary-200 rounded-lg text-sm font-semibold text-primary-700"
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
                          <X className="w-4 h-4" />
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
                  className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center"
                >
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600 mb-6">
                    We couldn't find any products matching "{query}"
                    {activeFilterCount > 0 && ' with the selected filters'}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {activeFilterCount > 0 && (
                      <Button
                        onClick={clearFilters}
                        className="bg-white hover:bg-gray-50 text-gray-700 font-semibold border-2 border-gray-200 hover:border-gray-300 rounded-lg px-6 py-2"
                      >
                        Clear Filters
                      </Button>
                    )}
                    <Button
                      onClick={() => router.push('/products')}
                      className="bg-primary-600 hover:bg-primary-700 text-white font-semibold border-2 border-primary-600 rounded-lg px-6 py-2"
                    >
                      Browse All Products
                    </Button>
                  </div>
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
                    className="h-10 px-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold border-2 border-gray-200 hover:border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                          className={`h-10 w-10 font-semibold border-2 rounded-lg transition-all ${
                            currentPage === pageNum
                              ? 'bg-primary-600 text-white border-primary-600'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
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
                    className="h-10 px-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold border-2 border-gray-200 hover:border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                  Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalProducts)} of {totalProducts} results
                </motion.div>
              )}
            </motion.main>
          </div>
        ) : (
          // Empty Search State
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center max-w-2xl mx-auto"
          >
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Start Your Search</h3>
            <p className="text-gray-600 mb-6">
              Enter a keyword in the search bar above to find products
            </p>
            <Button
              onClick={() => router.push('/products')}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold border-2 border-primary-600 rounded-lg px-6 py-3"
            >
              Browse All Products
            </Button>
          </motion.div>
        )}
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
                  onFilterChange={(filters) => {
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

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading search results...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
