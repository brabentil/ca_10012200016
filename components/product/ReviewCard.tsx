'use client';

import { motion } from 'framer-motion';
import { Star, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import VerifiedPurchaseBadge from './VerifiedPurchaseBadge';

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    user: {
      id: string;
      name: string;
    };
  };
  showVerifiedBadge?: boolean;
  className?: string;
}

export default function ReviewCard({
  review,
  showVerifiedBadge = true,
  className = '',
}: ReviewCardProps) {
  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get user initials
  const getInitials = (name: string): string => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="p-6 hover:shadow-md transition-shadow">
        <div className="flex gap-4">
          {/* User Avatar */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
              {getInitials(review.user.name)}
            </div>
          </div>

          {/* Review Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{review.user.name}</h4>
                <p className="text-sm text-gray-600">{formatDate(review.createdAt)}</p>
              </div>
              
              {showVerifiedBadge && (
                <VerifiedPurchaseBadge size="sm" />
              )}
            </div>

            {/* Star Rating */}
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= review.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="ml-2 text-sm font-medium text-gray-700">
                {review.rating}.0
              </span>
            </div>

            {/* Comment */}
            {review.comment && (
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {review.comment}
              </p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
