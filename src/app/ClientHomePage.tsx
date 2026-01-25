// kritika/src/app/ClientHomePage.tsx - COMPLETE MODIFIED VERSION
"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { MapPin, Sparkles, Zap, Phone, Clock, Award, TrendingUp, Users, Heart, ArrowRight, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Service } from '../types/service';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import ServiceSkeleton from '../components/ServiceSkeleton';

// Lazy load heavy components
const ServiceCard = dynamic(() => import('../components/ServiceCard'), {
  loading: () => <ServiceSkeleton />
});

const ServiceDetailModal = dynamic(() => import('../components/ServiceDetailModal'), {
  ssr: false
});

const BeautyQuiz = dynamic(() => import('../components/BeautyQuiz'), {
  ssr: false
});

const SkinAnalysis = dynamic(() => import('../components/SkinAnalysis'), {
  ssr: false
});

const TestimonialCard = dynamic(() => import('../components/TestimonialCard'));

const LoginModal = dynamic(() => import('../components/LoginModal'), {
  ssr: false
});

const BookingFlow = dynamic(() => import('../components/booking/BookingFlow'), {
  ssr: false
});

const MobileBottomNav = dynamic(() => import('../components/MobileBottomNav'));

const FloatingCart = dynamic(() => import('../components/FloatingCart'));

interface ClientHomePageProps {
  allServices: Service[];
  trendingServices: Service[];
}

// Define main categories in the desired order
const MAIN_CATEGORIES = ['Bridal', 'Makeup', 'Skin', 'Hair', 'Nails'];

