// kritika/src/app/nail/page.tsx - UPDATED TO MATCH HOME PAGE PATTERNS
import { Metadata } from 'next';
import ClientNailPage from './ClientNailPage';
import { Service } from '../../types/service';
import nailServices from '../../../public/nail_services.json';
import seoData from '../../../public/seo.json';

// FIXED: Generate limited keywords (top 60)
const generateNailKeywords = () => {
  const seoKeywords = seoData.seo.serviceSpecificKeywords.nailServices || [];
  const locationKeywords = seoData.seo.locationBasedKeywords.ultraLocal || [];
  const serviceKeywords = nailServices.flatMap((service: any) => service.seoKeywords || []);
  
  // FIXED: Limit to top 60 keywords
  return [...new Set([...seoKeywords, ...locationKeywords, ...serviceKeywords])].slice(0, 60);
};

const NAIL_KEYWORDS = generateNailKeywords();

// FIXED: Generate description using city field
const generateDescription = () => {
  const serviceCount = nailServices.length;
  const categories = [...new Set(nailServices.map((s: any) => s.category))];
  const minPrice = Math.min(...nailServices.map((s: any) => s.price));
  const maxPrice = Math.max(...nailServices.map((s: any) => s.price));
  
  return `⭐${seoData.business.rating} Rated Professional Nail Services in ${seoData.business.address.city}. ${serviceCount}+ Services including ${categories.slice(0, 3).join(', ')}. Prices from ₹${minPrice} to ₹${maxPrice}. ${seoData.business.totalReviews}+ Happy Clients. Book: ${seoData.business.contact.phone}`;
};

// FIXED: Using city instead of locality
const PAGE_TITLE = `Best Nail Art & Manicure Pedicure in ${seoData.business.address.city} | Gel Nails, Bridal Nails | ${seoData.business.name}`;

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: generateDescription(),
  keywords: NAIL_KEYWORDS.join(', '),

  openGraph: {
    title: `Expert Nail Services ${seoData.business.address.city} | ${seoData.business.name}`,
    description: generateDescription(),
    images: [
      {
        url: `${seoData.business.contact.website}/images/nails/bridal-nails-patna-kritika.jpg`,
        width: 1200,
        height: 630,
        alt: `Best Nail Art & Manicure in ${seoData.business.address.city} - ${seoData.business.name}`
      }
    ],
    type: "website",
    locale: "en_IN",
    siteName: seoData.business.name,
    url: `${seoData.business.contact.website}/nail`
  },

  twitter: {
    card: "summary_large_image",
    title: `Best Nail Art Studio ${seoData.business.address.city} | ${seoData.business.name}`,
    description: generateDescription(),
    images: [`${seoData.business.contact.website}/images/nails/nail-art-twitter-card.jpg`],
    // FIXED: Proper Twitter handle format
    creator: `@${seoData.business.socialMedia.instagram.replace('@', '')}`
  },

  alternates: {
    canonical: `${seoData.business.contact.website}/nail`,
    languages: {
      'en-IN': `${seoData.business.contact.website}/nail`,
      'hi-IN': `${seoData.business.contact.website}/hi/nail`
    }
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }
  },

  other: {
    'geo.region': `IN-${seoData.business.address.state}`,
    'geo.placename': `${seoData.business.address.city}, ${seoData.business.address.state}`,
    'geo.position': `${seoData.business.coordinates.latitude};${seoData.business.coordinates.longitude}`,
    'ICBM': `${seoData.business.coordinates.latitude}, ${seoData.business.coordinates.longitude}`,
    'rating': seoData.business.rating.toString(),
    'service-category': 'Manicure, Pedicure, Nail Art, Gel Nails, Bridal Nails',
    'business-hours': seoData.business.workingHours.weekdays,
    'price-range': '₹-₹₹₹'
  },

  verification: {
    google: 'Uj54YUbFFcOLdeffGXlZMH35yYC-N6HyO9Wdoxj_DXA',
  }
};

// FIXED: Enhanced service offers - limited to top 20
const generateServiceOffers = () => {
  // FIXED: Sort by booking count and limit to top 20
  return nailServices
    .sort((a: any, b: any) => (b.bookingCount || 0) - (a.bookingCount || 0))
    .slice(0, 20)
    .map((service: any) => ({
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": service.title,
        "description": service.shortDescription || service.description,
        "image": `${seoData.business.contact.website}${service.image}`,
        "provider": {
          "@type": "BeautySalon",
          "name": seoData.business.name
        },
        // FIXED: Using primaryCategory if available
        "category": service.primaryCategory || service.category,
        "serviceType": service.eventCategory || service.primaryCategory || service.category,
        // FIXED: Only add ratings if legitimate
        "aggregateRating": service.rating && service.reviewCount && service.reviewCount >= 5 ? {
          "@type": "AggregateRating",
          "ratingValue": service.rating.toString(),
          "reviewCount": service.reviewCount.toString()
        } : undefined
      },
      "price": service.price.toString(),
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      // FIXED: Correct URL generation
      "url": service.url 
        ? `${seoData.business.contact.website}${service.url}`
        : `${seoData.business.contact.website}/nail/${service.slug || service.id}`
    }));
};

const nailStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BeautySalon",
      "@id": `${seoData.business.contact.website}/#organization`,
      "name": seoData.business.name,
      "legalName": seoData.business.legalName,
      "description": seoData.business.description,
      "url": seoData.business.contact.website,
      "logo": `${seoData.business.contact.website}/logo.png`,
      "image": `${seoData.business.contact.website}/images/salon-exterior.jpg`,
      "telephone": seoData.business.contact.phone,
      "email": seoData.business.contact.email,
      "priceRange": "₹₹-₹₹₹",
      "address": {
        "@type": "PostalAddress",
        // FIXED: Using city instead of locality
        "streetAddress": seoData.business.address.street,
        "addressLocality": seoData.business.address.city,
        "addressRegion": seoData.business.address.state,
        "postalCode": seoData.business.address.pincode,
        "addressCountry": seoData.business.address.country
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": seoData.business.coordinates.latitude,
        "longitude": seoData.business.coordinates.longitude
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": seoData.business.workingHours.weekdays.split(' - ')[0],
          "closes": seoData.business.workingHours.weekdays.split(' - ')[1]
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Saturday", "Sunday"],
          "opens": seoData.business.workingHours.weekends.split(' - ')[0],
          "closes": seoData.business.workingHours.weekends.split(' - ')[1]
        }
      ],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": seoData.business.rating.toString(),
        "reviewCount": seoData.business.totalReviews.toString(),
        "bestRating": "5",
        "worstRating": "1"
      },
      "makesOffer": generateServiceOffers(),
      // FIXED: Simplified to City
      "areaServed": {
        "@type": "City",
        "name": "Patna"
      },
      "sameAs": [
        `https://instagram.com/${seoData.business.socialMedia.instagram}`,
        `https://facebook.com/${seoData.business.socialMedia.facebook}`,
        `https://youtube.com/${seoData.business.socialMedia.youtube}`,
        seoData.localSEOOptimization.localCitations.justdial,
        seoData.localSEOOptimization.localCitations.googleMaps
      ],
      "hasMap": seoData.localSEOOptimization.localCitations.googleMaps,
      "paymentAccepted": "Cash, Credit Card, Debit Card, UPI, Net Banking",
      "amenityFeature": seoData.localSEOOptimization.googleMyBusiness.attributes.map((attr: string) => ({
        "@type": "LocationFeatureSpecification",
        "name": attr
      }))
    },
    {
      "@type": "WebPage",
      "@id": `${seoData.business.contact.website}/nail/#webpage`,
      "url": `${seoData.business.contact.website}/nail`,
      "name": PAGE_TITLE,
      "description": generateDescription(),
      "isPartOf": {
        "@id": `${seoData.business.contact.website}/#website`
      },
      "about": {
        "@id": `${seoData.business.contact.website}/#organization`
      },
      "primaryImageOfPage": {
        "@type": "ImageObject",
        "url": `${seoData.business.contact.website}/images/nails/bridal-nails-hero.jpg`
      },
      "datePublished": "2024-01-01T00:00:00+05:30",
      "dateModified": new Date().toISOString()
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": seoData.business.contact.website
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Nail Services",
          "item": `${seoData.business.contact.website}/nail`
        }
      ]
    }
  ]
};

// FIXED: Generate concise FAQ
const generateFAQSchema = () => {
  // Get top 5 service FAQs
  const serviceFAQs = nailServices
    .flatMap((service: any) => service.faqs || [])
    .slice(0, 5)
    .map((faq: any) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        // FIXED: Escape quotes
        "text": faq.answer.replace(/"/g, '\\"')
      }
    }));

  const generalFAQs = [
    {
      "@type": "Question",
      "name": `Where is ${seoData.business.name} located?`,
      "acceptedAnswer": {
        "@type": "Answer",
        // FIXED: Using city field
        "text": `We are located at ${seoData.business.address.street}, ${seoData.business.address.city} - ${seoData.business.address.pincode}.`
      }
    },
    {
      "@type": "Question",
      "name": "What nail services do you offer?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `We offer ${nailServices.length}+ nail services including Manicure, Pedicure, Nail Art, Gel Nails, Acrylic Nails, Bridal Nails, and more. Prices range from ₹${Math.min(...nailServices.map((s: any) => s.price))} to ₹${Math.max(...nailServices.map((s: any) => s.price))}.`
      }
    }
  ];

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [...serviceFAQs, ...generalFAQs]
  };
};

// Get all services from JSON
const getAllServices = (): Service[] => {
  return nailServices as Service[];
};

// Get trending services (bestsellers)
const getTrendingServices = (allServices: Service[]): Service[] => {
  return allServices
    .filter(service => service.isBestSeller === true)
    .sort((a, b) => (b.bookingCount || 0) - (a.bookingCount || 0))
    .slice(0, 15); // Limit to top 15 trending services
};

export default function NailPage() {
  const allServices = getAllServices();
  const trendingServices = getTrendingServices(allServices);

  return (
    <>
      {/* Primary Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(nailStructuredData)
        }}
      />

      {/* FAQ Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateFAQSchema())
        }}
      />

      {/* FIXED: Minimal SEO-friendly content */}
      <div className="sr-only" aria-hidden="true">
        <h1>{PAGE_TITLE}</h1>
        <p>{generateDescription()}</p>
      </div>

      <ClientNailPage 
        allServices={allServices}
        trendingServices={trendingServices}
      />
    </>
  );
}

export const dynamic = 'force-static';
export const revalidate = 3600;