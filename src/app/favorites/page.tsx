"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiHeart, FiShoppingCart, FiClock, FiStar,  FiFilter, FiGrid, FiList, FiShare2, FiLoader, FiX,
  FiInfo, FiTrendingUp} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { supabase } from '../../lib/supabase';

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  image_url?: string;
  base_price: number;
  discounted_price?: number;
  duration_minutes: number;
  rating_average: number;
  rating_count: number;
  is_trending: boolean;
  is_popular: boolean;
  tags?: string[];
}

type ViewMode = 'grid' | 'list';
type SortOption = 'recent' | 'price-low' | 'price-high' | 'rating' | 'popular';

export default function FavoritesPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const { favorites, toggleFavorite, addToCart, cartItemCount } = useBooking();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const categories = [
    { id: 'all', name: 'All', icon: '💄' },
    { id: 'makeup', name: 'Makeup', icon: '💄' },
    { id: 'skin', name: 'Skin', icon: '✨' },
    { id: 'hair', name: 'Hair', icon: '💇' },
    { id: 'nail', name: 'Nails', icon: '💅' }
  ];

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    } else {
      fetchFavoriteServices();
    }
  }, [isLoggedIn, favorites]);

  const fetchFavoriteServices = async () => {
    if (favorites.length === 0) {
      setServices([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .in('id', favorites)
        .eq('active', true);

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching favorite services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (serviceId: string) => {
    await toggleFavorite(serviceId);
  };

  const handleAddToCart = (service: Service) => {
    addToCart({
      id: service.id,
      name: service.name,
      category: service.category,
      description: service.description,
      image_url: service.image_url,
      base_price: service.base_price,
      discounted_price: service.discounted_price,
      duration_minutes: service.duration_minutes,
      rating_average: service.rating_average,
      rating_count: service.rating_count,
      quantity: 1,
      service_type: service.category,
      active: true
    } as any);
  };

  const handleShare = async () => {
    const favoriteNames = services.map(s => s.name).join(', ');
    const shareText = `Check out my favorite beauty services at SALONIC: ${favoriteNames}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Favorite Services',
          text: shareText,
          url: window.location.href
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Share text copied to clipboard!');
    }
  };

  const filteredServices = services
    .filter(service => {
      if (selectedCategory === 'all') return true;
      return service.category === selectedCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.discounted_price || a.base_price) - (b.discounted_price || b.base_price);
        case 'price-high':
          return (b.discounted_price || b.base_price) - (a.discounted_price || a.base_price);
        case 'rating':
          return b.rating_average - a.rating_average;
        case 'popular':
          return b.rating_count - a.rating_count;
        default:
          return 0; // 'recent' - keep original order
      }
    });

  const stats = {
    total: services.length,
    totalValue: services.reduce((sum, s) => sum + (s.discounted_price || s.base_price), 0),
    avgRating: services.length > 0 
      ? services.reduce((sum, s) => sum + s.rating_average, 0) / services.length 
      : 0
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <FiLoader className="w-8 h-8 text-pink-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-pink-100 mr-2"
            >
              <FiArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <FiHeart className="w-6 h-6 mr-2 text-pink-500 fill-current" />
                My Favorites
              </h1>
              <p className="text-sm text-gray-600">{stats.total} services saved</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-lg hover:bg-pink-100 transition-colors"
            >
              <FiShare2 className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={() => router.push('/cart')}
              className="relative p-2 rounded-lg hover:bg-pink-100 transition-colors"
            >
              <FiShoppingCart className="w-5 h-5 text-gray-700" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {services.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-pink-100 text-center">
            <div className="w-24 h-24 mx-auto bg-pink-50 rounded-full flex items-center justify-center mb-6">
              <FiHeart className="w-12 h-12 text-pink-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Favorites Yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start building your collection of favorite beauty services. They'll appear here for easy access!
            </p>
            <button
              onClick={() => router.push('/makeup')}
              className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:from-pink-600 hover:to-purple-700 transition-all font-medium inline-flex items-center"
            >
              Browse Services
              <FiArrowLeft className="ml-2 w-5 h-5 rotate-180" />
            </button>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-pink-100">
                <div className="text-2xl font-bold text-pink-600">{stats.total}</div>
                <div className="text-sm text-gray-600">Services</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-pink-100">
                <div className="text-2xl font-bold text-purple-600">₹{stats.totalValue.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Value</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-pink-100">
                <div className="text-2xl font-bold text-yellow-600 flex items-center">
                  {stats.avgRating.toFixed(1)}
                  <FiStar className="w-5 h-5 ml-1 fill-current" />
                </div>
                <div className="text-sm text-gray-600">Avg Rating</div>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-pink-100 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Category Filter */}
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="mr-1">{cat.icon}</span>
                      {cat.name}
                    </button>
                  ))}
                </div>

                {/* View & Sort Controls */}
                <div className="flex items-center space-x-3">
                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm"
                  >
                    <option value="recent">Recently Added</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="popular">Most Popular</option>
                  </select>

                  {/* View Toggle */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                      }`}
                    >
                      <FiGrid className="w-5 h-5 text-gray-700" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                      }`}
                    >
                      <FiList className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Services Grid/List */}
            {filteredServices.length === 0 ? (
              <div className="bg-white rounded-xl p-8 shadow-sm border border-pink-100 text-center">
                <FiFilter className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No services found in this category</p>
              </div>
            ) : viewMode === 'grid' ? (
              /* Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-xl shadow-sm border border-pink-100 overflow-hidden hover:shadow-lg transition-all group"
                  >
                    {/* Service Image */}
                    <div className="relative h-48 bg-gradient-to-br from-pink-100 to-purple-100">
                      {service.image_url ? (
                        <img
                          src={service.image_url}
                          alt={service.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">
                          💄
                        </div>
                      )}
                      
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {service.is_trending && (
                          <span className="px-2 py-1 bg-pink-500 text-white text-xs font-bold rounded-full flex items-center">
                            <FiTrendingUp className="w-3 h-3 mr-1" />
                            Trending
                          </span>
                        )}
                        {service.discounted_price && (
                          <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                            {Math.round(((service.base_price - service.discounted_price) / service.base_price) * 100)}% OFF
                          </span>
                        )}
                      </div>

                      {/* Favorite Button */}
                      <button
                        onClick={() => handleRemoveFavorite(service.id)}
                        className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                      >
                        <FiHeart className="w-5 h-5 text-pink-500 fill-current" />
                      </button>
                    </div>

                    {/* Service Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 mb-2 line-clamp-1">
                        {service.name}
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {service.description}
                      </p>

                      {/* Rating & Duration */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <FiStar className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                          <span className="text-sm font-medium text-gray-700">
                            {service.rating_average.toFixed(1)}
                          </span>
                          <span className="text-xs text-gray-500 ml-1">
                            ({service.rating_count})
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <FiClock className="w-4 h-4 mr-1" />
                          {service.duration_minutes} mins
                        </div>
                      </div>

                      {/* Price & Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div>
                          {service.discounted_price ? (
                            <div>
                              <span className="text-sm text-gray-500 line-through mr-2">
                                ₹{service.base_price}
                              </span>
                              <span className="text-lg font-bold text-pink-600">
                                ₹{service.discounted_price}
                              </span>
                            </div>
                          ) : (
                            <span className="text-lg font-bold text-gray-800">
                              ₹{service.base_price}
                            </span>
                          )}
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedService(service);
                              setShowDetailsModal(true);
                            }}
                            className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            <FiInfo className="w-4 h-4 text-gray-700" />
                          </button>
                          <button
                            onClick={() => handleAddToCart(service)}
                            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all font-medium flex items-center"
                          >
                            <FiShoppingCart className="w-4 h-4 mr-1" />
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="space-y-4">
                {filteredServices.map((service) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-xl shadow-sm border border-pink-100 overflow-hidden hover:shadow-md transition-all"
                  >
                    <div className="flex">
                      {/* Service Image */}
                      <div className="relative w-48 h-32 bg-gradient-to-br from-pink-100 to-purple-100 flex-shrink-0">
                        {service.image_url ? (
                          <img
                            src={service.image_url}
                            alt={service.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">
                            💄
                          </div>
                        )}
                        
                        {service.discounted_price && (
                          <span className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                            {Math.round(((service.base_price - service.discounted_price) / service.base_price) * 100)}% OFF
                          </span>
                        )}
                      </div>

                      {/* Service Info */}
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 mb-1">
                                {service.name}
                              </h3>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {service.description}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveFavorite(service.id)}
                              className="ml-3 w-8 h-8 bg-pink-50 rounded-full flex items-center justify-center hover:bg-pink-100 transition-colors"
                            >
                              <FiHeart className="w-4 h-4 text-pink-500 fill-current" />
                            </button>
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <FiStar className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                              {service.rating_average.toFixed(1)} ({service.rating_count})
                            </div>
                            <div className="flex items-center">
                              <FiClock className="w-4 h-4 mr-1" />
                              {service.duration_minutes} mins
                            </div>
                            {service.is_trending && (
                              <span className="flex items-center text-pink-600 font-medium">
                                <FiTrendingUp className="w-4 h-4 mr-1" />
                                Trending
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            {service.discounted_price ? (
                              <div>
                                <span className="text-sm text-gray-500 line-through mr-2">
                                  ₹{service.base_price}
                                </span>
                                <span className="text-xl font-bold text-pink-600">
                                  ₹{service.discounted_price}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xl font-bold text-gray-800">
                                ₹{service.base_price}
                              </span>
                            )}
                          </div>

                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedService(service);
                                setShowDetailsModal(true);
                              }}
                              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                              Details
                            </button>
                            <button
                              onClick={() => handleAddToCart(service)}
                              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all font-medium flex items-center"
                            >
                              <FiShoppingCart className="w-4 h-4 mr-2" />
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Bulk Actions */}
            {filteredServices.length > 0 && (
              <div className="mt-6 bg-white rounded-xl p-4 shadow-sm border border-pink-100">
                <div className="flex items-center justify-between">
                  <p className="text-gray-700 font-medium">
                    {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} • 
                    Total value: ₹{filteredServices.reduce((sum, s) => sum + (s.discounted_price || s.base_price), 0).toLocaleString()}
                  </p>
                  <button
                    onClick={() => {
                      filteredServices.forEach(service => handleAddToCart(service));
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all font-medium flex items-center"
                  >
                    <FiShoppingCart className="w-5 h-5 mr-2" />
                    Add All to Cart
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Service Details Modal */}
        <AnimatePresence>
          {showDetailsModal && selectedService && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowDetailsModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">{selectedService.name}</h2>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiX className="w-6 h-6 text-gray-600" />
                  </button>
                </div>

                {selectedService.image_url && (
                  <img
                    src={selectedService.image_url}
                    alt={selectedService.name}
                    className="w-full h-64 object-cover rounded-xl mb-4"
                  />
                )}

                <div className="space-y-4">
                  <p className="text-gray-700">{selectedService.description}</p>

                  <div className="flex items-center justify-between py-3 border-t border-b border-gray-200">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center">
                        <FiStar className="w-5 h-5 text-yellow-400 fill-current mr-1" />
                        <span className="font-medium">{selectedService.rating_average.toFixed(1)}</span>
                        <span className="text-sm text-gray-500 ml-1">({selectedService.rating_count} reviews)</span>
                      </div>
                      <div className="flex items-center">
                        <FiClock className="w-5 h-5 text-gray-600 mr-1" />
                        <span className="font-medium">{selectedService.duration_minutes} mins</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {selectedService.discounted_price ? (
                        <div>
                          <div className="text-sm text-gray-500 line-through">
                            ₹{selectedService.base_price}
                          </div>
                          <div className="text-2xl font-bold text-pink-600">
                            ₹{selectedService.discounted_price}
                          </div>
                        </div>
                      ) : (
                        <div className="text-2xl font-bold text-gray-800">
                          ₹{selectedService.base_price}
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedService.tags && selectedService.tags.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedService.tags.map((tag, idx) => (
                          <span key={idx} className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => handleRemoveFavorite(selectedService.id)}
                      className="flex-1 px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium flex items-center justify-center"
                    >
                      <FiHeart className="w-5 h-5 mr-2 fill-current" />
                      Remove from Favorites
                    </button>
                    <button
                      onClick={() => {
                        handleAddToCart(selectedService);
                        setShowDetailsModal(false);
                      }}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all font-medium flex items-center justify-center"
                    >
                      <FiShoppingCart className="w-5 h-5 mr-2" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}