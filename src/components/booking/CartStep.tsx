// app/components/booking/CartStep.tsx
"use client";

import { FiX, FiShoppingCart } from 'react-icons/fi';
//import { Service } from '../../types/service';
import { useBooking } from '../../context/BookingContext';

interface CartStepProps {
  onNext: () => void;
  onBack: () => void;
}

const CartStep = ({ onNext, onBack }: CartStepProps) => {
  const { cart, removeFromCart } = useBooking();

  const totalAmount = cart.reduce((sum: number, service) => sum + service.price, 0);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Cart</h2>
      
      {cart.length === 0 ? (
        <div className="text-center py-8">
          <FiShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Your cart is empty</p>
          <button 
            onClick={onBack}
            className="mt-4 bg-pink-600 text-white px-6 py-2 rounded-full hover:bg-pink-700 transition-colors"
          >
            Browse Services
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {cart.map(service => (
              <div key={service.id} className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center">
                  <img src={service.image} alt={service.title} className="w-16 h-16 rounded-lg object-cover" />
                  <div className="ml-4">
                    <h3 className="font-medium">{service.title}</h3>
                    <p className="text-gray-600 text-sm">{service.category}</p>
                    <p className="text-pink-600 font-bold">₹{service.price}</p>
                  </div>
                </div>
                <button 
                  onClick={() => removeFromCart(service.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-pink-50 rounded-lg">
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>₹{totalAmount}</span>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-4">
            <button 
              onClick={onBack}
              className="px-6 py-2 border border-pink-600 text-pink-600 rounded-full hover:bg-pink-50 transition-colors"
            >
              Add More Services
            </button>
            <button 
              onClick={onNext}
              className="px-6 py-2 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartStep;