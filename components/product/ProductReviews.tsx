'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Loader2, AlertCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReviewForm from './ReviewForm';
import ReviewCard from './ReviewCard';
import ReviewStats from './ReviewStats';
import { toast } from 'sonner';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

interface ProductReviewsProps {
  productId: string;
  productTitle: string;
  className?: string;
}

export default function ProductReviews({
  productId,
  productTitle,
  className = '',
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState<{ rating: number; count: number }[]>([]);

  // Fetch reviews
  const fetchReviews = async (pageNum: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/reviews/product/${productId}?page=${pageNum}&limit=10`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data = await response.json();

      if (data.success) {
        if (pageNum === 1) {
          setReviews(data.data);
        } else {
          setReviews((prev) => [...prev, ...data.data]);
        }

        setTotalReviews(data.pagination.total);
        setHasMore(data.pagination.page < data.pagination.pages);
        
        // Calculate stats from the response
        // Note: The API should ideally return these stats
        // For now, we'll calculate from fetched reviews
        if (data.data.length > 0) {
          const sum = data.data.reduce((acc: number, r: Review) => acc + r.rating, 0);
          setAverageRating(sum / data.data.length);
          
          // Calculate distribution
          const dist = data.data.reduce((acc: any, r: Review) => {
            acc[r.rating] = (acc[r.rating] || 0) + 1;
            return acc;
          }, {});
          
          setRatingDistribution(
            Object.entries(dist).map(([rating, count]) => ({
              rating: Number(rating),
              count: count as number,
            }))
          );
        }
      } else {
        throw new Error(data.message || 'Failed to fetch reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchReviews(1);
  }, [productId]);

  // Handle review submission success
  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    fetchReviews(1); // Refresh reviews
  };

  // Load more reviews
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReviews(nextPage);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Reviews Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
        <Button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="bg-primary-600 hover:bg-primary-700"
        >
          <Star className="w-4 h-4 mr-2" />
          Write a Review
        </Button>
      </motion.div>

      {/* Review Form */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ReviewForm
              productId={productId}
              productTitle={productTitle}
              onSuccess={handleReviewSuccess}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Stats */}
      {!loading && reviews.length > 0 && (
        <ReviewStats
          averageRating={averageRating}
          totalReviews={totalReviews}
          ratingDistribution={ratingDistribution}
        />
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {loading && page === 1 ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading reviews...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => fetchReviews(1)} variant="outline">
              Try Again
            </Button>
          </div>
        ) : reviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
          >
            <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Reviews Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Be the first to share your experience with this product!
            </p>
            <Button
              onClick={() => setShowReviewForm(true)}
              className="bg-primary-600 hover:bg-primary-700"
            >
              Write the First Review
            </Button>
          </motion.div>
        ) : (
          <>
            <div className="space-y-4">
              {reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ReviewCard review={review} showVerifiedBadge={true} />
                </motion.div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center pt-4">
                <Button
                  onClick={handleLoadMore}
                  variant="outline"
                  className="border-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-2" />
                      Load More Reviews
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* End of Reviews Message */}
            {!hasMore && reviews.length > 5 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-6 text-gray-600 text-sm"
              >
                You've reached the end of reviews
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
