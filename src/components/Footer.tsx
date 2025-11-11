"use client";

import Link from 'next/link';
import { ROUTES } from '../constants/Routes';
import { Instagram, Facebook, Twitter, Youtube, Mail, Phone, MapPin, Heart } from 'lucide-react';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-pink-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <div className="mr-2 relative w-8 h-8">
                <Image
                  src="/images/white_salon_icon.webp"
                  alt="KRITIKA SALON"
                  width={32}
                  height={32}
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = '/images/white_salon_icon.png';
                  }}
                />
              </div>
              <span className="text-xl font-bold bg-linear-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
                KRITIKA SALON
              </span>
            </div>
            <p className="text-gray-600 mb-6 text-sm">
              Where every woman is a heroine. Premium beauty services to enhance your natural beauty.
            </p>
            
            {/* Social Media */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">Follow Us</h4>
              <div className="flex space-x-3">
                <a href="#" className="bg-linear-to-r from-pink-100 to-purple-100 p-2 rounded-full shadow-sm text-pink-500 hover:text-pink-700 transition-all hover:shadow-md hover:from-pink-200 hover:to-purple-200">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="bg-linear-to-r from-pink-100 to-purple-100 p-2 rounded-full shadow-sm text-pink-500 hover:text-pink-700 transition-all hover:shadow-md hover:from-pink-200 hover:to-purple-200">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="bg-linear-to-r from-pink-100 to-purple-100 p-2 rounded-full shadow-sm text-pink-500 hover:text-pink-700 transition-all hover:shadow-md hover:from-pink-200 hover:to-purple-200">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="bg-linear-to-r from-pink-100 to-purple-100 p-2 rounded-full shadow-sm text-pink-500 hover:text-pink-700 transition-all hover:shadow-md hover:from-pink-200 hover:to-purple-200">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Services Links */}
          <div>
            <h4 className="font-semibold text-lg text-gray-800 mb-4 relative pb-2 after:absolute after:left-0 after:bottom-0 after:w-10 after:h-0.5 after:bg-linear-to-r after:from-rose-500 after:to-pink-600">
              Our Services
            </h4>
            <ul className="space-y-3">
              <li><Link href={ROUTES.MAKEUP} className="text-gray-600 hover:text-rose-600 transition-colors text-sm flex items-center group">
                <span className="w-1 h-1 bg-linear-to-r from-rose-500 to-pink-600 rounded-full mr-2 group-hover:w-2 transition-all"></span>
                Makeup Services
              </Link></li>
              <li><Link href={ROUTES.SKIN} className="text-gray-600 hover:text-rose-600 transition-colors text-sm flex items-center group">
                <span className="w-1 h-1 bg-linear-to-r from-rose-500 to-pink-600 rounded-full mr-2 group-hover:w-2 transition-all"></span>
                Skincare Treatments
              </Link></li>
              <li><Link href={ROUTES.HAIR} className="text-gray-600 hover:text-rose-600 transition-colors text-sm flex items-center group">
                <span className="w-1 h-1 bg-linear-to-r from-rose-500 to-pink-600 rounded-full mr-2 group-hover:w-2 transition-all"></span>
                Hair Styling
              </Link></li>
              <li><Link href={ROUTES.NAIL} className="text-gray-600 hover:text-rose-600 transition-colors text-sm flex items-center group">
                <span className="w-1 h-1 bg-linear-to-r from-rose-500 to-pink-600 rounded-full mr-2 group-hover:w-2 transition-all"></span>
                Nail Services
              </Link></li>
              <li><Link href={ROUTES.CONTACT} className="text-gray-600 hover:text-rose-600 transition-colors text-sm flex items-center group">
                <span className="w-1 h-1 bg-linear-to-r from-rose-500 to-pink-600 rounded-full mr-2 group-hover:w-2 transition-all"></span>
                Book Appointment
              </Link></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-lg text-gray-800 mb-4 relative pb-2 after:absolute after:left-0 after:bottom-0 after:w-10 after:h-0.5 after:bg-linear-to-r after:from-rose-500 after:to-pink-600">
              Company
            </h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-gray-600 hover:text-rose-600 transition-colors text-sm flex items-center group">
                <span className="w-1 h-1 bg-linear-to-r from-rose-500 to-pink-600 rounded-full mr-2 group-hover:w-2 transition-all"></span>
                About Us
              </Link></li>
              <li><Link href="/blog" className="text-gray-600 hover:text-rose-600 transition-colors text-sm flex items-center group">
                <span className="w-1 h-1 bg-linear-to-r from-rose-500 to-pink-600 rounded-full mr-2 group-hover:w-2 transition-all"></span>
                Beauty Blog
              </Link></li>
              <li><Link href="/gallery" className="text-gray-600 hover:text-rose-600 transition-colors text-sm flex items-center group">
                <span className="w-1 h-1 bg-linear-to-r from-rose-500 to-pink-600 rounded-full mr-2 group-hover:w-2 transition-all"></span>
                Gallery
              </Link></li>
              <li><Link href="/careers" className="text-gray-600 hover:text-rose-600 transition-colors text-sm flex items-center group">
                <span className="w-1 h-1 bg-linear-to-r from-rose-500 to-pink-600 rounded-full mr-2 group-hover:w-2 transition-all"></span>
                Careers
              </Link></li>
              <li><Link href="/contact" className="text-gray-600 hover:text-rose-600 transition-colors text-sm flex items-center group">
                <span className="w-1 h-1 bg-linear-to-r from-rose-500 to-pink-600 rounded-full mr-2 group-hover:w-2 transition-all"></span>
                Contact Us
              </Link></li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h4 className="font-semibold text-lg text-gray-800 mb-4 relative pb-2 after:absolute after:left-0 after:bottom-0 after:w-10 after:h-0.5 after:bg-linear-to-r after:from-rose-500 after:to-pink-600">
              Stay Updated
            </h4>
            
            <div className="mb-6 space-y-3">
              <div className="flex items-center text-gray-600 text-sm">
                <Phone className="w-4 h-4 mr-2 text-rose-500" />
                <span>+91 9650461390</span>
              </div>
              <div className="flex items-center text-gray-600 text-sm">
                <Mail className="w-4 h-4 mr-2 text-rose-500" />
                <span>support@kritikasalonpatna.com</span>
              </div>
              <div className="flex items-start text-gray-600 text-sm">
                <MapPin className="w-4 h-4 mr-2 mt-0.5 text-rose-500 shrink-0" />
                <span>Bhootnath Road, Patna, Bihar, India</span>
              </div>
            </div>
            
            <div>
              <p className="text-gray-600 text-sm mb-2">Get beauty tips & exclusive offers</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="px-3 py-2 text-sm border border-r-0 border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 w-full"
                />
                <button className="bg-linear-to-r from-rose-500 to-pink-600 text-white px-4 py-2 rounded-r-md hover:from-rose-600 hover:to-pink-700 transition-all text-sm font-medium">
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600 text-xs mb-2">© {new Date().getFullYear()} KRITIKA Beauty Salon. All rights reserved.</p>
            <div className="flex space-x-4 text-xs text-gray-500">
              <Link href={ROUTES.PRIVACY} className="hover:text-rose-600 transition-colors">Privacy Policy</Link>
              <Link href={ROUTES.TERMS} className="hover:text-rose-600 transition-colors">Terms of Service</Link>
              <Link href="/cancellation" className="hover:text-rose-600 transition-colors">Cancellation Policy</Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-xs text-gray-500">
              <span className="mr-1">Made with</span>
              <Heart className="text-rose-500 w-3 h-3" />
              <span className="ml-1">for beautiful people</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Announcement Bar (matches navbar) */}
      <div className="bg-linear-to-r from-pink-100 to-purple-100 text-pink-800 py-2 text-center text-sm">
        <span className="inline-flex items-center">
          <span className="mr-1">✨</span>
          Get 20% off your first appointment! Book now.
          <span className="ml-1">✨</span>
        </span>
      </div>
    </footer>
  );
}