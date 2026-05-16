import React, { useState } from 'react';
import { Calendar, Clock, User, Phone, Mail, MapPin, CheckCircle, ArrowLeft, ChevronRight } from 'lucide-react';

const BookingFlow = () => {
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    service: '',
    date: '',
    time: '',
    name: '',
    phone: '',
    email: ''
  });

  // Sample services
  const services = [
    { id: 1, name: 'Bridal Makeup', price: 15000, duration: '3 hours', emoji: '👰' },
    { id: 2, name: 'Party Makeup', price: 3500, duration: '90 min', emoji: '💄' },
    { id: 3, name: 'Hair Spa', price: 1500, duration: '60 min', emoji: '✨' },
    { id: 4, name: 'Facial', price: 1200, duration: '45 min', emoji: '🌸' },
    { id: 5, name: 'Manicure & Pedicure', price: 1800, duration: '90 min', emoji: '💅' },
  ];

  // Available time slots
  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'
  ];

  // Get next 7 days
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        full: date,
        display: date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
        value: date.toISOString().split('T')[0]
      });
    }
    return dates;
  };

  const availableDates = getAvailableDates();

  const handleSubmit = () => {
    const selectedService = services.find(s => s.name === bookingData.service);
    const message = `
🎀 New Booking Request 🎀

Service: ${bookingData.service}
Price: ₹${selectedService?.price}
Date: ${bookingData.date}
Time: ${bookingData.time}

Customer Details:
Name: ${bookingData.name}
Phone: ${bookingData.phone}
Email: ${bookingData.email}

Please confirm availability.
    `.trim();

    const whatsappUrl = `https://wa.me/919650461390?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const canProceed = () => {
    switch(step) {
      case 1: return bookingData.service !== '';
      case 2: return bookingData.date !== '';
      case 3: return bookingData.time !== '';
      case 4: return bookingData.name && bookingData.phone;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 pb-20">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white sticky top-0 z-30 shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => step > 1 ? setStep(step - 1) : window.history.back()}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold">Book Appointment</h1>
              <p className="text-xs text-pink-100">Step {step} of 4</p>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-1 bg-white/20">
          <div 
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        
        {/* STEP 1: Select Service */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Choose Your Service</h2>
            <p className="text-gray-600 mb-6">Select the service you'd like to book</p>
            
            <div className="space-y-3">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setBookingData({...bookingData, service: service.name})}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    bookingData.service === service.name
                      ? 'border-pink-500 bg-pink-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-pink-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-3xl">{service.emoji}</span>
                      <div>
                        <p className="font-bold text-gray-800">{service.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-gray-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {service.duration}
                          </span>
                          <span className="text-sm font-bold text-pink-600">₹{service.price}</span>
                        </div>
                      </div>
                    </div>
                    {bookingData.service === service.name && (
                      <CheckCircle className="w-6 h-6 text-pink-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Select Date */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Pick a Date</h2>
            <p className="text-gray-600 mb-6">When would you like to visit?</p>
            
            <div className="grid grid-cols-2 gap-3">
              {availableDates.map((date, idx) => (
                <button
                  key={idx}
                  onClick={() => setBookingData({...bookingData, date: date.value})}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    bookingData.date === date.value
                      ? 'border-pink-500 bg-pink-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-pink-300 hover:shadow-sm'
                  }`}
                >
                  <div className="text-center">
                    <Calendar className={`w-6 h-6 mx-auto mb-2 ${
                      bookingData.date === date.value ? 'text-pink-500' : 'text-gray-400'
                    }`} />
                    <p className="font-bold text-gray-800 text-sm">{date.display}</p>
                    {idx === 0 && <p className="text-xs text-pink-600 mt-1">Today</p>}
                  </div>
                </button>
              ))}
            </div>

            {/* Selected service summary */}
            <div className="mt-6 p-4 bg-pink-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Selected Service</p>
              <p className="font-bold text-gray-800">{bookingData.service}</p>
            </div>
          </div>
        )}

        {/* STEP 3: Select Time */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Choose Time Slot</h2>
            <p className="text-gray-600 mb-6">Select your preferred time</p>
            
            <div className="grid grid-cols-3 gap-3">
              {timeSlots.map((time, idx) => (
                <button
                  key={idx}
                  onClick={() => setBookingData({...bookingData, time: time})}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    bookingData.time === time
                      ? 'border-pink-500 bg-pink-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-pink-300 hover:shadow-sm'
                  }`}
                >
                  <Clock className={`w-5 h-5 mx-auto mb-1 ${
                    bookingData.time === time ? 'text-pink-500' : 'text-gray-400'
                  }`} />
                  <p className={`text-sm font-bold ${
                    bookingData.time === time ? 'text-pink-600' : 'text-gray-700'
                  }`}>{time}</p>
                </button>
              ))}
            </div>

            {/* Booking summary */}
            <div className="mt-6 p-4 bg-pink-50 rounded-xl space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Service:</span>
                <span className="font-bold text-gray-800">{bookingData.service}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Date:</span>
                <span className="font-bold text-gray-800">
                  {availableDates.find(d => d.value === bookingData.date)?.display}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Contact Details */}
        {step === 4 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Details</h2>
            <p className="text-gray-600 mb-6">We'll confirm your booking via WhatsApp</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={bookingData.name}
                    onChange={(e) => setBookingData({...bookingData, name: e.target.value})}
                    placeholder="Enter your name"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={bookingData.phone}
                    onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                    placeholder="+91 9876543210"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (Optional)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={bookingData.email}
                    onChange={(e) => setBookingData({...bookingData, email: e.target.value})}
                    placeholder="your.email@example.com"
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Final Summary */}
            <div className="mt-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-5 border-2 border-pink-200">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-pink-500" />
                Booking Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-bold text-gray-800">{bookingData.service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-bold text-gray-800">
                    {availableDates.find(d => d.value === bookingData.date)?.display}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-bold text-gray-800">{bookingData.time}</span>
                </div>
                <div className="border-t border-pink-200 pt-2 mt-2 flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-bold text-pink-600 text-lg">
                    ₹{services.find(s => s.name === bookingData.service)?.price}
                  </span>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-gray-600">
                <strong>Note:</strong> This is a booking request. We'll confirm availability via WhatsApp within 5 minutes.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-20">
          <div className="max-w-2xl mx-auto flex gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            )}
            
            {step < 4 ? (
              <button
                onClick={() => canProceed() && setStep(step + 1)}
                disabled={!canProceed()}
                className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  canProceed()
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed()}
                className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  canProceed()
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Confirm via WhatsApp
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingFlow;