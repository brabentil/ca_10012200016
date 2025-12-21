'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface PaydayDatePickerProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  orderAmount: number;
}

export default function PaydayDatePicker({
  selectedDate,
  onDateSelect,
  orderAmount,
}: PaydayDatePickerProps) {
  const [dateInput, setDateInput] = useState('');
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);

  // Calculate min and max dates (7-30 days from today)
  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + 7);
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 30);

  // Format date to YYYY-MM-DD for input
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format date for display
  const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString('en-GH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Initialize with selected date if available
  useEffect(() => {
    if (selectedDate) {
      setDateInput(formatDateForInput(selectedDate));
      setIsValid(true);
      setError('');
    }
  }, [selectedDate]);

  // Validate date input
  const validateDate = (dateString: string): void => {
    if (!dateString) {
      setError('Please select your payday date');
      setIsValid(false);
      return;
    }

    const inputDate = new Date(dateString);
    const inputTime = inputDate.getTime();
    const minTime = minDate.getTime();
    const maxTime = maxDate.getTime();

    // Check if date is valid
    if (isNaN(inputTime)) {
      setError('Please enter a valid date');
      setIsValid(false);
      return;
    }

    // Check if date is within range
    if (inputTime < minTime) {
      const daysFromToday = Math.ceil((inputDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      setError(`Payday must be at least 7 days from today (${daysFromToday} days selected)`);
      setIsValid(false);
      return;
    }

    if (inputTime > maxTime) {
      const daysFromToday = Math.ceil((inputDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      setError(`Payday must be within 30 days (${daysFromToday} days selected)`);
      setIsValid(false);
      return;
    }

    // Valid date
    setError('');
    setIsValid(true);
    onDateSelect(inputDate);
  };

  // Handle date input change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDateInput(value);
    validateDate(value);
  };

  // Calculate days from today
  const getDaysFromToday = (date: Date): number => {
    const diffTime = date.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Get suggested payday dates (common payday patterns)
  const suggestedDates = [
    { label: '2 Weeks (14 days)', days: 14 },
    { label: '3 Weeks (21 days)', days: 21 },
    { label: '1 Month (30 days)', days: 30 },
  ];

  const selectSuggestedDate = (days: number) => {
    const suggestedDate = new Date(today);
    suggestedDate.setDate(today.getDate() + days);
    const formattedDate = formatDateForInput(suggestedDate);
    setDateInput(formattedDate);
    validateDate(formattedDate);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
          <Calendar className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Select Your Payday</h3>
          <p className="text-sm text-gray-600">
            Choose when you'll pay the remaining 50%
          </p>
        </div>
      </div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-4"
      >
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Choose a date between 7-30 days from today</p>
            <p>Select the date when you expect to receive your salary or allowance.</p>
          </div>
        </div>
      </motion.div>

      {/* Date Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        <Label htmlFor="payday-date" className="text-sm font-semibold text-gray-700">
          Payday Date *
        </Label>
        <div className="relative">
          <Input
            id="payday-date"
            type="date"
            value={dateInput}
            onChange={handleDateChange}
            min={formatDateForInput(minDate)}
            max={formatDateForInput(maxDate)}
            className={`h-12 text-base ${
              error
                ? 'border-red-500 focus-visible:ring-red-500'
                : isValid
                ? 'border-green-500 focus-visible:ring-green-500'
                : 'border-gray-300'
            }`}
          />
          {isValid && (
            <CheckCircle className="w-5 h-5 text-green-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          )}
        </div>
        
        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 text-sm text-red-600"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Valid Date Display */}
        {isValid && selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 text-sm text-green-600"
          >
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Payment due on {formatDateForDisplay(selectedDate)} ({getDaysFromToday(selectedDate)} days)</span>
          </motion.div>
        )}
      </motion.div>

      {/* Suggested Dates */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <Label className="text-sm font-semibold text-gray-700">Quick Select</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {suggestedDates.map((suggestion) => {
            const date = new Date(today);
            date.setDate(today.getDate() + suggestion.days);
            const isSelected = dateInput === formatDateForInput(date);

            return (
              <button
                key={suggestion.days}
                onClick={() => selectSuggestedDate(suggestion.days)}
                className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                  isSelected
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 bg-white hover:border-primary-300'
                }`}
              >
                <div className="text-center">
                  <div className="font-bold text-gray-900 mb-1">{suggestion.label}</div>
                  <div className="text-sm text-gray-600">
                    {date.toLocaleDateString('en-GH', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Payment Summary */}
      {isValid && selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-50 border border-gray-200 rounded-lg p-5 space-y-3"
        >
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-gray-700" />
            <span className="font-semibold text-gray-900">Payment Schedule</span>
          </div>

          <div className="space-y-2">
            {/* Today Payment */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-700">Today</span>
              </div>
              <span className="font-semibold text-gray-900">
                GH₵ {(orderAmount * 0.5).toFixed(2)}
              </span>
            </div>

            {/* Payday Payment */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-sm text-gray-700">
                  {selectedDate.toLocaleDateString('en-GH', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <span className="font-semibold text-gray-900">
                GH₵ {(orderAmount * 0.5).toFixed(2)}
              </span>
            </div>

            {/* Total */}
            <div className="pt-2 border-t-2 border-gray-300 flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="text-lg font-bold text-primary-600">
                GH₵ {orderAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Date Range Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3"
      >
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold mb-1">Valid Date Range:</p>
            <p>
              Earliest: {formatDateForDisplay(minDate)}
            </p>
            <p>
              Latest: {formatDateForDisplay(maxDate)}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
