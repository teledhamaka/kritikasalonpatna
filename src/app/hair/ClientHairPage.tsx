"use client";

import { useState, useRef, useCallback, useMemo } from 'react';
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

interface ClientHairPageProps {
  allServices: Service[];
  trendingServices: Service[];
}

const HAIR_SUBCATEGORIES = [
  {
    id: 'hair-treatment',
    title: 'Hair Treatment',
    description: 'Spa, keratin & deep conditioning',
    image: '/images/hair/hair_spa.webp',
    icon: '💆‍♀️',
    color: 'from-blue-500 to-cyan-600',
    targetCategory: 'Hair Treatment'
  },
  {
    id: 'hair-cut',
    title: 'Hair Cut',
    description: 'Precision cuts & trims',
    image: '/images/hair/layered_cut.webp',
    icon: '✂️',
    color: 'from-rose-500 to-red-600',
    targetCategory: 'Hair Cut'
  },    
  {
    id: 'hair-color',
    title: 'Hair Color',
    description: 'Global, highlights & balayage',
    image: '/images/hair/hair_color.webp',
    icon: '🎨',
    color: 'from-purple-500 to-pink-600',
    targetCategory: 'Hair Color'
  },
  {
    id: 'hair-styling',
    title: 'Hair Styling',
    description: 'Blow-dry, curls & updos',
    image: '/images/hair/hair_curling.webp',
    icon: '✨',
    color: 'from-amber-500 to-orange-600',
    targetCategory: 'Hair Styling'
  }
] as const;

