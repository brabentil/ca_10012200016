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
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/stores/cart';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';
import { formatPrice, formatDate } from '@/lib/utils';

interface Product {
  product_id: number;
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

  const handleAddToCart = () => {
    if (!product) return;
    
    addItem({
      cart_item_id: Date.now(),
      product_id: product.product_id,
      product_name: product.name,
      price: product.price,
      image_url: product.images[0] || '',
      condition: product.condition,
      quantity: quantity,
    });
    
    toast.success('Added to cart!');
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
      <div className="bg-white border-b-2 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm"
          >
            <Link href="/" className="text-gray-600 hover:text-primary-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href="/products" className="text-gray-600 hover:text-primary-600 transition-colors">
              Products
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href={`/products?category=${product.category}`} className="text-gray-600 hover:text-primary-600 transition-colors">
              {product.category}
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-semibold truncate">{product.name}</span>
          </motion.nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ProductImageGallery images={product.images} productName={product.name} />
          </motion.div>

          {/* Right Column - Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Title & Price */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                {product.average_rating && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(product.average_rating!)
                              ? 'fill-secondary-500 text-secondary-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      {product.average_rating.toFixed(1)} ({product.total_reviews} reviews)
                    </span>
                  </div>
                )}
              </div>
              <div className="text-4xl font-bold text-primary-600 mb-2">
                {formatPrice(product.price)}
              </div>
              <p className="text-sm text-gray-600">
                Listed on {formatDate(product.created_at)}
              </p>
            </div>

            {/* Availability Status */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${
              product.is_available
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <Package className="w-5 h-5" />
              <span className="font-semibold">
                {product.is_available ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            {/* Quick Info */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {product.category && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Category</p>
                    <p className="font-semibold text-gray-900">{product.category}</p>
                  </div>
                )}
                {product.size && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Size</p>
                    <p className="font-semibold text-gray-900">{product.size}</p>
                  </div>
                )}
                {product.color && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Color</p>
                    <p className="font-semibold text-gray-900">{product.color}</p>
                  </div>
                )}
                {product.brand && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Brand</p>
                    <p className="font-semibold text-gray-900">{product.brand}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleAddToCart}
                disabled={!product.is_available}
                className="w-full h-14 bg-secondary-500 hover:bg-secondary-600 text-white font-semibold text-lg border-2 border-secondary-500 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleWishlistToggle}
                  className={`h-12 font-semibold border-2 rounded-xl transition-all ${
                    isWishlisted
                      ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Heart className={`w-5 h-5 mr-2 ${isWishlisted ? 'fill-red-600' : ''}`} />
                  {isWishlisted ? 'Saved' : 'Save'}
                </Button>

                <Button
                  onClick={handleShare}
                  className="h-12 bg-white text-gray-700 font-semibold border-2 border-gray-200 hover:border-gray-300 rounded-xl transition-all"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-primary-50 border-2 border-primary-200 rounded-xl p-4 text-center">
                <Truck className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-gray-900">Campus Delivery</p>
                <p className="text-xs text-gray-600">Under 2 hours</p>
              </div>
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
                <Shield className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-gray-900">Secure Payment</p>
                <p className="text-xs text-gray-600">Protected</p>
              </div>
              <div className="bg-secondary-50 border-2 border-secondary-200 rounded-xl p-4 text-center">
                <Package className="w-6 h-6 text-secondary-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-gray-900">Quality Check</p>
                <p className="text-xs text-gray-600">Verified</p>
              </div>
            </div>

            {/* Seller Info */}
            {product.seller && (
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Seller Information</h3>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-primary-600">
                        {product.seller.first_name[0]}{product.seller.last_name[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {product.seller.first_name} {product.seller.last_name}
                      </p>
                      {product.seller.is_verified && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600">
                          <Shield className="w-3 h-3" />
                          Verified Student
                        </span>
                      )}
                      {product.seller.total_sales && (
                        <p className="text-sm text-gray-600">
                          {product.seller.total_sales} sales
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => router.push(`/sellers/${product.seller_id}`)}
                    className="bg-primary-50 text-primary-700 font-semibold border-2 border-primary-200 hover:bg-primary-100 rounded-lg px-4 py-2"
                  >
                    View Profile
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Product Details Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12"
        >
          <ProductDetails
            description={product.description}
            category={product.category}
            size={product.size}
            color={product.color}
            brand={product.brand}
            material={product.material}
            condition={product.condition}
            measurements={product.measurements}
            careInstructions={product.care_instructions}
            additionalInfo={product.additional_info}
            seller={product.seller ? {
              name: `${product.seller.first_name} ${product.seller.last_name}`,
              is_verified: product.seller.is_verified,
              total_sales: product.seller.total_sales
            } : undefined}
            dateAdded={product.created_at}
          />
        </motion.div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12"
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
