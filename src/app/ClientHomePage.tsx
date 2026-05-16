// src/app/ClientHomePage.tsx - CLEANED (no floating components)
"use client";

import { useState, useRef, useEffect, useMemo, useDeferredValue, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  MapPin, Sparkles, Zap, Phone, Clock, Award,
  TrendingUp, Users, Heart, ArrowRight, Star, Gift,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Service } from '../types/service';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import ServiceSkeleton from '../components/ServiceSkeleton';

// ─── Dynamic imports (only modals and TestimonialCard remain) ─────────────────
const BeautyQuiz      = dynamic(() => import('../components/BeautyQuiz'),      { ssr: false });
const SkinAnalysis    = dynamic(() => import('../components/SkinAnalysis'),    { ssr: false });
const LoginModal      = dynamic(() => import('../components/LoginModal'),      { ssr: false });
const BookingFlow     = dynamic(() => import('../components/BookingFlow'),     { ssr: false });
const TestimonialCard = dynamic(() => import('../components/TestimonialCard'), { ssr: false });

// ServiceCard is now server‑rendered
import ServiceCard from '../components/ServiceCard';

// ─── Constants (unchanged) ────────────────────────────────────────────────────
const MAIN_CATEGORIES = ['Bridal', 'Makeup', 'Skin', 'Hair', 'Nails'] as const;

function getCategoryIcon(category: string): string {
  switch (category.toLowerCase()) {
    case 'bridal': return '👰';
    case 'makeup': return '💄';
    case 'skin':   return '✨';
    case 'hair':   return '💇‍♀️';
    case 'nails':  return '💅';
    default:       return '🌟';
  }
}

const HORIZONTAL_CATEGORIES = [
  { id: 'combo',  title: 'Combo Packages',   description: 'Complete combo packages',   image: '/images/combos/pre-wedding-photoshoot-makeup-hair.webp', color: 'from-pink-500 to-rose-600',   link: '/combo'                 },
  { id: 'bridal', title: 'Bridal Makeup',    description: 'Complete bridal packages',  image: '/images/makeup/complete_bridal_package.webp',           color: 'from-pink-500 to-rose-600',   link: '/makeup?category=bridal' },
  { id: 'makeup', title: 'Makeup Services',  description: 'Perfect makeup to glow',    image: '/images/makeup/bridal_HDLook.webp',                     color: 'from-purple-500 to-pink-600', link: '/makeup'                },
  { id: 'hair',   title: 'Hair Treatments',  description: 'Hair spa, coloring',       image: '/images/hair/smoothening.webp',                         color: 'from-amber-500 to-orange-600',link: '/hair'                  },
  { id: 'skin',   title: 'Skin Care',        description: 'Advanced facials',         image: '/images/skin/hydrafacial.webp',                         color: 'from-blue-500 to-cyan-600',   link: '/skin'                  },
  { id: 'nails',  title: 'Nail Art',         description: 'Manicure & extensions',    image: '/images/nails/bridal_luxury_nail.webp',                 color: 'from-red-500 to-pink-600',    link: '/nails'                 },
] as const;

const SCROLL_STYLE: React.CSSProperties = {
  WebkitOverflowScrolling: 'touch',
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  overscrollBehaviorX: 'contain',
};

function getServiceUrl(service: Service): string {
  if (service.url) return service.url;
  const category = (service.primaryCategory || service.category || 'service').toLowerCase();
  const slug = service.slug || service.id;
  return `/${category}/${slug}`;
}

interface ClientHomePageProps {
  allServices:      Service[];
  trendingServices: Service[];
}

export default function ClientHomePage({ allServices, trendingServices }: ClientHomePageProps) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { addToCart } = useBooking();

  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showBeautyQuiz, setShowBeautyQuiz] = useState(false);
  const [showSkinAnalysis, setShowSkinAnalysis] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [bookingStep, setBookingStep] = useState<'browsing' | 'booking'>('browsing');
  const [isMobile, setIsMobile] = useState(false);
  const [visibleCount, setVisibleCount] = useState<Record<string, number>>({ combo: 4 });

  const trendingScrollRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useRef(false);
  const deferredFavorites = useDeferredValue(favorites);
  const trendingCount = trendingServices.length;
  const hasTrendingServices = trendingCount > 0;

  const comboServices = useMemo(
    () => allServices.filter(s => {
      const cat = (s.category ?? '').toLowerCase();
      const pri = (s.primaryCategory ?? '').toLowerCase();
      return cat.includes('combo') || pri === 'combo';
    }),
    [allServices]
  );
  const hasComboServices = comboServices.length > 0;

  // Reduced motion listener
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { prefersReducedMotion.current = media.matches; };
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  // Viewport detection
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const update = () => setIsMobile(window.innerWidth < 768);
    const onResize = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(update, 150);
    };
    update();
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

  // Route prefetching
  useEffect(() => {
    const routesToPrefetch = ['/combo', '/makeup', '/skin', '/hair', '/nails', '/trending'];
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        routesToPrefetch.forEach(route => router.prefetch(route));
      });
    } else {
      setTimeout(() => routesToPrefetch.forEach(route => router.prefetch(route)), 100);
    }
  }, [router]);

  // Auto-scroll for trending
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

  // Bestseller extraction
  const getBestsellersByCategory = (mainCategory: string): Service[] => {
    return allServices
      .filter(s => s.isBestSeller === true)
      .filter(s => {
        const pri = (s.primaryCategory ?? '').toLowerCase();
        switch (mainCategory) {
          case 'Bridal': return (s.eventCategory ?? '').toLowerCase() === 'bridal';
          case 'Makeup': return pri === 'makeup' || ['makeup','bridal','engagement','reception','party','occasional','package'].some(t => pri.includes(t));
          case 'Nails':  return pri === 'nails'  || ['manicure','nail','pedicure'].some(t => pri.includes(t));
          case 'Hair':   return pri === 'hair'   || ['hair','spa','coloring','styling','treatment'].some(t => pri.includes(t));
          case 'Skin':   return pri === 'skin'   || ['skin','facial','treatment','care','removal','body','bleach','face','hydrafacial','spa','tan','cleanup','wax'].some(t => pri.includes(t));
          default:       return pri === mainCategory.toLowerCase();
        }
      })
      .sort((a, b) => (b.bookingCount ?? 0) - (a.bookingCount ?? 0))
      .slice(0, 10);
  };

  const bestsellerCategories = useMemo(
    () => MAIN_CATEGORIES
      .map(name => ({ name, services: getBestsellersByCategory(name), icon: getCategoryIcon(name) }))
      .filter(c => c.services.length > 0),
    [allServices]
  );

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const proceedToBooking = () => {
    if (!isLoggedIn) { setShowLoginModal(true); return; }
    setBookingStep('booking');
  };

  const handleAddToCart = (service: Service) => addToCart(service);
  const navigateToServicePage = (service: Service) => router.push(getServiceUrl(service));
  const navigateTo = (link: string) => router.push(link);

  const loadMoreCombos = () => {
    setVisibleCount(prev => ({ ...prev, combo: (prev.combo || 0) + 4 }));
  };
  const loadMoreBestsellers = (categoryKey: string) => {
    setVisibleCount(prev => ({ ...prev, [categoryKey]: (prev[categoryKey] || 0) + 4 }));
  };

  if (bookingStep === 'booking') {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><ServiceSkeleton /></div>}>
        <BookingFlow />
      </Suspense>
    );
  }

  if (!allServices.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">💅</div>
          <p className="text-gray-500 text-lg font-medium">Loading beauty services…</p>
          <p className="text-gray-400 text-sm mt-1">Kritika Ladies Beauty Parlour, Patna</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 safe-area-inset overflow-x-hidden w-full">
      <main className="max-w-7xl mx-auto px-4 py-6 pb-32 md:pb-8 safe-area-inset w-full overflow-x-hidden">
        
        {/* TRENDING SERVICES SECTION (unchanged) */}
        {hasTrendingServices && (
          <section className="bg-gradient-to-r from-yellow-50 via-pink-50 to-purple-50 rounded-2xl p-4 mb-6 border border-pink-200">
            {/* ... same as before ... */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-full w-10 h-10 flex items-center justify-center animate-pulse">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">Trending Services</h2>
                  <p className="text-xs text-gray-600">Most booked {trendingCount} services this week</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-white text-pink-600 text-xs font-bold px-3 py-1 rounded-full border border-pink-200">
                  {trendingCount} Trending
                </span>
                <button onClick={() => navigateTo('/trending')} className="hidden md:flex items-center text-pink-600 text-sm font-medium hover:underline">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>

            <div
              ref={trendingScrollRef}
              className={`flex pb-3 mb-4 ${isMobile ? 'overflow-x-auto space-x-4 scrollbar-hide' : 'overflow-hidden space-x-4'}`}
              style={SCROLL_STYLE}
            >
              {trendingServices.map((service, idx) => (
                <Link
                  key={service.id}
                  href={getServiceUrl(service)}
                  className={`flex-shrink-0 bg-white rounded-xl border border-pink-100 shadow-sm hover:shadow-md transition-shadow duration-200 group transform-gpu will-change-transform ${
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
                        <Star className="w-3 h-3 fill-white" /> Best Seller
                      </span>
                    )}
                    <span className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {service.rating?.toFixed(1) || '4.5'}
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-1 group-hover:text-pink-600 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 text-xs line-clamp-2 mb-2">
                      {service.shortDescription || service.description?.substring(0, 60)}…
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex flex-col">
                        <span className="font-bold text-pink-600 text-base">₹{service.price}</span>
                        {service.originalPrice && service.originalPrice > service.price && (
                          <span className="text-gray-400 text-xs line-through">₹{service.originalPrice}</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {service.durationText || `${service.duration || 60} min`}
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.preventDefault(); handleAddToCart(service); }}
                      className="w-full mt-2 py-2 text-sm bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium rounded-lg hover:from-pink-600 hover:to-rose-600 transition-colors duration-150 shadow-sm flex items-center justify-center gap-1"
                    >
                      Add to Cart <Heart className="w-4 h-4" />
                    </button>
                  </div>
                </Link>
              ))}

              {/* View All card */}
              <div
                className={`flex-shrink-0 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl border-2 border-dashed border-pink-200 flex flex-col items-center justify-center text-center cursor-pointer hover:from-pink-200 hover:to-purple-200 transition-colors duration-200 group transform-gpu ${
                  isMobile ? 'min-w-[160px] p-4' : 'min-w-[180px] p-4'
                }`}
                onClick={() => navigateTo('/trending')}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && navigateTo('/trending')}
              >
                <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">🔥</span>
                <p className="font-bold text-gray-800 text-base">View All</p>
                <p className="text-xs text-gray-600 mt-1">{trendingCount}+ services</p>
                <ArrowRight className="w-5 h-5 text-pink-600 mt-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Visit & Call cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              <div className="bg-white rounded-xl p-3 flex items-center justify-between border border-pink-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-pink-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-700 text-sm truncate">Visit Us</p>
                    <p className="text-xs text-gray-500 truncate">Near Bhootnath Metro Station, Patna</p>
                  </div>
                </div>
                <a href="https://maps.google.com/?q=Kritika+Ladies+Beauty+Parlour+Patna" target="_blank" rel="noopener noreferrer" className="text-pink-600 text-sm font-medium hover:underline whitespace-nowrap ml-2">
                  Get Directions →
                </a>
              </div>
              <div className="bg-white rounded-xl p-3 flex items-center justify-between border border-pink-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-pink-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-700 text-sm truncate">Call Us</p>
                    <a href="tel:+919650461390" className="text-xs text-gray-500 block hover:text-pink-600 transition-colors">+91-9650461390</a>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-xs text-gray-500 whitespace-nowrap">9AM–8PM</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-green-600 font-medium">Open Now</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Tools */}
            <section className="mb-8 mt-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 text-center flex items-center justify-center">
                <Zap className="mr-2 text-pink-600" /> Discover Your Perfect Look
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setShowBeautyQuiz(true)} className="bg-gradient-to-br from-pink-50 to-purple-100 p-4 rounded-xl hover:shadow-xl transition-all flex flex-col items-center text-center border-2 border-pink-200">
                  <span className="text-3xl mb-2">💫</span>
                  <h3 className="font-bold text-purple-800 text-base">Beauty Profile Quiz</h3>
                  <p className="text-xs text-gray-600 mt-1">Find perfect services tailored for you!</p>
                  <span className="mt-3 bg-white text-pink-600 font-semibold py-1.5 px-3 rounded-full text-xs border border-pink-300">Start Quiz</span>
                </button>
                <button onClick={() => setShowSkinAnalysis(true)} className="bg-gradient-to-br from-purple-50 to-pink-100 p-4 rounded-xl hover:shadow-xl transition-all flex flex-col items-center text-center border-2 border-purple-200">
                  <span className="text-3xl mb-2">✨</span>
                  <h3 className="font-bold text-purple-800 text-base">AI Skin Analysis</h3>
                  <p className="text-xs text-gray-600 mt-1">Get personalised skin care advice.</p>
                  <span className="mt-3 bg-white text-purple-600 font-semibold py-1.5 px-3 rounded-full text-xs border border-purple-300">Analyse Skin</span>
                </button>
              </div>
            </section>
          </section>
        )}

        {/* HORIZONTAL CATEGORY CARDS (unchanged) */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:flex md:flex-wrap justify-center gap-3">
            {HORIZONTAL_CATEGORIES.map(cat => (
              <div key={cat.id} className={`bg-gradient-to-br ${cat.color} rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow transform hover:-translate-y-1 md:flex-1 md:min-w-[220px] md:max-w-[240px]`}>
                <div className="p-5 text-white">
                  <h3 className="font-bold text-xl mb-1">{cat.title}</h3>
                  <p className="text-white/80 text-sm mb-3">{cat.description}</p>
                  <div className="relative aspect-[16/9] rounded-lg overflow-hidden mb-4 border-2 border-white/20">
                    <Image src={cat.image} alt={`${cat.title} services at Kritika`} fill className="object-cover" sizes="(max-width: 768px) 100vw, 240px" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>
                  <button onClick={() => navigateTo(cat.link)} className="w-full bg-white text-gray-800 font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                    Know More <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* COMBO PACKAGES SECTION (unchanged) */}
        {hasComboServices && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Gift className="w-6 h-6 text-pink-600" />
                <h2 className="text-xl font-bold text-gray-800">Popular Combo Packages</h2>
              </div>
              <button onClick={() => navigateTo('/combo')} className="text-pink-600 text-sm font-medium flex items-center gap-1 hover:underline">
                View All Combos <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="mb-4 bg-gradient-to-r from-amber-50 to-pink-50 rounded-xl p-3 border-l-4 border-pink-500">
              <p className="text-sm text-gray-700">🎁 Save more with our specially curated combo packages — makeup, hair, skin & nails at discounted prices!</p>
            </div>
            <div className={`${isMobile ? 'flex overflow-x-auto space-x-4 pb-4 scrollbar-hide' : 'grid grid-cols-2 lg:grid-cols-4 gap-4'}`} style={isMobile ? SCROLL_STYLE : undefined}>
              {comboServices.slice(0, visibleCount.combo || 4).map(service => (
                <div key={service.id} className={`${isMobile ? 'min-w-[280px]' : ''} border-2 border-pink-200 rounded-xl overflow-hidden bg-white transform-gpu`}>
                  <ServiceCard
                    service={service}
                    isFavorite={deferredFavorites.has(service.id)}
                    onToggleFavorite={() => toggleFavorite(service.id)}
                    onAddToCart={() => handleAddToCart(service)}
                    onViewDetails={() => navigateToServicePage(service)}
                    variant={isMobile ? 'compact' : 'detailed'}
                    showBestSellerBadge={service.isBestSeller === true}
                  />
                </div>
              ))}
            </div>
            {comboServices.length > (visibleCount.combo || 4) && (
              <div className="text-center mt-4">
                <button onClick={loadMoreCombos} className="text-pink-600 text-sm font-medium hover:underline">
                  View More Combos <ArrowRight className="w-4 h-4 inline ml-1" />
                </button>
              </div>
            )}
          </section>
        )}

        {/* BESTSELLER CATEGORIES (unchanged) */}
        {bestsellerCategories.map(cat => {
          const categoryKey = cat.name.toLowerCase();
          const currentVisible = visibleCount[categoryKey] || 4;
          const hasMore = cat.services.length > currentVisible;
          return (
            <section key={cat.name} className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <span className="mr-2 text-2xl">{cat.icon}</span>
                  {cat.name === 'Bridal' ? 'Bestseller Bridal Services' : `Top ${cat.name} Services`}
                </h2>
                {cat.name === 'Bridal' && (
                  <div className="flex items-center text-pink-600">
                    <Heart className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">Perfect for Weddings</span>
                  </div>
                )}
              </div>
              {cat.name === 'Bridal' && (
                <div className="mb-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-200">
                  <p className="text-sm text-gray-700">✨ Complete bridal packages — makeup, hair, skin & nails for your special day.</p>
                </div>
              )}
              <div className={`${isMobile ? 'flex overflow-x-auto space-x-4 pb-4 scrollbar-hide' : 'grid grid-cols-2 lg:grid-cols-4 gap-4'}`} style={isMobile ? SCROLL_STYLE : undefined}>
                {cat.services.slice(0, currentVisible).map(service => (
                  <article key={service.id} className={`${isMobile ? 'min-w-[280px]' : ''} ${cat.name === 'Bridal' ? 'border-2 border-pink-200 rounded-xl overflow-hidden' : ''} transform-gpu`}>
                    <ServiceCard
                      service={service}
                      isFavorite={deferredFavorites.has(service.id)}
                      onToggleFavorite={() => toggleFavorite(service.id)}
                      onAddToCart={() => handleAddToCart(service)}
                      onViewDetails={() => navigateToServicePage(service)}
                      variant={isMobile ? 'compact' : 'detailed'}
                      showBestSellerBadge={service.isBestSeller === true}
                    />
                  </article>
                ))}
              </div>
              {hasMore && (
                <div className="text-center mt-4">
                  <button onClick={() => loadMoreBestsellers(categoryKey)} className="text-pink-600 text-sm font-medium hover:underline">
                    View More {cat.name} Services <ArrowRight className="w-4 h-4 inline ml-1" />
                  </button>
                </div>
              )}
              {cat.name === 'Bridal' && (
                <div className="mt-4 text-center">
                  <button onClick={() => navigateTo('/makeup?category=bridal')} className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-medium rounded-lg hover:shadow-lg transition-shadow">
                    <Heart className="w-4 h-4 mr-2" /> View All Bridal Services
                  </button>
                </div>
              )}
            </section>
          );
        })}

        {/* WHY CHOOSE US */}
        <section className="bg-gradient-to-r from-pink-100 via-purple-100 to-rose-100 rounded-2xl p-6 mb-6 border-2 border-pink-200">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Why Choose Kritika Ladies Beauty Parlour?</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center">
              <Sparkles className="w-8 h-8 text-purple-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">{allServices.length}+</div>
              <div className="text-xs text-gray-600">Services</div>
            </div>
            <div className="flex flex-col items-center">
              <Award className="w-8 h-8 text-pink-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">4.8</div>
              <div className="text-xs text-gray-600">⭐ 5000+ Reviews</div>
            </div>
            <div className="flex flex-col items-center">
              <Users className="w-8 h-8 text-rose-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">5000+</div>
              <div className="text-xs text-gray-600">Happy Clients</div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 bg-white text-green-600 font-bold text-sm px-4 py-2 rounded-full border border-green-200 shadow-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Open Now</span>
              <span className="text-gray-600 font-normal">9:00 AM – 8:00 PM</span>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Glow-ups & Stories</h2>
          <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide" style={SCROLL_STYLE}>
            <TestimonialCard name="Priya S." text="My skin has never looked better! The diamond facial is pure magic." image="/images/skin/hydrafacial.webp" />
            <TestimonialCard name="Ananya R." text="The bridal makeup team made me feel like an absolute princess on my big day!" image="/images/makeup/bridal_makeup.webp" />
            <TestimonialCard name="Maya T." text="Best hair spa in town. My damaged hair is now silky smooth." image="/images/hair/hair_spa.webp" />
          </div>
        </section>

        {/* PROMOTIONAL BANNER */}
        <section className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl p-6 text-center border-2 border-pink-200">
          <div className="inline-flex items-center bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full mb-2">
            <Zap className="mr-1 w-3 h-3" /> SPECIAL OFFER
          </div>
          <h2 className="text-lg font-bold text-gray-800">30% OFF On All Bridal Packages</h2>
          <p className="text-sm text-gray-600 mt-1">Book your trial now and save big!</p>
        </section>
      </main>

      {/* Modals */}
      {showBeautyQuiz && <BeautyQuiz onClose={() => setShowBeautyQuiz(false)} />}
      {showSkinAnalysis && <SkinAnalysis onClose={() => setShowSkinAnalysis(false)} />}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={() => { setShowLoginModal(false); setBookingStep('booking'); }}
        onSkipToHome={() => setShowLoginModal(false)}
      />
      {/* FloatingCart and MobileBottomNav removed – now in GlobalFloatingUI */}
    </div>
  );
}