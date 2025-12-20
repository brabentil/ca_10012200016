'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { LucideIcon, ShoppingCart, Heart, Package, Search, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  type?: 'cart' | 'wishlist' | 'orders' | 'search' | 'products' | 'custom';
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  showSecondaryAction?: boolean;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  onSecondaryAction?: () => void;
}

export default function EmptyState({
  type = 'custom',
  title,
  description,
  icon: CustomIcon,
  actionLabel,
  actionHref,
  onAction,
  showSecondaryAction = false,
  secondaryActionLabel,
  secondaryActionHref,
  onSecondaryAction,
}: EmptyStateProps) {
  const router = useRouter();

  // Default configurations for different types
  const typeConfigs = {
    cart: {
      icon: ShoppingCart,
      title: 'Your cart is empty',
      description: 'Add items to your cart to get started with your purchase',
      actionLabel: 'Continue Shopping',
      actionHref: '/products',
      showSecondaryAction: false,
    },
    wishlist: {
      icon: Heart,
      title: 'Your wishlist is empty',
      description: 'Save items you love to your wishlist for later',
      actionLabel: 'Browse Products',
      actionHref: '/products',
      showSecondaryAction: false,
    },
    orders: {
      icon: Package,
      title: 'No orders yet',
      description: "You haven't placed any orders. Start shopping to see your orders here!",
      actionLabel: 'Start Shopping',
      actionHref: '/products',
      showSecondaryAction: false,
    },
    search: {
      icon: Search,
      title: 'No results found',
      description: 'Try adjusting your search or filters to find what you\'re looking for',
      actionLabel: 'Clear Filters',
      actionHref: '/products',
      showSecondaryAction: true,
      secondaryActionLabel: 'Browse All Products',
      secondaryActionHref: '/products',
    },
    products: {
      icon: ShoppingBag,
      title: 'No products available',
      description: 'Check back later for new arrivals and exciting deals',
      actionLabel: 'Go Home',
      actionHref: '/',
      showSecondaryAction: false,
    },
    custom: {
      icon: ShoppingBag,
      title: 'Nothing here yet',
      description: 'Start exploring our products',
      actionLabel: 'Browse Products',
      actionHref: '/products',
      showSecondaryAction: false,
    },
  };

  // Get configuration for the specified type
  const config = typeConfigs[type];

  // Use provided props or fall back to config defaults
  const Icon = CustomIcon || config.icon;
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;
  const displayActionLabel = actionLabel || config.actionLabel;
  const displayActionHref = actionHref || config.actionHref;
  const displayShowSecondaryAction = showSecondaryAction || config.showSecondaryAction;
  const displaySecondaryActionLabel = secondaryActionLabel || ('secondaryActionLabel' in config ? config.secondaryActionLabel : '');
  const displaySecondaryActionHref = secondaryActionHref || ('secondaryActionHref' in config ? config.secondaryActionHref : '');

  // Handle primary action
  const handlePrimaryAction = () => {
    if (onAction) {
      onAction();
    } else if (displayActionHref) {
      router.push(displayActionHref);
    }
  };

  // Handle secondary action
  const handleSecondaryAction = () => {
    if (onSecondaryAction) {
      onSecondaryAction();
    } else if (displaySecondaryActionHref) {
      router.push(displaySecondaryActionHref);
    }
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mx-auto mb-6 relative"
        >
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center relative overflow-hidden">
            {/* Animated background circles */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <Icon className="w-16 h-16 text-gray-400 relative z-10" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3"
        >
          {displayTitle}
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 mb-8 text-sm sm:text-base"
        >
          {displayDescription}
        </motion.p>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          {/* Primary Action */}
          <Button
            onClick={handlePrimaryAction}
            className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold px-8 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {displayActionLabel}
          </Button>

          {/* Secondary Action */}
          {displayShowSecondaryAction && (
            <Button
              onClick={handleSecondaryAction}
              variant="outline"
              className="border-2 border-gray-300 hover:border-primary-600 hover:bg-primary-50 font-semibold px-8"
            >
              {displaySecondaryActionLabel}
            </Button>
          )}
        </motion.div>

        {/* Decorative elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex justify-center gap-2"
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-gray-300 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
