'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingCart, Mail, CheckCircle2, Shield, Sparkles, Gift, Clock } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

const verifySchema = z.object({
  code: z.string().length(6, 'Verification code must be 6 digits'),
});

type VerifyFormData = z.infer<typeof verifySchema>;

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
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
        // Redirect to profile or dashboard after successful verification
        setTimeout(() => {
          router.push('/profile');
        }, 1500);
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
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Left Side - Verification Form */}
      <div className="w-full lg:w-5/12 flex items-center justify-center p-4 sm:p-6 lg:p-12 bg-white min-h-screen lg:min-h-0">
        <div className="w-full max-w-md">
          {/* Logo & Brand */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Link href="/" className="flex items-center gap-3 mb-2 group">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">ThriftHub</h1>
                <p className="text-xs text-gray-500 font-medium">Sustainable Campus Fashion</p>
              </div>
            </Link>
          </motion.div>

          {/* Welcome Text */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-6"
          >
            <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-secondary-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Verify your email</h2>
            <p className="text-sm sm:text-base text-gray-600">
              We've sent a 6-digit verification code to{' '}
              <span className="font-semibold text-primary-700">{email || 'your email'}</span>
            </p>
          </motion.div>

          {/* Verification Form */}
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            onSubmit={handleSubmit(onSubmit)} 
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm font-semibold text-gray-700">Verification Code</Label>
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
              className="w-full h-12 bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white font-semibold text-base shadow-lg shadow-secondary-500/30 hover:shadow-xl hover:shadow-secondary-600/40 transition-all duration-300" 
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
          </motion.form>

          {/* Resend Section */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-gray-600 mb-3">
              Didn't receive the code?
            </p>
            <Button
              type="button"
              onClick={handleResendCode}
              disabled={isResending || resendCooldown > 0}
              variant="outline"
              className="w-full h-11 border-2 border-primary-200 hover:border-primary-300 hover:bg-primary-50 text-primary-700 font-semibold transition-all duration-300"
            >
              {isResending ? (
                'Sending...'
              ) : resendCooldown > 0 ? (
                `Resend in ${resendCooldown}s`
              ) : (
                'Resend Code'
              )}
            </Button>
          </motion.div>

          {/* Help Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <p className="text-xs text-blue-800">
              <strong>💡 Tip:</strong> Check your spam folder if you don't see the email. Make sure you registered with a valid .edu.gh email address.
            </p>
          </motion.div>

          {/* Back to Login */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-6 text-center text-sm text-gray-600"
          >
            Wrong email?{' '}
            <Link href="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              Go back to login
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Benefits */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex w-full lg:w-7/12 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 p-12 relative overflow-hidden"
      >
        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-64 h-64 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 border-2 border-white rounded-full"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center w-full max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-12"
          >
            <div className="inline-block px-4 py-2 bg-secondary-500/20 border border-secondary-500/30 rounded-full mb-6">
              <span className="text-secondary-400 font-semibold text-sm">✓ Almost There!</span>
            </div>
            <h2 className="text-5xl font-bold text-white mb-4 leading-tight">
              One Step Away from
              <br />
              <span className="text-secondary-400">Amazing Deals</span>
            </h2>
            <p className="text-xl text-primary-100 leading-relaxed">
              Verify your student email to unlock exclusive campus perks and start shopping sustainably.
            </p>
          </motion.div>

          {/* Verification Benefits */}
          <div className="space-y-6 mb-12">
            {[
              { icon: CheckCircle2, title: 'Student Status Verified', desc: 'Access student-only discounts up to 40% off' },
              { icon: Gift, title: 'Welcome Bonus Unlocked', desc: 'Get ₵20 credit on your first purchase' },
              { icon: Sparkles, title: 'AI Features Enabled', desc: 'Use photo search to find your perfect style match' },
              { icon: Shield, title: 'Secure Account', desc: 'Protect your profile with verified .edu.gh email' }
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                className="flex items-start gap-4 group"
              >
                <div className="w-12 h-12 bg-secondary-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <benefit.icon className="w-6 h-6 text-secondary-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">{benefit.title}</h3>
                  <p className="text-primary-200 text-sm">{benefit.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Trust Signals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10"
          >
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-secondary-400" />
              <h3 className="text-white font-bold text-xl">Why We Verify</h3>
            </div>
            <p className="text-primary-200 text-sm leading-relaxed">
              Email verification helps us create a trusted campus community. Only verified students can access exclusive deals, list items, and use our delivery services. Your privacy is protected and your email is never shared.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
