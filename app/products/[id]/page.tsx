'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Star, 
  ChevronRight, 
  Truck, 
  Shield, 
  Package,
  AlertCircle,
  ChevronLeft
} from 'lucide-react';
import ProductImageGallery from '@/components/product/ProductImageGallery';
import ProductDetails from '@/components/product/ProductDetails';
import SimilarProducts from '@/components/product/SimilarProducts';
import ProductReviews from '@/components/product/ProductReviews';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/stores/cart';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';
import { formatPrice, formatDate } from '@/lib/utils';

interface Product {
  product_id: string;
  name: string;
  description: string;
  price: number;
  condition: 'Like New' | 'Good' | 'Fair' | 'Worn';
  images: string[];
  category: string;
  size?: string;
  color?: string;
  brand?: string;
  material?: string;
  seller_id: number;
  seller?: {
    user_id: number;
    first_name: string;
    last_name: string;
    is_verified: boolean;
    total_sales?: number;
  };
  average_rating?: number;
  total_reviews?: number;
  is_available: boolean;
  measurements?: {
    chest?: string;
    waist?: string;
    length?: string;
    shoulder?: string;
  };
  care_instructions?: string[];
  additional_info?: string;
  created_at: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  
  const { addItem } = useCartStore();

  useEffect(() => {
    fetchProduct();
    fetchSimilarProducts();
  }, [productId]);

