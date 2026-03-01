"use client";

import React from 'react';
import { useBooking } from '../../context/BookingContext';
import Link from 'next/link';

const CartScreen: React.FC = () => {
  const { 
    cart, 
    removeFromCart, 
    updateQuantity,
    clearCart, 
    getSubtotal,
    getTaxAmount,
    getTotalAmount,
    cartItemCount
  } = useBooking();

  // Calculate values
  const subtotal = getSubtotal();
  const taxAmount = getTaxAmount();
  const totalAmount = getTotalAmount();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="mt-4 text-lg font-medium text-gray-900">Your cart is empty</h2>
            <p className="mt-1 text-sm text-gray-500">Add some services to get started</p>
            <div className="mt-6">
              <Link href="/" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700">
                Browse Services
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Cart ({cartItemCount} items)</h1>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to remove all items from your cart?')) {
                clearCart();
              }
            }}
            className="text-red-600 hover:text-red-800"
          >
            Clear All
          </button>
        </div>

        <div className="mt-8">
          <div className="flow-root">
            <ul className="-my-6 divide-y divide-gray-200">
              {cart.map((item) => (
                <li key={item.id} className="py-6 flex">
                  <div className="shrink-0 w-24 h-24 rounded-md overflow-hidden">
                    <img
                      src={item.image || '/placeholder-service.jpg'}
                      alt={item.name || item.title}
                      className="w-full h-full object-center object-cover"
                    />
                  </div>

                  <div className="ml-4 flex-1 flex flex-col">
                    <div>
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <h3>{item.name || item.title}</h3>
                        <p className="ml-4">
                          ₹{((item.discounted_price || item.price || item.base_price || 0) * item.quantity).toFixed(0)}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {item.category && `${item.category} • `}{item.duration || item.duration_minutes} mins
                      </p>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <p className="mt-1 text-sm text-gray-500 line-through">
                          ₹{(item.originalPrice * item.quantity).toFixed(0)}
                        </p>
                      )}
                    </div>

                    <div className="flex-1 flex items-end justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <span className="sr-only">Decrease quantity</span>
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        
                        <span className="text-gray-900">{item.quantity}</span>
                        
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <span className="sr-only">Increase quantity</span>
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="ml-4 text-red-600 hover:text-red-800"
                        >
                          <span className="sr-only">Remove</span>
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 py-6">
          <div className="space-y-3">
            <div className="flex justify-between text-base text-gray-600">
              <p>Subtotal</p>
              <p>₹{subtotal.toFixed(0)}</p>
            </div>
            <div className="flex justify-between text-base text-gray-600">
              <p>Tax (18% GST)</p>
              <p>₹{taxAmount.toFixed(0)}</p>
            </div>
            <div className="flex justify-between text-base font-medium text-gray-900 border-t pt-3">
              <p>Total</p>
              <p>₹{totalAmount.toFixed(0)}</p>
            </div>
          </div>
          
          <div className="mt-6">
            <Link
              href="/book"
              className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-pink-600 hover:bg-pink-700"
            >
              Proceed to Booking
            </Link>
          </div>
          
          <div className="mt-6 flex justify-center text-sm text-center text-gray-500">
            <p>
              or{' '}
              <Link href="/services" className="text-pink-600 font-medium hover:text-pink-500">
                Continue Shopping<span aria-hidden="true"> &rarr;</span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartScreen;