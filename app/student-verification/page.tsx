'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/ui/back-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { 
  Mail, 
  Shield, 
  IdCard,
  MapPin
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import Link from 'next/link';

const CAMPUS_OPTIONS = [
  'University of Ghana, Legon',
  'Ashesi University',
  'University of Professional Studies, Accra',
  'Central University',
  'Academic City University',
  'Ghana Institute of Journalism',
];

const verificationSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  campus: z.string().min(1, 'Campus is required'),
});

type VerificationFormData = z.infer<typeof verificationSchema>;

export default function StudentVerificationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
  });

  const onSubmit = async (data: VerificationFormData) => {
    try {
      setIsSubmitting(true);

      const response = await apiClient.post('/verification/request', data);

      if (response.data.success) {
        toast.success('Verification code sent! Check your registered email.');
        // Redirect to verify page
        router.push('/verify');
      }
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Failed to send verification code. Please try again.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Back Button */}
        <BackButton href="/profile" label="Back to Profile" className="mb-6" />

        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full mb-4 shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Student Verification
              </h1>
              <p className="text-gray-600">
                Verify your student status to unlock exclusive benefits
              </p>
            </div>

            {/* Verification Form */}
            <Card className="p-6 sm:p-8 border-2 border-gray-200 shadow-xl">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Student ID */}
                <div className="space-y-2">
                  <Label htmlFor="studentId" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <IdCard className="w-4 h-4 text-primary-600" />
                    Student ID
                  </Label>
                  <Input
                    id="studentId"
                    type="text"
                    placeholder="10123456"
                    {...register('studentId')}
                    className={`h-11 border-2 transition-all ${
                      errors.studentId
                        ? 'border-red-500 focus-visible:ring-red-500'
                        : 'border-gray-200 hover:border-gray-300 focus-visible:border-primary-500'
                    }`}
                  />
                  {errors.studentId && (
                    <p className="text-sm text-red-600">{errors.studentId.message}</p>
                  )}
                </div>

                {/* Campus */}
                <div className="space-y-2">
                  <Label htmlFor="campus" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary-600" />
                    Campus
                  </Label>
                  <select
                    id="campus"
                    {...register('campus')}
                    className={`w-full h-11 px-3 border-2 rounded-md transition-all bg-white ${
                      errors.campus
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-200 hover:border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500'
                    }`}
                  >
                    <option value="">Select your campus</option>
                    {CAMPUS_OPTIONS.map((campus) => (
                      <option key={campus} value={campus}>
                        {campus}
                      </option>
                    ))}
                  </select>
                  {errors.campus && (
                    <p className="text-sm text-red-600">{errors.campus.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold shadow-lg text-base"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Sending Verification Code...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5 mr-2" />
                      Send Verification Code
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-gray-500">
                  A 6-digit verification code will be sent to your educational email.
                  <br />
                  Please check your inbox and spam folder.
                </p>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
