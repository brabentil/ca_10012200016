'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Loader2,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  Star,
  X,
  CheckCircle2,
  Clock,
  XCircle,
  Shield,
  Bike,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';

type SortField = 'name' | 'email' | 'role' | 'orders' | 'createdAt';
type SortOrder = 'asc' | 'desc';
type RoleFilter = '' | 'STUDENT' | 'ADMIN' | 'RIDER';
type VerificationFilter = '' | 'PENDING' | 'VERIFIED' | 'REJECTED';

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  verification: {
    eduEmail: string;
    studentId: string;
    campus: string;
    status: string;
    verifiedAt: string | null;
  } | null;
  riderInfo: {
    id: string;
    isAvailable: boolean;
    totalDeliveries: number;
    rating: number | null;
    zone: {
      code: string;
      name: string;
    };
  } | null;
  stats: {
    totalOrders: number;
    totalReviews: number;
    wishlistItems: number;
  };
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/**
 * Admin Users Management Page
 * View and manage user accounts
 */
export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('');
  const [verificationFilter, setVerificationFilter] = useState<VerificationFilter>('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 20,
    pages: 0,
  });

  /**
   * Fetch users with filters and pagination
   */
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: currentPage,
        limit: 20,
      };

      if (roleFilter) params.role = roleFilter;
      if (verificationFilter) params.verificationStatus = verificationFilter;

      const response = await apiClient.get('/admin/users', { params });
      
      if (response.data.success && response.data.data) {
        setUsers(response.data.data);
        setPagination(response.data.pagination || {
          total: response.data.data.length,
          page: currentPage,
          limit: 20,
          pages: 1,
        });
      } else {
        setUsers([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter, verificationFilter]);

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
   * Filtered and sorted users (client-side for search)
   */
  const filteredUsers = useMemo(() => {
    let filtered = [...users];

    // Apply search filter (client-side)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.firstName.toLowerCase().includes(query) ||
          user.lastName.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          (user.verification?.campus || '').toLowerCase().includes(query)
      );
    }

    // Apply sorting (client-side)
    filtered.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortField) {
        case 'name':
          aVal = `${a.firstName} ${a.lastName}`.toLowerCase();
          bVal = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case 'email':
          aVal = a.email.toLowerCase();
          bVal = b.email.toLowerCase();
          break;
        case 'role':
          aVal = a.role;
          bVal = b.role;
          break;
        case 'orders':
          aVal = a.stats.totalOrders;
          bVal = b.stats.totalOrders;
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
  }, [users, searchQuery, sortField, sortOrder]);

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
   * Get role badge
   */
  const getRoleBadge = (role: string) => {
    const badges = {
      STUDENT: {
        icon: GraduationCap,
        className: 'bg-blue-50 text-blue-700',
        label: 'Student',
      },
      RIDER: {
        icon: Bike,
        className: 'bg-green-50 text-green-700',
        label: 'Rider',
      },
      ADMIN: {
        icon: Shield,
        className: 'bg-purple-50 text-purple-700',
        label: 'Admin',
      },
    };

    const badge = badges[role as keyof typeof badges] || badges.STUDENT;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${badge.className}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  /**
   * Get verification status badge
   */
  const getVerificationBadge = (status: string) => {
    const badges = {
      VERIFIED: {
        icon: CheckCircle2,
        className: 'bg-green-50 text-green-700',
        label: 'Verified',
      },
      PENDING: {
        icon: Clock,
        className: 'bg-yellow-50 text-yellow-700',
        label: 'Pending',
      },
      REJECTED: {
        icon: XCircle,
        className: 'bg-red-50 text-red-700',
        label: 'Rejected',
      },
    };

    const badge = badges[status as keyof typeof badges];
    if (!badge) return null;

    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  /**
   * Statistics
   */
  const stats = useMemo(() => {
    const studentCount = users.filter((u) => u.role === 'STUDENT').length;
    const riderCount = users.filter((u) => u.role === 'RIDER').length;
    const adminCount = users.filter((u) => u.role === 'ADMIN').length;
    const verifiedCount = users.filter(
      (u) => u.verification && u.verification.status === 'VERIFIED'
    ).length;
    const totalOrders = users.reduce((sum, u) => sum + u.stats.totalOrders, 0);

    return { studentCount, riderCount, adminCount, verifiedCount, totalOrders };
  }, [users]);

  /**
   * Handle page change
   */
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setCurrentPage(newPage);
    }
  };

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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{pagination.total}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="w-6 h-6 text-[#003399]" />
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
              <p className="text-sm text-gray-600 font-medium">Students</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.studentCount}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <GraduationCap className="w-6 h-6 text-blue-600" />
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
              <p className="text-sm text-gray-600 font-medium">Riders</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.riderCount}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Bike className="w-6 h-6 text-green-600" />
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
              <p className="text-sm text-gray-600 font-medium">Verified</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.verifiedCount}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalOrders}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-orange-600" />
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
              placeholder="Search users by name, email, or campus..."
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
                  {/* Role Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <select
                      value={roleFilter}
                      onChange={(e) => {
                        setRoleFilter(e.target.value as RoleFilter);
                        setCurrentPage(1); // Reset to first page
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003399]"
                    >
                      <option value="">All Roles</option>
                      <option value="STUDENT">Student</option>
                      <option value="RIDER">Rider</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>

                  {/* Verification Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Verification Status
                    </label>
                    <select
                      value={verificationFilter}
                      onChange={(e) => {
                        setVerificationFilter(e.target.value as VerificationFilter);
                        setCurrentPage(1); // Reset to first page
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003399]"
                    >
                      <option value="">All Status</option>
                      <option value="VERIFIED">Verified</option>
                      <option value="PENDING">Pending</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Clear Filters */}
                {(searchQuery || roleFilter || verificationFilter) && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => {
                      setSearchQuery('');
                      setRoleFilter('');
                      setVerificationFilter('');
                      setCurrentPage(1);
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

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#003399] animate-spin" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-lg font-medium text-gray-900">No users found</p>
            <p className="text-sm text-gray-600 mt-1">
              {searchQuery || roleFilter || verificationFilter
                ? 'Try adjusting your filters'
                : 'No users registered yet'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50 select-none"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-2">
                        User
                        {getSortIcon('name')}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50 select-none"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center gap-2">
                        Contact
                        {getSortIcon('email')}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50 select-none"
                      onClick={() => handleSort('role')}
                    >
                      <div className="flex items-center gap-2">
                        Role
                        {getSortIcon('role')}
                      </div>
                    </TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50 select-none"
                      onClick={() => handleSort('orders')}
                    >
                      <div className="flex items-center gap-2">
                        Activity
                        {getSortIcon('orders')}
                      </div>
                    </TableHead>
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
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#003399] flex items-center justify-center text-white font-semibold">
                            {user.firstName.charAt(0).toUpperCase()}
                            {user.lastName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </p>
                            {user.verification && (
                              <p className="text-xs text-gray-600">
                                {user.verification.campus}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-4 h-4" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          {getRoleBadge(user.role)}
                          {user.riderInfo && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <MapPin className="w-3 h-3" />
                              {user.riderInfo.zone.name}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.verification ? (
                          <div className="space-y-1">
                            {getVerificationBadge(user.verification.status)}
                            {user.verification.status === 'VERIFIED' && (
                              <p className="text-xs text-gray-600">
                                {user.verification.eduEmail}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {user.stats.totalOrders} orders
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {user.stats.totalReviews} reviews
                            </span>
                          </div>
                          {user.riderInfo && (
                            <div className="flex items-center gap-2">
                              <Bike className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {user.riderInfo.totalDeliveries} deliveries
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString('en-US', {
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

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} users
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    whileHover={currentPage !== 1 ? { scale: 1.05 } : {}}
                    whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </motion.button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === pagination.pages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                      )
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2 text-gray-400">...</span>
                          )}
                          <motion.button
                            onClick={() => handlePageChange(page)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`min-w-[40px] px-3 py-2 rounded-lg font-medium transition-colors ${
                              page === currentPage
                                ? 'bg-[#003399] text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </motion.button>
                        </React.Fragment>
                      ))}
                  </div>

                  <motion.button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.pages}
                    whileHover={currentPage !== pagination.pages ? { scale: 1.05 } : {}}
                    whileTap={currentPage !== pagination.pages ? { scale: 0.95 } : {}}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
