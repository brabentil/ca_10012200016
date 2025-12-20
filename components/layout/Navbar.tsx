'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  LogOut, 
  Package, 
  Heart,
  Settings,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/stores/auth';
import { useCartStore } from '@/lib/stores/cart';
import { toast } from 'sonner';
import SearchBar from '@/components/layout/SearchBar';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register') || pathname?.startsWith('/verify');

  // Don't show navbar on auth pages
  if (isAuthPage) {
    return null;
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg'
            : 'bg-white border-b border-gray-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">ThriftHub</h1>
                <p className="text-[10px] text-gray-500 font-medium -mt-0.5">Sustainable Campus Fashion</p>
              </div>
            </Link>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <SearchBar className="w-full" />
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              {/* AI Style Match */}
              <Link href="/style-match">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-2 border-secondary-200 text-secondary-700 hover:bg-secondary-50 hover:border-secondary-300"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="font-semibold">AI Match</span>
                </Button>
              </Link>

              {/* Cart */}
              <Link href="/cart">
                <Button
                  variant="outline"
                  className="relative flex items-center gap-2 border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50"
                >
                  <ShoppingCart className="w-5 h-5 text-gray-700" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-secondary-500 to-secondary-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                      {itemCount > 9 ? '9+' : itemCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* User Menu */}
              {isAuthenticated && user ? (
                <div className="relative user-menu-container">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsUserMenuOpen(!isUserMenuOpen);
                    }}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-gray-900">{user.first_name}</p>
                      <p className="text-xs text-gray-500">My Account</p>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border-2 border-gray-100 overflow-hidden"
                      >
                        <div className="p-4 bg-gradient-to-br from-primary-50 to-secondary-50 border-b border-gray-200">
                          <p className="font-bold text-gray-900">{user.first_name} {user.last_name}</p>
                          <p className="text-sm text-gray-600 truncate">{user.email}</p>
                        </div>
                        <div className="py-2">
                          <Link
                            href="/profile"
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                          >
                            <User className="w-5 h-5 text-gray-600" />
                            <span className="font-medium text-gray-700">My Profile</span>
                          </Link>
                          <Link
                            href="/orders"
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                          >
                            <Package className="w-5 h-5 text-gray-600" />
                            <span className="font-medium text-gray-700">My Orders</span>
                          </Link>
                          <Link
                            href="/wishlist"
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                          >
                            <Heart className="w-5 h-5 text-gray-600" />
                            <span className="font-medium text-gray-700">Wishlist</span>
                          </Link>
                          <Link
                            href="/profile"
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                          >
                            <Settings className="w-5 h-5 text-gray-600" />
                            <span className="font-medium text-gray-700">Settings</span>
                          </Link>
                        </div>
                        <div className="border-t border-gray-200">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-red-600"
                          >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/login">
                    <Button
                      variant="outline"
                      className="border-2 border-primary-200 text-primary-700 hover:bg-primary-50 hover:border-primary-300 font-semibold"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white font-semibold shadow-lg">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden pb-4">
            <SearchBar className="w-full" />
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-white shadow-2xl z-50 md:hidden overflow-y-auto"
            >
              <div className="p-6">
                {/* Close Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-6 h-6 text-gray-700" />
                </button>

                {/* User Info */}
                {isAuthenticated && user ? (
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                        {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{user.first_name} {user.last_name}</p>
                        <p className="text-sm text-gray-600 truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <Link href="/login">
                      <Button className="w-full mb-3 bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white font-semibold shadow-lg">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button variant="outline" className="w-full border-2 border-primary-200 text-primary-700 hover:bg-primary-50 font-semibold">
                        Create Account
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="space-y-2 mb-6">
                  <Link
                    href="/style-match"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary-50 transition-colors"
                  >
                    <Sparkles className="w-5 h-5 text-secondary-600" />
                    <span className="font-semibold text-gray-700">AI Style Match</span>
                  </Link>
                  <Link
                    href="/cart"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ShoppingCart className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-700">Cart</span>
                    {itemCount > 0 && (
                      <span className="ml-auto w-6 h-6 bg-secondary-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                  </Link>
                </div>

                {/* Menu Items */}
                {isAuthenticated && user && (
                  <>
                    <div className="space-y-2 mb-6 pb-6 border-b border-gray-200">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <User className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-700">My Profile</span>
                      </Link>
                      <Link
                        href="/orders"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Package className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-700">My Orders</span>
                      </Link>
                      <Link
                        href="/wishlist"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Heart className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-700">Wishlist</span>
                      </Link>
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-700">Settings</span>
                      </Link>
                    </div>

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors text-red-600"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-16"></div>
    </>
  );
}
