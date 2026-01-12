// app/components/ServiceCard.tsx - SEO OPTIMIZED VERSION
"use client";

import { motion } from 'framer-motion';
import { Heart, Clock, Star, Zap, Sparkles, Eye, ChevronRight, MapPin } from 'lucide-react';
import { Service } from '../types/service';
import Image from 'next/image';
import seoData from '../../public/seo.json';

interface ServiceCardProps {
  service: Service;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onAddToCart: () => void;
  onViewDetails: () => void;
  variant?: 'compact' | 'detailed';
}

const ServiceCard = ({ 
  service, 
  isFavorite, 
  onToggleFavorite, 
  onAddToCart, 
  onViewDetails,
  variant = 'detailed'
}: ServiceCardProps) => {
  const discountPercentage = service.originalPrice && service.originalPrice > service.price
    ? Math.round(((service.originalPrice - service.price) / service.originalPrice) * 100)
    : 0;

  const trendingScore = service.isTrending ? 95 : 
                       service.isPopular ? 85 : 
                       service.isBestSeller ? 90 : 0;

  // Generate SEO-rich alt text
  const generateAltText = () => {
    const locality = seoData.business.address.locality;
    return `${service.title} - ${service.category} Makeup Service in ${locality}, Patna | ${seoData.business.name} | ₹${service.price} | ${service.duration}min | ${service.rating}⭐ Rated`;
  };

  // Compact version for mobile
  if (variant === 'compact') {
    return (
      <article
        itemScope
        itemType="https://schema.org/Service"
        className="bg-white rounded-2xl shadow-sm hover:shadow-lg border border-pink-100 overflow-hidden"
        data-service-id={service.id}
        data-service-category={service.category}
      >
        {/* Hidden SEO content for crawlers */}
        <div className="sr-only" aria-hidden="true">
          <h3 itemProp="name">{service.title}</h3>
          <p itemProp="description">{service.shortDescription || service.description}</p>
          <span itemProp="serviceType">{service.category}</span>
          
          {/* Provider information */}
          <div itemProp="provider" itemScope itemType="https://schema.org/BeautySalon">
            <span itemProp="name">{seoData.business.name}</span>
            <span itemProp="telephone">{seoData.business.contact.phone}</span>
            <div itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
              <span itemProp="streetAddress">{seoData.business.address.street}</span>
              <span itemProp="addressLocality">{seoData.business.address.city}</span>
              <span itemProp="addressRegion">{seoData.business.address.state}</span>
              <span itemProp="postalCode">{seoData.business.address.pincode}</span>
            </div>
          </div>

          {/* Offer details */}
          <div itemProp="offers" itemScope itemType="https://schema.org/Offer">
            <meta itemProp="price" content={service.price.toString()} />
            <meta itemProp="priceCurrency" content="INR" />
            <meta itemProp="availability" content="https://schema.org/InStock" />
            <meta itemProp="url" content={`${seoData.business.contact.website}/service/${service.slug}`} />
            <meta itemProp="validFrom" content={new Date().toISOString()} />
            {service.originalPrice && (
              <meta itemProp="priceValidUntil" content={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()} />
            )}
          </div>

          {/* Rating information */}
          {service.rating && (
            <div itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
              <meta itemProp="ratingValue" content={service.rating.toString()} />
              <meta itemProp="reviewCount" content={service.reviewCount?.toString() || "0"} />
              <meta itemProp="bestRating" content="5" />
              <meta itemProp="worstRating" content="1" />
            </div>
          )}

          {/* Duration */}
          <meta itemProp="duration" content={`PT${service.duration}M`} />
        </div>

        <motion.div
          whileHover={{ y: -4 }}
          className="relative"
        >
          <div className="relative aspect-square">
            <Image
              src={service.image}
              alt={generateAltText()}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
              priority={service.isTrending || service.isBestSeller}
              loading={service.isTrending || service.isBestSeller ? "eager" : "lazy"}
              itemProp="image"
            />
            
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {service.isTrending && (
                <div className="bg-gradient-to-r from-orange-500 to-pink-600 text-white px-2 py-1 rounded-full text-[10px] font-bold flex items-center">
                  <Zap className="w-3 h-3 mr-1" fill="currentColor" />
                  TRENDING
                </div>
              )}
              {discountPercentage > 0 && (
                <div className="bg-gradient-to-r from-rose-600 to-pink-600 text-white px-2 py-1 rounded-full text-[10px] font-bold">
                  {discountPercentage}% OFF
                </div>
              )}
            </div>
            
            <button
              onClick={onToggleFavorite}
              className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm p-1.5 rounded-full"
              aria-label={isFavorite ? `Remove ${service.title} from favorites` : `Add ${service.title} to favorites`}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-gray-400'}`} />
            </button>
          </div>
          
          <div className="p-3">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-sm text-gray-800 line-clamp-1 pr-2">
                {service.title}
              </h3>
              <div className="text-right shrink-0">
                <div className="text-rose-600 font-bold text-sm" itemProp="priceSpecification">
                  ₹{service.price}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <div className="flex items-center">
                <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
                <time>{service.duration} min</time>
              </div>
              {service.rating && (
                <div className="flex items-center">
                  <Star className="w-3 h-3 mr-1 text-yellow-500" aria-hidden="true" />
                  <span>{service.rating}</span>
                  {service.reviewCount && (
                    <span className="ml-1">({service.reviewCount})</span>
                  )}
                </div>
              )}
            </div>
            
            <button
              onClick={onAddToCart}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-2 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
              aria-label={`Book ${service.title} appointment now`}
            >
              Book Now
            </button>
          </div>
        </motion.div>
      </article>
    );
  }

  // Detailed version
  return (
    <article
      itemScope
      itemType="https://schema.org/Service"
      className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl border border-pink-100 overflow-hidden transition-all duration-300"
      data-service-id={service.id}
      data-service-category={service.category}
      data-service-price={service.price}
    >
      {/* Hidden comprehensive SEO content */}
      <div className="sr-only" aria-hidden="true">
        <h3 itemProp="name">{service.title}</h3>
        <p itemProp="description">{service.description}</p>
        <span itemProp="serviceType">{service.category}</span>
        
        {/* Service area */}
        <div itemProp="areaServed" itemScope itemType="https://schema.org/GeoCircle">
          <span itemProp="geoMidpoint" itemScope itemType="https://schema.org/GeoCoordinates">
            <meta itemProp="latitude" content={seoData.business.coordinates.latitude.toString()} />
            <meta itemProp="longitude" content={seoData.business.coordinates.longitude.toString()} />
          </span>
          <meta itemProp="geoRadius" content={seoData.business.serviceRadius} />
        </div>

        {/* Nearby landmarks for local SEO */}
        <ul>
          {service.nearbyLandmarks?.map((landmark: string, idx: number) => (
            <li key={idx}>{landmark}</li>
          ))}
        </ul>

        {/* Provider */}
        <div itemProp="provider" itemScope itemType="https://schema.org/BeautySalon">
          <span itemProp="name">{seoData.business.name}</span>
          <span itemProp="telephone">{seoData.business.contact.phone}</span>
          <span itemProp="email">{seoData.business.contact.email}</span>
          <div itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
            <span itemProp="streetAddress">{seoData.business.address.street}</span>
            <span itemProp="addressLocality">{seoData.business.address.city}</span>
            <span itemProp="addressRegion">{seoData.business.address.state}</span>
            <span itemProp="postalCode">{seoData.business.address.pincode}</span>
            <span itemProp="addressCountry">{seoData.business.address.country}</span>
          </div>
          <div itemProp="geo" itemScope itemType="https://schema.org/GeoCoordinates">
            <meta itemProp="latitude" content={seoData.business.coordinates.latitude.toString()} />
            <meta itemProp="longitude" content={seoData.business.coordinates.longitude.toString()} />
          </div>
        </div>

        {/* Offer details */}
        <div itemProp="offers" itemScope itemType="https://schema.org/Offer">
          <meta itemProp="price" content={service.price.toString()} />
          <meta itemProp="priceCurrency" content="INR" />
          <meta itemProp="availability" content="https://schema.org/InStock" />
          <meta itemProp="url" content={`${seoData.business.contact.website}/service/${service.slug}`} />
          <meta itemProp="validFrom" content={new Date().toISOString()} />
          <span itemProp="seller" itemScope itemType="https://schema.org/Organization">
            <meta itemProp="name" content={seoData.business.name} />
          </span>
        </div>

        {/* Rating */}
        {service.rating && (
          <div itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
            <meta itemProp="ratingValue" content={service.rating.toString()} />
            <meta itemProp="reviewCount" content={service.reviewCount?.toString() || "0"} />
            <meta itemProp="bestRating" content="5" />
            <meta itemProp="worstRating" content="1" />
          </div>
        )}

        {/* Benefits as features */}
        <ul>
          {service.benefits.map((benefit, idx) => (
            <li key={idx} itemProp="additionalProperty" itemScope itemType="https://schema.org/PropertyValue">
              <span itemProp="name">Benefit</span>
              <span itemProp="value">{benefit}</span>
            </li>
          ))}
        </ul>

        {/* Duration */}
        <meta itemProp="duration" content={`PT${service.duration}M`} />
        
        {/* Target audience */}
        {service.targetAudience && (
          <div itemProp="audience" itemScope itemType="https://schema.org/Audience">
            {service.targetAudience.map((audience, idx) => (
              <span key={idx} itemProp="audienceType">{audience}</span>
            ))}
          </div>
        )}
      </div>

      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        className="relative"
      >
        <div className="relative">
          <div className="aspect-[4/3] overflow-hidden">
            <Image
              src={service.image}
              alt={generateAltText()}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={service.isTrending || service.isBestSeller}
              loading={service.isTrending || service.isBestSeller ? "eager" : "lazy"}
              itemProp="image"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          {/* Top left badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {service.isTrending && (
              <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-rose-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center shadow-lg animate-pulse">
                <Zap className="w-3 h-3 mr-1.5" fill="currentColor" />
                VIRAL
              </div>
            )}
            {service.isBestSeller && (
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center shadow-lg">
                <Sparkles className="w-3 h-3 mr-1.5" />
                BESTSELLER
              </div>
            )}
            {discountPercentage > 0 && (
              <div className="bg-gradient-to-r from-rose-600 to-pink-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                {discountPercentage}% OFF
              </div>
            )}
          </div>

          {/* Top right actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5">
            <button
              onClick={onToggleFavorite}
              className="bg-white/95 backdrop-blur-sm p-2 rounded-full hover:bg-rose-50 transition-colors shadow-lg"
              aria-label={isFavorite ? `Remove ${service.title} from favorites` : `Add ${service.title} to favorites`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-gray-600'}`} />
            </button>
            
            {trendingScore > 0 && (
              <div className="bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold shadow-lg" role="status" aria-label={`Trending score ${trendingScore}%`}>
                <div className="flex items-center">
                  <span className="text-rose-500" aria-hidden="true">🔥</span>
                  <span className="ml-1 text-gray-800">{trendingScore}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm">
                <Clock className="w-4 h-4 mr-1.5" aria-hidden="true" />
                <time>{service.duration} mins</time>
              </div>
              <div className="flex items-center text-sm">
                <Eye className="w-4 h-4 mr-1.5" aria-hidden="true" />
                <span>{service.bookingCount || 200}+ booked</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="bg-pink-100 text-pink-700 text-xs px-2 py-1 rounded-full font-medium">
                  {service.category}
                </span>
                {service.rating && (
                  <div className="flex items-center text-xs text-gray-600">
                    <Star className="w-3 h-3 mr-0.5 text-yellow-500 fill-yellow-500" aria-hidden="true" />
                    <span>
                      {service.rating}
                      {service.reviewCount && ` (${service.reviewCount})`}
                    </span>
                  </div>
                )}
              </div>
              
              <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 leading-snug">
                {service.title}
              </h3>
            </div>
            
            <div className="text-right shrink-0">
              {service.originalPrice && service.originalPrice > service.price && (
                <p className="text-gray-400 line-through text-sm">₹{service.originalPrice}</p>
              )}
              <p className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                ₹{service.price}
              </p>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
            {service.shortDescription || service.description}
          </p>

          {/* Key highlights */}
          {service.keyIngredients && service.keyIngredients.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1.5" role="list" aria-label="Key features">
                {service.keyIngredients.slice(0, 3).map((ingredient, idx) => (
                  <span 
                    key={idx} 
                    className="bg-pink-50 text-pink-700 text-xs px-2.5 py-1 rounded-full"
                    role="listitem"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Nearby location indicator */}
          {service.nearbyLandmarks && service.nearbyLandmarks.length > 0 && (
            <div className="mb-4 text-xs text-gray-500 flex items-start">
              <MapPin className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <span className="line-clamp-1">
                Near: {service.nearbyLandmarks.slice(0, 2).join(', ')}
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onViewDetails}
              className="group/btn flex items-center justify-center gap-2 border-2 border-pink-500 text-pink-600 py-3 rounded-xl font-semibold hover:bg-pink-50 transition-all"
              aria-label={`View detailed information about ${service.title}`}
            >
              <span>Details</span>
              <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={onAddToCart}
              className="bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all shadow-md"
              aria-label={`Book ${service.title} appointment`}
            >
              Book Now
            </button>
          </div>

          {/* Quick stats footer */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-pink-100 text-xs text-gray-500">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5" aria-hidden="true"></span>
              <span>Available today</span>
            </span>
            <span className="flex items-center">
              <span className="text-rose-500 mr-1.5" aria-hidden="true">💫</span>
              <span>{service.bookingCount || 0}+ booked</span>
            </span>
            <span className="flex items-center">
              <span className="text-pink-500 mr-1.5" aria-hidden="true">✨</span>
              <span>Free trial</span>
            </span>
          </div>
        </div>
      </motion.div>
    </article>
  );
};

export default ServiceCard;