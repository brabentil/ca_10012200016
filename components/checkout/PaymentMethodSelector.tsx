'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Calendar, CreditCard, Info, Check, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

type PaymentMethod = 'MOBILE_MONEY' | 'INSTALLMENT';

interface PaymentMethodSelectorProps {
  onMethodChange: (method: PaymentMethod, paydayDate?: Date) => void;
  selectedMethod?: PaymentMethod;
  orderAmount?: number;
}

export default function PaymentMethodSelector({ 
  onMethodChange, 
  selectedMethod,
  orderAmount = 0 
}: PaymentMethodSelectorProps) {
  const [activeMethod, setActiveMethod] = useState<PaymentMethod | null>(selectedMethod || null);
  const [paydayDate, setPaydayDate] = useState<string>('');
  const [showPaydayDetails, setShowPaydayDetails] = useState(false);

  // Calculate minimum and maximum payday dates (7-30 days from now)
  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() + 7);
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 30);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleMethodSelect = (method: PaymentMethod) => {
    setActiveMethod(method);
    
    if (method === 'MOBILE_MONEY') {
      setShowPaydayDetails(false);
      onMethodChange(method);
    } else if (method === 'INSTALLMENT') {
      setShowPaydayDetails(true);
      // Don't call onMethodChange yet - wait for payday date selection
    }
  };

  const handlePaydayDateChange = (date: string) => {
    setPaydayDate(date);
    if (date && activeMethod === 'INSTALLMENT') {
      onMethodChange('INSTALLMENT', new Date(date));
    }
  };

  const firstPayment = orderAmount * 0.5;
  const remainingPayment = orderAmount - firstPayment;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-bold text-gray-900">Select Payment Method</h3>
      </div>

      {/* Mobile Money Option */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card
          className={`p-4 cursor-pointer border-2 transition-all duration-300 ${
            activeMethod === 'MOBILE_MONEY'
              ? 'border-primary-500 bg-primary-50 shadow-md'
              : 'border-gray-200 hover:border-primary-300 hover:shadow-sm'
          }`}
          onClick={() => handleMethodSelect('MOBILE_MONEY')}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className={`p-2 rounded-lg ${
                activeMethod === 'MOBILE_MONEY' ? 'bg-primary-100' : 'bg-gray-100'
              }`}>
                <Smartphone className={`w-6 h-6 ${
                  activeMethod === 'MOBILE_MONEY' ? 'text-primary-600' : 'text-gray-600'
                }`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-gray-900">Mobile Money</h4>
                  {activeMethod === 'MOBILE_MONEY' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold"
                    >
                      <Check className="w-3 h-3" />
                      Selected
                    </motion.div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Pay in full now with MTN Mobile Money, Vodafone Cash, or AirtelTigo Money
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">
                    MTN
                  </span>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">
                    Vodafone
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                    AirtelTigo
                  </span>
                </div>
              </div>
            </div>
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: activeMethod === 'MOBILE_MONEY' ? 90 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronRight className={`w-5 h-5 ${
                activeMethod === 'MOBILE_MONEY' ? 'text-primary-600' : 'text-gray-400'
              }`} />
            </motion.div>
          </div>
        </Card>
      </motion.div>

      {/* Payday Flex Option */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card
          className={`p-4 cursor-pointer border-2 transition-all duration-300 ${
            activeMethod === 'INSTALLMENT'
              ? 'border-primary-500 bg-primary-50 shadow-md'
              : 'border-gray-200 hover:border-primary-300 hover:shadow-sm'
          }`}
          onClick={() => handleMethodSelect('INSTALLMENT')}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className={`p-2 rounded-lg ${
                activeMethod === 'INSTALLMENT' ? 'bg-primary-100' : 'bg-gray-100'
              }`}>
                <Calendar className={`w-6 h-6 ${
                  activeMethod === 'INSTALLMENT' ? 'text-primary-600' : 'text-gray-600'
                }`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-gray-900">Payday Flex</h4>
                  <span className="bg-gradient-to-r from-orange-400 to-orange-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                    Popular
                  </span>
                  {activeMethod === 'INSTALLMENT' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold"
                    >
                      <Check className="w-3 h-3" />
                      Selected
                    </motion.div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Pay 50% now, remaining 50% on your payday
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Info className="w-4 h-4 text-primary-600" />
                  <p className="text-xs text-primary-700 font-medium">
                    No interest • No hidden fees • Student-friendly
                  </p>
                </div>
              </div>
            </div>
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: activeMethod === 'INSTALLMENT' ? 90 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronRight className={`w-5 h-5 ${
                activeMethod === 'INSTALLMENT' ? 'text-primary-600' : 'text-gray-400'
              }`} />
            </motion.div>
          </div>
        </Card>
      </motion.div>

      {/* Payday Flex Details */}
      <AnimatePresence>
        {showPaydayDetails && activeMethod === 'INSTALLMENT' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <Card className="p-5 bg-gradient-to-br from-primary-50 to-blue-50 border-2 border-primary-200">
              <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-600" />
                Payment Schedule
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* First Payment */}
                <div className="bg-white p-4 rounded-lg border-2 border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <p className="text-xs font-bold text-gray-600 uppercase">Today</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    ₵{firstPayment.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">First payment (50%)</p>
                </div>

                {/* Remaining Payment */}
                <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <p className="text-xs font-bold text-gray-600 uppercase">On Payday</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    ₵{remainingPayment.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Remaining payment (50%)</p>
                </div>
              </div>

              {/* Payday Date Selector */}
              <div className="space-y-2">
                <Label htmlFor="payday-date" className="text-sm font-bold text-gray-900">
                  When is your payday?
                </Label>
                <Input
                  id="payday-date"
                  type="date"
                  value={paydayDate}
                  onChange={(e) => handlePaydayDateChange(e.target.value)}
                  min={formatDate(minDate)}
                  max={formatDate(maxDate)}
                  className="h-12 border-2 border-gray-300 focus-visible:border-primary-500 text-base font-medium"
                  required
                />
                <p className="text-xs text-gray-600 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Select a date between {minDate.toLocaleDateString()} and {maxDate.toLocaleDateString()}
                </p>
              </div>

              {/* Benefits List */}
              <div className="mt-4 pt-4 border-t border-primary-200">
                <p className="text-xs font-bold text-gray-900 mb-2">Why choose Payday Flex?</p>
                <ul className="space-y-1.5">
                  {[
                    '0% interest on installments',
                    'Automatic reminder before payday',
                    'Flexible payment dates',
                    'Build your credit score'
                  ].map((benefit, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-2 text-xs text-gray-700"
                    >
                      <Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                      {benefit}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Security Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg"
      >
        <div className="flex items-center gap-2 text-gray-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
          </svg>
          <p className="text-xs text-gray-700">
            <span className="font-semibold">Secure payment</span> powered by Paystack • All transactions are encrypted
          </p>
        </div>
      </motion.div>
    </div>
  );
}
