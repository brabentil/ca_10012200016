'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/stores/auth';
import { useCartStore } from '@/lib/stores/cart';
import {
  Menu,
  X,
  Home,
  ShoppingBag,
  Search,
  Heart,
  User,
  Package,
  Settings,
  LogOut,
  Sparkles,
  Clock,
  HelpCircle,
  Tag,
  TrendingUp,
  ShoppingCart,
  ChevronRight,
  Bell,
  CreditCard,
} from 'lucide-react';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { itemCount } = useCartStore();

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    router.push('/login');
  };

  const mainNavItems = [
    { icon: Home, label: 'Home', href: '/', badge: null },
    { icon: ShoppingBag, label: 'Shop', href: '/products', badge: null },
    { icon: Search, label: 'AI Style Match', href: '/style-match', badge: 'NEW' },
    { icon: Tag, label: 'Deals', href: '/products?on_sale=true', badge: null },
    { icon: TrendingUp, label: 'New Arrivals', href: '/products?sort=newest', badge: null },
  ];

  const userNavItems = isAuthenticated
    ? [
        { icon: User, label: 'My Profile', href: '/profile' },
        { icon: Package, label: 'My Orders', href: '/orders' },
        { icon: Heart, label: 'Wishlist', href: '/wishlist' },
        { icon: ShoppingCart, label: 'Cart', href: '/cart', badge: itemCount },
        { icon: Bell, label: 'Notifications', href: '/notifications' },
        { icon: CreditCard, label: 'Payday Flex', href: '/payday-flex' },
        { icon: Settings, label: 'Settings', href: '/settings' },
        { icon: HelpCircle, label: 'Help & Support', href: '/help' },
      ]
    : [
        { icon: User, label: 'Sign In', href: '/login' },
        { icon: Sparkles, label: 'Create Account', href: '/register' },
      ];

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Slide-in Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-[85%] max-w-sm bg-white z-50 lg:hidden shadow-2xl overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 px-6 py-5 flex items-center justify-between z-10">
              <Link
                href="/"
                className="flex items-center gap-3 group"
                onClick={() => setIsOpen(false)}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">ThriftHub</h2>
                  <p className="text-[10px] text-primary-200 font-medium">Campus Fashion</p>
                </div>
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* User Info Section */}
            {isAuthenticated && user && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="px-6 py-4 bg-gradient-to-br from-primary-50 to-secondary-50/30 border-b border-gray-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {user.first_name.charAt(0)}
                    {user.last_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">
                      {user.first_name} {user.last_name}
                    </h3>
                    <p className="text-xs text-gray-600 truncate">{user.email}</p>
                  </div>
                </div>
                {user.is_verified && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-semibold text-green-700">Verified Student</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Main Navigation */}
            <div className="px-4 py-4">
              <h3 className="px-2 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Explore
              </h3>
              <nav className="space-y-1">
                {mainNavItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                        pathname === item.href
                          ? 'bg-gradient-to-r from-primary-50 to-secondary-50/30 text-primary-700 shadow-sm'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon
                        className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                          pathname === item.href ? 'text-primary-600' : 'text-gray-500'
                        }`}
                      />
                      <span className="flex-1 font-medium">{item.label}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-[10px] font-bold text-secondary-700 bg-secondary-100 rounded-full">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight
                        className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
                          pathname === item.href ? 'text-primary-600' : 'text-gray-400'
                        }`}
                      />
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </div>

            {/* User Actions */}
            <div className="px-4 py-4 border-t border-gray-200">
              <h3 className="px-2 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                {isAuthenticated ? 'My Account' : 'Get Started'}
              </h3>
              <nav className="space-y-1">
                {userNavItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                        pathname === item.href
                          ? 'bg-gradient-to-r from-primary-50 to-secondary-50/30 text-primary-700 shadow-sm'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon
                        className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                          pathname === item.href ? 'text-primary-600' : 'text-gray-500'
                        }`}
                      />
                      <span className="flex-1 font-medium">{item.label}</span>
                      {'badge' in item && item.badge && item.badge > 0 && (
                        <span className="px-2 py-0.5 text-xs font-bold text-white bg-secondary-500 rounded-full min-w-[20px] text-center">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      )}
                      <ChevronRight
                        className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
                          pathname === item.href ? 'text-primary-600' : 'text-gray-400'
                        }`}
                      />
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </div>

            {/* Logout Button */}
            {isAuthenticated && (
              <div className="px-4 pb-6">
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl transition-colors group"
                >
                  <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                  <span>Log Out</span>
                </motion.button>
              </div>
            )}

            {/* Footer Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="px-6 pb-6 pt-4 border-t border-gray-200"
            >
              <div className="space-y-3">
                {/* Feature Highlights */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-green-600 font-semibold uppercase">AI Search</p>
                      <p className="text-xs text-green-700 font-medium">Photo Match</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-blue-600 font-semibold uppercase">Payday Flex</p>
                      <p className="text-xs text-blue-700 font-medium">Pay Later</p>
                    </div>
                  </div>
                </div>

                {/* App Version */}
                <div className="text-center pt-2">
                  <p className="text-xs text-gray-500">
                    ThriftHub v1.0.0
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    © 2025 All rights reserved
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
