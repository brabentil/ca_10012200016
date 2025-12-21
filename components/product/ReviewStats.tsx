'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ReviewStatsProps {
  averageRating: number;
  totalReviews: number;
  ratingDistribution?: {
    rating: number;
    count: number;
  }[];
  className?: string;
}

export default function ReviewStats({
  averageRating,
  totalReviews,
  ratingDistribution,
  className = '',
}: ReviewStatsProps) {
  // Calculate percentage for each rating
  const getRatingPercentage = (count: number): number => {
    if (totalReviews === 0) return 0;
    return (count / totalReviews) * 100;
  };

  // Create full distribution (1-5 stars)
  const fullDistribution = [5, 4, 3, 2, 1].map((rating) => {
    const found = ratingDistribution?.find((r) => r.rating === rating);
    return {
      rating,
      count: found?.count || 0,
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Customer Reviews</h3>

        {/* Average Rating Display */}
        <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-200">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600">
              {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          {/* Rating Distribution */}
          {ratingDistribution && (
            <div className="flex-1 space-y-2">
              {fullDistribution.map(({ rating, count }) => {
                const percentage = getRatingPercentage(count);
                
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-12">
                      <span className="text-sm font-medium text-gray-700">{rating}</span>
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    </div>
                    
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: rating * 0.05 }}
                        className="h-full bg-yellow-400 rounded-full"
                      />
                    </div>
                    
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
