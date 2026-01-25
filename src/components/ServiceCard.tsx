// app/components/ServiceCard.tsx - PATCHED VERSION
"use client";

import { motion } from 'framer-motion';
import { Heart, Clock, Star, Zap, Sparkles, Eye, ChevronRight, MapPin, Calendar } from 'lucide-react';
import { Service } from '../types/service';
import Image from 'next/image';
import seoData from '../../public/seo.json';
import { useState } from 'react';

// Define the schema type - FIXED: Changed to Product for better rich results
interface ServiceSchema {
  "@context": string;
  "@type": string;
  name: string;
  description: string;
  brand?: {
    "@type": string;
    name: string;
  };
  provider: {
    "@type": string;
    name: string;
    address: {
      "@type": string;
      addressLocality: string;
      addressRegion: string;
      addressCountry: string;
    };
  };
  areaServed: {
    "@type": string;
    name: string;
  };
  offers: {
    "@type": string;
    price: number;
    priceCurrency: string;
    availability: string;
    url: string;
    priceValidUntil: string;
  };
  aggregateRating?: {
    "@type": string;
    ratingValue: number;
    reviewCount: number;
    bestRating: string;
    worstRating: string;
  };
}

interface ServiceCardProps {
  service: Service;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onAddToCart: () => void;
  onViewDetails: () => void;
  variant?: 'compact' | 'detailed' | 'grid';
  showBestSellerBadge?: boolean;
}

