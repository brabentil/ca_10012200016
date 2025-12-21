'use client';

import React from 'react';
import { Bike } from 'lucide-react';

/**
 * Admin Riders Management Page
 * Manage delivery riders and availability
 */
export default function AdminRidersPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#003399] rounded-lg">
            <Bike className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Riders</h1>
            <p className="text-gray-600 mt-1">Manage campus delivery riders</p>
          </div>
        </div>
      </div>

      {/* Riders Table - To be implemented */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center text-gray-500">
          <Bike className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-lg font-medium">Rider Management</p>
          <p className="text-sm mt-1">Rider table with RiderAvailabilityToggle will be implemented here</p>
        </div>
      </div>
    </div>
  );
}
