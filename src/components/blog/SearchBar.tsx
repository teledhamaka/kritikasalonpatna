"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, Clock, Calendar } from 'lucide-react';
import Image from 'next/image';

interface SearchResult {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  category: { name: string; color: string };
  readTime: number;
  publishedAt: string;
}

export default function AdvancedBlogSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'recent' | 'popular'>('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const categories = [
    { id: 'hair-care', name: 'Hair Care', color: '#ec4899' },
    { id: 'makeup', name: 'Makeup', color: '#8b5cf6' },
    { id: 'skin-care', name: 'Skin Care', color: '#3b82f6' },
    { id: 'bridal', name: 'Bridal', color: '#f43f5e' }
  ];

  const popularSearches = [
    'Bridal makeup',
    'Hair fall control',
    'Skin care routine',
    'Party makeup',
    'Hair treatment'
  ];

  // Search with debounce
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        // Real implementation would call Supabase
        const response = await fetch(`/api/blog/search?q=${encodeURIComponent(query)}&categories=${selectedCategories.join(',')}&filter=${activeTab}`);
        const data = await response.json();
        setResults(data.results || []);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, selectedCategories, activeTab]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setActiveTab('all');
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="text-gray-400" size={20} />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search beauty tips, makeup tutorials, hair care..."
          className="w-full pl-12 pr-12 py-4 bg-white border-2 border-pink-200 rounded-2xl focus:border-pink-500 focus:ring-4 focus:ring-pink-100 outline-none transition-all text-gray-900 placeholder-gray-400"
        />

        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border-2 border-pink-100 overflow-hidden"
          >
            
            {/* Filters Bar */}
            <div className="p-4 bg-linear-to-r from-pink-50 to-purple-50 border-b border-pink-100">
              
              {/* Filter Tabs */}
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    activeTab === 'all'
                      ? 'bg-pink-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-pink-100'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab('recent')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1 ${
                    activeTab === 'recent'
                      ? 'bg-pink-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-pink-100'
                  }`}
                >
                  <Calendar size={14} />
                  Recent
                </button>
                <button
                  onClick={() => setActiveTab('popular')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1 ${
                    activeTab === 'popular'
                      ? 'bg-pink-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-pink-100'
                  }`}
                >
                  <TrendingUp size={14} />
                  Popular
                </button>

                {(selectedCategories.length > 0 || activeTab !== 'all') && (
                  <button
                    onClick={clearFilters}
                    className="ml-auto text-xs text-pink-600 hover:text-pink-700 font-semibold"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      selectedCategories.includes(cat.id)
                        ? 'text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                    style={{
                      backgroundColor: selectedCategories.includes(cat.id) ? cat.color : undefined
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Area */}
            <div className="max-h-96 overflow-y-auto">
              
              {loading && (
                <div className="p-8 text-center">
                  <div className="inline-block w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-sm text-gray-600">Searching...</p>
                </div>
              )}

              {!loading && query.length < 2 && (
                <div className="p-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <TrendingUp size={16} className="text-pink-500" />
                    Popular Searches
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((search) => (
                      <button
                        key={search}
                        onClick={() => setQuery(search)}
                        className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm hover:bg-purple-100 transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!loading && query.length >= 2 && results.length === 0 && (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-3">😔</div>
                  <p className="text-gray-600 font-semibold mb-1">No results found</p>
                  <p className="text-sm text-gray-500">Try different keywords or clear filters</p>
                </div>
              )}

              {!loading && results.length > 0 && (
                <div className="divide-y divide-gray-100">
                  {results.map((result) => (
                    <motion.a
                      key={result.slug}
                      href={`/blog/${result.slug}`}
                      whileHover={{ backgroundColor: '#fdf2f8' }}
                      className="block p-4 transition-colors"
                    >
                      <div className="flex gap-4">
                        <Image
                          src={result.coverImage}
                          alt={result.title}
                          className="w-24 h-24 rounded-xl object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className="px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                              style={{ backgroundColor: result.category.color }}
                            >
                              {result.category.name}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock size={12} />
                              {result.readTime} min
                            </span>
                          </div>
                          <h4 className="font-semibold text-gray-900 line-clamp-1 mb-1">
                            {result.title}
                          </h4>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {result.excerpt}
                          </p>
                        </div>
                      </div>
                    </motion.a>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {results.length > 0 && (
              <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                <a
                  href={`/blog?search=${encodeURIComponent(query)}`}
                  className="text-sm text-pink-600 hover:text-pink-700 font-semibold"
                >
                  View all {results.length}+ results →
                </a>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Stats */}
      <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          100+ articles
        </span>
        <span>•</span>
        <span>Updated daily</span>
        <span>•</span>
        <span>Expert verified</span>
      </div>
    </div>
  );
}

// Mock data for demo
// const mockResults: SearchResult[] = [
//   {
//     slug: 'bridal-makeup-guide',
//     title: 'Bridal Makeup Complete Guide 2025',
//     excerpt: 'Everything you need to know about bridal makeup...',
//     coverImage: '/images/blog/bridal-makeup-kritika-salon-patna.webp',
//     category: { name: 'Bridal', color: '#f43f5e' },
//     readTime: 15,
//     publishedAt: '2025-01-15'
//   }
// ];