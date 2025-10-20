// app/components/booking/BookingFlow.tsx
"use client";

import { useState } from 'react';
import BookingProgress from './BookingProgress';
import CartStep from './CartStep';
import AddressStep from './AddressStep';
import StylistStep from './StylistStep';
import TimeStep from './TimeStep';
import PersonalizationStep from './PersonalizationStep'; // New step
import PaymentStep from './PaymentStep';
import ConfirmationStep from './ConfirmationStep';

type BookingStep = 'cart' | 'address' | 'stylist' | 'time' | 'personalization' | 'payment' | 'confirmation';

interface BookingFlowProps {
  onBack: () => void;
}

const BookingFlow = ({ onBack }: BookingFlowProps) => {
  const [currentStep, setCurrentStep] = useState<BookingStep>('cart');

  const nextStep = () => {
    const steps: BookingStep[] = ['cart', 'address', 'stylist', 'time', 'personalization', 'payment', 'confirmation'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: BookingStep[] = ['cart', 'address', 'stylist', 'time', 'personalization', 'payment', 'confirmation'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    } else {
      onBack();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'cart':
        return <CartStep onNext={nextStep} onBack={prevStep} />;
      case 'address':
        return <AddressStep onNext={nextStep} onBack={prevStep} />;
      case 'stylist':
        return <StylistStep onNext={nextStep} onBack={prevStep} />;
      case 'time':
        return <TimeStep onNext={nextStep} onBack={prevStep} />;
      case 'personalization':
        return <PersonalizationStep onNext={nextStep} onBack={prevStep} />;
      case 'payment':
        return <PaymentStep onNext={nextStep} onBack={prevStep} />;
      case 'confirmation':
        return <ConfirmationStep onBack={onBack} />;
      default:
        return <CartStep onNext={nextStep} onBack={prevStep} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <BookingProgress currentStep={currentStep} />
        {renderStep()}
      </div>
    </div>
  );
};

export default BookingFlow;