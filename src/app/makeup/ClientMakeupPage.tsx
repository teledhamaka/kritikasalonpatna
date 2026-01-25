// kritika/src/app/makeup/ClientMakeupPage.tsx - UPDATED TO MATCH HOME PAGE PATTERNS
"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { MapPin, Sparkles, Zap, Phone, Clock, Award, TrendingUp, Users, Heart, ArrowRight, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Service } from '../../types/service';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import ServiceSkeleton from '../../components/ServiceSkeleton';

// Lazy load heavy components
const ServiceCard = dynamic(() => import('../../components/ServiceCard'), {
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

const TestimonialCard = dynamic(() => import('../../components/TestimonialCard'));

const LoginModal = dynamic(() => import('../../components/LoginModal'), {
  ssr: false
});

const BookingFlow = dynamic(() => import('../../components/booking/BookingFlow'), {
  ssr: false
});

const MobileBottomNav = dynamic(() => import('../../components/MobileBottomNav'));

const FloatingCart = dynamic(() => import('../../components/FloatingCart'));

interface ClientMakeupPageProps {
  allServices: Service[];
  trendingServices: Service[];
}

const ClientMakeupPage = ({ allServices, trendingServices }: ClientMakeupPageProps) => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showServiceDetail, setShowServiceDetail] = useState(false);
  const [showBeautyQuiz, setShowBeautyQuiz] = useState(false);
  const [showSkinAnalysis, setShowSkinAnalysis] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [bookingStep, setBookingStep] = useState<'browsing' | 'booking'>('browsing');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isLandscape, setIsLandscape] = useState<boolean>(false);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);

  const serviceScrollRef = useRef<HTMLDivElement>(null);
  const trendingScrollRef = useRef<HTMLDivElement>(null);
  const { isLoggedIn } = useAuth();
  const { addToCart } = useBooking();

  // Get trending services count
  const trendingCount = trendingServices?.length || 0;
  const hasTrendingServices = trendingCount > 0;

  // Get unique categories
  const serviceCategories = [
    'All',
    ...Array.from(new Set(allServices.map(service => service.category || '').filter(Boolean)))
  ];

  // Viewport detection useEffect - SAME AS HOME PAGE
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const updateViewport = () => {
      const isMob = window.innerWidth < 768;
      setIsMobile(isMob);
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    const handleResize = () => {
      if (timeoutId) clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        updateViewport();
      }, 150);
    };

    updateViewport();

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Auto-scroll trending services on desktop - SAME AS HOME PAGE
  useEffect(() => {
    if (!trendingScrollRef.current || !autoScroll || isMobile || trendingCount < 3) return;
    
    const scrollContainer = trendingScrollRef.current;
    let scrollInterval: NodeJS.Timeout;
    let scrollDirection = 1;
    let scrollPosition = 0;
    
    const startScrolling = () => {
      scrollInterval = setInterval(() => {
        if (!scrollContainer) return;
        
        const containerWidth = scrollContainer.clientWidth;
        const contentWidth = scrollContainer.scrollWidth;
        const maxScroll = contentWidth - containerWidth;
        
        if (scrollPosition >= maxScroll - 10) {
          scrollDirection = -1;
        } else if (scrollPosition <= 10) {
          scrollDirection = 1;
        }
        
        scrollPosition += scrollDirection * 0.5;
        scrollContainer.scrollLeft = scrollPosition;
      }, 20);
    };
    
    const stopScrolling = () => {
      clearInterval(scrollInterval);
    };
    
    startScrolling();
    
    scrollContainer.addEventListener('mouseenter', () => {
      setAutoScroll(false);
      stopScrolling();
    });
    
    scrollContainer.addEventListener('mouseleave', () => {
      setAutoScroll(true);
    });
    
    return () => {
      stopScrolling();
      scrollContainer.removeEventListener('mouseenter', () => {});
      scrollContainer.removeEventListener('mouseleave', () => {});
    };
  }, [trendingCount, isMobile, autoScroll]);

  // Filter services by selected category
  const getFilteredServices = useCallback(() => {
    if (selectedCategory === 'All') return allServices;
    return allServices.filter(service => service.category === selectedCategory);
  }, [selectedCategory, allServices]);

  const filteredServices = getFilteredServices();

  // Get category image - SAME PATTERN AS HOME PAGE
  const getCategoryImage = useCallback((category: string) => {
    if (category === 'All') return '/images/all-services.jpg';
    const firstService = allServices.find(s => s.category === category);
    return firstService?.image || '/images/placeholder.jpg';
  }, [allServices]);

  // Makeup subcategories for horizontal display - SIMILAR TO HOME PAGE
  const MAKEUP_SUBCATEGORIES = [
    {
      id: 'bridal',
      title: 'Bridal Makeup',
      description: 'Complete bridal packages',
      image: '/images/makeup/complete_bridal_package.webp',
      icon: '👰',
      color: 'from-pink-500 to-rose-600'
    },
    {
      id: 'engagement',
      title: 'Engagement',
      description: 'Pre-wedding makeup',
      image: '/images/makeup/bridal_HDLook.webp',
      icon: '💍',
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 'party',
      title: 'Party Makeup',
      description: 'Evening & party looks',
      image: '/images/makeup/bridal_makeup.webp',
      icon: '🎉',
      color: 'from-amber-500 to-orange-600'
    },
    {
      id: 'hd',
      title: 'HD Makeup',
      description: 'Camera-ready makeup',
      image: '/images/makeup/hd_makeup.webp',
      icon: '📸',
      color: 'from-blue-500 to-cyan-600'
    }
  ];

  const toggleFavorite = useCallback((serviceId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(serviceId)) {
        newFavorites.delete(serviceId);
      } else {
        newFavorites.add(serviceId);
      }
      return newFavorites;
    });
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

  const handleServiceClick = useCallback((service: Service) => {
    if (service.url) {
      router.push(service.url);
    } else {
      setSelectedService(service);
      setShowServiceDetail(true);
    }
  }, [router]);

  const navigateToCategory = useCallback((category: string) => {
    setSelectedCategory(category);
    if (serviceScrollRef.current) {
      serviceScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  if (bookingStep === 'booking') {
    return <BookingFlow onBack={() => setBookingStep('browsing')} />;
  }

  return (
    <div className={`
      min-h-screen 
      bg-gradient-to-br from-pink-50 via-white to-purple-50 
      safe-area-inset
      overflow-x-hidden
      w-full
      ${isLandscape ? 'landscape-mode' : ''}
    `}>
      <main className={`
        max-w-7xl 
        mx-auto 
        px-4 
        py-6 
        ${isMobile ? (isLandscape ? 'pb-28' : 'pb-32') : 'pb-8'}
        safe-area-inset
        w-full
        overflow-x-hidden
        scroll-padding
      `}>
        
        {/* TRENDING MAKEUP SERVICES BANNER - SIMILAR TO HOME PAGE */}
        {hasTrendingServices && (
          <section className={`
            bg-gradient-to-r from-yellow-50 via-pink-50 to-purple-50 
            rounded-2xl 
            p-4 
            mb-6 
            border 
            border-pink-200
            w-full
            ${isLandscape ? 'py-3' : ''}
          `}>
            <h2 className="sr-only">
              Trending Makeup Services
            </h2>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`
                  ${isMobile && isLandscape ? 'w-8 h-8' : 'w-10 h-10'}
                  bg-gradient-to-br from-pink-500 to-rose-500 
                  rounded-full 
                  flex 
                  items-center 
                  justify-center
                  flex-shrink-0
                  animate-pulse
                `}>
                  <TrendingUp className={`
                    ${isMobile && isLandscape ? 'w-4 h-4' : 'w-5 h-5'} 
                    text-white
                  `} />
                </div>
                <div>
                  <h3 className={`
                    font-bold 
                    text-gray-900 
                    ${isMobile ? (isLandscape ? 'text-sm' : 'text-base') : 'text-lg'}
                  `}>
                    Trending Makeup Services
                  </h3>
                  <p className={`
                    ${isLandscape ? 'text-[10px]' : 'text-xs'} 
                    text-gray-600
                  `}>
                    Most booked {trendingCount} makeup services
                  </p>
                </div>
              </div>
            </div>
            
            {/* HORIZONTAL SCROLLING TRENDING SERVICES - SAME AS HOME PAGE */}
            <div 
              ref={trendingScrollRef}
              className={`
                flex 
                ${isMobile ? 'overflow-x-auto space-x-4' : 'overflow-hidden'} 
                pb-3 
                mb-4 
                ${isMobile ? 'scrollbar-hide' : ''}
                ${!isMobile ? 'relative' : ''}
              `}
              style={{
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              {trendingServices.map((service) => (
                <div 
                  key={service.id} 
                  className={`
                    ${isMobile ? 'flex-shrink-0' : 'flex-shrink-0'}
                    ${isLandscape ? 'min-w-[160px]' : isMobile ? 'min-w-[200px]' : 'min-w-[220px]'}
                    ${isLandscape ? 'max-w-[160px]' : isMobile ? 'max-w-[200px]' : 'max-w-[220px]'}
                    bg-white 
                    rounded-xl 
                    ${isLandscape ? 'p-2' : isMobile ? 'p-3' : 'p-3'}
                    border 
                    border-pink-100 
                    shadow-sm
                    hover:shadow-md
                    transition-all 
                    duration-300
                    flex 
                    flex-col
                    cursor-pointer
                    group
                    ${!isMobile ? 'hover:scale-[1.02]' : ''}
                  `}
                  onClick={() => handleServiceClick(service)}
                  aria-label={`View ${service.title}`}
                >
                  {/* Service Image */}
                  <div className={`
                    relative 
                    ${isLandscape ? 'h-24' : isMobile ? 'h-32' : 'h-36'} 
                    w-full 
                    rounded-lg 
                    overflow-hidden 
                    mb-2
                    group-hover:shadow-inner
                  `}>
                    <Image
                      src={service.image || '/images/placeholder.jpg'}
                      alt={service.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes={isMobile ? "200px" : "220px"}
                      priority={true}
                    />
                    {/* Best Seller Badge */}
                    {service.isBestSeller && (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
                          <Star className="w-3 h-3 fill-white" />
                          Best Seller
                        </span>
                      </div>
                    )}
                    {/* Rating Badge */}
                    <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>{service.rating?.toFixed(1) || '4.5'}</span>
                    </div>
                  </div>
                  
                  {/* Service Info */}
                  <div className="flex-1 flex flex-col">
                    <h4 className={`
                      font-semibold 
                      text-gray-800 
                      ${isLandscape ? 'text-xs' : isMobile ? 'text-sm' : 'text-sm'}
                      line-clamp-2 
                      mb-1
                      group-hover:text-pink-600
                      transition-colors
                    `}>
                      {service.title}
                    </h4>
                    
                    <p className={`
                      text-gray-600 
                      ${isLandscape ? 'text-[10px]' : 'text-xs'}
                      line-clamp-2 
                      mb-2
                    `}>
                      {service.shortDescription || service.description?.substring(0, 60)}...
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex flex-col">
                        <span className={`
                          font-bold 
                          text-pink-600 
                          ${isLandscape ? 'text-sm' : 'text-base'}
                        `}>
                          ₹{service.price}
                        </span>
                        {service.originalPrice && service.originalPrice > service.price && (
                          <span className={`
                            text-gray-400 
                            ${isLandscape ? 'text-[10px]' : 'text-xs'}
                            line-through
                          `}>
                            ₹{service.originalPrice}
                          </span>
                        )}
                      </div>
                      
                      <div className={`
                        ${isLandscape ? 'text-[10px]' : 'text-xs'} 
                        text-gray-500
                        flex items-center gap-1
                      `}>
                        <Clock className={isLandscape ? 'w-3 h-3' : 'w-3 h-3'} />
                        <span>{service.durationText || `${service.duration || 60} min`}</span>
                      </div>
                    </div>
                    
                    {/* Quick Action Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(service);
                      }}
                      className={`
                        w-full 
                        mt-2 
                        ${isLandscape ? 'py-1.5 text-xs' : isMobile ? 'py-2 text-sm' : 'py-2 text-sm'}
                        bg-gradient-to-r from-pink-500 to-rose-500 
                        text-white 
                        font-medium 
                        rounded-lg 
                        hover:from-pink-600 hover:to-rose-600
                        active:from-pink-700 active:to-rose-700
                        transition-all 
                        duration-200
                        shadow-sm hover:shadow-md
                        flex items-center justify-center gap-1
                      `}
                    >
                      <span>Add to Cart</span>
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Makeup Subcategories - SIMILAR TO HOME PAGE */}
        <section className="mb-8" aria-label="Makeup service categories">
          <h2 className={`
            ${isLandscape ? 'text-lg' : 'text-xl'} 
            font-bold 
            text-gray-800 
            mb-4 
            text-center 
            flex 
            items-center 
            justify-center
          `}>
            <Zap className="mr-2 text-pink-600" />
            Makeup Categories
          </h2>
          
          <div className={`
            ${isMobile ? 'grid grid-cols-2 gap-3' : 'flex flex-wrap justify-center gap-3'}
          `}>
            {MAKEUP_SUBCATEGORIES.map((category) => (
              <div
                key={category.id}
                className={`
                  ${isMobile ? '' : 'flex-1 min-w-[240px] max-w-[280px]'}
                  bg-gradient-to-br ${category.color} 
                  rounded-xl 
                  overflow-hidden 
                  shadow-lg 
                  hover:shadow-xl 
                  transition-all 
                  duration-300 
                  transform 
                  hover:-translate-y-1
                  ${isLandscape ? 'h-full' : ''}
                `}
              >
                <div className="p-5 text-white">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className={`font-bold ${isLandscape ? 'text-lg' : 'text-xl'}`}>
                        {category.title}
                      </h3>
                      <p className="text-white/80 text-sm mt-1">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative h-40 rounded-lg overflow-hidden mb-4 border-2 border-white/20">
                    <Image
                      src={category.image}
                      alt={`${category.title} services`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 280px, (max-width: 1024px) 200px, 250px"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  </div>
                  
                  <button
                    onClick={() => navigateToCategory(category.title.split(' ')[0])}
                    className={`
                      w-full 
                      bg-white 
                      text-gray-800 
                      font-semibold 
                      py-2.5 
                      px-4 
                      rounded-lg 
                      flex 
                      items-center 
                      justify-center 
                      gap-2 
                      hover:bg-gray-50 
                      active:bg-gray-100 
                      transition-colors 
                      duration-200
                      ${isLandscape ? 'py-2 text-sm' : ''}
                    `}
                    aria-label={`Browse ${category.title} services`}
                  >
                    <span>Browse Services</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Category Filter Buttons */}
        <section className="mb-6" aria-label="Filter makeup services by category">
          <div className={`
            ${isMobile ? 'flex overflow-x-auto space-x-2 pb-2' : 'flex flex-wrap justify-center gap-2'}
          `}>
            {serviceCategories.map((category) => {
              const categoryServices = allServices.filter(s => 
                category === 'All' ? true : s.category === category
              );
              
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`
                    ${isMobile ? 'flex-shrink-0' : ''}
                    px-4 
                    py-2 
                    rounded-full 
                    font-medium 
                    transition-all 
                    duration-200
                    ${selectedCategory === category 
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-pink-100'
                    }
                    ${isLandscape ? 'text-xs px-3 py-1.5' : isMobile ? 'text-sm' : 'text-sm'}
                  `}
                  aria-label={`Show ${category} makeup services - ${categoryServices.length} available`}
                  aria-pressed={selectedCategory === category}
                >
                  {category} ({categoryServices.length})
                </button>
              );
            })}
          </div>
        </section>

        {/* Services Grid */}
        <section aria-label={`${selectedCategory} makeup services`}>
          <div
            ref={serviceScrollRef}
            className={`
              ${isMobile ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'}
            `}
          >
            {filteredServices.map((service) => (
              <article 
                key={service.id}
                className={`
                  ${isLandscape ? 'h-full' : ''}
                `}
                itemScope
                itemType="https://schema.org/Service"
              >
                <meta itemProp="name" content={service.title} />
                <meta itemProp="description" content={service.shortDescription} />
                <meta itemProp="image" content={service.image} />
                <div itemProp="offers" itemScope itemType="https://schema.org/Offer">
                  <meta itemProp="price" content={service.price.toString()} />
                  <meta itemProp="priceCurrency" content="INR" />
                  <meta itemProp="availability" content="https://schema.org/InStock" />
                </div>
                
                <ServiceCard
                  service={service}
                  isFavorite={favorites.has(service.id)}
                  onToggleFavorite={() => toggleFavorite(service.id)}
                  onAddToCart={() => handleAddToCart(service)}
                  onViewDetails={() => {
                    setSelectedService(service);
                    setShowServiceDetail(true);
                  }}
                  variant={isLandscape ? 'compact' : 'detailed'}
                  showBestSellerBadge={service.isBestSeller === true}
                />
              </article>
            ))}
          </div>

          {filteredServices.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl shadow-md">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-medium text-gray-600 mb-2">No services found</h3>
              <p className="text-gray-500">Try selecting a different category</p>
            </div>
          )}
        </section>

        {/* Interactive Tools - SAME AS HOME PAGE */}
        <section className="mb-8" aria-label="Makeup consultation tools">
          <h2 className={`
            ${isLandscape ? 'text-lg' : 'text-xl'} 
            font-bold 
            text-gray-800 
            mb-4 
            text-center 
            flex 
            items-center 
            justify-center
          `}>
            <Zap className="mr-2 text-pink-600" />
            Discover Your Perfect Look
          </h2>
          <div className={`
            grid 
            ${isLandscape ? 'grid-cols-2 gap-2' : 'grid-cols-2 gap-3'}
          `}>
            <button
              onClick={() => setShowBeautyQuiz(true)}
              className="
                bg-gradient-to-br from-pink-50 to-purple-100 
                p-4 
                rounded-xl 
                hover:shadow-xl 
                transition-all 
                duration-300 
                flex 
                flex-col 
                items-center 
                text-center 
                border-2 
                border-pink-200
                touch-target
                ${isLandscape ? 'p-3' : ''}
              "
              aria-label="Take our makeup style quiz"
            >
              <div className="text-3xl mb-2">💫</div>
              <h3 className={`
                ${isLandscape ? 'text-sm' : 'text-base'} 
                font-bold 
                text-purple-800
              `}>
                Makeup Style Quiz
              </h3>
              <p className={`
                text-gray-600 
                ${isLandscape ? 'text-xs' : 'text-xs mt-1'}
              `}>
                Find your perfect makeup look!
              </p>
              <span className={`
                mt-3 
                bg-white 
                text-pink-600 
                font-semibold 
                py-1.5 
                px-3 
                rounded-full 
                ${isLandscape ? 'text-xs' : 'text-xs'} 
                border 
                border-pink-300
              `}>
                Start Quiz
              </span>
            </button>
            <button
              onClick={() => setShowSkinAnalysis(true)}
              className="
                bg-gradient-to-br from-purple-50 to-pink-100 
                p-4 
                rounded-xl 
                hover:shadow-xl 
                transition-all 
                duration-300 
                flex 
                flex-col 
                items-center 
                text-center 
                border-2 
                border-purple-200
                touch-target
                ${isLandscape ? 'p-3' : ''}
              "
              aria-label="Analyze your skin tone"
            >
              <div className="text-3xl mb-2">✨</div>
              <h3 className={`
                ${isLandscape ? 'text-sm' : 'text-base'} 
                font-bold 
                text-purple-800
              `}>
                Skin Tone Analysis
              </h3>
              <p className={`
                text-gray-600 
                ${isLandscape ? 'text-xs' : 'text-xs mt-1'}
              `}>
                Find your perfect foundation match.
              </p>
              <span className={`
                mt-3 
                bg-white 
                text-purple-600 
                font-semibold 
                py-1.5 
                px-3 
                rounded-full 
                ${isLandscape ? 'text-xs' : 'text-xs'} 
                border 
                border-purple-300
              `}>
                Analyze Skin
              </span>
            </button>
          </div>
        </section>

        {/* Why Choose Us Banner - SIMILAR TO HOME PAGE */}
        <section className="
          bg-gradient-to-r from-pink-100 via-purple-100 to-rose-100 
          rounded-2xl 
          p-6 
          mb-6 
          border-2 
          border-pink-200
        ">
          <h2 className={`
            ${isLandscape ? 'text-lg' : 'text-xl'} 
            font-bold 
            text-gray-800 
            mb-6 
            text-center
          `}>
            Why Choose Our Makeup Services?
          </h2>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center">
              <Sparkles className={`
                ${isLandscape ? 'w-6 h-6' : 'w-8 h-8'} 
                text-purple-600 
                mb-2
              `} />
              <div className={`
                ${isLandscape ? 'text-xl' : 'text-2xl'} 
                font-bold 
                text-gray-900
              `}>
                {allServices.length}+
              </div>
              <div className={`
                ${isLandscape ? 'text-[10px]' : 'text-xs'} 
                text-gray-600
              `}>
                Makeup Services
              </div>
            </div>
            <div className="flex flex-col items-center" itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
              <Award className={`
                ${isLandscape ? 'w-6 h-6' : 'w-8 h-8'} 
                text-pink-600 
                mb-2
              `} />
              <div className={`
                ${isLandscape ? 'text-xl' : 'text-2xl'} 
                font-bold 
                text-gray-900
              `}>
                <span itemProp="ratingValue">4.8</span>
              </div>
              <div className={`
                ${isLandscape ? 'text-[10px]' : 'text-xs'} 
                text-gray-600
              `}>
                ⭐ <span itemProp="reviewCount">1000+</span> Reviews
              </div>
            </div>
            <div className="flex flex-col items-center">
              <Users className={`
                ${isLandscape ? 'w-6 h-6' : 'w-8 h-8'} 
                text-rose-600 
                mb-2
              `} />
              <div className={`
                ${isLandscape ? 'text-xl' : 'text-2xl'} 
                font-bold 
                text-gray-900
              `}>
                1000+
              </div>
              <div className={`
                ${isLandscape ? 'text-[10px]' : 'text-xs'} 
                text-gray-600
              `}>
                Happy Brides
              </div>
            </div>
          </div>
          
          {/* Open Now Badge */}
          <div className="mt-6 text-center">
            <div className="
              inline-flex 
              items-center 
              gap-2 
              bg-white 
              text-green-600 
              font-bold 
              ${isLandscape ? 'text-xs px-3 py-1.5' : 'text-sm px-4 py-2'} 
              rounded-full 
              border 
              border-green-200
              shadow-sm
            ">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Open Now</span>
              <span className="text-gray-600 font-normal">
                9:00 AM - 8:00 PM
              </span>
            </div>
          </div>
        </section>

        {/* Testimonials - SIMILAR TO HOME PAGE */}
        <section className="mb-6" aria-label="Customer testimonials">
          <h2 className={`
            ${isLandscape ? 'text-lg' : 'text-xl'} 
            font-bold 
            text-gray-800 
            mb-4 
            text-center
          `}>
            Makeup Transformations
          </h2>
          <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide">
            <TestimonialCard 
              name="Priya S." 
              text="My wedding makeup was absolutely flawless! The HD makeup lasted all day and looked perfect in photos." 
              image="/images/makeup/bridal_makeup.webp" 
            />
            <TestimonialCard 
              name="Ananya R." 
              text="The party makeup was stunning! Everyone complimented my airbrush makeup - it looked so natural yet glamorous." 
              image="/images/makeup/party_makeup.webp" 
            />
            <TestimonialCard 
              name="Maya T." 
              text="Best makeup artists in Patna! The attention to detail and hygiene standards are top-notch." 
              image="/images/makeup/hd_makeup.webp" 
            />
          </div>
        </section>

        {/* Promotional Banner */}
        <section className="
          bg-gradient-to-r from-pink-100 to-purple-100 
          rounded-xl 
          p-6 
          text-center 
          border-2 
          border-pink-200
        ">
          <div className="
            inline-flex 
            items-center 
            bg-red-500 
            text-white 
            text-xs 
            font-bold 
            px-2 
            py-1 
            rounded-full 
            mb-2
          ">
            <Zap className="mr-1" />
            BRIDAL SPECIAL
          </div>
          <h3 className={`
            ${isLandscape ? 'text-base' : 'text-lg'} 
            font-bold 
            text-gray-800
          `}>
            20% OFF On Bridal Makeup Packages
          </h3>
          <p className={`
            text-gray-600 
            ${isLandscape ? 'text-xs' : 'text-sm mt-1'}
          `}>
            Book your trial now and save big!
          </p>
        </section>
      </main>

      {/* Modals & Components - SAME AS HOME PAGE */}
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

      {showBeautyQuiz && <BeautyQuiz onClose={() => setShowBeautyQuiz(false)} />}
      {showSkinAnalysis && <SkinAnalysis onClose={() => setShowSkinAnalysis(false)} />}
      
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={() => {
          setShowLoginModal(false);
          setBookingStep('booking');
        }}
        onSkipToHome={() => setShowLoginModal(false)}
      />

      <FloatingCart onProceedToBooking={proceedToBooking} />
      <MobileBottomNav />
    </div>
  );
};

export default ClientMakeupPage;