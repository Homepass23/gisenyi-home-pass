'use client';

import React from 'react';
import { Home, Search, Calendar, CheckCircle } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface BookingStepperProps {
  currentStep: number; // 1-based index (1, 2, 3, or 4)
}

const BookingStepper: React.FC<BookingStepperProps> = ({ currentStep }) => {
  const steps: Step[] = [
    {
      id: 1,
      title: 'Accommodation Search',
      description: 'Find your perfect stay',
      icon: <Search className="w-5 h-5" />
    },
    {
      id: 2,
      title: 'Check Details',
      description: 'Review room information',
      icon: <Home className="w-5 h-5" />
    },
    {
      id: 3,
      title: 'Request Booking',
      description: 'Submit your reservation',
      icon: <Calendar className="w-5 h-5" />
    },
    {
      id: 4,
      title: 'Confirmation',
      description: 'Receive booking confirmation',
      icon: <CheckCircle className="w-5 h-5" />
    }
  ];

  return (
    <div className="bg-gradient-to-r from-sky-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="relative">
          {/* Progress bar background */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 transform -translate-y-1/2 z-0"></div>
          
          {/* Progress bar fill */}
          <div 
            className="absolute top-1/2 left-0 h-1 bg-sky-500 transform -translate-y-1/2 z-0 transition-all duration-500 ease-in-out"
            style={{ 
              width: `${Math.max(0, Math.min(100, ((currentStep - 1) / (steps.length - 1)) * 100))}%` 
            }}
          ></div>

          <div className="relative flex justify-between z-10">
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                  step.id < currentStep 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : step.id === currentStep 
                      ? 'bg-white border-sky-500 text-sky-500 shadow-lg scale-110' 
                      : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  {step.id < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step.icon
                  )}
                </div>
                <div className="mt-3 text-center">
                  <h3 className={`text-sm font-medium ${
                    step.id <= currentStep ? 'text-gray-800' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </h3>
                  <p className={`text-xs mt-1 ${
                    step.id <= currentStep ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingStepper;