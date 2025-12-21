'use client';

import { motion } from 'framer-motion';
import { MapPin, Navigation } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface CampusZone {
  code: string;
  name: string;
}

interface DeliveryMapProps {
  currentZone?: CampusZone;
  className?: string;
}

export default function DeliveryMap({
  currentZone,
  className = '',
}: DeliveryMapProps) {
  
  // Predefined campus zones with approximate coordinates for visualization
  const campusZones = [
    { code: 'ZONE-A', name: 'North Campus', color: 'bg-blue-500', position: { top: '15%', left: '30%' } },
    { code: 'ZONE-B', name: 'South Campus', color: 'bg-green-500', position: { top: '70%', left: '35%' } },
    { code: 'ZONE-C', name: 'East Campus', color: 'bg-purple-500', position: { top: '40%', left: '70%' } },
    { code: 'ZONE-D', name: 'West Campus', color: 'bg-orange-500', position: { top: '45%', left: '10%' } },
    { code: 'ZONE-E', name: 'Central Campus', color: 'bg-red-500', position: { top: '45%', left: '45%' } },
  ];

  const isActiveZone = (zoneCode: string) => {
    return currentZone?.code === zoneCode;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${className}`}
    >
      <Card className="overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-700 px-6 py-4">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-white" />
            <h3 className="text-white font-bold text-lg">Campus Delivery Map</h3>
          </div>
        </div>

        {/* Map Container */}
        <div className="p-6">
          {/* Current Zone Display */}
          {currentZone && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 bg-primary-50 border border-primary-200 rounded-lg p-3 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-primary-700 font-medium">Delivery Zone</p>
                <p className="text-sm font-bold text-primary-900">
                  {currentZone.name} ({currentZone.code})
                </p>
              </div>
            </motion.div>
          )}

          {/* Static Campus Map Visualization */}
          <div className="relative w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 overflow-hidden">
            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg width="100%" height="100%">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="gray" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Campus Name Label */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-200">
              <p className="text-sm font-bold text-gray-800">University Campus</p>
            </div>

            {/* Zone Markers */}
            {campusZones.map((zone, index) => {
              const isActive = isActiveZone(zone.code);
              
              return (
                <motion.div
                  key={zone.code}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className="absolute"
                  style={{
                    top: zone.position.top,
                    left: zone.position.left,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  {/* Pulsing Ring for Active Zone */}
                  {isActive && (
                    <motion.div
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className={`absolute inset-0 ${zone.color} rounded-full -z-10`}
                      style={{ width: '60px', height: '60px', marginLeft: '-10px', marginTop: '-10px' }}
                    />
                  )}

                  {/* Zone Pin */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={`
                      relative w-10 h-10 ${zone.color} rounded-full shadow-lg
                      flex items-center justify-center cursor-pointer
                      ${isActive ? 'ring-4 ring-white scale-125' : ''}
                      transition-all duration-300
                    `}
                  >
                    <MapPin className="w-5 h-5 text-white" />
                  </motion.div>

                  {/* Zone Label */}
                  <div className={`
                    absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap
                    bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md border
                    ${isActive ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200'}
                  `}>
                    <p className={`text-xs font-bold ${isActive ? 'text-primary-700' : 'text-gray-700'}`}>
                      {zone.name}
                    </p>
                    <p className="text-[10px] text-gray-600">{zone.code}</p>
                  </div>
                </motion.div>
              );
            })}

            {/* Campus Boundary */}
            <div className="absolute inset-4 border-2 border-dashed border-gray-300 rounded-lg pointer-events-none" />
          </div>

          {/* Zone Legend */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {campusZones.map((zone) => {
              const isActive = isActiveZone(zone.code);
              
              return (
                <motion.div
                  key={zone.code}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className={`
                    flex items-center gap-2 p-2 rounded-lg border transition-all
                    ${isActive 
                      ? 'bg-primary-50 border-primary-300 shadow-sm' 
                      : 'bg-gray-50 border-gray-200'
                    }
                  `}
                >
                  <div className={`w-3 h-3 ${zone.color} rounded-full flex-shrink-0`} />
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold truncate ${isActive ? 'text-primary-900' : 'text-gray-700'}`}>
                      {zone.name}
                    </p>
                    <p className="text-[10px] text-gray-600">{zone.code}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Info Note */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <span className="font-semibold">Note:</span> This is a simplified campus map. Your rider knows the exact route to your dorm.
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
