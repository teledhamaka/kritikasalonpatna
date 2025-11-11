// app/nail/ClientNailPage.tsx
"use client";

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// Only import essential icons initially
import { ChevronLeft, ChevronRight, Filter, Zap, Users, AlertCircle } from 'lucide-react';

import { Service } from '../../types/service';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import ServiceSkeleton from '../../components/ServiceSkeleton';

// Define MotionSection props interface
interface MotionSectionProps {
  children: React.ReactNode;
  className?: string;
}

const MotionSection = ({ children, className = "" }: MotionSectionProps) => (
  <section className={className}>{children}</section>
);

// Heavy components lazy-loaded with SSR disabled
const ServiceCard = dynamic(() => import('../../components/ServiceCard'), {
  ssr: false,
  loading: () => <ServiceSkeleton />
});

const ServiceDetailModal = dynamic(() => import('../../components/ServiceDetailModal'), {
  ssr: false
});

const BeautyQuiz = dynamic(() => import('../../components/BeautyQuiz'), {
  ssr: false
});

const SkinAnalysis = dynamic(() => import('../../components/SkinAnalysis'), {
  ssr: false
});

const TestimonialCard = dynamic(() => import('../../components/TestimonialCard'), {
  ssr: false
});

const LoginModal = dynamic(() => import('../../components/LoginModal'), {
  ssr: false
});

const BookingFlow = dynamic(() => import('../../components/booking/BookingFlow'), {
  ssr: false
});

const MobileBottomNav = dynamic(() => import('../../components/MobileBottomNav'), {
  ssr: false
});

const FloatingCart = dynamic(() => import('../../components/FloatingCart'), {
  ssr: false
});

interface ClientNailPageProps {
  allServices: Service[];
  trendingServices: Service[];
}

