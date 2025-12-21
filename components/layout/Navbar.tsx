'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  ShoppingCart, 
  Heart,
  Search,
  MapPin,
  Menu,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth';
import { useCartStore } from '@/lib/stores/cart';
import { toast } from 'sonner';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register') || pathname?.startsWith('/verify');

  if (isAuthPage) {
    return null;
  }

  return (
    <>
      {/* Main Header */}
      <div className="w-full h-20 bg-primary-600 text-white sticky top-0 z-50 shadow-md">
        <div className="h-full max-w-screen-2xl mx-auto flex items-center justify-between gap-4 px-6">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <ShoppingCart className="w-8 h-8" />
            <span className="text-xl font-bold hidden sm:block">ThriftHub</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl h-10 relative">
            <input
              onChange={(e) => setSearchQuery(e.target.value)}
              value={searchQuery}
              className="w-full h-full rounded-md px-4 placeholder:text-sm text-base text-black border-[3px] border-transparent outline-none focus-visible:border-secondary-500"
              type="text"
              placeholder="Search products..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(e);
                }
              }}
            />
            <button 
              onClick={handleSearch as any}
              className="w-12 h-full bg-secondary-500 text-black flex items-center justify-center absolute right-0 top-0 rounded-tr-md rounded-br-md cursor-pointer hover:bg-secondary-600 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Style Matcher */}
          <Link
            href="/style-match"
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-primary-700 transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-semibold hidden md:block">AI Match</span>
          </Link>

          {/* Account */}
          {isAuthenticated && user ? (
            <Link href="/profile" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-primary-700 transition-colors">
              <div className="text-sm">
                <p className="text-gray-200">Hello, {user.firstName}</p>
                <p className="text-white font-semibold">Account</p>
              </div>
            </Link>
          ) : (
            <Link href="/login" className="px-4 py-2 bg-secondary-500 text-black font-semibold rounded-md hover:bg-secondary-600 transition-colors">
              Sign In
            </Link>
          )}

          {/* Cart */}
          <Link
            href="/cart"
            className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-primary-700 transition-colors relative"
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="text-sm font-semibold">Cart</span>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-secondary-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </>
  );
}
