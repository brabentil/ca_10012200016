'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useCartStore } from '@/lib/stores/cart';

type VerificationStatus = 'verifying' | 'success' | 'failed';

export default function PaymentVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>('verifying');
  const [message, setMessage] = useState('Verifying your payment...');
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get('reference') || searchParams.get('trxref');

      if (!reference) {
        setStatus('failed');
        setMessage('No payment reference found');
        return;
      }

      try {
        const response = await fetch(`/api/payments/verify?reference=${reference}`, {
          method: 'GET',
          credentials: 'include',
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          setMessage(data.message || 'Payment verified successfully!');
          
          // Clear cart only after successful payment verification
          clearCart();
          
          // Redirect to orders page after 3 seconds
          setTimeout(() => {
            router.push('/orders');
          }, 3000);
        } else {
          setStatus('failed');
          setMessage(data.error?.message || 'Payment verification failed');
          
          // Redirect to checkout after 5 seconds
          setTimeout(() => {
            router.push('/checkout');
          }, 5000);
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('failed');
        setMessage('Failed to verify payment. Please contact support.');
        
        // Redirect to checkout after 5 seconds
        setTimeout(() => {
          router.push('/checkout');
        }, 5000);
      }
    };

    verifyPayment();
  }, [searchParams, router, clearCart]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex flex-col items-center text-center">
          {status === 'verifying' && (
            <>
              <Loader2 className="h-16 w-16 text-blue-600 animate-spin mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Verifying Payment
              </h1>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Successful!
              </h1>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">
                Redirecting to your orders...
              </p>
            </>
          )}

          {status === 'failed' && (
            <>
              <XCircle className="h-16 w-16 text-red-600 mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Failed
              </h1>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">
                Redirecting to checkout...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
