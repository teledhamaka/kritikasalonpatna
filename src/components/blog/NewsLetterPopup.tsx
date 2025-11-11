// ========================================
// components/blog/NewsletterPopup.tsx
// ========================================
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Sparkles } from 'lucide-react';

export default function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Show popup after 10 seconds if not dismissed before
    const hasSeenPopup = localStorage.getItem('newsletter_seen');
    
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('newsletter_seen', 'true');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Call API to save email
    try {
      await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      setSubmitted(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error('Newsletter error:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative">
              
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
              >
                <X size={24} />
              </button>

              {/* Content */}
              <div className="p-8">
                
                {!submitted ? (
                  <>
                    {/* Icon */}
                    <div className="w-16 h-16 bg-linear-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Sparkles size={32} className="text-white" />
                    </div>

                    {/* Heading */}
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-3">
                      Get Beauty Tips in Your Inbox! 💌
                    </h3>
                    
                    <p className="text-gray-600 text-center mb-6">
                      Subscribe karein aur weekly beauty tips, exclusive offers aur latest trends paayen!
                    </p>

                    {/* Benefits */}
                    <div className="bg-pink-50 rounded-2xl p-4 mb-6 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="text-pink-500">✓</span>
                        <span>Weekly beauty tips & tutorials</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="text-pink-500">✓</span>
                        <span>Exclusive salon discounts</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="text-pink-500">✓</span>
                        <span>Early access to new services</span>
                      </div>
                    </div>

                    {/* Email Input */}
                    <div className="space-y-3">
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          required
                          className="w-full pl-12 pr-4 py-3 border-2 border-pink-200 rounded-xl focus:border-pink-500 focus:ring-4 focus:ring-pink-100 outline-none transition-all"
                        />
                      </div>
                      
                      <button
                        onClick={handleSubmit}
                        disabled={!email}
                        className="w-full py-3 bg-linear-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Subscribe Now 💖
                      </button>
                    </div>

                    <p className="text-xs text-gray-500 text-center mt-4">
                      No spam, unsubscribe anytime
                    </p>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">
                      Subscribed Successfully! 🎉
                    </h4>
                    <p className="text-gray-600">
                      Check your inbox for confirmation email
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}