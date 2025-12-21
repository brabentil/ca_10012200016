'use client';

import React, { useState, useEffect } from 'react';
import { AnalyticsCards, SalesChart } from '@/components/admin';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';

/**
 * Admin Dashboard Page
 * Overview of key metrics and sales analytics
 */
export default function AdminDashboardPage() {
  const [groupBy, setGroupBy] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [isLoadingSales, setIsLoadingSales] = useState(true);

  // Fetch analytics overview
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoadingAnalytics(true);
        const response = await apiClient.get('/admin/analytics/overview');
        if (response.data.success) {
          setAnalyticsData(response.data.data);
        }
      } catch (error: any) {
        console.error('Failed to load analytics:', error);
        toast.error('Failed to load analytics data');
      } finally {
        setIsLoadingAnalytics(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Fetch sales data
  useEffect(() => {
    const fetchSales = async () => {
      try {
        setIsLoadingSales(true);
        const response = await apiClient.get('/admin/analytics/sales', {
          params: { groupBy },
        });
        if (response.data.success && Array.isArray(response.data.data)) {
          setSalesData(response.data.data);
        } else {
          setSalesData([]);
        }
      } catch (error: any) {
        console.error('Failed to load sales data:', error);
        toast.error('Failed to load sales data');
        setSalesData([]); // Reset to empty array on error
      } finally {
        setIsLoadingSales(false);
      }
    };

    fetchSales();
  }, [groupBy]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to ThriftHub Admin</p>
      </div>

      {/* Analytics Cards */}
      <AnalyticsCards data={analyticsData} isLoading={isLoadingAnalytics} />

      {/* Sales Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <SalesChart 
          data={salesData} 
          groupBy={groupBy}
          onGroupByChange={setGroupBy}
          isLoading={isLoadingSales}
        />
      </div>
    </div>
  );
}
