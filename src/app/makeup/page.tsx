// app/makeup/page.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiStar, 
  FiShoppingCart, FiUsers, FiTrendingUp, FiAlertCircle, FiRefreshCw, 
  FiChevronDown, FiChevronUp, FiFilter, FiPlus, 
  FiMinus, FiTrash2, FiZap } from 'react-icons/fi';
import ServiceCard from '../../components/ServiceCard';
import TrendingServiceCard from '../../components/TrendingServiceCard';
import ServiceDetailModal from '../../components/ServiceDetailModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import ServiceSkeleton from '../../components/ServiceSkeleton';
import ErrorBoundary from '../../components/ErrorBoundary';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import LoginModal from '../../components/LoginModal';
import BookingFlow from '../../components/booking/BookingFlow';
import { Service } from '../../types/service';

// Import the JSON data
import makeupServicesData from '../../../public/makeup_services.json';

// Transform JSON service to match component interface
const transformServiceForComponent = (service: any): Service => ({
  id: service.id,
  name: service.title,
  title: service.title,
  category: service.category,
  imageUrl: service.image,
  image: service.image,
  description: service.description,
  price: service.price,
  base_price: service.price,
  originalPrice: service.originalPrice,
  isTrending: service.isTrending,
  duration: service.duration,
  duration_minutes: service.duration,
  keyIngredients: service.keyIngredients,
  benefits: service.benefits,
  precautions: service.precautions,
  aftercare: service.aftercare,
  faqs: service.faqs,
  link: '/services/' + service.id,
  deal: service.deal || ''
});

