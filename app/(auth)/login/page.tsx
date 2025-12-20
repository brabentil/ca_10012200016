'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, ShoppingCart, Shield, Truck, Zap, Star, Users, Clock } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, isLoggingIn, loginError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-5/12 flex items-center justify-center p-4 sm:p-6 lg:p-12 bg-white min-h-screen lg:min-h-0">
        <div className="w-full max-w-md">
          {/* Logo & Brand */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-xl flex items-center justify-center shadow-lg">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">ThriftHub</h1>
                <p className="text-xs text-gray-500 font-medium">Sustainable Campus Fashion</p>
              </div>
            </div>
          </motion.div>

          {/* Welcome Text */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-8"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
            <p className="text-sm sm:text-base text-gray-600">Sign in to continue to your account</p>
          </motion.div>

          {/* Login Form */}
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            onSubmit={handleSubmit(onSubmit)} 
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@university.edu.gh"
                {...register('email')}
                className={`h-12 border-2 transition-all ${
                  errors.email 
                    ? 'border-red-500 focus-visible:ring-red-500' 
                    : 'border-gray-200 hover:border-gray-300 focus-visible:border-primary-500 focus-visible:ring-primary-500'
                }`}
              />
              {errors.email && (
                <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                  <span>⚠</span> {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
                <Link 
                  href="/forgot-password" 
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...register('password')}
                  className={`h-12 pr-12 border-2 transition-all ${
                    errors.password
                      ? 'border-red-500 focus-visible:ring-red-500'
                      : 'border-gray-200 hover:border-gray-300 focus-visible:border-primary-500 focus-visible:ring-primary-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                  <span>⚠</span> {errors.password.message}
                </p>
              )}
            </div>

            {loginError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg"
              >
                <p className="text-sm text-red-800 flex items-start gap-2">
                  <span className="text-lg">⚠</span>
                  <span>{loginError.message || 'Invalid email or password. Please try again.'}</span>
                </p>
              </motion.div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white font-semibold text-base shadow-lg shadow-secondary-500/30 hover:shadow-xl hover:shadow-secondary-600/40 transition-all duration-300" 
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </Button>
          </motion.form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">New to ThriftHub?</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-center"
          >
            <Link 
              href="/register"
              className="inline-flex items-center justify-center w-full h-12 px-6 font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 border-2 border-primary-200 hover:border-primary-300 rounded-lg transition-all duration-300"
            >
              Create your account
            </Link>
          </motion.div>

          {/* Security Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-500"
          >
            <Shield className="w-4 h-4 text-green-600" />
            <span>Secure login with 256-bit SSL encryption</span>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Value Proposition */}
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
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white rounded-full"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-between w-full max-w-2xl mx-auto">
          {/* Top Section - Value Props */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mb-12"
            >
              <div className="inline-block px-4 py-2 bg-secondary-500/20 border border-secondary-500/30 rounded-full mb-6">
                <span className="text-secondary-400 font-semibold text-sm">🎉 500+ Students Already Shopping</span>
              </div>
              <h2 className="text-5xl font-bold text-white mb-4 leading-tight">
                Shop Smarter,
                <br />
                <span className="text-secondary-400">Live Sustainable</span>
              </h2>
              <p className="text-xl text-primary-100 leading-relaxed">
                Your campus premier thrift marketplace. Quality fashion, unbeatable prices, delivered to your dorm.
              </p>
            </motion.div>

            {/* Feature Grid */}
            <div className="grid grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="group"
              >
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                  <div className="w-14 h-14 bg-secondary-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Zap className="w-7 h-7 text-secondary-400" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">AI Style Match</h3>
                  <p className="text-primary-200 text-sm">Upload a photo, find your perfect match instantly</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="group"
              >
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                  <div className="w-14 h-14 bg-secondary-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Truck className="w-7 h-7 text-secondary-400" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">Campus Delivery</h3>
                  <p className="text-primary-200 text-sm">Fast delivery to your dorm in under 2 hours</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="group"
              >
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                  <div className="w-14 h-14 bg-secondary-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Clock className="w-7 h-7 text-secondary-400" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">Payday Flex</h3>
                  <p className="text-primary-200 text-sm">Pay 50% now, rest on your payday</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="group"
              >
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                  <div className="w-14 h-14 bg-secondary-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Shield className="w-7 h-7 text-secondary-400" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">Secure Payments</h3>
                  <p className="text-primary-200 text-sm">Protected transactions with Paystack</p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Bottom Section - Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-12"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10">
              <div className="flex items-center gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-secondary-400 text-secondary-400" />
                    ))}
                    <span className="ml-2 text-white font-bold text-lg">4.8/5</span>
                  </div>
                  <p className="text-primary-100 text-sm italic">
                    "Best place to find quality clothes on campus. The AI search is a game changer!"
                  </p>
                  <p className="text-primary-300 text-xs mt-2 font-medium">— Sarah K., Business Student</p>
                </div>
                <div className="w-px h-24 bg-white/20"></div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">95%</div>
                  <div className="text-primary-200 text-sm">Satisfaction<br />Rate</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
