'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface ReviewFormProps {
  productId: string;
  productTitle: string;
  onSuccess?: () => void;
  className?: string;
}

export default function ReviewForm({
  productId,
  productTitle,
  onSuccess,
  className = '',
}: ReviewFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        toast.error('Please login to submit a review');
        return;
      }

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          rating,
          comment: comment.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitted(true);
        toast.success('Review submitted successfully!');
        
        // Reset form
        setTimeout(() => {
          setRating(0);
          setComment('');
          setSubmitted(false);
          onSuccess?.();
        }, 2000);
      } else {
        // Handle specific error cases
        if (data.code === 'REVIEW_EXISTS') {
          toast.error('You have already reviewed this product');
        } else if (data.code === 'PURCHASE_REQUIRED') {
          toast.error('You can only review products you have purchased');
        } else if (data.code === 'VALIDATION_ERROR') {
          toast.error(data.errors?.[0]?.message || 'Invalid review data');
        } else {
          toast.error(data.message || 'Failed to submit review');
        }
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={className}
      >
        <Card className="p-8 text-center bg-green-50 border-green-200">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle className="w-8 h-8 text-green-600" />
          </motion.div>
          <h3 className="text-xl font-bold text-green-900 mb-2">
            Thank You for Your Review!
          </h3>
          <p className="text-green-700">
            Your feedback helps others make informed decisions.
          </p>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="overflow-hidden">
        <div className="bg-primary-600 px-6 py-4">
          <h3 className="text-white font-bold text-lg">Write a Review</h3>
          <p className="text-primary-100 text-sm mt-1">{productTitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Star Rating */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 hover:text-gray-400'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="ml-2 text-sm font-medium text-gray-700"
                >
                  {rating}.0 {rating === 5 ? '(Excellent!)' : rating >= 4 ? '(Great!)' : rating >= 3 ? '(Good)' : rating >= 2 ? '(Fair)' : '(Poor)'}
                </motion.span>
              )}
            </div>
            {rating === 0 && (
              <p className="text-xs text-gray-600 mt-2">
                Click the stars to rate your experience
              </p>
            )}
          </div>

          {/* Comment Textarea */}
          <div>
            <label htmlFor="comment" className="block text-sm font-semibold text-gray-900 mb-2">
              Your Review (Optional)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this product..."
              rows={5}
              maxLength={1000}
              className="
                w-full px-4 py-3 
                border-2 border-gray-200 rounded-lg
                focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none
                transition-colors
                text-gray-900 placeholder-gray-500
                resize-none
              "
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-600">
                Help others by sharing your honest thoughts
              </p>
              <span className="text-xs text-gray-500">
                {comment.length}/1000
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={loading || rating === 0}
              className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Star className="w-4 h-4 mr-2" />
                  Submit Review
                </>
              )}
            </Button>
          </div>

          {/* Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Review Guidelines</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Be honest and constructive in your feedback</li>
              <li>• Focus on your personal experience with the product</li>
              <li>• Avoid inappropriate language or personal information</li>
              <li>• You can only review products you have purchased</li>
            </ul>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}
