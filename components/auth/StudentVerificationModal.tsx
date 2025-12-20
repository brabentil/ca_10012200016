'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, X, CheckCircle2, Clock } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

const verifySchema = z.object({
  code: z.string().length(6, 'Verification code must be 6 digits'),
});

type VerifyFormData = z.infer<typeof verifySchema>;

interface StudentVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onSuccess?: () => void;
}

export default function StudentVerificationModal({
  isOpen,
  onClose,
  email,
  onSuccess,
}: StudentVerificationModalProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
  });

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
      setVerifyError(null);
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: VerifyFormData) => {
    try {
      setIsVerifying(true);
      setVerifyError(null);

      const response = await apiClient.post('/verification/verify', {
        email,
        code: data.code,
      });

      if (response.data.success) {
        toast.success('Email verified successfully!');
        reset();
        onClose();
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Verification failed. Please check your code and try again.';
      setVerifyError(message);
      toast.error(message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setIsResending(true);
      setVerifyError(null);

      const response = await apiClient.post('/verification/request', {
        email,
      });

      if (response.data.success) {
        toast.success('Verification code sent! Check your email.');
        setResendCooldown(60); // 60 second cooldown
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to resend code. Please try again.';
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              {/* Header */}
              <div className="mb-6">
                <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-8 h-8 text-secondary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify your email</h2>
                <p className="text-sm text-gray-600">
                  We've sent a 6-digit verification code to{' '}
                  <span className="font-semibold text-primary-700">{email}</span>
                </p>
              </div>

              {/* Verification Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-sm font-semibold text-gray-700">
                    Verification Code
                  </Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    {...register('code')}
                    className={`h-14 text-center text-2xl font-bold tracking-widest border-2 transition-all ${
                      errors.code
                        ? 'border-red-500 focus-visible:ring-red-500'
                        : 'border-gray-200 hover:border-gray-300 focus-visible:border-primary-500 focus-visible:ring-primary-500'
                    }`}
                    autoComplete="off"
                  />
                  {errors.code && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <span>⚠</span> {errors.code.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Code expires in 10 minutes
                  </p>
                </div>

                {verifyError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg"
                  >
                    <p className="text-sm text-red-800">{verifyError}</p>
                  </motion.div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white font-semibold shadow-lg"
                  disabled={isVerifying}
                >
                  {isVerifying ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    'Verify Email'
                  )}
                </Button>
              </form>

              {/* Resend Section */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 mb-3">Didn't receive the code?</p>
                <Button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isResending || resendCooldown > 0}
                  variant="outline"
                  className="w-full h-11 border-2 border-primary-200 hover:border-primary-300 hover:bg-primary-50 text-primary-700 font-semibold"
                >
                  {isResending ? (
                    'Sending...'
                  ) : resendCooldown > 0 ? (
                    `Resend in ${resendCooldown}s`
                  ) : (
                    'Resend Code'
                  )}
                </Button>
              </div>

              {/* Help Text */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>💡 Tip:</strong> Check your spam folder if you don't see the email.
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
