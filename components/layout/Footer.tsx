'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="w-full h-20 bg-primary-700 text-gray-300 flex items-center justify-center gap-4">
      <ShoppingCart className="w-8 h-8" />
      <p className="text-sm -mt-4">
        All rights reserved{' '}
        <Link
          className="hover:text-white hover:underline decoration-[1px] cursor-pointer duration-300"
          href="/"
        >
          @ThriftHub {currentYear}
        </Link>
      </p>
    </div>
  );
}