const ServiceCard = ({ 
  service, 
  isFavorite, 
  onToggleFavorite, 
  onAddToCart, 
  onViewDetails,
  variant = 'detailed',
  showBestSellerBadge
}: ServiceCardProps) => {
  const [imageLoading, setImageLoading] = useState(true);
  
  const discountPercentage = service.originalPrice && service.originalPrice > service.price
    ? Math.round(((service.originalPrice - service.price) / service.originalPrice) * 100)
    : 0;

  const trendingScore = service.isTrending ? 95 : 
                       service.isPopular ? 85 : 
                       service.isBestSeller ? 90 : 0;

  // FIXED: Check if service is in Patna based on serviceArea
  const isPatnaService = service.serviceArea?.city === 'Patna';

  // SEO-rich metadata generation - FIXED: Using Product schema
  const generateSchemaData = (): ServiceSchema => {
    const schema: ServiceSchema = {
      "@context": "https://schema.org",
      "@type": "Product", // FIXED: Changed from Service to Product
      "name": service.title,
      "description": service.shortDescription || service.description || "",
      "brand": {
        "@type": "BeautySalon",
        "name": seoData.business.name
      },
      "provider": {
        "@type": "BeautySalon",
        "name": seoData.business.name,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": seoData.business.address.locality,
          "addressRegion": seoData.business.address.state,
          "addressCountry": seoData.business.address.country
        }
      },
      // FIXED: Simplified areaServed to City (not GeoCircle)
      "areaServed": {
        "@type": "City",
        "name": "Patna"
      },
      "offers": {
        "@type": "Offer",
        "price": service.price,
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock",
        // FIXED: Proper URL generation using service.url or constructing from primaryCategory
        "url": service.url 
          ? `${seoData.business.contact.website}${service.url}`
          : `${seoData.business.contact.website}/${service.primaryCategory}/${service.slug || service.id}`,
        "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    };

    // FIXED: Only add ratings if legitimate (5+ reviews)
    if (service.rating && service.reviewCount && service.reviewCount >= 5) {
      schema.aggregateRating = {
        "@type": "AggregateRating",
        "ratingValue": service.rating,
        "reviewCount": service.reviewCount,
        "bestRating": "5",
        "worstRating": "1"
      };
    }

    return schema;
  };

  // Generate SEO-optimized alt text - FIXED: Using primaryCategory
  const generateAltText = () => {
    const locality = seoData.business.address.locality;
    const serviceType = service.primaryCategory?.toLowerCase() || 'beauty'; // FIXED
    const price = `₹${service.price}`;
    const duration = service.durationText || `${service.duration} minutes`;
    
    return `${service.title} - ${serviceType} service in ${locality}, Patna | ${seoData.business.name} | ${price} | ${duration} | Professional ${serviceType} treatment`;
  };

  // Generate microdata attributes
  const microdataAttributes = {
    itemScope: true,
    itemType: "https://schema.org/Product" as const, // FIXED: Changed to Product
    itemProp: "itemListElement" as const,
  };

  // Compact version for mobile
  if (variant === 'compact') {
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateSchemaData()) }}
        />
        
        <article
          {...microdataAttributes}
          className="bg-white rounded-2xl shadow-sm hover:shadow-lg border border-pink-100 overflow-hidden transition-shadow duration-300"
          data-service-id={service.id}
          data-service-category={service.primaryCategory} // FIXED
          data-location="Patna"
          data-gmv="salonpatna"
        >
          {/* Hidden structured data - FIXED: Using primaryCategory */}
          <meta itemProp="name" content={service.title} />
          <meta itemProp="description" content={service.shortDescription || service.description || ""} />
          <meta itemProp="serviceType" content={service.primaryCategory} /> {/* FIXED */}
          <meta itemProp="price" content={service.price.toString()} />
          <meta itemProp="priceCurrency" content="INR" />
          
          <motion.div
            whileHover={{ y: -4 }}
            className="relative"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onViewDetails()}
            onClick={onViewDetails}
            aria-label={`View details for ${service.title}`}
          >
            
            {showBestSellerBadge && (
              <div className="absolute top-2 left-2 z-10">
                <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                  Best Seller
                </span>
              </div>
            )}

            <div className="relative aspect-square">
              <Image
                src={service.image || '/placeholder-service.jpg'}
                alt={generateAltText()}
                fill
                className={`object-cover transition-opacity duration-300 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                priority={service.isTrending || service.isBestSeller}
                loading={service.isTrending || service.isBestSeller ? "eager" : "lazy"}
                quality={85}
                onLoad={() => setImageLoading(false)}
                itemProp="image"
              />
              
              {/* Loading skeleton */}
              {imageLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
              )}
              
              {/* Badges with aria labels */}
              <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                {service.isTrending && (
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-pink-600 text-white px-2 py-1 rounded-full text-[10px] font-bold flex items-center"
                    role="status"
                    aria-label="Trending service"
                  >
                    <Zap className="w-3 h-3 mr-1" aria-hidden="true" />
                    VIRAL
                  </div>
                )}
                {discountPercentage > 0 && (
                  <div 
                    className="bg-gradient-to-r from-rose-600 to-pink-600 text-white px-2 py-1 rounded-full text-[10px] font-bold"
                    role="status"
                    aria-label={`${discountPercentage}% discount`}
                  >
                    {discountPercentage}% OFF
                  </div>
                )}
                {/* FIXED: Patna badge logic */}
                {isPatnaService && (
                  <div 
                    className="bg-blue-600 text-white px-2 py-1 rounded-full text-[10px] font-bold"
                    role="region"
                    aria-label="Located in Patna"
                  >
                    PATNA
                  </div>
                )}
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite();
                }}
                className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm p-1.5 rounded-full z-10 hover:scale-110 transition-transform"
                aria-label={isFavorite ? `Remove ${service.title} from favorites` : `Add ${service.title} to favorites`}
                aria-pressed={isFavorite}
              >
                <Heart 
                  className={`w-3.5 h-3.5 transition-all duration-300 ${
                    isFavorite ? 'fill-rose-500 text-rose-500 scale-110' : 'text-gray-400 hover:text-rose-400'
                  }`}
                  aria-hidden="true"
                />
              </button>
            </div>
            
            <div className="p-3">
              {/* Category and rating - FIXED: Using primaryCategory */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span 
                    className="bg-pink-100 text-pink-700 text-xs px-2 py-0.5 rounded-full font-medium"
                    aria-label={`Category: ${service.primaryCategory}`}
                  >
                    {service.primaryCategory}
                  </span>
                  {service.isBestSeller && (
                    <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
                      TOP
                    </span>
                  )}
                </div>
                {service.rating && service.reviewCount && service.reviewCount >= 5 && (
                  <div 
                    className="flex items-center text-xs text-gray-700"
                    aria-label={`Rating: ${service.rating} out of 5 stars`}
                  >
                    <Star className="w-3 h-3 mr-1 text-yellow-500 fill-yellow-500" aria-hidden="true" />
                    <span className="font-semibold">{service.rating}</span>
                    <span className="ml-0.5 text-gray-500">({service.reviewCount})</span>
                  </div>
                )}
              </div>
              
              {/* Title */}
              <h3 
                className="font-semibold text-sm text-gray-800 line-clamp-2 mb-2 h-10 leading-tight"
                aria-label={service.title}
              >
                {service.title}
              </h3>
              
              {/* Price and duration */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-rose-600 font-bold text-sm" itemProp="price">
                      ₹{service.price}
                    </span>
                    {service.originalPrice && service.originalPrice > service.price && (
                      <span className="text-gray-400 line-through text-xs" aria-label="Original price">
                        ₹{service.originalPrice}
                      </span>
                    )}
                  </div>
                  <div 
                    className="flex items-center text-xs text-gray-500 mt-1"
                    aria-label={`Duration: ${service.duration} minutes`}
                  >
                    <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
                    <time dateTime={`PT${service.duration}M`}>{service.durationText || `${service.duration} min`}</time>
                  </div>
                </div>
                
                {/* Local indicator - FIXED */}
                {isPatnaService && (
                  <div className="hidden sm:flex items-center text-[10px] text-blue-600">
                    <MapPin className="w-3 h-3 mr-0.5" aria-hidden="true" />
                    Patna
                  </div>
                )}
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart();
                  }}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white py-2 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity hover:shadow-md focus:ring-2 focus:ring-rose-300"
                  aria-label={`Book ${service.title} appointment now`}
                >
                  Book Now
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails();
                  }}
                  className="px-3 border border-pink-300 text-pink-600 rounded-lg text-xs font-medium hover:bg-pink-50 transition-colors"
                  aria-label={`View details for ${service.title}`}
                >
                  Details
                </button>
              </div>
            </div>
          </motion.div>
        </article>
      </>
    );
  }

  // Detailed version (default)
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateSchemaData()) }}
      />
      
      <article
        {...microdataAttributes}
        className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl border border-pink-100 overflow-hidden transition-all duration-300 focus-within:ring-2 focus-within:ring-pink-500"
        data-service-id={service.id}
        data-service-category={service.primaryCategory} // FIXED
        data-location="Patna"
        data-gmv="salonpatna"
        data-price={service.price}
      >
        {/* FIXED: Reduced hidden SEO text (anti-spam) */}
        <div className="sr-only" aria-hidden="true">
          <h2>{service.title} in Patna</h2>
          <p>Price: ₹{service.price} | Duration: {service.durationText || `${service.duration} minutes`}</p>
        </div>

        <motion.div
          whileHover={{ y: -8, scale: 1.02 }}
          className="relative"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onViewDetails()}
          onClick={onViewDetails}
          aria-label={`View complete details for ${service.title}`}
        >
          <div className="relative">
            {/* Main image with optimized loading */}
            <div className="aspect-[4/3] overflow-hidden relative">
              <Image
                src={service.image || '/placeholder-service.jpg'}
                alt={generateAltText()}
                fill
                className={`object-cover group-hover:scale-105 transition-transform duration-500 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={service.isTrending || service.isBestSeller}
                loading={service.isTrending || service.isBestSeller ? "eager" : "lazy"}
                quality={90}
                onLoad={() => setImageLoading(false)}
                itemProp="image"
              />
              
              {/* Loading skeleton */}
              {imageLoading && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            
            {/* Top left badges with local context */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              {service.isTrending && (
                <div 
                  className="bg-gradient-to-r from-orange-500 via-pink-500 to-rose-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center shadow-lg animate-pulse"
                  role="status"
                  aria-label="Trending viral service"
                >
                  <Zap className="w-3 h-3 mr-1.5" aria-hidden="true" />
                  VIRAL IN PATNA
                </div>
              )}
              {service.isBestSeller && (
                <div 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center shadow-lg"
                  role="status"
                  aria-label="Best seller service"
                >
                  <Sparkles className="w-3 h-3 mr-1.5" aria-hidden="true" />
                  PATNA'S CHOICE
                </div>
              )}
              {discountPercentage > 0 && (
                <div 
                  className="bg-gradient-to-r from-rose-600 to-pink-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg"
                  role="status"
                  aria-label={`${discountPercentage}% discount available`}
                >
                  {discountPercentage}% OFF
                </div>
              )}
              {/* Local badge - FIXED */}
              {isPatnaService && (
                <div 
                  className="bg-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center"
                  role="region"
                  aria-label="Service available in Patna"
                >
                  <MapPin className="w-3 h-3 mr-1.5" aria-hidden="true" />
                  PATNA
                </div>
              )}
            </div>

            {/* Top right actions */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite();
                }}
                className="bg-white/95 backdrop-blur-sm p-2 rounded-full hover:bg-rose-50 transition-colors shadow-lg hover:scale-110 focus:ring-2 focus:ring-rose-300"
                aria-label={isFavorite ? `Remove ${service.title} from favorites` : `Add ${service.title} to favorites`}
                aria-pressed={isFavorite}
              >
                <Heart 
                  className={`w-4 h-4 transition-all duration-300 ${
                    isFavorite ? 'fill-rose-500 text-rose-500 scale-110' : 'text-gray-600 hover:text-rose-500'
                  }`}
                  aria-hidden="true"
                />
              </button>
              
              {trendingScore > 0 && (
                <div 
                  className="bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold shadow-lg"
                  role="status"
                  aria-label={`Trending score ${trendingScore}%`}
                >
                  <div className="flex items-center">
                    <span className="text-rose-500" aria-hidden="true">🔥</span>
                    <span className="ml-1 text-gray-800">{trendingScore}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom overlay with key info */}
            <div 
              className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white"
              aria-label="Service details"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center text-sm" aria-label="Duration">
                  <Clock className="w-4 h-4 mr-1.5" aria-hidden="true" />
                  <time dateTime={`PT${service.duration}M`}>{service.durationText || `${service.duration} mins`}</time>
                </div>
                <div className="flex items-center text-sm" aria-label="Popularity">
                  <Eye className="w-4 h-4 mr-1.5" aria-hidden="true" />
                  <span>{service.bookingCount || 200}+ booked</span>
                </div>
                <div className="flex items-center text-sm" aria-label="Availability">
                  <Calendar className="w-4 h-4 mr-1.5" aria-hidden="true" />
                  <span>Today</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content section */}
          <div className="p-5">
            {/* Header with category and rating - FIXED: Using primaryCategory */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span 
                    className="bg-pink-100 text-pink-700 text-xs px-2 py-1 rounded-full font-medium"
                    aria-label={`Category: ${service.primaryCategory}`}
                  >
                    {service.primaryCategory}
                  </span>
                  {service.rating && service.reviewCount && service.reviewCount >= 5 && (
                    <div 
                      className="flex items-center text-xs text-gray-600"
                      aria-label={`Rating: ${service.rating} out of 5 stars`}
                    >
                      <Star className="w-3 h-3 mr-0.5 text-yellow-500 fill-yellow-500" aria-hidden="true" />
                      <span className="font-semibold">{service.rating}</span>
                      <span className="ml-1 text-gray-500">({service.reviewCount} reviews)</span>
                    </div>
                  )}
                  {service.isPopular && (
                    <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">
                      POPULAR
                    </span>
                  )}
                </div>
                
                {/* Service title */}
                <h3 
                  className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 leading-snug"
                  aria-label={service.title}
                >
                  {service.title}
                </h3>
              </div>
              
              {/* Pricing */}
              <div className="text-right shrink-0" aria-label="Pricing information">
                {service.originalPrice && service.originalPrice > service.price && (
                  <p className="text-gray-400 line-through text-sm" aria-label="Original price">
                    ₹{service.originalPrice}
                  </p>
                )}
                <p 
                  className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent"
                  aria-label={`Current price: ₹${service.price}`}
                >
                  ₹{service.price}
                </p>
                {discountPercentage > 0 && (
                  <p className="text-xs text-green-600 font-semibold mt-1" aria-label="Discount percentage">
                    Save {discountPercentage}%
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <p 
              className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed"
              aria-label="Service description"
            >
              {service.shortDescription || service.description}
            </p>

            {/* Key features with local context */}
            {service.keyIngredients && service.keyIngredients.length > 0 && (
              <div className="mb-4">
                <div 
                  className="flex flex-wrap gap-1.5"
                  role="list"
                  aria-label="Key features and ingredients"
                >
                  {service.keyIngredients.slice(0, 4).map((ingredient, idx) => (
                    <span 
                      key={idx} 
                      className="bg-pink-50 text-pink-700 text-xs px-2.5 py-1 rounded-full border border-pink-100"
                      role="listitem"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Local landmarks for SEO */}
            {service.nearbyLandmarks && service.nearbyLandmarks.length > 0 && (
              <div 
                className="mb-4 text-xs text-gray-500 flex items-start"
                aria-label="Nearby landmarks in Patna"
              >
                <MapPin className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="line-clamp-1">
                  Near: {service.nearbyLandmarks.slice(0, 3).map((landmark, idx) => (
                    <span key={idx} className="font-medium text-blue-600">
                      {landmark}{idx < 2 && idx < service.nearbyLandmarks!.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </span>
              </div>
            )}

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails();
                }}
                className="group/btn flex items-center justify-center gap-2 border-2 border-pink-500 text-pink-600 py-3 rounded-xl font-semibold hover:bg-pink-50 transition-all focus:ring-2 focus:ring-pink-300 focus:outline-none"
                aria-label={`View detailed information about ${service.title}`}
              >
                <span>Full Details</span>
                <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" aria-hidden="true" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart();
                }}
                className="bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all shadow-md focus:ring-2 focus:ring-rose-300 focus:outline-none"
                aria-label={`Book ${service.title} appointment at ${seoData.business.name} in Patna`}
                data-gtm="add-to-cart"
                data-service={service.title}
                data-price={service.price}
              >
                Book in Patna
              </button>
            </div>

            {/* Trust signals and local indicators */}
            <div 
              className="flex justify-between items-center mt-4 pt-4 border-t border-pink-100 text-xs text-gray-500"
              aria-label="Service trust indicators"
            >
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5" aria-hidden="true"></span>
                <span>Available in Patna</span>
              </span>
              <span className="flex items-center">
                <span className="text-rose-500 mr-1.5" aria-hidden="true">💫</span>
                <span>{service.bookingCount || 0}+ booked</span>
              </span>
              <span className="flex items-center">
                <span className="text-pink-500 mr-1.5" aria-hidden="true">✨</span>
                <span>Local Experts</span>
              </span>
            </div>
          </div>
        </motion.div>
      </article>
    </>
  );
};

export default ServiceCard;