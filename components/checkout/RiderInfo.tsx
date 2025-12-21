'use client';

import { motion } from 'framer-motion';
import { User, Phone, MapPin, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface RiderInfoProps {
  rider?: {
    id: string;
    name: string;
    phone: string;
    zone: {
      code: string;
      name: string;
    };
    rating?: number;
    totalDeliveries?: number;
  } | null;
  compact?: boolean;
  className?: string;
}

export default function RiderInfo({
  rider,
  compact = false,
  className = '',
}: RiderInfoProps) {
  
  if (!rider) {
    // No rider assigned yet
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${className}`}
      >
        <Card className="p-4 bg-gray-50 border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
              <User className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">
                Rider Not Assigned Yet
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                A rider will be assigned to your order shortly
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  if (compact) {
    // Compact view for lists
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${className}`}
      >
        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
          {/* Rider Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
            {rider.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          
          {/* Rider Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {rider.name}
            </p>
            <p className="text-xs text-gray-600">
              {rider.zone.name}
            </p>
          </div>

          {/* Rating */}
          {rider.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-semibold text-gray-900">
                {rider.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Full card view
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${className}`}
    >
      <Card className="overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 px-6 py-4">
          <h3 className="text-white font-bold text-lg">Your Delivery Rider</h3>
        </div>

        <div className="p-6 space-y-4">
          {/* Rider Profile */}
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0"
            >
              {rider.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </motion.div>

            {/* Info */}
            <div className="flex-1">
              <h4 className="text-lg font-bold text-gray-900 mb-1">
                {rider.name}
              </h4>
              
              {/* Rating */}
              {rider.rating && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(rider.rating!)
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-300 fill-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {rider.rating.toFixed(1)}
                  </span>
                  {rider.totalDeliveries && (
                    <span className="text-xs text-gray-600">
                      ({rider.totalDeliveries} deliveries)
                    </span>
                  )}
                </div>
              )}

              {/* Campus Zone */}
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <MapPin className="w-4 h-4 text-primary-600" />
                <span>
                  <span className="font-semibold">{rider.zone.name}</span>
                  <span className="text-gray-600 ml-1">({rider.zone.code})</span>
                </span>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-1">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Contact Rider</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {rider.phone}
                  </p>
                </div>
              </div>

              {/* Call Button */}
              <a
                href={`tel:${rider.phone}`}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Call
              </a>
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <span className="font-semibold">Tip:</span> Your rider will call you when they arrive at your dorm. Please have your phone ready.
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
