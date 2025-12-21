'use client';

import React, { useState, useEffect } from 'react';
import { ProductTable, ProductFormModal } from '@/components/admin';
import { Package, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';

interface ProductImage {
  imageUrl: string;
  isPrimary: boolean;
}

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
  images?: ProductImage[];
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/**
 * Admin Products Management Page
 * Full CRUD operations for product inventory management
 */
export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 20,
    pages: 0,
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  /**
   * Fetch products from API
   */
  const fetchProducts = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/products', {
        params: {
          page,
          limit: 50, // Get more products for admin view
        },
      });

      if (response.data.success) {
        setProducts(response.data.data);
        setPagination(response.data.pagination);
      } else {
        throw new Error(response.data.message || 'Failed to fetch products');
      }
    } catch (error: any) {
      console.error('Fetch products error:', error);
      toast.error(error?.response?.data?.message || 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Initial load
   */
  useEffect(() => {
    fetchProducts();
  }, []);

  /**
   * Handle edit product - open modal with product data
   */
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
  };

  /**
   * Handle delete product
   */
  const handleDelete = async (productId: string) => {
    try {
      const response = await apiClient.delete(`/products/${productId}`);
      
      if (response.data.success) {
        toast.success('Product deleted successfully');
        // Remove from local state
        setProducts(prev => prev.filter(p => p.id !== productId));
      } else {
        throw new Error(response.data.message || 'Failed to delete product');
      }
    } catch (error: any) {
      console.error('Delete product error:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete product');
      throw error;
    }
  };

  /**
   * Handle toggle active status
   */
  const handleToggleActive = async (productId: string, isActive: boolean) => {
    try {
      const response = await apiClient.patch(`/products/${productId}`, {
        isActive,
      });

      if (response.data.success) {
        toast.success(isActive ? 'Product activated' : 'Product hidden');
        // Update local state
        setProducts(prev =>
          prev.map(p => (p.id === productId ? { ...p, isActive } : p))
        );
      } else {
        throw new Error(response.data.message || 'Failed to update product');
      }
    } catch (error: any) {
      console.error('Toggle active error:', error);
      toast.error(error?.response?.data?.message || 'Failed to update product');
      throw error;
    }
  };

  /**
   * Handle product created/updated from modal
   */
  const handleProductSaved = (savedProduct: any) => {
    if (editingProduct) {
      // Update existing product in list
      setProducts(prev =>
        prev.map(p => (p.id === savedProduct.id ? savedProduct : p))
      );
      toast.success('Product updated successfully');
    } else {
      // Add new product to list
      setProducts(prev => [savedProduct, ...prev]);
      setPagination(prev => ({ ...prev, total: prev.total + 1 }));
      toast.success('Product created successfully');
    }
    
    // Close modals
    setShowAddModal(false);
    setEditingProduct(null);
  };

  /**
   * Handle modal close
   */
  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#003399] rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Products</h1>
              <p className="text-gray-600 mt-1">
                Manage product inventory
                {pagination.total > 0 && (
                  <span className="ml-2 text-[#003399] font-medium">
                    ({pagination.total} total)
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Add Product Button */}
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-[#003399] hover:bg-[#002266] text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add Product
          </Button>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <ProductTable
          products={products}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
          isLoading={isLoading}
        />
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <ProductFormModal
          isOpen={showAddModal}
          onClose={handleCloseModal}
          onSave={handleProductSaved}
        />
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <ProductFormModal
          isOpen={!!editingProduct}
          onClose={handleCloseModal}
          onSave={handleProductSaved}
          product={editingProduct}
        />
      )}
    </div>
  );
}
