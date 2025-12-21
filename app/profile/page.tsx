'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  LogOut, 
  CheckCircle2, 
  AlertCircle,
  Camera,
  ShoppingBag
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, setUser } = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Fetch fresh user data including verification status
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiClient.get('/auth/me');
        if (response.data.success && response.data.data) {
          setUser(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setIsLoadingUser(false);
      }
    };

    if (user) {
      fetchUserData();
    } else {
      setIsLoadingUser(false);
    }
  }, [setUser]);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user && !isLoadingUser) {
      router.push('/login');
    }
  }, [user, router, isLoadingUser]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsUpdating(true);

      const response = await apiClient.patch('/auth/profile', data);

      if (response.data.success) {
        setUser(response.data.data);
        toast.success('Profile updated successfully!');
      }
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Failed to update profile. Please try again.';
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRequestVerification = async () => {
    // Redirect to student verification page to collect required info
    router.push('/student-verification');
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">
          {/* Profile Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-6 sm:p-8 border-2 border-gray-200">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {user.firstName?.charAt(0) || 'U'}{user.lastName?.charAt(0) || 'U'}
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-secondary-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-secondary-600 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                {/* User Info */}
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-gray-600 flex items-center gap-2 justify-center sm:justify-start mb-3">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </p>

                  {/* Verification Status */}
                  {user.verification?.status === 'VERIFIED' ? (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-semibold text-sm">Verified Student</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-semibold text-sm">Not Verified</span>
                      </div>
                      <div>
                        <Button
                          onClick={handleRequestVerification}
                          className="bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white shadow-lg"
                        >
                          Verify Student Email
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex gap-4 sm:gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-700">0</div>
                    <div className="text-xs text-gray-500">Orders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-700">0</div>
                    <div className="text-xs text-gray-500">Wishlist</div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Edit Profile Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Card className="p-6 sm:p-8 border-2 border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-700" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                  <p className="text-sm text-gray-600">Update your profile details</p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      {...register('firstName')}
                      className={`h-11 border-2 transition-all ${
                        errors.firstName
                          ? 'border-red-500 focus-visible:ring-red-500'
                          : 'border-gray-200 hover:border-gray-300 focus-visible:border-primary-500'
                      }`}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      {...register('lastName')}
                      className={`h-11 border-2 transition-all ${
                        errors.lastName
                          ? 'border-red-500 focus-visible:ring-red-500'
                          : 'border-gray-200 hover:border-gray-300 focus-visible:border-primary-500'
                      }`}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                    className="h-11 border-2 border-gray-200 bg-gray-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Email cannot be changed for security reasons
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                    Phone Number <span className="text-gray-400 font-normal">(optional)</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+233 XX XXX XXXX"
                      {...register('phone')}
                      className="h-11 pl-11 border-2 border-gray-200 hover:border-gray-300 focus-visible:border-primary-500 transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 h-11 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold shadow-lg"
                  >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => reset()}
                    className="h-11 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>

          {/* Account Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card className="p-6 sm:p-8 border-2 border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-secondary-700" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Account Security</h3>
                  <p className="text-sm text-gray-600">Manage your password and security settings</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">Password</p>
                    <p className="text-sm text-gray-600">Last changed: Never</p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-2 border-primary-200 text-primary-700 hover:bg-primary-50"
                  >
                    Change Password
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-600">Not enabled</p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-2 border-primary-200 text-primary-700 hover:bg-primary-50"
                  >
                    Enable 2FA
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="p-6 sm:p-8 border-2 border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center gap-2 border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50"
                  onClick={() => router.push('/orders')}
                >
                  <ShoppingBag className="w-6 h-6 text-primary-700" />
                  <span className="font-semibold">My Orders</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center gap-2 border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50"
                  onClick={() => router.push('/wishlist')}
                >
                  <svg className="w-6 h-6 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="font-semibold">Wishlist</span>
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
