'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Bike,
  Menu,
  X,
  ChevronLeft,
  LogOut,
  Settings,
  BarChart3,
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth';
import { toast } from 'sonner';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Products',
    href: '/admin/products',
    icon: Package,
  },
  {
    name: 'Orders',
    href: '/admin/orders',
    icon: ShoppingBag,
  },
  {
    name: 'Riders',
    href: '/admin/riders',
    icon: Bike,
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
];

/**
 * AdminLayout Component
 * Sidebar navigation layout for admin dashboard
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle client-side mount to avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
          <h1 className="text-lg font-bold text-[#003399]">ThriftHub Admin</h1>
        </div>
        
        {/* User Profile - Mobile */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#003399] flex items-center justify-center text-white text-sm font-semibold">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarOpen ? 256 : 80,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:flex fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex-col z-50"
      >
        {/* Logo & Toggle */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <AnimatePresence mode="wait">
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-lg bg-[#003399] flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-[#003399]">ThriftHub</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors ml-auto"
          >
            <ChevronLeft
              className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${
                !sidebarOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-6 px-3">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-3 rounded-lg transition-all
                      ${
                        active
                          ? 'bg-[#003399] text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100'
                      }
                      ${!sidebarOpen ? 'justify-center' : ''}
                    `}
                  >
                    <Icon className={`w-5 h-5 ${!sidebarOpen ? '' : 'flex-shrink-0'}`} />
                    <AnimatePresence mode="wait">
                      {sidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="font-medium whitespace-nowrap overflow-hidden"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile & Logout */}
        <div className="border-t border-gray-200 p-4">
          {/* Settings */}
          <Link
            href="/admin/settings"
            className={`
              flex items-center gap-3 px-3 py-2 rounded-lg transition-colors mb-2
              ${
                pathname === '/admin/settings'
                  ? 'bg-[#003399] text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }
              ${!sidebarOpen ? 'justify-center' : ''}
            `}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence mode="wait">
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-medium whitespace-nowrap"
                >
                  Settings
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* User Info */}
          {sidebarOpen && user && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-3 py-2 mb-2"
            >
              <p className="text-xs font-medium text-gray-500 mb-1">Logged in as</p>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </motion.div>
          )}

          {/* User Avatar (collapsed) */}
          {!sidebarOpen && user && (
            <div className="flex justify-center mb-2">
              <div className="w-10 h-10 rounded-full bg-[#003399] flex items-center justify-center text-white text-sm font-semibold">
                {user.first_name?.[0]}{user.last_name?.[0]}
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 px-3 py-2 rounded-lg
              text-red-600 hover:bg-red-50 transition-colors
              ${!sidebarOpen ? 'justify-center' : ''}
            `}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence mode="wait">
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-medium whitespace-nowrap"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />

            {/* Mobile Sidebar */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 h-screen w-72 bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#003399] flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg font-bold text-[#003399]">ThriftHub</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto py-6 px-3">
                <ul className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`
                            flex items-center gap-3 px-3 py-3 rounded-lg transition-all
                            ${
                              active
                                ? 'bg-[#003399] text-white shadow-md'
                                : 'text-gray-700 hover:bg-gray-100'
                            }
                          `}
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          <span className="font-medium">{item.name}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* User Profile & Logout */}
              <div className="border-t border-gray-200 p-4">
                {/* Settings */}
                <Link
                  href="/admin/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg transition-colors mb-3
                    ${
                      pathname === '/admin/settings'
                        ? 'bg-[#003399] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Settings className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">Settings</span>
                </Link>

                {/* User Info */}
                {user && (
                  <div className="px-3 py-2 mb-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">Logged in as</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                )}

                {/* Logout Button */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main
        className="min-h-screen pt-16 lg:pt-0 transition-all duration-300"
        style={{
          marginLeft: mounted ? (sidebarOpen ? '256px' : '80px') : '0',
        }}
      >
        <div className="p-6 lg:ml-0">
          {children}
        </div>
      </main>
    </div>
  );
}
