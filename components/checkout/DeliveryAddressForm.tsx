'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Building2, Home, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface CampusZone {
  id: string;
  code: string;
  name: string;
  description?: string;
  deliveryFee: number;
}

interface DeliveryAddressFormProps {
  onAddressChange: (address: DeliveryAddressData) => void;
  initialData?: DeliveryAddressData;
}

export interface DeliveryAddressData {
  campusZone: string;
  dormName: string;
  roomNumber: string;
  additionalInfo?: string;
  deliveryAddress: string; // Complete formatted address
}

// Mock campus zones - in production, fetch from API
const CAMPUS_ZONES: CampusZone[] = [
  { id: '1', code: 'ZONE_A', name: 'Zone A - Main Campus', description: 'Central campus area', deliveryFee: 0 },
  { id: '2', code: 'ZONE_B', name: 'Zone B - North Campus', description: 'Northern residential area', deliveryFee: 5 },
  { id: '3', code: 'ZONE_C', name: 'Zone C - South Campus', description: 'Southern residential area', deliveryFee: 5 },
  { id: '4', code: 'ZONE_D', name: 'Zone D - East Campus', description: 'Eastern residential area', deliveryFee: 8 },
  { id: '5', code: 'ZONE_E', name: 'Zone E - West Campus', description: 'Western residential area', deliveryFee: 8 },
];

