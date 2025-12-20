'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, X, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  onImageRemove?: () => void;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  disabled?: boolean;
}

export default function ImageUploader({
  onImageSelect,
  onImageRemove,
  maxSizeMB = 10,
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png'],
  disabled = false,
}: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Validate file
  const validateFile = (file: File): string | null => {
    // Check file type
    if (!acceptedFormats.includes(file.type)) {
      return `Invalid file type. Please upload ${acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')} images only.`;
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size exceeds ${maxSizeMB}MB limit. Please choose a smaller image.`;
    }

    return null;
  };

  // Process selected file
  const processFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      setIsProcessing(false);
      return;
    }

    try {
      // Create preview URL
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewUrl(result);
        onImageSelect(file);
        setIsProcessing(false);
        toast.success('Image uploaded successfully!');
      };

      reader.onerror = () => {
        setError('Failed to read image file');
        toast.error('Failed to read image file');
        setIsProcessing(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing file:', error);
      setError('Failed to process image');
      toast.error('Failed to process image');
      setIsProcessing(false);
    }
  }, [onImageSelect, acceptedFormats, maxSizeMB]);

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [disabled, processFile]);

  // Handle file input change
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  // Handle remove image
  const handleRemoveImage = useCallback(() => {
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
    if (onImageRemove) {
      onImageRemove();
    }
    toast.success('Image removed');
  }, [onImageRemove]);

  // Handle click to upload
  const handleUploadClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  // Handle camera capture
  const handleCameraClick = () => {
    if (!disabled) {
      cameraInputRef.current?.click();
    }
  };

  return (
    <div className="w-full">
      {/* Preview or Upload Zone */}
      <AnimatePresence mode="wait">
        {previewUrl ? (
          // Image Preview
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            <div className="relative w-full aspect-square max-w-md mx-auto rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg">
              <Image
                src={previewUrl}
                alt="Uploaded image"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 448px"
              />
              
              {/* Remove Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleRemoveImage}
                disabled={disabled}
                className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </motion.button>

              {/* Processing Overlay */}
              {isProcessing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
              )}
            </div>

            {/* Image Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-center"
            >
              <p className="text-sm text-gray-600">
                Image ready for style matching
              </p>
            </motion.div>
          </motion.div>
        ) : (
          // Upload Zone
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleUploadClick}
            className={`
              relative w-full aspect-square max-w-md mx-auto
              border-2 border-dashed rounded-xl
              transition-all duration-300 cursor-pointer
              ${isDragging 
                ? 'border-primary-500 bg-primary-50 scale-105' 
                : 'border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-50/50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${error ? 'border-red-300 bg-red-50' : ''}
            `}
          >
            {/* Upload Icon and Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <motion.div
                animate={{
                  scale: isDragging ? 1.1 : 1,
                  rotate: isDragging ? 5 : 0,
                }}
                transition={{ duration: 0.2 }}
                className={`
                  w-20 h-20 rounded-full flex items-center justify-center mb-4
                  ${isDragging ? 'bg-primary-100' : 'bg-gray-100'}
                  ${error ? 'bg-red-100' : ''}
                `}
              >
                {isProcessing ? (
                  <Loader2 className="h-10 w-10 text-primary-600 animate-spin" />
                ) : error ? (
                  <AlertCircle className="h-10 w-10 text-red-600" />
                ) : (
                  <ImageIcon className={`h-10 w-10 ${isDragging ? 'text-primary-600' : 'text-gray-400'}`} />
                )}
              </motion.div>

              {error ? (
                <>
                  <p className="text-base font-semibold text-red-600 mb-2">Upload Failed</p>
                  <p className="text-sm text-red-500 max-w-xs">{error}</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-semibold text-gray-700 mb-2">
                    {isDragging ? 'Drop your image here' : 'Upload an image'}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Drag and drop or click to browse
                  </p>
                  <p className="text-xs text-gray-400">
                    Supports JPG, PNG up to {maxSizeMB}MB
                  </p>
                </>
              )}

              {/* Decorative Elements */}
              {!error && !isProcessing && (
                <motion.div
                  animate={{
                    opacity: isDragging ? [0.5, 1, 0.5] : 0.3,
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute inset-0 pointer-events-none"
                >
                  <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-primary-300 rounded-tl-lg" />
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary-300 rounded-tr-lg" />
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-primary-300 rounded-bl-lg" />
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-primary-300 rounded-br-lg" />
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      {!previewUrl && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 flex flex-col sm:flex-row gap-3 justify-center"
        >
          {/* File Upload Button */}
          <Button
            onClick={handleUploadClick}
            disabled={disabled || isProcessing}
            className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold px-6 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Upload className="h-4 w-4 mr-2" />
            Choose File
          </Button>

          {/* Camera Capture Button */}
          <Button
            onClick={handleCameraClick}
            disabled={disabled || isProcessing}
            variant="outline"
            className="border-2 border-primary-300 text-primary-700 hover:bg-primary-50 font-semibold px-6"
          >
            <Camera className="h-4 w-4 mr-2" />
            Take Photo
          </Button>
        </motion.div>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Help Text */}
      {!previewUrl && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-gray-500">
            Upload a photo of an item you like, and we'll find similar products in our catalog
          </p>
        </motion.div>
      )}
    </div>
  );
}
