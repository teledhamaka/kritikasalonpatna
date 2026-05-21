// app/bridal/ClientBridalPage.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { 
  Sparkles, Star, SlidersHorizontal, Search, X, Heart, 
  ShoppingBag, Eye, Calendar, Sparkle, ShieldCheck, Check
} from 'lucide-react';

import { Service } from '../../types';
import { useBooking } from '../../context/BookingContext';
import ServiceCard from '../../components/ServiceCard';

// Lazy loading interactive modules for runtime performance optimization
const BeautyQuiz = dynamic(() => import('../../components/BeautyQuiz'), { ssr: false });
const SkinAnalysis = dynamic(() => import('../../components/SkinAnalysis'), { ssr: false });

interface ClientBridalPageProps {
  bridalServices: Service[];
}

export default function ClientBridalPage({ bridalServices }: ClientBridalPageProps) {
  const { addToCart } = useBooking();
  
  // State Ecosystem
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');
  const [priceRange, setPriceRange] = useState<number>(35000);
  const [sortBy, setSortBy] = useState<'recommended' | 'price-low' | 'price-high' | 'popular'>('recommended');
  
  const [showFilters, setShowFilters] = useState(false);
  const [showBeautyQuiz, setShowBeautyQuiz] = useState(false);
  const [showSkinAnalysis, setShowSkinAnalysis] = useState(false);

  // Sync stateful user local preferences safely
  useEffect(() => {
    const stored = localStorage.getItem('fav_bridal_services');
    if (stored) {
      try { setFavorites(new Set(JSON.parse(stored))); } catch (e) { console.error(e); }
    }
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem('fav_bridal_services', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  // Derive maximum bounds parameter cleanly
  const maxPriceInData = useMemo(() => {
    if (!bridalServices.length) return 35000;
    return Math.max(...bridalServices.map(s => s.price || 0), 5000);
  }, [bridalServices]);

  useEffect(() => {
    setPriceRange(maxPriceInData);
  }, [maxPriceInData]);

  const availableSources = useMemo(() => {
    const sets = new Set<string>();
    bridalServices.forEach(s => { if (s.category) sets.add(s.category); });
    return ['all', ...Array.from(sets)];
  }, [bridalServices]);

  // Compute trending and flagship packages for the luxury slider
  const trendingBridal = useMemo(() => {
    return [...bridalServices]
      .sort((a, b) => (b.rating || 4.9) - (a.rating || 4.2))
      .slice(0, 4);
  }, [bridalServices]);

  // Unified Multi-File Sorting and Filtering Engine
  const filteredServices = useMemo(() => {
    let result = [...bridalServices];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.title.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q))
      );
    }

    if (selectedSource !== 'all') {
      result = result.filter(s => s.category === selectedSource);
    }

    result = result.filter(s => (s.price || 0) <= priceRange);

    result.sort((a, b) => {
      if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'popular') return (b.rating || 0) - (a.rating || 0);
      return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
    });

    return result;
  }, [bridalServices, searchQuery, selectedSource, priceRange, sortBy]);

  return (
    <div className="min-h-screen bg-[#FFFDFB] text-stone-800 antialiased font-sans">
      
      {/* LUXURY EMBELLISHED HERO BANNER */}
{/* SOFT FEMININE BRIDAL HERO BANNER */}
<section className="relative bg-gradient-to-b from-[#FFF5F3] via-[#FFFDFB] to-[#FFFDFB] overflow-hidden py-20 md:py-32 px-4 border-b border-rose-100">
  
  {/* Frictionless Soft Radiance Layers */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(254,226,226,0.5),transparent_60%)] pointer-events-none" />
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,247,237,0.6),transparent_50%)] pointer-events-none" />
  
  {/* Floating Soft Botanical Accent Lines (Simulating delicate fabric/petals) */}
  <div className="absolute -right-16 -top-16 w-72 h-72 bg-gradient-to-br from-rose-200/20 to-amber-100/10 rounded-full blur-3xl pointer-events-none" />
  <div className="absolute -left-20 top-1/3 w-80 h-80 bg-rose-100/30 rounded-full blur-3xl pointer-events-none" />

  <div className="max-w-4xl mx-auto text-center relative z-10">
    
    {/* Delicate, Whimsical Top Accent */}
    <div className="inline-flex items-center gap-2 mb-6">
      <Sparkles className="w-4 h-4 text-rose-400/80 animate-pulse" />
      <span className="font-serif italic text-xs tracking-wider text-rose-500/80">
        Created for beautiful new beginnings
      </span>
      <Sparkles className="w-4 h-4 text-rose-400/80 animate-pulse" />
    </div>

    {/* Elegant, Soft-Focus Fluid Typography */}
    <h1 className="leading-tight mb-6">
      <span className="block font-serif text-4xl sm:text-5xl md:text-6xl text-stone-900 font-light tracking-wide mb-2">
        Your Forever Grace
      </span>
      <span className="block font-serif text-3xl sm:text-4.5xl md:text-5.5xl text-rose-600/90 font-light italic">
        starts beautifully here
      </span>
    </h1>

    {/* Smooth Soft-Divider */}
    <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-rose-300/60 to-transparent mx-auto mb-6" />

    {/* Warm, Inviting, Low-Friction Prose */}
    <p className="font-serif text-stone-600 font-light text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-relaxed tracking-wide mb-10 italic">
      Every detail of your wedding day look should feel like a gentle embrace. Discover a curated collection of soft airbrush makeup, elegant bridal styling, and soothing pre-wedding skin therapies.
    </p>

    {/* Calming, Non-Technical Quality Badges */}
    <div className="flex flex-wrap justify-center items-center gap-y-3 gap-x-6 text-xs text-stone-500 font-light tracking-wide">
      <span className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-300" /> Gentle Luxury Products Only
      </span>
      <span className="hidden md:inline text-stone-300">•</span>
      <span className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-300" /> Personalized Bridal Space
      </span>
    </div>
  </div>
