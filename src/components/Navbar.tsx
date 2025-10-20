"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { FiUser, FiHeart, FiShoppingBag, FiPhone, FiMenu, FiX, FiChevronDown, FiSettings, FiCalendar, FiLogOut, FiStar, FiGift, FiBell } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, isLoggedIn, signOut, loading } = useAuth();
  const { cartItemCount, favorites } = useBooking();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Makeup', path: '/makeup' },
    { name: 'Skin', path: '/skin' },
    { name: 'Hair', path: '/hair' },
    { name: 'Nails', path: '/nails' },
    // { name: 'AI Beauty Scan', path: '/ai-beauty-scan' },
    { name: 'Blog', path: '/blog' },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowSignOutModal(false);
      setProfileDropdownOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-50">
        {/* Top announcement bar */}
        <div className="bg-gradient-to-r from-pink-100 to-purple-100 text-pink-800 py-2 text-center text-sm">
          <span className="inline-flex items-center">
            <FiGift className="mr-1" />
            Get 20% off your first appointment! Book now.
            <FiGift className="ml-1" />
          </span>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-rose-500 flex items-center">
                <span className="mr-1 text-2xl">💄</span> 
                <span className="bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
                  KRITIKA SALON
                </span>
              </Link>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`${
                    pathname === item.path
                      ? 'text-rose-600 border-b-2 border-rose-500'
                      : 'text-gray-700 hover:text-rose-500'
                  } px-1 py-2 font-medium transition-colors text-sm`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            
            {/* Right side icons and buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Notifications (only show when logged in) */}
              {isLoggedIn && (
                <button className="p-2 text-gray-600 hover:text-rose-500 transition-colors relative">
                  <FiBell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">2</span>
                </button>
              )}

              {/* Favorites */}
              <button 
                onClick={() => router.push('/favorites')}
                className="p-2 text-gray-600 hover:text-rose-500 transition-colors relative"
              >
                <FiHeart className="w-5 h-5" />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                    {favorites.length}
                  </span>
                )}
              </button>
              
              {/* Cart */}
              <button 
                onClick={() => router.push('/cart')}
                className="p-2 text-gray-600 hover:text-rose-500 transition-colors relative"
              >
                <FiShoppingBag className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                    {cartItemCount}
                  </span>
                )}
              </button>
              
              {/* User Profile */}
              <div className="relative" ref={dropdownRef}>
                {isLoggedIn && profile ? (
                  <div className="flex items-center space-x-2">
                    {/* User Avatar and Name */}
                    <button 
                      className="flex items-center space-x-2 text-gray-700 hover:text-rose-500 transition-colors p-2 rounded-lg hover:bg-pink-50"
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-rose-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {profile.profile_image_url ? (
                          <img 
                            src={profile.profile_image_url} 
                            alt={profile.full_name} 
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          getInitials(profile.full_name || profile.email)
                        )}
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium">
                          {profile.first_name || profile.full_name?.split(' ')[0] || 'User'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {profile.loyalty_points} points
                        </div>
                      </div>
                      <FiChevronDown className="w-4 h-4" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {profileDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-lg py-2 z-50 border border-pink-100"
                        >
                          {/* Profile Header */}
                          <div className="px-4 py-3 border-b border-pink-100">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-rose-500 text-white rounded-full flex items-center justify-center text-lg font-medium">
                                {profile.profile_image_url ? (
                                  <img 
                                    src={profile.profile_image_url} 
                                    alt={profile.full_name} 
                                    className="w-12 h-12 rounded-full object-cover"
                                  />
                                ) : (
                                  getInitials(profile.full_name || profile.email)
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {profile.full_name || 'Beauty Lover'}
                                </div>
                                <div className="text-sm text-gray-500">{profile.email}</div>
                                <div className="flex items-center space-x-3 mt-1">
                                  <span className="flex items-center text-xs text-pink-600">
                                    <FiStar className="mr-1" />
                                    {profile.loyalty_points} points
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {profile.total_bookings} bookings
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Menu Items */}
                          <div className="py-1">
                            <Link 
                              href="/profile" 
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-rose-600"
                              onClick={() => setProfileDropdownOpen(false)}
                            >
                              <FiUser className="mr-3 w-4 h-4" />
                              My Profile
                            </Link>
                            <Link 
                              href="/appointments" 
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-rose-600"
                              onClick={() => setProfileDropdownOpen(false)}
                            >
                              <FiCalendar className="mr-3 w-4 h-4" />
                              My Appointments
                            </Link>
                            <Link 
                              href="/favorites" 
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-rose-600"
                              onClick={() => setProfileDropdownOpen(false)}
                            >
                              <FiHeart className="mr-3 w-4 h-4" />
                              My Favorites
                            </Link>
                            <Link 
                              href="/loyalty" 
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-rose-600"
                              onClick={() => setProfileDropdownOpen(false)}
                            >
                              <FiGift className="mr-3 w-4 h-4" />
                              Loyalty Rewards
                            </Link>
                            <Link 
                              href="/settings" 
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-rose-600"
                              onClick={() => setProfileDropdownOpen(false)}
                            >
                              <FiSettings className="mr-3 w-4 h-4" />
                              Settings
                            </Link>
                          </div>

                          <div className="border-t border-pink-100 py-1">
                            <button 
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              onClick={() => setShowSignOutModal(true)}
                            >
                              <FiLogOut className="mr-3 w-4 h-4" />
                              Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link 
                      href="/login" 
                      className="px-4 py-2 text-rose-600 hover:text-rose-700 font-medium transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link 
                      href="/signup" 
                      className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-full hover:from-rose-600 hover:to-pink-700 transition-all font-medium"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
              
              {/* Book Now Button
              <button 
                onClick={() => router.push('/book')}
                className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-4 py-2 rounded-full hover:from-rose-600 hover:to-pink-700 transition-all font-medium flex items-center"
              >
                <FiPhone className="mr-2 w-4 h-4" />
                Book Now
              </button> */}
            </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 hover:text-rose-500 p-2"
              >
                {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white shadow-lg border-t border-pink-100"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={`${
                      pathname === item.path
                        ? 'bg-pink-50 text-rose-600'
                        : 'text-gray-700 hover:bg-pink-50'
                    } block px-3 py-2 rounded-md text-base font-medium`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                
                <div className="border-t border-gray-200 pt-4 pb-3">
                  {isLoggedIn && profile ? (
                    <div className="flex items-center px-5 space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-rose-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {profile.profile_image_url ? (
                          <img 
                            src={profile.profile_image_url} 
                            alt={profile.full_name} 
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          getInitials(profile.full_name || profile.email)
                        )}
                      </div>
                      <div>
                        <div className="text-base font-medium text-gray-800">
                          {profile.full_name || 'Beauty Lover'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {profile.loyalty_points} loyalty points
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div className="flex items-center justify-between px-5 space-x-4 mt-3">
                    <div className="flex space-x-4">
                      <button className="p-2 text-gray-600 relative">
                        <FiHeart className="w-5 h-5" />
                        {favorites.length > 0 && (
                          <span className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                            {favorites.length}
                          </span>
                        )}
                      </button>
                      
                      <button className="p-2 text-gray-600 relative">
                        <FiShoppingBag className="w-5 h-5" />
                        {cartItemCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                            {cartItemCount}
                          </span>
                        )}
                      </button>
                    </div>

                    {!isLoggedIn && (
                      <div className="flex space-x-2">
                        <Link 
                          href="/login" 
                          className="px-3 py-1 text-rose-600 border border-rose-500 rounded-full text-sm"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Sign In
                        </Link>
                        <Link 
                          href="/signup" 
                          className="px-3 py-1 bg-rose-500 text-white rounded-full text-sm"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Sign Up
                        </Link>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 px-2">
                    <button 
                      onClick={() => {
                        setMobileMenuOpen(false);
                        router.push('/book');
                      }}
                      className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white px-4 py-2 rounded-full hover:from-rose-600 hover:to-pink-700 transition-all font-medium flex items-center justify-center"
                    >
                      <FiPhone className="mr-2 w-4 h-4" />
                      Book Appointment
                    </button>
                  </div>

                  {isLoggedIn && (
                    <div className="mt-4 px-2 space-y-1">
                      <Link 
                        href="/profile" 
                        className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:bg-pink-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <FiUser className="mr-3 w-5 h-5" />
                        My Profile
                      </Link>
                      <Link 
                        href="/appointments" 
                        className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:bg-pink-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <FiCalendar className="mr-3 w-5 h-5" />
                        My Appointments
                      </Link>
                      <button 
                        className="flex items-center w-full px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50"
                        onClick={() => setShowSignOutModal(true)}
                      >
                        <FiLogOut className="mr-3 w-5 h-5" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Sign Out Confirmation Modal */}
      <AnimatePresence>
        {showSignOutModal && (
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
                <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <FiLogOut className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Sign Out
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to sign out of your account?
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowSignOutModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSignOut}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Signing out...' : 'Sign Out'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;