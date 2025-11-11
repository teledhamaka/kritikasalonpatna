// kritika/src/components/FloatingCart.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Plus, Minus, Trash2, Zap, ChevronLeft } from 'lucide-react'
import { useBooking } from '../context/BookingContext'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/navigation'
import Image from 'next/image';

interface FloatingCartProps {
  onProceedToBooking: () => void
}

export default function FloatingCart({ onProceedToBooking }: FloatingCartProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { cart, addToCart, removeFromCart, clearCart, cartItemCount } = useBooking()
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

  const handleAddToCart = (item: any) => {
    addToCart(item)
    setIsExpanded(true)
    setTimeout(() => setIsExpanded(false), 2000)
  }

  const handleRemoveFromCart = (item: any) => {
    removeFromCart(item.id)
  }

  const handleClearCart = () => {
    clearCart()
    setIsExpanded(false)
  }

  const handleProceedToBooking = () => {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }
    onProceedToBooking()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, x: 100 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        exit={{ opacity: 0, y: 100, x: 100 }}
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40"
      >
        <div className={`bg-white rounded-2xl shadow-2xl border-2 border-pink-200 transition-all duration-300 ${isExpanded ? 'w-80 md:w-96' : 'w-auto'}`}>
          <div 
            className="flex items-center justify-between p-3 md:p-4 cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="relative">
                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-pink-600" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                    {cartItemCount}
                  </span>
                )}
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800 text-sm md:text-base">
                  ₹{cart.reduce((sum, service) => sum + service.price, 0)}
                </p>
                <p className="text-xs text-gray-600">{cartItemCount} item{cartItemCount !== 1 ? 's' : ''}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {!isExpanded && cartItemCount > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleProceedToBooking()
                  }}
                  className="bg-pink-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium hover:bg-pink-700 transition-colors"
                >
                  Book Now
                </button>
              )}
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
              </motion.div>
            </div>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-pink-100 overflow-hidden"
              >
                <div className="p-3 md:p-4 space-y-3 max-h-64 overflow-y-auto">
                  {cartItems.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      <ShoppingCart className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">Your cart is empty</p>
                      <p className="text-xs">Add some services! ✨</p>
                    </div>
                  ) : (
                    cartItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between bg-pink-50 rounded-xl p-2 md:p-3">
                        <div className="flex items-center space-x-2 md:space-x-3 flex-1">
                          <Image 
                            src={item.image} 
                            alt={item.name}
                            className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-800 text-xs md:text-sm truncate">{item.name}</h4>
                            <p className="text-pink-600 font-semibold text-xs md:text-sm">₹{item.price || item.base_price}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1 md:space-x-2 ml-2">
                          <button
                            onClick={() => handleRemoveFromCart(item)}
                            className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white border border-pink-200 flex items-center justify-center hover:bg-pink-100 transition-colors"
                          >
                            <Minus className="w-3 h-3 md:w-4 md:h-4 text-pink-600" />
                          </button>
                          
                          <span className="w-6 text-center font-semibold text-gray-800 text-xs md:text-sm">{item.quantity}</span>
                          
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-pink-600 text-white flex items-center justify-center hover:bg-pink-700 transition-colors"
                          >
                            <Plus className="w-3 h-3 md:w-4 md:h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {cartItems.length > 0 && (
                  <div className="border-t border-pink-100 p-3 md:p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-800 text-sm md:text-base">
                        Total: ₹{cart.reduce((sum, service) => sum + service.price, 0)}
                      </span>
                      <button
                        onClick={handleClearCart}
                        className="flex items-center space-x-1 text-red-500 hover:text-red-600 transition-colors text-xs md:text-sm"
                      >
                        <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                        <span>Clear</span>
                      </button>
                    </div>
                    
                    <button
                      onClick={handleProceedToBooking}
                      className="w-full bg-linear-to-r from-pink-500 to-purple-600 text-white py-2 md:py-3 rounded-xl font-medium hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg flex items-center justify-center text-sm md:text-base"
                    >
                      <Zap className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                      Book Services
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}