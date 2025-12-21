'use client';

import React from 'react';
import { ShoppingBag } from 'lucide-react';

/**
 * Admin Orders Management Page
 * View and manage customer orders
 */
export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#003399] rounded-lg">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-600 mt-1">View and manage customer orders</p>
          </div>
        </div>
      </div>

      {/* Orders Table - To be implemented */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center text-gray-500">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-lg font-medium">Orders Management</p>
          <p className="text-sm mt-1">Order table with OrderStatusUpdater will be implemented here</p>
        </div>
      </div>
    </div>
  );
}
