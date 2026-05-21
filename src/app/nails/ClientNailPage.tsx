// kritika/src/app/nail/ClientNailPage.tsx
"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { ArrowRight, Star, Clock, TrendingUp, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Service } from '../../types/service';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import ServiceSkeleton from '../../components/ServiceSkeleton';
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

interface ClientNailsPageProps {
  allServices: Service[];
  trendingServices: Service[];
}

const NAIL_SUBCATEGORIES = [
  {
    id: 'manicure',
    title: 'Manicure',
    description: 'Classic & spa manicures',
    image: '/images/nails/gel_manicure.webp',
    color: 'from-purple-500 to-pink-600',
    targetCategory: 'Manicure',
    icon: '💅'
  },
  {
    id: 'nail-art',
    title: 'Nail Art',
    description: 'Creative & trendy designs',
    image: '/images/nails/nail_art.webp',
    color: 'from-pink-500 to-rose-600',
    targetCategory: 'Nail Art',
    icon: '🎨'
  },
  {
    id: 'pedicure',
    title: 'Pedicure',
    description: 'Relaxing foot treatments',
    image: '/images/nails/luxury_pedicure.webp',
    color: 'from-amber-500 to-orange-600',
    targetCategory: 'Pedicure',
    icon: '🦶'
  },
  {
    id: 'nail-salon',
    title: 'Nail Salon',
    description: 'Full-service nail care',
    image: '/images/nails/nail_extension.webp',
    color: 'from-blue-500 to-indigo-600',
    targetCategory: 'Nail Salon',
    icon: '✨'
  },
  {
    id: 'bridal-nails',
    title: 'Bridal Nails',
    description: 'Elegant nail designs for special occasions',
    image: '/images/nails/bridal_nails.webp',
    color: 'from-rose-500 to-pink-600',
    targetCategory: 'Bridal Nails',
    icon: '💎'
  }
] as const;