  const fetchProduct = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/products/${productId}`);
      if (response.data.success) {
        const product = response.data.data;
        
        // Transform backend response to match frontend Product interface
        const transformedProduct: Product = {
          product_id: product.id,
          name: product.title,
          description: product.description,
          price: parseFloat(product.price),
          condition: product.condition === 'LIKE_NEW' ? 'Like New' : 
                    product.condition === 'GOOD' ? 'Good' :
                    product.condition === 'FAIR' ? 'Fair' :
                    product.condition === 'VINTAGE' ? 'Good' : 'Good',
          images: product.images?.map((img: any) => img.imageUrl) || [],
          category: product.category,
          seller_id: product.sellerId || 1,
          is_available: product.stock > 0,
          created_at: product.createdAt,
          size: product.size,
          color: product.color,
          brand: product.brand,
          average_rating: product.averageRating,
          total_reviews: product.reviewCount
        };
        
        setProduct(transformedProduct);
      }
    } catch (error: any) {
      console.error('Error fetching product:', error);
      toast.error(error.response?.data?.message || 'Failed to load product');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSimilarProducts = async () => {
    try {
      // TODO: Create /api/products/[id]/similar endpoint
      // const response = await apiClient.get(`/products/${productId}/similar`);
      // if (response.data.success) {
      //   setSimilarProducts(response.data.data || []);
      // }
      setSimilarProducts([]); // Temporary: No similar products until API is ready
    } catch (error) {
      console.error('Error fetching similar products:', error);
    }
  };

  const handleAddToCart = async () => {
    if (!product || isAddingToCart) return;
    
    setIsAddingToCart(true);
    try {
      const response = await apiClient.post('/cart/items', {
        productId: product.product_id,
        quantity: quantity,
      });
      
      if (response.data.success) {
        toast.success('Added to cart!');
      }
    } catch (error: any) {
      console.error('Add to cart error:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    try {
      if (isWishlisted) {
        await apiClient.delete(`/wishlist/${productId}`);
        toast.success('Removed from wishlist');
      } else {
        await apiClient.post('/wishlist', { product_id: productId });
        toast.success('Added to wishlist');
      }
      setIsWishlisted(!isWishlisted);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update wishlist');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: `Check out ${product?.name} on ThriftHub`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center max-w-md"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Button
            onClick={() => router.push('/products')}
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold border-2 border-primary-600 rounded-lg px-6 py-2"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-300">
        <div className="max-w-screen-xl mx-auto px-4 py-3">
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-xs text-gray-600"
          >
            <Link href="/" className="hover:text-primary-600 hover:underline">
              Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/products" className="hover:text-primary-600 hover:underline">
              Products
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/products?category=${product.category}`} className="hover:text-primary-600 hover:underline">
              {product.category}
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-900">{product.name}</span>
          </motion.nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="w-full grid md:grid-cols-3 gap-4 bg-gray-100 rounded-lg overflow-hidden">
          {/* Left Column - Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center bg-gray-200 rounded-lg relative group"
          >
            <ProductImageGallery images={product.images} productName={product.name} />
            
            {/* Hover Actions */}
            <div className="w-12 h-24 absolute bottom-10 right-0 border border-gray-400 bg-white rounded-md flex flex-col translate-x-20 group-hover:-translate-x-2 transition-transform duration-300">
              <button
                onClick={handleAddToCart}
                disabled={!product.is_available}
                className="w-full h-full border-b border-gray-400 flex items-center justify-center text-xl bg-transparent hover:bg-secondary-500 hover:text-white cursor-pointer duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
              <button
                onClick={handleWishlistToggle}
                className="w-full h-full flex items-center justify-center text-xl bg-transparent hover:bg-secondary-500 hover:text-white cursor-pointer duration-300"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-600 text-red-600' : ''}`} />
              </button>
            </div>
          </motion.div>

          {/* Right Column - Product Info (spans 2 columns) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-2 flex flex-col gap-3 justify-center p-6 bg-white"
          >
            {/* Category & Brand */}
            <p className="text-xs md:text-sm text-primary-600 font-semibold">
              {product.category}{product.brand && `_${product.brand}`}
            </p>
            
            {/* Title */}
            <h1 className="text-xl md:text-3xl tracking-wide font-semibold text-gray-900">
              {product.name}
            </h1>
            
            {/* Rating */}
            {product.average_rating && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.average_rating!)
                          ? 'fill-secondary-500 text-secondary-500'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">({product.total_reviews})</span>
              </div>
            )}
            
            {/* Description */}
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
            
            {/* Price Section */}
            <div className="space-y-2">
              <p className="text-base text-gray-600 flex items-center gap-2">
                Price:
                <span className="text-2xl text-primary-600 font-semibold">
                  {formatPrice(product.price)}
                </span>
              </p>
              
              {/* Availability */}
              <p className={`text-sm font-semibold ${
                product.is_available ? 'text-green-600' : 'text-red-600'
              }`}>
                {product.is_available ? '✓ In Stock' : '✗ Out of Stock'}
              </p>
              
              {/* Product Details Grid */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                {product.size && (
                  <div>
                    <p className="text-xs text-gray-500">Size</p>
                    <p className="text-sm font-medium text-gray-900">{product.size}</p>
                  </div>
                )}
                {product.color && (
                  <div>
                    <p className="text-xs text-gray-500">Color</p>
                    <p className="text-sm font-medium text-gray-900">{product.color}</p>
                  </div>
                )}
                {product.brand && (
                  <div>
                    <p className="text-xs text-gray-500">Brand</p>
                    <p className="text-sm font-medium text-gray-900">{product.brand}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500">Condition</p>
                  <p className="text-sm font-medium text-gray-900">{product.condition}</p>
                </div>
              </div>
              
              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={!product.is_available}
                className="w-full md:w-96 h-12 bg-secondary-500 text-white hover:bg-secondary-600 hover:text-white duration-300 rounded-lg mt-5 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to cart
              </button>
              
              {/* Additional Actions */}
              <div className="flex gap-3 mt-3">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
            
            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-col items-center text-center p-2">
                <Truck className="w-5 h-5 text-primary-600 mb-1" />
                <p className="text-xs font-medium text-gray-900">Campus Delivery</p>
                <p className="text-xs text-gray-500">Under 2hrs</p>
              </div>
              <div className="flex flex-col items-center text-center p-2">
                <Shield className="w-5 h-5 text-green-600 mb-1" />
                <p className="text-xs font-medium text-gray-900">Verified</p>
                <p className="text-xs text-gray-500">Quality Check</p>
              </div>
              <div className="flex flex-col items-center text-center p-2">
                <Package className="w-5 h-5 text-secondary-600 mb-1" />
                <p className="text-xs font-medium text-gray-900">Secure</p>
                <p className="text-xs text-gray-500">Payment</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Product Reviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12"
        >
          <ProductReviews
            productId={params.id as string}
            productTitle={product.name}
          />
        </motion.div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8"
          >
            <SimilarProducts
              products={similarProducts}
              title="Similar Products"
              subtitle="You might also be interested in these items"
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