const ClientNailPage = ({ allServices}: ClientNailPageProps) => {
  // Core states only
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showServiceDetail, setShowServiceDetail] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  // Lazy states
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [priceRange, setPriceRange] = useState<string>('all');
  const [durationRange, setDurationRange] = useState<string>('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('all');
  
  const [showBeautyQuiz, setShowBeautyQuiz] = useState(false);
  const [showSkinAnalysis, setShowSkinAnalysis] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [bookingStep, setBookingStep] = useState<'browsing' | 'booking'>('browsing');

  const serviceScrollRef = useRef<HTMLDivElement>(null);
  const { isLoggedIn } = useAuth();
  const { addToCart } = useBooking();

  // Initialize with pre-fetched data
  //const [viralServices] = useState<Service[]>(trendingServices);
  const serviceCategories = ['All', ...new Set(allServices.map(service => service.category))];

  // Memoized callbacks
  const getCategoryFilteredServices = useCallback(() => {
    if (selectedCategory === 'All') return allServices;
    return allServices.filter(service => service.category === selectedCategory);
  }, [selectedCategory, allServices]);

  const filteredServices = getCategoryFilteredServices();

  const applyFilters = useCallback((services: Service[]) => {
    return services.filter(service => {
      const priceMatch = priceRange === 'all' ||
        (priceRange === 'low' && service.price <= 2000) ||
        (priceRange === 'medium' && service.price > 2000 && service.price <= 5000) ||
        (priceRange === 'high' && service.price > 5000);
      
      const durationMatch = durationRange === 'all' ||
        (durationRange === 'quick' && service.duration <= 60) ||
        (durationRange === 'medium' && service.duration > 60 && service.duration <= 90) ||
        (durationRange === 'long' && service.duration > 90);
      
      const typeMatch = serviceTypeFilter === 'all' ||
        (serviceTypeFilter === 'nail art' && service.category?.toLowerCase().includes('nail art')) ||
        (serviceTypeFilter === 'manicure' && service.category?.toLowerCase().includes('manicure')) ||
        (serviceTypeFilter === 'pedicure' && service.category?.toLowerCase().includes('pedicure'));
      
      return priceMatch && durationMatch && typeMatch;
    });
  }, [priceRange, durationRange, serviceTypeFilter]);

  const filteredAndSortedServices = applyFilters(filteredServices);

  // Optimized image handling
  const getCategoryImage = useCallback((category: string) => {
    if (category === 'All') return '/images/all-services.jpg';
    const firstService = allServices.find(s => s.category === category);
    return firstService?.image || '/images/placeholder.jpg';
  }, [allServices]);

  const getCategoryCount = useCallback((category: string) => {
    if (category === 'All') return allServices.length;
    return allServices.filter(s => s.category === category).length;
  }, [allServices]);

  const toggleFavorite = useCallback((serviceId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(serviceId)) newFavorites.delete(serviceId);
      else newFavorites.add(serviceId);
      return newFavorites;
    });
  }, []);

  const scrollServices = useCallback((direction: 'left' | 'right') => {
    if (serviceScrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      serviceScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }, []);

  const proceedToBooking = useCallback(() => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    setBookingStep('booking');
  }, [isLoggedIn]);

  const handleAddToCart = useCallback((service: Service) => {
    addToCart(service);
  }, [addToCart]);

  if (bookingStep === 'booking') {
    return <BookingFlow onBack={() => setBookingStep('browsing')} />;    
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-pink-50">
      {/* Critical: Header - No heavy animations */}
      <header className="bg-linear-to-r from-orange-600 via-pink-600 to-orange-700 text-white py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-4 right-4 hidden md:flex space-x-2">
          <span className="bg-orange-500 text-xs px-2 py-1 rounded-full">🔥 TRENDING</span>
          <span className="bg-pink-500 text-xs px-2 py-1 rounded-full">✨ VIRAL</span>
        </div>
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-linear-to-r from-white to-orange-100 bg-clip-text text-transparent">
              MANICURE & PEDICURE
            </h1>
            <p className="text-lg md:text-xl text-orange-100 max-w-2xl mx-auto">
              FLAWLESS CANVAS, TIMELESS ELEGANCE ✨
            </p>
            <p className="text-sm md:text-lg text-orange-100 max-w-2xl mx-auto mt-2">
              Transform your nails with our specialist Nail Care experts
            </p>
            <div className="mt-4 md:mt-6 flex flex-wrap justify-center gap-4 md:gap-8 text-xs md:text-sm">
              <div className="flex items-center">
                <Users className="mr-2" />
                <span>1500+ Happy Clients</span>
              </div>
              <div className="flex items-center">
                <span>⭐</span>
                <span className="ml-2">4.7 Rating</span>
              </div>
              <div className="flex items-center">
                <Zap className="mr-2" />
                <span>20+ Nail Services</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Viral Alert - Simple CSS animation */}
      <div className="bg-linear-to-r from-rose-500 to-orange-600 text-white py-3 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2">
          <Zap className="animate-pulse" />
          <span className="font-semibold text-sm md:text-base">TRENDING ALERT:</span>
          <span className="text-sm md:text-base">These nail services are going viral! Book now! 🚀</span>
        </div>
      </div>

      {/* Lazy-loaded components */}
      <FloatingCart onProceedToBooking={proceedToBooking} />

      <main className="max-w-7xl mx-auto py-6 md:py-8 px-4 pb-20 md:pb-8">
        {/* Service Categories Grid - Critical content */}
        <MotionSection className="mb-8 md:mb-12">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 text-center flex items-center justify-center">
            <Zap className="mr-2 text-orange-600" />
            Browse Nail Services
          </h2>
          
          <div className="grid grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
            {serviceCategories.slice(0, 6).map((category) => (
              <div 
                key={category} 
                onClick={() => setSelectedCategory(category)} 
                className="cursor-pointer transition-all duration-300 aspect-square hover:scale-105"
              >
                <div className={`h-full rounded-xl p-2 md:p-3 text-center transition-all duration-300 flex flex-col items-center justify-center ${
                  selectedCategory === category 
                    ? 'bg-linear-to-br from-orange-500 to-pink-600 text-white shadow-lg' 
                    : 'bg-white text-gray-700 shadow-md hover:shadow-lg border border-orange-100'
                }`}>
                  <div className="w-8 h-8 md:w-30 md:h-30 mx-auto mb-1 md:mb-2 rounded-full overflow-hidden border border-white/20">
                    <Image 
                      src={getCategoryImage(category)} 
                      alt={category}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <p className="font-medium text-xs leading-tight">{category}</p>
                  <p className="text-[10px] md:text-xs opacity-75 mt-0.5">
                    {getCategoryCount(category)} services
                  </p>
                </div>
              </div>
            ))}
          </div>
        </MotionSection>

        {/* Personalized Nail Hub */}
        <MotionSection className="mb-8 md:mb-12">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 text-center flex items-center justify-center">
            <Zap className="mr-2 text-orange-600" />
            Discover Your Perfect Nail Style
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div 
              onClick={() => setShowBeautyQuiz(true)} 
              className="bg-linear-to-br from-orange-50 to-pink-100 p-4 md:p-6 rounded-xl cursor-pointer hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center border-2 border-orange-200 hover:scale-102"
            >
              <div className="text-3xl md:text-5xl mb-2 md:mb-3">💅</div>
              <h3 className="text-lg md:text-xl font-bold text-pink-800">Nail Style Quiz</h3>
              <p className="text-gray-600 text-xs md:text-sm mt-1">Find perfect nail designs tailored for you!</p>
              <span className="mt-3 md:mt-4 bg-white text-orange-600 font-semibold py-1.5 px-3 md:py-2 md:px-4 rounded-full text-xs md:text-sm border border-orange-300">
                Start Quiz
              </span>
            </div>
            <div 
              onClick={() => setShowSkinAnalysis(true)} 
              className="bg-linear-to-br from-pink-50 to-orange-100 p-4 md:p-6 rounded-xl cursor-pointer hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center border-2 border-pink-200 hover:scale-102"
            >
              <div className="text-3xl md:text-5xl mb-2 md:mb-3">🔍</div>
              <h3 className="text-lg md:text-xl font-bold text-pink-800">Nail Health Analysis</h3>
              <p className="text-gray-600 text-xs md:text-sm mt-1">Get personalized nail care advice.</p>
              <span className="mt-3 md:mt-4 bg-white text-pink-600 font-semibold py-1.5 px-3 md:py-2 md:px-4 rounded-full text-xs md:text-sm border border-pink-300">
                Analyze Nails
              </span>
            </div>
          </div>
        </MotionSection>

        {showBeautyQuiz && <BeautyQuiz onClose={() => setShowBeautyQuiz(false)} />}
        {showSkinAnalysis && <SkinAnalysis onClose={() => setShowSkinAnalysis(false)} />}

        {/* Filter Section */}
        <MotionSection className="mb-6 md:mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg md:text-xl font-bold text-gray-800">
              {selectedCategory === 'All' ? 'Select Your Nail Services' : selectedCategory}
            </h2>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center text-orange-600 font-medium hover:text-orange-700 transition-colors text-sm md:text-base"
            >
              <Filter className="mr-1 md:mr-2" />
              {showFilters ? 'Hide' : 'Filter'} 
            </button>
          </div>
          
          {showFilters && (
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-md grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6 border border-orange-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm md:text-base"
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
                  className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm md:text-base"
                >
                  <option value="all">All Durations</option>
                  <option value="quick">Up to 60 min</option>
                  <option value="medium">61-90 min</option>
                  <option value="long">91+ min</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nail Service Type</label>
                <select
                  value={serviceTypeFilter}
                  onChange={(e) => setServiceTypeFilter(e.target.value)}
                  className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm md:text-base"
                >
                  <option value="all">All Types</option>
                  <option value="nail art">Nail Art</option>
                  <option value="manicure">Manicure</option>
                  <option value="pedicure">Pedicure</option>
                </select>
              </div>
            </div>
          )}
        </MotionSection>

        {/* Services Horizontal Scroll - Mobile Only */}
        <section className="mb-8 md:hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Featured Nail Services</h2>
            <div className="flex space-x-1">
              <button onClick={() => scrollServices('left')} className="p-1.5 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow text-orange-600 hover:bg-orange-50">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => scrollServices('right')} className="p-1.5 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow text-orange-600 hover:bg-orange-50">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div ref={serviceScrollRef} className="flex overflow-x-auto scrollbar-hide space-x-4 pb-4" style={{ scrollbarWidth: 'none' }}>
            {filteredAndSortedServices.slice(0, 10).map((service) => (
              <ServiceCard 
                key={service.id} 
                service={service} 
                isFavorite={favorites.has(service.id)} 
                onToggleFavorite={() => toggleFavorite(service.id)} 
                onAddToCart={() => handleAddToCart(service)} 
                onViewDetails={() => { setSelectedService(service); setShowServiceDetail(true); }}
              />
            ))}
          </div>
        </section>

        {/* Services Grid - Desktop Only */}
        <section className="hidden md:block mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            {selectedCategory === 'All' ? 'All Nail Services' : selectedCategory} 
            <span className="text-gray-600 text-sm font-normal ml-2">({filteredAndSortedServices.length} services)</span>
          </h2>

          {filteredAndSortedServices.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-medium text-gray-600 mb-2">No nail services found</h3>
              <p className="text-gray-500">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
              {filteredAndSortedServices.map((service) => (
                <ServiceCard 
                  key={service.id} 
                  service={service} 
                  isFavorite={favorites.has(service.id)} 
                  onToggleFavorite={() => toggleFavorite(service.id)} 
                  onAddToCart={() => handleAddToCart(service)} 
                  onViewDetails={() => { setSelectedService(service); setShowServiceDetail(true); }}
                />
              ))}
            </div>
          )}
        </section>

        {/* Simple Special Offers Banner */}
        <section className="bg-linear-to-r from-orange-100 to-pink-100 rounded-xl p-4 md:p-6 mb-6 md:mb-8 text-center border-2 border-orange-200">
          <div className="inline-flex items-center bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full mb-2">
            <Zap className="mr-1" />
            FLASH SALE
          </div>
          <h3 className="text-lg md:text-xl font-bold text-gray-800">30% OFF On Gel Manicures</h3>
          <p className="text-gray-600 text-xs md:text-sm mt-1">Transform, rejuvenate, and save!</p>
        </section>

        {/* Testimonials */}
        <section className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 text-center">Nail Transformations & Stories</h2>
          <div className="flex overflow-x-auto space-x-4 md:space-x-6 pb-4 scrollbar-hide">
            <TestimonialCard name="Priya S." text="My gel manicure lasted for weeks without chipping! The nail art was absolutely stunning!" image="/images/nails/gel_manicure.webp" />
            <TestimonialCard name="Ananya R." text="The pedicure was so relaxing and my feet have never felt better. Highly recommend!" image="/images/nails/luxury_pedicure.webp" />
            <TestimonialCard name="Maya T." text="The 3D nail art I got for my wedding was breathtaking! Everyone complimented my nails!" image="/images/nails/nail_art.webp" />
          </div>
        </section>
      </main>

      {/* Lazy-loaded modals */}
      {selectedService && showServiceDetail && (
        <ServiceDetailModal 
          service={selectedService} 
          isOpen={showServiceDetail} 
          onClose={() => setShowServiceDetail(false)} 
          onAddToCart={handleAddToCart}
          activeFaq={activeFaq}
          setActiveFaq={setActiveFaq}
        />
      )}
      
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onLoginSuccess={() => { setShowLoginModal(false); setBookingStep('booking'); }}
        onSkipToHome={() => setShowLoginModal(false)}
      />

      <MobileBottomNav />

      {/* Offline Indicator */}
      {typeof window !== 'undefined' && !navigator.onLine && (
        <div className="fixed bottom-16 md:bottom-4 left-4 bg-red-500 text-white px-3 py-1.5 rounded-lg shadow-lg text-sm">
          <div className="flex items-center">
            <AlertCircle className="w-3 h-3 mr-1" />
            <span>You&apos;re offline</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientNailPage;