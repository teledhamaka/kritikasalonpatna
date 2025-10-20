// app/components/booking/BookingProgress.tsx
import { FiCheck } from 'react-icons/fi';

type BookingStep = 'cart' | 'address' | 'stylist' | 'time' | 'personalization' | 'payment' | 'confirmation';

interface BookingProgressProps {
  currentStep: BookingStep;
}

const BookingProgress = ({ currentStep }: BookingProgressProps) => {
  const steps: { key: BookingStep; label: string; icon: string }[] = [
    { key: 'cart', label: 'Services', icon: '🛍️' },
    { key: 'address', label: 'Address', icon: '📍' },
    { key: 'stylist', label: 'Stylist', icon: '💇' },
    { key: 'time', label: 'Time', icon: '⏰' },
    { key: 'personalization', label: 'Style', icon: '🎀' },
    { key: 'payment', label: 'Payment', icon: '💳' },
    { key: 'confirmation', label: 'Confirm', icon: '✅' }
  ];

  const currentIndex = steps.findIndex(step => step.key === currentStep);

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        {steps.map((step, index) => (
          <div key={step.key} className="flex flex-col items-center flex-1">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center relative transition-all duration-500 ${
              currentStep === step.key ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg scale-110' : 
              (index < currentIndex ? 'bg-green-500 text-white' : 'bg-white text-gray-400 border-2 border-pink-200')
            }`}>
              {index < currentIndex ? (
                <FiCheck className="w-5 h-5" />
              ) : (
                <span className="text-lg">{step.icon}</span>
              )}
            </div>
            <span className={`text-xs mt-2 text-center font-medium hidden sm:block ${
              currentStep === step.key ? 'text-pink-600' : 
              (index < currentIndex ? 'text-green-600' : 'text-gray-500')
            }`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
      <div className="w-full bg-pink-100 h-3 rounded-full overflow-hidden">
        <div 
          className="bg-gradient-to-r from-pink-500 to-purple-500 h-3 rounded-full transition-all duration-1000 ease-out" 
          style={{ width: `${(currentIndex + 1) * (100 / steps.length)}%` }}
        ></div>
      </div>
    </div>
  );
};

export default BookingProgress;