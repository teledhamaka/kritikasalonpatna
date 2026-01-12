// kritika/src/components/FloatingCart.tsx - FIXED & OPTIMIZED
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Plus, Minus, Trash2, Zap, ChevronLeft, X } from 'lucide-react'
import { useBooking } from '../context/BookingContext'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface FloatingCartProps {
  onProceedToBooking: () => void
}

export default function FloatingCart({ onProceedToBooking }: FloatingCartProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { cart, addToCart, removeFromCart, clearCart, cartItemCount, getSubtotal, getTaxAmount, getTotalAmount } = useBooking()
  const { isLoggedIn } = useAuth()
  const router = useRouter()

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

  const handleAddToCart = (item: any) => {
    addToCart(item)
    // Don't auto-collapse after adding
  }

  const handleRemoveFromCart = (item: any) => {
    removeFromCart(item.id)
    if (cart.length <= 1) {
      setIsExpanded(false)
    }
  }

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear all items from your cart?')) {
      clearCart()
      setIsExpanded(false)
    }
  }

  const handleProceedToBooking = () => {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }
    onProceedToBooking()
  }

  const subtotal = getSubtotal()
  const taxAmount = getTaxAmount()
  const totalAmount = getTotalAmount()

  return (
    <AnimatePresence>
      {cartItemCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40"
        >
          <div className={`bg-white rounded-2xl shadow-2xl border-2 border-pink-200 transition-all duration-300 ${isExpanded ? 'w-[calc(100vw-2rem)] max-w-md' : 'w-auto'}`}>
            {/* Cart Header */}
            <div 
              className="flex items-center justify-between p-3 md:p-4 cursor-pointer hover:bg-pink-50 transition-colors rounded-t-2xl"
              onClick={() => setIsExpanded(!isExpanded)}
              role="button"
              aria-label={isExpanded ? "Collapse cart" : "Expand cart"}
              aria-expanded={isExpanded}
            >
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-pink-600" aria-hidden="true" />
                  {cartItemCount > 0 && (
                    <span 
                      className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
                      aria-label={`${cartItemCount} items in cart`}
                    >
                      {cartItemCount}
                    </span>
                  )}
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800 text-sm md:text-base">
                    ₹{subtotal.toFixed(0)}
                  </p>
                  <p className="text-xs text-gray-600">
                    {cartItemCount} item{cartItemCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {!isExpanded && cartItemCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleProceedToBooking()
                    }}
                    className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-semibold hover:from-pink-700 hover:to-rose-700 transition-all shadow-md"
                    aria-label="Proceed to booking"
                  >
                    Book Now
                  </button>
                )}
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  aria-hidden="true"
                >
                  <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                </motion.div>
              </div>
            </div>

            {/* Cart Items */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-pink-100 overflow-hidden"
                >
                  {/* Cart Items List */}
                  <div className="p-3 md:p-4 space-y-3 max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-pink-300 scrollbar-track-pink-50">
                    {cartItems.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" aria-hidden="true" />
                        <p className="text-sm font-medium">Your cart is empty</p>
                        <p className="text-xs mt-1">Add some services! ✨</p>
                      </div>
                    ) : (
                      cartItems.map((item) => {
                        const itemPrice = getServicePrice(item)
                        const itemName = getServiceName(item)
                        const itemImage = getServiceImage(item)
                        
                        return (
                          <motion.div 
                            key={item.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex items-center gap-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-3 border border-pink-100"
                          >
                            {/* Service Image */}
                            <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 border-white shadow-sm">
                              <Image 
                                src={itemImage}
                                alt={`${itemName} service image`}
                                fill
                                className="object-cover"
                                sizes="64px"
                                quality={75}
                              />
                            </div>
                            
                            {/* Service Details */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-800 text-sm line-clamp-2 leading-tight mb-1">
                                {itemName}
                              </h4>
                              <div className="flex items-center gap-2">
                                <p className="text-pink-600 font-bold text-sm">
                                  ₹{itemPrice}
                                </p>
                                {item.duration && (
                                  <span className="text-xs text-gray-500">
                                    • {item.duration}min
                                  </span>
                                )}
                              </div>
                              {item.quantity > 1 && (
                                <p className="text-xs text-gray-600 mt-1">
                                  Total: ₹{(itemPrice * item.quantity).toFixed(0)}
                                </p>
                              )}
                            </div>
                            
                            {/* Quantity Controls */}
                            <div className="flex flex-col items-end gap-2">
                              <button
                                onClick={() => {
                                  if (item.quantity === 1) {
                                    handleRemoveFromCart(item)
                                  } else {
                                    removeFromCart(item.id)
                                  }
                                }}
                                className="text-red-500 hover:text-red-700 transition-colors p-1"
                                aria-label={item.quantity === 1 ? `Remove ${itemName} from cart` : `Decrease quantity of ${itemName}`}
                              >
                                {item.quantity === 1 ? (
                                  <Trash2 className="w-4 h-4" />
                                ) : (
                                  <Minus className="w-4 h-4" />
                                )}
                              </button>
                              
                              <span className="font-bold text-gray-800 text-sm min-w-[20px] text-center">
                                {item.quantity}
                              </span>
                              
                              <button
                                onClick={() => handleAddToCart(item)}
                                className="bg-pink-600 text-white rounded-full p-1 hover:bg-pink-700 transition-colors shadow-sm"
                                aria-label={`Add another ${itemName} to cart`}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        )
                      })
                    )}
                  </div>

                  {/* Cart Footer */}
                  {cartItems.length > 0 && (
                    <div className="border-t border-pink-100 p-4 space-y-3 bg-gradient-to-b from-white to-pink-50">
                      {/* Price Breakdown */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600">
                          <span>Subtotal</span>
                          <span className="font-medium">₹{subtotal.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Tax (18% GST)</span>
                          <span className="font-medium">₹{taxAmount.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-pink-200">
                          <span>Total</span>
                          <span className="text-pink-600">₹{totalAmount.toFixed(0)}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <button
                          onClick={handleProceedToBooking}
                          className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white py-3 rounded-xl font-bold hover:from-pink-600 hover:to-rose-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center text-sm md:text-base"
                          aria-label="Proceed to booking"
                        >
                          <Zap className="w-4 h-4 mr-2" aria-hidden="true" />
                          Proceed to Booking
                        </button>
                        
                        <button
                          onClick={handleClearCart}
                          className="w-full flex items-center justify-center space-x-2 text-red-600 hover:text-red-700 transition-colors text-sm font-medium py-2"
                          aria-label="Clear entire cart"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                          <span>Clear Cart</span>
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}