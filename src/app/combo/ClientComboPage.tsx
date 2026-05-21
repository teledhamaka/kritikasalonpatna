// app/combo/ClientComboPage.tsx
'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import {
  MapPin, Phone, Sparkles, Zap, Award, Users, Heart, Star, 
  ArrowRight, Clock, Gift, TrendingUp, SlidersHorizontal, Search, X, CheckCircle2
} from 'lucide-react';

import { Service } from '../../types'; // Points directly to verified index types
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import ServiceCard from '../../components/ServiceCard';

// Dynamic sub-components to protect hydration metrics
const BeautyQuiz = dynamic(() => import('../../components/BeautyQuiz'), { ssr: false });
const SkinAnalysis = dynamic(() => import('../../components/SkinAnalysis'), { ssr: false });
const TestimonialCard = dynamic(() => import('../../components/TestimonialCard'), { ssr: false });

interface ClientComboPageProps {
  combos: Service[];
}

function getComboUrl(combo: Service): string {
  return combo.url || `/combo/${combo.slug}`;
}

const SCROLL_STYLE: React.CSSProperties = {
  WebkitOverflowScrolling: 'touch',
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  overscrollBehaviorX: 'contain',
};

export default function ClientComboPage({ combos }: ClientComboPageProps) {
  const { isLoggedIn } = useAuth();
  const { addToCart, cart } = useBooking();
  
  // State Ecosystem
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState<number>(15000);
  const [sortBy, setSortBy] = useState<'recommended' | 'price-low' | 'price-high' | 'popular'>('recommended');
  
  const [isMobile, setIsMobile] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showBeautyQuiz, setShowBeautyQuiz] = useState(false);
  const [showSkinAnalysis, setShowSkinAnalysis] = useState(false);

  // Responsiveness tracker
  useEffect(() => {
    const checkMobile = () => window.innerWidth < 768;
    setIsMobile(checkMobile());
    const handleResize = () => setIsMobile(checkMobile());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Synchronize dynamic local storage for favorites securely
  useEffect(() => {
    const stored = localStorage.getItem('fav_combos');
    if (stored) {
      try { setFavorites(new Set(JSON.parse(stored))); } catch (e) { console.error(e); }
    }
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem('fav_combos', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const handleAddToCart = (service: Service) => addToCart(service);
  const navigateToComboPage = (combo: Service) => {
    window.location.href = getComboUrl(combo);
  };

  // Derive absolute bounds from data array
  const maxPriceInData = useMemo(() => {
    if (!combos.length) return 15000;
    return Math.max(...combos.map(c => c.price || 0), 500);
  }, [combos]);

  useEffect(() => {
    setPriceRange(maxPriceInData);
  }, [maxPriceInData]);

  // Extract all distinct internal category tags dynamically
  const filterCategories = useMemo(() => {
    const sets = new Set<string>();
    combos.forEach(c => {
      if (c.category) sets.add(c.category);
      if (c.tags) c.tags.forEach(t => sets.add(t));
    });
    return ['all', ...Array.from(sets)];
  }, [combos]);

  // Top trending logic hook
  const trendingCombos = useMemo(() => {
    return [...combos]
      .sort((a, b) => (b.bookingCount || 0) - (a.bookingCount || 0))
      .slice(0, 6);
  }, [combos]);

  // Advanced Filtering, Searching & Sorting Pipeline
  const filteredAndSortedCombos = useMemo(() => {
    let result = [...combos];

    // 1. Text Search Filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.title.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        (c.seoKeywords && c.seoKeywords.some(k => k.toLowerCase().includes(q)))
      );
    }

    // 2. Category / Tag Navigation Selection
    if (selectedCategory !== 'all') {
      result = result.filter(c => 
        c.category === selectedCategory || 
        (c.tags && c.tags.includes(selectedCategory))
      );
    }

    // 3. Price Cap Control
    result = result.filter(c => (c.price || 0) <= priceRange);

    // 4. Sort Directives
    result.sort((a, b) => {
      if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'popular') return (b.bookingCount || 0) - (a.bookingCount || 0);
      
      // Default: Bestsellers priority flag ranking pattern
      if (a.isBestSeller && !b.isBestSeller) return -1;
      if (!a.isBestSeller && b.isBestSeller) return 1;
      return (b.rating || 0) - (a.rating || 0);
    });

    return result;
  }, [combos, searchQuery, selectedCategory, priceRange, sortBy]);

  // Infinite Scroll Slider Animation Controller Engine (Desktop)
  const trendingScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = trendingScrollRef.current;
    if (!el || isMobile || trendingCombos.length < 3) return;
    let rafId: number;
    let direction = 1;
    let position = el.scrollLeft;
    let isPaused = false;
    let lastTs = 0;
    const SPEED = 35; // Pixels per second smooth crawl

    const tick = (ts: number) => {
      const delta = lastTs ? Math.min(ts - lastTs, 64) : 0;
      lastTs = ts;
      if (!isPaused) {
        const max = el.scrollWidth - el.clientWidth;
        if (position >= max - 5) direction = -1;
        else if (position <= 5) direction = 1;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 safe-area-inset overflow-x-hidden w-full">
      
      {/* HERO BANNER DECK */}
      <div className="relative bg-gradient-to-r from-purple-900 to-pink-800 text-white overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-[url('/images/pattern-bg.png')] opacity-10 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 py-10 md:py-16 text-center relative z-10">
          <span className="bg-pink-500/30 text-pink-200 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border border-pink-400/30 inline-flex items-center gap-1 mb-4">
            <Gift className="w-3.5 h-3.5" /> Complete Makeover Bundles
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3">
            Premium Beauty Combos, <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-200">Guaranteed Savings</span>
          </h1>
          <p className="text-purple-100 max-w-2xl mx-auto text-sm md:text-base mb-6">
            Expertly crafted packages combining hair transformations, rejuvenating skin facials, and luxury salon styling. Save up to 30% over standalone services!
          </p>
          <div className="flex justify-center gap-3 text-xs md:text-sm font-semibold">
            <div className="bg-white/10 backdrop-blur-xs px-4 py-2 rounded-xl flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Professional Products
            </div>
            <div className="bg-white/10 backdrop-blur-xs px-4 py-2 rounded-xl flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Customized Options
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-pink-50 to-transparent"></div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6 pb-32 md:pb-12 w-full">
        
        {/* ==================== SECTION 1: TRENDING AUTO-SCROLL CAROUSEL ==================== */}
        {trendingCombos.length > 0 && (
          <section className="bg-gradient-to-r from-amber-50/70 via-pink-50/60 to-purple-50/70 rounded-2xl p-4 mb-8 border border-pink-200/60 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl w-9 h-9 flex items-center justify-center shadow-sm">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-base md:text-lg">Patna's Most-Booked Combos</h2>
                  <p className="text-xs text-gray-500">The trendiest luxury packages this week</p>
                </div>
              </div>
              <span className="bg-white text-pink-600 text-xs font-bold px-3 py-1 rounded-full border border-pink-100 shadow-sm">
                Top Picks
              </span>
            </div>

            <div
              ref={trendingScrollRef}
              className={`flex pb-2 ${isMobile ? 'overflow-x-auto space-x-4 scrollbar-hide' : 'overflow-hidden space-x-4'}`}
              style={SCROLL_STYLE}
            >
              {trendingCombos.map((combo) => {
                const savings = combo.originalPrice ? combo.originalPrice - combo.price : 0;
                const title = combo.title.split('|')[0].trim();
                return (
                  <div
                    key={`trending-${combo.id}`}
                    className="flex-shrink-0 bg-white rounded-xl border border-pink-100 p-3 shadow-sm hover:shadow-md transition-all duration-300 group min-w-[220px] max-w-[220px]"
                  >
                    <div 
                      className="relative aspect-[4/5] w-full rounded-lg overflow-hidden mb-2 cursor-pointer" 
                      onClick={() => navigateToComboPage(combo)}
                    >
                      <Image
                        src={combo.image || '/images/placeholder.jpg'}
                        alt={title}
                        fill
                        sizes="220px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {combo.isBestSeller && (
                        <span className="absolute top-2 left-2 z-10 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-white" /> Best Value
                        </span>
                      )}
                      {savings > 0 && (
                        <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                          Save ₹{savings}
                        </span>
                      )}
                    </div>
                    <h3 
                      className="font-bold text-gray-800 text-xs line-clamp-1 mb-1 cursor-pointer hover:text-pink-600 transition-colors" 
                      onClick={() => navigateToComboPage(combo)}
                    >
                      {title}
                    </h3>
                    <p className="text-gray-500 text-[11px] line-clamp-2 mb-2 min-h-[32px]">
                      {combo.shortDescription || combo.description?.slice(0, 50)}...
                    </p>
                    <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-gray-50">
                      <div className="flex flex-col">
                        <span className="font-extrabold text-pink-600 text-sm">₹{combo.price}</span>
                        {combo.originalPrice && combo.originalPrice > combo.price && (
                          <span className="text-gray-400 text-[10px] line-through">₹{combo.originalPrice}</span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" /> {combo.durationText || `${combo.duration || 60}m`}
                      </span>
                    </div>
                    <button
                      onClick={() => handleAddToCart(combo)}
                      className="w-full mt-2.5 py-1.5 text-xs bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium rounded-lg hover:from-pink-600 hover:to-rose-600 transition shadow-xs flex items-center justify-center gap-1"
                    >
                      Add to Basket
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ==================== SECTION 2: SMART SEARCH & PARAMETRIC FILTERS ==================== */}
        <section className="bg-white rounded-2xl border border-gray-200/80 p-4 mb-6 shadow-xs">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            
            {/* Live Search Inputs */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search premium combos (e.g., Bridal, Hair spa, Facial)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-8 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Controls Row */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-gray-700 text-xs font-medium rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 cursor-pointer"
              >
                <option value="recommended">Recommended Picks</option>
                <option value="popular">Most Booked</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition border ${
                  showFilters 
                    ? 'bg-pink-50 text-pink-600 border-pink-200' 
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
              </button>
            </div>
          </div>

          {/* Expandable Slider Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
              <div>
                {/* Fixed line 360: Replaced competing display rules with a unified layout strategy */}
                <label className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1.5">
                  <span>Max Budget Control:</span>
                  <span className="text-pink-600 font-extrabold text-sm">₹{priceRange}</span>
                </label>
                <input
                  type="range"
                  min="300"
                  max={maxPriceInData}
                  step="100"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-pink-500 bg-gray-200 rounded-lg h-1.5 appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>₹300</span>
                  <span>₹{maxPriceInData}</span>
                </div>
              </div>

              <div className="flex flex-col justify-end">
                <button
                  onClick={() => {
                    setPriceRange(maxPriceInData);
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setSortBy('recommended');
                  }}
                  className="text-xs text-gray-500 hover:text-pink-600 underline text-left md:text-right mt-2 md:mt-0"
                >
                  Reset All Dynamic Settings
                </button>
              </div>
            </div>
          )}

          {/* Dynamic Tags Filter Rail */}
          <div className="flex items-center gap-1.5 mt-3 pt-2 overflow-x-auto whitespace-nowrap scrollbar-hide border-t border-gray-50">
            {filterCategories.map((cat) => (
              <button
                key={`tag-${cat}`}
                onClick={() => setSelectedCategory(cat)}
                className={`text-[11px] font-medium px-3 py-1 rounded-full transition-all capitalize border ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-transparent font-semibold shadow-xs'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {cat === 'all' ? 'All Combinations' : cat.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </section>

        {/* INTERACTIVE DIAGNOSTIC ACCELERATORS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl p-4 text-white shadow-sm flex items-center justify-between relative overflow-hidden group">
            <div className="absolute -right-6 -bottom-6 text-7xl opacity-15 transform group-hover:scale-110 transition-transform">💫</div>
            <div className="max-w-[70%]">
              <h3 className="font-bold text-sm md:text-base">Confused Which Combo Matches You?</h3>
              <p className="text-[11px] text-pink-100 mt-0.5">Take our 60-second smart custom beauty profile questionnaire.</p>
              <button 
                onClick={() => setShowBeautyQuiz(true)}
                className="mt-3 bg-white text-purple-700 font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm hover:bg-pink-50 transition-colors"
              >
                Launch Assistant
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-800 to-indigo-900 rounded-2xl p-4 text-white shadow-sm flex items-center justify-between relative overflow-hidden group">
            <div className="absolute -right-6 -bottom-6 text-7xl opacity-15 transform group-hover:scale-110 transition-transform">✨</div>
            <div className="max-w-[70%]">
              <h3 className="font-bold text-sm md:text-base">Instant Skin Analysis Engine</h3>
              <p className="text-[11px] text-purple-200 mt-0.5">Evaluate skincare combinations optimized for your localized skin type.</p>
              <button 
                onClick={() => setShowSkinAnalysis(true)}
                className="mt-3 bg-gradient-to-r from-amber-400 to-orange-400 text-gray-950 font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm hover:brightness-105 transition-all"
              >
                Analyze Skin Instantly
              </button>
            </div>
          </div>
        </div>

        {/* ==================== SECTION 3: PRODUCT GRID DEPLOYMENT ==================== */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-extrabold text-gray-800 flex items-center gap-2">
              <Gift className="w-5 h-5 text-pink-500" /> Catalog Offers
            </h2>
            <p className="text-xs font-medium text-gray-500">
              Showing <span className="text-pink-600 font-bold">{filteredAndSortedCombos.length}</span> results
            </p>
          </div>

          {filteredAndSortedCombos.length === 0 ? (
            <div className="bg-white border rounded-2xl p-12 text-center shadow-xs">
              <SlidersHorizontal className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-600 font-medium text-sm">No combo packages found matching your filters.</p>
              <button 
                onClick={() => { setSelectedCategory('all'); setPriceRange(maxPriceInData); setSearchQuery(''); }}
                className="mt-2 text-xs text-pink-600 font-bold hover:underline"
              >
                Clear Filters & Show All
              </button>
            </div>
          ) : isMobile ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredAndSortedCombos.map(combo => (
                <div key={combo.id} className="border border-pink-100 rounded-xl overflow-hidden bg-white shadow-xs">
                  {/* Cleaned up props to prevent type instantiation mismatches */}
                  <ServiceCard
                    service={combo}
                    isFavorite={favorites.has(combo.id)}
                    onToggleFavorite={() => toggleFavorite(combo.id)}
                    onAddToCart={() => handleAddToCart(combo)}
                    onViewDetails={() => navigateToComboPage(combo)}
                    variant="compact"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAndSortedCombos.map(combo => (
                <div key={combo.id} className="border border-pink-100 rounded-xl overflow-hidden bg-white shadow-xs hover:shadow-sm transition-shadow">
                  <ServiceCard
                    service={combo}
                    isFavorite={favorites.has(combo.id)}
                    onToggleFavorite={() => toggleFavorite(combo.id)}
                    onAddToCart={() => handleAddToCart(combo)}
                    onViewDetails={() => navigateToComboPage(combo)}
                    variant="detailed"
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* WHY CHOOSE DECK */}
        <section className="bg-gradient-to-r from-pink-100/80 via-purple-100/70 to-rose-100/80 rounded-2xl p-6 mb-8 border border-pink-200/40">
          <h2 className="text-base md:text-lg font-extrabold text-gray-800 mb-5 text-center">Why Smart Clients Choose Our Combo Bundles</h2>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="flex flex-col items-center bg-white/60 backdrop-blur-xs p-2.5 rounded-xl border border-white">
              <Sparkles className="w-6 h-6 text-purple-600 mb-1" />
              <div className="text-lg font-black text-gray-900">{combos.length}+</div>
              <div className="text-[10px] text-gray-500 font-medium uppercase tracking-tight">Curated Combos</div>
            </div>
            <div className="flex flex-col items-center bg-white/60 backdrop-blur-xs p-2.5 rounded-xl border border-white">
              <Award className="w-6 h-6 text-pink-600 mb-1" />
              <div className="text-lg font-black text-gray-900">20-30%</div>
              <div className="text-[10px] text-gray-500 font-medium uppercase tracking-tight">Direct Savings</div>
            </div>
            <div className="flex flex-col items-center bg-white/60 backdrop-blur-xs p-2.5 rounded-xl border border-white">
              <Users className="w-6 h-6 text-rose-600 mb-1" />
              <div className="text-lg font-black text-gray-900">5000+</div>
              <div className="text-[10px] text-gray-500 font-medium uppercase tracking-tight">Happy Clients</div>
            </div>
          </div>
          
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-1.5 bg-white/90 px-4 py-1.5 rounded-full border border-gray-100 shadow-xs">
              <MapPin className="w-3.5 h-3.5 text-pink-500" /> Near Bhootnath Metro, Patna
            </div>
            <div className="flex items-center gap-1.5 bg-white/90 px-4 py-1.5 rounded-full border border-gray-100 shadow-xs">
              <Phone className="w-3.5 h-3.5 text-pink-500" /> Call Support: +91-9650461390
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF / REAL TESTIMONIALS DATA */}
        <section className="mb-8">
          <h2 className="text-base font-extrabold text-gray-800 mb-4 text-center">Reviews From Verified Combo Bookings</h2>
          <div className="flex overflow-x-auto space-x-4 pb-3 scrollbar-hide" style={SCROLL_STYLE}>
            <TestimonialCard name="Priya S." text="The pre-bridal combo saved me thousands! Skincare products used were entirely premium." image="/images/testimonials-1.jpg" />
            <TestimonialCard name="Ananya R." text="Booked the Hair Smootening + Facial combo. Flawless execution and highly experienced staff." image="/images/testimonials-2.jpg" />
            <TestimonialCard name="Maya T." text="The party glam bundle is a lifesaver. Had HD party makeup and advanced hairstyling ready within 90 minutes!" image="/images/testimonials-3.jpg" />
          </div>
        </section>

        {/* CODE VOUCHER STICKER BANNER */}
        <section className="bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-2xl p-5 text-center relative overflow-hidden shadow-sm">
          <div className="absolute -left-10 -top-10 text-8xl opacity-10">🎫</div>
          <div className="relative z-10">
            <span className="bg-black/20 text-yellow-200 font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full inline-block mb-1.5">
              First Booking Bonus
            </span>
            <h3 className="text-base md:text-lg font-black">Enjoy an Extra 10% Off on Any Combo Package</h3>
            <p className="text-xs text-white/90 mt-0.5">Apply code <span className="bg-white text-gray-900 font-mono font-bold px-1.5 py-0.5 rounded text-[11px] select-all mx-0.5">GLOWCOMBO</span> at check-out. Valid this month only.</p>
          </div>
        </section>

      </main>

      {/* OVERLAY HYDRO-MODALS CONTAINER */}
      {showBeautyQuiz && <BeautyQuiz onClose={() => setShowBeautyQuiz(false)} />}
      {showSkinAnalysis && <SkinAnalysis onClose={() => setShowSkinAnalysis(false)} />}
    </div>
  );
}