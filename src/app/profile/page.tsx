// app/profile/page.tsx
"use client";

import { useState, useEffect } from 'react';
//import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, User, Mail, Phone, Calendar, Heart, Edit, Save, 
  Star, Gift, Camera, TrendingUp, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';

interface BookingHistory {
  id: string;
  date: string;
  time: string;
  services: string[];
  stylist: string;
  status: 'completed' | 'upcoming' | 'cancelled';
  rating?: number;
  review?: string;
  total: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const { profile, updateProfile, signOut, isLoggedIn, loading: authLoading } = useAuth();
  const { favorites } = useBooking();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings' | 'preferences' | 'loyalty'>('profile');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showImageUpload, setShowImageUpload] = useState(false);

  // Mock booking history - in real app, fetch from API
  const [bookingHistory] = useState<BookingHistory[]>([
    {
      id: '1',
      date: '2024-01-15',
      time: '2:00 PM',
      services: ['Bridal Makeup', 'Hair Styling'],
      stylist: 'Priya Sharma',
      status: 'completed',
      rating: 5,
      review: 'Amazing service! Loved the bridal look.',
      total: 8500
    },
    {
      id: '2',
      date: '2024-02-10',
      time: '11:00 AM',
      services: ['Facial', 'Eyebrow Threading'],
      stylist: 'Anita Singh',
      status: 'completed',
      rating: 4,
      total: 2800
    },
    {
      id: '3',
      date: '2024-03-05',
      time: '3:30 PM',
      services: ['Hair Cut & Style'],
      stylist: 'Meera Patel',
      status: 'upcoming',
      total: 1500
    }
  ]);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    birthday: '',
    anniversary_date: '',
    marital_status: 'single',
    skin_type: '',
    hair_type: '',
  });

  // Redirect if not logged in
  useEffect(() => {
    // Check for OAuth success
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('auth') === 'success' && isLoggedIn) {
    // Remove the query parameter without refreshing
    const newUrl = window.location.pathname;
    window.history.replaceState({}, '', newUrl);
    return;
  }

  // Redirect if not logged in
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  // Initialize form data from profile
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || profile.full_name?.split(' ')[0] || '',
        last_name: profile.last_name || profile.full_name?.split(' ')[1] || '',
        phone: profile.phone || '',
        birthday: profile.birthday || '',
        anniversary_date: profile.anniversary_date || '',
        marital_status: profile.marital_status || 'single',
        skin_type: profile.skin_type || '',
        hair_type: profile.hair_type || '',
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const result = await updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        full_name: `${formData.first_name} ${formData.last_name}`.trim(),
        phone: formData.phone,
        birthday: formData.birthday,
        anniversary_date: formData.anniversary_date,
        // marital_status: formData.marital_status,
        // skin_type: formData.skin_type,
        // hair_type: formData.hair_type,
      });

      // if (updateError) {
      //   setError(updateError);
      // } else {
      //   setSuccess('Profile updated successfully!');
      //   setIsEditing(false);
      //   setTimeout(() => setSuccess(''), 3000);
      // }

      if (!result?.error) {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (error) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
  try {
    await signOut();
    // Since signOut returns void, if we reach this line, it succeeded
    router.push('/login');
  } catch (err: any) {
    // Handle the error if the sign-out process fails
    setError(err.message || 'Failed to sign out');
  }
};

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'upcoming': return 'text-blue-600 bg-blue-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getLoyaltyTier = (points: number) => {
    if (points >= 5000) return { name: 'Diamond', color: 'text-purple-600', icon: '💎' };
    if (points >= 2500) return { name: 'Gold', color: 'text-yellow-600', icon: '🥇' };
    if (points >= 1000) return { name: 'Silver', color: 'text-gray-600', icon: '🥈' };
    return { name: 'Bronze', color: 'text-orange-600', icon: '🥉' };
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (!isLoggedIn || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <Loader className="w-8 h-8 text-pink-500 animate-spin" />
      </div>
    );
  }

  const loyaltyTier = getLoyaltyTier(profile.loyalty_points);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button 
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-pink-100 mr-2"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        </div>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center"
            >
              <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="text-sm">{success}</span>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center"
            >
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-pink-100 mb-6"
        >
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-pink-600 shadow-lg">
                  {profile.profile_image_url ? (
                    <Image 
                      src={profile.profile_image_url} 
                      alt={profile.full_name} 
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    profile.full_name?.charAt(0) || 'U'
                  )}
                </div>
                <button
                  onClick={() => setShowImageUpload(true)}
                  className="absolute -bottom-1 -right-1 bg-pink-500 text-white rounded-full p-1.5 hover:bg-pink-600 transition-colors"
                >
                  <Camera className="w-3 h-3" />
                </button>
              </div>
              
              <div className="text-white">
                <h2 className="text-2xl font-bold">{profile.full_name || 'Beauty Lover'}</h2>
                <p className="text-pink-100">{profile.email}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center">
                    <span className="mr-1">{loyaltyTier.icon}</span>
                    <span className="font-medium">{loyaltyTier.name} Member</span>
                  </div>
                  <div className="flex items-center">
                    <Gift className="mr-1 w-4 h-4" />
                    <span>{profile.loyalty_points} points</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-pink-400/30">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{profile.total_bookings}</div>
                <div className="text-pink-100 text-sm">Total Bookings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">₹{profile.total_spent?.toLocaleString() || 0}</div>
                <div className="text-pink-100 text-sm">Total Spent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{favorites.length}</div>
                <div className="text-pink-100 text-sm">Favorites</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-pink-100">
          <div className="border-b border-pink-100">
            <div className="flex">
              {[
                { id: 'profile', label: 'Personal Info', icon: User },
                { id: 'bookings', label: 'Booking History', icon: Calendar },
                { id: 'preferences', label: 'Preferences', icon: Heart },
                { id: 'loyalty', label: 'Loyalty & Rewards', icon: Gift }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center px-6 py-4 font-medium transition-colors ${
                    activeTab === id
                      ? 'text-pink-600 border-b-2 border-pink-500 bg-pink-50'
                      : 'text-gray-600 hover:text-pink-500 hover:bg-pink-50'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Personal Info Tab */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                    >
                      <Edit className="mr-2 w-4 h-4" />
                      Edit Profile
                    </button>
                  )}
                </div>

                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-5 h-5 text-pink-400" />
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-5 h-5 text-pink-400" />
                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-5 h-5 text-pink-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-5 h-5 text-pink-400" />
                      <input
                        type="date"
                        name="birthday"
                        value={formData.birthday}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status</label>
                    <select
                      name="marital_status"
                      value={formData.marital_status}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="engaged">Engaged</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {(formData.marital_status === 'married' || formData.marital_status === 'engaged') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {formData.marital_status === 'married' ? 'Anniversary Date' : 'Engagement Date'}
                      </label>
                      <div className="relative">
                        <Heart className="absolute left-3 top-3 w-5 h-5 text-pink-400" />
                        <input
                          type="date"
                          name="anniversary_date"
                          value={formData.anniversary_date}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>
                    </motion.div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Skin Type</label>
                    <select
                      name="skin_type"
                      value={formData.skin_type}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select skin type</option>
                      <option value="dry">Dry</option>
                      <option value="oily">Oily</option>
                      <option value="combination">Combination</option>
                      <option value="normal">Normal</option>
                      <option value="sensitive">Sensitive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hair Type</label>
                    <select
                      name="hair_type"
                      value={formData.hair_type}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select hair type</option>
                      <option value="straight">Straight</option>
                      <option value="wavy">Wavy</option>
                      <option value="curly">Curly</option>
                      <option value="coily">Coily</option>
                    </select>
                  </div>
                </form>

                {isEditing && (
                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setError('');
                        // Reset form data
                        if (profile) {
                          setFormData({
                            first_name: profile.first_name || profile.full_name?.split(' ')[0] || '',
                            last_name: profile.last_name || profile.full_name?.split(' ')[1] || '',
                            phone: profile.phone || '',
                            birthday: profile.birthday || '',
                            anniversary_date: profile.anniversary_date || '',
                            marital_status: profile.marital_status || 'single',
                            skin_type: profile.skin_type || '',
                            hair_type: profile.hair_type || '',
                          });
                        }
                      }}
                      disabled={saving}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-colors disabled:opacity-50"
                    >
                      {saving && <Loader className="animate-spin mr-2 w-4 h-4" />}
                      <Save className="mr-2 w-4 h-4" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Booking History Tab */}
            {activeTab === 'bookings' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-gray-800">Booking History</h3>
                
                <div className="space-y-4">
                  {bookingHistory.map((booking) => (
                    <div key={booking.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-800">
                            {new Date(booking.date).toLocaleDateString()} at {booking.time}
                          </h4>
                          <p className="text-sm text-gray-600">Stylist: {booking.stylist}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                          <span className="font-medium text-gray-800">₹{booking.total.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">Services:</p>
                        <div className="flex flex-wrap gap-1">
                          {booking.services.map((service, index) => (
                            <span key={index} className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full">
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>

                      {booking.rating && (
                        <div className="flex items-center space-x-2 pt-3 border-t border-gray-200">
                          <div className="flex">{renderStars(booking.rating)}</div>
                          {booking.review && (
                            <p className="text-sm text-gray-600 italic">&quot;{booking.review}&quot;</p>
                          )}
                        </div>
                      )}

                      {booking.status === 'upcoming' && (
                        <div className="flex space-x-2 pt-3 border-t border-gray-200">
                          <button className="px-3 py-1 bg-pink-100 text-pink-700 text-sm rounded-lg hover:bg-pink-200 transition-colors">
                            Reschedule
                          </button>
                          <button className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition-colors">
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {bookingHistory.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No bookings yet</p>
                    <button
                      onClick={() => router.push('/book')}
                      className="mt-4 px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-colors"
                    >
                      Book Your First Appointment
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-gray-800">Beauty Preferences</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-pink-50 p-4 rounded-lg">
                    <h4 className="font-medium text-pink-700 mb-3">Favorite Services</h4>
                    <div className="space-y-2">
                      {favorites.length > 0 ? (
                        favorites.slice(0, 5).map((id, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Service #{id}</span>
                            <Heart className="w-4 h-4 text-pink-500 fill-current" />
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-600">No favorite services yet</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-medium text-purple-700 mb-3">Recommended Services</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Threading</span>
                        <TrendingUp className="w-4 h-4 text-purple-500" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Manicure</span>
                        <TrendingUp className="w-4 h-4 text-purple-500" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Hair Color</span>
                        <TrendingUp className="w-4 h-4 text-purple-500" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Personalized Recommendations</h4>
                  <p className="text-sm opacity-90">Based on your skin type ({formData.skin_type || 'not specified'}) and hair type ({formData.hair_type || 'not specified'}), we recommend:</p>
                  <ul className="text-sm mt-2 space-y-1">
                    <li>• Deep hydrating facial (for your skin type)</li>
                    <li>• Hair treatment suitable for {formData.hair_type || 'your hair type'}</li>
                    <li>• Customized makeup consultation</li>
                  </ul>
                </div>
              </motion.div>
            )}

            {/* Loyalty & Rewards Tab */}
            {activeTab === 'loyalty' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">Loyalty & Rewards</h3>
                  <div className={`flex items-center px-3 py-1 rounded-full ${loyaltyTier.color} bg-opacity-10`}>
                    <span className="mr-1">{loyaltyTier.icon}</span>
                    <span className={`font-medium ${loyaltyTier.color}`}>{loyaltyTier.name} Member</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-pink-600">{profile.loyalty_points}</div>
                    <div className="text-gray-600">Current Points</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">₹{Math.floor(profile.loyalty_points / 10)}</div>
                    <div className="text-gray-600">Reward Value</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">{5000 - profile.loyalty_points > 0 ? 5000 - profile.loyalty_points : 0}</div>
                    <div className="text-gray-600">Points to Diamond</div>
                  </div>
                </div>

                <div className="bg-white border border-pink-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-800 mb-4">Available Rewards</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-800">₹500 Off Next Booking</div>
                        <div className="text-sm text-gray-600">Redeem with 500 points</div>
                      </div>
                      <button 
                        disabled={profile.loyalty_points < 500}
                        className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Redeem
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-800">Free Facial Treatment</div>
                        <div className="text-sm text-gray-600">Redeem with 1000 points</div>
                      </div>
                      <button 
                        disabled={profile.loyalty_points < 1000}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Redeem
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-800">Premium Package Discount</div>
                        <div className="text-sm text-gray-600">Redeem with 2000 points</div>
                      </div>
                      <button 
                        disabled={profile.loyalty_points < 2000}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Redeem
                      </button>
                    </div>
                  </div>
                </div>

                {/* Special Offers */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-800">Special Offers For You</h4>
                  
                  {formData.birthday && (
                    <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 rounded-lg">
                      <h5 className="font-medium mb-1">Birthday Offer</h5>
                      <p className="text-sm">Get 20% off during your birthday month!</p>
                      <p className="text-xs mt-2">Valid on your birthday month</p>
                    </div>
                  )}

                  {formData.marital_status !== 'single' && formData.anniversary_date && (
                    <div className="bg-gradient-to-r from-rose-500 to-pink-600 text-white p-4 rounded-lg">
                      <h5 className="font-medium mb-1">Anniversary Special</h5>
                      {/* <p className="text-sm">Couple&apos;s spa treatment at 30% off</p> */}
                      <p className="text-xs mt-2">Valid on your special day</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Image Upload Modal */}
      <AnimatePresence>
        {showImageUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
            >
              <div className="text-center">
                <div className="w-12 h-12 mx-auto bg-pink-100 rounded-full flex items-center justify-center mb-4">
                  <Camera className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Update Profile Picture
                </h3>
                <p className="text-gray-600 mb-6">
                  Choose a new profile picture to personalize your account.
                </p>
                <div className="space-y-3">
                  <button className="w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-colors">
                    Upload from Device
                  </button>
                  <button className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    Remove Current Picture
                  </button>
                  <button
                    onClick={() => setShowImageUpload(false)}
                    className="w-full px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}