const ClientHomePage = ({ allServices, trendingServices }: ClientHomePageProps) => {
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

  // Get unique categories for browsing section
  const serviceCategories = [
    'All',
    ...Array.from(new Set(allServices.map(service => service.category || '').filter(Boolean)))
  ];

  // Viewport detection useEffect
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

  // Auto-scroll trending services on desktop
  useEffect(() => {
    if (!trendingScrollRef.current || !autoScroll || isMobile || trendingCount < 3) return;
    
    const scrollContainer = trendingScrollRef.current;
    let scrollInterval: NodeJS.Timeout;
    let scrollDirection = 1; // 1 for forward, -1 for backward
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
        
        scrollPosition += scrollDirection * 0.5; // Adjust speed
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

  // Get bestseller services by main category
  const getBestsellerServicesByMainCategory = useCallback((mainCategory: string): Service[] => {
    const bestSellerPool = allServices.filter(service => service.isBestSeller === true);

    if (mainCategory === 'Bridal') {
      const bridalBestSellers = bestSellerPool.filter(service => 
        service.eventCategory && service.eventCategory.toLowerCase() === 'bridal'
      );
      
      return bridalBestSellers
        .sort((a, b) => (b.bookingCount || 0) - (a.bookingCount || 0))
        .slice(0, 10);
    }
    
    const categoryBestSellers = bestSellerPool.filter(service => {
      const primaryCategory = service.primaryCategory?.toLowerCase() || '';
      const category = service.category?.toLowerCase() || '';
      
      if (mainCategory === 'Makeup') {
        const makeupTerms = ['makeup', 'bridal', 'engagement', 'reception', 'party', 'occasional', 'package'];
        return primaryCategory === 'makeup' || 
               makeupTerms.some(term => category.includes(term)) ||
               makeupTerms.some(term => primaryCategory.includes(term));        
      }
      
      if (mainCategory === 'Nails') {
        const nailTerms = ['manicure', 'nail', 'pedicure', 'nails'];
        return primaryCategory === 'nails' || 
               nailTerms.some(term => category.includes(term)) ||
               nailTerms.some(term => primaryCategory.includes(term));
      }
      
      if (mainCategory === 'Hair') {
        const hairTerms = ['hair', 'spa', 'coloring', 'styling', 'treatment'];
        return primaryCategory === 'hair' || 
               hairTerms.some(term => category.includes(term)) ||
               hairTerms.some(term => primaryCategory.includes(term));
      }
      
      if (mainCategory === 'Skin') {
        const skinTerms = ['skin', 'facial', 'treatment', 'care', 'removal', 'body', 'bleach', 'face', 'hydrafacial', 'spa', 'tan', 'cleanup', 'wax'];
        return primaryCategory === 'skin' || 
               skinTerms.some(term => category.includes(term)) ||
               skinTerms.some(term => primaryCategory.includes(term));
      }
      
      return primaryCategory === mainCategory.toLowerCase();
    });
    
    return categoryBestSellers
      .sort((a, b) => (b.bookingCount || 0) - (a.bookingCount || 0))
      .slice(0, 10);
  }, [allServices]);

  // Get bestseller services for each main category
  const bestsellerCategories = MAIN_CATEGORIES.map(category => ({
    name: category,
    services: getBestsellerServicesByMainCategory(category),
    icon: getCategoryIcon(category)
  })).filter(category => category.services.length > 0);

  // Helper function to get icon for each main category
  function getCategoryIcon(category: string) {
    switch(category.toLowerCase()) {
      case 'bridal': return '👰';
      case 'makeup': return '💄';
      case 'skin': return '✨';
      case 'hair': return '💇‍♀️';
      case 'nails': return '💅';
      default: return '🌟';
    }
  }

  const getCategoryImage = useCallback((category: string) => {
    if (category === 'All') return '/images/all-services.jpg';
    const firstService = allServices.find(s => s.category === category);
    return firstService?.image || '/images/placeholder.jpg';
  }, [allServices]);

  // Category data with images and descriptions
  const HORIZONTAL_CATEGORIES = [
    {
      id: 'bridal',
      title: 'Bridal Makeup',
      description: 'Complete bridal packages for your special day',
      image: '/images/makeup/complete_bridal_package.webp',
      icon: '👰',
      color: 'from-pink-500 to-rose-600',
      link: '/makeup?category=bridal'
    },
    {
      id: 'makeup',
      title: 'Makeup Services',
      description: 'Perfect Makeup to glow on your day',
      image: '/images/makeup/bridal_HDLook.webp',
      icon: '✨',
      color: 'from-purple-500 to-pink-600',
      link: '/makeup'
    },
    {
      id: 'hair',
      title: 'Hair Treatments',
      description: 'Hair spa, coloring & styling',
      image: '/images/hair/smoothening.webp',
      icon: '💇‍♀️',
      color: 'from-amber-500 to-orange-600',
      link: '/hair'
    },
    {
      id: 'skin',
      title: 'Skin Care',
      description: 'Advanced skin treatments & facials',
      image: '/images/skin/hydrafacial.webp',
      icon: '💆‍♀️',
      color: 'from-blue-500 to-cyan-600',
      link: '/skin'
    },
    {
      id: 'nails',
      title: 'Nail Art',
      description: 'Manicure, pedicure & nail extensions',
      image: '/images/nails/bridal_luxury_nail.webp',
      icon: '💅',
      color: 'from-red-500 to-pink-600',
      link: '/nails'
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

  const navigateToCategory = useCallback((categoryLink: string) => {
    router.push(categoryLink);
  }, [router]);

  const navigateToBrowseCategory = useCallback((category: string) => {
    if (category === 'All') {
      router.push('/');
    } else {
      const categoryId = category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      router.push(`/${categoryId}`);
    }
  }, [router]);

  const scrollToServices = useCallback(() => {
    serviceScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
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
        
        {/* TRENDING SERVICES BANNER WITH HORIZONTAL SCROLLING */}
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
              Trending Beauty Services in Patna
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
                    Trending Services
                  </h3>
                  <p className={`
                    ${isLandscape ? 'text-[10px]' : 'text-xs'} 
                    text-gray-600
                  `}>
                    Most booked {trendingCount} services this week
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-white text-pink-600 text-xs font-bold px-3 py-1 rounded-full border border-pink-200">
                  {trendingCount} Trending
                </span>
                <button
                  onClick={() => router.push('/trending')}
                  className="hidden md:flex items-center text-pink-600 text-sm font-medium hover:underline"
                >
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
            
            {/* HORIZONTAL SCROLLING TRENDING SERVICES */}
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
              
              {/* View All Trending Button */}
              <div className={`
                ${isMobile ? 'flex-shrink-0' : 'flex-shrink-0'}
                ${isLandscape ? 'min-w-[140px]' : isMobile ? 'min-w-[160px]' : 'min-w-[180px]'}
                bg-gradient-to-br from-pink-100 to-purple-100 
                rounded-xl 
                ${isLandscape ? 'p-3' : isMobile ? 'p-4' : 'p-4'}
                border-2 
                border-dashed 
                border-pink-200 
                flex 
                flex-col 
                items-center 
                justify-center
                text-center
                cursor-pointer
                hover:from-pink-200 hover:to-purple-200
                hover:border-pink-300
                transition-all duration-300
                group
              `}
              onClick={() => router.push('/trending')}
              >
                <div className={`
                  ${isLandscape ? 'text-3xl' : isMobile ? 'text-4xl' : 'text-4xl'} 
                  mb-2
                  group-hover:scale-110 transition-transform duration-300
                `}>
                  🔥
                </div>
                <p className={`
                  font-bold 
                  ${isLandscape ? 'text-sm' : isMobile ? 'text-base' : 'text-base'}
                  text-gray-800
                `}>
                  View All
                </p>
                <p className={`
                  ${isLandscape ? 'text-[10px]' : 'text-xs'} 
                  text-gray-600 
                  mt-1
                `}>
                  {trendingCount}+ services
                </p>
                <ArrowRight className={`
                  ${isLandscape ? 'w-5 h-5' : 'w-5 h-5'} 
                  text-pink-600 
                  mt-2
                  group-hover:translate-x-1 transition-transform duration-300
                `} />
              </div>
            </div>
            
            {/* VISIT US & CALL US SECTION */}
            <div className={`
              grid 
              ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} 
              ${isMobile ? (isLandscape ? 'gap-2' : 'gap-3') : 'gap-3'} 
              ${isLandscape ? 'mt-2' : 'mt-4'}
            `}>
              {/* Visit Us Card */}
              <div className={`
                bg-white 
                rounded-xl 
                ${isMobile ? (isLandscape ? 'p-2' : 'p-3') : 'p-3'}
                flex 
                items-center 
                justify-between 
                border 
                border-pink-100 
                shadow-sm
                hover:shadow-md
                transition-all 
                duration-300
              `}>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className={`
                    ${isMobile ? (isLandscape ? 'w-6 h-6' : 'w-8 h-8') : 'w-8 h-8'} 
                    bg-pink-100 
                    rounded-full 
                    flex 
                    items-center 
                    justify-center 
                    flex-shrink-0
                  `}>
                    <MapPin className={`
                      ${isMobile ? (isLandscape ? 'w-3 h-3' : 'w-4 h-4') : 'w-4 h-4'} 
                      text-pink-600
                    `} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`
                      font-medium 
                      text-gray-700
                      ${isMobile ? (isLandscape ? 'text-xs' : 'text-sm') : 'text-sm'}
                      truncate
                    `}>
                      Visit Us
                    </p>
                    <p className={`
                      font-medium 
                      text-gray-700 
                      ${isMobile ? (isLandscape ? 'text-[10px]' : 'text-xs') : 'text-xs'}
                      truncate
                    `}>
                      Near Bhootnath Metro Station, Patna
                    </p>
                  </div>
                </div>
                <a
                  href="https://maps.google.com/?q=Kritika+Ladies+Beauty+Parlour+Patna"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`
                    text-pink-600 
                    font-medium 
                    ${isMobile ? (isLandscape ? 'text-xs' : 'text-sm') : 'text-sm'}
                    hover:underline
                    whitespace-nowrap
                    ml-2
                  `}
                >
                  {isMobile && !isLandscape ? '→' : 'Get Directions →'}
                </a>
              </div>

              {/* Call Us Card */}
              <div className={`
                bg-white 
                rounded-xl 
                ${isMobile ? (isLandscape ? 'p-2' : 'p-3') : 'p-3'}
                flex 
                items-center 
                justify-between 
                border 
                border-pink-100 
                shadow-sm
                hover:shadow-md
                transition-all 
                duration-300
              `}>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className={`
                    ${isMobile ? (isLandscape ? 'w-6 h-6' : 'w-8 h-8') : 'w-8 h-8'} 
                    bg-pink-100 
                    rounded-full 
                    flex 
                    items-center 
                    justify-center 
                    flex-shrink-0
                  `}>
                    <Phone className={`
                      ${isMobile ? (isLandscape ? 'w-3 h-3' : 'w-4 h-4') : 'w-4 h-4'} 
                      text-pink-600
                    `} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`
                      font-medium 
                      text-gray-700
                      ${isMobile ? (isLandscape ? 'text-xs' : 'text-sm') : 'text-sm'}
                      truncate
                    `}>
                      Call Us
                    </p>
                    <a
                      href="tel:+919650461390"
                      className={`
                        text-gray-500 
                        ${isMobile ? (isLandscape ? 'text-[10px]' : 'text-xs') : 'text-xs'}
                        truncate
                        block
                        hover:text-pink-600
                        transition-colors
                        duration-200
                      `}
                    >
                      +91-9650461390
                    </a>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p className={`
                    text-gray-500 
                    ${isMobile ? (isLandscape ? 'text-[10px]' : 'text-xs') : 'text-xs'}
                    whitespace-nowrap
                  `}>
                    {isMobile && !isLandscape ? '9-8' : '9AM-8PM'}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] text-green-600 font-medium">Open Now</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Horizontal Categories with Know More */}
        <section className="mb-8" aria-label="Main beauty service categories">
          <h2 className="sr-only">
            Beauty Service Categories
          </h2>
          
          <div className={`
            ${isMobile ? 'grid grid-cols-1 gap-3' : 'flex flex-wrap justify-center gap-3'}
          `}>
            {HORIZONTAL_CATEGORIES.map((category) => (
              <div
                key={category.id}
                className={`
                  ${isMobile ? '' : 'flex-1 min-w-[320px] max-w-[240px]'}
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
                    onClick={() => navigateToCategory(category.link)}
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
                    aria-label={`Explore ${category.title} services`}
                  >
                    <span>Know More</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bestseller Categories */}
        {bestsellerCategories.map((categoryData, categoryIndex) => (
          <section key={categoryData.name} className="mb-8" aria-label={`Bestseller ${categoryData.name} Services`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`
                ${isLandscape ? 'text-lg' : 'text-xl'} 
                font-bold 
                text-gray-800 
                mb-4 
                flex 
                items-center
              `}>
                <span className="mr-2 text-2xl">{categoryData.icon}</span>
                {categoryData.name === 'Bridal' ? 'Bestsellers Bridal Services' : `Top ${categoryData.name} Services`}
              </h2>

              {categoryData.name === 'Bridal' && (
                <div className="flex items-center text-pink-600">
                  <Heart className="w-16 h-16 mr-1" />
                  <span className="text-sm font-medium">Perfect for Weddings</span>
                </div>
              )}
            </div>
            
            {/* Special styling for Bridal category */}
            {categoryData.name === 'Bridal' && (
              <div className="mb-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-200">
                <p className="text-sm text-gray-700">
                  ✨ Complete bridal packages including makeup, hair, skin treatments, and nail services for your special day.
                </p>
              </div>
            )}
            
            <div className={`
              ${isMobile ? 'flex overflow-x-auto space-x-4 pb-4 scrollbar-hide' : 'grid grid-cols-2 lg:grid-cols-4 gap-4'}
            `}>
              {categoryData.services.map((service) => (
                <article 
                  key={service.id}
                  className={`
                    ${isMobile ? 'min-w-[280px]' : ''}
                    ${isLandscape ? 'h-full' : ''}
                    ${categoryData.name === 'Bridal' ? 'border-2 border-pink-200 rounded-xl overflow-hidden' : ''}
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
            
            {categoryData.services.length === 0 && (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <p className="text-gray-500">No bestseller services found in {categoryData.name} category</p>
              </div>
            )}

            {/* Special call-to-action for Bridal */}
            {categoryData.name === 'Bridal' && categoryData.services.length > 0 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => navigateToCategory('/makeup?category=bridal')}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  View All Bridal Services
                </button>
              </div>
            )}
          </section>
        ))}

        {/* Interactive Tools */}
        <section className="mb-8" aria-label="Beauty consultation tools">
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
              aria-label="Take our beauty profile quiz"
            >
              <div className="text-3xl mb-2">💫</div>
              <h3 className={`
                ${isLandscape ? 'text-sm' : 'text-base'} 
                font-bold 
                text-purple-800
              `}>
                Beauty Profile Quiz
              </h3>
              <p className={`
                text-gray-600 
                ${isLandscape ? 'text-xs' : 'text-xs mt-1'}
              `}>
                Find perfect services tailored for you!
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
              aria-label="Get AI skin analysis"
            >
              <div className="text-3xl mb-2">✨</div>
              <h3 className={`
                ${isLandscape ? 'text-sm' : 'text-base'} 
                font-bold 
                text-purple-800
              `}>
                AI Skin Analysis
              </h3>
              <p className={`
                text-gray-600 
                ${isLandscape ? 'text-xs' : 'text-xs mt-1'}
              `}>
                Get personalized skin care advice.
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

        {/* Why Choose Us Banner */}
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
            Why Choose Kritika Ladies Beauty Parlour?
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
                Services
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
                ⭐ <span itemProp="reviewCount">5000+</span> Reviews
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
                5000+
              </div>
              <div className={`
                ${isLandscape ? 'text-[10px]' : 'text-xs'} 
                text-gray-600
              `}>
                Happy Clients
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

        {/* Testimonials */}
        <section className="mb-6" aria-label="Customer testimonials">
          <h2 className={`
            ${isLandscape ? 'text-lg' : 'text-xl'} 
            font-bold 
            text-gray-800 
            mb-4 
            text-center
          `}>
            Glow-ups & Stories
          </h2>
          <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide">
            <TestimonialCard 
              name="Priya S." 
              text="My skin has never looked better! The diamond facial is pure magic. Feeling so confident!" 
              image="/images/skin/hydrafacial.webp" 
            />
            <TestimonialCard 
              name="Ananya R." 
              text="The bridal makeup team made me feel like an absolute princess on my big day! Flawless work." 
              image="/images/makeup/bridal_makeup.webp" 
            />
            <TestimonialCard 
              name="Maya T." 
              text="Best hair spa in town. My damaged hair is now silky smooth and full of life. Highly recommend!" 
              image="/images/hair/hair_spa.webp" 
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
            SPECIAL OFFER
          </div>
          <h3 className={`
            ${isLandscape ? 'text-base' : 'text-lg'} 
            font-bold 
            text-gray-800
          `}>
            30% OFF On All Bridal Packages
          </h3>
          <p className={`
            text-gray-600 
            ${isLandscape ? 'text-xs' : 'text-sm mt-1'}
          `}>
            Book your trial now and save big!
          </p>
        </section>
      </main>

      {/* Modals & Components */}
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

export default ClientHomePage;