'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/ui/back-button';
import CheckoutStepper, { CheckoutStep } from '@/components/checkout/CheckoutStepper';
import DeliveryAddressForm, { DeliveryAddressData } from '@/components/checkout/DeliveryAddressForm';
import PaymentMethodSelector from '@/components/checkout/PaymentMethodSelector';
import OrderSummary from '@/components/checkout/OrderSummary';
import { useCartStore } from '@/lib/stores/cart';
import { toast } from 'sonner';

type PaymentMethod = 'MOBILE_MONEY' | 'INSTALLMENT';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, itemCount, clearCart } = useCartStore();
  
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('address');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form data state
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddressData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [paydayDate, setPaydayDate] = useState<Date | null>(null);
  const [deliveryFee, setDeliveryFee] = useState(0);

  // Check if cart is empty
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add items to your cart before checking out</p>
          <Button onClick={() => router.push('/products')} className="bg-primary-600 hover:bg-primary-700">
            Continue Shopping
          </Button>
        </motion.div>
      </div>
    );
  }

  // Validation helpers
  const isAddressStepValid = () => {
    return deliveryAddress !== null && 
           deliveryAddress.campusZone && 
           deliveryAddress.dormName && 
           deliveryAddress.roomNumber;
  };

  const isPaymentStepValid = () => {
    if (!paymentMethod) return false;
    if (paymentMethod === 'INSTALLMENT' && !paydayDate) return false;
    return true;
  };

  // Step navigation
  const handleNext = () => {
    if (currentStep === 'address') {
      if (!isAddressStepValid()) {
        toast.error('Please complete your delivery address');
        return;
      }
      setCurrentStep('payment');
    } else if (currentStep === 'payment') {
      if (!isPaymentStepValid()) {
        toast.error('Please select a payment method');
        return;
      }
      setCurrentStep('confirm');
    }
  };

  const handleBack = () => {
    if (currentStep === 'payment') {
      setCurrentStep('address');
    } else if (currentStep === 'confirm') {
      setCurrentStep('payment');
    }
  };

  // Handle address change
  const handleAddressChange = (address: DeliveryAddressData, zoneFee: number) => {
    setDeliveryAddress(address);
    setDeliveryFee(zoneFee);
  };

  // Handle payment method change
  const handlePaymentMethodChange = (method: PaymentMethod, date?: Date) => {
    setPaymentMethod(method);
    if (date) {
      setPaydayDate(date);
    }
  };

  // Handle order placement
  const handlePlaceOrder = async () => {
    if (!deliveryAddress || !paymentMethod) {
      toast.error('Please complete all checkout steps');
      return;
    }

    setIsProcessing(true);

    try {
      // Debug: Check if cookies are being sent
      console.log('[Checkout] About to create order');
      console.log('[Checkout] Document cookies:', document.cookie);
      console.log('[Checkout] Cart items:', items.length);
      
      const orderPayload = {
        deliveryAddress: deliveryAddress.deliveryAddress,
        campusZone: deliveryAddress.campusZone,
        paymentMethod,
        deliveryFee: deliveryFee,
        items: items.map(item => ({
          productId: item.product_id,
          quantity: item.quantity,
          price: item.price,
        })),
      };
      
      console.log('[Checkout] Order payload:', JSON.stringify(orderPayload, null, 2));
      
      // Create order (uses httpOnly cookies for auth)
      // Send cart items directly since cart only exists in localStorage
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify(orderPayload),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error?.message || 'Failed to create order');
      }

      const orderData = await orderResponse.json();
      const orderId = orderData.data.id;

      // Handle payment based on method
      if (paymentMethod === 'INSTALLMENT' && paydayDate) {
        // Initialize Payday Flex payment
        const paymentResponse = await fetch('/api/payments/payday-flex/initialize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            orderId,
            paydayDate: paydayDate.toISOString(),
          }),
        });

        if (!paymentResponse.ok) {
          const errorData = await paymentResponse.json();
          throw new Error(errorData.error?.message || 'Failed to initialize payment');
        }

        const paymentData = await paymentResponse.json();
        
        // Redirect to Paystack
        if (paymentData.data.authorizationUrl) {
          window.location.href = paymentData.data.authorizationUrl;
        } else {
          throw new Error('No payment URL received');
        }
      } else {
        // Mobile Money - use mobile money endpoint
        const paymentResponse = await fetch('/api/payments/mobile-money/initialize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            orderId,
          }),
        });

        if (!paymentResponse.ok) {
          const errorData = await paymentResponse.json();
          throw new Error(errorData.error?.message || 'Failed to initialize payment');
        }

        const paymentData = await paymentResponse.json();
        
        // Redirect to Paystack
        if (paymentData.data.authorizationUrl) {
          window.location.href = paymentData.data.authorizationUrl;
        } else {
          throw new Error('No payment URL received');
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process order. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Stepper */}
      <CheckoutStepper currentStep={currentStep} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Address Step */}
              {currentStep === 'address' && (
                <motion.div
                  key="address"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-lg shadow-sm p-6"
                >
                  <DeliveryAddressForm
                    onAddressChange={handleAddressChange}
                    initialData={deliveryAddress || undefined}
                  />
                </motion.div>
              )}

              {/* Payment Step */}
              {currentStep === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-lg shadow-sm p-6"
                >
                  <PaymentMethodSelector
                    onMethodChange={handlePaymentMethodChange}
                    selectedMethod={paymentMethod || undefined}
                    orderAmount={useCartStore.getState().totalAmount + deliveryFee}
                  />
                </motion.div>
              )}

              {/* Confirm Step */}
              {currentStep === 'confirm' && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Delivery Summary */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Delivery Address</h3>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">
                        {deliveryAddress?.dormName}, Room {deliveryAddress?.roomNumber}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {deliveryAddress?.campusZone.replace('ZONE_', 'Zone ')}
                      </p>
                      {deliveryAddress?.additionalInfo && (
                        <p className="text-xs text-gray-500 mt-2 italic">
                          Note: {deliveryAddress.additionalInfo}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Method</h3>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">
                        {paymentMethod === 'MOBILE_MONEY' ? 'Mobile Money' : 'Payday Flex (Installment)'}
                      </p>
                      {paymentMethod === 'INSTALLMENT' && paydayDate && (
                        <p className="text-sm text-gray-600 mt-1">
                          Payday Date: {paydayDate.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="mt-6 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 'address' || isProcessing}
                className="border-2 border-gray-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              {currentStep !== 'confirm' ? (
                <Button
                  onClick={handleNext}
                  disabled={isProcessing}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-8"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 font-bold"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Place Order
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <OrderSummary deliveryFee={deliveryFee} showItems={true} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
