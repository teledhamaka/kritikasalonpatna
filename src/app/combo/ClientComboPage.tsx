// app/combo/ClientComboPage.tsx
'use client';

import { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  MapPin, Phone, Sparkles, Zap, Award, Users, Heart, Star, ArrowRight, Clock, Gift, TrendingUp,
} from 'lucide-react';

import { Service } from '../../types/service';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import ServiceCard from '../../components/ServiceCard';

// Dynamic imports for interactive tools
const BeautyQuiz = dynamic(() => import('../../components/BeautyQuiz'), { ssr: false });
const SkinAnalysis = dynamic(() => import('../../components/SkinAnalysis'), { ssr: false });
const TestimonialCard = dynamic(() => import('../../components/TestimonialCard'), { ssr: false });

interface ClientComboPageProps {
  combos: Service[];
}

function getComboUrl(combo: Service): string {
  return combo.url || `/combo/${combo.slug}`;
}

// Horizontal scroll style
const SCROLL_STYLE: React.CSSProperties = {
  WebkitOverflowScrolling: 'touch',
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  overscrollBehaviorX: 'contain',
};

export default function ClientComboPage({ combos }: ClientComboPageProps) {
  const { isLoggedIn } = useAuth();
  const { addToCart } = useBooking();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const [showBeautyQuiz, setShowBeautyQuiz] = useState(false);
  const [showSkinAnalysis, setShowSkinAnalysis] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddToCart = (service: Service) => addToCart(service);
  const navigateToComboPage = (combo: Service) => {
    window.location.href = getComboUrl(combo);
  };

  // Sort combos: bestsellers first, then price low to high
  const sortedCombos = useMemo(() => {
    return [...combos].sort((a, b) => {
      if (a.isBestSeller && !b.isBestSeller) return -1;
      if (!a.isBestSeller && b.isBestSeller) return 1;
      return (a.price || 0) - (b.price || 0);
    });
  }, [combos]);

  // Trending combos = top 6 by bookingCount (if available) or just first 6
  const trendingCombos = useMemo(() => {
    return [...combos]
      .sort((a, b) => (b.bookingCount || 0) - (a.bookingCount || 0))
      .slice(0, 6);
  }, [combos]);

  const hasTrending = trendingCombos.length > 0;

  // Auto-scroll for trending (desktop only)
  const trendingScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = trendingScrollRef.current;
    if (!el || isMobile || trendingCombos.length < 3) return;
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
  }, [trendingCombos.length, isMobile]);

  if (!combos.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <Gift className="w-12 h-12 text-pink-400 mx-auto mb-3" />
          <p className="text-gray-500">No combo packages available right now.</p>
          <p className="text-sm text-gray-400">Check back soon for exciting deals!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 safe-area-inset overflow-x-hidden w-full">
      <main className="max-w-7xl mx-auto px-4 py-6 pb-32 md:pb-8 safe-area-inset w-full overflow-x-hidden">

        {/* ========== TRENDING COMBOS SECTION ========== */}
        {hasTrending && (
          <section className="bg-gradient-to-r from-yellow-50 via-pink-50 to-purple-50 rounded-2xl p-4 mb-6 border border-pink-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-full w-10 h-10 flex items-center justify-center animate-pulse">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">Trending Combo Packages</h2>
                  <p className="text-xs text-gray-600">Most booked combos this week</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-white text-pink-600 text-xs font-bold px-3 py-1 rounded-full border border-pink-200">
                  {trendingCombos.length} Trending
                </span>
              </div>
            </div>

            <div
              ref={trendingScrollRef}
              className={`flex pb-3 mb-4 ${isMobile ? 'overflow-x-auto space-x-4 scrollbar-hide' : 'overflow-hidden space-x-4'}`}
              style={SCROLL_STYLE}
            >
              {trendingCombos.map((combo, idx) => {
                const savings = combo.originalPrice ? combo.originalPrice - combo.price : 0;
                const title = combo.title.split('|')[0].trim();
                return (
                  <div
                    key={combo.id}
                    className={`flex-shrink-0 bg-white rounded-xl border border-pink-100 shadow-sm hover:shadow-md transition-shadow group ${
                      isMobile ? 'min-w-[200px] max-w-[200px] p-3' : 'min-w-[220px] max-w-[220px] p-3 hover:scale-[1.02]'
                    }`}
                  >
                    <div className="relative aspect-[4/5] w-full rounded-lg overflow-hidden mb-2 cursor-pointer" onClick={() => navigateToComboPage(combo)}>
                      <Image
                        src={combo.image || '/images/placeholder.jpg'}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {combo.isBestSeller && (
                        <span className="absolute top-2 left-2 z-10 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
                          <Star className="w-3 h-3 fill-white" /> Best Seller
                        </span>
                      )}
                      {savings > 0 && (
                        <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                          Save ₹{savings}
                        </span>
                      )}
                      <span className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {combo.rating?.toFixed(1) || '4.5'}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-1 cursor-pointer hover:text-pink-600" onClick={() => navigateToComboPage(combo)}>
                      {title}
                    </h3>
                    <p className="text-gray-600 text-xs line-clamp-2 mb-2">{combo.shortDescription || combo.description?.slice(0, 60)}…</p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex flex-col">
                        <span className="font-bold text-pink-600 text-base">₹{combo.price}</span>
                        {combo.originalPrice && combo.originalPrice > combo.price && (
                          <span className="text-gray-400 text-xs line-through">₹{combo.originalPrice}</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {combo.durationText || `${combo.duration || 60} min`}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddToCart(combo)}
                      className="w-full mt-2 py-2 text-sm bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium rounded-lg hover:from-pink-600 hover:to-rose-600 transition shadow-sm flex items-center justify-center gap-1"
                    >
                      Add to Cart <Heart className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
              {/* View All card */}
              <div
                className={`flex-shrink-0 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl border-2 border-dashed border-pink-200 flex flex-col items-center justify-center text-center cursor-pointer hover:from-pink-200 hover:to-purple-200 transition group ${
                  isMobile ? 'min-w-[160px] p-4' : 'min-w-[180px] p-4'
                }`}
                onClick={() => window.location.href = '/combo'}
              >
                <span className="text-4xl mb-2 group-hover:scale-110 transition">🔥</span>
                <p className="font-bold text-gray-800 text-base">All Combos</p>
                <p className="text-xs text-gray-600 mt-1">{combos.length}+ packages</p>
                <ArrowRight className="w-5 h-5 text-pink-600 mt-2 group-hover:translate-x-1 transition" />
              </div>
            </div>

            {/* Visit & Call Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              <div className="bg-white rounded-xl p-3 flex items-center justify-between border border-pink-100 shadow-sm hover:shadow-md transition">
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
              <div className="bg-white rounded-xl p-3 flex items-center justify-between border border-pink-100 shadow-sm hover:shadow-md transition">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-pink-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-700 text-sm truncate">Call Us</p>
                    <a href="tel:+919650461390" className="text-xs text-gray-500 block hover:text-pink-600">+91-9650461390</a>
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
                <Zap className="mr-2 text-pink-600" /> Discover Your Perfect Combo
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setShowBeautyQuiz(true)} className="bg-gradient-to-br from-pink-50 to-purple-100 p-4 rounded-xl hover:shadow-xl transition flex flex-col items-center text-center border-2 border-pink-200">
                  <span className="text-3xl mb-2">💫</span>
                  <h3 className="font-bold text-purple-800 text-base">Beauty Profile Quiz</h3>
                  <p className="text-xs text-gray-600 mt-1">Find the best combo for you!</p>
                  <span className="mt-3 bg-white text-pink-600 font-semibold py-1.5 px-3 rounded-full text-xs border border-pink-300">Start Quiz</span>
                </button>
                <button onClick={() => setShowSkinAnalysis(true)} className="bg-gradient-to-br from-purple-50 to-pink-100 p-4 rounded-xl hover:shadow-xl transition flex flex-col items-center text-center border-2 border-purple-200">
                  <span className="text-3xl mb-2">✨</span>
                  <h3 className="font-bold text-purple-800 text-base">AI Skin Analysis</h3>
                  <p className="text-xs text-gray-600 mt-1">Get personalised combo advice.</p>
                  <span className="mt-3 bg-white text-purple-600 font-semibold py-1.5 px-3 rounded-full text-xs border border-purple-300">Analyse Skin</span>
                </button>
              </div>
            </section>
          </section>
        )}

        {/* ========== ALL COMBO GRID (with heading) ========== */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Gift className="w-6 h-6 text-pink-600" />
              <h2 className="text-xl font-bold text-gray-800">All Combo Packages</h2>
            </div>
            <p className="text-sm text-pink-600">{combos.length} combos available</p>
          </div>
          <div className="mb-4 bg-gradient-to-r from-amber-50 to-pink-50 rounded-xl p-3 border-l-4 border-pink-500">
            <p className="text-sm text-gray-700">🎁 Save more with our specially curated combo packages — makeup, hair, skin & nails at discounted prices!</p>
          </div>
          {isMobile ? (
            <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide" style={SCROLL_STYLE}>
              {sortedCombos.map(combo => (
                <div key={combo.id} className="min-w-[280px] border-2 border-pink-200 rounded-xl overflow-hidden bg-white">
                  <ServiceCard
                    service={combo}
                    isFavorite={favorites.has(combo.id)}
                    onToggleFavorite={() => toggleFavorite(combo.id)}
                    onAddToCart={() => handleAddToCart(combo)}
                    onViewDetails={() => navigateToComboPage(combo)}
                    variant="compact"
                    showBestSellerBadge={combo.isBestSeller === true}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {sortedCombos.map(combo => (
                <div key={combo.id} className="border-2 border-pink-200 rounded-xl overflow-hidden bg-white">
                  <ServiceCard
                    service={combo}
                    isFavorite={favorites.has(combo.id)}
                    onToggleFavorite={() => toggleFavorite(combo.id)}
                    onAddToCart={() => handleAddToCart(combo)}
                    onViewDetails={() => navigateToComboPage(combo)}
                    variant="detailed"
                    showBestSellerBadge={combo.isBestSeller === true}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ========== WHY CHOOSE OUR COMBOS ========== */}
        <section className="bg-gradient-to-r from-pink-100 via-purple-100 to-rose-100 rounded-2xl p-6 mb-6 border-2 border-pink-200">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Why Choose Our Combo Packages?</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center">
              <Sparkles className="w-8 h-8 text-purple-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">{combos.length}+</div>
              <div className="text-xs text-gray-600">Curated Combos</div>
            </div>
            <div className="flex flex-col items-center">
              <Award className="w-8 h-8 text-pink-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">Save 20-30%</div>
              <div className="text-xs text-gray-600">Compared to individual</div>
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

        {/* ========== TESTIMONIALS (for combos) ========== */}
        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">What Our Combo Clients Say</h2>
          <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide" style={SCROLL_STYLE}>
            <TestimonialCard name="Priya S." text="The bridal combo saved me so much money and my skin looked perfect!" image="/images/skin/hydrafacial.webp" />
            <TestimonialCard name="Ananya R." text="Makeup + hair combo was a lifesaver for my engagement party." image="/images/makeup/bridal_makeup.webp" />
            <TestimonialCard name="Maya T." text="I loved the party glam combo – got ready in under 2 hours!" image="/images/hair/hair_spa.webp" />
          </div>
        </section>

        {/* ========== SPECIAL OFFER BANNER ========== */}
        <section className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl p-6 text-center border-2 border-pink-200">
          <div className="inline-flex items-center bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full mb-2">
            <Zap className="mr-1 w-3 h-3" /> SPECIAL OFFER
          </div>
          <h2 className="text-lg font-bold text-gray-800">Combo Exclusive: Extra 10% Off on First Booking</h2>
          <p className="text-sm text-gray-600 mt-1">Use code: GLOWCOMBO at checkout. Valid for new clients.</p>
        </section>
      </main>

      {/* Modals */}
      {showBeautyQuiz && <BeautyQuiz onClose={() => setShowBeautyQuiz(false)} />}
      {showSkinAnalysis && <SkinAnalysis onClose={() => setShowSkinAnalysis(false)} />}
    </div>
  );
}