'use client';

import { motion } from 'framer-motion';
import { MapPin, CreditCard, CheckCircle, Check } from 'lucide-react';

export type CheckoutStep = 'address' | 'payment' | 'confirm';

interface CheckoutStepperProps {
  currentStep: CheckoutStep;
}

interface Step {
  id: CheckoutStep;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  number: number;
}

const steps: Step[] = [
  { id: 'address', label: 'Delivery Address', icon: MapPin, number: 1 },
  { id: 'payment', label: 'Payment Method', icon: CreditCard, number: 2 },
  { id: 'confirm', label: 'Confirm Order', icon: CheckCircle, number: 3 },
];

export default function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  const isStepComplete = (stepIndex: number) => stepIndex < currentStepIndex;
  const isStepActive = (stepIndex: number) => stepIndex === currentStepIndex;

  return (
    <div className="w-full py-6 px-4 md:px-8 bg-white border-b-2 border-gray-200">
      <div className="max-w-4xl mx-auto">
        {/* Desktop Stepper */}
        <div className="hidden md:flex items-center justify-between">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const complete = isStepComplete(index);
            const active = isStepActive(index);

            return (
              <div key={step.id} className="flex items-center flex-1">
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-3 transition-all duration-300 ${
                        complete
                          ? 'bg-green-500 border-green-500'
                          : active
                          ? 'bg-primary-500 border-primary-500'
                          : 'bg-gray-100 border-gray-300'
                      }`}
                    >
                      {complete ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 200 }}
                        >
                          <Check className="w-6 h-6 text-white" />
                        </motion.div>
                      ) : (
                        <StepIcon
                          className={`w-6 h-6 ${
                            active ? 'text-white' : 'text-gray-400'
                          }`}
                        />
                      )}
                    </div>

                    {/* Active Step Pulse */}
                    {active && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-primary-500 opacity-30"
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.3, 0, 0.3],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                    )}
                  </motion.div>

                  {/* Step Label */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.1 }}
                    className="mt-3 text-center"
                  >
                    <p
                      className={`text-sm font-semibold transition-colors ${
                        complete || active
                          ? 'text-gray-900'
                          : 'text-gray-500'
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Step {step.number} of 3
                    </p>
                  </motion.div>
                </div>

                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 px-4 pb-8">
                    <div className="relative h-1 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className={`absolute inset-y-0 left-0 rounded-full ${
                          complete ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                        initial={{ width: '0%' }}
                        animate={{ width: complete ? '100%' : '0%' }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile Stepper */}
        <div className="md:hidden">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-900">
                {steps[currentStepIndex].label}
              </p>
              <p className="text-xs text-gray-600">
                Step {currentStepIndex + 1} of {steps.length}
              </p>
            </div>
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-primary-500 rounded-full"
                initial={{ width: '0%' }}
                animate={{
                  width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Step Icons */}
          <div className="flex items-center justify-between px-2">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const complete = isStepComplete(index);
              const active = isStepActive(index);

              return (
                <motion.div
                  key={step.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      complete
                        ? 'bg-green-500 border-green-500'
                        : active
                        ? 'bg-primary-500 border-primary-500'
                        : 'bg-gray-100 border-gray-300'
                    }`}
                  >
                    {complete ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <StepIcon
                        className={`w-5 h-5 ${
                          active ? 'text-white' : 'text-gray-400'
                        }`}
                      />
                    )}
                  </div>
                  <p
                    className={`text-xs mt-1.5 font-medium ${
                      complete || active ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {step.number}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Step Instructions */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {currentStepIndex + 1}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900">
                {currentStep === 'address' && 'Enter your delivery address'}
                {currentStep === 'payment' && 'Choose your payment method'}
                {currentStep === 'confirm' && 'Review and confirm your order'}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                {currentStep === 'address' &&
                  'Provide your campus zone, dormitory, and room number for delivery'}
                {currentStep === 'payment' &&
                  'Select between Mobile Money or Payday Flex installment payment'}
                {currentStep === 'confirm' &&
                  'Check all details before completing your purchase'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