export default function ClientHairPage({ allServices, trendingServices }: ClientHairPageProps) {
  const router = useRouter();
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

  const { isLoggedIn } = useAuth();
  const { addToCart } = useBooking();

  const servicesByCategory = useMemo(() => {
    const map = new Map<string, Service[]>();
    HAIR_SUBCATEGORIES.forEach(cat => {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 safe-area-inset overflow-x-hidden w-full">
      <main className="max-w-7xl mx-auto px-4 py-6 pb-6 md:pb-8 safe-area-inset w-full overflow-x-hidden">

        {/* ── TRENDING HAIR SERVICES ───────────────────────────────────────── */}
        {trendingServices.length > 0 && (
          <section className="bg-gradient-to-r from-blue-50 via-purple-50 to-cyan-50 rounded-2xl p-4 mb-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full w-10 h-10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">Trending Hair Services</h2>
                  <p className="text-xs text-gray-600">Most booked {trendingServices.length} this week</p>
                </div>
              </div>
              <span className="bg-white text-blue-600 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
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
                  accent="blue"
                />
              ))}
              <div
                className={`flex-shrink-0 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl border-2 border-dashed border-blue-200 flex flex-col items-center justify-center text-center cursor-pointer hover:from-blue-200 hover:to-cyan-200 transition-colors group ${
                  isMobile ? 'min-w-[130px] p-3' : 'min-w-[150px] p-4'
                }`}
                onClick={() => document.getElementById('hair-services-start')?.scrollIntoView({ behavior: 'smooth' })}
                role="button"
                tabIndex={0}
              >
                <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">✨</span>
                <p className="font-bold text-gray-800 text-sm">All Services</p>
                <p className="text-xs text-gray-600 mt-0.5">{allServices.length}+ services</p>
                <ArrowRight className="w-4 h-4 text-blue-600 mt-1.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </section>
        )}

        {/* ── HORIZONTAL SECTIONS FOR EACH HAIR SUBCATEGORY ───────────────── */}
        <div id="hair-services-start">
          {HAIR_SUBCATEGORIES.map(category => {
            const services = servicesByCategory.get(category.id) || [];
            if (services.length === 0) return null;

            return (
              <section key={category.id} id={category.id} className="mb-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{category.icon}</span>
                    <h2 className="text-lg font-bold text-gray-800">{category.title}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => scrollCategory('left', category.id)}
                      className="w-8 h-8 rounded-full bg-white border border-blue-200 shadow-sm flex items-center justify-center hover:bg-blue-50 transition-colors"
                      aria-label="Scroll left"
                    >
                      <ChevronLeft className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => scrollCategory('right', category.id)}
                      className="w-8 h-8 rounded-full bg-white border border-blue-200 shadow-sm flex items-center justify-center hover:bg-blue-50 transition-colors"
                      aria-label="Scroll right"
                    >
                      <ChevronRight className="w-4 h-4 text-blue-600" />
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
                        locationSlug="hair"
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
        <section className="mb-8" aria-label="Hair consultation tools">
          <h2 className="text-lg font-bold text-gray-800 mb-3 text-center">💇‍♀️ Discover Your Perfect Hair Care</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowBeautyQuiz(true)}
              className="bg-gradient-to-br from-blue-50 to-cyan-100 p-4 rounded-xl hover:shadow-lg transition-all flex flex-col items-center text-center border-2 border-blue-200 active:scale-[0.98]"
            >
              <span className="text-3xl mb-2">💆‍♀️</span>
              <h3 className="font-bold text-blue-800 text-sm">Hair Care Quiz</h3>
              <p className="text-xs text-gray-600 mt-1">Apke liye perfect hair treatments find karo!</p>
              <span className="mt-3 bg-white text-blue-600 font-semibold py-1.5 px-3 rounded-full text-xs border border-blue-300">Start Quiz</span>
            </button>
            <button
              onClick={() => setShowSkinAnalysis(true)}
              className="bg-gradient-to-br from-cyan-50 to-blue-100 p-4 rounded-xl hover:shadow-lg transition-all flex flex-col items-center text-center border-2 border-cyan-200 active:scale-[0.98]"
            >
              <span className="text-3xl mb-2">🔬</span>
              <h3 className="font-bold text-blue-800 text-sm">Hair Analysis</h3>
              <p className="text-xs text-gray-600 mt-1">Personalised hair care advice pao.</p>
              <span className="mt-3 bg-white text-blue-600 font-semibold py-1.5 px-3 rounded-full text-xs border border-cyan-300">Analyse Hair</span>
            </button>
          </div>
        </section>

        {/* ── WHY CHOOSE US ─────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-r from-blue-50 via-purple-50 to-cyan-50 rounded-2xl p-6 mb-6 border border-blue-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Why Clients Love Kritika Hair Studio ✨</h2>

          <div className="flex justify-center mb-5">
            <div className="inline-flex items-center gap-2 bg-white border-2 border-amber-300 text-amber-800 px-4 py-2 rounded-full text-sm font-bold shadow-sm">
              ✂️ Certified Hair Artists & Stylists
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-1">✂️</div>
              <div className="text-2xl font-bold text-gray-900">{allServices.length}+</div>
              <div className="text-xs text-gray-500">Hair Services</div>
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
            <div className="inline-flex items-center gap-2 bg-white text-blue-600 font-bold text-sm px-4 py-2 rounded-full border border-blue-200 shadow-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Open Now</span>
              <span className="text-gray-600 font-normal">9:00 AM – 8:00 PM</span>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
        <section className="mb-6" aria-label="Customer testimonials">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Hair Transformations</h2>
          <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide" style={SCROLL_STYLE}>
            <TestimonialCard name="Priya S." text="Best haircut I've ever had! The stylist understood exactly what I wanted." image="/images/hair/haircut.webp" />
            <TestimonialCard name="Ananya R." text="My balayage turned out stunning. Great colour experts!" image="/images/hair/color.webp" />
            <TestimonialCard name="Maya T." text="Keratin treatment made my frizzy hair silky smooth. Highly recommend." image="/images/hair/smoothing.webp" />
          </div>
        </section>

        {/* ── PROMO BANNER ─────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-r from-blue-100 via-purple-100 to-cyan-100 rounded-2xl p-6 text-center border border-blue-200">
          <div className="inline-flex items-center gap-1.5 bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-3">
            ✨ HAIR SALE
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">25% OFF on All Hair Colour & Smoothing</h3>
          <p className="text-gray-500 text-sm mb-4">Transform your look today!</p>
          <button
            onClick={() => {
              // FIXED: Corrected ID selection reference target
              const colourSection = document.getElementById('hair-color');
              if (colourSection) colourSection.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all"
          >
            Explore Offers <ArrowRight className="w-4 h-4" />
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