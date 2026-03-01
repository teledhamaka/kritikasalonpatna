// app/book/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Crown, Star, Flower, Camera } from 'lucide-react';
import BookingFlow from '@/components/booking/BookingFlow';
import Image from 'next/image';

const BookPage: React.FC = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [selectedServices, setSelectedServices] = useState<any[]>([]);

  useEffect(() => {
    // Load any pre-selected services from URL params or localStorage
    const params = new URLSearchParams(window.location.search);
    const serviceId = params.get('service');
    
    if (serviceId) {
      // You can fetch service details here or from context
      console.log('Pre-selected service:', serviceId);
    }
  }, []);

  const handleBack = () => {
    window.history.back();
  };

  const handleWhatsAppBooking = () => {
    const message = `Hi! I want to book an appointment at Kritika Salon. Can you help me?`;
    window.open(`https://wa.me/919650461390?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleCall = () => {
    window.location.href = 'tel:+919650461390';
  };

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-lavender-50 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full"
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-bold mb-6 shadow-lg">
              <Sparkles className="w-4 h-4 mr-2" />
              Book Your Glow-Up ✨
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Your Beauty Journey Starts{' '}
              <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                Here
              </span>
            </h1>
            
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Step into a world of luxury beauty services. Book your appointment with Patna's most trusted salon.
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { label: 'Happy Clients', value: '5000+', icon: '😊', color: 'from-rose-400 to-pink-400' },
              { label: 'Expert Stylists', value: '25+', icon: '👩‍🎨', color: 'from-purple-400 to-pink-400' },
              { label: '5 Star Rating', value: '4.9/5', icon: '⭐', color: 'from-yellow-400 to-orange-400' },
              { label: 'Services', value: '100+', icon: '💅', color: 'from-blue-400 to-cyan-400' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`bg-gradient-to-r ${stat.color} text-white p-6 rounded-2xl shadow-lg`}
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm opacity-90">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Booking Options */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Self-Booking Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-rose-100"
            >
              <div className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Self-Booking Portal
                </h3>
                <p className="text-gray-600 mb-6">
                  Choose your services, stylist, and time at your own pace. Perfect for planning ahead!
                </p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-700">
                    <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-rose-600">✓</span>
                    </div>
                    <span>Choose from 100+ services</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-rose-600">✓</span>
                    </div>
                    <span>Select your preferred stylist</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-rose-600">✓</span>
                    </div>
                    <span>Personalize your experience</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowWelcome(false)}
                  className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all"
                >
                  Start Self-Booking
                </button>
              </div>
            </motion.div>

            {/* Quick Booking Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl shadow-2xl overflow-hidden border-2 border-purple-100"
            >
              <div className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Quick Booking
                </h3>
                <p className="text-gray-600 mb-6">
                  Need help or want to book immediately? Connect with our beauty consultants!
                </p>
                
                <div className="space-y-4 mb-6">
                  <button
                    onClick={handleWhatsAppBooking}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <span>💬</span>
                    Book via WhatsApp
                  </button>
                  
                  <button
                    onClick={handleCall}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <span>📞</span>
                    Call Now (+91 9650461390)
                  </button>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Average response time: <span className="font-bold text-green-600">2 minutes</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Testimonials */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12"
          >
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
              Why Clients Love Booking With Us 💖
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  text: 'The booking process was so smooth! I got exactly what I wanted.',
                  name: 'Priya Sharma',
                  rating: 5,
                  image: '/images/testimonials/1.jpg'
                },
                {
                  text: 'Being able to choose my stylist made all the difference!',
                  name: 'Riya Patel',
                  rating: 5,
                  image: '/images/testimonials/2.jpg'
                },
                {
                  text: 'The personalization options made my experience special.',
                  name: 'Anjali Singh',
                  rating: 5,
                  image: '/images/testimonials/3.jpg'
                }
              ].map((testimonial, index) => (
                <div key={index} className="bg-white p-6 rounded-2xl shadow-lg border border-rose-100">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{testimonial.name}</div>
                      <div className="flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">"{testimonial.text}"</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-3xl p-8 text-center text-white shadow-2xl"
          >
            <h3 className="text-2xl font-bold mb-4">
              Get 25% Off Your First Booking! 🎁
            </h3>
            <p className="mb-6 text-rose-100 max-w-2xl mx-auto">
              Book now and enjoy exclusive benefits: 25% discount + free consultation + priority booking
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowWelcome(false)}
                className="bg-white text-rose-600 px-8 py-3 rounded-full font-bold hover:shadow-xl hover:scale-105 transition-all"
              >
                Claim Your Discount
              </button>
              <button
                onClick={handleWhatsAppBooking}
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white/10 transition-all"
              >
                Chat With Us
              </button>
            </div>
          </motion.div>

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center mt-12 pt-8 border-t border-rose-100"
          >
            <p className="text-gray-500 text-sm">
              Need help? Call us at <a href="tel:+919650461390" className="text-rose-600 font-bold">+91 9650461390</a> or{' '}
              <a href="mailto:info@kritikasalon.com" className="text-rose-600 font-bold">info@kritikasalon.com</a>
            </p>
            <p className="text-gray-400 text-xs mt-2">
              ⏰ Open 9:00 AM - 8:00 PM, 7 days a week
            </p>
          </motion.div>
        </div>

        {/* Floating Social Proof */}
        <div className="fixed bottom-4 right-4 z-20">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-rose-100">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  KS
                </div>
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <p className="font-bold text-gray-800">Live Support</p>
                <p className="text-xs text-gray-500">Online now</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Booking Flow
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-lavender-50 relative">
      {/* Glitter Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: 0.3,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <BookingFlow onBack={handleBack} />
      </div>

      {/* Live Support Floating Button */}
      <button
        onClick={handleWhatsAppBooking}
        className="fixed bottom-24 right-6 z-50 bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all animate-bounce"
      >
        <div className="relative">
          <span className="text-2xl">💬</span>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
        </div>
      </button>
    </div>
  );
}

export default BookPage;