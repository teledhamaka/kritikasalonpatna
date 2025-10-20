// app/page.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiStar, FiClock, FiShoppingCart, FiUsers, FiTrendingUp, FiAlertCircle, FiRefreshCw, 
  FiChevronDown, FiChevronUp, FiFilter, FiPlus, 
  FiMinus, FiTrash2, FiZap, FiAward, FiShare2 } from 'react-icons/fi';
import ServiceCard from '../components/ServiceCard';
import TrendingServiceCard from '../components/TrendingServiceCard';
import ServiceDetailModal from '../components/ServiceDetailModal';
import LoadingSpinner from '../components/LoadingSpinner';
import ServiceSkeleton from '../components/ServiceSkeleton';
//import ErrorBoundary from '../components/ErrorBoundary';
import { Service } from '../types/service';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import LoginModal from '../components/LoginModal';
import BookingFlow from '../components/booking/BookingFlow';
import BeautyQuiz from '../components/BeautyQuiz';
import SkinAnalysis from '../components/SkinAnalysis';

// Import JSON data directly
import hairServices from '../../public/hair_services.json';
import makeupServices from '../../public/makeup_services.json';
import nailServices from '../../public/nail_services.json';
import skinServices from '../../public/skin_services.json';

const HomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showServiceDetail, setShowServiceDetail] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [availableSlots, setAvailableSlots] = useState(3);
  const [flashSaleTime, setFlashSaleTime] = useState({ hours: 2, minutes: 15, seconds: 33 });
  const [, setIsLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [bookingStep, setBookingStep] = useState<'browsing' | 'booking'>('browsing');

  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [priceRange, setPriceRange] = useState<string>('all');
  const [durationRange, setDurationRange] = useState<string>('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('all');

  const [showBeautyQuiz, setShowBeautyQuiz] = useState(false);
  const [showSkinAnalysis, setShowSkinAnalysis] = useState(false);
  const [isCartExpanded, setIsCartExpanded] = useState(false);
  const [viralServices, setViralServices] = useState<Service[]>([]);
  const [allServicesLoading, setAllServicesLoading] = useState(true);
  const [allServicesError, setAllServicesError] = useState<string | null>(null);

  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const serviceScrollRef = useRef<HTMLDivElement>(null);
  const comparisonScrollRef = useRef<HTMLDivElement>(null);

  const { isLoggedIn } = useAuth();
  const { cart, addToCart, removeFromCart, clearCart, cartItemCount, totalAmount } = useBooking();

  // Fetch only trending services from all JSON files
  const fetchTrendingServices = async () => {
    try {
      setAllServicesLoading(true);

      // Get trending services from each JSON file separately
      const trendingHairServices = (hairServices as Service[]).filter(service => service.isTrending === true);
      const trendingMakeupServices = (makeupServices as Service[]).filter(service => service.isTrending === true);
      const trendingNailServices = (nailServices as Service[]).filter(service => service.isTrending === true);
      const trendingSkinServices = (skinServices as Service[]).filter(service => service.isTrending === true);

      // Interleave services: one from each JSON file in sequential order
      const interleavedServices: Service[] = [];
      const maxLength = Math.max(
        trendingHairServices.length,
        trendingMakeupServices.length,
        trendingNailServices.length,
        trendingSkinServices.length
      );

      for (let i = 0; i < maxLength; i++) {
        if (i < trendingHairServices.length) interleavedServices.push(trendingHairServices[i]);
        if (i < trendingMakeupServices.length) interleavedServices.push(trendingMakeupServices[i]);
        if (i < trendingNailServices.length) interleavedServices.push(trendingNailServices[i]);
        if (i < trendingSkinServices.length) interleavedServices.push(trendingSkinServices[i]);
      }
      
      // Combine all services and filter only trending ones
      const allCombinedServices = [
        ...hairServices,
        ...makeupServices,
        ...nailServices,
        ...skinServices
      ] as Service[];

      // Filter only trending services
      // const trendingServices = allCombinedServices.filter(service => 
      //   service.isTrending === true
      // );

      // Add viral indicators and feminine features
      const enhancedTrendingServices = interleavedServices.map(service => ({
        ...service,
        isViral: Math.random() > 0.7, // Randomly mark some as viral
        trendingScore: Math.floor(Math.random() * 100) + 50, // Add trending score
        socialProof: {
          shares: Math.floor(Math.random() * 1000) + 100,
          likes: Math.floor(Math.random() * 5000) + 1000,
          saves: Math.floor(Math.random() * 500) + 50
        }
      }));

      setViralServices(enhancedTrendingServices);
      setAllServicesError(null);
    } catch (error) {
      console.error('Error fetching trending services:', error);
      setAllServicesError('Failed to load trending services');
    } finally {
      setAllServicesLoading(false);
      setIsLoading(false);
    }
  };

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
  const getCategoryFilteredServices = () => {
    if (selectedCategory === 'All') return viralServices;
    return viralServices.filter(service => service.category === selectedCategory);
  };

  const filteredServices = getCategoryFilteredServices();
  const filteredLoading = allServicesLoading;

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
      
      // Service type filter (hair/makeup/skin/nails)
      const typeMatch = serviceTypeFilter === 'all' ||
        (serviceTypeFilter === 'hair' && service.category?.toLowerCase().includes('hair')) ||
        (serviceTypeFilter === 'makeup' && service.category?.toLowerCase().includes('bridal') || service.category?.toLowerCase().includes('makeup')) ||
        (serviceTypeFilter === 'skin' && service.category?.toLowerCase().includes('skin') || service.category?.toLowerCase().includes('facial'));
      
      return priceMatch && durationMatch && typeMatch;
    });
  };

  const filteredAndSortedServices = applyFilters(filteredServices);

  useEffect(() => {
    fetchTrendingServices();

    const slotTimer = setInterval(() => setAvailableSlots(prev => prev > 1 ? prev - 1 : 3), 30000);
    const flashSaleTimer = setInterval(() => {
      setFlashSaleTime(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else {
          seconds = 59;
          if (minutes > 0) minutes--;
          else {
            minutes = 59;
            if (hours > 0) hours--;
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => {
      clearInterval(slotTimer);
      clearInterval(flashSaleTimer);
    };
  }, []);

  const serviceCategories = ['All', ...new Set(viralServices.map(service => service.category))];
  
  const getCategoryImage = (category: string) => {
    if (category === 'All') return '/images/categories/all.jpg';
    const firstService = viralServices.find(s => s.category === category);
    return firstService?.image || '/api/placeholder/80/80';
  };

  const getCategoryCount = (category: string) => {
    if (category === 'All') return viralServices.length;
    return viralServices.filter(s => s.category === category).length;
  };

  const toggleFavorite = (serviceId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(serviceId)) newFavorites.delete(serviceId);
      else newFavorites.add(serviceId);
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

  const formatTime = () => {
    const { hours, minutes, seconds } = flashSaleTime;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
  
  if (bookingStep === 'booking') {
    return <BookingFlow onBack={() => setBookingStep('browsing')} />;    
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      
      {/* Enhanced Header with Viral Elements */}
      <header className="bg-gradient-to-r from-pink-600 via-purple-600 to-pink-700 text-white py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-4 right-4 flex space-x-2">
          <span className="bg-pink-500 text-xs px-2 py-1 rounded-full animate-pulse">🔥 TRENDING</span>
          <span className="bg-purple-500 text-xs px-2 py-1 rounded-full">✨ VIRAL</span>
        </div>
        <div className="relative max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-pink-100 bg-clip-text text-transparent">KRITIKA SALON</h1>
            <p className="text-xl text-pink-100 max-w-2xl mx-auto">WHERE EVERY WOMAN IS A HEROINE ✨</p>
            <p className="text-lg text-pink-100 max-w-2xl mx-auto mt-2">Transform your definition with our specialist Cosmetologist</p>
            <div className="mt-6 flex justify-center space-x-8 text-sm">
              <div className="flex items-center"><FiUsers className="mr-2" /><span>5000+ Happy Clients</span></div>
              <div className="flex items-center"><FiStar className="mr-2" /><span>4.9 Rating</span></div>
              <div className="flex items-center"><FiZap className="mr-2" /><span>50+ Viral Services</span></div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Viral Alert Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-rose-500 to-pink-600 text-white py-3 px-4 text-center"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2">
          <FiZap className="animate-pulse" />
          <span className="font-semibold">TRENDING ALERT:</span>
          <span>These services are going viral! Book now before they sell out! 🚀</span>
        </div>
      </motion.div>

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

      <main className="max-w-7xl mx-auto py-8 px-4">
        {availableSlots < 4 && (
          <motion.div animate={{ scale: [0.98, 1.02, 0.98] }} transition={{ duration: 1.5, repeat: Infinity }} className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 rounded-lg mb-8" role="alert">
            <p className="font-bold">{availableSlots === 1 ? "Last Slot Available!" : `Hurry! Only ${availableSlots} slots left`}</p>
            <p>Book now to get an exclusive 20% OFF on trending services.</p>
          </motion.div>
        )}

        {/* Enhanced Personalized Beauty Hub */}
        <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center">
              <FiZap className="mr-2 text-pink-600" />
              Discover Your Perfect Look
              <span className="ml-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs px-2 py-1 rounded-full">TRENDING</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setShowBeautyQuiz(true)} 
                  className="bg-gradient-to-br from-pink-50 to-purple-100 p-6 rounded-2xl cursor-pointer hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center border-2 border-pink-200"
                >
                  <div className="text-5xl mb-3">💫</div>
                  <h3 className="text-xl font-bold text-purple-800">Beauty Profile Quiz</h3>
                  <p className="text-gray-600 text-sm mt-1">Answer a few questions to find the perfect trending services tailored just for you in 60 seconds!</p>
                  <span className="mt-4 bg-white text-pink-600 font-semibold py-2 px-4 rounded-full text-sm border border-pink-300">Start Quiz</span>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setShowSkinAnalysis(true)} 
                  className="bg-gradient-to-br from-purple-50 to-pink-100 p-6 rounded-2xl cursor-pointer hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center border-2 border-purple-200"
                >
                  <div className="text-5xl mb-3">✨</div>
                  <h3 className="text-xl font-bold text-purple-800">AI Skin Analysis</h3>
                  <p className="text-gray-600 text-sm mt-1">Upload a selfie to get an instant AI-powered skin analysis and personalized trending care advice.</p>
                  <span className="mt-4 bg-white text-purple-600 font-semibold py-2 px-4 rounded-full text-sm border border-purple-300">Analyze Skin</span>
                </motion.div>
            </div>
        </section>

        {showBeautyQuiz && <BeautyQuiz onClose={() => setShowBeautyQuiz(false)} />}
        {showSkinAnalysis && <SkinAnalysis onClose={() => setShowSkinAnalysis(false)} />}
        
        {/* Service Categories Section - Only Trending Categories */}
        <section className="mb-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  Trending Categories
                  <FiTrendingUp className="ml-2 text-pink-600" />
                </h2>
                <div className="flex space-x-2">
                    <button onClick={() => scrollCategories('left')} className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow text-pink-600 hover:bg-pink-50"><FiChevronLeft className="w-5 h-5" /></button>
                    <button onClick={() => scrollCategories('right')} className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow text-pink-600 hover:bg-pink-50"><FiChevronRight className="w-5 h-5" /></button>
                </div>
            </div>

            {allServicesLoading ? (
              <div className="flex space-x-4 overflow-hidden">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex-shrink-0 w-32 animate-pulse">
                    <div className="rounded-2xl p-4 text-center bg-gray-200 h-32"></div>
                  </div>
                ))}
              </div>
            ) : allServicesError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-red-800 mb-2">Failed to load categories</h3>
                <button onClick={fetchTrendingServices} className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  <FiRefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
              </div>
            ) : (
              <div ref={categoryScrollRef} className="flex overflow-x-auto scrollbar-hide space-x-4 pb-4" style={{ scrollbarWidth: 'none' }}>
                  {serviceCategories.map((category) => (
                      <motion.div 
                        key={category} 
                        whileHover={{ y: -5, scale: 1.05 }} 
                        onClick={() => setSelectedCategory(category)} 
                        className={`flex-shrink-0 w-32 cursor-pointer transition-transform duration-300`}
                      >
                          <div className={`rounded-2xl p-4 text-center transition-all duration-300 ${selectedCategory === category ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-lg' : 'bg-white text-gray-700 shadow-md hover:shadow-lg border border-pink-100'}`}>
                              <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden border-2 border-white/20">
                                <img src={getCategoryImage(category)} alt={category} className="w-full h-full object-cover" />
                              </div>
                              <p className="font-medium text-sm leading-tight">{category}</p>
                              <p className="text-xs opacity-75 mt-1">{getCategoryCount(category)} trending</p>
                          </div>
                      </motion.div>
                  ))}
              </div>
            )}
        </section>

        {/* Find Your Perfect Service Section */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              Find Your Perfect Trending Service
              <FiAward className="ml-2 text-pink-600" />
            </h2>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center text-pink-600 font-medium hover:text-pink-700 transition-colors"
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
                <div className="bg-white p-6 rounded-xl shadow-md grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 border border-pink-100">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                    <select
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                    >
                      <option value="all">All Prices</option>
                      <option value="low">Up to ₹2000</option>
                      <option value="medium">₹2001-₹5000</option>
                      <option value="high">₹5001+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                    <select
                      value={durationRange}
                      onChange={(e) => setDurationRange(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                    >
                      <option value="all">All Durations</option>
                      <option value="quick">Up to 60 min</option>
                      <option value="medium">61-90 min</option>
                      <option value="long">91+ min</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
                    <select
                      value={serviceTypeFilter}
                      onChange={(e) => setServiceTypeFilter(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                    >
                      <option value="all">All Types</option>
                      <option value="hair">Hair Services</option>
                      <option value="makeup">Makeup Services</option>
                      <option value="skin">Skin Services</option>
                      <option value="nails">Nail Services</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Services Grid with Horizontal Scroll - Only Trending Services */}
        <section className="mb-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    {selectedCategory === 'All' ? 'All Trending Services' : `Trending ${selectedCategory}`}
                    <FiZap className="ml-2 text-yellow-500" />
                  </h2>
                  <div className="text-gray-600 flex items-center">
                    {filteredLoading ? (
                      <LoadingSpinner size="small" className="inline-block mr-2" />
                    ) : (
                      <>
                        <span>{filteredAndSortedServices.length} trending services available</span>
                        {filteredAndSortedServices.length > 0 && (
                          <span className="ml-2 bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full">
                            {Math.round((filteredAndSortedServices.length / viralServices.length) * 100)}% of all trending
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => scrollServices('left')} className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow text-pink-600 hover:bg-pink-50">
                    <FiChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={() => scrollServices('right')} className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow text-pink-600 hover:bg-pink-50">
                    <FiChevronRight className="w-5 h-5" />
                  </button>
                </div>
            </div>

            {filteredLoading ? (
              <div className="flex space-x-6 overflow-hidden">
                {Array.from({ length: 3 }).map((_, index) => (
                  <ServiceSkeleton key={index} />
                ))}
              </div>
            ) : allServicesError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-red-800 mb-2">Failed to load trending services</h3>
                <button onClick={fetchTrendingServices} className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  <FiRefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
              </div>
            ) : filteredAndSortedServices.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-medium text-gray-600 mb-2">No trending services found</h3>
                <p className="text-gray-500">
                  {selectedCategory === 'All' 
                    ? 'No trending services are available at the moment.' 
                    : `No trending services found in ${selectedCategory} category with current filters.`
                  }
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setPriceRange('all');
                    setDurationRange('all');
                    setServiceTypeFilter('all');
                  }}
                  className="mt-4 text-pink-600 hover:text-pink-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div ref={serviceScrollRef} className="flex overflow-x-auto scrollbar-hide space-x-6 pb-4" style={{ scrollbarWidth: 'none' }}>
                  {filteredAndSortedServices.map((service) => (
                    <ServiceCard 
                      key={service.id} 
                      service={service} 
                      isFavorite={favorites.has(service.id)} 
                      onToggleFavorite={() => toggleFavorite(service.id)} 
                      onAddToCart={() => handleAddToCart(service)} 
                      onViewDetails={() => { setSelectedService(service); setShowServiceDetail(true); }}
                      // onShare={() => shareService(service)}
                    />
                  ))}
              </div>
            )}
        </section>

        {/* Service Comparison Table - Only Trending Services */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <FiTrendingUp className="mr-3 text-pink-600" />
            Trending Services Comparison
          </h2>
          <div className="relative">
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10">
              <button 
                onClick={() => scrollComparison('left')}
                className="bg-white p-2 rounded-full shadow-md text-pink-600 hover:bg-pink-50 transition-colors"
              >
                <FiChevronLeft className="w-6 h-6" />
              </button>
            </div>
            
            <div 
              ref={comparisonScrollRef}
              className="overflow-x-auto scrollbar-hide bg-white rounded-xl shadow-lg border border-pink-100"
              style={{ scrollbarWidth: 'none' }}
            >
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-pink-600 to-purple-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Service Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Trending Score</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedServices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        <div className="text-4xl mb-3">📊</div>
                        <p className="font-medium">No trending services to compare</p>
                        <p className="text-sm mt-1">Adjust your filters to see trending services</p>
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedServices.map((service) => (
                      <tr key={service.id} className="hover:bg-pink-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img src={service.image} alt={service.title} className="w-10 h-10 rounded-lg object-cover mr-3" />
                            <div>
                              <span className="font-medium text-gray-900 block">{service.title}</span>
                              <div className="flex items-center space-x-1 mt-1">
                                {service.isTrending && (
                                  <span className="inline-flex items-center px-2 py-1 text-xs bg-pink-100 text-pink-800 rounded-full">
                                    <FiTrendingUp className="w-3 h-3 mr-1" />
                                    Trending
                                  </span>
                                )}
                                {(service as any).isViral && (
                                  <span className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                                    <FiZap className="w-3 h-3 mr-1" />
                                    Viral
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full font-medium">
                            {service.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            service.category?.toLowerCase().includes('hair') ? 'bg-blue-100 text-blue-800' :
                            service.category?.toLowerCase().includes('bridal') || service.category?.toLowerCase().includes('makeup') ? 'bg-pink-100 text-pink-800' :
                            service.category?.toLowerCase().includes('nail') ? 'bg-purple-100 text-purple-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {service.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <span className="font-bold text-gray-900">₹{service.price}</span>
                            {service.originalPrice && (
                              <span className="ml-2 text-sm text-gray-500 line-through">₹{service.originalPrice}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-gray-700">
                            <FiClock className="w-4 h-4 mr-1 text-pink-600" />
                            <span>{service.duration} min</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full" 
                                style={{ width: `${(service as any).trendingScore || 70}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-700">{(service as any).trendingScore || 70}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleAddToCart(service)}
                              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
                            >
                              <FiShoppingCart className="mr-2 w-4 h-4" />
                              Add to Cart
                            </button>
                            <button
                              onClick={() => shareService(service)}
                              className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              <FiShare2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10">
              <button 
                onClick={() => scrollComparison('right')}
                className="bg-white p-2 rounded-full shadow-md text-pink-600 hover:bg-pink-50 transition-colors"
              >
                <FiChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </section>

        {/* Top Trending Services Highlights */}
        <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <FiZap className="mr-3 text-pink-600" />
              Most Viral Services
              {allServicesLoading && <LoadingSpinner size="small" className="ml-3" />}
            </h2>
            
            {allServicesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, index) => (
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
            ) : allServicesError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-red-800 mb-2">Failed to load viral services</h3>
                <button onClick={fetchTrendingServices} className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  <FiRefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
              </div>
            ) : viralServices.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-2xl shadow-lg">
                <div className="text-gray-400 text-4xl mb-3">📈</div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">No viral services yet</h3>
                <p className="text-gray-500">Check back later for trending services.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {viralServices.slice(0, 3).map((service) => (
                    <TrendingServiceCard 
                      key={service.id} 
                      service={service} 
                      onAddToCart={() => handleAddToCart(service)} 
                      onViewDetails={() => { 
                        setSelectedService(service); 
                        setShowServiceDetail(true); 
                      }} 
                      // onShare={() => shareService(service)}
                    />
                  ))}
              </div>
            )}
        </section>

        {/* Enhanced Statistics Section */}
        {!allServicesLoading && !allServicesError && viralServices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-8 text-white mb-8 shadow-xl"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold mb-2">{viralServices.length}</div>
                <div className="text-pink-100">Trending Services</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">{serviceCategories.length - 1}</div>
                <div className="text-pink-100">Trending Categories</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">
                  {viralServices.filter(s => (s as any).isViral).length}
                </div>
                <div className="text-pink-100">Viral Services</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">4.9</div>
                <div className="text-pink-100">Average Rating</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Enhanced Special Offers Banner */}
        <section className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-6 mb-8 relative overflow-hidden text-center border-2 border-pink-200">
            <div className="absolute -top-4 -right-4 text-8xl opacity-10">🎁</div>
            <div className="absolute -bottom-4 -left-4 text-8xl opacity-10">✨</div>
            <div className="relative z-10">
                <div className="inline-flex items-center bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-2">
                  <FiZap className="mr-1" />
                  FLASH SALE ON TRENDING SERVICES
                </div>
                <h3 className="text-2xl font-bold text-gray-800">30% OFF On All Trending Spa Treatments</h3>
                <p className="text-gray-600 mt-1">Relax, rejuvenate, and save! A perfect treat awaits.</p>
                <div className="mt-4 font-mono text-xl tracking-widest bg-white/50 inline-block px-4 py-2 rounded-lg border border-pink-300">
                  Ends in: {formatTime()}
                </div>
                <div className="mt-4 flex justify-center space-x-2">
                  <span className="bg-white text-pink-600 text-xs px-2 py-1 rounded-full">🔥 Trending</span>
                  <span className="bg-white text-purple-600 text-xs px-2 py-1 rounded-full">✨ Viral</span>
                  <span className="bg-white text-red-600 text-xs px-2 py-1 rounded-full">💖 Feminine</span>
                </div>
            </div>
        </section>

        {/* Testimonials */}
        <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Glow-ups & Stories</h2>
            <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide">
                <TestimonialCard name="Priya S." text="My skin has never looked better! The diamond facial is pure magic. Feeling so confident!" image="/images/testimonial1.jpg" />
                <TestimonialCard name="Ananya R." text="The bridal makeup team made me feel like an absolute princess on my big day! Flawless work." image="/images/testimonial2.jpg" />
                <TestimonialCard name="Maya T." text="Best hair spa in town. My damaged hair is now silky smooth and full of life. Highly recommend!" image="/images/testimonial3.jpg" />
            </div>
        </section>

      </main>
      
      <ServiceDetailModal service={selectedService} isOpen={showServiceDetail} onClose={() => setShowServiceDetail(false)} onAddToCart={handleAddToCart} activeFaq={activeFaq} setActiveFaq={setActiveFaq} />
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onLoginSuccess={() => { setShowLoginModal(false); setBookingStep('booking'); }}
        onSkipToHome={() => setShowLoginModal(false)}
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
  );
};

function TestimonialCard({ name, text, image }: { name: string; text: string; image: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg w-80 flex-shrink-0 overflow-hidden border border-pink-100">
      <div className="p-6">
        <div className="flex items-center mb-4">
            <img className="w-12 h-12 rounded-full object-cover mr-4" src={image} alt={name}/>
            <div>
                <p className="font-bold text-purple-800">{name}</p>
                <div className="flex text-yellow-400">{'⭐'.repeat(5)}</div>
            </div>
        </div>
        <p className="text-gray-700 text-sm leading-relaxed">"{text}"</p>
      </div>
    </div>
  );
}

export default HomePage;