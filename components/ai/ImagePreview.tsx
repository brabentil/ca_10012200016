'use client';

import { motion } from 'framer-motion';
import { X, Image as ImageIcon, Sparkles, Search } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface ImagePreviewProps {
  imageUrl: string;
  imageFile?: File;
  onRemove?: () => void;
  showRemoveButton?: boolean;
  title?: string;
  description?: string;
  showMatchingIndicator?: boolean;
}

export default function ImagePreview({
  imageUrl,
  imageFile,
  onRemove,
  showRemoveButton = true,
  title = 'Query Image',
  description = 'Finding similar items...',
  showMatchingIndicator = false,
}: ImagePreviewProps) {
  // Get image metadata
  const getImageMetadata = () => {
    if (!imageFile) return null;

    const sizeInMB = (imageFile.size / (1024 * 1024)).toFixed(2);
    const type = imageFile.type.split('/')[1].toUpperCase();

    return {
      size: `${sizeInMB} MB`,
      type,
      name: imageFile.name,
    };
  };

  const metadata = getImageMetadata();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      {/* Title */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-4"
      >
        <div className="flex items-center gap-2 mb-1">
          <div className="bg-primary-100 p-1.5 rounded-lg">
            <ImageIcon className="h-4 w-4 text-primary-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        </div>
        {description && (
          <p className="text-sm text-gray-600 ml-7">{description}</p>
        )}
      </motion.div>

      {/* Image Container */}
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="relative"
      >
        {/* Image */}
        <div className="relative w-full aspect-square max-w-md mx-auto rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg bg-gray-50">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt="Query image for style matching"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 448px"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-16 h-16 text-gray-400" />
            </div>
          )}

          {/* Gradient Overlay (subtle) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />

          {/* Remove Button */}
          {showRemoveButton && onRemove && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onRemove}
              className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </motion.button>
          )}

          {/* Matching Indicator */}
          {showMatchingIndicator && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg"
            >
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  <Search className="h-5 w-5 text-primary-600" />
                </motion.div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    Analyzing style...
                  </p>
                  <p className="text-xs text-gray-600">
                    Finding similar products
                  </p>
                </div>
                <Sparkles className="h-5 w-5 text-yellow-500" />
              </div>

              {/* Progress Bar */}
              <motion.div
                className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden"
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-600"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </motion.div>
            </motion.div>
          )}

          {/* Corner Decorations */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-primary-400 rounded-tl-lg"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-primary-400 rounded-tr-lg"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-primary-400 rounded-bl-lg"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-primary-400 rounded-br-lg"
            />
          </div>
        </div>

        {/* Image Metadata */}
        {metadata && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-4 bg-white rounded-lg border border-gray-200 p-4 max-w-md mx-auto"
          >
            <div className="grid grid-cols-3 gap-4 text-center">
              {/* File Name */}
              <div>
                <p className="text-xs text-gray-500 mb-1">File</p>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {metadata.name}
                </p>
              </div>

              {/* File Type */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Format</p>
                <p className="text-sm font-semibold text-gray-900">
                  {metadata.type}
                </p>
              </div>

              {/* File Size */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Size</p>
                <p className="text-sm font-semibold text-gray-900">
                  {metadata.size}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Hint */}
        {showRemoveButton && onRemove && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-center"
          >
            <p className="text-sm text-gray-500">
              Not the right image?{' '}
              <button
                onClick={onRemove}
                className="text-primary-600 hover:text-primary-700 font-medium hover:underline"
              >
                Upload a different one
              </button>
            </p>
          </motion.div>
        )}

        {/* Decorative Sparkle Effects */}
        {showMatchingIndicator && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-primary-400 rounded-full"
                style={{
                  top: `${20 + i * 15}%`,
                  left: `${10 + i * 20}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Additional Info Banner */}
      {showMatchingIndicator && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-lg p-4 max-w-md mx-auto"
        >
          <div className="flex items-start gap-3">
            <div className="bg-primary-600 rounded-full p-2 shrink-0">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                AI-Powered Style Matching
              </h4>
              <p className="text-xs text-gray-700 leading-relaxed">
                Our AI is analyzing your image to find visually similar products in our catalog. 
                Results will show items that match the style, color, and design.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
