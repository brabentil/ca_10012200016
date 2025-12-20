'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, Clock, Loader2, Image as ImageIcon } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { formatPrice } from '@/lib/utils';

interface Product {
  product_id: number;
  name: string;
  price: number;
  condition: string;
  images: string[];
  category: string;
}

interface SearchBarProps {
  className?: string;
  onClose?: () => void;
  autoFocus?: boolean;
}

export default function SearchBar({ className = '', onClose, autoFocus = false }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches] = useState<string[]>([
    'Vintage Denim',
    'Nike Sneakers',
    'Summer Dresses',
    'Leather Bags',
    'Campus Hoodies',
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Auto focus on mount if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const debounce = setTimeout(async () => {
      try {
        const response = await apiClient.get(`/products/search`, {
          params: { q: query, limit: 6 },
        });
        setResults(response.data.data || []);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [query]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFocused) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => 
            prev < results.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && results[selectedIndex]) {
            handleProductClick(results[selectedIndex]);
          } else if (query.trim()) {
            handleSearch();
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsFocused(false);
          inputRef.current?.blur();
          onClose?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocused, selectedIndex, results, query, onClose]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveRecentSearch = (searchTerm: string) => {
    const updated = [searchTerm, ...recentSearches.filter((s) => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleSearch = () => {
    if (query.trim()) {
      saveRecentSearch(query.trim());
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      setIsFocused(false);
      setQuery('');
      onClose?.();
    }
  };

  const handleProductClick = (product: Product) => {
    saveRecentSearch(product.name);
    router.push(`/products/${product.product_id}`);
    setIsFocused(false);
    setQuery('');
    onClose?.();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    saveRecentSearch(suggestion);
    router.push(`/products?search=${encodeURIComponent(suggestion)}`);
    setIsFocused(false);
    setQuery('');
    onClose?.();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const showDropdown = isFocused && (query.length >= 2 || recentSearches.length > 0 || trendingSearches.length > 0);

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search for clothes, shoes, accessories..."
          className={`w-full h-12 pl-12 pr-12 border-2 rounded-xl text-gray-900 placeholder:text-gray-500 transition-all ${
            isFocused
              ? 'border-primary-500 ring-4 ring-primary-500/10'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        />
        {isLoading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-500 animate-spin" />
        )}
        {!isLoading && query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-[500px] overflow-y-auto z-50"
          >
            {/* Search Results */}
            {query.length >= 2 && (
              <div>
                {isLoading ? (
                  <div className="p-8 text-center">
                    <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Searching...</p>
                  </div>
                ) : results.length > 0 ? (
                  <div>
                    <div className="px-4 py-3 border-b border-gray-200">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Products ({results.length})
                      </h3>
                    </div>
                    <div>
                      {results.map((product, index) => (
                        <motion.button
                          key={product.product_id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleProductClick(product)}
                          className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left ${
                            selectedIndex === index ? 'bg-primary-50' : ''
                          }`}
                        >
                          {/* Product Image */}
                          <div className="w-14 h-14 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate mb-1">
                              {product.name}
                            </h4>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-gray-600">{product.category}</span>
                              <span className="text-gray-400">•</span>
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded font-medium">
                                {product.condition}
                              </span>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <p className="font-bold text-primary-700">
                              {formatPrice(product.price)}
                            </p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                    <div className="p-3 border-t border-gray-200">
                      <button
                        onClick={handleSearch}
                        className="w-full py-2 text-sm font-semibold text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        View all results for "{query}"
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">No products found</h4>
                    <p className="text-sm text-gray-500">
                      Try searching for something else
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Recent Searches */}
            {query.length < 2 && recentSearches.length > 0 && (
              <div>
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Recent Searches
                  </h3>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs font-medium text-primary-600 hover:text-primary-700"
                  >
                    Clear all
                  </button>
                </div>
                <div className="py-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(search)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left group"
                    >
                      <Clock className="w-4 h-4 text-gray-400 group-hover:text-primary-500" />
                      <span className="flex-1 text-sm text-gray-700 group-hover:text-gray-900">
                        {search}
                      </span>
                      <Search className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Searches */}
            {query.length < 2 && trendingSearches.length > 0 && (
              <div>
                <div className="px-4 py-3 border-t border-gray-200">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Trending on Campus
                  </h3>
                </div>
                <div className="py-2 pb-3">
                  {trendingSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(search)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left group"
                    >
                      <div className="w-6 h-6 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="flex-1 text-sm text-gray-700 group-hover:text-gray-900 font-medium">
                        {search}
                      </span>
                      <Search className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
