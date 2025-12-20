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
  Menu
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
      <div className="w-full h-20 bg-primary-600 text-white sticky top-0 z-50">
        <div className="h-full w-full mx-auto inline-flex items-center justify-between gap-1 mdl:gap-3 px-4">
          {/* Logo */}
          <Link
            href="/"
            className="px-2 border border-transparent hover:border-white cursor-pointer duration-300 flex items-center justify-center h-[70%]"
          >
            <ShoppingCart className="w-8 h-8 mt-1" />
          </Link>

          {/* Delivery */}
          <div className="px-2 border border-transparent hover:border-white cursor-pointer duration-300 items-center justify-center h-[70%] hidden xl:inline-flex gap-1">
            <MapPin className="w-4 h-4" />
            <div className="text-xs">
              <p>Deliver to</p>
              <p className="text-white font-bold uppercase">Campus</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 h-10 hidden md:inline-flex items-center justify-between relative">
            <input
              onChange={(e) => setSearchQuery(e.target.value)}
              value={searchQuery}
              className="w-full h-full rounded-md px-2 placeholder:text-sm text-base text-black border-[3px] border-transparent outline-none focus-visible:border-secondary-500"
              type="text"
              placeholder="Search ThriftHub products"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(e);
                }
              }}
            />
            <span 
              onClick={handleSearch as any}
              className="w-12 h-full bg-secondary-500 text-black text-2xl flex items-center justify-center absolute right-0 rounded-tr-md rounded-br-md cursor-pointer hover:bg-secondary-600"
            >
              <Search className="w-5 h-5" />
            </span>
          </div>

          {/* Sign In */}
          {isAuthenticated && user ? (
            <div className="text-xs text-gray-100 flex flex-col justify-center px-2 border border-transparent hover:border-white cursor-pointer duration-300 h-[70%]">
              <p>Hello, {user.first_name}</p>
              <p className="text-white font-bold">Account & Lists</p>
            </div>
          ) : (
            <Link href="/login" className="text-xs text-gray-100 flex flex-col justify-center px-2 border border-transparent hover:border-white cursor-pointer duration-300 h-[70%]">
              <p>Hello, sign in</p>
              <p className="text-white font-bold">Account & Lists</p>
            </Link>
          )}

          {/* Sign Out / Register Button */}
          {isAuthenticated && user ? (
            <button
              onClick={handleLogout}
              className="text-xs text-gray-100 flex flex-col justify-center px-2 border border-transparent hover:border-white cursor-pointer duration-300 h-[70%]"
            >
              <p className="text-secondary-400">Sign Out</p>
            </button>
          ) : (
            <Link href="/register" className="text-xs text-gray-100 flex flex-col justify-center px-2 border border-transparent hover:border-white cursor-pointer duration-300 h-[70%]">
              <p className="text-secondary-400">Create Account</p>
            </Link>
          )}

          {/* Favorites */}
          <Link
            href="/wishlist"
            className="text-xs text-gray-100 flex flex-col justify-center px-2 border border-transparent hover:border-white cursor-pointer duration-300 h-[70%] relative hidden lg:flex"
          >
            <p>Marked</p>
            <p className="text-white font-bold">& Favorite</p>
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="flex items-center px-2 border border-transparent hover:border-white cursor-pointer duration-300 h-[70%] relative"
          >
            <ShoppingCart className="w-8 h-8" />
            <p className="text-xs text-white font-bold mt-3">Cart</p>
            {itemCount > 0 && (
              <span className="absolute text-secondary-500 text-sm top-2 left-[29px] font-semibold">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </>
  );
}
