'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  X,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import Image from 'next/image';

// Product categories and conditions from schema
const CATEGORIES = ['TOPS', 'BOTTOMS', 'DRESSES', 'OUTERWEAR', 'SHOES', 'ACCESSORIES'];
const CONDITIONS = ['LIKE_NEW', 'GOOD', 'FAIR', 'VINTAGE'];

type SortField = 'title' | 'price' | 'stock' | 'category' | 'condition' | 'createdAt';
type SortOrder = 'asc' | 'desc';

interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  size: string;
  color: string;
  brand?: string;
  condition: string;
  price: number;
  stock: number;
  isActive: boolean;
  createdAt: string;
  images?: Array<{ imageUrl: string; isPrimary: boolean }>;
}

interface ProductTableProps {
  products: Product[];
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  onToggleActive?: (productId: string, isActive: boolean) => void;
  isLoading?: boolean;
}

/**
 * ProductTable Component
 * Sortable, filterable table for admin product management
 */
export default function ProductTable({
  products,
  onEdit,
  onDelete,
  onToggleActive,
  isLoading = false,
}: ProductTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [conditionFilter, setConditionFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  /**
   * Handle sort toggle
   */
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  /**
   * Filtered and sorted products
   */
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.brand?.toLowerCase().includes(query) ||
          p.color.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter((p) => p.category === categoryFilter);
    }

    // Apply condition filter
    if (conditionFilter) {
      filtered = filtered.filter((p) => p.condition === conditionFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle different data types
      if (sortField === 'price' || sortField === 'stock') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else if (sortField === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [products, searchQuery, categoryFilter, conditionFilter, sortField, sortOrder]);

  /**
   * Handle delete product
   */
  const handleDelete = async (productId: string) => {
    if (!confirm('Delete this product? This action cannot be undone.')) {
      return;
    }

    setDeletingId(productId);
    try {
      await onDelete?.(productId);
      toast.success('Product deleted');
    } catch (error) {
      toast.error('Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * Handle toggle active status
   */
  const handleToggleActive = async (productId: string, currentStatus: boolean) => {
    setTogglingId(productId);
    try {
      await onToggleActive?.(productId, !currentStatus);
      toast.success(currentStatus ? 'Product hidden' : 'Product activated');
    } catch (error) {
      toast.error('Failed to update product');
    } finally {
      setTogglingId(null);
    }
  };

  /**
   * Format category for display
   */
  const formatCategory = (category: string) => {
    return category
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  /**
   * Format condition for display
   */
  const formatCondition = (condition: string) => {
    return condition
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  /**
   * Get condition badge color
   */
  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'LIKE_NEW':
        return 'bg-green-100 text-green-700';
      case 'GOOD':
        return 'bg-blue-100 text-blue-700';
      case 'FAIR':
        return 'bg-yellow-100 text-yellow-700';
      case 'VINTAGE':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  /**
   * Sort icon component
   */
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ChevronDown className="w-4 h-4 text-gray-400" />;
    }
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-[#003399]" />
    ) : (
      <ChevronDown className="w-4 h-4 text-[#003399]" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003399] focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <motion.button
          onClick={() => setShowFilters(!showFilters)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
            ${showFilters 
              ? 'bg-[#003399] text-white' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }
          `}
        >
          <Filter className="w-4 h-4" />
          Filters
          {(categoryFilter || conditionFilter) && (
            <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
              {[categoryFilter, conditionFilter].filter(Boolean).length}
            </span>
          )}
        </motion.button>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003399] focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {formatCategory(cat)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Condition Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condition
                  </label>
                  <select
                    value={conditionFilter}
                    onChange={(e) => setConditionFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003399] focus:border-transparent"
                  >
                    <option value="">All Conditions</option>
                    {CONDITIONS.map((cond) => (
                      <option key={cond} value={cond}>
                        {formatCondition(cond)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Clear Filters */}
              {(categoryFilter || conditionFilter) && (
                <button
                  onClick={() => {
                    setCategoryFilter('');
                    setConditionFilter('');
                  }}
                  className="text-sm text-[#003399] hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-16">Image</TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('title')}
                    className="flex items-center gap-1 hover:text-[#003399] transition-colors"
                  >
                    Product
                    <SortIcon field="title" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('category')}
                    className="flex items-center gap-1 hover:text-[#003399] transition-colors"
                  >
                    Category
                    <SortIcon field="category" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('condition')}
                    className="flex items-center gap-1 hover:text-[#003399] transition-colors"
                  >
                    Condition
                    <SortIcon field="condition" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('price')}
                    className="flex items-center gap-1 hover:text-[#003399] transition-colors"
                  >
                    Price
                    <SortIcon field="price" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('stock')}
                    className="flex items-center gap-1 hover:text-[#003399] transition-colors"
                  >
                    Stock
                    <SortIcon field="stock" />
                  </button>
                </TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-64">
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-[#003399]" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-64">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Package className="w-12 h-12 mb-3 text-gray-400" />
                      <p className="text-lg font-medium">No products found</p>
                      <p className="text-sm">Try adjusting your filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product, index) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Image */}
                    <TableCell>
                      <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden">
                        {product.images?.[0]?.imageUrl ? (
                          <Image
                            src={product.images[0].imageUrl}
                            alt={product.title}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Product Info */}
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="font-medium text-gray-900 truncate">{product.title}</p>
                        <p className="text-xs text-gray-500 truncate">{product.brand || 'No brand'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{product.size}</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full" />
                          <span className="text-xs text-gray-500">{product.color}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      <span className="text-sm text-gray-700">
                        {formatCategory(product.category)}
                      </span>
                    </TableCell>

                    {/* Condition */}
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getConditionColor(
                          product.condition
                        )}`}
                      >
                        {formatCondition(product.condition)}
                      </span>
                    </TableCell>

                    {/* Price */}
                    <TableCell>
                      <span className="font-semibold text-gray-900">
                        GH₵{product.price.toFixed(2)}
                      </span>
                    </TableCell>

                    {/* Stock */}
                    <TableCell>
                      <span
                        className={`font-medium ${
                          product.stock === 0
                            ? 'text-red-600'
                            : product.stock < 5
                            ? 'text-orange-600'
                            : 'text-green-600'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="text-center">
                      <button
                        onClick={() => handleToggleActive(product.id, product.isActive)}
                        disabled={togglingId === product.id}
                        className={`
                          inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                          transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                          ${
                            product.isActive
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }
                        `}
                      >
                        {togglingId === product.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : product.isActive ? (
                          <Eye className="w-3 h-3" />
                        ) : (
                          <EyeOff className="w-3 h-3" />
                        )}
                        {product.isActive ? 'Active' : 'Hidden'}
                      </button>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <motion.button
                          onClick={() => onEdit?.(product)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-gray-600 hover:text-[#003399] hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit product"
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDelete(product.id)}
                          disabled={deletingId === product.id}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete product"
                        >
                          {deletingId === product.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </motion.button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
