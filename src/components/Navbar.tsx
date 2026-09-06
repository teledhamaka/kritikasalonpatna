'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Calendar, ChevronDown, Gift, LogOut, Menu, Phone, ShoppingBag, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Makeup', path: '/makeup' },
  { name: 'Skin', path: '/skin' },
  { name: 'Hair', path: '/hair' },
  { name: 'Nails', path: '/nails' },
  { name: 'Blog', path: '/blog' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, isLoggedIn, signOut, loading: authLoading } = useAuth();
  const { cartItemCount } = useBooking();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [clientReady, setClientReady] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => setClientReady(true), []);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const closeMobile = () => setMobileMenuOpen(false);

  const handleSignOut = async () => {
    await signOut();
    setSignOutOpen(false);
    setProfileOpen(false);
    closeMobile();
    router.replace('/');
  };

  const initials = (name: string) => name
    .split(' ')
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (!clientReady || authLoading) {
    return (
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="font-bold text-rose-500">KRITIKA SALON</span>
          <div className="w-24 h-8 bg-gray-100 rounded animate-pulse" />
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="bg-white shadow-sm sticky top-0 z-50 w-full">
        <div className="bg-gradient-to-r from-pink-100 to-purple-100 text-pink-800 py-1.5 text-center text-xs">
          <span className="inline-flex items-center gap-1"><Gift className="w-3.5 h-3.5" /> 20% off your first appointment — Book now</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center font-bold text-xl md:text-2xl">
              <Image
                src="/images/white_salon_icon.webp"
                alt="Kritika Salon"
                width={40}
                height={40}
                className="w-8 h-8 mr-2 object-contain"
              />
              <span className="bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">KRITIKA SALON</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={pathname === item.path ? 'text-rose-600 font-medium border-b-2 border-rose-500 py-2 text-sm' : 'text-gray-700 hover:text-rose-500 font-medium py-2 text-sm'}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <button onClick={() => router.push('/cart')} className="relative p-2 text-gray-600 hover:text-rose-500" aria-label="My selection">
                <ShoppingBag className="w-5 h-5" />
                {cartItemCount > 0 && <span className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full min-w-4 h-4 px-1 flex items-center justify-center text-[10px]">{cartItemCount}</span>}
              </button>

              {isLoggedIn && profile ? (
                <div className="relative" ref={dropdownRef}>
                  <button onClick={() => setProfileOpen(v => !v)} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-pink-50">
                    <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-medium overflow-hidden">
                      {profile.profile_image_url ? <Image src={profile.profile_image_url} alt={profile.full_name || 'Profile'} width={32} height={32} className="w-full h-full object-cover" /> : initials(profile.full_name || profile.email)}
                    </div>
                    <span className="text-sm text-gray-700">{profile.first_name || profile.full_name?.split(' ')[0] || 'Profile'}</span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-pink-100 py-2">
                        <div className="px-4 py-3 border-b border-pink-100">
                          <div className="font-medium text-gray-900">{profile.full_name || 'Beauty Lover'}</div>
                          <div className="text-xs text-gray-500 truncate">{profile.email}</div>
                        </div>
                        <Link href="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-pink-50"><User className="w-4 h-4" /> My Profile</Link>
                        <Link href="/appointments" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-pink-50"><Calendar className="w-4 h-4" /> My Appointments</Link>
                        <button onClick={() => setSignOutOpen(true)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"><LogOut className="w-4 h-4" /> Sign Out</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link href="/login" className="text-sm font-medium text-rose-600 hover:text-rose-700">Sign In</Link>
              )}

              <button onClick={() => router.push('/booking')} className="rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white px-5 py-2.5 text-sm font-medium shadow-sm hover:shadow-md">
                Book Appointment
              </button>
            </div>

            <div className="md:hidden flex items-center gap-2">
              <button onClick={() => router.push('/cart')} className="relative p-2 text-gray-600" aria-label="My selection">
                <ShoppingBag className="w-5 h-5" />
                {cartItemCount > 0 && <span className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full min-w-4 h-4 px-1 flex items-center justify-center text-[10px]">{cartItemCount}</span>}
              </button>
              <button onClick={() => setMobileMenuOpen(v => !v)} className="p-2 text-gray-700" aria-label="Menu">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden bg-white border-t border-pink-100 shadow-lg">
              <div className="px-4 py-3 space-y-1">
                {navItems.map(item => <Link key={item.path} href={item.path} onClick={closeMobile} className="block px-3 py-2.5 rounded-lg text-gray-700 hover:bg-pink-50">{item.name}</Link>)}

                <button onClick={() => { closeMobile(); router.push('/booking'); }} className="mt-3 w-full rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white py-3 font-medium flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4" /> Book Appointment
                </button>

                {isLoggedIn ? (
                  <div className="pt-3 mt-3 border-t border-gray-100 space-y-1">
                    <Link href="/profile" onClick={closeMobile} className="block px-3 py-2.5 rounded-lg text-gray-700 hover:bg-pink-50">My Profile</Link>
                    <Link href="/appointments" onClick={closeMobile} className="block px-3 py-2.5 rounded-lg text-gray-700 hover:bg-pink-50">My Appointments</Link>
                    <button onClick={() => { closeMobile(); setSignOutOpen(true); }} className="w-full text-left px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50">Sign Out</button>
                  </div>
                ) : (
                  <div className="pt-3 mt-3 border-t border-gray-100 grid grid-cols-2 gap-2">
                    <Link href="/login" onClick={closeMobile} className="text-center rounded-xl border border-rose-200 text-rose-600 py-2.5 font-medium">Sign In</Link>
                    <Link href="/signup" onClick={closeMobile} className="text-center rounded-xl bg-rose-500 text-white py-2.5 font-medium">Sign Up</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <AnimatePresence>
        {signOutOpen && (
          <motion.div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white rounded-2xl p-6 w-full max-w-sm" initial={{ scale: 0.96 }} animate={{ scale: 1 }}>
              <h2 className="font-semibold text-gray-900">Sign out?</h2>
              <p className="mt-1 text-sm text-gray-500">You can sign in again anytime.</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button onClick={() => setSignOutOpen(false)} className="rounded-xl border border-gray-200 py-2.5 text-sm">Cancel</button>
                <button onClick={handleSignOut} className="rounded-xl bg-red-500 text-white py-2.5 text-sm">Sign Out</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