export default function DeliveryAddressForm({ 
  onAddressChange, 
  initialData 
}: DeliveryAddressFormProps) {
  const [selectedZone, setSelectedZone] = useState<string>(initialData?.campusZone || '');
  const [dormName, setDormName] = useState(initialData?.dormName || '');
  const [roomNumber, setRoomNumber] = useState(initialData?.roomNumber || '');
  const [additionalInfo, setAdditionalInfo] = useState(initialData?.additionalInfo || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);

  // Validate form and update parent
  useEffect(() => {
    const newErrors: Record<string, string> = {};

    if (!selectedZone) {
      newErrors.campusZone = 'Please select a campus zone';
    }
    if (!dormName.trim()) {
      newErrors.dormName = 'Dormitory name is required';
    }
    if (!roomNumber.trim()) {
      newErrors.roomNumber = 'Room number is required';
    }

    setErrors(newErrors);
    const formIsValid = Object.keys(newErrors).length === 0;
    setIsValid(formIsValid);

    // Only call parent if form is valid
    if (formIsValid) {
      const zone = CAMPUS_ZONES.find(z => z.code === selectedZone);
      const fullAddress = `${dormName}, Room ${roomNumber}, ${zone?.name || selectedZone}${additionalInfo ? ` - ${additionalInfo}` : ''}`;
      
      onAddressChange({
        campusZone: selectedZone,
        dormName: dormName.trim(),
        roomNumber: roomNumber.trim(),
        additionalInfo: additionalInfo.trim() || undefined,
        deliveryAddress: fullAddress,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedZone, dormName, roomNumber, additionalInfo]);

  const selectedZoneData = CAMPUS_ZONES.find(z => z.code === selectedZone);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MapPin className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-bold text-gray-900">Delivery Address</h3>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5"
      >
        {/* Campus Zone Selection */}
        <div className="space-y-3">
          <Label htmlFor="campus-zone" className="text-sm font-bold text-gray-900">
            Campus Zone *
          </Label>
          <div className="grid grid-cols-1 gap-3">
            {CAMPUS_ZONES.map((zone, index) => (
              <motion.div
                key={zone.code}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  onClick={() => setSelectedZone(zone.code)}
                  className={`p-4 cursor-pointer border-2 transition-all duration-300 ${
                    selectedZone === zone.code
                      ? 'border-primary-500 bg-primary-50 shadow-md'
                      : 'border-gray-200 hover:border-primary-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-gray-900">{zone.name}</h4>
                        {selectedZone === zone.code && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center justify-center w-5 h-5 bg-green-500 rounded-full"
                          >
                            <CheckCircle className="w-3 h-3 text-white" />
                          </motion.div>
                        )}
                      </div>
                      {zone.description && (
                        <p className="text-xs text-gray-600">{zone.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary-600">
                        {zone.deliveryFee === 0 ? (
                          <span className="text-green-600">FREE</span>
                        ) : (
                          `₵${zone.deliveryFee.toFixed(2)}`
                        )}
                      </p>
                      <p className="text-xs text-gray-500">Delivery fee</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
          {errors.campusZone && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-red-600 flex items-center gap-1 mt-1"
            >
              <AlertCircle className="w-3 h-3" />
              {errors.campusZone}
            </motion.p>
          )}
        </div>

        {/* Delivery Details - Only show if zone is selected */}
        {selectedZone && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className="space-y-4 pt-2"
          >
            <Card className="p-5 bg-gradient-to-br from-blue-50 to-primary-50 border-2 border-primary-200">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-primary-600" />
                <h4 className="text-sm font-bold text-gray-900">
                  Delivery Details for {selectedZoneData?.name}
                </h4>
              </div>

              <div className="space-y-4">
                {/* Dormitory Name */}
                <div className="space-y-2">
                  <Label htmlFor="dorm-name" className="text-sm font-bold text-gray-900">
                    Dormitory/Hall Name *
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="dorm-name"
                      type="text"
                      placeholder="e.g., Commonwealth Hall, Volta Hall"
                      value={dormName}
                      onChange={(e) => setDormName(e.target.value)}
                      className={`h-11 pl-11 border-2 transition-all ${
                        errors.dormName
                          ? 'border-red-300 focus-visible:border-red-500'
                          : 'border-gray-300 focus-visible:border-primary-500'
                      }`}
                    />
                  </div>
                  {errors.dormName && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-red-600 flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      {errors.dormName}
                    </motion.p>
                  )}
                </div>

                {/* Room Number */}
                <div className="space-y-2">
                  <Label htmlFor="room-number" className="text-sm font-bold text-gray-900">
                    Room Number *
                  </Label>
                  <div className="relative">
                    <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="room-number"
                      type="text"
                      placeholder="e.g., A101, B-205, C3-12"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      className={`h-11 pl-11 border-2 transition-all ${
                        errors.roomNumber
                          ? 'border-red-300 focus-visible:border-red-500'
                          : 'border-gray-300 focus-visible:border-primary-500'
                      }`}
                    />
                  </div>
                  {errors.roomNumber && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-red-600 flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      {errors.roomNumber}
                    </motion.p>
                  )}
                </div>

                {/* Additional Information */}
                <div className="space-y-2">
                  <Label htmlFor="additional-info" className="text-sm font-bold text-gray-900">
                    Additional Information
                    <span className="text-gray-500 font-normal ml-1">(Optional)</span>
                  </Label>
                  <Input
                    id="additional-info"
                    type="text"
                    placeholder="e.g., Near the main entrance, 2nd floor"
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    className="h-11 border-2 border-gray-300 focus-visible:border-primary-500"
                  />
                  <p className="text-xs text-gray-600">
                    Help the delivery rider find you easily
                  </p>
                </div>
              </div>
            </Card>

            {/* Address Preview */}
            {isValid && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-green-50 border-2 border-green-200 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-green-900 mb-1">
                      Delivery Address Confirmed
                    </p>
                    <p className="text-sm text-green-800">
                      {dormName}, Room {roomNumber}
                    </p>
                    <p className="text-sm text-green-800">
                      {selectedZoneData?.name}
                    </p>
                    {additionalInfo && (
                      <p className="text-xs text-green-700 mt-1 italic">
                        Note: {additionalInfo}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Delivery Information Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg"
      >
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-blue-900 font-semibold mb-1">
            Campus Delivery Information
          </p>
          <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
            <li>Deliveries are made during business hours (8 AM - 6 PM)</li>
            <li>Please ensure someone is available to receive the package</li>
            <li>Delivery fees vary by campus zone location</li>
            <li>Our campus riders will contact you 10 minutes before arrival</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
