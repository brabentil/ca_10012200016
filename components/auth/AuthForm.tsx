'use client';

import { ReactNode } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface AuthFormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'tel';
  placeholder: string;
  required?: boolean;
  helperText?: string;
  icon?: ReactNode;
}

interface AuthFormProps {
  form: UseFormReturn<any>;
  onSubmit: (data: any) => void;
  fields: AuthFormField[];
  submitLabel: string;
  isSubmitting: boolean;
  error?: string | null;
  children?: ReactNode;
}

export default function AuthForm({
  form,
  onSubmit,
  fields,
  submitLabel,
  isSubmitting,
  error,
  children,
}: AuthFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      {fields.map((field, index) => (
        <motion.div
          key={field.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 * index, duration: 0.4 }}
          className="space-y-2"
        >
          <Label htmlFor={field.name} className="text-sm font-semibold text-gray-700">
            {field.label}
            {!field.required && (
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
            )}
          </Label>

          <div className="relative">
            {field.icon && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                {field.icon}
              </div>
            )}
            <Input
              id={field.name}
              type={field.type}
              placeholder={field.placeholder}
              {...register(field.name)}
              className={`h-11 border-2 transition-all ${
                field.icon ? 'pl-11' : ''
              } ${
                errors[field.name]
                  ? 'border-red-500 focus-visible:ring-red-500'
                  : 'border-gray-200 hover:border-gray-300 focus-visible:border-primary-500 focus-visible:ring-primary-500'
              }`}
            />
          </div>

          {errors[field.name] && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <span>⚠</span> {errors[field.name]?.message as string}
            </p>
          )}

          {field.helperText && !errors[field.name] && (
            <p className="text-xs text-gray-500">{field.helperText}</p>
          )}
        </motion.div>
      ))}

      {/* Custom children (e.g., password visibility toggle, additional fields) */}
      {children}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg"
        >
          <p className="text-sm text-red-800 flex items-start gap-2">
            <span className="text-lg">⚠</span>
            <span>{error}</span>
          </p>
        </motion.div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full h-12 bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white font-semibold text-base shadow-lg shadow-secondary-500/30 hover:shadow-xl hover:shadow-secondary-600/40 transition-all duration-300"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </span>
        ) : (
          submitLabel
        )}
      </Button>
    </motion.form>
  );
}
