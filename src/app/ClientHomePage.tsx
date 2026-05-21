"use client";

import { useState, useRef, useDeferredValue, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  MapPin, Sparkles, Zap, Phone, Award,
  TrendingUp, Users, Heart, ArrowRight, Gift,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { HomepageService } from '../types/HomepageService';
import { useAuth }    from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import ServiceSkeleton from '../components/ServiceSkeleton';
import TrendingCard   from '../components/TrendingCard';
import ServiceCard    from '../components/ServiceCard';
import { useIsMobile }    from '../hooks/useIsMobile';
import { useAutoScroll }  from '../hooks/useAutoScroll';
import { SCROLL_STYLE }   from '../constants/ui';
import { getServiceUrl }  from '../utils/serviceUrl';

const BeautyQuiz      = dynamic(() => import('../components/BeautyQuiz'),              { ssr: false });
const SkinAnalysis    = dynamic(() => import('../components/SkinAnalysis'),            { ssr: false });
const LoginModal      = dynamic(() => import('../components/LoginModal'),              { ssr: false });
const BookingFlow     = dynamic(() => import('../components/booking/BookingFlow'),     { ssr: false });
const TestimonialCard = dynamic(() => import('../components/TestimonialCard'),         { ssr: false });

const HORIZONTAL_CATEGORIES = [
  { id: 'combo',  title: 'Combo Packages',  description: 'Complete packages, best savings', image: '/images/combos/korean-glass-skin.webp',   link: '/combo'                 },
  { id: 'bridal', title: 'Bridal Makeup',   description: 'Complete bridal packages',        image: '/images/makeup/complete_bridal_package.webp',  link: '/bridal' },
  { id: 'makeup', title: 'Makeup Services', description: 'HD, airbrush & party looks',      image: '/images/makeup/matte_hd_makeup.webp',  link: '/makeup'                 },
  { id: 'hair',   title: 'Hair Treatments', description: 'Spa, keratin, coloring',          image: '/images/hair/nano_plastia.webp',    link: '/hair'                   },
  { id: 'skin',   title: 'Skin Care',       description: 'Facials, hydrafacial & more',     image: '/images/skin/hydrafacial.webp',     link: '/skin'                   },
  { id: 'nails',  title: 'Nail Art',        description: 'Manicure & extensions',           image: '/images/nails/bridal_luxury_nail.webp',   link: '/nails'                  },
] as const;

interface ClientHomePageProps {
  trendingServices: HomepageService[];
  comboServices:    HomepageService[];
  bridalServices:   HomepageService[];
  topServices: {
    makeup: HomepageService[];
    hair:   HomepageService[];
    skin:   HomepageService[];
    nails:  HomepageService[];
  };
  localSeoPaths?: string[];
  categorySeoPaths?: string[];
}

export default function ClientHomePage({
  trendingServices,
  comboServices,
  bridalServices,
  topServices,
  localSeoPaths = [],
  categorySeoPaths = [],
}: ClientHomePageProps) {
  const router   = useRouter();
  const { isLoggedIn }  = useAuth();
  const { addToCart }   = useBooking();

  const [favorites,       setFavorites]       = useState<Set<string>>(new Set());
  const [showBeautyQuiz,  setShowBeautyQuiz]  = useState(false);
  const [showSkinAnalysis,setShowSkinAnalysis]= useState(false);
  const [showLoginModal,  setShowLoginModal]  = useState(false);
  const [bookingStep,     setBookingStep]     = useState<'browsing' | 'booking'>('browsing');

  const trendingScrollRef  = useRef<HTMLDivElement>(null);
  const categoryScrollRef  = useRef<HTMLDivElement>(null);
  const deferredFavorites  = useDeferredValue(favorites);

  const isMobile = useIsMobile();
  useAutoScroll(trendingScrollRef, { enabled: !isMobile && trendingServices.length >= 3 });

  const scrollCategories = (direction: 'left' | 'right') => {
    const el = categoryScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === 'left' ? -(isMobile ? 220 : 320) : (isMobile ? 220 : 320), behavior: 'smooth' });
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const handleAddToCart = (service: HomepageService) => {
    addToCart({
      id: service.id,
      title: service.title,
      price: service.price,
      image: service.image || '/images/placeholder.webp'
    } as any); 
  };

  // Helper formatting logic to convert dynamic paths into highly readable crawler keywords
  const formatPathLabel = (path: string) => {
    return path
      .replace(/^\//, '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  if (bookingStep === 'booking') {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><ServiceSkeleton /></div>}>
        <BookingFlow onBack={() => setBookingStep('browsing')} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 safe-area-inset overflow-x-hidden w-full">
      <main className="max-w-7xl mx-auto px-4 py-6 pb-6 md:pb-8 safe-area-inset w-full overflow-x-hidden">

        {/* ── TRENDING SECTION ─────────────────────────────────────────────── */}
        {trendingServices.length > 0 && (
          <section className="bg-gradient-to-r from-yellow-50 via-pink-50 to-purple-50 rounded-2xl p-4 mb-6 border border-pink-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-full w-10 h-10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">Trending Services</h2>
                  <p className="text-xs text-gray-600">Most booked {trendingServices.length} services this week</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-white text-pink-600 text-xs font-bold px-3 py-1 rounded-full border border-pink-200">
                  {trendingServices.length} Trending
                </span>
                <Link href="/trending" prefetch className="hidden md:flex items-center text-pink-600 text-sm font-medium hover:underline">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>

            <div
              ref={trendingScrollRef}
              className={`flex pb-3 mb-4 ${isMobile ? 'overflow-x-auto space-x-3 scrollbar-hide' : 'overflow-hidden space-x-3'}`}
              style={SCROLL_STYLE}
            >
              {trendingServices.map((service, idx) => (
                <TrendingCard
                  key={service.id}
                  service={service}
                  href={getServiceUrl(service)}
                  onAddToCart={e => { e.preventDefault(); handleAddToCart(service); }}
                  isMobile={isMobile}
                  priority={idx === 0}
                  accent="pink"
                />
              ))}
              
              <Link
                href="/trending"
                prefetch
                className={`flex-shrink-0 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl border-2 border-dashed border-pink-200 flex flex-col items-center justify-center text-center cursor-pointer hover:from-pink-200 hover:to-purple-200 transition-colors group ${
                  isMobile ? 'min-w-[130px] p-3' : 'min-w-[150px] p-4'
                }`}
              >
                <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">🔥</span>
                <p className="font-bold text-gray-800 text-sm">View All</p>
                <p className="text-xs text-gray-600 mt-0.5">{trendingServices.length}+ services</p>
                <ArrowRight className="w-4 h-4 text-pink-600 mt-1.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-3 flex items-center justify-between border border-pink-100 shadow-sm">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-pink-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-700 text-sm truncate">Visit Us</p>
                    <p className="text-xs text-gray-500 truncate">Near Bhootnath Metro Station, Patna</p>
                  </div>
                </div>
                <a
                  href="https://maps.google.com/?q=Kritika+Ladies+Beauty+Parlour+Patna"
                  target="_blank" rel="noopener noreferrer"
                  className="text-pink-600 text-sm font-medium hover:underline whitespace-nowrap ml-2"
                >
                  Directions →
                </a>
              </div>
              <div className="bg-white rounded-xl p-3 flex items-center justify-between border border-pink-100 shadow-sm">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-pink-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-700 text-sm truncate">Call Us</p>
                    <a href="tel:+919650461390" className="text-xs text-gray-500 hover:text-pink-600">+91-9650461390</a>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-xs text-gray-500">9AM–8PM</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-green-600 font-medium">Open Now</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── BEAUTY DISCOVERY TOOLS ──────────────────────────────────────── */}
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3 text-center flex items-center justify-center gap-2">
            <Zap className="w-5 h-5 text-pink-600" /> Apna Perfect Look Discover Karo
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowBeautyQuiz(true)}
              className="bg-gradient-to-br from-pink-50 to-purple-100 p-4 rounded-xl hover:shadow-lg transition-all flex flex-col items-center text-center border-2 border-pink-200 active:scale-[0.98]"
            >
              <span className="text-3xl mb-2">💫</span>
              <h3 className="font-bold text-purple-800 text-sm">Beauty Profile Quiz</h3>
              <p className="text-xs text-gray-600 mt-1">Apke liye perfect services find karo!</p>
              <span className="mt-3 bg-white text-pink-600 font-semibold py-1.5 px-3 rounded-full text-xs border border-pink-300">Start Quiz</span>
            </button>
            <button
              onClick={() => setShowSkinAnalysis(true)}
              className="bg-gradient-to-br from-purple-50 to-pink-100 p-4 rounded-xl hover:shadow-lg transition-all flex flex-col items-center text-center border-2 border-purple-200 active:scale-[0.98]"
            >
              <span className="text-3xl mb-2">✨</span>
              <h3 className="font-bold text-purple-800 text-sm">AI Skin Analysis</h3>
              <p className="text-xs text-gray-600 mt-1">Personalised skin care advice pao.</p>
              <span className="mt-3 bg-white text-purple-600 font-semibold py-1.5 px-3 rounded-full text-xs border border-purple-300">Analyse Skin</span>
            </button>
          </div>
        </section>

        {/* ── TRENDING CATEGORIES ── */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-pink-600" />
              <h2 className="text-lg font-bold text-gray-800">Trending Categories</h2>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <button onClick={() => scrollCategories('left')}  className="w-9 h-9 rounded-full bg-white border border-pink-100 shadow-sm flex items-center justify-center hover:bg-pink-50 transition-colors" aria-label="Scroll left">←</button>
              <button onClick={() => scrollCategories('right')} className="w-9 h-9 rounded-full bg-white border border-pink-100 shadow-sm flex items-center justify-center hover:bg-pink-50 transition-colors" aria-label="Scroll right">→</button>
            </div>
          </div>
          <div
            ref={categoryScrollRef}
            className="flex overflow-x-auto scrollbar-hide space-x-3 pb-2 snap-x snap-mandatory"
            style={SCROLL_STYLE}
          >
            {HORIZONTAL_CATEGORIES.map(cat => (
              <Link
                key={cat.id}
                href={cat.link}
                prefetch
                className="snap-start flex-shrink-0 w-[115px] md:w-[130px] bg-white rounded-2xl p-3 text-left shadow-sm hover:shadow-md transition-all active:scale-[0.98] border border-pink-100"
              >
                <div className="relative w-14 h-14 mx-auto rounded-full overflow-hidden mb-2 shadow-sm">
                  <Image src={cat.image} alt={cat.title} width={56} height={56} className="object-cover w-full h-full" />
                </div>
                <h3 className="font-bold text-gray-800 text-sm text-center leading-tight line-clamp-2">{cat.title}</h3>
                <p className="hidden md:block text-gray-500 text-[10px] mt-1 text-center leading-snug line-clamp-2">{cat.description}</p>
                <div className="mt-2 flex justify-center">
                  <span className="inline-flex items-center text-[10px] font-medium text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">
                    View More <ArrowRight className="w-3 h-3 ml-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── COMBO PACKAGES ── */}
        {comboServices.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-pink-600" />
                <h2 className="text-lg font-bold text-gray-800">Popular Combo Packages</h2>
              </div>
              <Link href="/combo" prefetch className="text-pink-600 text-sm font-medium flex items-center gap-1 hover:underline">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="mb-3 bg-gradient-to-r from-amber-50 to-pink-50 rounded-xl p-3 border-l-4 border-pink-500">
              <p className="text-sm text-gray-700">🎁 Save more with combo packages — makeup, hair, skin & nails at discounted prices!</p>
            </div>
            <div className={`${isMobile ? 'grid grid-cols-2 gap-3' : 'grid grid-cols-2 lg:grid-cols-4 gap-4'}`}>
              {comboServices.map((service, idx) => (
                <div key={service.id} className="border-2 border-pink-200 rounded-xl overflow-hidden bg-white">
                  <ServiceCard
                    service={service as any}
                    isFavorite={deferredFavorites.has(service.id)}
                    onToggleFavorite={() => toggleFavorite(service.id)}
                    onAddToCart={() => handleAddToCart(service)}
                    variant={isMobile ? 'compact' : 'detailed'}
                    priority={idx === 0}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── BESTSELLER BRIDAL ── */}
        {bridalServices.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-600" />
                <h2 className="text-lg font-bold text-gray-800">Bestseller Bridal Services</h2>
              </div>
              <Link href="/makeup?category=bridal" prefetch className="text-pink-600 text-sm font-medium flex items-center gap-1 hover:underline">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="flex overflow-x-auto scrollbar-hide space-x-3 pb-2 snap-x snap-mandatory" style={SCROLL_STYLE}>
              {bridalServices.map((service, idx) => (
                <div key={service.id} className="snap-start flex-shrink-0 w-[175px] md:w-[200px]">
                  <ServiceCard
                    service={service as any}
                    isFavorite={deferredFavorites.has(service.id)}
                    onToggleFavorite={() => toggleFavorite(service.id)}
                    onAddToCart={() => handleAddToCart(service)}
                    variant="compact"
                    priority={idx === 0}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── TOP SERVICES ── */}
        {[
          { key: 'makeup', label: 'Makeup', icon: '💄', link: '/makeup', services: topServices.makeup },
          { key: 'hair',   label: 'Hair',   icon: '💇‍♀️', link: '/hair',   services: topServices.hair   },
          { key: 'skin',   label: 'Skin',   icon: '✨',   link: '/skin',   services: topServices.skin   },
          { key: 'nails',  label: 'Nails',  icon: '💅',   link: '/nails',  services: topServices.nails  },
        ].map(cat => cat.services.length === 0 ? null : (
          <section key={cat.key} className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="text-2xl">{cat.icon}</span>
                Top {cat.label} Services
              </h2>
              <Link href={cat.link} prefetch className="text-pink-600 text-sm font-medium flex items-center gap-1 hover:underline">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="flex overflow-x-auto scrollbar-hide space-x-3 pb-2 snap-x snap-mandatory" style={SCROLL_STYLE}>
              {cat.services.map((service, idx) => (
                <div key={service.id} className="snap-start flex-shrink-0 w-[175px] md:w-[200px]">
                  <ServiceCard
                    service={service as any}
                    isFavorite={deferredFavorites.has(service.id)}
                    onToggleFavorite={() => toggleFavorite(service.id)}
                    onAddToCart={() => handleAddToCart(service)}
                    variant="compact"
                    priority={idx === 0}
                  />
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* ── WHY CHOOSE US ── */}
        <section className="bg-gradient-to-r from-pink-100 via-purple-100 to-rose-100 rounded-2xl p-6 mb-6 border-2 border-pink-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Why Choose Kritika Ladies Beauty Parlour?</h2>

          <div className="flex justify-center mb-5">
            <div className="inline-flex items-center gap-2 bg-white border-2 border-amber-300 text-amber-800 px-4 py-2 rounded-full text-sm font-bold shadow-sm">
              🎓 Lakme Academy Delhi Trained Cosmetologist
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center">
              <Sparkles className="w-8 h-8 text-purple-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">
                {topServices.makeup.length + topServices.hair.length + topServices.skin.length + topServices.nails.length + comboServices.length}+
              </div>
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

        {/* ── TESTIMONIALS ── */}
        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Glow-ups & Stories</h2>
          <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide" style={SCROLL_STYLE}>
            <TestimonialCard name="Priya S."   text="My skin has never looked better! The diamond facial is pure magic."                   image="/images/skin/hydrafacial.webp" />
            <TestimonialCard name="Ananya R."  text="The bridal makeup team made me feel like an absolute princess on my big day!"         image="/images/makeup/bridal_makeup.webp" />
            <TestimonialCard name="Maya T."    text="Best hair spa in town. My damaged hair is now silky smooth."                          image="/images/hair/hair_spa.webp" />
          </div>
        </section>

        {/* ── PROMO BANNER ── */}
        <section className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl p-6 text-center border-2 border-pink-200 mb-10">
          <div className="inline-flex items-center bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full mb-2">
            <Zap className="mr-1 w-3 h-3" /> SPECIAL OFFER
          </div>
          <h2 className="text-lg font-bold text-gray-800">30% OFF On All Bridal Packages</h2>
          <p className="text-sm text-gray-600 mt-1">Book your trial now and save big!</p>
        </section>

        {/* ── PROGRAMMATIC LOCAL & CATEGORY SEO MATRIX FOOTER ── */}
        <footer className="mt-12 pt-8 border-t border-pink-100 bg-white rounded-2xl p-6 shadow-inner">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Column 1: Localized Service Paths Index */}
            {localSeoPaths.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-pink-500" /> Popular Services Near Landmarks (Patna)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {localSeoPaths.map((path) => (
                    <Link
                      key={path}
                      href={path}
                      className="text-xs text-gray-600 hover:text-pink-600 hover:underline transition-colors py-1 block truncate"
                      title={`Book services near ${formatPathLabel(path).split('Near')[1] || 'your area'}`}
                    >
                      📍 {formatPathLabel(path)}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Column 2: Core Dedicated Categories Index */}
            {categorySeoPaths.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" /> Premium Specialized Categories
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {categorySeoPaths.map((path) => (
                    <Link
                      key={path}
                      href={path}
                      className="text-xs text-gray-600 hover:text-purple-600 hover:underline font-medium transition-colors py-1 block"
                    >
                      ✨ {formatPathLabel(path)} Services
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
          </div>
          
          <div className="mt-8 pt-4 border-t border-gray-100 text-center">
            <p className="text-[11px] text-gray-400">
              © {new Date().getFullYear()} Kritika Ladies Beauty Parlour. Programmatic Hyperlocal Index Matrix mapped for internal route optimization.
            </p>
          </div>
        </footer>

      </main>

      {/* Modals */}
      {showBeautyQuiz    && <BeautyQuiz    onClose={() => setShowBeautyQuiz(false)} />}
      {showSkinAnalysis  && <SkinAnalysis  onClose={() => setShowSkinAnalysis(false)} />}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={() => { setShowLoginModal(false); setBookingStep('booking'); }}
        onSkipToHome={() => setShowLoginModal(false)}
      />
    </div>
  );
}