'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  Activity,
  Star,
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalOrders: number;
    totalRevenue: number;
    totalUsers: number;
    totalProducts: number;
    totalReviews: number;
  };
  recentActivity: {
    ordersLast7Days: number;
    newUsersLast7Days: number;
  };
}

interface AnalyticsCardsProps {
  data: AnalyticsData;
  isLoading?: boolean;
}

/**
 * Format currency in Ghanaian Cedis
 */
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format large numbers (1000+ as 1k, etc.)
 */
const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

/**
 * Individual Metric Card Component
 */
interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  gradient: string;
  iconBg: string;
  index: number;
}

const MetricCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  gradient,
  iconBg,
  index,
}: MetricCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient} p-6 shadow-lg border border-white/20`}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg ${iconBg}`}>
            {icon}
          </div>
          {trend && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
              trend.isPositive 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {trend.isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-white/80 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white mb-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-white/70">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Shine effect on hover */}
      <motion.div
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
          backgroundSize: '200% 200%',
          animation: 'shine 3s infinite',
        }}
      />
    </motion.div>
  );
};

/**
 * Loading Skeleton Card
 */
const SkeletonCard = ({ index }: { index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="rounded-xl bg-gray-200 p-6 shadow-lg animate-pulse"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-gray-300 rounded-lg" />
        <div className="w-16 h-6 bg-gray-300 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="w-24 h-4 bg-gray-300 rounded" />
        <div className="w-32 h-8 bg-gray-300 rounded" />
        <div className="w-20 h-3 bg-gray-300 rounded" />
      </div>
    </motion.div>
  );
};

/**
 * AnalyticsCards Component
 * Dashboard overview cards with key metrics
 */
export default function AnalyticsCards({ data, isLoading = false }: AnalyticsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[0, 1, 2, 3].map((index) => (
          <SkeletonCard key={index} index={index} />
        ))}
      </div>
    );
  }

  // Calculate trends (comparing recent activity to overall)
  const orderTrend = data.overview.totalOrders > 0
    ? Math.round((data.recentActivity.ordersLast7Days / data.overview.totalOrders) * 100)
    : 0;

  const userTrend = data.overview.totalUsers > 0
    ? Math.round((data.recentActivity.newUsersLast7Days / data.overview.totalUsers) * 100)
    : 0;

  // Calculate average order value
  const avgOrderValue = data.overview.totalOrders > 0
    ? data.overview.totalRevenue / data.overview.totalOrders
    : 0;

  const metrics = [
    {
      title: 'Total Revenue',
      value: formatCurrency(data.overview.totalRevenue),
      subtitle: `Avg: ${formatCurrency(avgOrderValue)} per order`,
      icon: <DollarSign className="w-6 h-6 text-emerald-600" />,
      gradient: 'from-emerald-500 to-teal-600',
      iconBg: 'bg-emerald-100',
      trend: orderTrend > 0 ? {
        value: orderTrend,
        isPositive: true,
      } : undefined,
    },
    {
      title: 'Total Orders',
      value: formatNumber(data.overview.totalOrders),
      subtitle: `${data.recentActivity.ordersLast7Days} in last 7 days`,
      icon: <ShoppingBag className="w-6 h-6 text-blue-600" />,
      gradient: 'from-blue-500 to-indigo-600',
      iconBg: 'bg-blue-100',
      trend: data.recentActivity.ordersLast7Days > 0 ? {
        value: data.recentActivity.ordersLast7Days,
        isPositive: true,
      } : undefined,
    },
    {
      title: 'Total Users',
      value: formatNumber(data.overview.totalUsers),
      subtitle: `${data.recentActivity.newUsersLast7Days} new this week`,
      icon: <Users className="w-6 h-6 text-purple-600" />,
      gradient: 'from-purple-500 to-pink-600',
      iconBg: 'bg-purple-100',
      trend: userTrend > 0 ? {
        value: userTrend,
        isPositive: true,
      } : undefined,
    },
    {
      title: 'Active Products',
      value: formatNumber(data.overview.totalProducts),
      subtitle: `${data.overview.totalReviews} reviews`,
      icon: <Package className="w-6 h-6 text-orange-600" />,
      gradient: 'from-orange-500 to-red-600',
      iconBg: 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard
            key={metric.title}
            {...metric}
            index={index}
          />
        ))}
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Recent Orders</p>
                <p className="text-xl font-bold text-gray-900">
                  {data.recentActivity.ordersLast7Days}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Last 7 days</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">New Users</p>
                <p className="text-xl font-bold text-gray-900">
                  {data.recentActivity.newUsersLast7Days}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Last 7 days</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Star className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Reviews</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatNumber(data.overview.totalReviews)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">All time</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Stats Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="p-4 bg-gradient-to-r from-[#003399] to-[#0055cc] rounded-lg shadow-lg"
      >
        <div className="flex items-center justify-between text-white">
          <div>
            <p className="text-sm font-medium opacity-90">Platform Performance</p>
            <p className="text-lg font-bold">
              {data.recentActivity.ordersLast7Days + data.recentActivity.newUsersLast7Days} activities this week
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs opacity-75">Avg Order Value</p>
              <p className="text-lg font-semibold">{formatCurrency(avgOrderValue)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-75">Revenue/User</p>
              <p className="text-lg font-semibold">
                {formatCurrency(data.overview.totalUsers > 0 ? data.overview.totalRevenue / data.overview.totalUsers : 0)}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
