// app/components/ServiceDetailModal.tsx - SEO OPTIMIZED VERSION
"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Clock, ChevronDown, ChevronUp, Star, Heart, Calendar, MapPin, Phone, Award, Sparkles, AlertCircle, Shield } from 'lucide-react';
import { Service } from '../types/service';
import { useState, useEffect } from 'react';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'benefits' | 'faqs'>('overview');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!service) return null;

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const discountPercentage = service.originalPrice && service.originalPrice > service.price
    ? Math.round(((service.originalPrice - service.price) / service.originalPrice) * 100)
    : 0;

  const generateAltText = () => {
    return `${service.title} - Professional ${service.category} Service in ${seoData.business.address.locality}, Patna | ${seoData.business.name}`;
  };

  // Generate FAQ Schema for this specific service
  const generateServiceFAQSchema = () => {
    if (!service.faqs || service.faqs.length === 0) return null;

    return {
      "@context": "https://schema.org",
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
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="service-modal-title"
          aria-describedby="service-modal-description"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            itemScope
            itemType="https://schema.org/Service"
          >
            {/* Hidden comprehensive SEO content */}
            <div className="sr-only" aria-hidden="true">
              <h1 id="service-modal-title" itemProp="name">{service.title}</h1>
              <p id="service-modal-description" itemProp="description">{service.description}</p>
              
              {/* Complete service metadata */}
              <dl>
                <dt>Service Type:</dt>
                <dd itemProp="serviceType">{service.category}</dd>
                
                <dt>Duration:</dt>
                <dd>
                  <time itemProp="duration" dateTime={`PT${service.duration}M`}>
                    {service.duration} minutes
                  </time>
                </dd>
                
                <dt>Price:</dt>
                <dd itemProp="offers" itemScope itemType="https://schema.org/Offer">
                  <span itemProp="price">{service.price}</span>
                  <span itemProp="priceCurrency">INR</span>
                  <meta itemProp="availability" content="https://schema.org/InStock" />
                  <meta itemProp="url" content={`${seoData.business.contact.website}/service/${service.slug}`} />
                </dd>
                
                {service.originalPrice && (
                  <>
                    <dt>Original Price:</dt>
                    <dd>₹{service.originalPrice}</dd>
                    <dt>Discount:</dt>
                    <dd>{discountPercentage}% OFF</dd>
                  </>
                )}
                
                <dt>Rating:</dt>
                {service.rating && (
                  <dd itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
                    <span itemProp="ratingValue">{service.rating}</span> out of
                    <span itemProp="bestRating">5</span> stars
                    (<span itemProp="reviewCount">{service.reviewCount || 0}</span> reviews)
                  </dd>
                )}
                
                <dt>Benefits:</dt>
                <dd>
                  <ul>
                    {service.benefits.map((benefit, idx) => (
                      <li key={idx}>{benefit}</li>
                    ))}
                  </ul>
                </dd>
                
                <dt>What's Included:</dt>
                <dd>
                  <ul>
                    {service.whatsIncluded?.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </dd>
                
                <dt>What's Not Included:</dt>
                <dd>
                  <ul>
                    {service.whatsNotIncluded?.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </dd>
                
                <dt>Key Ingredients/Products:</dt>
                <dd>
                  <ul>
                    {service.keyIngredients.map((ingredient, idx) => (
                      <li key={idx}>{ingredient}</li>
                    ))}
                  </ul>
                </dd>
                
                <dt>Ideal For:</dt>
                <dd>
                  <ul>
                    {service.idealFor?.map((use, idx) => (
                      <li key={idx}>{use}</li>
                    ))}
                  </ul>
                </dd>
                
                <dt>Target Audience:</dt>
                <dd>
                  {service.targetAudience?.join(', ')}
                </dd>
                
                <dt>Nearby Landmarks:</dt>
                <dd>
                  <ul>
                    {service.nearbyLandmarks?.map((landmark, idx) => (
                      <li key={idx}>{landmark}</li>
                    ))}
                  </ul>
                </dd>
              </dl>

              {/* Provider information */}
              <div itemProp="provider" itemScope itemType="https://schema.org/BeautySalon">
                <span itemProp="name">{seoData.business.name}</span>
                <span itemProp="telephone">{seoData.business.contact.phone}</span>
                <span itemProp="email">{seoData.business.contact.email}</span>
                <div itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                  <span itemProp="streetAddress">{seoData.business.address.street}</span>,
                  <span itemProp="addressLocality">{seoData.business.address.city}</span>,
                  <span itemProp="addressRegion">{seoData.business.address.state}</span>
                  <span itemProp="postalCode">{seoData.business.address.pincode}</span>
                </div>
              </div>

              {/* Area served */}
              <div itemProp="areaServed" itemScope itemType="https://schema.org/GeoCircle">
                <span itemProp="geoMidpoint" itemScope itemType="https://schema.org/GeoCoordinates">
                  <meta itemProp="latitude" content={seoData.business.coordinates.latitude.toString()} />
                  <meta itemProp="longitude" content={seoData.business.coordinates.longitude.toString()} />
                </span>
                <meta itemProp="geoRadius" content={seoData.business.serviceRadius} />
              </div>
            </div>

            {/* FAQ Schema injection */}
            {service.faqs && service.faqs.length > 0 && (
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify(generateServiceFAQSchema())
                }}
              />
            )}

            {/* Header with Image */}
            <div className="relative">
              <Image
                src={service.image}
                alt={generateAltText()}
                width={1200}
                height={600}
                className="w-full h-80 object-cover rounded-t-3xl"
                priority
                itemProp="image"
              />
              
              {/* Header Actions */}
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  onClick={toggleFavorite}
                  className={`p-3 rounded-2xl backdrop-blur-sm transition-all ${
                    isFavorite 
                      ? 'bg-rose-500 text-white' 
                      : 'bg-white/90 text-gray-600 hover:bg-rose-500 hover:text-white'
                  }`}
                  aria-label={isFavorite ? `Remove ${service.title} from favorites` : `Add ${service.title} to favorites`}
                >
                  <Heart className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={onClose}
                  className="p-3 bg-white/90 backdrop-blur-sm rounded-2xl text-gray-600 hover:text-rose-500 transition-colors"
                  aria-label="Close service details"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Image Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-white text-3xl font-bold mb-2">{service.title}</h2>
                    <div className="flex items-center space-x-4 flex-wrap gap-2">
                      <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-2xl text-sm flex items-center">
                        <Clock className="w-4 h-4 mr-2" aria-hidden="true" />
                        <time>{service.duration} mins</time>
                      </div>
                      {discountPercentage > 0 && (
                        <div className="bg-rose-500 text-white px-4 py-2 rounded-2xl text-sm font-bold">
                          {discountPercentage}% OFF 💫
                        </div>
                      )}
                      <div className="bg-pink-500/90 text-white px-4 py-2 rounded-2xl text-sm font-semibold">
                        {service.category}
                      </div>
                    </div>
                  </div>
                  {service.rating && (
                    <div className="text-right">
                      <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-2xl">
                        <Star className="w-4 h-4 text-yellow-400" fill="currentColor" aria-hidden="true" />
                        <span className="text-white font-bold">{service.rating}</span>
                      </div>
                      {service.reviewCount && (
                        <p className="text-white/80 text-xs mt-1">{service.reviewCount} reviews</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Pricing & Quick Actions */}
              <div className="flex justify-between items-center mb-8 p-6 bg-gradient-to-r from-rose-50 to-pink-50 rounded-3xl">
                <div>
                  {service.originalPrice && service.originalPrice > service.price && (
                    <p className="text-gray-400 line-through text-lg">₹{service.originalPrice}</p>
                  )}
                  <p className="text-4xl font-bold text-rose-600">₹{service.price}</p>
                  <p className="text-rose-500 font-bold mt-1">Inclusive of all taxes</p>
                </div>
                <div className="text-right space-y-3">
                  <button 
                    onClick={() => onAddToCart(service)}
                    className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-3 rounded-2xl font-bold hover:shadow-lg hover:scale-105 transition-all flex items-center space-x-2"
                    aria-label={`Book ${service.title} appointment`}
                  >
                    <Calendar className="w-5 h-5" />
                    <span>Book Now</span>
                  </button>
                  <a
                    href={`tel:${seoData.business.contact.phone}`}
                    className="flex items-center justify-center space-x-2 text-gray-600 hover:text-rose-600 transition-colors text-sm"
                    aria-label="Call to book appointment"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call to Book</span>
                  </a>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4 bg-green-50 rounded-2xl">
                  <Shield className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-green-700">100% Safe</p>
                  <p className="text-[10px] text-green-600">Sanitized Tools</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-2xl">
                  <Award className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-blue-700">Expert Artists</p>
                  <p className="text-[10px] text-blue-600">Certified Professionals</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-2xl">
                  <Sparkles className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-purple-700">Premium Products</p>
                  <p className="text-[10px] text-purple-600">International Brands</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="mb-6">
                <nav className="flex space-x-2 border-b border-gray-200" role="tablist" aria-label="Service information tabs">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-6 py-3 font-semibold transition-colors relative ${
                      activeTab === 'overview'
                        ? 'text-rose-600 border-b-2 border-rose-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    role="tab"
                    aria-selected={activeTab === 'overview'}
                    aria-controls="overview-panel"
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('benefits')}
                    className={`px-6 py-3 font-semibold transition-colors relative ${
                      activeTab === 'benefits'
                        ? 'text-rose-600 border-b-2 border-rose-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    role="tab"
                    aria-selected={activeTab === 'benefits'}
                    aria-controls="benefits-panel"
                  >
                    Benefits & Details
                  </button>
                  <button
                    onClick={() => setActiveTab('faqs')}
                    className={`px-6 py-3 font-semibold transition-colors relative ${
                      activeTab === 'faqs'
                        ? 'text-rose-600 border-b-2 border-rose-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    role="tab"
                    aria-selected={activeTab === 'faqs'}
                    aria-controls="faqs-panel"
                  >
                    FAQs
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="min-h-[400px]">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div id="overview-panel" role="tabpanel" aria-labelledby="overview-tab">
                    <section className="mb-8" aria-labelledby="description-heading">
                      <h3 id="description-heading" className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                        <span className="w-3 h-3 bg-rose-500 rounded-full mr-3"></span>
                        About This Service
                      </h3>
                      <p className="text-gray-600 text-lg leading-relaxed">{service.description}</p>
                    </section>

                    {/* Key Ingredients/Products */}
                    {service.keyIngredients.length > 0 && (
                      <section className="mb-8" aria-labelledby="ingredients-heading">
                        <h3 id="ingredients-heading" className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                          <span className="w-3 h-3 bg-rose-500 rounded-full mr-3"></span>
                          🌿 Premium Products Used
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {service.keyIngredients.map((ingredient, index) => (
                            <div key={index} className="flex flex-col items-center bg-white p-4 rounded-2xl shadow-lg border border-pink-100">
                              <div className="w-16 h-16 bg-gradient-to-r from-rose-100 to-pink-100 rounded-2xl flex items-center justify-center mb-3">
                                <Check className="text-rose-500 w-8 h-8" />
                              </div>
                              <span className="text-sm font-bold text-center text-gray-800">{ingredient}</span>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* What's Included/Not Included */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      {service.whatsIncluded && service.whatsIncluded.length > 0 && (
                        <section aria-labelledby="included-heading">
                          <h4 id="included-heading" className="text-xl font-bold text-green-700 mb-3 flex items-center">
                            <Check className="w-5 h-5 mr-2" />
                            What's Included
                          </h4>
                          <ul className="space-y-2">
                            {service.whatsIncluded.map((item, idx) => (
                              <li key={idx} className="flex items-start text-gray-700">
                                <Check className="text-green-500 mt-1 mr-3 shrink-0 w-4 h-4" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </section>
                      )}
                      {service.whatsNotIncluded && service.whatsNotIncluded.length > 0 && (
                        <section aria-labelledby="not-included-heading">
                          <h4 id="not-included-heading" className="text-xl font-bold text-red-700 mb-3 flex items-center">
                            <X className="w-5 h-5 mr-2" />
                            What's Not Included
                          </h4>
                          <ul className="space-y-2">
                            {service.whatsNotIncluded.map((item, idx) => (
                              <li key={idx} className="flex items-start text-gray-700">
                                <X className="text-red-500 mt-1 mr-3 shrink-0 w-4 h-4" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </section>
                      )}
                    </div>

                    {/* Nearby Landmarks */}
                    {service.nearbyLandmarks && service.nearbyLandmarks.length > 0 && (
                      <section className="bg-blue-50 p-6 rounded-3xl" aria-labelledby="landmarks-heading">
                        <h4 id="landmarks-heading" className="text-xl font-bold text-blue-800 mb-3 flex items-center">
                          <MapPin className="w-5 h-5 mr-2" />
                          Nearby Landmarks
                        </h4>
                        <ul className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                          {service.nearbyLandmarks.map((landmark, idx) => (
                            <li key={idx} className="flex items-center">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                              {landmark}
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}
                  </div>
                )}

                {/* Benefits Tab */}
                {activeTab === 'benefits' && (
                  <div id="benefits-panel" role="tabpanel" aria-labelledby="benefits-tab">
                    <section className="mb-8" aria-labelledby="benefits-heading">
                      <h3 id="benefits-heading" className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                        <span className="w-3 h-3 bg-rose-500 rounded-full mr-3"></span>
                        ✨ What You'll Love
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {service.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-start bg-pink-50 p-4 rounded-2xl">
                            <Check className="text-green-500 mt-1 mr-4 shrink-0 w-6 h-6" />
                            <p className="text-gray-700 font-medium">{benefit}</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Ideal For */}
                    {service.idealFor && service.idealFor.length > 0 && (
                      <section className="mb-8" aria-labelledby="ideal-for-heading">
                        <h3 id="ideal-for-heading" className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                          <span className="w-3 h-3 bg-rose-500 rounded-full mr-3"></span>
                          👥 Perfect For
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {service.idealFor.map((use, idx) => (
                            <span key={idx} className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold">
                              {use}
                            </span>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Precautions & Aftercare */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <section className="bg-red-50 p-6 rounded-3xl" aria-labelledby="precautions-heading">
                        <h3 id="precautions-heading" className="text-xl font-bold text-red-700 mb-3 flex items-center">
                          <AlertCircle className="w-5 h-5 mr-2" />
                          Precautions
                        </h3>
                        <p className="text-red-600">{service.precautions}</p>
                      </section>
                      <section className="bg-green-50 p-6 rounded-3xl" aria-labelledby="aftercare-heading">
                        <h3 id="aftercare-heading" className="text-xl font-bold text-green-700 mb-3 flex items-center">
                          <Sparkles className="w-5 h-5 mr-2" />
                          Aftercare Tips
                        </h3>
                        <p className="text-green-600">{service.aftercare}</p>
                      </section>
                    </div>

                    {/* Add-ons */}
                    {service.addOns && service.addOns.length > 0 && (
                      <section aria-labelledby="addons-heading">
                        <h3 id="addons-heading" className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                          <span className="w-3 h-3 bg-rose-500 rounded-full mr-3"></span>
                          ➕ Available Add-ons
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {service.addOns.map((addon, idx) => (
                            <div key={idx} className="border-2 border-pink-200 rounded-2xl p-4 hover:border-rose-400 transition-colors">
                              <h4 className="font-bold text-gray-800 mb-2">{addon.name}</h4>
                              <p className="text-rose-600 font-bold text-lg">+₹{addon.price}</p>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>
                )}

                {/* FAQs Tab */}
                {activeTab === 'faqs' && (
                  <div id="faqs-panel" role="tabpanel" aria-labelledby="faqs-tab">
                    {service.faqs.length > 0 ? (
                      <section aria-labelledby="faq-heading">
                        <h3 id="faq-heading" className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                          <span className="w-3 h-3 bg-rose-500 rounded-full mr-3"></span>
                          ❓ Frequently Asked Questions
                        </h3>
                        <div className="space-y-4">
                          {service.faqs.map((faq, index) => (
                            <div 
                              key={index} 
                              className="border-2 border-pink-100 rounded-2xl overflow-hidden hover:border-rose-200 transition-colors"
                              itemScope
                              itemType="https://schema.org/Question"
                            >
                              <button
                                className="w-full flex justify-between items-center p-6 text-left bg-white hover:bg-rose-50 transition-colors"
                                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                                aria-expanded={activeFaq === index}
                                aria-controls={`faq-answer-${index}`}
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
                                    itemScope
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
                      <div className="text-center py-12">
                        <p className="text-gray-500">No FAQs available for this service.</p>
                        <p className="text-sm text-gray-400 mt-2">
                          Call us at {seoData.business.contact.phone} for any questions
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Final CTA Section */}
              <div className="mt-8 bg-gradient-to-r from-rose-500 to-pink-600 rounded-3xl p-8 text-center">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Ready to Experience This Service? ✨
                </h3>
                <p className="text-pink-100 mb-6 text-lg">
                  Book now and transform your look at {seoData.business.name}!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <button
                    onClick={() => {
                      onAddToCart(service);
                      onClose();
                    }}
                    className="flex-1 bg-white text-rose-600 py-4 px-6 rounded-2xl font-bold hover:scale-105 transition-transform text-lg"
                    aria-label={`Add ${service.title} to cart`}
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => {
                      onAddToCart(service);
                      onClose();
                    }}
                    className="flex-1 bg-black text-white py-4 px-6 rounded-2xl font-bold hover:scale-105 transition-transform text-lg border-2 border-white"
                    aria-label={`Book ${service.title} instantly`}
                  >
                    Book Instantly
                  </button>
                </div>

                {/* Contact options */}
                <div className="mt-6 flex justify-center items-center gap-6 text-white/90 text-sm">
                  <a 
                    href={`tel:${seoData.business.contact.phone}`}
                    className="flex items-center hover:text-white transition-colors"
                    aria-label="Call to book"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </a>
                  <a 
                    href={`https://wa.me/${seoData.business.contact.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center hover:text-white transition-colors"
                    aria-label="Chat on WhatsApp"
                  >
                    <span className="mr-2">💬</span>
                    WhatsApp
                  </a>
                  <a 
                    href={seoData.localSEOOptimization.localCitations.googleMaps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center hover:text-white transition-colors"
                    aria-label="Get directions"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Get Directions
                  </a>
                </div>
              </div>

              {/* Location & Contact Info */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-3xl">
                <div>
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-rose-600" />
                    Visit Us
                  </h4>
                  <address className="not-italic text-gray-600 text-sm">
                    {seoData.business.address.street}, {seoData.business.address.locality}<br />
                    {seoData.business.address.city}, {seoData.business.address.state} - {seoData.business.address.pincode}
                  </address>
                  <a
                    href={seoData.localSEOOptimization.localCitations.googleMaps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-rose-600 text-sm font-medium mt-2 inline-block hover:underline"
                    aria-label="Get directions on Google Maps"
                  >
                    Get Directions →
                  </a>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-rose-600" />
                    Working Hours
                  </h4>
                  <p className="text-gray-600 text-sm">
                    <strong>Mon-Fri:</strong> {seoData.business.workingHours.weekdays}<br />
                    <strong>Weekends:</strong> {seoData.business.workingHours.weekends}
                  </p>
                  <p className="text-green-600 text-sm font-semibold mt-2">
                    📞 Call: {seoData.business.contact.phone}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ServiceDetailModal