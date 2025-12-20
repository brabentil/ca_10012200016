'use client';

import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import Image from 'next/image';

export default function Banner() {
  const bannerImages = [
    {
      src: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&h=600&fit=crop',
      alt: 'AI-Powered Style Matching',
      title: 'AI Style Matcher',
      description: 'Find your perfect match with our intelligent visual search technology',
      badge: 'NEW',
    },
    {
      src: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&h=600&fit=crop',
      alt: 'Campus Delivery Zones',
      title: 'Smart Campus Delivery',
      description: 'Zone-based delivery system for fast, affordable shipping across campus',
      badge: 'INNOVATIVE',
    },
    {
      src: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920&h=600&fit=crop',
      alt: 'Quality Assurance',
      title: 'Verified Quality',
      description: 'Every item inspected and condition-graded for your confidence',
      badge: 'TRUSTED',
    },
  ];

  return (
    <div className="relative">
      <Carousel
        autoPlay
        infiniteLoop
        showStatus={false}
        showIndicators={false}
        showThumbs={false}
        interval={3000}
        transitionTime={500}
        swipeable
        emulateTouch
      >
        {bannerImages.map((image, index) => (
          <div key={index} className="relative h-[400px] md:h-[500px] lg:h-[600px]">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority={index === 0}
              className="object-cover"
              sizes="100vw"
            />
            {/* Feature Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent">
              <div className="max-w-screen-2xl mx-auto px-6 md:px-12 h-full flex items-center pb-24 relative z-10">
                <div className="max-w-2xl">
                  <span className="inline-block px-4 py-2 bg-secondary-500 text-black font-bold text-sm rounded-full mb-3 shadow-lg">
                    {image.badge}
                  </span>
                  <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight drop-shadow-2xl">
                    {image.title}
                  </h2>
                  <p className="text-sm md:text-base lg:text-lg text-white drop-shadow-lg max-w-xl">
                    {image.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Carousel>
      {/* Gradient fade to products */}
      <div className="w-full h-32 bg-gradient-to-t from-gray-50 to-transparent absolute bottom-0 z-20"></div>
    </div>
  );
}
