// app/components/booking/StylistStep.tsx
"use client";

import { FiStar, FiCheck, FiAward, FiHeart, FiTrendingUp, FiInstagram } from 'react-icons/fi';
import { useBooking } from '../../context/BookingContext';
import { useState, useEffect } from 'react';

interface StylistStepProps {
  onNext: () => void;
  onBack: () => void;
}

const StylistStep = ({ onNext, onBack }: StylistStepProps) => {
  const { selectedStylist, setSelectedStylist, stylists, fetchStylists, loading } = useBooking();
  const [filterCategory, setFilterCategory] = useState<'all' | 'trending' | 'top-rated'>('all');

  useEffect(() => {
    loadStylists();
  }, [filterCategory]);

  const loadStylists = async () => {
    const filters: any = {};
    
    if (filterCategory === 'trending') {
      filters.trending = true;
    } else if (filterCategory === 'top-rated') {
      filters.topRated = true;
    }
    
    await fetchStylists(filters);
  };

  const formatWorkingDays = (days: number[]) => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.sort().map(d => dayNames[d]).join(', ');
  };

  const isAvailableToday = (workingDays: number[]) => {
    const today = new Date().getDay();
    return workingDays.includes(today);
  };

  const getResponseTime = (totalAppointments: number) => {
    if (totalAppointments > 1000) return 'Instant';
    if (totalAppointments > 500) return '15 mins';
    return '30 mins';
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Choose Your Beauty Expert
          </h2>
          <p className="text-gray-500 mt-1">Our verified professionals are ready to serve you</p>
        </div>
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-full">
          <FiAward className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-3 mb-6">
        {[
          { key: 'all', label: 'All Stylists', icon: '✨' },
          { key: 'trending', label: 'Trending', icon: '🔥' },
          { key: 'top-rated', label: 'Top Rated', icon: '⭐' }
        ].map(filter => (
          <button
            key={filter.key}
            onClick={() => setFilterCategory(filter.key as any)}
            className={`px-5 py-2.5 rounded-full font-medium transition-all ${
              filterCategory === filter.key
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span className="mr-2">{filter.icon}</span>
            {filter.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
        </div>
      ) : stylists.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No stylists available at the moment.</p>
        </div>
      ) : (
        <div className="space-y-5 mb-6">
          {stylists.map(stylist => {
            const availableToday = isAvailableToday(stylist.working_days);
            const responseTime = getResponseTime(stylist.total_appointments);
            
            return (
              <div 
                key={stylist.id} 
                className={`group relative p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                  selectedStylist?.id === stylist.id 
                    ? 'bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-400 shadow-xl scale-[1.02]' 
                    : 'border-2 border-gray-100 hover:border-pink-200 hover:shadow-lg'
                }`}
                onClick={() => setSelectedStylist(stylist)}
              >
                {stylist.is_trending && (
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg flex items-center gap-1">
                    <FiTrendingUp className="w-3 h-3" />
                    Trending
                  </div>
                )}

                {stylist.is_featured && (
                  <div className="absolute -top-3 -left-3 bg-gradient-to-r from-purple-400 to-pink-500 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg">
                    ⭐ Featured
                  </div>
                )}
                
                <div className="flex items-start gap-5">
                  <div className="relative">
                    <img 
                      src={stylist.profile_image_url || '/api/placeholder/100/100'} 
                      alt={stylist.full_name} 
                      className={`w-24 h-24 rounded-2xl object-cover ${
                        selectedStylist?.id === stylist.id ? 'ring-4 ring-pink-400' : ''
                      }`}
                    />
                    {stylist.is_verified && (
                      <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-1.5 rounded-full shadow-md">
                        <FiCheck className="w-3 h-3" />
                      </div>
                    )}
                    {availableToday && (
                      <div className="absolute -top-2 -left-2 bg-green-500 w-4 h-4 rounded-full border-2 border-white animate-pulse"></div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg text-gray-800">{stylist.full_name}</h3>
                          {availableToday && (
                            <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                              Available Today
                            </span>
                          )}
                        </div>
                        <p className="text-pink-600 font-medium">
                          {stylist.specialties.slice(0, 2).join(' • ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 line-through">₹500</p>
                        <p className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                          Free
                        </p>
                        <p className="text-xs text-gray-500">with service</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm mb-3">
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                        <FiStar className="fill-yellow-400 text-yellow-400 w-4 h-4" />
                        <span className="font-semibold text-gray-800">{stylist.rating.toFixed(1)}</span>
                        <span className="text-gray-500">({stylist.total_reviews})</span>
                      </div>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-600">{stylist.experience_years}+ yrs exp</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-pink-600 font-medium">⚡ {responseTime}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {stylist.awards && stylist.awards.slice(0, 3).map((award, idx) => (
                        <span 
                          key={idx}
                          className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs px-3 py-1 rounded-full font-medium"
                        >
                          {award}
                        </span>
                      ))}
                      {stylist.total_appointments > 1000 && (
                        <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
                          {stylist.total_appointments}+ bookings
                        </span>
                      )}
                      {stylist.repeat_clients > 100 && (
                        <span className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
                          💎 {stylist.repeat_clients} repeat clients
                        </span>
                      )}
                    </div>
                    
                    {stylist.bio && (
                      <p className="text-sm text-gray-600 leading-relaxed mb-2">{stylist.bio}</p>
                    )}

                    {stylist.social_media_handle && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <FiInstagram className="text-pink-500" />
                        <span>@{stylist.social_media_handle}</span>
                        {stylist.instagram_followers > 0 && (
                          <span>• {(stylist.instagram_followers / 1000).toFixed(1)}K followers</span>
                        )}
                      </div>
                    )}

                    <div className="mt-2 text-xs text-gray-500">
                      📅 Available: {formatWorkingDays(stylist.working_days)}
                    </div>
                  </div>
                </div>
                
                {selectedStylist?.id === stylist.id && (
                  <div className="mt-5 pt-5 border-t border-pink-200 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiHeart className="text-pink-500" />
                      <span>{stylist.repeat_clients} clients loved this artist</span>
                    </div>
                    <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 px-5 rounded-full flex items-center gap-2 font-medium shadow-lg">
                      <FiCheck className="w-5 h-5" />
                      Selected
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl mb-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white rounded-lg">
            <span className="text-2xl">💫</span>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-1">All stylists are verified & insured</h4>
            <p className="text-sm text-gray-600">
              Background checked professionals with 100% satisfaction guarantee
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between gap-4">
        <button 
          onClick={onBack}
          className="px-8 py-3 border-2 border-gray-200 text-gray-700 rounded-full hover:bg-gray-50 transition-all font-medium"
        >
          ← Back
        </button>
        <button 
          onClick={onNext}
          disabled={!selectedStylist}
          className="flex-1 px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          Continue to Time Selection →
        </button>
      </div>
    </div>
  );
};

export default StylistStep;