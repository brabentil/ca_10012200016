'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bike,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  UserPlus,
  Loader2,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RiderAvailabilityToggle } from '@/components/admin';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';

type SortField = 'name' | 'zone' | 'deliveries' | 'rating' | 'createdAt';
type SortOrder = 'asc' | 'desc';

interface RiderData {
  id: string;
  userId: string;
  user: {
    id: string;
    email: string;
    name: string;
    phone: string | null;
    role: string;
  };
  zone: {
    id: string;
    code: string;
    name: string;
    campus: {
      id: string;
      code: string;
      name: string;
    };
  };
  isAvailable: boolean;
  rating: number | null;
  totalDeliveries: number;
  createdAt: string;
}

/**
 * Admin Riders Management Page
 * Manage delivery riders and availability
 */
export default function AdminRidersPage() {
  const [riders, setRiders] = useState<RiderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showAddRiderModal, setShowAddRiderModal] = useState(false);

  /**
   * Fetch all riders
   */
  const fetchRiders = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/admin/riders');
      
      if (response.data.success && response.data.data) {
        setRiders(response.data.data);
      } else {
        setRiders([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch riders:', error);
      toast.error('Failed to load riders');
      setRiders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRiders();
  }, []);

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
   * Filtered and sorted riders
   */
  const filteredRiders = useMemo(() => {
    let filtered = [...riders];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (rider) =>
          rider.user.name.toLowerCase().includes(query) ||
          rider.user.email.toLowerCase().includes(query) ||
          rider.zone.name.toLowerCase().includes(query) ||
          rider.zone.campus.name.toLowerCase().includes(query)
      );
    }

    // Apply availability filter
    if (availabilityFilter === 'online') {
      filtered = filtered.filter((rider) => rider.isAvailable);
    } else if (availabilityFilter === 'offline') {
      filtered = filtered.filter((rider) => !rider.isAvailable);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortField) {
        case 'name':
          aVal = a.user.name.toLowerCase();
          bVal = b.user.name.toLowerCase();
          break;
        case 'zone':
          aVal = a.zone.name.toLowerCase();
          bVal = b.zone.name.toLowerCase();
          break;
        case 'deliveries':
          aVal = a.totalDeliveries;
          bVal = b.totalDeliveries;
          break;
        case 'rating':
          aVal = a.rating || 0;
          bVal = b.rating || 0;
          break;
        case 'createdAt':
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [riders, searchQuery, availabilityFilter, sortField, sortOrder]);

  /**
   * Get sort icon
   */
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronDown className="w-4 h-4 text-gray-400" />;
    }
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-[#003399]" />
    ) : (
      <ChevronDown className="w-4 h-4 text-[#003399]" />
    );
  };

  /**
   * Handle availability update
   */
  const handleAvailabilityUpdate = (riderId: string, newAvailability: boolean) => {
    setRiders((prevRiders) =>
      prevRiders.map((rider) =>
        rider.id === riderId ? { ...rider, isAvailable: newAvailability } : rider
      )
    );
  };

  /**
   * Statistics
   */
  const stats = useMemo(() => {
    const onlineCount = riders.filter((r) => r.isAvailable).length;
    const offlineCount = riders.length - onlineCount;
    const totalDeliveries = riders.reduce((sum, r) => sum + r.totalDeliveries, 0);
    const avgRating =
      riders.filter((r) => r.rating !== null).length > 0
        ? riders
            .filter((r) => r.rating !== null)
            .reduce((sum, r) => sum + (r.rating || 0), 0) /
          riders.filter((r) => r.rating !== null).length
        : 0;

    return { onlineCount, offlineCount, totalDeliveries, avgRating };
  }, [riders]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#003399] rounded-lg">
              <Bike className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Riders</h1>
              <p className="text-gray-600 mt-1">Manage campus delivery riders</p>
            </div>
          </div>

          {/* Add Rider Button */}
          <motion.button
            onClick={() => setShowAddRiderModal(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 bg-[#003399] text-white rounded-lg font-medium hover:bg-[#002e8a] transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            Add Rider
          </motion.button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Riders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{riders.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Bike className="w-6 h-6 text-[#003399]" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Online Now</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.onlineCount}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Deliveries</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalDeliveries}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : 'N/A'}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search riders by name, email, or zone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003399] focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <motion.button
            onClick={() => setShowFilters(!showFilters)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-5 h-5" />
            Filters
            {showFilters ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </motion.button>
        </div>

        {/* Filter Options */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Availability Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Availability
                    </label>
                    <select
                      value={availabilityFilter}
                      onChange={(e) => setAvailabilityFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003399]"
                    >
                      <option value="">All</option>
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                    </select>
                  </div>
                </div>

                {/* Clear Filters */}
                {(searchQuery || availabilityFilter) && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => {
                      setSearchQuery('');
                      setAvailabilityFilter('');
                    }}
                    className="mt-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    <X className="w-4 h-4" />
                    Clear all filters
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Riders Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#003399] animate-spin" />
          </div>
        ) : filteredRiders.length === 0 ? (
          <div className="text-center py-12">
            <Bike className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-lg font-medium text-gray-900">No riders found</p>
            <p className="text-sm text-gray-600 mt-1">
              {searchQuery || availabilityFilter
                ? 'Try adjusting your filters'
                : 'Add your first rider to get started'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50 select-none"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-2">
                      Rider
                      {getSortIcon('name')}
                    </div>
                  </TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50 select-none"
                    onClick={() => handleSort('zone')}
                  >
                    <div className="flex items-center gap-2">
                      Zone
                      {getSortIcon('zone')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50 select-none"
                    onClick={() => handleSort('deliveries')}
                  >
                    <div className="flex items-center gap-2">
                      Deliveries
                      {getSortIcon('deliveries')}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50 select-none"
                    onClick={() => handleSort('rating')}
                  >
                    <div className="flex items-center gap-2">
                      Rating
                      {getSortIcon('rating')}
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50 select-none"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center gap-2">
                      Joined
                      {getSortIcon('createdAt')}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRiders.map((rider, index) => (
                  <motion.tr
                    key={rider.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#003399] flex items-center justify-center text-white font-semibold">
                          {rider.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{rider.user.name}</p>
                          <p className="text-sm text-gray-600">{rider.user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {rider.user.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            {rider.user.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{rider.zone.name}</p>
                          <p className="text-xs text-gray-600">{rider.zone.campus.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                        <TrendingUp className="w-3 h-3" />
                        {rider.totalDeliveries}
                      </span>
                    </TableCell>
                    <TableCell>
                      {rider.rating ? (
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium text-gray-900">
                            {rider.rating.toFixed(1)}
                          </span>
                          <span className="text-yellow-500">★</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No rating</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <RiderAvailabilityToggle
                        riderId={rider.id}
                        currentAvailability={rider.isAvailable}
                        riderName={rider.user.name}
                        onSuccess={(newAvailability) =>
                          handleAvailabilityUpdate(rider.id, newAvailability)
                        }
                        variant="compact"
                        showLabel={false}
                      />
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {new Date(rider.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Add Rider Modal - Placeholder */}
      <AnimatePresence>
        {showAddRiderModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddRiderModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Add New Rider</h3>
                <button
                  onClick={() => setShowAddRiderModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600">
                  Add rider form will be implemented here with user selection and zone
                  assignment.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
