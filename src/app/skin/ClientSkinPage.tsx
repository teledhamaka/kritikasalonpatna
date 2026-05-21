// kritika/src/app/skin/ClientSkinPage.tsx
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

interface ClientSkinPageProps {
  allServices: Service[];
  trendingServices: Service[];
}

const SKIN_SUBCATEGORIES = [
  {
    id: 'hair-removal-services',
    title: 'Hair Removal Services',
    description: 'Hair removal (waxing & threading)',
    image: '/images/skin/arm_leg_wax.webp',
    color: 'from-amber-500 to-orange-600',
    targetCategory: 'Hair Removal Services',
    icon: '✨'
  },
  {
    id: 'facial-spa',
    title: 'Facial Spa',
    description: 'Hydrafacial, diamond facial & more',
    image: '/images/skin/hydrafacial.webp',
    color: 'from-green-500 to-emerald-600',
    targetCategory: 'Facial Spa',
    icon: '💆‍♀️'
  },
  {
    id: 'skin-care-clinic',
    title: 'Skin Care Clinic',
    description: 'Acne, anti-aging & skin concerns',
    image: '/images/skin/acne_cleanup.webp',
    color: 'from-purple-500 to-pink-600',
    targetCategory: 'Skin Care Clinic',
    icon: '🔬'
  },
  {
    id: 'body-care-wellness',
    title: 'Body Care & Wellness',
    description: 'Body polish, wraps & wellness treatments',
    image: '/images/skin/kesar_body_polish.webp',
    color: 'from-teal-500 to-cyan-600',
    targetCategory: 'Body Care & Wellness',
    icon: '🧘‍♀️'
  },
  {
    id: 'eye-brow-lip-care',
    title: 'Eye_brow & Lip Care',
    description: 'Glow treatments for radiant skin',
    image: '/images/skin/eyelash_extensions.webp',
    color: 'from-rose-500 to-pink-600',
    targetCategory: 'Eye_brow & Lip Care',
    icon: '👁️'
  }
] as const;

export default function ClientSkinPage({ allServices, trendingServices }: ClientSkinPageProps) {
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
    SKIN_SUBCATEGORIES.forEach(cat => {
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-pink-50 safe-area-inset overflow-x-hidden w-full">
      <main className="max-w-7xl mx-auto px-4 py-6 pb-6 md:pb-8 safe-area-inset w-full overflow-x-hidden">

        {/* ── TRENDING ─────────────────────────────────────────────────────── */}
        {trendingServices.length > 0 && (
          <section className="bg-gradient-to-r from-green-50 via-pink-50 to-emerald-50 rounded-2xl p-4 mb-6 border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-full w-10 h-10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">Trending Skin Services</h2>
                  <p className="text-xs text-gray-600">Most booked {trendingServices.length} this week</p>
                </div>
              </div>
              <span className="bg-white text-green-600 text-xs font-bold px-3 py-1 rounded-full border border-green-200">
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
                  accent="green"
                />
              ))}
              <div
                className={`flex-shrink-0 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl border-2 border-dashed border-green-200 flex flex-col items-center justify-center text-center cursor-pointer hover:from-green-200 hover:to-emerald-200 transition-colors group ${
                  isMobile ? 'min-w-[130px] p-3' : 'min-w-[150px] p-4'
                }`}
                onClick={() => document.getElementById('skin-services-start')?.scrollIntoView({ behavior: 'smooth' })}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    document.getElementById('skin-services-start')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">✨</span>
                <p className="font-bold text-gray-800 text-sm">All Services</p>
                <p className="text-xs text-gray-600 mt-0.5">{allServices.length}+ services</p>
                <ArrowRight className="w-4 h-4 text-green-600 mt-1.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </section>
        )}

        {/* ── HORIZONTAL SECTIONS FOR EACH SUBCATEGORY ──────────────────────── */}
        <div id="skin-services-start">
          {SKIN_SUBCATEGORIES.map(category => {
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
                      className="w-8 h-8 rounded-full bg-white border border-green-200 shadow-sm flex items-center justify-center hover:bg-green-50 transition-colors"
                      aria-label={`Scroll left across ${category.title}`}
                    >
                      <ChevronLeft className="w-4 h-4 text-green-600" />
                    </button>
                    <button
                      onClick={() => scrollCategory('right', category.id)}
                      className="w-8 h-8 rounded-full bg-white border border-green-200 shadow-sm flex items-center justify-center hover:bg-green-50 transition-colors"
                      aria-label={`Scroll right across ${category.title}`}
                    >
                      <ChevronRight className="w-4 h-4 text-green-600" />
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
                        locationSlug="skin"
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
        <section className="mb-8" aria-label="Skin consultation tools">
          <h2 className="text-lg font-bold text-gray-800 mb-3 text-center">💫 Discover Your Perfect Skin Care</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowBeautyQuiz(true)}
              className="bg-gradient-to-br from-green-50 to-emerald-100 p-4 rounded-xl hover:shadow-lg transition-all flex flex-col items-center text-center border-2 border-green-200 active:scale-[0.98]"
            >
              <span className="text-3xl mb-2" role="img" aria-label="Quiz">💆‍♀️</span>
              <h3 className="font-bold text-emerald-800 text-sm">Skin Care Quiz</h3>
              <p className="text-xs text-gray-600 mt-1">Apke liye perfect treatments find karo!</p>
              <span className="mt-3 bg-white text-green-600 font-semibold py-1.5 px-3 rounded-full text-xs border border-green-300">Start Quiz</span>
            </button>
            <button
              onClick={() => setShowSkinAnalysis(true)}
              className="bg-gradient-to-br from-emerald-50 to-green-100 p-4 rounded-xl hover:shadow-lg transition-all flex flex-col items-center text-center border-2 border-emerald-200 active:scale-[0.98]"
            >
              <span className="text-3xl mb-2" role="img" aria-label="Analysis">🔬</span>
              <h3 className="font-bold text-emerald-800 text-sm">Skin Analysis</h3>
              <p className="text-xs text-gray-600 mt-1">Personalised skin care advice pao.</p>
              <span className="mt-3 bg-white text-emerald-600 font-semibold py-1.5 px-3 rounded-full text-xs border border-emerald-300">Analyse Skin</span>
            </button>
          </div>
        </section>

        {/* ── WHY CHOOSE US ─────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-r from-green-50 via-pink-50 to-emerald-50 rounded-2xl p-6 mb-6 border border-green-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Why Clients Choose Kritika Salon ✨</h2>

          <div className="flex justify-center mb-5">
            <div className="inline-flex items-center gap-2 bg-white border-2 border-amber-300 text-amber-800 px-4 py-2 rounded-full text-sm font-bold shadow-sm">
              🎓 Lakme Academy Delhi Trained Cosmetologist
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-1" role="img" aria-label="Services">💆‍♀️</div>
              <div className="text-2xl font-bold text-gray-900">{allServices.length}+</div>
              <div className="text-xs text-gray-500">Skin Services</div>
            </div>
            <div className="flex flex-col items-center" itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
              <div className="text-3xl mb-1" role="img" aria-label="Rating">⭐</div>
              <div className="text-2xl font-bold text-gray-900"><span itemProp="ratingValue">4.8</span></div>
              <div className="text-xs text-gray-500"><span itemProp="reviewCount">1800+</span> Reviews</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-1" role="img" aria-label="Clients">👤</div>
              <div className="text-2xl font-bold text-gray-900">1800+</div>
              <div className="text-xs text-gray-500">Happy Clients</div>
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

        {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
        <section className="mb-6" aria-label="Customer testimonials">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Skin Transformations</h2>
          <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide" style={SCROLL_STYLE}>
            <TestimonialCard name="Priya S." text="My skin has never looked better! The diamond facial is pure magic." image="/images/skin/hydrafacial.webp" />
            <TestimonialCard name="Ananya R." text="The laser treatment made me feel like an absolute diva! Flawless work." image="/images/skin/laser_hair_removal.webp" />
            <TestimonialCard name="Maya T." text="Best skin treatment in Patna. My skin is now glowing and full of life." image="/images/skin/diamond_facial.webp" />
          </div>
        </section>

        {/* ── PROMO BANNER ─────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-r from-green-100 via-pink-100 to-emerald-100 rounded-2xl p-6 text-center border border-green-200">
          <div className="inline-flex items-center gap-1.5 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-3">
            ✨ FLASH SALE
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">35% OFF on All Diamond Facials</h3>
          <p className="text-gray-500 text-sm mb-4">Transform, rejuvenate, and save!</p>
          <button
            onClick={() => {
              const facialSection = document.querySelector('[data-category="Facial Spa"]');
              if (facialSection) facialSection.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all"
          >
            Explore Facials <ArrowRight className="w-4 h-4" />
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