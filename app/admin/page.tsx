'use client';

import React from 'react';
import { AnalyticsCards, SalesChart } from '@/components/admin';

// Mock data for demonstration
const mockAnalytics = {
  overview: {
    totalOrders: 278,
    totalRevenue: 125000,
    totalUsers: 1234,
    totalProducts: 567,
    totalReviews: 892,
  },
  recentActivity: {
    ordersLast7Days: 45,
    newUsersLast7Days: 89,
  },
};

const mockSalesData = [
  { date: '2025-12-15', totalSales: 4500, orderCount: 12 },
  { date: '2025-12-16', totalSales: 5200, orderCount: 15 },
  { date: '2025-12-17', totalSales: 3800, orderCount: 10 },
  { date: '2025-12-18', totalSales: 6100, orderCount: 18 },
  { date: '2025-12-19', totalSales: 5500, orderCount: 14 },
  { date: '2025-12-20', totalSales: 7200, orderCount: 20 },
  { date: '2025-12-21', totalSales: 4900, orderCount: 13 },
];

/**
 * Admin Dashboard Page
 * Overview of key metrics and sales analytics
 */
export default function AdminDashboardPage() {
  const [groupBy, setGroupBy] = React.useState<'daily' | 'weekly' | 'monthly'>('daily');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to ThriftHub Admin</p>
      </div>

      {/* Analytics Cards */}
      <AnalyticsCards data={mockAnalytics} />

      {/* Sales Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <SalesChart 
          data={mockSalesData} 
          groupBy={groupBy}
          onGroupByChange={setGroupBy}
        />
      </div>
    </div>
  );
}