</section>

      <main className="max-w-7xl mx-auto px-4 py-12">

        {/* ==================== HIGHLY COHESIVE FEMININE TRENDING SLIDER ==================== */}
        {trendingBridal.length > 0 && (
          <section className="mb-16">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8">
              <div>
                <span className="text-rose-600 font-semibold text-xs tracking-wider uppercase block mb-1">Most Coveted Looks</span>
                <h2 className="font-serif text-2xl md:text-3xl text-stone-900 tracking-wide">Trending Bridal Suites</h2>
              </div>
              <p className="text-stone-500 text-xs md:text-sm max-w-xs mt-2 md:mt-0 font-light">
                Explore our flagship packages meticulously aggregated across core service catalogs.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trendingBridal.map((service) => {
                const cleanTitle = service.title.split('|')[0].trim();
                const isFav = favorites.has(service.id);
                return (
                  <div 
                    key={`trending-${service.id}`}
                    className="group bg-white rounded-2xl border border-rose-100/70 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col relative"
                  >
                    {/* Visual Wrapper Component */}
                    <div className="relative aspect-[4/5] w-full bg-stone-100 overflow-hidden">
                      <Image
                        src={service.image || '/images/placeholder.jpg'}
                        alt={cleanTitle}
                        fill
                        sizes="(max-w-7xl) 25vw, 300px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
                      
                      {/* Interactive Utility Layer */}
                      <button 
                        onClick={() => toggleFavorite(service.id)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-xs transition-transform active:scale-90 hover:bg-white text-stone-700"
                        aria-label="Toggle Save Package"
                      >
                        <Heart className={`w-4 h-4 transition-colors ${isFav ? 'text-rose-500 fill-rose-500' : 'text-stone-600'}`} />
                      </button>

                      <span className="absolute bottom-3 left-3 bg-[#2D161B]/80 backdrop-blur-md text-amber-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border border-amber-500/20">
                        {service.category} Collection
                      </span>
                    </div>

                    {/* Metadata Content Block */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1 mb-1.5">
                          <span className="text-amber-500 text-xs font-semibold">★ {service.rating || '4.9'}</span>
                          <span className="text-stone-400 text-[11px] font-light">(Verified Bride)</span>
                        </div>
                        <h3 className="font-serif text-base text-stone-900 group-hover:text-rose-900 transition-colors line-clamp-1 mb-1">
                          {cleanTitle}
                        </h3>
                        <p className="text-stone-500 text-xs line-clamp-2 font-light leading-relaxed mb-4">
                          {service.shortDescription || service.description || 'Premium systemic package custom adjusted for grand wedding events.'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-rose-50 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-stone-400 uppercase tracking-wider font-light">All-Inclusive</span>
                          <span className="font-serif text-lg font-bold text-rose-800">₹{service.price?.toLocaleString('en-IN')}</span>
                        </div>
                        
                        <button
                          onClick={() => addToCart(service)}
                          className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#2D161B] to-[#422228] text-white hover:shadow-sm active:scale-98 transition-all px-3.5 py-2 rounded-xl text-xs font-medium"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-amber-300" /> Book Suite
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ==================== INTERACTIVE EXPERT CONSULTATION SUITES ==================== */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div className="relative bg-gradient-to-br from-[#3D1E24] to-[#251014] text-white rounded-2xl p-6 shadow-sm overflow-hidden group border border-amber-500/10">
            <div className="absolute right-4 bottom-4 text-9xl opacity-5 font-serif pointer-events-none select-none">B</div>
            <div className="max-w-[85%]">
              <span className="text-amber-300 font-semibold text-[10px] tracking-widest uppercase block mb-1">AI Recommendation Engine</span>
              <h3 className="font-serif text-xl text-[#FFF8F2] mb-2">Bridal Silhouette & Style Matcher</h3>
              <p className="text-stone-300 text-xs font-light leading-relaxed mb-5">
                Align structural makeup configurations with your wedding day outfit palette, custom skin tone profiles, and venue themes.
              </p>
              <button 
                onClick={() => setShowBeautyQuiz(true)}
                className="bg-gradient-to-r from-amber-400 to-amber-300 text-stone-950 font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs hover:brightness-105 active:scale-98 transition-all"
              >
                Configure Consultation Profile
              </button>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-[#FAF6F2] to-[#F3EAE2] text-stone-800 rounded-2xl p-6 shadow-xs overflow-hidden group border border-rose-100">
            <div className="absolute right-4 bottom-4 text-9xl opacity-5 font-serif pointer-events-none select-none">S</div>
            <div className="max-w-[85%]">
              <span className="text-rose-600 font-semibold text-[10px] tracking-widest uppercase block mb-1">Dermal Timeline Diagnostics</span>
              <h3 className="font-serif text-xl text-stone-900 mb-2">Pre-Wedding Dermal Planner</h3>
              <p className="text-stone-600 text-xs font-light leading-relaxed mb-5">
                Calculate if intensive clarifying facial procedures from our Skin logs coordinate cleanly with your wedding calendar deadlines.
              </p>
              <button 
                onClick={() => setShowSkinAnalysis(true)}
                className="bg-white border border-rose-200 text-stone-900 font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs hover:bg-rose-50/50 active:scale-98 transition-all"
              >
                Execute Diagnostic Plan
              </button>
            </div>
          </div>
        </section>

        {/* ==================== CENTRALIZED PARAMETRIC FILTER COMPONENT ==================== */}
        <section className="bg-white rounded-2xl border border-rose-100 p-5 mb-10 shadow-xs">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            
            {/* Live Search Node */}
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search premium treatments (e.g., Airbrush, HD, Glow)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200/80 rounded-xl pl-10 pr-9 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-rose-400 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Matrix Filters Adjuster Activators */}
            <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-stone-50 border border-stone-200/80 text-stone-700 text-xs font-medium rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-rose-400 cursor-pointer"
              >
                <option value="recommended">Signature Recommendations</option>
                <option value="popular">Most Booked by Brides</option>
                <option value="price-low">Budget: Low to High</option>
                <option value="price-high">Budget: High to Low</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition border ${
                  showFilters 
                    ? 'bg-rose-50 text-rose-700 border-rose-200' 
                    : 'bg-stone-50 text-stone-700 border-stone-200/80 hover:bg-stone-100/70'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" /> Filtering Matrix
              </button>
            </div>
          </div>

          {/* Budget Calibration Slide Module */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-rose-50 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
              <div>
                <label className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-2">
                  <span>Maximum Package Budget Limit:</span>
                  <span className="text-rose-800 font-bold text-sm">₹{priceRange.toLocaleString('en-IN')}</span>
                </label>
                <input
                  type="range"
                  min="2000"
                  max={maxPriceInData}
                  step="500"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-rose-700 bg-stone-200 rounded-lg h-1 appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-400 mt-1.5 font-light">
                  <span>₹2,000</span>
                  <span>₹{maxPriceInData.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex flex-col justify-end items-start md:items-end">
                <button
                  onClick={() => {
                    setPriceRange(maxPriceInData);
                    setSelectedSource('all');
                    setSearchQuery('');
                    setSortBy('recommended');
                  }}
                  className="text-xs text-stone-400 hover:text-rose-800 underline font-light"
                >
                  Reset Configuration Overrides
                </button>
              </div>
            </div>
          )}

          {/* Categorized Source Filter Bar */}
          <div className="flex items-center gap-2 mt-4 pt-3 overflow-x-auto whitespace-nowrap scrollbar-none border-t border-rose-50/60">
            {availableSources.map((source) => (
              <button
                key={`src-btn-${source}`}
                onClick={() => setSelectedSource(source)}
                className={`text-xs px-4 py-1.5 rounded-full transition-all capitalize border ${
                  selectedSource === source
                    ? 'bg-[#2D161B] text-white border-transparent font-medium shadow-xs'
                    : 'bg-stone-50 text-stone-600 border-stone-200/60 hover:bg-stone-100/50'
                }`}
              >
                {source === 'all' ? 'All Merged Catalogs' : `${source} module`}
              </button>
            ))}
          </div>
        </section>

        {/* ==================== BALANCED ARCHITECTURAL SERVICE GRID ==================== */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl md:text-2xl text-stone-900 flex items-center gap-2">
              All Available Packages ({filteredServices.length})
            </h2>
          </div>

          {filteredServices.length === 0 ? (
            <div className="bg-white border border-rose-100 rounded-2xl p-16 text-center shadow-xs">
              <SlidersHorizontal className="w-8 h-8 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-600 font-medium text-sm">No specific packages match your selected filter options.</p>
              <button 
                onClick={() => { setSelectedSource('all'); setPriceRange(maxPriceInData); setSearchQuery(''); }}
                className="mt-2 text-xs text-rose-700 font-bold hover:underline"
              >
                Reset Live Matrix
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredServices.map(service => (
                <div 
                  key={service.id} 
                  className="bg-white rounded-2xl border border-rose-100/70 overflow-hidden shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <ServiceCard
                    service={service}
                    isFavorite={favorites.has(service.id)}
                    onToggleFavorite={() => toggleFavorite(service.id)}
                    onAddToCart={() => addToCart(service)}
                    onViewDetails={() => window.location.href = `/services/${service.id}`}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* BRIDAL SUITE BENEFIT METRICS */}
        <section className="bg-gradient-to-br from-[#2D161B] to-[#1F0E11] text-white rounded-2xl p-8 border border-amber-500/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(251,113,133,0.05),transparent_40%)]" />
          <h3 className="font-serif text-xl md:text-2xl text-center text-amber-200 tracking-wide mb-8">The Luxury Bridal Blueprint</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="bg-white/5 border border-white/5 rounded-xl p-5 text-center backdrop-blur-xs">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-3 border border-amber-400/20">
                <Check className="w-5 h-5 text-amber-400" />
              </div>
              <h4 className="font-serif text-base text-[#FFF8F2] mb-1">Trial Run Option</h4>
              <p className="text-stone-300 text-xs font-light leading-relaxed">Secure preliminary cosmetic trials to align makeup density settings to your exact needs before the wedding.</p>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-xl p-5 text-center backdrop-blur-xs">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-3 border border-amber-400/20">
                <Check className="w-5 h-5 text-amber-400" />
              </div>
              <h4 className="font-serif text-base text-[#FFF8F2] mb-1">Dermal Care Mapping</h4>
              <p className="text-stone-300 text-xs font-light leading-relaxed">Integrated skin prep steps from our master skin catalog are embedded automatically into your booking.</p>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-xl p-5 text-center backdrop-blur-xs">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-3 border border-amber-400/20">
                <Check className="w-5 h-5 text-amber-400" />
              </div>
              <h4 className="font-serif text-base text-[#FFF8F2] mb-1">Flexible Calendaring</h4>
              <p className="text-stone-300 text-xs font-light leading-relaxed">Reschedule timeline slots across multi-day pre-wedding functions without worrying about booking overlap.</p>
            </div>
          </div>
        </section>

      </main>

      {/* OVERLAY MODALS */}
      {showBeautyQuiz && <BeautyQuiz onClose={() => setShowBeautyQuiz(false)} />}
      {showSkinAnalysis && <SkinAnalysis onClose={() => setShowSkinAnalysis(false)} />}
    </div>
  );
}