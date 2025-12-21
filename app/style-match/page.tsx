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
              <h1 className="text-4xl md:text-5xl font-bold flex items-center gap-3">
                <Sparkles className="w-10 h-10" />
                AI Style Matcher
              </h1>
            </motion.div>
          </div>
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
                      Upload an image to start
                    </h3>
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
      </div>
      <Footer />
    </>
  );
}
