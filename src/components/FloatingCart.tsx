// kritika/src/components/FloatingCart.tsx - PRODUCTION READY - NO AUTO-HIDE
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Plus, Minus, Trash2, Zap, ChevronDown } from 'lucide-react'
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

  const getServicePrice = (item: any) => {
    return item.price || item.discounted_price || item.base_price || 0
  }

  const getServiceName = (item: any) => {
    return item.name || item.title || 'Service'
  }

  const getServiceImage = (item: any) => {
    return item.image || '/images/placeholder-service.jpg'
  }

  const handleProceedToBooking = () => {
    if (!isLoggedIn) {
      router.push('/cart')
      return
    }
    onProceedToBooking()
  }

  const subtotal = getSubtotal()
  const taxAmount = getTaxAmount()
  const totalAmount = getTotalAmount()

  if (cartItemCount === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className={`
        fixed z-30
        
        /* MOBILE PORTRAIT: Center bottom, above nav */
        bottom-[calc(env(safe-area-inset-bottom,0px)+72px)]
        left-4 right-4
        
        /* MOBILE LANDSCAPE: Tighter positioning */
        landscape:max-h-[550px]:bottom-[calc(env(safe-area-inset-bottom,0px)+56px)]
        landscape:max-h-[550px]:left-2 landscape:max-h-[550px]:right-2
        
        /* TABLET: Float right */
        sm:left-auto sm:right-6 sm:w-[380px]
        
        /* DESKTOP: Normal positioning */
        lg:bottom-6 lg:right-6 lg:w-[400px]
        
        /* Max width to prevent overflow */
        max-w-[calc(100vw-2rem)]
        sm:max-w-[380px]
        lg:max-w-[400px]
      `}
      role="complementary"
      aria-label="Shopping cart"
    >
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-pink-200 overflow-hidden">
        {/* Cart Header - Always Visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="
            w-full flex items-center justify-between 
            p-3 landscape:max-h-[550px]:p-2 lg:p-4
            hover:bg-pink-50 active:bg-pink-100
            transition-colors
            focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-inset
          "
          aria-label={isExpanded ? "Collapse cart" : "Expand cart"}
          aria-expanded={isExpanded}
          type="button"
        >
          <div className="flex items-center space-x-2 lg:space-x-3">
            <div className="relative">
              <ShoppingCart className="
                w-5 h-5 landscape:max-h-[550px]:w-4 landscape:max-h-[550px]:h-4 lg:w-6 lg:h-6
                text-pink-600
              " />
              <span className="
                absolute -top-2 -right-2 
                bg-rose-500 text-white rounded-full 
                w-5 h-5 landscape:max-h-[550px]:w-4 landscape:max-h-[550px]:h-4
                flex items-center justify-center 
                text-xs landscape:max-h-[550px]:text-[10px]
                font-bold
              ">
                {cartItemCount}
              </span>
            </div>
            <div className="text-left">
              <p className="
                font-bold text-gray-800 
                text-sm landscape:max-h-[550px]:text-xs lg:text-base
              ">
                ₹{subtotal.toFixed(0)}
              </p>
              <p className="
                text-xs landscape:max-h-[550px]:text-[10px]
                text-gray-600
              ">
                {cartItemCount} item{cartItemCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {!isExpanded && (
              <span
                className="
                  bg-gradient-to-r from-pink-600 to-rose-600 text-white 
                  px-3 py-1.5 landscape:max-h-[550px]:px-2 landscape:max-h-[550px]:py-1
                  lg:px-4 lg:py-2
                  rounded-full 
                  text-xs landscape:max-h-[550px]:text-[10px] lg:text-sm
                  font-semibold 
                  shadow-md
                "
              >
                View
              </span>
            )}
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="
                w-4 h-4 landscape:max-h-[550px]:w-3 landscape:max-h-[550px]:h-3 lg:w-5 lg:h-5
                text-gray-600
              " />
            </motion.div>
          </div>
        </button>

        {/* Expanded Cart Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-pink-100"
            >
              {/* Cart Items List */}
              <div className="
                p-3 landscape:max-h-[550px]:p-2 lg:p-4
                space-y-3 landscape:max-h-[550px]:space-y-2
                max-h-[35vh] landscape:max-h-[550px]:max-h-[25vh]
                overflow-y-auto
                scrollbar-hide
              ">
                {cartItems.map((item) => {
                  const itemPrice = getServicePrice(item)
                  const itemName = getServiceName(item)
                  const itemImage = getServiceImage(item)
                  
                  return (
                    <motion.div 
                      key={item.id}
                      layout
                      className="
                        flex items-center gap-2 lg:gap-3
                        bg-gradient-to-r from-pink-50 to-purple-50 
                        rounded-xl 
                        p-2 landscape:max-h-[550px]:p-1.5 lg:p-3
                        border border-pink-100
                      "
                    >
                      <div className="
                        relative 
                        w-12 h-12 landscape:max-h-[550px]:w-10 landscape:max-h-[550px]:h-10 lg:w-16 lg:h-16
                        flex-shrink-0 rounded-lg overflow-hidden border-2 border-white shadow-sm
                      ">
                        <Image 
                          src={itemImage}
                          alt={itemName}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="
                          font-semibold text-gray-800 
                          text-xs landscape:max-h-[550px]:text-[10px] lg:text-sm
                          line-clamp-2
                        ">
                          {itemName}
                        </h4>
                        <p className="
                          text-pink-600 font-bold 
                          text-xs landscape:max-h-[550px]:text-[10px] lg:text-sm
                        ">
                          ₹{itemPrice}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-center gap-1">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="
                            text-red-500 hover:text-red-700 active:text-red-800
                            p-1 rounded-full hover:bg-red-50
                            transition-colors
                          "
                          aria-label={`Remove ${itemName}`}
                          type="button"
                        >
                          {item.quantity === 1 ? 
                            <Trash2 className="w-3.5 h-3.5 landscape:max-h-[550px]:w-3 landscape:max-h-[550px]:h-3" /> : 
                            <Minus className="w-3.5 h-3.5 landscape:max-h-[550px]:w-3 landscape:max-h-[550px]:h-3" />
                          }
                        </button>
                        <span className="
                          font-bold text-gray-800 
                          text-sm landscape:max-h-[550px]:text-xs
                          min-w-[20px] text-center
                        ">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => addToCart(item)}
                          className="
                            bg-pink-600 text-white rounded-full 
                            p-1 
                            hover:bg-pink-700 active:bg-pink-800
                            transition-colors
                          "
                          aria-label={`Add another ${itemName}`}
                          type="button"
                        >
                          <Plus className="w-3.5 h-3.5 landscape:max-h-[550px]:w-3 landscape:max-h-[550px]:h-3" />
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Cart Footer */}
              <div className="
                border-t border-pink-100 
                p-3 landscape:max-h-[550px]:p-2 lg:p-4
                space-y-3 landscape:max-h-[550px]:space-y-2
                bg-gradient-to-b from-white to-pink-50
              ">
                <div className="space-y-1.5 text-sm landscape:max-h-[550px]:text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (18%)</span>
                    <span>₹{taxAmount.toFixed(0)}</span>
                  </div>
                  <div className="
                    flex justify-between 
                    text-base landscape:max-h-[550px]:text-sm
                    font-bold text-gray-900 
                    pt-2 border-t
                  ">
                    <span>Total</span>
                    <span className="text-pink-600">₹{totalAmount.toFixed(0)}</span>
                  </div>
                </div>

                <div className="space-y-2 landscape:max-h-[550px]:space-y-1.5">
                  <button
                    onClick={handleProceedToBooking}
                    className="
                      w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white 
                      py-3 landscape:max-h-[550px]:py-2 lg:py-3
                      rounded-xl font-bold 
                      hover:from-pink-600 hover:to-rose-700 
                      active:from-pink-700 active:to-rose-800
                      transition-all shadow-lg 
                      flex items-center justify-center 
                      text-sm landscape:max-h-[550px]:text-xs lg:text-base
                      focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2
                    "
                    type="button"
                  >
                    <Zap className="w-4 h-4 mr-2 landscape:max-h-[550px]:w-3 landscape:max-h-[550px]:h-3" />
                    Proceed to Booking
                  </button>
                  
                  <button
                    onClick={() => {
                      if (confirm('Clear all items from cart?')) {
                        clearCart()
                        setIsExpanded(false)
                      }
                    }}
                    className="
                      w-full text-red-600 hover:text-red-700 active:text-red-800
                      text-xs landscape:max-h-[550px]:text-[10px] lg:text-sm
                      font-medium 
                      py-2 landscape:max-h-[550px]:py-1
                      flex items-center justify-center
                      hover:bg-red-50 rounded-lg
                      transition-colors
                      focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2
                    "
                    type="button"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5 landscape:max-h-[550px]:w-3 landscape:max-h-[550px]:h-3" />
                    Clear Cart
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}