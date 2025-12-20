'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Info } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ImageUploader from '@/components/ai/ImageUploader';
import ImagePreview from '@/components/ai/ImagePreview';
import StyleMatchResults from '@/components/ai/StyleMatchResults';
import { toast } from 'sonner';

interface StyleMatchProduct {
  id: number;
  title: string;
  description: string;
  category: string;
  size: string | null;
  color: string | null;
  brand: string | null;
  condition: 'new' | 'like-new' | 'good' | 'fair';
  price: number;
  stock: number;
  primaryImage: string | null;
  similarityScore: number;
}

export default function StyleMatchPage() {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<StyleMatchProduct[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleImageSelect = async (file: File) => {
    setUploadedImage(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Automatically start search
    await handleSearch(file);
  };

  const handleImageRemove = () => {
    setUploadedImage(null);
    setImagePreviewUrl(null);
    setSearchResults([]);
    setHasSearched(false);
  };

  const handleSearch = async (file?: File) => {
    const imageFile = file || uploadedImage;
    
    if (!imageFile) {
      toast.error('Please upload an image first');
      return;
    }

    setIsSearching(true);
    setHasSearched(false);

    try {
      // Prepare FormData
      const formData = new FormData();
      formData.append('image', imageFile);

      // Get auth token
      const token = localStorage.getItem('accessToken');
      
      // Call API
      const response = await fetch('/api/ai/style-match', {
        method: 'POST',
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {},
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('API Error Response:', data);
        throw new Error(data.error?.message || data.message || 'Failed to search for matches');
      }

      // Set results
      setSearchResults(data.data.matches || []);
      setHasSearched(true);
      
      if (data.data.matches.length === 0) {
        toast.info('No matches found. Try a different image.');
      } else {
        toast.success(`Found ${data.data.matches.length} similar products!`);
      }
    } catch (error: any) {
      console.error('Style match error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      });
      
      const errorMessage = error.message || 'Failed to find matches. Please try again.';
      toast.error(errorMessage);
      
      setSearchResults([]);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <section className="bg-primary-600 text-white py-12">
          <div className="max-w-screen-2xl mx-auto px-6">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center gap-3">
                <Sparkles className="w-10 h-10" />
                AI Style Matcher
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-3xl">
                Upload a photo of your favorite outfit or fashion item, and let our AI find similar styles from our collection.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Info Banner */}
        <section className="max-w-screen-2xl mx-auto px-6 -mt-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3"
          >
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">How it works:</p>
              <ul className="space-y-1 text-blue-800">
                <li>• Upload a clear photo of clothing or fashion items</li>
                <li>• Our AI analyzes style, color, patterns, and design elements</li>
                <li>• Get products ranked by visual similarity</li>
                <li>• Best results with well-lit, focused images (JPG/PNG, max 10MB)</li>
              </ul>
            </div>
          </motion.div>
        </section>

        {/* Main Content */}
        <section className="max-w-screen-2xl mx-auto px-6 py-10">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Upload Section */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="sticky top-24"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {uploadedImage ? 'Your Query Image' : 'Upload Image'}
                </h2>
                
                {!uploadedImage ? (
                  <ImageUploader
                    onImageSelect={handleImageSelect}
                    onImageRemove={handleImageRemove}
                    maxSizeMB={10}
                    acceptedFormats={['image/jpeg', 'image/jpg', 'image/png']}
                  />
                ) : imagePreviewUrl ? (
                  <ImagePreview
                    imageUrl={imagePreviewUrl}
                    imageFile={uploadedImage}
                    onRemove={handleImageRemove}
                    showRemoveButton={!isSearching}
                    title="Query Image"
                    description="AI is analyzing this image to find matches"
                    showMatchingIndicator={isSearching}
                  />
                ) : null}

                {/* Search Again Button */}
                {uploadedImage && hasSearched && !isSearching && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => handleSearch()}
                    className="w-full mt-4 px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    Search Again
                  </motion.button>
                )}
              </motion.div>
            </div>

            {/* Right Column - Results Section */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                {!hasSearched && !isSearching ? (
                  // Initial State
                  <div className="flex flex-col items-center justify-center py-20 px-4">
                    <div className="w-32 h-32 bg-gradient-to-br from-primary-50 to-primary-100 rounded-full flex items-center justify-center mb-6">
                      <Sparkles className="w-16 h-16 text-primary-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Ready to Find Your Style
                    </h3>
                    <p className="text-gray-600 text-center max-w-md">
                      Upload an image to get started. Our AI will instantly search through thousands of products to find your perfect matches.
                    </p>
                  </div>
                ) : (
                  // Results or Loading
                  <StyleMatchResults
                    matches={searchResults}
                    isLoading={isSearching}
                    showTopMatchBanner={true}
                  />
                )}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Tips Section */}
        {!hasSearched && !isSearching && (
          <section className="max-w-screen-2xl mx-auto px-6 pb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="bg-white rounded-xl p-8 shadow-md border border-gray-200"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Tips for Best Results
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-primary-600 mb-2">✓ Do This:</h4>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Use clear, well-lit photos</li>
                    <li>• Focus on the main item</li>
                    <li>• Show the full item if possible</li>
                    <li>• Use images with good contrast</li>
                    <li>• Try different angles for better results</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-orange-600 mb-2">✗ Avoid This:</h4>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Blurry or low-quality images</li>
                    <li>• Multiple items in one photo</li>
                    <li>• Dark or poorly lit photos</li>
                    <li>• Extreme close-ups of patterns</li>
                    <li>• Screenshots with UI elements</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </section>
        )}
      </div>
      <Footer />
    </>
  );
}
