// app/skin/ClientSkinPage.tsx
"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowRight, Star, Clock, TrendingUp, Heart } from 'lucide-react';
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

interface ClientSkinPageProps {
  allServices: Service[];
  trendingServices: Service[];
}

const ClientSkinPage = ({ allServices, trendingServices }: ClientSkinPageProps) => {
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
  const prefersReducedMotion = useRef(false);
  const { isLoggedIn } = useAuth();
  const { addToCart } = useBooking();

  const trendingCount = trendingServices?.length || 0;
  const hasTrendingServices = trendingCount > 0;

  // Get unique categories
  const serviceCategories = [
    'All',
    ...Array.from(new Set(allServices.map(service => service.category || '').filter(Boolean)))
  ];

  // Viewport detection
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    const updateViewport = () => {
      const isMob = window.innerWidth < 768;
      setIsMobile(isMob);
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    const handleResize = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => updateViewport(), 150);
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

  // Reduced motion listener
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { prefersReducedMotion.current = media.matches; };
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  // rAF auto-scroll for trending (desktop only)
  useEffect(() => {
    const el = trendingScrollRef.current;
    if (!el || isMobile || trendingCount < 3 || prefersReducedMotion.current) return;
    let rafId: number;
    let direction = 1;
    let position = el.scrollLeft;
    let isPaused = false;
    let lastTs = 0;
    const SPEED = 40;
    const tick = (ts: number) => {
      const delta = lastTs ? Math.min(ts - lastTs, 64) : 0;
      lastTs = ts;
      if (!isPaused) {
        const max = el.scrollWidth - el.clientWidth;
        if (position >= max - 10) direction = -1;
        else if (position <= 10) direction = 1;
        position += direction * (SPEED * delta / 1000);
        el.scrollLeft = position;
      }
      rafId = requestAnimationFrame(tick);
    };
    const onEnter = () => { isPaused = true; };
    const onLeave = () => { isPaused = false; };
    rafId = requestAnimationFrame(tick);
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      cancelAnimationFrame(rafId);
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [trendingCount, isMobile]);

  // Filter services by selected category
  const getFilteredServices = useCallback(() => {
    if (selectedCategory === 'All') return allServices;
    return allServices.filter(service => service.category === selectedCategory);
  }, [selectedCategory, allServices]);

  const filteredServices = getFilteredServices();

  // Helper: canonical service URL
  const getServiceUrl = useCallback((service: Service): string => {
    if (service.url) return service.url;
    const category = (service.primaryCategory || service.category || 'skin').toLowerCase();
    const slug = service.slug || service.id;
    return `/${category}/${slug}`;
  }, []);

  // Skin subcategories
  const SKIN_SUBCATEGORIES = [
    {
      id: 'hair-removal-services',
      title: 'Hair Removal Services',
      description: 'Hair removal (waxing & threading)',
      image: '/images/skin/arm_leg_wax.webp',
      color: 'from-amber-500 to-orange-600',
      targetCategory: 'Hair Removal Services'
    },
    {
      id: 'facial-spa',
      title: 'Facial Spa',
      description: 'Hydrafacial, diamond facial & more',
      image: '/images/skin/hydrafacial.webp',
      color: 'from-green-500 to-emerald-600',
      targetCategory: 'Facial Spa'
    },
    {
      id: 'skin-care-clinic',
      title: 'Skin Care Clinic',
      description: 'Acne, anti-aging & skin concerns',
      image: '/images/skin/acne_cleanup.webp',
      color: 'from-purple-500 to-pink-600',
      targetCategory: 'Skin Care Clinic'
    },    
    {
      id: 'body-care-wellness',
      title: 'Body Care & Wellness',
      description: 'Body polish, wraps & wellness treatments',
      image: '/images/skin/kesar_body_polish.webp',
      color: 'from-teal-500 to-cyan-600',
      targetCategory: 'Body Care & Wellness'
    },    
    {
      id: 'eye-brow-lip-care',
      title: 'Eye_brow & Lip Care',
      description: 'Glow treatments for radiant skin',
      image: '/images/skin/eyelash_extensions.webp',
      color: 'from-rose-500 to-pink-600',
      targetCategory: 'Eye_brow & Lip Care'
    }    
  ];

  const toggleFavorite = useCallback((serviceId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(serviceId)) newFavorites.delete(serviceId);
      else newFavorites.add(serviceId);
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
      bg-gradient-to-br from-green-50 via-white to-pink-50 
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

        {/* ========== TRENDING SKIN SERVICES — FULL IMAGE CARD SCROLLER (matches Hair page) ========== */}
        {hasTrendingServices && (
          <section className="bg-gradient-to-r from-green-50 via-pink-50 to-emerald-50 rounded-2xl p-4 mb-6 border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-full w-10 h-10 flex items-center justify-center animate-pulse">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className={`font-bold text-gray-900 ${isLandscape ? 'text-base' : 'text-lg'}`}>
                    Trending Skin Services
                  </h2>
                  <p className="text-xs text-gray-600">Most booked {trendingCount} services this week</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-white text-green-600 text-xs font-bold px-3 py-1 rounded-full border border-green-200">
                  {trendingCount} Trending
                </span>
                <button
                  onClick={() => router.push('/skin#all')}
                  className="hidden md:flex items-center text-green-600 text-sm font-medium hover:underline"
                >
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>

            {/* Horizontal image card scroll */}
            <div
              ref={trendingScrollRef}
              className={`flex pb-3 mb-2 ${isMobile ? 'overflow-x-auto space-x-4 scrollbar-hide' : 'overflow-hidden space-x-4'}`}
              style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none', overscrollBehaviorX: 'contain' } as React.CSSProperties}
            >
              {trendingServices.map((service, idx) => (
                <Link
                  key={service.id}
                  href={getServiceUrl(service)}
                  className={`flex-shrink-0 bg-white rounded-xl border border-green-100 shadow-sm hover:shadow-md transition-shadow duration-200 group transform-gpu will-change-transform ${
                    isMobile ? 'min-w-[200px] max-w-[200px] p-3' : 'min-w-[220px] max-w-[220px] p-3 hover:scale-[1.02]'
                  }`}
                >
                  <div className="relative aspect-[4/5] w-full rounded-lg overflow-hidden mb-2">
                    <Image
                      src={service.image || '/images/placeholder.jpg'}
                      alt={service.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 200px, 220px"
                      priority={idx === 0}
                    />
                    {service.isBestSeller && (
                      <span className="absolute top-2 left-2 z-10 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
                        <Star className="w-3 h-3 fill-white" /> Best
                      </span>
                    )}
                    <span className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {service.rating?.toFixed(1) || '4.5'}
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-1 group-hover:text-green-600 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 text-xs line-clamp-2 mb-2">
                      {service.shortDescription || service.description?.substring(0, 60)}…
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex flex-col">
                        <span className="font-bold text-green-600 text-base">₹{service.price}</span>
                        {service.originalPrice && service.originalPrice > service.price && (
                          <span className="text-gray-400 text-xs line-through">₹{service.originalPrice}</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {service.durationText || `${service.duration || 60} min`}
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.preventDefault(); addToCart(service); }}
                      className="w-full mt-2 py-2 text-sm bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-600 transition-colors duration-150 shadow-sm flex items-center justify-center gap-1"
                    >
                      Add to Cart <Heart className="w-4 h-4" />
                    </button>
                  </div>
                </Link>
              ))}

              {/* View All card */}
              <div
                className={`flex-shrink-0 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl border-2 border-dashed border-green-200 flex flex-col items-center justify-center text-center cursor-pointer hover:from-green-200 hover:to-emerald-200 transition-colors duration-200 group transform-gpu ${
                  isMobile ? 'min-w-[160px] p-4' : 'min-w-[180px] p-4'
                }`}
                onClick={() => router.push('/skin#all')}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && router.push('/skin#all')}
              >
                <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">✨</span>
                <p className="font-bold text-gray-800 text-base">View All</p>
                <p className="text-xs text-gray-600 mt-1">{trendingCount}+ services</p>
                <ArrowRight className="w-5 h-5 text-green-600 mt-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </section>
        )}

        {/* Skin Subcategories */}
        <section className="mb-8" aria-label="Skin service categories">
          <h2 className={`${isLandscape ? 'text-lg' : 'text-xl'} font-bold text-gray-800 mb-4 text-center`}>
            💆‍♀️ Skin Categories
          </h2>
          <div className={`${isMobile ? 'grid grid-cols-2 gap-3' : 'flex flex-wrap justify-center gap-3'}`}>
            {SKIN_SUBCATEGORIES.map((category) => (
              <div
                key={category.id}
                className={`${isMobile ? '' : 'flex-1 min-w-[240px] max-w-[280px]'} bg-gradient-to-br ${category.color} rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${isLandscape ? 'h-full' : ''}`}
              >
                <div className="p-5 text-white">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className={`font-bold ${isLandscape ? 'text-lg' : 'text-xl'}`}>{category.title}</h3>
                      <p className="text-white/80 text-sm mt-1">{category.description}</p>
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
                    onClick={() => navigateToCategory(category.targetCategory)}
                    className={`w-full bg-white text-gray-800 font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 active:bg-gray-100 transition-colors duration-200 ${isLandscape ? 'py-2 text-sm' : ''}`}
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
        <section className="mb-6" aria-label="Filter skin services by category">
          <div className={`${isMobile ? 'flex overflow-x-auto space-x-2 pb-2' : 'flex flex-wrap justify-center gap-2'}`}>
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
                    px-4 py-2 rounded-full font-medium transition-all duration-200
                    ${selectedCategory === category
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-green-100'
                    }
                    ${isLandscape ? 'text-xs px-3 py-1.5' : isMobile ? 'text-sm' : 'text-sm'}
                  `}
                  aria-label={`Show ${category} skin services - ${categoryServices.length} available`}
                  aria-pressed={selectedCategory === category}
                >
                  {category} ({categoryServices.length})
                </button>
              );
            })}
          </div>
        </section>

        {/* Services Grid */}
        <section ref={serviceScrollRef} id="all" aria-label={`${selectedCategory} skin services`}>
          <div className={`grid gap-4 grid-cols-2 ${!isMobile ? 'lg:grid-cols-3 xl:grid-cols-4' : ''}`}>
            {filteredServices.map((service) => (
              <article key={service.id} className={`${isLandscape ? 'h-full' : ''}`} itemScope itemType="https://schema.org/Service">
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
        <section className="mb-8" aria-label="Skin consultation tools">
          <h2 className={`${isLandscape ? 'text-lg' : 'text-xl'} font-bold text-gray-800 mb-4 text-center`}>
            💫 Discover Your Perfect Skin Care
          </h2>
          <div className={`grid ${isLandscape ? 'grid-cols-2 gap-2' : 'grid-cols-2 gap-3'}`}>
            <button
              onClick={() => setShowBeautyQuiz(true)}
              className="bg-gradient-to-br from-green-50 to-emerald-100 p-4 rounded-xl hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center border-2 border-green-200 touch-target ${isLandscape ? 'p-3' : ''}"
              aria-label="Take our skin care quiz"
            >
              <div className="text-3xl mb-2">💆‍♀️</div>
              <h3 className={`${isLandscape ? 'text-sm' : 'text-base'} font-bold text-emerald-800`}>Skin Care Quiz</h3>
              <p className={`text-gray-600 ${isLandscape ? 'text-xs' : 'text-xs mt-1'}`}>Find perfect skin treatments tailored for you!</p>
              <span className={`mt-3 bg-white text-green-600 font-semibold py-1.5 px-3 rounded-full ${isLandscape ? 'text-xs' : 'text-xs'} border border-green-300`}>Start Quiz</span>
            </button>
            <button
              onClick={() => setShowSkinAnalysis(true)}
              className="bg-gradient-to-br from-emerald-50 to-green-100 p-4 rounded-xl hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center border-2 border-emerald-200 touch-target ${isLandscape ? 'p-3' : ''}"
              aria-label="Analyze your skin"
            >
              <div className="text-3xl mb-2">🔍</div>
              <h3 className={`${isLandscape ? 'text-sm' : 'text-base'} font-bold text-emerald-800`}>Skin Analysis</h3>
              <p className={`text-gray-600 ${isLandscape ? 'text-xs' : 'text-xs mt-1'}`}>Get personalized skin care advice.</p>
              <span className={`mt-3 bg-white text-emerald-600 font-semibold py-1.5 px-3 rounded-full ${isLandscape ? 'text-xs' : 'text-xs'} border border-emerald-300`}>Analyze Skin</span>
            </button>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-gradient-to-r from-green-50 via-pink-50 to-emerald-50 rounded-2xl p-6 mb-6 border border-green-200">
          <h2 className={`${isLandscape ? 'text-lg' : 'text-xl'} font-bold text-gray-800 mb-6 text-center`}>
            Why Clients Choose Kritika Salon ✨
          </h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center">
              <div className={`${isLandscape ? 'text-2xl' : 'text-3xl'} mb-1`}>💆‍♀️</div>
              <div className={`${isLandscape ? 'text-xl' : 'text-2xl'} font-bold text-gray-900`}>{allServices.length}+</div>
              <div className={`${isLandscape ? 'text-[10px]' : 'text-xs'} text-gray-500`}>Skin Services</div>
            </div>
            <div className="flex flex-col items-center" itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
              <div className={`${isLandscape ? 'text-2xl' : 'text-3xl'} mb-1`}>⭐</div>
              <div className={`${isLandscape ? 'text-xl' : 'text-2xl'} font-bold text-gray-900`}>
                <span itemProp="ratingValue">4.8</span>
              </div>
              <div className={`${isLandscape ? 'text-[10px]' : 'text-xs'} text-gray-500`}>
                <span itemProp="reviewCount">1800+</span> Reviews
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className={`${isLandscape ? 'text-2xl' : 'text-3xl'} mb-1`}>👤</div>
              <div className={`${isLandscape ? 'text-xl' : 'text-2xl'} font-bold text-gray-900`}>1800+</div>
              <div className={`${isLandscape ? 'text-[10px]' : 'text-xs'} text-gray-500`}>Happy Clients</div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <div className={`inline-flex items-center gap-2 bg-white text-green-600 font-bold ${isLandscape ? 'text-xs px-3 py-1.5' : 'text-sm px-4 py-2'} rounded-full border border-green-200 shadow-sm`}>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Open Now</span>
              <span className="text-gray-600 font-normal">9:00 AM - 8:00 PM</span>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-6" aria-label="Customer testimonials">
          <h2 className={`${isLandscape ? 'text-lg' : 'text-xl'} font-bold text-gray-800 mb-4 text-center`}>
            Skin Transformations
          </h2>
          <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide">
            <TestimonialCard
              name="Priya S."
              text="My skin has never looked better! The diamond facial is pure magic. Feeling so confident!"
              image="/images/skin/hydrafacial.webp"
            />
            <TestimonialCard
              name="Ananya R."
              text="The laser hair removal treatment made me feel like an absolute diva! Flawless work."
              image="/images/skin/laser_hair_removal.webp"
            />
            <TestimonialCard
              name="Maya T."
              text="Best skin treatment in town. My damaged skin is now glowing and full of life. Highly recommend!"
              image="/images/skin/diamond_facial.webp"
            />
          </div>
        </section>

        {/* Promotional Banner */}
        <section className="bg-gradient-to-r from-green-100 via-pink-100 to-emerald-100 rounded-2xl p-6 text-center border border-green-200 mb-6">
          <div className={`inline-flex items-center gap-1.5 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-3`}>
            <span>✨</span> FLASH SALE
          </div>
          <h3 className={`${isLandscape ? 'text-base' : 'text-lg'} font-bold text-gray-800 mb-1`}>
            35% OFF on All Diamond Facials
          </h3>
          <p className={`text-gray-500 ${isLandscape ? 'text-xs' : 'text-sm'} mb-4`}>
            Transform, rejuvenate, and save! ✨
          </p>
          <button
            onClick={() => {
              const el = document.getElementById('all');
              el?.scrollIntoView({ behavior: 'smooth' });
              setSelectedCategory('Facial Treatments');
            }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-sm hover:shadow-md hover:from-green-600 hover:to-emerald-600 transition-all"
          >
            Explore Facial Treatments <ArrowRight className="w-4 h-4" />
          </button>
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

export default ClientSkinPage;