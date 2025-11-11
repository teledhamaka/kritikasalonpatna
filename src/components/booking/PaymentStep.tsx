// app/components/booking/PaymentStep.tsx
"use client";

import { FiCreditCard, FiCheck, FiGift, FiShield, FiLock } from 'react-icons/fi';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

interface PaymentStepProps {
  onNext: () => void;
  onBack: () => void;
}

const PaymentStep = ({ onNext, onBack }: PaymentStepProps) => {
  const { cart, subtotal, taxAmount, updateBookingDetails } = useBooking();
  const { profile } = useAuth();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('credit_card');
  const [applyLoyaltyPoints, setApplyLoyaltyPoints] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Loyalty points calculation
  const availableLoyaltyPoints = profile?.loyalty_points || 0;
  const maxPointsUsable = Math.min(availableLoyaltyPoints, Math.floor(subtotal * 0.3)); // Max 30% of subtotal
  const pointsDiscount = applyLoyaltyPoints ? maxPointsUsable : 0;
  
  // Premium discount (20% for premium members)
  const isPremium = profile?.membership_tier === 'premium' || profile?.membership_tier === 'vip';
  const premiumDiscountAmount = isPremium ? subtotal * 0.2 : 0;
  
  const totalDiscount = premiumDiscountAmount + pointsDiscount;
  const finalAmount = Math.max(0, subtotal + taxAmount - totalDiscount);

  // Points to be earned from this booking
  const pointsToEarn = Math.floor(finalAmount / (isPremium ? 50 : 100));

  const paymentMethods = [
    { 
      id: 'credit_card', 
      name: 'Credit/Debit Card', 
      icon: FiCreditCard, 
      color: 'from-blue-500 to-blue-600',
      popular: true,
      offers: '2% cashback'
    },
    { 
      id: 'phonepe', 
      name: 'PhonePe', 
      icon: '💜',
      color: 'from-purple-500 to-purple-600',
      popular: false,
      offers: 'Instant refunds'
    },
    { 
      id: 'google_pay', 
      name: 'Google Pay', 
      icon: '🔵',
      color: 'from-blue-400 to-cyan-500',
      popular: true,
      offers: 'Scratch cards'
    },
    { 
      id: 'paytm', 
      name: 'Paytm', 
      icon: '🔷',
      color: 'from-cyan-500 to-blue-500',
      popular: false,
      offers: 'Cashback offers'
    },
  ];

  const handlePayment = async () => {
    setProcessingPayment(true);
    
    // Update booking details with payment info
    updateBookingDetails({
      payment_method: selectedPaymentMethod,
      discount_amount: totalDiscount,
    });

    // Simulate payment processing
    setTimeout(() => {
      setProcessingPayment(false);
      onNext();
    }, 1500);

    // TODO: Integrate Razorpay payment gateway here
    // This is where you'll add Razorpay integration
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Secure Payment
          </h2>
          <p className="text-gray-500 mt-1">Your payment information is encrypted and secure</p>
        </div>
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-full">
          <FiLock className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Booking Summary */}
      <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">📋</span>
          Booking Summary
        </h3>
        <div className="space-y-3">
          {cart.map(service => (
            <div key={service.id} className="flex justify-between text-sm">
              <span className="text-gray-700">
                {service.name || service.title} {service.quantity > 1 && `x${service.quantity}`}
              </span>
              <span className="font-medium">
                ₹{((service.discounted_price || service.price || service.base_price) * service.quantity).toFixed(0)}
              </span>
            </div>
          ))}
          
          <div className="border-t border-pink-200 pt-3 mt-3">
            <div className="flex justify-between text-sm font-medium mb-2">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>GST (18%)</span>
              <span>₹{taxAmount.toFixed(0)}</span>
            </div>
          </div>

          {isPremium && (
            <div className="flex justify-between text-pink-600 text-sm font-medium">
              <span className="flex items-center gap-2">
                <FiGift className="w-4 h-4" />
                Premium Discount (20%)
              </span>
              <span>-₹{premiumDiscountAmount.toFixed(0)}</span>
            </div>
          )}

          {applyLoyaltyPoints && pointsDiscount > 0 && (
            <div className="flex justify-between text-purple-600 text-sm font-medium">
              <span className="flex items-center gap-2">
                ⭐ Loyalty Points ({maxPointsUsable} pts)
              </span>
              <span>-₹{pointsDiscount}</span>
            </div>
          )}

          <div className="border-t border-pink-200 pt-3 mt-3 flex justify-between font-bold text-lg">
            <span className="text-gray-800">Total Amount:</span>
            <span className="text-pink-600">₹{finalAmount.toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* Loyalty Points Section */}
      {availableLoyaltyPoints > 0 && (
        <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 p-5 rounded-2xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
                <span className="text-xl">⭐</span>
                Use Loyalty Points
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                You have {availableLoyaltyPoints} points available. Use up to {maxPointsUsable} points for this booking.
              </p>
              <p className="text-xs text-purple-600 font-medium">💡 You&apos;ll earn {pointsToEarn} points from this booking!
              </p>
            </div>
            <button
              onClick={() => setApplyLoyaltyPoints(!applyLoyaltyPoints)}
              disabled={maxPointsUsable === 0}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                applyLoyaltyPoints
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-gray-200 disabled:opacity-50'
              }`}
            >
              {applyLoyaltyPoints ? 'Applied ✓' : 'Apply'}
            </button>
          </div>
        </div>
      )}

      {/* Premium Badge */}
      {isPremium && (
        <div className="mb-6 bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 p-5 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-full shadow-md">
              <span className="text-2xl">👑</span>
            </div>
            <div>
              <h4 className="font-semibold text-purple-800 mb-1">Premium Member Benefits Active!</h4>
              <p className="text-sm text-purple-700">
                Enjoying 20% discount + earn 2x loyalty points on this booking
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Methods */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-800 mb-4">Select Payment Method</h3>
        <div className="grid grid-cols-2 gap-4">
          {paymentMethods.map(method => (
            <div
              key={method.id}
              onClick={() => setSelectedPaymentMethod(method.id)}
              className={`relative p-5 rounded-2xl cursor-pointer transition-all ${
                selectedPaymentMethod === method.id
                  ? 'bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-400 shadow-lg scale-105'
                  : 'border-2 border-gray-200 hover:border-pink-300 hover:shadow-md'
              }`}
            >
              {method.popular && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-400 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-md">
                  Popular
                </div>
              )}
              
              <div className="text-center">
                {typeof method.icon === 'string' ? (
                  <div className="text-4xl mb-2">{method.icon}</div>
                ) : (
                  <div className={`w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-r ${method.color} flex items-center justify-center`}>
                    <method.icon className="w-6 h-6 text-white" />
                  </div>
                )}
                <p className="font-medium text-gray-800 mb-1">{method.name}</p>
                <p className="text-xs text-green-600 font-medium">{method.offers}</p>
              </div>

              {selectedPaymentMethod === method.id && (
                <div className="absolute top-3 right-3 bg-pink-500 text-white p-1 rounded-full">
                  <FiCheck className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Security Badge */}
      <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg mb-6">
        <div className="flex items-center gap-3">
          <FiShield className="w-6 h-6 text-green-600" />
          <div>
            <h4 className="font-semibold text-gray-800 mb-1">100% Secure Payment</h4>
            <p className="text-sm text-gray-600">
              Your payment is protected with bank-level encryption. We never store your card details.
            </p>
          </div>
        </div>
      </div>

      {/* Offers Banner */}
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-xl mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎁</span>
          <div>
            <h4 className="font-semibold text-purple-800">Special Offer!</h4>
            <p className="text-sm text-purple-700">
              Get ₹200 off on your next booking when you refer a friend!
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between gap-4">
        <button 
          onClick={onBack}
          disabled={processingPayment}
          className="px-8 py-3 border-2 border-gray-200 text-gray-700 rounded-full hover:bg-gray-50 transition-all font-medium disabled:opacity-50"
        >
          ← Back
        </button>
        <button 
          onClick={handlePayment}
          disabled={processingPayment}
          className="flex-1 px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {processingPayment ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              Processing...
            </>
          ) : (
            <>
              <FiLock className="w-5 h-5" />
              Pay ₹{finalAmount.toFixed(0)} Securely
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PaymentStep;