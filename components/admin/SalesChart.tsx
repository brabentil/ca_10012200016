'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { TrendingUp, BarChart3, Calendar, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

type ChartType = 'line' | 'bar';
type GroupBy = 'daily' | 'weekly' | 'monthly';

interface SalesDataPoint {
  date: string;
  totalSales: number;
  orderCount: number;
}

interface SalesChartProps {
  data: SalesDataPoint[];
  isLoading?: boolean;
  groupBy?: GroupBy;
  onGroupByChange?: (groupBy: GroupBy) => void;
}

/**
 * Format date label based on grouping
 */
const formatDateLabel = (dateString: string, groupBy: GroupBy) => {
  try {
    const date = parseISO(dateString);
    
    switch (groupBy) {
      case 'daily':
        return format(date, 'MMM dd');
      case 'weekly':
        return format(date, 'MMM dd');
      case 'monthly':
        return format(date, 'MMM yyyy');
      default:
        return dateString;
    }
  } catch {
    return dateString;
  }
};

/**
 * Format currency for axis
 */
const formatCurrency = (value: number) => {
  if (value >= 1000) {
    return `GH₵${(value / 1000).toFixed(1)}k`;
  }
  return `GH₵${value}`;
};

/**
 * SalesChart Component
 * Line/bar chart for admin sales analytics
 */
export default function SalesChart({
  data,
  isLoading = false,
  groupBy = 'daily',
  onGroupByChange,
}: SalesChartProps) {
  const [chartType, setChartType] = useState<ChartType>('line');

  // Calculate summary statistics
  const totalSales = data.reduce((sum, item) => sum + item.totalSales, 0);
  const totalOrders = data.reduce((sum, item) => sum + item.orderCount, 0);
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  // Find peak sales day
  const peakDay = data.reduce(
    (max, item) => (item.totalSales > max.totalSales ? item : max),
    data[0] || { date: '', totalSales: 0, orderCount: 0 }
  );

  // Format data for chart display
  const chartData = data.map((item) => ({
    ...item,
    displayDate: formatDateLabel(item.date, groupBy),
  }));

  /**
   * Custom Tooltip Component with access to groupBy
   */
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-semibold text-gray-900 mb-2">
          {label}
        </p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-gray-600">Sales:</span>
            <span className="text-sm font-semibold text-[#003399]">
              GH₵{data.totalSales.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-gray-600">Orders:</span>
            <span className="text-sm font-semibold text-green-600">{data.orderCount}</span>
          </div>
          {data.orderCount > 0 && (
            <div className="flex items-center justify-between gap-4 pt-1 border-t border-gray-100">
              <span className="text-xs text-gray-600">Avg Order:</span>
              <span className="text-sm font-medium text-gray-700">
                GH₵{(data.totalSales / data.orderCount).toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Sales Analytics</h3>
          <p className="text-sm text-gray-600">Revenue and order trends</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Group By Selector */}
          {onGroupByChange && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                value={groupBy}
                onChange={(e) => onGroupByChange(e.target.value as GroupBy)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#003399] focus:border-transparent"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          )}

          {/* Chart Type Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setChartType('line')}
              className={`
                p-1.5 rounded-md transition-colors
                ${chartType === 'line' 
                  ? 'bg-white text-[#003399] shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
              title="Line chart"
            >
              <TrendingUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`
                p-1.5 rounded-md transition-colors
                ${chartType === 'bar' 
                  ? 'bg-white text-[#003399] shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
              title="Bar chart"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200"
        >
          <p className="text-sm text-blue-700 font-medium">Total Sales</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            GH₵{totalSales.toFixed(2)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200"
        >
          <p className="text-sm text-green-700 font-medium">Total Orders</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{totalOrders}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200"
        >
          <p className="text-sm text-purple-700 font-medium">Avg Order Value</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">
            GH₵{averageOrderValue.toFixed(2)}
          </p>
        </motion.div>
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-6 rounded-lg border border-gray-200"
      >
        {isLoading ? (
          <div className="h-80 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#003399]" />
          </div>
        ) : data.length === 0 ? (
          <div className="h-80 flex flex-col items-center justify-center text-gray-500">
            <BarChart3 className="w-12 h-12 mb-3 text-gray-400" />
            <p className="text-lg font-medium">No sales data</p>
            <p className="text-sm">No orders in selected date range</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            {chartType === 'line' ? (
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="displayDate"
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#003399"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={formatCurrency}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#10b981"
                  fontSize={12}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                  formatter={(value) => (
                    <span className="text-sm text-gray-700">{value}</span>
                  )}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="totalSales"
                  stroke="#003399"
                  strokeWidth={2}
                  dot={{ fill: '#003399', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Sales (GH₵)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orderCount"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Orders"
                />
              </LineChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="displayDate"
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#003399"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={formatCurrency}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#10b981"
                  fontSize={12}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="square"
                  formatter={(value) => (
                    <span className="text-sm text-gray-700">{value}</span>
                  )}
                />
                <Bar
                  yAxisId="left"
                  dataKey="totalSales"
                  fill="#003399"
                  radius={[8, 8, 0, 0]}
                  name="Sales (GH₵)"
                />
                <Bar
                  yAxisId="right"
                  dataKey="orderCount"
                  fill="#10b981"
                  radius={[8, 8, 0, 0]}
                  name="Orders"
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Peak Performance Insight */}
      {!isLoading && data.length > 0 && peakDay.totalSales > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 bg-amber-50 border border-amber-200 rounded-lg"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-900">Peak Performance</p>
              <p className="text-xs text-amber-700 mt-1">
                Best day: {formatDateLabel(peakDay.date, groupBy)} with{' '}
                <span className="font-semibold">GH₵{peakDay.totalSales.toFixed(2)}</span>{' '}
                ({peakDay.orderCount} orders)
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
