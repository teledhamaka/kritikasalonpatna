// kritika/src/components/booking/BookingFlow.tsx
"use client";

import { useState } from 'react';
import { X, Calendar, Clock, User, Phone, MapPin, CreditCard, Check, ChevronLeft, Sparkles } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import Image from 'next/image';

interface BookingFlowProps {
  onBack: () => void;
}

const BookingFlow = ({ onBack }: BookingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const { cart, removeFromCart, getTotalAmount } = useBooking();
  const { profile } = useAuth();

  // Form Data
  const [formData, setFormData] = useState({
    // Step 1: Date & Time
    date: '',
    time: '',
    
    // Step 2: Details
    name: profile?.full_name || '',
    phone: profile?.phone || '',
    address: '',
    stylist: 'any',
    specialInstructions: '',
    
    // Step 3: Payment
    paymentMethod: 'pay_at_salon'
  });

  // Available time slots
  const timeSlots = [
    '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM',
    '04:00 PM', '05:00 PM', '06:00 PM'
  ];

  // Stylist options
  const stylists = [
    { id: 'any', name: 'Any Available Stylist', specialty: 'All Services' },
    { id: 'priya', name: 'Priya Sharma', specialty: 'Bridal Specialist' },
    { id: 'neha', name: 'Neha Singh', specialty: 'HD Makeup Expert' },
    { id: 'riya', name: 'Riya Kumari', specialty: 'Airbrush Specialist' }
  ];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const handleSubmit = async () => {
    // Here you would call your booking API
    console.log('Booking submitted:', {
      cart,
      ...formData,
      totalAmount: getTotalAmount()
    });
    
    // Show success message and redirect
    alert('Booking confirmed! We will call you shortly to confirm.');
    onBack();
  };

  const isStep1Valid = formData.date && formData.time;
  const isStep2Valid = formData.name && formData.phone && formData.address;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={handleBack} className="p-2 hover:bg-white/20 rounded-full transition-all">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-bold">Complete Your Booking</h1>
                <p className="text-xs text-pink-100">Step {currentStep} of 3</p>
              </div>
            </div>
            <button onClick={onBack} className="p-2 hover:bg-white/20 rounded-full transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-pink-100 sticky top-[68px] z-30">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
              <div 
                className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-500"
                style={{ width: `${(currentStep - 1) * 50}%` }}
              />
            </div>

            {/* Step Indicators */}
            {[1, 2, 3].map((step) => (
              <div key={step} className="relative flex flex-col items-center z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  currentStep >= step
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                    : 'bg-white border-2 border-gray-300 text-gray-400'
                }`}>
                  {currentStep > step ? <Check className="w-5 h-5" /> : step}
                </div>
                <span className={`text-xs mt-2 font-medium ${
                  currentStep >= step ? 'text-pink-600' : 'text-gray-400'
                }`}>
                  {step === 1 ? 'Date & Time' : step === 2 ? 'Details' : 'Payment'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              
              {/* STEP 1: Date & Time */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Calendar className="w-6 h-6 text-pink-600" />
                      Select Date & Time
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">Choose your preferred appointment slot</p>
                  </div>

                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Select Date
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Time Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Select Time Slot
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setFormData({ ...formData, time })}
                          className={`py-3 rounded-lg text-sm font-medium transition-all ${
                            formData.time === time
                              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={!isStep1Valid}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    Continue to Details
                  </button>
                </div>
              )}

              {/* STEP 2: Personal Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <User className="w-6 h-6 text-pink-600" />
                      Your Details
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">Tell us about yourself</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter your name"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Address *
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Enter your complete address"
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Stylist Preference (Optional)
                    </label>
                    <select
                      value={formData.stylist}
                      onChange={(e) => setFormData({ ...formData, stylist: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    >
                      {stylists.map((stylist) => (
                        <option key={stylist.id} value={stylist.id}>
                          {stylist.name} - {stylist.specialty}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Special Instructions (Optional)
                    </label>
                    <textarea
                      value={formData.specialInstructions}
                      onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                      placeholder="Any allergies, preferences, or special requests?"
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleBack}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={!isStep2Valid}
                      className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Payment */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <CreditCard className="w-6 h-6 text-pink-600" />
                      Payment Method
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">Choose how you'd like to pay</p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => setFormData({ ...formData, paymentMethod: 'pay_at_salon' })}
                      className={`w-full p-4 border-2 rounded-xl text-left transition-all ${
                        formData.paymentMethod === 'pay_at_salon'
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            formData.paymentMethod === 'pay_at_salon'
                              ? 'border-pink-500 bg-pink-500'
                              : 'border-gray-300'
                          }`}>
                            {formData.paymentMethod === 'pay_at_salon' && (
                              <div className="w-3 h-3 bg-white rounded-full" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Pay at Salon</p>
                            <p className="text-sm text-gray-600">Cash or UPI after service</p>
                          </div>
                        </div>
                        <span className="text-green-600 font-semibold text-sm">Recommended</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setFormData({ ...formData, paymentMethod: 'pay_online' })}
                      className={`w-full p-4 border-2 rounded-xl text-left transition-all ${
                        formData.paymentMethod === 'pay_online'
                          ? 'border-pink-500 bg-pink-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          formData.paymentMethod === 'pay_online'
                            ? 'border-pink-500 bg-pink-500'
                            : 'border-gray-300'
                        }`}>
                          {formData.paymentMethod === 'pay_online' && (
                            <div className="w-3 h-3 bg-white rounded-full" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Pay Online Now</p>
                          <p className="text-sm text-gray-600">Secure payment via Razorpay</p>
                        </div>
                      </div>
                    </button>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleBack}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      Confirm Booking
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-32">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-600" />
                Order Summary
              </h3>

              {/* Services */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 line-clamp-2">
                        {item.title.split('|')[0].trim()}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">{item.durationText}</p>
                      <p className="text-pink-600 font-bold text-sm mt-1">₹{item.price}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Booking Details */}
              {currentStep > 1 && formData.date && formData.time && (
                <div className="space-y-2 mb-4 p-3 bg-pink-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-pink-600" />
                    <span className="text-gray-700">{new Date(formData.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-pink-600" />
                    <span className="text-gray-700">{formData.time}</span>
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">₹{getTotalAmount()}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">GST (18%)</span>
                  <span className="font-semibold">₹{Math.round(getTotalAmount() * 0.18)}</span>
                </div>
                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-pink-600">₹{Math.round(getTotalAmount() * 1.18)}</span>
                </div>
              </div>

              {/* Contact */}
              <div className="mt-4 p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-2">Need help?</p>
                <a href="tel:+919650461390" className="flex items-center gap-2 text-sm font-semibold text-pink-600 hover:text-pink-700">
                  <Phone className="w-4 h-4" />
                  +91 96504 61390
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingFlow;