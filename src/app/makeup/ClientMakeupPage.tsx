// kritika/src/app/makeup/ClientMakeupPage.tsx
"use client";

import { useState, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { ArrowRight, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';

import { Service } from '../../types/service';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import TrendingCard from '../../components/TrendingCard';
import ServiceCard from '../../components/ServiceCard';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useAutoScroll } from '../../hooks/useAutoScroll';
import { SCROLL_STYLE } from '../../constants/ui';
import { getServiceUrl } from '../../utils/serviceUrl';

const ServiceDetailModal = dynamic(() => import('../../components/ServiceDetailModal'), { ssr: false });
const BeautyQuiz = dynamic(() => import('../../components/BeautyQuiz'), { ssr: false });
const SkinAnalysis = dynamic(() => import('../../components/SkinAnalysis'), { ssr: false });
const TestimonialCard = dynamic(() => import('../../components/TestimonialCard'));
const LoginModal = dynamic(() => import('../../components/LoginModal'), { ssr: false });
const BookingFlow = dynamic(() => import('../../components/booking/BookingFlow'), { ssr: false });

interface ClientMakeupPageProps {
  allServices: Service[];
  trendingServices: Service[];
}

// Subcategories completely preserved with your original metadata strings intact
const MAKEUP_SUBCATEGORIES = [    
  {
    id: 'bridal-makeup',
    title: 'Bridal Makeup',
    description: 'Complete bridal packages',
    image: '/images/makeup/complete_bridal_package.webp',
    icon: '👰',
    color: 'from-pink-500 to-rose-600',
    targetCategory: 'Bridal Makeup'
  },    
  {
    id: 'special-occassions',
    title: 'Special Occasions',
    description: 'Pre-wedding makeup',
    image: '/images/makeup/bridal_HDLook.webp',
    icon: '💍',
    color: 'from-purple-500 to-pink-600',
    targetCategory: 'Special Occassions' // Kept matching your string mapping
  },
  {
    id: 'quick-makeup',
    title: 'Quick Makeup',
    description: 'Glamorous reception styles',
    image: '/images/makeup/reception_airbrush.webp',
    icon: '✨',
    color: 'from-amber-500 to-red-600',
    targetCategory: 'Quick Makeup'
  },
  {
    id: 'camera-ready-makeup',
    title: 'Camera Ready Makeup',
    description: 'Camera-ready makeup',
    image: '/images/makeup/hd_makeup.webp',
    icon: '📸',
    color: 'from-blue-500 to-cyan-600',
    targetCategory: 'Camera Ready Makeup'
  },
  {
    id: 'bridal-packages',
    title: 'Bridal Packages',
    description: 'Exclusive bridal package deals',
    image: '/images/makeup/classic_bridal.webp',
    icon: '💎',
    color: 'from-rose-500 to-pink-600',
    targetCategory: 'Bridal Packages'
  }
] as const;

export default function ClientMakeupPage({ allServices, trendingServices }: ClientMakeupPageProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showServiceDetail, setShowServiceDetail] = useState(false);
  const [showBeautyQuiz, setShowBeautyQuiz] = useState(false);
  const [showSkinAnalysis, setShowSkinAnalysis] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [bookingStep, setBookingStep] = useState<'browsing' | 'booking'>('browsing');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const scrollRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const trendingScrollRef = useRef<HTMLDivElement>(null);

  const isMobile = useIsMobile();
  useAutoScroll(trendingScrollRef, { enabled: !isMobile && trendingServices.length >= 3 });

  const { addToCart } = useBooking();

  const servicesByCategory = useMemo(() => {
    const map = new Map<string, Service[]>();
    MAKEUP_SUBCATEGORIES.forEach(cat => {
      const filtered = allServices.filter(s => s.category === cat.targetCategory);
      map.set(cat.id, filtered);
    });
    return map;
  }, [allServices]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }, []);

  const scrollCategory = (direction: 'left' | 'right', categoryId: string) => {
    const el = scrollRefs.current[categoryId];
    if (!el) return;
    const scrollAmount = isMobile ? 220 : 320;
    el.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  if (bookingStep === 'booking') {
    return <BookingFlow onBack={() => setBookingStep('browsing')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 safe-area-inset overflow-x-hidden w-full">
      <main className="max-w-7xl mx-auto px-4 py-6 pb-6 md:pb-8 safe-area-inset w-full overflow-x-hidden">

        {/* ── TRENDING ─────────────────────────────────────────────────────── */}
        {trendingServices.length > 0 && (
          <section className="bg-gradient-to-r from-rose-50 via-purple-50 to-pink-50 rounded-2xl p-4 mb-6 border border-rose-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-rose-500 to-pink-500 rounded-full w-10 h-10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">Trending Makeup Looks</h2>
                  <p className="text-xs text-gray-600">Most booked {trendingServices.length} this week</p>
                </div>
              </div>
              <span className="bg-white text-rose-600 text-xs font-bold px-3 py-1 rounded-full border border-rose-200">
                {trendingServices.length} Trending
              </span>
            </div>

            <div
              ref={trendingScrollRef}
              className={`flex pb-3 ${isMobile ? 'overflow-x-auto space-x-3 scrollbar-hide' : 'overflow-hidden space-x-3'}`}
              style={SCROLL_STYLE}
            >
              {trendingServices.map((service, idx) => (
                <TrendingCard
                  key={service.id}
                  service={service}
                  href={getServiceUrl(service)}
                  onAddToCart={e => { e.preventDefault(); addToCart(service); }}
                  isMobile={isMobile}
                  priority={idx === 0}
                  accent="rose"
                />
              ))}
              <div
                className={`flex-shrink-0 bg-gradient-to-br from-rose-100 to-pink-100 rounded-xl border-2 border-dashed border-rose-200 flex flex-col items-center justify-center text-center cursor-pointer hover:from-rose-200 hover:to-pink-200 transition-colors group ${
                  isMobile ? 'min-w-[130px] p-3' : 'min-w-[150px] p-4'
                }`}
                onClick={() => document.getElementById('makeup-services-start')?.scrollIntoView({ behavior: 'smooth' })}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    document.getElementById('makeup-services-start')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">✨</span>
                <p className="font-bold text-gray-800 text-sm">All Services</p>
                <p className="text-xs text-gray-600 mt-0.5">{allServices.length}+ services</p>
                <ArrowRight className="w-4 h-4 text-rose-600 mt-1.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </section>
        )}

        {/* ── HORIZONTAL SECTIONS FOR EACH SUBCATEGORY ──────────────────────── */}
        <div id="makeup-services-start">
          {MAKEUP_SUBCATEGORIES.map(category => {
            const services = servicesByCategory.get(category.id) || [];
            if (services.length === 0) return null;

            return (
              <section key={category.id} data-category={category.targetCategory} className="mb-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl" role="img" aria-label={category.title}>{category.icon}</span>
                    <h2 className="text-lg font-bold text-gray-800">{category.title}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => scrollCategory('left', category.id)}
                      className="w-8 h-8 rounded-full bg-white border border-rose-200 shadow-sm flex items-center justify-center hover:bg-rose-50 transition-colors"
                      aria-label={`Scroll left across ${category.title}`}
                    >
                      <ChevronLeft className="w-4 h-4 text-rose-600" />
                    </button>
                    <button
                      onClick={() => scrollCategory('right', category.id)}
                      className="w-8 h-8 rounded-full bg-white border border-rose-200 shadow-sm flex items-center justify-center hover:bg-rose-50 transition-colors"
                      aria-label={`Scroll right across ${category.title}`}
                    >
                      <ChevronRight className="w-4 h-4 text-rose-600" />
                    </button>
                  </div>
                </div>

                <div
                  ref={el => { scrollRefs.current[category.id] = el; }}
                  className="flex overflow-x-auto scrollbar-hide space-x-3 pb-2 snap-x snap-mandatory"
                  style={SCROLL_STYLE}
                >
                  {services.map((service, idx) => (
                    <div key={service.id} className="snap-start flex-shrink-0 w-[175px] md:w-[200px]">
                      <ServiceCard
                        service={service}
                        isFavorite={favorites.has(service.id)}
                        onToggleFavorite={() => toggleFavorite(service.id)}
                        onAddToCart={() => addToCart(service)}
                        onViewDetails={() => { setSelectedService(service); setShowServiceDetail(true); }}
                        variant="compact"
                        locationSlug="makeup"
                        priority={idx === 0}
                      />
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* ── DISCOVERY TOOLS ─────────────────────────────────────────────── */}
        <section className="mb-8" aria-label="Makeup consultation tools">
          <h2 className="text-lg font-bold text-gray-800 mb-3 text-center">💄 Find Your Perfect Look</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowBeautyQuiz(true)}
              className="bg-gradient-to-br from-rose-50 to-pink-100 p-4 rounded-xl hover:shadow-lg transition-all flex flex-col items-center text-center border-2 border-rose-200 active:scale-[0.98]"
            >
              <span className="text-3xl mb-2" role="img" aria-label="Quiz">💋</span>
              <h3 className="font-bold text-rose-800 text-sm">Makeup Style Quiz</h3>
              <p className="text-xs text-gray-600 mt-1">Find your bridal/party look!</p>
              <span className="mt-3 bg-white text-rose-600 font-semibold py-1.5 px-3 rounded-full text-xs border border-rose-300">Start Quiz</span>
            </button>
            <button
              onClick={() => setShowSkinAnalysis(true)}
              className="bg-gradient-to-br from-pink-50 to-rose-100 p-4 rounded-xl hover:shadow-lg transition-all flex flex-col items-center text-center border-2 border-pink-200 active:scale-[0.98]"
            >
              <span className="text-3xl mb-2" role="img" aria-label="Try-on">🎨</span>
              <h3 className="font-bold text-rose-800 text-sm">Virtual Try‑On</h3>
              <p className="text-xs text-gray-600 mt-1">Preview makeup styles</p>
              <span className="mt-3 bg-white text-rose-600 font-semibold py-1.5 px-3 rounded-full text-xs border border-rose-300">Try Now</span>
            </button>
          </div>
        </section>

        {/* ── WHY CHOOSE US ─────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-r from-rose-50 via-pink-50 to-purple-50 rounded-2xl p-6 mb-6 border border-rose-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Why Brides Love Kritika Makeup ✨</h2>

          <div className="flex justify-center mb-5">
            <div className="inline-flex items-center gap-2 bg-white border-2 border-amber-300 text-amber-800 px-4 py-2 rounded-full text-sm font-bold shadow-sm">
              🏆 Award‑winning Makeup Artists
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-1" role="img" aria-label="Styles">💄</div>
              <div className="text-2xl font-bold text-gray-900">{allServices.length}+</div>
              <div className="text-xs text-gray-500">Makeup Styles</div>
            </div>
            <div className="flex flex-col items-center" itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
              <div className="text-3xl mb-1" role="img" aria-label="Rating">⭐</div>
              <div className="text-2xl font-bold text-gray-900"><span itemProp="ratingValue">4.9</span></div>
              <div className="text-xs text-gray-500"><span itemProp="reviewCount">1500+</span> Reviews</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-1" role="img" aria-label="Brides">👰</div>
              <div className="text-2xl font-bold text-gray-900">800+</div>
              <div className="text-xs text-gray-500">Brides</div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 bg-white text-rose-600 font-bold text-sm px-4 py-2 rounded-full border border-rose-200 shadow-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Open Now</span>
              <span className="text-gray-600 font-normal">9:00 AM – 8:00 PM</span>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
        <section className="mb-6" aria-label="Customer testimonials">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Real Bridal Transformations</h2>
          <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide" style={SCROLL_STYLE}>
            <TestimonialCard name="Neha S." text="My bridal makeup was absolutely stunning! Kritika made me feel like a princess." image="/images/makeup/bridal.webp" />
            <TestimonialCard name="Ritu M." text="Airbrush makeup lasted all night. Professional and friendly service." image="/images/makeup/airbrush.webp" />
            <TestimonialCard name="Anjali K." text="Best party makeup in town – highly recommend!" image="/images/makeup/party.webp" />
          </div>
        </section>

        {/* ── PROMO BANNER ─────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-r from-rose-100 via-pink-100 to-purple-100 rounded-2xl p-6 text-center border border-rose-200">
          <div className="inline-flex items-center gap-1.5 bg-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-3">
            ✨ BRIDAL OFFER
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">20% Off on Bridal Makeup Packages</h3>
          <p className="text-gray-500 text-sm mb-4">Book your trial today!</p>
          <button
            onClick={() => {
              const bridalSection = document.querySelector('[data-category="Bridal Makeup"]');
              if (bridalSection) bridalSection.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all"
          >
            Explore Bridal <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      </main>

      {/* Modals */}
      {selectedService && showServiceDetail && (
        <ServiceDetailModal
          service={selectedService}
          isOpen={showServiceDetail}
          onClose={() => setShowServiceDetail(false)}
          onAddToCart={s => addToCart(s)}
          activeFaq={activeFaq}
          setActiveFaq={setActiveFaq}
        />
      )}
      {showBeautyQuiz && <BeautyQuiz onClose={() => setShowBeautyQuiz(false)} />}
      {showSkinAnalysis && <SkinAnalysis onClose={() => setShowSkinAnalysis(false)} />}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={() => { setShowLoginModal(false); setBookingStep('booking'); }}
        onSkipToHome={() => setShowLoginModal(false)}
      />
    </div>
  );
}