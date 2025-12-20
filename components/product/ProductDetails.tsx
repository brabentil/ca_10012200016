'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  Info, 
  Ruler, 
  Sparkles, 
  Package, 
  Shirt,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface ProductDetailsProps {
  description: string;
  category: string;
  size?: string;
  color?: string;
  brand?: string;
  material?: string;
  condition: 'Like New' | 'Good' | 'Fair' | 'Worn';
  measurements?: {
    chest?: string;
    waist?: string;
    length?: string;
    shoulders?: string;
    sleeves?: string;
    hips?: string;
    inseam?: string;
  };
  careInstructions?: string[];
  additionalInfo?: string;
  seller?: {
    name: string;
    is_verified: boolean;
    total_sales?: number;
  };
  dateAdded?: string;
}

export default function ProductDetails({
  description,
  category,
  size,
  color,
  brand,
  material,
  condition,
  measurements,
  careInstructions,
  additionalInfo,
  seller,
  dateAdded,
}: ProductDetailsProps) {
  const [expandedSections, setExpandedSections] = useState({
    description: true,
    specifications: true,
    measurements: false,
    care: false,
    seller: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const conditionInfo = {
    'Like New': {
      color: 'text-green-700',
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: CheckCircle2,
      description: 'Excellent condition with minimal to no signs of wear',
    },
    'Good': {
      color: 'text-blue-700',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: CheckCircle2,
      description: 'Good condition with minor signs of wear',
    },
    'Fair': {
      color: 'text-yellow-700',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: AlertCircle,
      description: 'Fair condition with visible signs of wear',
    },
    'Worn': {
      color: 'text-orange-700',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: AlertCircle,
      description: 'Well-worn with noticeable signs of use',
    },
  };

  const currentCondition = conditionInfo[condition] || conditionInfo['Good'];
  const ConditionIcon = currentCondition?.icon || CheckCircle2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full space-y-4"
    >
      {/* Condition Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className={`p-4 rounded-xl border-2 ${currentCondition.border} ${currentCondition.bg}`}
      >
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 ${currentCondition.bg} rounded-lg flex items-center justify-center flex-shrink-0 border-2 ${currentCondition.border}`}>
            <ConditionIcon className={`w-5 h-5 ${currentCondition.color}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`text-base font-bold ${currentCondition.color}`}>
                Condition: {condition}
              </h3>
            </div>
            <p className={`text-sm ${currentCondition.color}`}>
              {currentCondition.description}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Description Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden"
      >
        <button
          onClick={() => toggleSection('description')}
          className="w-full p-4 bg-gradient-to-r from-primary-50 to-primary-100 border-b-2 border-gray-100 flex items-center justify-between group hover:from-primary-100 hover:to-primary-50 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <Info className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Description</h3>
          </div>
          {expandedSections.description ? (
            <ChevronUp className="w-5 h-5 text-gray-600 group-hover:text-primary-600 transition-colors" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600 group-hover:text-primary-600 transition-colors" />
          )}
        </button>

        <AnimatePresence>
          {expandedSections.description && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {description}
                </p>
                {additionalInfo && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border-2 border-gray-100">
                    <p className="text-sm text-gray-600 italic">{additionalInfo}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Specifications Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden"
      >
        <button
          onClick={() => toggleSection('specifications')}
          className="w-full p-4 bg-gradient-to-r from-primary-50 to-primary-100 border-b-2 border-gray-100 flex items-center justify-between group hover:from-primary-100 hover:to-primary-50 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Specifications</h3>
          </div>
          {expandedSections.specifications ? (
            <ChevronUp className="w-5 h-5 text-gray-600 group-hover:text-primary-600 transition-colors" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600 group-hover:text-primary-600 transition-colors" />
          )}
        </button>

        <AnimatePresence>
          {expandedSections.specifications && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-3">
                {category && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm font-semibold text-gray-600">Category</span>
                    <span className="text-sm font-bold text-gray-900">{category}</span>
                  </div>
                )}
                {brand && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm font-semibold text-gray-600">Brand</span>
                    <span className="text-sm font-bold text-gray-900">{brand}</span>
                  </div>
                )}
                {size && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm font-semibold text-gray-600">Size</span>
                    <span className="text-sm font-bold text-gray-900">{size}</span>
                  </div>
                )}
                {color && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm font-semibold text-gray-600">Color</span>
                    <span className="text-sm font-bold text-gray-900">{color}</span>
                  </div>
                )}
                {material && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm font-semibold text-gray-600">Material</span>
                    <span className="text-sm font-bold text-gray-900">{material}</span>
                  </div>
                )}
                {dateAdded && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-semibold text-gray-600">Listed</span>
                    <span className="text-sm font-bold text-gray-900">{formatDate(dateAdded)}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Measurements Section */}
      {measurements && Object.keys(measurements).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden"
        >
          <button
            onClick={() => toggleSection('measurements')}
            className="w-full p-4 bg-gradient-to-r from-primary-50 to-primary-100 border-b-2 border-gray-100 flex items-center justify-between group hover:from-primary-100 hover:to-primary-50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <Ruler className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Measurements</h3>
            </div>
            {expandedSections.measurements ? (
              <ChevronUp className="w-5 h-5 text-gray-600 group-hover:text-primary-600 transition-colors" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600 group-hover:text-primary-600 transition-colors" />
            )}
          </button>

          <AnimatePresence>
            {expandedSections.measurements && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-4 grid grid-cols-2 gap-3">
                  {Object.entries(measurements).map(([key, value], index) => (
                    value && (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                        className="p-3 bg-gray-50 rounded-lg border-2 border-gray-100"
                      >
                        <p className="text-xs font-semibold text-gray-600 capitalize mb-1">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-sm font-bold text-gray-900">{value}</p>
                      </motion.div>
                    )
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Care Instructions Section */}
      {careInstructions && careInstructions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden"
        >
          <button
            onClick={() => toggleSection('care')}
            className="w-full p-4 bg-gradient-to-r from-primary-50 to-primary-100 border-b-2 border-gray-100 flex items-center justify-between group hover:from-primary-100 hover:to-primary-50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Care Instructions</h3>
            </div>
            {expandedSections.care ? (
              <ChevronUp className="w-5 h-5 text-gray-600 group-hover:text-primary-600 transition-colors" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600 group-hover:text-primary-600 transition-colors" />
            )}
          </button>

          <AnimatePresence>
            {expandedSections.care && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-4 space-y-2">
                  {careInstructions.map((instruction, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border-2 border-gray-100"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700">{instruction}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Seller Information Section */}
      {seller && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.3 }}
          className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden"
        >
          <button
            onClick={() => toggleSection('seller')}
            className="w-full p-4 bg-gradient-to-r from-primary-50 to-primary-100 border-b-2 border-gray-100 flex items-center justify-between group hover:from-primary-100 hover:to-primary-50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <Shirt className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Seller Information</h3>
            </div>
            {expandedSections.seller ? (
              <ChevronUp className="w-5 h-5 text-gray-600 group-hover:text-primary-600 transition-colors" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600 group-hover:text-primary-600 transition-colors" />
            )}
          </button>

          <AnimatePresence>
            {expandedSections.seller && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {seller.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-base font-bold text-gray-900">{seller.name}</p>
                        {seller.is_verified && (
                          <div className="px-2 py-0.5 bg-blue-100 border border-blue-300 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-blue-600" />
                            <span className="text-xs font-semibold text-blue-700">Verified</span>
                          </div>
                        )}
                      </div>
                      {seller.total_sales !== undefined && (
                        <p className="text-sm text-gray-600">
                          {seller.total_sales} {seller.total_sales === 1 ? 'sale' : 'sales'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}
