'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductGrid from '@/components/product/ProductGrid';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Banner from '@/components/layout/Banner';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import type { Product } from '@/types/product';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Fetch featured products
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setIsLoadingProducts(true);
        const response = await apiClient.get('/products', {
          params: { limit: 16 }
        });
        // Transform API response to match ProductGrid interface
        const transformedProducts = (response.data.data || []).map((product: any) => ({
          product_id: product.id,
          name: product.title,
          price: parseFloat(product.price),
          condition: product.condition === 'LIKE_NEW' ? 'Like New' : 
                     product.condition === 'GOOD' ? 'Good' : 
                     product.condition === 'FAIR' ? 'Fair' : 
                     product.condition === 'VINTAGE' ? 'Good' : 'Good',
          images: product.images?.map((img: any) => img.imageUrl) || [],
          category: product.category,
          seller_id: null,
          is_available: product.stock > 0
        }));
        setFeaturedProducts(transformedProducts as any);
      } catch (error) {
        console.error('Failed to load featured products:', error);
        toast.error('Failed to load products');
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Banner Section */}
        <Banner />

        {/* Featured Products Section - Overlapping Banner */}
        <section className="max-w-screen-2xl mx-auto px-6 relative md:-mt-20 lgl:-mt-32 xl:-mt-60 z-20 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-6 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-200"
          >
            <div>
              <h2 className="text-3xl font-bold text-primary-600">
                Featured Products
              </h2>
              <p className="text-sm text-gray-600 mt-1">Discover quality pre-loved fashion</p>
            </div>
            <Link href="/products">
              <Button className="bg-primary-600 hover:bg-primary-700 text-white font-semibold">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>

          <ProductGrid
            products={featuredProducts}
            isLoading={isLoadingProducts}
            emptyMessage="No featured products available"
          />
        </section>
      </div>
      <Footer />
    </>
  );
}
