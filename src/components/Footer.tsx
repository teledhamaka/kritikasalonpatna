// kritika/src/components/Footer.tsx
"use client";

import Link from 'next/link';
import { ROUTES } from '../constants/Routes';
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin, Clock } from 'lucide-react';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-pink-100 shadow-sm mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          {/* Brand Section */}
          <div>
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
              <span className="text-xl font-bold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
                KRITIKA SALON
              </span>
            </div>
            <p className="text-gray-600 mb-6 text-sm">
              Patna's premier ladies beauty parlour. Expert bridal makeup, skin treatments, hair styling & nail art.
            </p>
            
            {/* Social Media */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">Follow Us</h4>
              <div className="flex space-x-3">
                <a href="https://instagram.com/kritikasalonpatna" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-pink-100 to-purple-100 p-2 rounded-full shadow-sm text-pink-500 hover:text-pink-700 transition-all hover:shadow-md">
                  <Instagram className="w-5 h-5" />
                </a>
                {/* <a href="https://facebook.com/kritikasalon" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-pink-100 to-purple-100 p-2 rounded-full shadow-sm text-pink-500 hover:text-pink-700 transition-all hover:shadow-md">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://youtube.com/@kritikasalon" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-pink-100 to-purple-100 p-2 rounded-full shadow-sm text-pink-500 hover:text-pink-700 transition-all hover:shadow-md">
                  <Youtube className="w-5 h-5" /> */}
                {/* </a> */}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg text-gray-800 mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link href={ROUTES.MAKEUP} className="text-gray-600 hover:text-rose-600 transition-colors text-sm flex items-center group">
                  <span className="w-1 h-1 bg-gradient-to-r from-rose-500 to-pink-600 rounded-full mr-2 group-hover:w-2 transition-all"></span>
                  Makeup Services
                </Link>
              </li>
              <li>
                <Link href={ROUTES.SKIN} className="text-gray-600 hover:text-rose-600 transition-colors text-sm flex items-center group">
                  <span className="w-1 h-1 bg-gradient-to-r from-rose-500 to-pink-600 rounded-full mr-2 group-hover:w-2 transition-all"></span>
                  Skin Treatments
                </Link>
              </li>
              <li>
                <Link href={ROUTES.HAIR} className="text-gray-600 hover:text-rose-600 transition-colors text-sm flex items-center group">
                  <span className="w-1 h-1 bg-gradient-to-r from-rose-500 to-pink-600 rounded-full mr-2 group-hover:w-2 transition-all"></span>
                  Hair Services
                </Link>
              </li>
              <li>
                <Link href={ROUTES.NAIL} className="text-gray-600 hover:text-rose-600 transition-colors text-sm flex items-center group">
                  <span className="w-1 h-1 bg-gradient-to-r from-rose-500 to-pink-600 rounded-full mr-2 group-hover:w-2 transition-all"></span>
                  Nail Art
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-600 hover:text-rose-600 transition-colors text-sm flex items-center group">
                  <span className="w-1 h-1 bg-gradient-to-r from-rose-500 to-pink-600 rounded-full mr-2 group-hover:w-2 transition-all"></span>
                  Beauty Blog
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-rose-600 transition-colors text-sm flex items-center group">
                  <span className="w-1 h-1 bg-gradient-to-r from-rose-500 to-pink-600 rounded-full mr-2 group-hover:w-2 transition-all"></span>
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-lg text-gray-800 mb-4">Contact Us</h4>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-start text-gray-600 text-sm">
                <MapPin className="w-4 h-4 mr-2 mt-0.5 text-rose-500 shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Visit Us</p>
                  <p>Bhootnath Road, Patna, Bihar 800001</p>
                  <a 
                    href="https://maps.google.com/?q=25.5873981,85.1757259" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-rose-600 hover:text-rose-700 text-xs mt-1 inline-block"
                  >
                    Get Directions →
                  </a>
                </div>
              </div>
              
              <div className="flex items-center text-gray-600 text-sm">
                <Phone className="w-4 h-4 mr-2 text-rose-500" />
                <div>
                  <p className="font-medium text-gray-900">Call Us</p>
                  <a href="tel:+919650461390" className="hover:text-rose-600">+91 96504 61390</a>
                </div>
              </div>
              
              <div className="flex items-center text-gray-600 text-sm">
                <Clock className="w-4 h-4 mr-2 text-rose-500" />
                <div>
                  <p className="font-medium text-gray-900">Open Hours</p>
                  <p>10:00 AM - 8:00 PM (Daily)</p>
                </div>
              </div>
              
              <div className="flex items-center text-gray-600 text-sm">
                <Mail className="w-4 h-4 mr-2 text-rose-500" />
                <div>
                  <p className="font-medium text-gray-900">Email</p>
                  <a href="mailto:kritikasalonpatna@gmail.com" className="hover:text-rose-600">kritikasalonpatna@gmail.com</a>
                </div>
              </div>
            </div>

            {/* Book Button */}
            <Link
              href="/cart"
              className="inline-block w-full text-center bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-3 rounded-xl font-medium hover:from-rose-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg text-sm"
            >
              Book Appointment
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-gray-600 text-xs mb-2">
                © {new Date().getFullYear()} Kritika Beauty Salon Patna. All rights reserved.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start space-x-4 text-xs text-gray-500">
                <Link href={ROUTES.PRIVACY} className="hover:text-rose-600 transition-colors">Privacy Policy</Link>
                <Link href={ROUTES.TERMS} className="hover:text-rose-600 transition-colors">Terms of Service</Link>
                <Link href="/cancellation" className="hover:text-rose-600 transition-colors">Cancellation Policy</Link>
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              Made with 💖 in Patna
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}