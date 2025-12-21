'use client';

import React from 'react';
import { ProductTable } from '@/components/admin';
import { Package } from 'lucide-react';

// Mock products data for demonstration
const mockProducts = [
  {
    id: '1',
    title: 'Vintage Denim Jacket',
    description: 'Classic 90s denim jacket in excellent condition',
    category: 'OUTERWEAR',
    size: 'M',
    color: 'Blue',
    brand: 'Levi\'s',
    condition: 'GOOD',
    price: 85.00,
    stock: 3,
    isActive: true,
    createdAt: '2025-12-15T10:30:00Z',
    images: [{ imageUrl: '/images/placeholder.jpg', isPrimary: true }],
  },
  {
    id: '2',
    title: 'White Cotton T-Shirt',
    description: 'Basic white tee, perfect for everyday wear',
    category: 'TOPS',
    size: 'L',
    color: 'White',
    brand: 'H&M',
    condition: 'LIKE_NEW',
    price: 25.00,
    stock: 10,
    isActive: true,
    createdAt: '2025-12-14T15:20:00Z',
    images: [{ imageUrl: '/images/placeholder.jpg', isPrimary: true }],
  },
];

/**
 * Admin Products Management Page
 * Manage product inventory with ProductTable component
 */
export default function AdminProductsPage() {
  const handleEdit = (product: any) => {
    console.log('Edit product:', product);
    // TODO: Implement edit modal
  };

  const handleDelete = async (productId: string) => {
    console.log('Delete product:', productId);
    // TODO: Implement delete API call
  };

  const handleToggleActive = async (productId: string, isActive: boolean) => {
    console.log('Toggle active:', productId, isActive);
    // TODO: Implement toggle active API call
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#003399] rounded-lg">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-1">Manage product inventory</p>
          </div>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <ProductTable 
          products={mockProducts}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
        />
      </div>
    </div>
  );
}
