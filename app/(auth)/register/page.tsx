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
import { Eye, EyeOff, ShoppingCart, Check, Shield, Sparkles, Gift, TrendingUp } from 'lucide-react';

const registerSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
  phone_number: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser, isRegistering, registerError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormData) => {
    const { confirmPassword, ...registerData } = data;
    registerUser(registerData);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Left Side - Registration Form */}
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
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Create your account</h2>
            <p className="text-sm sm:text-base text-gray-600">Join 200+ students shopping sustainably</p>
          </motion.div>

          {/* Registration Form */}
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            onSubmit={handleSubmit(onSubmit)} 
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-sm font-semibold text-gray-700">First name</Label>
                <Input
                  id="first_name"
                  type="text"
                  placeholder="John"
                  {...register('first_name')}
                  className={`h-11 border-2 transition-all ${
                    errors.first_name 
                      ? 'border-red-500 focus-visible:ring-red-500' 
                      : 'border-gray-200 hover:border-gray-300 focus-visible:border-primary-500 focus-visible:ring-primary-500'
                  }`}
                />
                {errors.first_name && (
                  <p className="text-xs text-red-600">{errors.first_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-sm font-semibold text-gray-700">Last name</Label>
                <Input
                  id="last_name"
                  type="text"
                  placeholder="Doe"
                  {...register('last_name')}
                  className={`h-11 border-2 transition-all ${
                    errors.last_name 
                      ? 'border-red-500 focus-visible:ring-red-500' 
                      : 'border-gray-200 hover:border-gray-300 focus-visible:border-primary-500 focus-visible:ring-primary-500'
                  }`}
                />
                {errors.last_name && (
                  <p className="text-xs text-red-600">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@university.edu.gh"
                {...register('email')}
                className={`h-11 border-2 transition-all ${
                  errors.email 
                    ? 'border-red-500 focus-visible:ring-red-500' 
                    : 'border-gray-200 hover:border-gray-300 focus-visible:border-primary-500 focus-visible:ring-primary-500'
                }`}
              />
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email.message}</p>
              )}
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Check className="w-3 h-3 text-green-600" />
                Use your .edu.gh email for student verification
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number" className="text-sm font-semibold text-gray-700">
                Phone number <span className="text-gray-400 font-normal">(optional)</span>
              </Label>
              <Input
                id="phone_number"
                type="tel"
                placeholder="+233 XX XXX XXXX"
                {...register('phone_number')}
                className="h-11 border-2 border-gray-200 hover:border-gray-300 focus-visible:border-primary-500 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  {...register('password')}
                  className={`h-11 pr-11 border-2 transition-all ${
                    errors.password 
                      ? 'border-red-500 focus-visible:ring-red-500' 
                      : 'border-gray-200 hover:border-gray-300 focus-visible:border-primary-500 focus-visible:ring-primary-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">Confirm password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  {...register('confirmPassword')}
                  className={`h-11 pr-11 border-2 transition-all ${
                    errors.confirmPassword
                      ? 'border-red-500 focus-visible:ring-red-500' 
                      : 'border-gray-200 hover:border-gray-300 focus-visible:border-primary-500 focus-visible:ring-primary-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {registerError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg"
              >
                <p className="text-sm text-red-800">{registerError.message || 'Registration failed. Please try again.'}</p>
              </motion.div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white font-semibold text-base shadow-lg shadow-secondary-500/30 hover:shadow-xl hover:shadow-secondary-600/40 transition-all duration-300" 
              disabled={isRegistering}
            >
              {isRegistering ? 'Creating account...' : 'Create account'}
            </Button>

            <p className="text-xs text-center text-gray-500 pt-2">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="text-primary-600 hover:underline font-medium">Terms</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-primary-600 hover:underline font-medium">Privacy Policy</Link>
            </p>
          </motion.form>

          {/* Login Link */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-6 text-center text-sm text-gray-600"
          >
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              Sign in
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
              <span className="text-secondary-400 font-semibold text-sm">🎉 Join 200+ Students</span>
            </div>
            <h2 className="text-5xl font-bold text-white mb-4 leading-tight">
              Welcome to the
              <br />
              <span className="text-secondary-400">Thrift Revolution</span>
            </h2>
            <p className="text-xl text-primary-100 leading-relaxed">
              Get exclusive access to campus deals, AI-powered style matching, and flexible payment options.
            </p>
          </motion.div>

          {/* Benefits List */}
          <div className="space-y-6 mb-12">
            {[
              { icon: Gift, title: 'Welcome Bonus', desc: 'Get ₵20 off your first purchase' },
              { icon: Sparkles, title: 'AI Style Matcher', desc: 'Find your perfect match with photo search' },
              { icon: TrendingUp, title: 'Student Perks', desc: 'Exclusive discounts with .edu.gh email' },
              { icon: Shield, title: 'Secure & Fast', desc: 'Protected payments & 2-hour campus delivery' }
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
            className="grid grid-cols-3 gap-6"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">500+</div>
              <div className="text-primary-200 text-sm">Items</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">₵50K+</div>
              <div className="text-primary-200 text-sm">Saved by Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">98%</div>
              <div className="text-primary-200 text-sm">Happy Customers</div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
