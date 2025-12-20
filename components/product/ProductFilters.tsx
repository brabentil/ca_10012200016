'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface FilterOptions {
  categories?: string[];
  sizes?: string[];
  colors?: string[];
  conditions?: ('Like New' | 'Good' | 'Fair' | 'Worn')[];
  minPrice?: number;
  maxPrice?: number;
}

interface ProductFiltersProps {
  onFilterChange: (filters: ActiveFilters) => void;
  options?: FilterOptions;
  isOpen?: boolean;
  onToggle?: () => void;
}

export interface ActiveFilters {
  category?: string;
  size?: string;
  color?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
}

const defaultOptions: FilterOptions = {
  categories: ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories', 'Bags'],
  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  colors: ['Black', 'White', 'Blue', 'Red', 'Green', 'Yellow', 'Pink', 'Brown', 'Gray', 'Beige'],
  conditions: ['Like New', 'Good', 'Fair', 'Worn'],
  minPrice: 0,
  maxPrice: 500,
};

export default function ProductFilters({ 
  onFilterChange, 
  options = defaultOptions,
  isOpen: controlledIsOpen,
  onToggle 
}: ProductFiltersProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(true);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    size: false,
    color: false,
    price: false,
    condition: true,
  });

  const [priceRange, setPriceRange] = useState({
    min: options.minPrice || 0,
    max: options.maxPrice || 500,
  });

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const updateFilter = (key: keyof ActiveFilters, value: any) => {
    const newFilters = {
      ...activeFilters,
      [key]: activeFilters[key] === value ? undefined : value,
    };
    
    // Remove undefined values
    Object.keys(newFilters).forEach(k => {
      if (newFilters[k as keyof ActiveFilters] === undefined) {
        delete newFilters[k as keyof ActiveFilters];
      }
    });
    
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const updatePriceRange = () => {
    const newFilters = {
      ...activeFilters,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
    };
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setActiveFilters({});
    setPriceRange({
      min: options.minPrice || 0,
      max: options.maxPrice || 500,
    });
    onFilterChange({});
  };

  const activeFilterCount = Object.keys(activeFilters).length;

  const conditionColors = {
    'Like New': 'bg-green-500',
    'Good': 'bg-blue-500',
    'Fair': 'bg-yellow-500',
    'Worn': 'bg-orange-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-primary-50 to-primary-100 border-b-2 border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <SlidersHorizontal className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Filters</h3>
              {activeFilterCount > 0 && (
                <p className="text-xs text-gray-600">{activeFilterCount} active</p>
              )}
            </div>
          </div>
          <button
            onClick={handleToggle}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {/* Clear Filters Button */}
        {activeFilterCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3"
          >
            <Button
              onClick={clearFilters}
              variant="outline"
              size="sm"
              className="w-full h-9 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all"
            >
              <X className="w-4 h-4 mr-2" />
              Clear all filters
            </Button>
          </motion.div>
        )}
      </div>

      {/* Filters Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Category Filter */}
              {options.categories && options.categories.length > 0 && (
                <div className="border-b border-gray-100 pb-4">
                  <button
                    onClick={() => toggleSection('category')}
                    className="w-full flex items-center justify-between mb-3 group"
                  >
                    <Label className="text-sm font-bold text-gray-900 cursor-pointer group-hover:text-primary-600 transition-colors">
                      Category
                    </Label>
                    {expandedSections.category ? (
                      <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {expandedSections.category && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-2 overflow-hidden"
                      >
                        {options.categories.map((category, index) => (
                          <motion.button
                            key={category}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => updateFilter('category', category)}
                            className={`w-full text-left px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                              activeFilters.category === category
                                ? 'bg-primary-50 border-primary-500 text-primary-700'
                                : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {category}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Size Filter */}
              {options.sizes && options.sizes.length > 0 && (
                <div className="border-b border-gray-100 pb-4">
                  <button
                    onClick={() => toggleSection('size')}
                    className="w-full flex items-center justify-between mb-3 group"
                  >
                    <Label className="text-sm font-bold text-gray-900 cursor-pointer group-hover:text-primary-600 transition-colors">
                      Size
                    </Label>
                    {expandedSections.size ? (
                      <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {expandedSections.size && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="grid grid-cols-3 gap-2 overflow-hidden"
                      >
                        {options.sizes.map((size, index) => (
                          <motion.button
                            key={size}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => updateFilter('size', size)}
                            className={`px-3 py-2 rounded-lg border-2 transition-all text-sm font-semibold ${
                              activeFilters.size === size
                                ? 'bg-primary-50 border-primary-500 text-primary-700'
                                : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {size}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Color Filter */}
              {options.colors && options.colors.length > 0 && (
                <div className="border-b border-gray-100 pb-4">
                  <button
                    onClick={() => toggleSection('color')}
                    className="w-full flex items-center justify-between mb-3 group"
                  >
                    <Label className="text-sm font-bold text-gray-900 cursor-pointer group-hover:text-primary-600 transition-colors">
                      Color
                    </Label>
                    {expandedSections.color ? (
                      <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {expandedSections.color && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="grid grid-cols-2 gap-2 overflow-hidden"
                      >
                        {options.colors.map((color, index) => (
                          <motion.button
                            key={color}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => updateFilter('color', color)}
                            className={`px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                              activeFilters.color === color
                                ? 'bg-primary-50 border-primary-500 text-primary-700'
                                : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {color}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Price Range Filter */}
              <div className="border-b border-gray-100 pb-4">
                <button
                  onClick={() => toggleSection('price')}
                  className="w-full flex items-center justify-between mb-3 group"
                >
                  <Label className="text-sm font-bold text-gray-900 cursor-pointer group-hover:text-primary-600 transition-colors">
                    Price Range
                  </Label>
                  {expandedSections.price ? (
                    <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                  )}
                </button>
                
                <AnimatePresence>
                  {expandedSections.price && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-3 overflow-hidden"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="minPrice" className="text-xs font-semibold text-gray-600">
                            Min (₵)
                          </Label>
                          <Input
                            id="minPrice"
                            type="number"
                            value={priceRange.min}
                            onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                            min={options.minPrice || 0}
                            max={priceRange.max}
                            className="h-10 border-2 border-gray-200 focus-visible:border-primary-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="maxPrice" className="text-xs font-semibold text-gray-600">
                            Max (₵)
                          </Label>
                          <Input
                            id="maxPrice"
                            type="number"
                            value={priceRange.max}
                            onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                            min={priceRange.min}
                            max={options.maxPrice || 500}
                            className="h-10 border-2 border-gray-200 focus-visible:border-primary-500"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={updatePriceRange}
                        className="w-full h-10 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold transition-all"
                      >
                        Apply Price Range
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Condition Filter */}
              {options.conditions && options.conditions.length > 0 && (
                <div>
                  <button
                    onClick={() => toggleSection('condition')}
                    className="w-full flex items-center justify-between mb-3 group"
                  >
                    <Label className="text-sm font-bold text-gray-900 cursor-pointer group-hover:text-primary-600 transition-colors">
                      Condition
                    </Label>
                    {expandedSections.condition ? (
                      <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {expandedSections.condition && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-2 overflow-hidden"
                      >
                        {options.conditions.map((condition, index) => (
                          <motion.button
                            key={condition}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => updateFilter('condition', condition)}
                            className={`w-full text-left px-3 py-2.5 rounded-lg border-2 transition-all text-sm font-medium flex items-center gap-2 ${
                              activeFilters.condition === condition
                                ? 'bg-primary-50 border-primary-500 text-primary-700'
                                : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className={`w-3 h-3 rounded-full ${conditionColors[condition]}`} />
                            {condition}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
