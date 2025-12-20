import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'thrifthub-product-images.s3.eu-north-1.amazonaws.com',
        port: '',
        pathname: '/products/**',
      },
    ],
  },
};

export default nextConfig;
