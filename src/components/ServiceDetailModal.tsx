// app/components/ServiceDetailModal.tsx
// Changes vs previous:
// 1. Lakme Academy trust badge replaces generic "Certified Experts" tile
// 2. No other structural changes — dedup work was done in previous version

"use client";

import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Check, Clock, ChevronDown, ChevronUp, Star, Heart,
  Calendar, MapPin, Phone, Award, Sparkles, AlertCircle,
  Shield, Globe, Users, Clock4, Award as AwardIcon,
} from 'lucide-react';
import { Service } from '../types/service';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import seoData from '../../public/seo.json';

interface ServiceDetailModalProps {
  service:      Service | null;
  isOpen:       boolean;
  onClose:      () => void;
  onAddToCart:  (service: Service) => void;
  activeFaq:    number | null;
  setActiveFaq: (index: number | null) => void;
}

const ServiceDetailModal = ({
  service, isOpen, onClose, onAddToCart, activeFaq, setActiveFaq,
}: ServiceDetailModalProps) => {
  const [isFavorite,    setIsFavorite]   = useState(false);
  const [activeTab,     setActiveTab]    = useState<'overview' | 'benefits' | 'faqs' | 'location'>('overview');
  const [imageLoading,  setImageLoading] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) { document.body.style.overflow = 'unset'; return; }
    document.body.style.overflow = 'hidden';
    const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.[0]?.focus();
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!service) return null;

  const discountPct = service.originalPrice && service.originalPrice > service.price
    ? Math.round(((service.originalPrice - service.price) / service.originalPrice) * 100)
    : 0;
  const savings = service.originalPrice && service.originalPrice > service.price
    ? service.originalPrice - service.price
    : 0;

  const toggleFavorite = (e: React.MouseEvent) => { e.stopPropagation(); setIsFavorite(f => !f); };

  const handleAddToCart = (svc: Service) => {
    if ((window as any).gtag) {
      (window as any).gtag('event', 'add_to_cart', {
        items: [{ item_name: svc.title, item_id: svc.id, price: svc.price, item_category: svc.category }],
      });
    }
    onAddToCart(svc);
  };

  const altText = `${service.title} — ${service.category} at ${seoData.business.name}, ${seoData.business.address.locality} Patna`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-2 md:p-4"
          onClick={onClose}
          role="dialog" aria-modal="true"
          aria-labelledby="service-modal-title"
          aria-describedby="service-modal-description"
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.93, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.93, opacity: 0, y: 16 }}
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl flex flex-col"
            onClick={e => e.stopPropagation()}
          >

            {/* ── STICKY HEADER ── */}
            <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-md border-b border-gray-100 rounded-t-3xl flex-shrink-0">
              <span id="service-modal-title" className="text-sm font-semibold text-gray-700 truncate max-w-[65%]">
                {service.title}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleFavorite}
                  className={`p-2.5 rounded-xl transition-all focus:ring-2 focus:ring-pink-300 ${
                    isFavorite ? 'bg-rose-500 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-rose-100 hover:text-rose-500'
                  }`}
                  aria-label={isFavorite ? `Remove ${service.title} from favorites` : `Save ${service.title} to favorites`}
                  aria-pressed={isFavorite}
                >
                  <Heart className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={onClose}
                  className="p-2.5 bg-gray-100 hover:bg-rose-100 hover:text-rose-600 rounded-xl text-gray-600 transition-colors focus:ring-2 focus:ring-pink-300"
                  aria-label="Close service details"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ── SCROLLABLE CONTENT ── */}
            <div className="overflow-y-auto flex-1">

              <div className="sr-only" aria-hidden="true">
                <h1 id="service-modal-description">
                  {service.title} at {seoData.business.name}, {seoData.business.address.locality} Patna
                </h1>
                <p>{service.description}</p>
              </div>

              {/* IMAGE */}
              <div className="relative h-[200px] md:h-[260px] w-full overflow-hidden">
                <Image
                  src={service.image || '/all-services.webp'}
                  alt={altText}
                  fill
                  className={`object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                  priority quality={85}
                  sizes="(max-width: 768px) 100vw, 900px"
                  onLoad={() => setImageLoading(false)}
                />
                {imageLoading && (
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 animate-pulse" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-rose-900/60 via-rose-400/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="inline-block bg-white/90 backdrop-blur-sm text-rose-600 px-3 py-1 rounded-full text-xs font-semibold mb-2 shadow-sm">
                    {service.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-xl md:text-2xl font-bold drop-shadow">₹{service.price}</span>
                    {discountPct > 0 && (
                      <span className="bg-rose-500 text-white px-2 py-0.5 rounded-full text-sm font-bold shadow">
                        {discountPct}% OFF
                      </span>
                    )}
                    {service.originalPrice && service.originalPrice > service.price && (
                      <span className="text-white/70 text-sm line-through">₹{service.originalPrice}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* MAIN CONTENT */}
              <div className="p-4 md:p-6 space-y-6">

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center bg-rose-50 text-rose-700 px-3 py-1.5 rounded-full text-sm">
                    <Clock className="w-4 h-4 mr-1" />
                    <time dateTime={`PT${service.duration}M`}>{service.duration} min</time>
                  </div>
                  {service.rating && service.reviewCount && service.reviewCount >= 5 && (
                    <div className="flex items-center bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-sm">
                      <Star className="w-4 h-4 mr-1 fill-current" />
                      {service.rating} ({service.reviewCount})
                    </div>
                  )}
                  {service.isTrending && (
                    <div className="flex items-center bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full text-sm">
                      <Sparkles className="w-4 h-4 mr-1" /> Trending
                    </div>
                  )}
                  {service.isBestSeller && (
                    <div className="flex items-center bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full text-sm">
                      <AwardIcon className="w-4 h-4 mr-1" /> Bestseller
                    </div>
                  )}
                  {(service as any).homeService && (
                    <div className="flex items-center bg-sky-50 text-sky-700 px-3 py-1.5 rounded-full text-sm">
                      🏠 Home Service
                    </div>
                  )}
                </div>

                {/* Pricing + Quick Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-5 bg-gradient-to-r from-rose-50 via-pink-50 to-purple-50 rounded-2xl border border-pink-200">
                  <div>
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="text-2xl font-bold text-rose-600">₹{service.price}</span>
                      {savings > 0 && (
                        <>
                          <span className="text-gray-400 line-through text-base">₹{service.originalPrice}</span>
                          <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-sm font-bold">Save ₹{savings}</span>
                        </>
                      )}
                    </div>
                    <p className="text-rose-500 font-semibold text-sm mt-1">All inclusive · No hidden charges</p>
                    <p className="text-gray-500 text-xs mt-1">📍 {seoData.business.address.locality}, Patna · ⏱ {service.duration} min</p>
                  </div>
                  <div className="flex flex-col gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleAddToCart(service)}
                      className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 focus:ring-2 focus:ring-rose-300"
                      aria-label={`Book ${service.title} at ${seoData.business.name}`}
                      data-gtm="modal-add-to-cart"
                    >
                      <Calendar className="w-4 h-4" /> Book Now
                    </button>
                    <div className="flex gap-3 justify-center">
                      <a href={`tel:${seoData.business.contact.phone}`} className="flex items-center gap-1 text-gray-600 hover:text-rose-600 text-sm transition-colors">
                        <Phone className="w-3.5 h-3.5" /> Call
                      </a>
                      <a
                        href={`https://wa.me/${seoData.business.contact.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm transition-colors"
                      >
                        💬 WhatsApp
                      </a>
                    </div>
                  </div>
                </div>

                {/* Trust indicators — ✅ Lakme Academy replaces "Certified Experts" */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    {
                      icon:   <Shield className="w-6 h-6 text-green-600" />,
                      title:  'Trusted Salon',
                      sub:    `5+ yrs in ${seoData.business.address.locality}`,
                      bg:     'from-green-50 to-emerald-100',
                      border: 'border-green-200',
                    },
                    {
                      icon:   <Users className="w-6 h-6 text-blue-600" />,
                      title:  '5000+ Clients',
                      sub:    'Highly rated in Patna',
                      bg:     'from-blue-50 to-cyan-100',
                      border: 'border-blue-200',
                    },
                    {
                      // ✅ Lakme Academy credential here
                      icon:   <span className="text-2xl">🎓</span>,
                      title:  'Lakme Academy',
                      sub:    'Delhi Trained Cosmetologist',
                      bg:     'from-amber-50 to-yellow-100',
                      border: 'border-amber-200',
                    },
                    {
                      icon:   <Clock4 className="w-6 h-6 text-rose-600" />,
                      title:  'Same Day Slots',
                      sub:    'Available today',
                      bg:     'from-rose-50 to-pink-100',
                      border: 'border-rose-200',
                    },
                  ].map((t, i) => (
                    <div key={i} className={`text-center p-3 bg-gradient-to-br ${t.bg} rounded-xl border ${t.border}`}>
                      <div className="flex justify-center mb-1">{t.icon}</div>
                      <p className="text-xs font-bold text-gray-800">{t.title}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{t.sub}</p>
                    </div>
                  ))}
                </div>

                {/* TABS */}
                <nav className="flex flex-wrap gap-1 border-b border-gray-200" role="tablist">
                  {(['overview', 'benefits', 'faqs', 'location'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2.5 text-sm font-semibold transition-colors rounded-t-lg capitalize focus:outline-none focus:ring-2 focus:ring-rose-300 ${
                        activeTab === tab
                          ? 'text-rose-600 border-b-2 border-rose-600 bg-rose-50'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                      role="tab" aria-selected={activeTab === tab}
                    >
                      {tab === 'faqs'     ? `FAQs (${service.faqs?.length || 0})`
                       : tab === 'location' ? '📍 Location'
                       : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </nav>

                {/* TAB CONTENT */}
                <div className="min-h-[300px]">

                  {/* OVERVIEW */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <section>
                        <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                          <span className="w-3 h-3 bg-rose-500 rounded-full inline-block" />
                          About This Service
                        </h2>
                        <p className="text-gray-600 leading-relaxed">{service.description}</p>
                        {service.detailed_description && (
                          <p className="text-gray-600 leading-relaxed mt-3">{service.detailed_description}</p>
                        )}
                      </section>

                      {service.keyIngredients && service.keyIngredients.length > 0 && (
                        <section>
                          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="w-3 h-3 bg-rose-500 rounded-full inline-block" />
                            🌿 Premium Products Used
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {service.keyIngredients.map((item, i) => (
                              <div key={i} className="flex flex-col items-center bg-white p-3 rounded-xl shadow-sm border border-pink-100 text-center">
                                <div className="w-10 h-10 bg-gradient-to-br from-rose-100 to-pink-100 rounded-xl flex items-center justify-center mb-2">
                                  <Check className="text-rose-500 w-5 h-5" />
                                </div>
                                <span className="text-xs font-semibold text-gray-800">{item}</span>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {service.whatsIncluded && service.whatsIncluded.length > 0 && (
                          <section className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-2xl border border-green-200">
                            <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                              <Check className="w-4 h-4" /> What's Included
                            </h4>
                            <ul className="space-y-2">
                              {service.whatsIncluded.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                  <Check className="text-green-500 mt-0.5 w-4 h-4 flex-shrink-0" />{item}
                                </li>
                              ))}
                            </ul>
                          </section>
                        )}
                        {service.whatsNotIncluded && service.whatsNotIncluded.length > 0 && (
                          <section className="bg-gradient-to-br from-red-50 to-rose-50 p-5 rounded-2xl border border-red-200">
                            <h4 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                              <X className="w-4 h-4" /> Not Included
                            </h4>
                            <ul className="space-y-2">
                              {service.whatsNotIncluded.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                  <X className="text-red-500 mt-0.5 w-4 h-4 flex-shrink-0" />{item}
                                </li>
                              ))}
                            </ul>
                          </section>
                        )}
                      </div>
                    </div>
                  )}

                  {/* BENEFITS */}
                  {activeTab === 'benefits' && (
                    <div className="space-y-6">
                      {service.benefits && service.benefits.length > 0 && (
                        <section>
                          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-3 h-3 bg-rose-500 rounded-full inline-block" />
                            ✨ Benefits You'll Experience
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {service.benefits.map((benefit, i) => (
                              <div key={i} className="flex items-start bg-gradient-to-r from-pink-50 to-rose-50 p-4 rounded-xl border border-pink-100">
                                <Check className="text-green-500 mt-0.5 mr-3 w-5 h-5 flex-shrink-0" />
                                <p className="text-gray-700 text-sm">{benefit}</p>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      {service.idealFor && service.idealFor.length > 0 && (
                        <section>
                          <h3 className="text-lg font-bold text-gray-800 mb-3">👥 Perfect For</h3>
                          <div className="flex flex-wrap gap-2">
                            {service.idealFor.map((use, i) => (
                              <span key={i} className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-4 py-2 rounded-xl text-sm font-semibold border border-purple-200">
                                {use}
                              </span>
                            ))}
                          </div>
                        </section>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {service.precautions && (
                          <section className="bg-gradient-to-br from-red-50 to-orange-50 p-5 rounded-2xl border border-red-200">
                            <h3 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" /> Precautions
                            </h3>
                            <p className="text-red-700 text-sm">{service.precautions}</p>
                          </section>
                        )}
                        {service.aftercare && (
                          <section className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-2xl border border-green-200">
                            <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                              <Sparkles className="w-4 h-4" /> Aftercare Tips
                            </h3>
                            <p className="text-green-700 text-sm">{service.aftercare}</p>
                          </section>
                        )}
                      </div>

                      {service.addOns && service.addOns.length > 0 && (
                        <section>
                          <h3 className="text-lg font-bold text-gray-800 mb-3">➕ Available Add-ons</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {service.addOns.map((addon, i) => (
                              <div key={i} className="border-2 border-pink-200 rounded-xl p-4 hover:border-rose-400 hover:shadow-md transition-all cursor-pointer group">
                                <h4 className="font-bold text-gray-800 text-sm mb-1 group-hover:text-rose-600">{addon.name}</h4>
                                <p className="text-rose-600 font-bold">+ ₹{addon.price}</p>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}
                    </div>
                  )}

                  {/* FAQs */}
                  {activeTab === 'faqs' && (
                    <div>
                      {service.faqs && service.faqs.length > 0 ? (
                        <section>
                          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-3 h-3 bg-rose-500 rounded-full inline-block" />
                            ❓ Frequently Asked Questions
                          </h2>
                          <div className="space-y-3" itemScope itemType="https://schema.org/FAQPage">
                            {service.faqs.map((faq, i) => (
                              <div
                                key={i}
                                className="border-2 border-pink-100 rounded-xl overflow-hidden hover:border-rose-200 transition-colors"
                                itemScope itemProp="mainEntity" itemType="https://schema.org/Question"
                              >
                                <button
                                  className="w-full flex justify-between items-center p-4 text-left bg-white hover:bg-rose-50 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-300"
                                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                                  aria-expanded={activeFaq === i}
                                  aria-controls={`faq-answer-${i}`}
                                >
                                  <span className="font-semibold text-rose-700 text-sm pr-4" itemProp="name">{faq.question}</span>
                                  {activeFaq === i
                                    ? <ChevronUp   className="text-rose-500 flex-shrink-0 w-4 h-4" />
                                    : <ChevronDown className="text-rose-500 flex-shrink-0 w-4 h-4" />
                                  }
                                </button>
                                <AnimatePresence>
                                  {activeFaq === i && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      id={`faq-answer-${i}`}
                                      itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer"
                                    >
                                      <p className="p-4 bg-rose-50 text-gray-700 text-sm" itemProp="text">{faq.answer}</p>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            ))}
                          </div>
                        </section>
                      ) : (
                        <div className="text-center py-10 bg-gray-50 rounded-2xl">
                          <p className="text-gray-500">No FAQs for this service yet.</p>
                          <p className="text-sm text-gray-400 mt-1">
                            Call {seoData.business.contact.phone} for questions about {service.title}.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* LOCATION — single source of truth */}
                  {activeTab === 'location' && (
                    <div className="space-y-5">
                      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="w-3 h-3 bg-rose-500 rounded-full inline-block" />
                        📍 Salon Location & Contact
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-2xl border border-blue-200">
                          <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                            <MapPin className="w-4 h-4" /> Address
                          </h3>
                          <address className="not-italic text-gray-700 text-sm leading-relaxed mb-4">
                            <strong>{seoData.business.name}</strong><br />
                            {seoData.business.address.street}<br />
                            {seoData.business.address.locality}<br />
                            Patna, {seoData.business.address.state} – {seoData.business.address.pincode}
                          </address>
                          <a
                            href={seoData.localSEOOptimization.localCitations.googleMaps}
                            target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
                          >
                            <MapPin className="w-4 h-4" /> Get Directions
                          </a>
                          <p className="text-xs text-gray-500 mt-3">Parking available · Wheelchair accessible</p>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-2xl border border-green-200 space-y-4">
                          <div>
                            <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                              <Clock className="w-4 h-4" /> Working Hours
                            </h3>
                            <div className="space-y-1 text-sm text-gray-700">
                              <p><strong>Mon–Fri:</strong> {seoData.business.workingHours.weekdays}</p>
                              <p><strong>Sat–Sun:</strong> {seoData.business.workingHours.weekends}</p>
                              <p className="text-green-600 text-xs font-medium">Extended hours available by appointment</p>
                            </div>
                          </div>
                          <div className="pt-3 border-t border-green-200">
                            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                              <Phone className="w-4 h-4 text-rose-600" /> Contact
                            </h3>
                            <a href={`tel:${seoData.business.contact.phone}`} className="block text-rose-600 font-bold text-base hover:text-rose-700">
                              📞 {seoData.business.contact.phone}
                            </a>
                            <a
                              href={`https://wa.me/${seoData.business.contact.whatsapp.replace(/[^0-9]/g, '')}`}
                              target="_blank" rel="noopener noreferrer"
                              className="block text-green-600 text-sm mt-1 hover:text-green-700"
                            >
                              💬 WhatsApp Booking
                            </a>
                            <a href={`mailto:${seoData.business.contact.email}`} className="block text-gray-600 text-sm mt-1 hover:text-rose-600">
                              ✉️ {seoData.business.contact.email}
                            </a>
                          </div>
                        </div>
                      </div>

                      {service.nearbyLandmarks && service.nearbyLandmarks.length > 0 && (
                        <div className="bg-gray-50 p-4 rounded-2xl">
                          <h4 className="font-bold text-gray-800 mb-3 text-sm">Nearby Landmarks</h4>
                          <ul className="space-y-1.5">
                            {service.nearbyLandmarks.map((lm, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />{lm}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* FINAL CTA */}
                <div className="bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 rounded-2xl p-6 md:p-8 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="relative z-10">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2">You deserve to feel beautiful ✨</h3>
                    <p className="text-pink-100 text-sm mb-6">
                      Join {service.bookingCount || 200}+ happy clients who chose {service.category} at Kritika, Patna.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                      <button
                        onClick={() => { handleAddToCart(service); onClose(); }}
                        className="flex-1 bg-white text-rose-600 py-3 px-6 rounded-xl font-bold hover:scale-[1.02] transition-transform shadow-xl focus:ring-2 focus:ring-white"
                        data-gtm="modal-cta-book"
                      >
                        Book My Appointment →
                      </button>
                      <a
                        href={`tel:${seoData.business.contact.phone}`}
                        className="flex-1 bg-black/70 text-white py-3 px-6 rounded-xl font-bold hover:scale-[1.02] transition-transform border-2 border-white/30 shadow-xl flex items-center justify-center gap-2"
                      >
                        <Phone className="w-4 h-4" /> Call Now
                      </a>
                    </div>
                    <div className="mt-5 flex flex-wrap justify-center gap-3">
                      <a
                        href={`https://wa.me/${seoData.business.contact.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-white/90 hover:text-white text-sm bg-green-600/30 px-3 py-1.5 rounded-xl"
                      >
                        💬 WhatsApp
                      </a>
                      <a
                        href={seoData.localSEOOptimization.localCitations.googleMaps}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-white/90 hover:text-white text-sm bg-blue-600/30 px-3 py-1.5 rounded-xl"
                      >
                        <MapPin className="w-3.5 h-3.5" /> Directions
                      </a>
                      <a
                        href={`mailto:${seoData.business.contact.email}`}
                        className="flex items-center gap-1.5 text-white/90 hover:text-white text-sm bg-purple-600/30 px-3 py-1.5 rounded-xl"
                      >
                        ✉️ Email
                      </a>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ServiceDetailModal;