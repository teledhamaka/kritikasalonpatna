// kritika/src/app/cart/page.tsx - FIXED & OPTIMIZED
"use client";

import React from 'react';
import { useBooking } from '../../context/BookingContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const CartScreen: React.FC = () => {
  const router = useRouter();
  const { 
    cart, 
    removeFromCart, 
    addToCart,
    clearCart, 
    getSubtotal,
    getTaxAmount,
    getTotalAmount,
    cartItemCount
  } = useBooking();

  // Get cart items with quantities
  const getCartItemsWithQuantities = () => {
    const cartMap = new Map()
    cart.forEach(item => {
      const existing = cartMap.get(item.id)
      if (existing) {
        existing.quantity += 1
      } else {
        cartMap.set(item.id, { ...item, quantity: 1 })
      }
    })
    return Array.from(cartMap.values())
  }

  const cartItems = getCartItemsWithQuantities()

  // Get service price safely
  const getServicePrice = (item: any) => {
    return item.price || item.discounted_price || item.base_price || 0
  }

  // Get service name safely
  const getServiceName = (item: any) => {
    return item.name || item.title || 'Service'
  }

  // Get service image safely
  const getServiceImage = (item: any) => {
    return item.image || '/images/placeholder-service.jpg'
  }

  // Calculate values
  const subtotal = getSubtotal();
  const taxAmount = getTaxAmount();
  const totalAmount = getTotalAmount();

  const handleIncreaseQuantity = (item: any) => {
    addToCart(item)
  }

  const handleDecreaseQuantity = (item: any) => {
    removeFromCart(item.id)
  }

  const handleRemoveItem = (itemId: string) => {
    if (confirm('Remove this item from cart?')) {
      const item = cartItems.find(i => i.id === itemId)
      if (item) {
        // Remove all quantities
        for (let i = 0; i < item.quantity; i++) {
          removeFromCart(itemId)
        }
      }
    }
  }

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear all items from your cart?')) {
      clearCart();
    }
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-32 h-32 mx-auto mb-6 bg-pink-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-16 h-16 text-pink-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-lg text-gray-600 mb-8">Add some amazing services to get started! ✨</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/makeup" 
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-xl shadow-md text-base font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 transition-all"
              >
                Browse Makeup Services
              </Link>
              <Link 
                href="/hair" 
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-pink-500 rounded-xl text-base font-semibold text-pink-600 hover:bg-pink-50 transition-all"
              >
                Browse Hair Services
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-pink-100 rounded-full transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Cart</h1>
              <p className="text-gray-600 mt-1">{cartItemCount} item{cartItemCount !== 1 ? 's' : ''} in your cart</p>
            </div>
          </div>
          <button
            onClick={handleClearCart}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition-colors"
            aria-label="Clear all items from cart"
          >
            <Trash2 className="w-5 h-5" />
            <span className="hidden sm:inline">Clear All</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const itemPrice = getServicePrice(item)
              const itemName = getServiceName(item)
              const itemImage = getServiceImage(item)
              const itemTotal = itemPrice * item.quantity

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl shadow-md border border-pink-100 p-4 sm:p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex gap-4">
                    {/* Service Image */}
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-xl overflow-hidden border-2 border-pink-100">
                      <Image
                        src={itemImage}
                        alt={`${itemName} - Beauty service at Kritika Salon Patna`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 96px, 128px"
                        quality={85}
                      />
                    </div>

                    {/* Service Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0 pr-4">
                          <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                            {itemName}
                          </h3>
                          {item.category && (
                            <p className="text-sm text-gray-600 mt-1">
                              {item.category}
                              {item.duration && ` • ${item.duration} mins`}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                          aria-label={`Remove ${itemName} from cart`}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex justify-between items-end">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleDecreaseQuantity(item)}
                            className="w-8 h-8 rounded-full border-2 border-pink-300 flex items-center justify-center hover:bg-pink-50 transition-colors"
                            aria-label={`Decrease quantity of ${itemName}`}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4 text-pink-600" />
                          </button>
                          
                          <span className="text-lg font-bold text-gray-900 min-w-[30px] text-center">
                            {item.quantity}
                          </span>
                          
                          <button
                            onClick={() => handleIncreaseQuantity(item)}
                            className="w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center hover:bg-pink-700 transition-colors shadow-md"
                            aria-label={`Increase quantity of ${itemName}`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            ₹{itemPrice} × {item.quantity}
                          </p>
                          <p className="text-xl font-bold text-pink-600">
                            ₹{itemTotal.toFixed(0)}
                          </p>
                          {item.originalPrice && item.originalPrice > itemPrice && (
                            <p className="text-sm text-gray-400 line-through">
                              ₹{(item.originalPrice * item.quantity).toFixed(0)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border-2 border-pink-200 p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal ({cartItemCount} items)</span>
                  <span className="font-semibold">₹{subtotal.toFixed(0)}</span>
                </div>
                
                <div className="flex justify-between text-gray-700">
                  <span className="flex items-center gap-1">
                    Tax (18% GST)
                    <span className="text-xs text-gray-500">incl.</span>
                  </span>
                  <span className="font-semibold">₹{taxAmount.toFixed(0)}</span>
                </div>
                
                <div className="border-t-2 border-pink-100 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-pink-600">₹{totalAmount.toFixed(0)}</span>
                  </div>
                </div>
              </div>

              {/* Proceed Button */}
              <button
                onClick={() => router.push('/booking')}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white py-4 rounded-xl font-bold text-lg hover:from-pink-600 hover:to-rose-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mb-4"
                aria-label="Proceed to booking"
              >
                <Zap className="w-5 h-5" />
                Proceed to Booking
              </button>

              {/* Continue Shopping */}
              <Link
                href="/makeup"
                className="w-full block text-center text-pink-600 hover:text-pink-700 font-medium py-3 transition-colors"
              >
                Continue Shopping →
              </Link>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-pink-100 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600">✓</span>
                  </div>
                  <span>100% Safe & Sanitized</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600">⭐</span>
                  </div>
                  <span>Expert Professional Artists</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600">💎</span>
                  </div>
                  <span>Premium Quality Products</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartScreen;