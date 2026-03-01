// kritika/src/app/makeup/ClientMakeupPage.tsx - UPDATED TO MATCH HOME PAGE PATTERNS
"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { ArrowRight, Star } from 'lucide-react';
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

  // Auto-scroll removed — replaced with lightweight pill scroller (no JS scroll needed)

  // Filter services by selected category
  const getFilteredServices = useCallback(() => {
    if (selectedCategory === 'All') return allServices;
    return allServices.filter(service => service.category === selectedCategory);
  }, [selectedCategory, allServices]);

  const filteredServices = getFilteredServices();

  // Makeup subcategories for horizontal display
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
    id: 'reception',
    title: 'Reception Makeup',
    description: 'Glamorous reception styles',
    image: '/images/makeup/reception_airbrush.webp',
    icon: '✨',
    color: 'from-amber-500 to-red-600'
    },
    {
      id: 'camera-ready',
      title: 'Camera Ready Makeup',
      description: 'Camera-ready makeup',
      image: '/images/makeup/hd_makeup.webp',
      icon: '📸',
      color: 'from-blue-500 to-cyan-600'
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
    id: 'bridal-packages',
    title: 'Bridal Packages',
    description: 'Exclusive bridal package deals',
    image: '/images/makeup/classic_bridal.webp',
    icon: '💎',
    color: 'from-rose-500 to-pink-600'
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
        
        {/* ✅ TRENDING MAKEUP SERVICES — Lightweight Pill Scroller (matches homepage) */}
        {hasTrendingServices && (
          <section className={`
            bg-gradient-to-r from-rose-50 via-pink-50 to-fuchsia-50
            rounded-2xl 
            px-4 py-3
            mb-6 
            border 
            border-pink-200
            w-full
          `}>
            <h2 className="sr-only">Trending Makeup Services in Patna</h2>

            {/* Header row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-base">🔥</span>
                <span className={`font-bold text-gray-900 ${isLandscape ? 'text-sm' : 'text-base'}`}>
                  Trending Makeup
                </span>
                <span className="bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {trendingCount}
                </span>
              </div>
              <button
                onClick={() => router.push('/makeup#all')}
                className="flex items-center text-pink-600 text-xs font-semibold hover:underline gap-1"
              >
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Pill chip scroller — zero image weight, instant render */}
            <div
              ref={trendingScrollRef}
              className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {trendingServices.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceClick(service)}
                  className={`
                    flex-shrink-0 flex items-center gap-2
                    bg-white border border-pink-200
                    hover:border-pink-400 hover:bg-pink-50
                    active:scale-95
                    rounded-full
                    ${isLandscape ? 'px-3 py-1.5' : 'px-4 py-2'}
                    shadow-sm hover:shadow-md
                    transition-all duration-200
                    group
                  `}
                  aria-label={`View ${service.title} — ₹${service.price}`}
                >
                  <span className="text-xs">💄</span>
                  <span className={`font-semibold text-gray-800 group-hover:text-pink-700 whitespace-nowrap ${isLandscape ? 'text-xs' : 'text-sm'}`}>
                    {service.title}
                  </span>
                  <span className={`text-pink-600 font-bold whitespace-nowrap ${isLandscape ? 'text-xs' : 'text-sm'}`}>
                    ₹{service.price}
                  </span>
                  {service.isBestSeller && (
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                  )}
                </button>
              ))}
              {/* View all pill */}
              <button
                onClick={() => router.push('/makeup#all')}
                className={`
                  flex-shrink-0 flex items-center gap-1
                  bg-gradient-to-r from-pink-500 to-rose-500 text-white
                  rounded-full font-semibold shadow-sm
                  hover:from-pink-600 hover:to-rose-600 hover:shadow-md
                  transition-all duration-200
                  ${isLandscape ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}
                `}
              >
                All {trendingCount}+ <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </section>
        )}

        {/* Makeup Subcategories */}
        <section className="mb-8" aria-label="Makeup service categories">
          <h2 className={`
            ${isLandscape ? 'text-lg' : 'text-xl'} 
            font-bold text-gray-800 mb-4 text-center
          `}>
            💄 Makeup Categories
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
        <section ref={serviceScrollRef} id="all" aria-label={`${selectedCategory} makeup services`}>
          <div className={`
            grid gap-4
            grid-cols-2
            ${!isMobile ? 'lg:grid-cols-3 xl:grid-cols-4' : ''}
          `}>
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

        {/* Interactive Tools */}
        <section className="mb-8" aria-label="Makeup consultation tools">
          <h2 className={`
            ${isLandscape ? 'text-lg' : 'text-xl'} 
            font-bold text-gray-800 mb-4 text-center
          `}>
            💫 Discover Your Perfect Look
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

        {/* Why Choose Us — emotion-first, soft feminine style */}
        <section className="bg-gradient-to-r from-rose-50 via-pink-50 to-fuchsia-50 rounded-2xl p-6 mb-6 border border-pink-200">
          <h2 className={`${isLandscape ? 'text-lg' : 'text-xl'} font-bold text-gray-800 mb-6 text-center`}>
            Why Brides Choose Kritika Salon ✨
          </h2>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center">
              <div className={`${isLandscape ? 'text-2xl' : 'text-3xl'} mb-1`}>💄</div>
              <div className={`${isLandscape ? 'text-xl' : 'text-2xl'} font-bold text-gray-900`}>
                {allServices.length}+
              </div>
              <div className={`${isLandscape ? 'text-[10px]' : 'text-xs'} text-gray-500`}>
                Makeup Services
              </div>
            </div>
            <div className="flex flex-col items-center" itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
              <div className={`${isLandscape ? 'text-2xl' : 'text-3xl'} mb-1`}>⭐</div>
              <div className={`${isLandscape ? 'text-xl' : 'text-2xl'} font-bold text-gray-900`}>
                <span itemProp="ratingValue">4.8</span>
              </div>
              <div className={`${isLandscape ? 'text-[10px]' : 'text-xs'} text-gray-500`}>
                <span itemProp="reviewCount">1000+</span> Reviews
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className={`${isLandscape ? 'text-2xl' : 'text-3xl'} mb-1`}>👰</div>
              <div className={`${isLandscape ? 'text-xl' : 'text-2xl'} font-bold text-gray-900`}>1000+</div>
              <div className={`${isLandscape ? 'text-[10px]' : 'text-xs'} text-gray-500`}>Happy Brides</div>
            </div>
          </div>
          
          {/* Open Now Badge */}
          <div className="mt-6 text-center">
            <div className={`
              inline-flex items-center gap-2
              bg-white text-green-600 font-bold
              ${isLandscape ? 'text-xs px-3 py-1.5' : 'text-sm px-4 py-2'}
              rounded-full border border-green-200 shadow-sm
            `}>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Open Now</span>
              <span className="text-gray-600 font-normal">9:00 AM - 8:00 PM</span>
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

        {/* Promotional Banner — soft luxury style matching homepage */}
        <section className="
          bg-gradient-to-r from-rose-50 via-pink-50 to-fuchsia-50
          rounded-2xl p-6 text-center
          border border-pink-200
          mb-6
        ">
          <div className={`
            inline-flex items-center gap-1.5
            bg-rose-500 text-white
            text-xs font-bold px-3 py-1.5
            rounded-full mb-3
          `}>
            <span>✨</span>
            <span>BRIDAL SEASON SPECIAL</span>
          </div>
          <h3 className={`${isLandscape ? 'text-base' : 'text-lg'} font-bold text-gray-800 mb-1`}>
            20% OFF on All Bridal Makeup Packages
          </h3>
          <p className={`text-gray-500 ${isLandscape ? 'text-xs' : 'text-sm'} mb-4`}>
            Book your trial session and lock in the savings ✨
          </p>
          <button
            onClick={() => {
              const el = document.getElementById('all');
              el?.scrollIntoView({ behavior: 'smooth' });
              setSelectedCategory('Bridal');
            }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-sm hover:shadow-md hover:from-rose-600 hover:to-pink-600 transition-all"
          >
            Explore Bridal Packages <ArrowRight className="w-4 h-4" />
          </button>
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