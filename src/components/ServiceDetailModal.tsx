// app/components/ServiceDetailModal.tsx – FEMININE REDESIGN v2
"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Clock, ChevronDown, ChevronUp, Star, Heart, Calendar, MapPin, Phone, Award, Sparkles, AlertCircle, Shield, Globe, Users, Clock4, Award as AwardIcon } from 'lucide-react';
import { Service } from '../types/service';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import seoData from '../../public/seo.json';

interface ServiceDetailModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (service: Service) => void;
  activeFaq: number | null;
  setActiveFaq: (index: number | null) => void;
}

const ServiceDetailModal = ({
  service,
  isOpen,
  onClose,
  onAddToCart,
  activeFaq,
  setActiveFaq
}: ServiceDetailModalProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'benefits' | 'faqs' | 'location'>('overview');
  const [imageLoading, setImageLoading] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus trap
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements && focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!service) return null;

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const discountPercentage = service.originalPrice && service.originalPrice > service.price
    ? Math.round(((service.originalPrice - service.price) / service.originalPrice) * 100)
    : 0;

  // Generate comprehensive schema data (unchanged from original)
  const generateServiceSchema = () => {
    interface ServiceSchema {
      "@context": string;
      "@type": string;
      "name": string;
      "description": string;
      "serviceType"?: string;
      "image"?: string;
      "brand": {
        "@type": string;
        "name": string;
      };
      "provider": {
        "@type": string;
        "name": string;
        "telephone": string;
        "address": {
          "@type": string;
          "streetAddress": string;
          "addressLocality": string;
          "addressRegion": string;
          "postalCode": string;
          "addressCountry": string;
        };
        "geo": {
          "@type": string;
          "latitude": number;
          "longitude": number;
        };
        "openingHours": string[];
        "priceRange": string;
      };
      "areaServed": {
        "@type": string;
        "geoMidpoint": {
          "@type": string;
          "latitude": number;
          "longitude": number;
        };
        "geoRadius": string;
      };
      "offers": {
        "@type": string;
        "price": number;
        "priceCurrency": string;
        "availability": string;
        "url": string;
        "priceValidUntil": string;
        "seller": {
          "@type": string;
          "name": string;
        };
      };
      "aggregateRating"?: {
        "@type": string;
        "ratingValue": number;
        "reviewCount": number;
        "bestRating": string;
        "worstRating": string;
      };
      "mainEntity"?: {
        "@type": string;
        "mainEntity": Array<{
          "@type": string;
          "name": string;
          "acceptedAnswer": {
            "@type": string;
            "text": string;
          };
        }>;
      };
    }

    const schema: ServiceSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": service.title,
      "description": service.description || service.shortDescription || "",
      "serviceType": service.category || "Beauty Service",
      "image": service.image,
      "brand": {
        "@type": "BeautySalon",
        "name": seoData.business.name
      },
      "provider": {
        "@type": "BeautySalon",
        "name": seoData.business.name,
        "telephone": seoData.business.contact.phone,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": seoData.business.address.street,
          "addressLocality": seoData.business.address.locality,
          "addressRegion": seoData.business.address.state,
          "postalCode": seoData.business.address.pincode,
          "addressCountry": seoData.business.address.country
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": seoData.business.coordinates.latitude,
          "longitude": seoData.business.coordinates.longitude
        },
        "openingHours": [
          `Mo-Fr ${seoData.business.workingHours.weekdays}`,
          `Sa-Su ${seoData.business.workingHours.weekends}`
        ],
        "priceRange": "₹₹"
      },
      "areaServed": {
        "@type": "GeoCircle",
        "geoMidpoint": {
          "@type": "GeoCoordinates",
          "latitude": seoData.business.coordinates.latitude,
          "longitude": seoData.business.coordinates.longitude
        },
        "geoRadius": seoData.business.serviceRadius
      },
      "offers": {
        "@type": "Offer",
        "price": service.price,
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock",
        "url": service.url
          ? `${seoData.business.contact.website}${service.url}`
          : `${seoData.business.contact.website}/${service.primaryCategory}/${service.slug || service.id}`,
        "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        "seller": {
          "@type": "Organization",
          "name": seoData.business.name
        }
      }
    };

    if (service.rating && service.reviewCount && service.reviewCount >= 5) {
      schema["aggregateRating"] = {
        "@type": "AggregateRating",
        "ratingValue": service.rating,
        "reviewCount": service.reviewCount || 0,
        "bestRating": "5",
        "worstRating": "1"
      };
    }

    if (service.faqs && service.faqs.length > 0) {
      schema["mainEntity"] = {
        "@type": "FAQPage",
        "mainEntity": service.faqs.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      };
    }

    return schema;
  };

  // Generate alt text with local keywords (unchanged)
  const generateAltText = () => {
    return `${service.title} - Professional ${service.category} Service at ${seoData.business.name} in ${seoData.business.address.locality}, Patna | Book Now`;
  };

  // Generate local landmarks text (unchanged)
  const generateLandmarksText = () => {
    if (!service.nearbyLandmarks || service.nearbyLandmarks.length === 0) return '';
    return `Conveniently located near ${service.nearbyLandmarks.slice(0, 3).join(', ')} in Patna.`;
  };

  // Handle add to cart with analytics (unchanged)
  const handleAddToCart = (service: Service) => {
    // Track event for analytics
    if (window.gtag) {
      window.gtag('event', 'add_to_cart', {
        items: [{
          item_name: service.title,
          item_id: service.id,
          price: service.price,
          item_category: service.category
        }]
      });
    }
    onAddToCart(service);
  };

  // Calculate savings
  const savings = service.originalPrice && service.originalPrice > service.price
    ? service.originalPrice - service.price
    : 0;

  return (
    <>
      {/* Structured data injection */}
      {isOpen && service && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateServiceSchema()) }}
        />
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-modal-title"
            aria-describedby="service-modal-description"
          >
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
              itemScope
              itemType="https://schema.org/Service"
            >
              {/* ✅ STICKY CLOSE BAR — always visible */}
              <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-md border-b border-gray-100 rounded-t-3xl flex-shrink-0">
                <span className="text-sm font-semibold text-gray-600 truncate max-w-[70%]">
                  {service.title}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleFavorite}
                    className={`p-2.5 rounded-xl transition-all focus:ring-2 focus:ring-pink-300 touch-target ${
                      isFavorite
                        ? 'bg-rose-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-500 hover:bg-rose-100 hover:text-rose-500'
                    }`}
                    aria-label={isFavorite ? `Remove ${service.title} from favorites` : `Add ${service.title} to favorites`}
                    aria-pressed={isFavorite}
                  >
                    <Heart className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2.5 bg-gray-100 hover:bg-rose-100 hover:text-rose-600 rounded-xl text-gray-600 transition-colors focus:ring-2 focus:ring-pink-300 touch-target"
                    aria-label="Close service details"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable content area */}
              <div className="overflow-y-auto flex-1">
                {/* Hidden comprehensive SEO content */}
                <div className="sr-only" aria-hidden="true">
                  <h1 id="service-modal-title" itemProp="name">{service.title}</h1>
                  <p id="service-modal-description" itemProp="description">{service.description}</p>
                  <p>Available at {seoData.business.name} in {seoData.business.address.locality}, Patna</p>
                  {generateLandmarksText()}
                </div>

                {/* ── HEADER WITH IMAGE (FIXED ASPECT RATIO) ── */}
                <div className="relative">
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src={service.image || '/all-services.webp'}
                      alt={generateAltText()}
                      fill
                      className={`object-cover ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                      priority
                      quality={90}
                      sizes="(max-width: 768px) 100vw, 1200px"
                      onLoad={() => setImageLoading(false)}
                      itemProp="image"
                    />
                    {imageLoading && (
                      <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 animate-pulse" />
                    )}
                    {/* Softer feminine gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-rose-900/60 via-rose-400/20 to-transparent" />
                  </div>

                  {/* Image overlay content – only essential items */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                      <div>
                        {/* Category badge – soft pill */}
                        <span className="inline-block bg-white/90 backdrop-blur-sm text-rose-600 px-3 py-1 rounded-full text-xs font-semibold mb-2 shadow-sm">
                          {service.category}
                        </span>
                        <h1 className="text-white text-12px md:text-10px font-bold leading-tight drop-shadow-md">
                          {service.title}
                        </h1>
                        {/* Price & discount – only on overlay */}
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-white text-12px md:text-10px font-bold drop-shadow-md">
                            ₹{service.price}
                          </span>
                          {discountPercentage > 0 && (
                            <span className="bg-rose-500 text-white px-2 py-0.5 rounded-full text-sm font-bold shadow-md">
                              {discountPercentage}% OFF
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Wishlist button (top right) */}
                  <button
                    onClick={toggleFavorite}
                    className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:scale-110 transition-transform"
                    aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-gray-600'}`} />
                  </button>
                </div>

                {/* ── CONTENT BELOW IMAGE (now includes moved elements) ── */}
                <div className="p-4 md:p-8 space-y-8">
                  {/* Moved badges: duration, rating, location, trending etc. */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Duration */}
                    <div className="flex items-center bg-rose-50 text-rose-700 px-3 py-1.5 rounded-full text-sm">
                      <Clock className="w-4 h-4 mr-1" />
                      <time dateTime={`PT${service.duration}M`}>{service.duration} min</time>
                    </div>
                    {/* Rating (if enough reviews) */}
                    {service.rating && service.reviewCount && service.reviewCount >= 5 && (
                      <div className="flex items-center bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-sm">
                        <Star className="w-4 h-4 mr-1 fill-current" />
                        {service.rating} ({service.reviewCount})
                      </div>
                    )}
                    {/* Trending badge */}
                    {service.isTrending && (
                      <div className="flex items-center bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full text-sm">
                        <Sparkles className="w-4 h-4 mr-1" />
                        Trending in Patna
                      </div>
                    )}
                    {/* Bestseller badge */}
                    {service.isBestSeller && (
                      <div className="flex items-center bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full text-sm">
                        <AwardIcon className="w-4 h-4 mr-1" />
                        Bestseller
                      </div>
                    )}
                    {/* Home service available */}
                    {(service as any).homeService && (
                      <div className="flex items-center bg-sky-50 text-sky-700 px-3 py-1.5 rounded-full text-sm">
                        🏠 Home Service
                      </div>
                    )}
                  </div>

                  {/* Pricing & Quick Actions (moved from overlay) */}
                  <div className="flex flex-col lg:flex-row justify-between items-center gap-8 p-8 bg-gradient-to-r from-rose-50 via-pink-50 to-purple-50 rounded-3xl border border-pink-200">
                    <div className="flex-1">
                      <div className="flex items-baseline gap-4 mb-2">
                        <p className="text-16px font-bold text-rose-600" aria-label={`Price: ₹${service.price}`}>
                          ₹{service.price}
                        </p>
                        {service.originalPrice && service.originalPrice > service.price && (
                          <>
                            <p className="text-gray-400 line-through text-12px" aria-label="Original price">
                              ₹{service.originalPrice}
                            </p>
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                              Save ₹{savings}
                            </span>
                          </>
                        )}
                      </div>
                      <p className="text-rose-500 font-bold text-lg">All inclusive | No hidden charges</p>
                      <div className="mt-3 text-gray-600 text-sm">
                        <p>📍 Available at our {seoData.business.address.locality}, Patna salon</p>
                        <p>🕐 Duration: {service.duration} minutes</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={() => handleAddToCart(service)}
                        className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center space-x-3 min-w-[200px] focus:ring-2 focus:ring-rose-300 focus:outline-none"
                        aria-label={`Book ${service.title} appointment at ${seoData.business.name}`}
                        data-gtm="modal-add-to-cart"
                      >
                        <Calendar className="w-5 h-5" aria-hidden="true" />
                        <span className="text-lg">Book Now in Patna</span>
                      </button>
                      <div className="flex flex-col items-center gap-2">
                        <a
                          href={`tel:${seoData.business.contact.phone}`}
                          className="flex items-center justify-center space-x-2 text-gray-700 hover:text-rose-600 transition-colors text-sm font-medium"
                          aria-label="Call to book appointment"
                        >
                          <Phone className="w-4 h-4" aria-hidden="true" />
                          <span>Call: {seoData.business.contact.phone}</span>
                        </a>
                        <a
                          href={`https://wa.me/${seoData.business.contact.whatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center space-x-2 text-green-600 hover:text-green-700 transition-colors text-sm font-medium"
                          aria-label="Chat on WhatsApp"
                        >
                          <span className="text-lg">💬</span>
                          <span>WhatsApp Instant Booking</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Local Trust Indicators (unchanged) */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl border border-green-200">
                      <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" aria-hidden="true" />
                      <p className="text-sm font-bold text-green-800">Patna's Trusted Salon</p>
                      <p className="text-xs text-green-600">5+ Years in {seoData.business.address.locality}</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-100 rounded-2xl border border-blue-200">
                      <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" aria-hidden="true" />
                      <p className="text-sm font-bold text-blue-800">10,000+ Patna Clients</p>
                      <p className="text-xs text-blue-600">Highly Rated in Patna</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl border border-purple-200">
                      <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" aria-hidden="true" />
                      <p className="text-sm font-bold text-purple-800">Certified Experts</p>
                      <p className="text-xs text-purple-600">Patna's Best Artists</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-rose-50 to-pink-100 rounded-2xl border border-rose-200">
                      <Clock4 className="w-8 h-8 text-rose-600 mx-auto mb-2" aria-hidden="true" />
                      <p className="text-sm font-bold text-rose-800">Same Day Slots</p>
                      <p className="text-xs text-rose-600">Available Today in Patna</p>
                    </div>
                  </div>

                  {/* Enhanced Tabs with Location (unchanged) */}
                  <div className="mb-6">
                    <nav className="flex flex-wrap gap-2 border-b border-gray-200" role="tablist" aria-label="Service information tabs">
                      <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-3 font-semibold transition-colors relative focus:outline-none focus:ring-2 focus:ring-rose-300 rounded-t-lg ${
                          activeTab === 'overview'
                            ? 'text-rose-600 border-b-2 border-rose-600 bg-rose-50'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                        role="tab"
                        aria-selected={activeTab === 'overview'}
                        aria-controls="overview-panel"
                        id="overview-tab"
                      >
                        Overview
                      </button>
                      <button
                        onClick={() => setActiveTab('benefits')}
                        className={`px-6 py-3 font-semibold transition-colors relative focus:outline-none focus:ring-2 focus:ring-rose-300 rounded-t-lg ${
                          activeTab === 'benefits'
                            ? 'text-rose-600 border-b-2 border-rose-600 bg-rose-50'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                        role="tab"
                        aria-selected={activeTab === 'benefits'}
                        aria-controls="benefits-panel"
                        id="benefits-tab"
                      >
                        Benefits & Details
                      </button>
                      <button
                        onClick={() => setActiveTab('faqs')}
                        className={`px-6 py-3 font-semibold transition-colors relative focus:outline-none focus:ring-2 focus:ring-rose-300 rounded-t-lg ${
                          activeTab === 'faqs'
                            ? 'text-rose-600 border-b-2 border-rose-600 bg-rose-50'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                        role="tab"
                        aria-selected={activeTab === 'faqs'}
                        aria-controls="faqs-panel"
                        id="faqs-tab"
                      >
                        FAQs ({service.faqs?.length || 0})
                      </button>
                      <button
                        onClick={() => setActiveTab('location')}
                        className={`px-6 py-3 font-semibold transition-colors relative focus:outline-none focus:ring-2 focus:ring-rose-300 rounded-t-lg ${
                          activeTab === 'location'
                            ? 'text-rose-600 border-b-2 border-rose-600 bg-rose-50'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                        role="tab"
                        aria-selected={activeTab === 'location'}
                        aria-controls="location-panel"
                        id="location-tab"
                      >
                        <MapPin className="w-4 h-4 inline mr-2" />
                        Patna Location
                      </button>
                    </nav>
                  </div>

                  {/* Tab Content (unchanged – keep as is) */}
                  <div className="min-h-[400px]">
                    {activeTab === 'overview' && (
                      <div id="overview-panel" role="tabpanel" aria-labelledby="overview-tab" className="space-y-8">
                        <section aria-labelledby="description-heading">
                          <h2 id="description-heading" className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                            <span className="w-3 h-3 bg-rose-500 rounded-full mr-3"></span>
                            About This Service in Patna
                          </h2>
                          <p className="text-gray-600 text-lg leading-relaxed">{service.description}</p>
                          {service.detailed_description && (
                            <p className="text-gray-600 text-lg leading-relaxed mt-4">{service.detailed_description}</p>
                          )}
                        </section>

                        {service.keyIngredients && service.keyIngredients.length > 0 && (
                          <section aria-labelledby="ingredients-heading">
                            <h3 id="ingredients-heading" className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                              <span className="w-3 h-3 bg-rose-500 rounded-full mr-3"></span>
                              🌿 Premium Products Used at Our Patna Salon
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {service.keyIngredients.map((ingredient, index) => (
                                <div key={index} className="flex flex-col items-center bg-white p-4 rounded-2xl shadow-lg border border-pink-100 hover:shadow-xl transition-shadow">
                                  <div className="w-16 h-16 bg-gradient-to-r from-rose-100 to-pink-100 rounded-2xl flex items-center justify-center mb-3">
                                    <Check className="text-rose-500 w-8 h-8" aria-hidden="true" />
                                  </div>
                                  <span className="text-sm font-bold text-center text-gray-800">{ingredient}</span>
                                </div>
                              ))}
                            </div>
                          </section>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {service.whatsIncluded && service.whatsIncluded.length > 0 && (
                            <section aria-labelledby="included-heading" className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-3xl border border-green-200">
                              <h4 id="included-heading" className="text-xl font-bold text-green-800 mb-4 flex items-center">
                                <Check className="w-5 h-5 mr-2" aria-hidden="true" />
                                What's Included at Our Patna Salon
                              </h4>
                              <ul className="space-y-3">
                                {service.whatsIncluded.map((item, idx) => (
                                  <li key={idx} className="flex items-start text-gray-700">
                                    <Check className="text-green-500 mt-1 mr-3 shrink-0 w-4 h-4" aria-hidden="true" />
                                    <span className="text-lg">{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </section>
                          )}
                          {service.whatsNotIncluded && service.whatsNotIncluded.length > 0 && (
                            <section aria-labelledby="not-included-heading" className="bg-gradient-to-br from-red-50 to-rose-50 p-6 rounded-3xl border border-red-200">
                              <h4 id="not-included-heading" className="text-xl font-bold text-red-800 mb-4 flex items-center">
                                <X className="w-5 h-5 mr-2" aria-hidden="true" />
                                What's Not Included
                              </h4>
                              <ul className="space-y-3">
                                {service.whatsNotIncluded.map((item, idx) => (
                                  <li key={idx} className="flex items-start text-gray-700">
                                    <X className="text-red-500 mt-1 mr-3 shrink-0 w-4 h-4" aria-hidden="true" />
                                    <span className="text-lg">{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </section>
                          )}
                        </div>
                      </div>
                    )}

                    {activeTab === 'benefits' && (
                      <div id="benefits-panel" role="tabpanel" aria-labelledby="benefits-tab" className="space-y-8">
                        <section aria-labelledby="benefits-heading">
                          <h3 id="benefits-heading" className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <span className="w-3 h-3 bg-rose-500 rounded-full mr-3"></span>
                            ✨ Benefits You'll Experience at Our Patna Salon
                          </h3>
                          {service.benefits && service.benefits.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {service.benefits.map((benefit, index) => (
                                <div key={index} className="flex items-start bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-2xl border border-pink-100 hover:border-pink-300 transition-colors">
                                  <Check className="text-green-500 mt-1 mr-4 shrink-0 w-6 h-6" aria-hidden="true" />
                                  <div>
                                    <p className="text-gray-800 font-bold text-lg mb-1">Benefit {index + 1}</p>
                                    <p className="text-gray-700">{benefit}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </section>

                        {service.idealFor && service.idealFor.length > 0 && (
                          <section aria-labelledby="ideal-for-heading">
                            <h3 id="ideal-for-heading" className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                              <span className="w-3 h-3 bg-rose-500 rounded-full mr-3"></span>
                              👥 Perfect For Patna Residents
                            </h3>
                            <div className="flex flex-wrap gap-4">
                              {service.idealFor.map((use, idx) => (
                                <span
                                  key={idx}
                                  className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-6 py-3 rounded-2xl text-base font-semibold border border-purple-200 hover:scale-105 transition-transform"
                                >
                                  {use}
                                </span>
                              ))}
                            </div>
                          </section>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {service.precautions && (
                            <section className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-3xl border border-red-200">
                              <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2" aria-hidden="true" />
                                Important Precautions
                              </h3>
                              <p className="text-red-700 text-lg">{service.precautions}</p>
                            </section>
                          )}
                          {service.aftercare && (
                            <section className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-3xl border border-green-200">
                              <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center">
                                <Sparkles className="w-5 h-5 mr-2" aria-hidden="true" />
                                Aftercare Tips for Patna Climate
                              </h3>
                              <p className="text-green-700 text-lg">{service.aftercare}</p>
                            </section>
                          )}
                        </div>

                        {service.addOns && service.addOns.length > 0 && (
                          <section aria-labelledby="addons-heading">
                            <h3 id="addons-heading" className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                              <span className="w-3 h-3 bg-rose-500 rounded-full mr-3"></span>
                              ➕ Available Add-ons at Patna Salon
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {service.addOns.map((addon, idx) => (
                                <div key={idx} className="border-2 border-pink-200 rounded-2xl p-6 hover:border-rose-400 hover:shadow-xl transition-all group cursor-pointer">
                                  <h4 className="font-bold text-gray-800 text-lg mb-3 group-hover:text-rose-600">{addon.name}</h4>
                                  <p className="text-rose-600 font-bold text-xl">+ ₹{addon.price}</p>
                                  <button
                                    className="mt-4 text-sm text-pink-600 hover:text-rose-700 font-medium"
                                    aria-label={`Add ${addon.name} to booking`}
                                  >
                                    Add to booking →
                                  </button>
                                </div>
                              ))}
                            </div>
                          </section>
                        )}
                      </div>
                    )}

                    {activeTab === 'faqs' && (
                      <div id="faqs-panel" role="tabpanel" aria-labelledby="faqs-tab">
                        {service.faqs && service.faqs.length > 0 ? (
                          <section aria-labelledby="faq-heading">
                            <h2 id="faq-heading" className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                              <span className="w-3 h-3 bg-rose-500 rounded-full mr-3"></span>
                              ❓ Frequently Asked Questions About {service.title} in Patna
                            </h2>
                            <div className="space-y-4" itemScope itemType="https://schema.org/FAQPage">
                              {service.faqs.map((faq, index) => (
                                <div
                                  key={index}
                                  className="border-2 border-pink-100 rounded-2xl overflow-hidden hover:border-rose-200 transition-colors"
                                  itemScope
                                  itemProp="mainEntity"
                                  itemType="https://schema.org/Question"
                                >
                                  <button
                                    className="w-full flex justify-between items-center p-6 text-left bg-white hover:bg-rose-50 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-300"
                                    onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                                    aria-expanded={activeFaq === index}
                                    aria-controls={`faq-answer-${index}`}
                                    id={`faq-question-${index}`}
                                  >
                                    <span className="font-bold text-rose-700 text-lg pr-4" itemProp="name">
                                      {faq.question}
                                    </span>
                                    {activeFaq === index ?
                                      <ChevronUp className="text-rose-500 shrink-0" aria-hidden="true" /> :
                                      <ChevronDown className="text-rose-500 shrink-0" aria-hidden="true" />
                                    }
                                  </button>
                                  <AnimatePresence>
                                    {activeFaq === index && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                        id={`faq-answer-${index}`}
                                        aria-labelledby={`faq-question-${index}`}
                                        itemScope
                                        itemProp="acceptedAnswer"
                                        itemType="https://schema.org/Answer"
                                      >
                                        <div className="p-6 bg-rose-50 text-gray-700 text-lg" itemProp="text">
                                          {faq.answer}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              ))}
                            </div>
                          </section>
                        ) : (
                          <div className="text-center py-12 bg-gray-50 rounded-3xl">
                            <p className="text-gray-500 text-lg">No FAQs available for this service.</p>
                            <p className="text-sm text-gray-400 mt-2">
                              Call us at {seoData.business.contact.phone} for any questions about {service.title} in Patna
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'location' && (
                      <div id="location-panel" role="tabpanel" aria-labelledby="location-tab" className="space-y-8">
                        <section aria-labelledby="location-heading">
                          <h2 id="location-heading" className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <span className="w-3 h-3 bg-rose-500 rounded-full mr-3"></span>
                            📍 Our Patna Salon Location
                          </h2>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-3xl border border-blue-200">
                              <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
                                <MapPin className="w-5 h-5 mr-2" aria-hidden="true" />
                                Salon Address
                              </h3>
                              <address className="not-italic text-gray-700 text-lg mb-6">
                                <strong>{seoData.business.name}</strong><br />
                                {seoData.business.address.street}<br />
                                {seoData.business.address.locality}<br />
                                Patna, {seoData.business.address.state} - {seoData.business.address.pincode}
                              </address>

                              <div className="space-y-4">
                                <a
                                  href={seoData.localSEOOptimization.localCitations.googleMaps}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-colors"
                                  aria-label="Get directions on Google Maps"
                                >
                                  <MapPin className="w-5 h-5" aria-hidden="true" />
                                  Get Directions to Patna Salon
                                </a>
                                <a
                                  href={`tel:${seoData.business.contact.phone}`}
                                  className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-800 font-medium text-lg"
                                  aria-label="Call Patna salon"
                                >
                                  <Phone className="w-5 h-5" aria-hidden="true" />
                                  Call Patna Salon: {seoData.business.contact.phone}
                                </a>
                              </div>
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-3xl border border-green-200">
                              <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center">
                                <Clock className="w-5 h-5 mr-2" aria-hidden="true" />
                                Working Hours in Patna
                              </h3>
                              <div className="space-y-3 text-lg">
                                <p className="flex justify-between">
                                  <span className="font-semibold">Monday - Friday:</span>
                                  <span>{seoData.business.workingHours.weekdays}</span>
                                </p>
                                <p className="flex justify-between">
                                  <span className="font-semibold">Saturday - Sunday:</span>
                                  <span>{seoData.business.workingHours.weekends}</span>
                                </p>
                                <p className="flex justify-between">
                                  <span className="font-semibold">Holidays:</span>
                                  <span>Open (Limited Hours)</span>
                                </p>
                              </div>

                              {service.nearbyLandmarks && service.nearbyLandmarks.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-green-200">
                                  <h4 className="font-bold text-gray-800 mb-3">Nearby Landmarks in Patna:</h4>
                                  <ul className="space-y-2">
                                    {service.nearbyLandmarks.map((landmark, idx) => (
                                      <li key={idx} className="flex items-center text-gray-700">
                                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                                        {landmark}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </section>

                        <div className="bg-gray-50 p-6 rounded-3xl">
                          <h3 className="font-bold text-gray-800 mb-4">Popular in Patna</h3>
                          <div className="flex flex-wrap gap-2">
                            {[
                              `${service.category} in Patna`,
                              `Best ${service.category} near ${seoData.business.address.locality}`,
                              `Professional ${service.category} Patna`,
                              `Affordable ${service.category} salon Patna`,
                              `${service.category} services ${seoData.business.address.locality}`
                            ].map((keyword, idx) => (
                              <span key={idx} className="bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded-full text-sm">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Final CTA Section with Local Context (unchanged) */}
                  <div className="mt-12 bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 rounded-3xl p-10 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="relative z-10">
                      <h3 className="text-3xl font-bold text-white mb-4">
                      You deserve to feel beautiful ✨
                    </h3>
                    <p className="text-pink-100 text-xl mb-8 max-w-2xl mx-auto">
                      Join {service.bookingCount || 200}+ happy clients who chose Kritika's {service.category} experience in Patna.
                    </p>
                      <div className="flex flex-col sm:flex-row gap-6 max-w-2xl mx-auto">
                        <button
                          onClick={() => {
                            handleAddToCart(service);
                            onClose();
                          }}
                          className="flex-1 bg-white text-rose-600 py-5 px-8 rounded-2xl font-bold hover:scale-105 transition-transform text-xl shadow-2xl"
                          aria-label={`Book ${service.title} at Patna salon`}
                          data-gtm="modal-cta-book"
                        >
                          Book My Appointment →
                        </button>
                        <a
                          href={`tel:${seoData.business.contact.phone}`}
                          className="flex-1 bg-black/80 text-white py-5 px-8 rounded-2xl font-bold hover:scale-105 transition-transform text-xl border-2 border-white/30 shadow-2xl flex items-center justify-center gap-3"
                          aria-label="Call Patna salon for booking"
                        >
                          <Phone className="w-5 h-5" aria-hidden="true" />
                          Call Patna Salon
                        </a>
                      </div>

                      <div className="mt-8 flex flex-wrap justify-center items-center gap-6 text-white/90 text-base">
                        <a
                          href={`https://wa.me/${seoData.business.contact.whatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 hover:text-white transition-colors bg-green-600/30 px-4 py-2 rounded-xl backdrop-blur-sm"
                          aria-label="Chat on WhatsApp for Patna booking"
                        >
                          <span className="text-xl">💬</span>
                          WhatsApp Patna Salon
                        </a>
                        <a
                          href={seoData.localSEOOptimization.localCitations.googleMaps}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 hover:text-white transition-colors bg-blue-600/30 px-4 py-2 rounded-xl backdrop-blur-sm"
                          aria-label="Get directions to Patna salon"
                        >
                          <MapPin className="w-5 h-5" aria-hidden="true" />
                          Directions to Patna
                        </a>
                        <a
                          href={`mailto:${seoData.business.contact.email}`}
                          className="flex items-center gap-2 hover:text-white transition-colors bg-purple-600/30 px-4 py-2 rounded-xl backdrop-blur-sm"
                          aria-label="Email Patna salon"
                        >
                          <span className="text-xl">✉️</span>
                          Email Us
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Location & Contact Info (unchanged) */}
                  <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 bg-gradient-to-r from-gray-50 to-blue-50 p-8 rounded-3xl border border-gray-200">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg mb-4 flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-rose-600" aria-hidden="true" />
                        Visit Our Patna Salon
                      </h4>
                      <address className="not-italic text-gray-700 text-base leading-relaxed">
                        <strong>{seoData.business.name}</strong><br />
                        {seoData.business.address.street}<br />
                        {seoData.business.address.locality}, Patna<br />
                        {seoData.business.address.state} - {seoData.business.address.pincode}
                      </address>
                      <div className="mt-4">
                        <p className="text-sm text-gray-500">Parking available | Wheelchair accessible</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg mb-4 flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-rose-600" aria-hidden="true" />
                        Patna Salon Hours
                      </h4>
                      <div className="space-y-2 text-gray-700">
                        <p><strong>Weekdays:</strong> {seoData.business.workingHours.weekdays}</p>
                        <p><strong>Weekends:</strong> {seoData.business.workingHours.weekends}</p>
                        <p className="text-green-600 font-semibold">✨ Extended hours available by appointment</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg mb-4 flex items-center">
                        <Phone className="w-5 h-5 mr-2 text-rose-600" aria-hidden="true" />
                        Contact Patna Salon
                      </h4>
                      <div className="space-y-3">
                        <a href={`tel:${seoData.business.contact.phone}`} className="block text-rose-600 hover:text-rose-700 font-bold text-lg">
                          📞 {seoData.business.contact.phone}
                        </a>
                        <a href={`mailto:${seoData.business.contact.email}`} className="block text-gray-700 hover:text-rose-600">
                          ✉️ {seoData.business.contact.email}
                        </a>
                        <div className="flex gap-4 mt-4">
                          <a
                            href={seoData.business.socialMedia.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Follow on Instagram"
                            className="text-pink-600 hover:text-pink-700"
                          >
                            Instagram
                          </a>
                          <a
                            href={seoData.business.socialMedia.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Follow on Facebook"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Facebook
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>{/* end scrollable content */}
              </div>{/* end scrollable area */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ServiceDetailModal;