const MakeupSalonPage = () => {
  // State management
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showServiceDetail, setShowServiceDetail] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  //const [isLoading, setIsLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [bookingStep, setBookingStep] = useState<'browsing' | 'booking'>('browsing');
  const [categories, setCategories] = useState<string[]>(['All']);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [priceRange, setPriceRange] = useState<string>('all');
  const [durationRange, setDurationRange] = useState<string>('all');
  const [serviceType, setServiceType] = useState<string>('all');
  const [isCartExpanded, setIsCartExpanded] = useState(false);

  
  // Data states
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [trendingServices, setTrendingServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Refs for scrolling
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const serviceScrollRef = useRef<HTMLDivElement>(null);
  const comparisonScrollRef = useRef<HTMLDivElement>(null);
  
  // Context hooks with proper error handling
  const { isLoggedIn } = useAuth();
  const { cart, addToCart, removeFromCart, clearCart, cartItemCount, totalAmount } = useBooking();
  
  // Get cart items with quantities
  const getCartItemsWithQuantities = () => {
    const cartMap = new Map();
    cart.forEach(item => {
      const existing = cartMap.get(item.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        cartMap.set(item.id, { ...item, quantity: 1 });
      }
    });
    return Array.from(cartMap.values());
  };

  const cartItems = getCartItemsWithQuantities();
  //const totalPrice = totalAmount;
  const totalItems = cartItemCount;

  // Apply category filter
  // const getCategoryFilteredServices = () => {
  //   if (selectedCategory === 'All') return viralServices;
  //   return viralServices.filter(service => service.category === selectedCategory);
  // };


  
  // Safe usage of useBooking hook
  //let cart: BookingItem[] = [];
  //let addToCart: (service: Service) => void = () => {};

  // try {
  //   const bookingContext = useBooking();
  //   if (bookingContext) {
  //     cart = bookingContext.cart || [];
  //     addToCart = bookingContext.addToCart || (() => {});
  //   }
  // } catch (error) {
  //   console.error('Booking context error:', error);
  //   // Fallback to empty state
  //   cart = [];
  //   addToCart = () => {};
  // }

  // Load data from JSON
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Transform JSON data to match Service interface
        const transformedServices = makeupServicesData.map(transformServiceForComponent);
        setAllServices(transformedServices);
        
        // Get trending services (isTrending = true)
        const trending = transformedServices.filter(service => service.isTrending);
        setTrendingServices(trending);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load services data');
        setLoading(false);
        console.error('Error loading services:', err);
      }
    };

    loadData();
  }, []);

  // Generate categories from all services
  useEffect(() => {
    if (allServices.length > 0) {
      const uniqueCategories = ['All', ...new Set(allServices.map(service => service.category))];
      setCategories(uniqueCategories);
    }
  }, [allServices]);

  // Filter services based on selected category and filters
  useEffect(() => {
    let filtered = allServices;
    
    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }
    
    // Apply additional filters
    filtered = applyFilters(filtered);
    
    setFilteredServices(filtered);
  }, [selectedCategory, allServices, priceRange, durationRange, serviceType]);

  // Apply additional filters
  const applyFilters = (services: Service[]) => {
    return services.filter(service => {
      // Price filter
      const priceMatch = priceRange === 'all' ||
        (priceRange === 'low' && service.price <= 2000) ||
        (priceRange === 'medium' && service.price > 2000 && service.price <= 5000) ||
        (priceRange === 'high' && service.price > 5000);
      
      // Duration filter
      const durationMatch = durationRange === 'all' ||
        (durationRange === 'quick' && service.duration <= 60) ||
        (durationRange === 'medium' && service.duration > 60 && service.duration <= 90) ||
        (durationRange === 'long' && service.duration > 90);
      
      // Service type filter
      const typeMatch = serviceType === 'all' ||
        (serviceType === 'bridal' && service.category.toLowerCase().includes('bridal')) ||
        (serviceType === 'engagement' && service.category.toLowerCase().includes('engagement')) ||
        (serviceType === 'reception' && service.category.toLowerCase().includes('reception')) ||
        (serviceType === 'party' && service.category.toLowerCase().includes('party')) ||
        (serviceType === 'occassional' && service.category.toLowerCase().includes('occassional'));
      
      return priceMatch && durationMatch && typeMatch;
    });
  };

  // Get category image (first service image in category)
  const getCategoryImage = (category: string) => {
    if (category === 'All') return '/api/placeholder/80/80';
    const firstService = allServices.find(s => s.category === category);
    return firstService?.imageUrl || '/api/placeholder/80/80';
  };

  const getCategoryCount = (category: string) => {
    if (category === 'All') return allServices.length;
    return allServices.filter(s => s.category === category).length;
  };

  const toggleFavorite = (serviceId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(serviceId)) {
        newFavorites.delete(serviceId);
      } else {
        newFavorites.add(serviceId);
      }
      return newFavorites;
    });
  };

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -150 : 150;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollServices = (direction: 'left' | 'right') => {
    if (serviceScrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      serviceScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollComparison = (direction: 'left' | 'right') => {
    if (comparisonScrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      comparisonScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const proceedToBooking = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    setBookingStep('booking');
  };

  const handleAddToCart = (service: Service) => {
    addToCart(service);
    setIsCartExpanded(true);
    setTimeout(() => setIsCartExpanded(false), 2000);
  };

  const handleRemoveFromCart = (service: Service) => {
    removeFromCart(service.id);
  };

  const handleClearCart = () => {
    clearCart();
    setIsCartExpanded(false);
  };

  const shareService = (service: Service) => {
    if (navigator.share) {
      navigator.share({
        title: service.title,
        text: `Check out this amazing ${service.title} service!`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${service.title} - ${window.location.href}`);
      alert('Service link copied to clipboard! 📋');
    }
  };

  // Error component
  const ErrorMessage = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
    >
      <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-red-800 mb-2">Oops! Something went wrong</h3>
      <p className="text-red-600 mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        <FiRefreshCw className="w-4 h-4 mr-2" />
        Try Again
      </button>
    </motion.div>
  );

  // Render booking flow - stays within same provider context
  if (bookingStep === 'booking') {
    return <BookingFlow onBack={() => setBookingStep('browsing')} />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-pink-700 text-white py-12 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="flex justify-center items-center mb-4">
                <FiStar className="text-yellow-300 text-2xl mr-2" />
                <span className="bg-gradient-to-r from-yellow-300 to-pink-300 text-pink-800 px-3 py-1 rounded-full text-sm font-medium">
                  Feminine • Trendy • Viral
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-pink-100 bg-clip-text text-transparent">
                Makeup Magic
              </h1>
              <p className="text-xl text-pink-100 max-w-2xl mx-auto">
                Flawless canvas, timeless elegance.
                Transform your look with our expert makeup care and styling services
              </p>
              <div className="mt-6 flex justify-center space-x-8 text-sm">
                <div className="flex items-center">
                  <FiUsers className="mr-2" />
                  <span>2000+ Happy Clients</span>
                </div>
                <div className="flex items-center">
                  <FiStar className="mr-2" />
                  <span>4.9 Rating</span>
                </div>
                <div className="flex items-center">
                  <FiZap className="mr-2" />
                  <span>Viral Looks</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Cart Summary */}
        {/* {cart.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white shadow-lg border-b border-pink-100 py-3 px-4"
          >
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div className="flex items-center text-gray-700">
                <FiShoppingCart className="mr-2 text-pink-600" />
                <span>{cart.length} items in cart • ₹{cart.reduce((sum, service) => sum + service.price, 0)}</span>
              </div>
              <button 
                onClick={proceedToBooking}
                className="bg-pink-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-pink-700 transition-colors">
                Book Now
              </button>
            </div>
          </motion.div>
        )} */}

        {/* Floating Cart */}
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 100, x: 100 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  exit={{ opacity: 0, y: 100, x: 100 }}
                  className="fixed bottom-6 right-6 z-50"
                >
                  <div className={`bg-white rounded-2xl shadow-2xl border-2 border-pink-200 transition-all duration-300 ${isCartExpanded ? 'w-96' : 'w-auto'}`}>
                    <div 
                      className="flex items-center justify-between p-4 cursor-pointer"
                      onClick={() => setIsCartExpanded(!isCartExpanded)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <FiShoppingCart className="w-6 h-6 text-pink-600" />
                            <span>
                              {cart.length} items in cart • ₹{cart.reduce((sum, service) => sum + service.price, 0)}
                            </span>
        
                        </div>
                        {/* <div className="text-left">
                          <p className="font-semibold text-gray-800">₹{totalPrice}</p>
                          <p className="text-xs text-gray-600">{totalItems} trending item{totalItems !== 1 ? 's' : ''}</p>
                        </div> */}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {!isCartExpanded && totalItems > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              proceedToBooking();
                            }}
                            className="bg-pink-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-pink-700 transition-colors"
                          >
                            Book Now
                          </button>
                        )}
                        <motion.div
                          animate={{ rotate: isCartExpanded ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <FiChevronLeft className="w-5 h-5 text-gray-600" />
                        </motion.div>
                      </div>
                    </div>
        
                    <AnimatePresence>
                      {isCartExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-pink-100 overflow-hidden"
                        >
                          <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                            {cartItems.length === 0 ? (
                              <div className="text-center py-4 text-gray-500">
                                <FiShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                <p>Your cart is empty</p>
                                <p className="text-sm">Add some trending services! ✨</p>
                              </div>
                            ) : (
                              cartItems.map((item) => (
                                <div key={item.id} className="flex items-center justify-between bg-pink-50 rounded-xl p-3">
                                  <div className="flex items-center space-x-3 flex-1">
                                    <img 
                                      src={item.image} 
                                      alt={item.name}
                                      className="w-12 h-12 rounded-lg object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-medium text-gray-800 text-sm truncate">{item.name}</h4>
                                      <p className="text-pink-600 font-semibold text-sm">₹{item.price || item.base_price}</p>
                                      {item.isTrending && (
                                        <span className="inline-flex items-center px-1.5 py-0.5 text-xs bg-rose-100 text-rose-800 rounded-full mt-1">
                                          <FiZap className="w-3 h-3 mr-1" />
                                          Trending
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2 ml-2">
                                    <button
                                      onClick={() => handleRemoveFromCart(item)}
                                      className="w-8 h-8 rounded-full bg-white border border-pink-200 flex items-center justify-center hover:bg-pink-100 transition-colors"
                                    >
                                      <FiMinus className="w-4 h-4 text-pink-600" />
                                    </button>
                                    
                                    <span className="w-8 text-center font-semibold text-gray-800">{item.quantity}</span>
                                    
                                    <button
                                      onClick={() => handleAddToCart(item)}
                                      className="w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center hover:bg-pink-700 transition-colors"
                                    >
                                      <FiPlus className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
        
                          {cartItems.length > 0 && (
                            <div className="border-t border-pink-100 p-4 space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-800">Total: ₹{cart.reduce((sum, service) => sum + service.price, 0)}</span>
                                <button
                                  onClick={handleClearCart}
                                  className="flex items-center space-x-1 text-red-500 hover:text-red-600 transition-colors text-sm"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                  <span>Clear Cart</span>
                                </button>
                              </div>
                              
                              <button
                                onClick={proceedToBooking}
                                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg flex items-center justify-center"
                              >
                                <FiZap className="w-4 h-4 mr-2" />
                                Book Trending Services
                              </button>
                              
                              <div className="text-center">
                                <button
                                  onClick={() => setIsCartExpanded(false)}
                                  className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
                                >
                                  Continue Shopping
                                </button>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </AnimatePresence>

        <div className="max-w-7xl mx-auto py-8 px-4">
          {/* Categories Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Service Categories</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => scrollCategories('left')}
                  className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow text-pink-600 hover:bg-pink-50"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scrollCategories('right')}
                  className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow text-pink-600 hover:bg-pink-50"
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex space-x-4 overflow-hidden">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex-shrink-0 w-32 animate-pulse">
                    <div className="rounded-2xl p-4 text-center bg-gray-200 h-32"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <ErrorMessage message={error} onRetry={() => window.location.reload()} />
            ) : (
              <div
                ref={categoryScrollRef}
                className="flex overflow-x-auto scrollbar-hide space-x-4 pb-4"
                style={{ scrollbarWidth: 'none' }}
              >
                {categories.map((category) => (
                  <motion.div
                    key={category}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCategory(category)}
                    className={`flex-shrink-0 w-32 cursor-pointer ${
                      selectedCategory === category
                        ? 'transform scale-105'
                        : ''
                    }`}
                  >
                    <div
                      className={`rounded-2xl p-4 text-center transition-all duration-300 ${
                        selectedCategory === category
                          ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-lg'
                          : 'bg-white text-gray-700 shadow-md hover:shadow-lg border border-pink-100'
                      }`}
                    >
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden border-2 border-white/20">
                        <img
                          src={getCategoryImage(category)}
                          alt={category}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="font-medium text-sm leading-tight">{category}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {getCategoryCount(category)} services
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Find Your Perfect Service Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Find Your Perfect Service</h2>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center text-pink-600 font-medium"
              >
                <FiFilter className="mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'} 
                {showFilters ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />}
              </button>
            </div>
            
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white p-6 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                      <select
                        value={priceRange}
                        onChange={(e) => setPriceRange(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                      >
                        <option value="all">All Prices</option>
                        <option value="low">Up to ₹2000</option>
                        <option value="medium">₹2001-₹5000</option>
                        <option value="high">₹5001+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                      <select
                        value={durationRange}
                        onChange={(e) => setDurationRange(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                      >
                        <option value="all">All Durations</option>
                        <option value="quick">Up to 60 min</option>
                        <option value="medium">61-90 min</option>
                        <option value="long">91+ min</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                      <select
                        value={serviceType}
                        onChange={(e) => setServiceType(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                      >
                        <option value="all">All Category</option>
                        <option value="bridal">Bridal</option>
                        <option value="engagement">Engagement</option>
                        <option value="reception">Reception</option>
                        <option value="party">Party</option>
                        <option value="occassional">Occassional</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedCategory === 'All' ? 'All Services' : selectedCategory}
                </h2>
                <div className="text-gray-600">
                  {loading ? (
                    <LoadingSpinner size="small" className="inline-block mr-2" />
                  ) : (
                    `${filteredServices.length} services available`
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => scrollServices('left')}
                  className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow text-pink-600 hover:bg-pink-50"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scrollServices('right')}
                  className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow text-pink-600 hover:bg-pink-50"
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex space-x-6 overflow-hidden">
                {Array.from({ length: 3 }).map((_, index) => (
                  <ServiceSkeleton key={index} />
                ))}
              </div>
            ) : error ? (
              <ErrorMessage 
                message={error} 
                onRetry={() => window.location.reload()} 
              />
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-medium text-gray-600 mb-2">No services found</h3>
                <p className="text-gray-500">
                  {selectedCategory === 'All' 
                    ? 'No services are available at the moment.' 
                    : `No services found in ${selectedCategory} category.`
                  }
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setPriceRange('all');
                    setDurationRange('all');
                    setServiceType('all');
                  }}
                  className="mt-4 text-pink-600 hover:text-pink-700 font-medium"
                >
                  View all services
                </button>
              </div>
            ) : (
              <div
                ref={serviceScrollRef}
                className="flex overflow-x-auto scrollbar-hide space-x-6 pb-4"
                style={{ scrollbarWidth: 'none' }}
              >
                {filteredServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    isFavorite={favorites.has(service.id)}
                    onToggleFavorite={() => toggleFavorite(service.id)}
                    onAddToCart={() => addToCart(service)}
                    onViewDetails={() => {
                      setSelectedService(service);
                      setShowServiceDetail(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Service Comparison Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Service Comparison</h2>
            <div className="relative">
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10">
                <button 
                  onClick={() => scrollComparison('left')}
                  className="bg-white p-2 rounded-full shadow-md text-pink-600 hover:bg-pink-50"
                >
                  <FiChevronLeft className="w-6 h-6" />
                </button>
              </div>
              
              <div 
                ref={comparisonScrollRef}
                className="overflow-x-auto scrollbar-hide bg-white rounded-lg shadow-md"
                style={{ scrollbarWidth: 'none' }}
              >
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-pink-600 text-white">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Service Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Key Features</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredServices.map((service) => (
                      <tr key={service.id} className="hover:bg-pink-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-900">{service.title}</span>
                            {service.isTrending && (
                              <span className="ml-2 px-2 py-1 text-xs bg-pink-100 text-pink-800 rounded-full">Trending</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">{service.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">₹{service.price}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">{service.duration} min</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {service.benefits?.slice(0, 3).map((benefit, index) => (
                              <span key={index} className="px-2 py-1 text-xs bg-pink-100 text-pink-800 rounded">
                                {benefit}
                              </span>
                            ))}
                            {service.benefits && service.benefits.length > 3 && (
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                                +{service.benefits.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button 
                            onClick={() => addToCart(service)}
                            className="text-pink-600 hover:text-pink-800 font-medium flex items-center"
                          >
                            <FiShoppingCart className="mr-1" />
                            Add to Cart
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10">
                <button 
                  onClick={() => scrollComparison('right')}
                  className="bg-white p-2 rounded-full shadow-md text-pink-600 hover:bg-pink-50"
                >
                  <FiChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Trending Services - Updated to 4 per row */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <FiTrendingUp className="mr-3 text-pink-600" />
              Trending & Viral Services
              {loading && <LoadingSpinner size="small" className="ml-3" />}
            </h2>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-300"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-6 bg-gray-300 rounded mb-4"></div>
                      <div className="h-3 bg-gray-300 rounded mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded mb-4 w-2/3"></div>
                      <div className="flex justify-between items-center">
                        <div className="h-6 bg-gray-300 rounded w-20"></div>
                        <div className="h-8 bg-gray-300 rounded w-24"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <ErrorMessage 
                message={error} 
                onRetry={() => window.location.reload()} 
              />
            ) : trendingServices.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-2xl shadow-lg">
                <div className="text-gray-400 text-4xl mb-3">📈</div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">No trending services</h3>
                <p className="text-gray-500">Check back later for trending services.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {trendingServices.map((service) => (
                  <TrendingServiceCard
                    key={service.id}
                    service={service}
                    onAddToCart={() => addToCart(service)}
                    onViewDetails={() => {
                      setSelectedService(service);
                      setShowServiceDetail(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Statistics Section */}
          {!loading && !error && allServices.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-8 text-white mb-8"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold mb-2">{allServices.length}</div>
                  <div className="text-pink-100">Total Services</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">{categories.length - 1}</div>
                  <div className="text-pink-100">Categories</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">{trendingServices.length}</div>
                  <div className="text-pink-100">Trending</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">4.9</div>
                  <div className="text-pink-100">Average Rating</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Service Detail Modal */}
        <ServiceDetailModal
          service={selectedService}
          isOpen={showServiceDetail}
          onClose={() => setShowServiceDetail(false)}
          onAddToCart={addToCart}
          activeFaq={activeFaq}
          setActiveFaq={setActiveFaq}
        />

        {/* Login Modal */}
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={() => {
            setShowLoginModal(false);
            setBookingStep('booking');
          }}
        />

        {/* Offline Indicator */}
        {typeof window !== 'undefined' && !navigator.onLine && (
          <div className="fixed bottom-4 left-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
            <div className="flex items-center">
              <FiAlertCircle className="w-4 h-4 mr-2" />
              <span className="text-sm">You're offline</span>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default MakeupSalonPage;