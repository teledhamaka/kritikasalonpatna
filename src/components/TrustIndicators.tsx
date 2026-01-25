// app/components/TrustIndicators.tsx - SERVER COMPONENT
import { Award, Clock, Users, Shield } from 'lucide-react';

const TrustIndicators = () => {
  const indicators = [
    { 
      icon: <Award className="w-6 h-6 text-pink-600" />, 
      value: "4.8/5", 
      label: "Customer Rating" 
    },
    { 
      icon: <Users className="w-6 h-6 text-pink-600" />, 
      value: "5000+", 
      label: "Happy Clients" 
    },
    { 
      icon: <Clock className="w-6 h-6 text-pink-600" />, 
      value: "10 AM - 9 PM", 
      label: "Working Hours" 
    },
    { 
      icon: <Shield className="w-6 h-6 text-pink-600" />, 
      value: "100%", 
      label: "Hygiene & Safety" 
    },
  ];

  return (
    <section className="py-8 bg-gray-50 rounded-2xl my-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {indicators.map((indicator, index) => (
          <div key={index} className="text-center p-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-pink-50 rounded-full mb-3">
              {indicator.icon}
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {indicator.value}
            </div>
            <div className="text-sm text-gray-600">
              {indicator.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrustIndicators;