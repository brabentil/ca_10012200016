'use client';

import React from 'react';
import { Users } from 'lucide-react';

/**
 * Admin Users Management Page
 * View and manage user accounts
 */
export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#003399] rounded-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-600 mt-1">Manage user accounts and permissions</p>
          </div>
        </div>
      </div>

      {/* Users Table - To be implemented */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-lg font-medium">User Management</p>
          <p className="text-sm mt-1">User table with role management will be implemented here</p>
        </div>
      </div>
    </div>
  );
}
