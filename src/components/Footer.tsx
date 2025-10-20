"use client";

import Link from 'next/link';
import { ROUTES } from '../constants/Routes';
import { FiInstagram, FiFacebook, FiTwitter, FiYoutube, FiMail, FiPhone, FiMapPin, FiHeart } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-pink-50 to-purple-50 border-t border-pink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-2">💄</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
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
                <a href="#" className="bg-white p-2 rounded-full shadow-sm text-pink-500 hover:text-pink-700 transition-all hover:shadow-md">
                  <FiInstagram className="w-5 h-5" />
                </a>
                <a href="#" className="bg-white p-2 rounded-full shadow-sm text-pink-500 hover:text-pink-700 transition-all hover:shadow-md">
                  <FiFacebook className="w-5 h-5" />
                </a>
                <a href="#" className="bg-white p-2 rounded-full shadow-sm text-pink-500 hover:text-pink-700 transition-all hover:shadow-md">
                  <FiTwitter className="w-5 h-5" />
                </a>
                <a href="#" className="bg-white p-2 rounded-full shadow-sm text-pink-500 hover:text-pink-700 transition-all hover:shadow-md">
                  <FiYoutube className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            {/* Beauty Trends */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Trending Now</h4>
              <div className="flex flex-wrap gap-2">
                <span className="bg-white text-xs text-pink-600 px-2 py-1 rounded-full border border-pink-100">Glass Skin</span>
                <span className="bg-white text-xs text-pink-600 px-2 py-1 rounded-full border border-pink-100">Fox Eyes</span>
                <span className="bg-white text-xs text-pink-600 px-2 py-1 rounded-full border border-pink-100">Blush Draping</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg text-gray-800 mb-4 relative pb-2 after:absolute after:left-0 after:bottom-0 after:w-10 after:h-0.5 after:bg-pink-500">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li><Link href={ROUTES.MAKEUP} className="text-gray-600 hover:text-pink-600 transition-colors text-sm flex items-center">
                <span className="w-1 h-1 bg-pink-300 rounded-full mr-2"></span>Makeup Services
              </Link></li>
              <li><Link href={ROUTES.SKIN} className="text-gray-600 hover:text-pink-600 transition-colors text-sm flex items-center">
                <span className="w-1 h-1 bg-pink-300 rounded-full mr-2"></span>Skincare Treatments
              </Link></li>
              <li><Link href={ROUTES.HAIR} className="text-gray-600 hover:text-pink-600 transition-colors text-sm flex items-center">
                <span className="w-1 h-1 bg-pink-300 rounded-full mr-2"></span>Hair Styling
              </Link></li>
              <li><Link href={ROUTES.NAIL} className="text-gray-600 hover:text-pink-600 transition-colors text-sm flex items-center">
                <span className="w-1 h-1 bg-pink-300 rounded-full mr-2"></span>Nails
              </Link></li>
              <li><Link href={ROUTES.CONTACT} className="text-gray-600 hover:text-pink-600 transition-colors text-sm flex items-center">
                <span className="w-1 h-1 bg-pink-300 rounded-full mr-2"></span>Contact Us
              </Link></li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h4 className="font-semibold text-lg text-gray-800 mb-4 relative pb-2 after:absolute after:left-0 after:bottom-0 after:w-10 after:h-0.5 after:bg-pink-500">
              Stay Updated
            </h4>
            
            <div className="mb-6 space-y-3">
              <div className="flex items-center text-gray-600 text-sm">
                <FiPhone className="w-4 h-4 mr-2 text-pink-500" />
                <span>+91 9650461390</span>
              </div>
              <div className="flex items-center text-gray-600 text-sm">
                <FiMail className="w-4 h-4 mr-2 text-pink-500" />
                <span>support@kritikasalonpatna.com</span>
              </div>
              <div className="flex items-start text-gray-600 text-sm">
                <FiMapPin className="w-4 h-4 mr-2 mt-0.5 text-pink-500 flex-shrink-0" />
                <span>Bhootnath Road, Patna, Bihar, India</span>
              </div>
            </div>
            
            <div>
              <p className="text-gray-600 text-sm mb-2">Get beauty tips & exclusive offers</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="px-3 py-2 text-sm border border-r-0 border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500 w-full"
                />
                <button className="bg-pink-500 text-white px-4 py-2 rounded-r-md hover:bg-pink-600 transition-colors text-sm">
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600 text-xs mb-2">© {new Date().getFullYear()} KRITIKA Beauty Salon</p>
            <div className="flex space-x-4 text-xs text-gray-500">
              <Link href={ROUTES.PRIVACY} className="hover:text-pink-600">Privacy</Link>
              <Link href={ROUTES.TERMS} className="hover:text-pink-600">Terms</Link>
              <Link href="/cancellation" className="hover:text-pink-600">Cancellation</Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-xs text-gray-500">
              <span className="mr-1">Made with</span>
              <FiHeart className="text-pink-500" />
              <span className="ml-1">for beautiful people</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}