export default function ClientNailsPage({ allServices, trendingServices }: ClientNailsPageProps) {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showServiceDetail, setShowServiceDetail] = useState(false);
  const [showBeautyQuiz, setShowBeautyQuiz] = useState(false);
  const [showSkinAnalysis, setShowSkinAnalysis] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [bookingStep, setBookingStep] = useState<'browsing' | 'booking'>('browsing');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  // Guards safety against runtime date/state mismatch hydration warnings
  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const trendingScrollRef = useRef<HTMLDivElement>(null);

  const isMobile = useIsMobile();
  useAutoScroll(trendingScrollRef, { enabled: !isMobile && trendingServices.length >= 3 });

  const { isLoggedIn } = useAuth();
  const { addToCart } = useBooking();

  const servicesByCategory = useMemo(() => {
    const map = new Map<string, Service[]>();
    NAIL_SUBCATEGORIES.forEach(cat => {
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 safe-area-inset overflow-x-hidden w-full">
      <main className="max-w-7xl mx-auto px-4 py-6 pb-6 md:pb-8 safe-area-inset w-full overflow-x-hidden">

        {/* ── TRENDING NAIL SERVICES ───────────────────────────────────────── */}
        {trendingServices.length > 0 && (
          <section className="bg-gradient-to-r from-pink-50 via-purple-50 to-rose-50 rounded-2xl p-4 mb-6 border border-pink-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-full w-10 h-10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">Trending Nail Services</h2>
                  <p className="text-xs text-gray-600">Most booked {trendingServices.length} this week</p>
                </div>
              </div>
              <span className="bg-white text-pink-600 text-xs font-bold px-3 py-1 rounded-full border border-pink-200">
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
                  accent="pink"
                />
              ))}
              <div
                className={`flex-shrink-0 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl border-2 border-dashed border-pink-200 flex flex-col items-center justify-center text-center cursor-pointer hover:from-pink-200 hover:to-rose-200 transition-colors group ${
                  isMobile ? 'min-w-[130px] p-3' : 'min-w-[150px] p-4'
                }`}
                onClick={() => document.getElementById('nails-services-start')?.scrollIntoView({ behavior: 'smooth' })}
                role="button"
                tabIndex={0}
              >
                <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">✨</span>
                <p className="font-bold text-gray-800 text-sm">All Services</p>
                <p className="text-xs text-gray-600 mt-0.5">{allServices.length}+ choices</p>
                <ArrowRight className="w-4 h-4 text-pink-600 mt-1.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </section>
        )}

        {/* ── HORIZONTAL SECTIONS FOR EACH NAILS SUBCATEGORY ───────────────── */}
        <div id="nails-services-start">
          {NAIL_SUBCATEGORIES.map(category => {
            const services = servicesByCategory.get(category.id) || [];
            if (services.length === 0) return null;

            return (
              <section key={category.id} className="mb-10" data-category={category.title}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{category.icon}</span>
                    <h2 className="text-lg font-bold text-gray-800">{category.title}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => scrollCategory('left', category.id)}
                      className="w-8 h-8 rounded-full bg-white border border-pink-200 shadow-sm flex items-center justify-center hover:bg-pink-50 transition-colors"
                      aria-label="Scroll left"
                    >
                      <ChevronLeft className="w-4 h-4 text-pink-600" />
                    </button>
                    <button
                      onClick={() => scrollCategory('right', category.id)}
                      className="w-8 h-8 rounded-full bg-white border border-pink-200 shadow-sm flex items-center justify-center hover:bg-pink-50 transition-colors"
                      aria-label="Scroll right"
                    >
                      <ChevronRight className="w-4 h-4 text-pink-600" />
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
                        locationSlug="nails"
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
        <section className="mb-8" aria-label="Nail consultation tools">
          <h2 className="text-lg font-bold text-gray-800 mb-3 text-center">💅 Discover Your Perfect Nail Look</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowBeautyQuiz(true)}
              className="bg-gradient-to-br from-pink-50 to-rose-100 p-4 rounded-xl hover:shadow-lg transition-all flex flex-col items-center text-center border-2 border-pink-200 active:scale-[0.98]"
            >
              <span className="text-3xl mb-2">💅</span>
              <h3 className="font-bold text-pink-800 text-sm">Nail Art Quiz</h3>
              <p className="text-xs text-gray-600 mt-1">Apke liye perfect nail design find karo!</p>
              <span className="mt-3 bg-white text-pink-600 font-semibold py-1.5 px-3 rounded-full text-xs border border-pink-300">Start Quiz</span>
            </button>
            <button
              onClick={() => setShowSkinAnalysis(true)}
              className="bg-gradient-to-br from-rose-50 to-pink-100 p-4 rounded-xl hover:shadow-lg transition-all flex flex-col items-center text-center border-2 border-rose-200 active:scale-[0.98]"
            >
              <span className="text-3xl mb-2">🔍</span>
              <h3 className="font-bold text-pink-800 text-sm">Nail Health Analysis</h3>
              <p className="text-xs text-gray-600 mt-1">Personalised nail care advice pao.</p>
              <span className="mt-3 bg-white text-pink-600 font-semibold py-1.5 px-3 rounded-full text-xs border border-rose-300">Analyse Nails</span>
            </button>
          </div>
        </section>

        {/* ── WHY CHOOSE US ─────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-r from-pink-50 via-purple-50 to-rose-50 rounded-2xl p-6 mb-6 border border-pink-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Why Clients Love Kritika Nail Studio ✨</h2>

          <div className="flex justify-center mb-5">
            <div className="inline-flex items-center gap-2 bg-white border-2 border-amber-300 text-amber-800 px-4 py-2 rounded-full text-sm font-bold shadow-sm">
              🏆 Premium Nail Artists & Hygienic Studio
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-1">💅</div>
              <div className="text-2xl font-bold text-gray-900">{allServices.length}+</div>
              <div className="text-xs text-gray-500">Nail Services</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-1">⭐</div>
              <div className="text-2xl font-bold text-gray-900">4.8</div>
              <div className="text-xs text-gray-500">1800+ Reviews</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-1">👤</div>
              <div className="text-2xl font-bold text-gray-900">1800+</div>
              <div className="text-xs text-gray-500">Happy Clients</div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 bg-white text-pink-600 font-bold text-sm px-4 py-2 rounded-full border border-pink-200 shadow-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Open Now</span>
              <span className="text-gray-600 font-normal">9:00 AM – 8:00 PM</span>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
        <section className="mb-6" aria-label="Customer testimonials">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Nail Transformations</h2>
          <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide" style={SCROLL_STYLE}>
            <TestimonialCard name="Priya S." text="The gel manicure lasted 3 weeks! Best nail art in town." image="/images/nails/manicure.webp" />
            <TestimonialCard name="Ananya R." text="Loved my acrylic extensions – perfect shape and durability." image="/images/nails/extensions.webp" />
            <TestimonialCard name="Maya T." text="Nail art is stunning. They replicated my Pinterest board perfectly!" image="/images/nails/nailart.webp" />
          </div>
        </section>

        {/* ── PROMO BANNER ─────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-r from-pink-100 via-purple-100 to-rose-100 rounded-2xl p-6 text-center border border-pink-200">
          <div className="inline-flex items-center gap-1.5 bg-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-3">
            ✨ NAIL SALE
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">20% OFF on All Gel & Acrylic Services</h3>
          <p className="text-gray-500 text-sm mb-4">Get the perfect set for any occasion!</p>
          <button
            onClick={() => {
              const salonSection = document.querySelector('[data-category="Nail Salon"]');
              if (salonSection) salonSection.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all"
          >
            Explore Nail Deals <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      </main>

      {/* Modals */}
      {mounted && selectedService && showServiceDetail && (
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