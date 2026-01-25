// kritika/src/app/page.tsx - PATCHED SEO OPTIMIZED VERSION
import { Metadata } from 'next';
import ClientHomePage from './ClientHomePage';
import { Service } from '../types/service';

// Import all service JSON files
import makeupServices from '../../public/makeup_services.json';
import hairServices from '../../public/hair_services.json';
import nailServices from '../../public/nail_services.json';
import skinServices from '../../public/skin_services.json';
import seoData from '../../public/seo.json';

// FIXED: Generate comprehensive keywords (limited to top 60)
const generateHomeKeywords = () => {
  const allSeoKeywords = [
    ...seoData.seo.serviceSpecificKeywords.hairServices,
    ...seoData.seo.serviceSpecificKeywords.skinServices,
    ...seoData.seo.serviceSpecificKeywords.nailServices,
    ...seoData.seo.serviceSpecificKeywords.bridalServices,
    ...seoData.seo.locationBasedKeywords.ultraLocal,
    ...seoData.seo.locationBasedKeywords.educationalHubs,
    ...seoData.seo.locationBasedKeywords.healthcare,
    ...seoData.seo.locationBasedKeywords.commercialAreas,
    ...seoData.seo.locationBasedKeywords.transport,
    ...seoData.seo.locationBasedKeywords.residential,
    ...seoData.seo.locationBasedKeywords.nearbyAreas,
  ];
  
  const serviceKeywords = [
    ...makeupServices,
    ...hairServices,
    ...nailServices,
    ...skinServices
  ].flatMap((service: any) => service.seoKeywords || []);
  
  // FIXED: Limit to top 60 keywords to avoid bloat
  return [...new Set([...allSeoKeywords, ...serviceKeywords])].slice(0, 60);
};

const HOME_KEYWORDS = generateHomeKeywords();

// FIXED: Generate rich description using actual data and correct city field
const generateDescription = () => {
  const totalServices = makeupServices.length + hairServices.length + nailServices.length + skinServices.length;
  const categories = ['Makeup', 'Hair', 'Skin', 'Nails'];
  
  return `⭐${seoData.business.rating} Rated ${seoData.business.name} in ${seoData.business.address.city}. ${totalServices}+ Premium Beauty Services including ${categories.join(', ')} treatments. Expert Bridal Makeup, Hair Spa, Facials & Nail Art. ${seoData.business.totalReviews}+ Happy Clients. Book: ${seoData.business.contact.phone}`;
};

// FIXED: Using city instead of locality
const PAGE_TITLE = `Best Ladies Beauty Parlour in ${seoData.business.address.city} | ${seoData.business.name} | Premium Makeup, Hair, Skin & Nail Services`;

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: generateDescription(),
  
  keywords: HOME_KEYWORDS.join(', '), // Already limited to 60

  openGraph: {
    title: `${seoData.business.name} - Premier Beauty Salon in ${seoData.business.address.city}`,
    description: generateDescription(),
    images: [
      {
        url: `${seoData.business.contact.website}/images/kritika-salon-patna.jpg`,
        width: 1200,
        height: 630,
        alt: `${seoData.business.name} - Best Beauty Parlour in Patna`
      }
    ],
    type: "website",
    locale: "en_IN",
    siteName: seoData.business.name,
    url: seoData.business.contact.website
  },

  twitter: {
    card: "summary_large_image",
    title: `${seoData.business.name} - Premium Beauty Salon Patna`,
    description: generateDescription(),
    images: [`${seoData.business.contact.website}/images/twitter-card.jpg`],
    // FIXED: Proper Twitter handle format
    creator: `@${seoData.business.socialMedia.instagram.replace('@', '')}`
  },

  alternates: {
    canonical: seoData.business.contact.website,
    languages: {
      'en-IN': seoData.business.contact.website,
      'hi-IN': `${seoData.business.contact.website}/hi`
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
    'service-category': 'Beauty Salon, Bridal Makeup, Hair Care, Skin Treatment, Nail Services',
    'business-hours': seoData.business.workingHours.weekdays,
    'price-range': '₹₹-₹₹₹'
  },

  verification: {
    google: 'Uj54YUbFFcOLdeffGXlZMH35yYC-N6HyO9Wdoxj_DXA',
  }
};

// FIXED: Enhanced service offers - limited to top 20, with correct fields
const generateAllServiceOffers = () => {
  const allServices = [
    ...makeupServices,
    ...hairServices,
    ...nailServices,
    ...skinServices
  ];
  
  // FIXED: Limit to top 20 services by booking count
  return allServices
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
        // FIXED: Using primaryCategory
        "category": service.primaryCategory,
        "serviceType": service.eventCategory || service.primaryCategory,
        // FIXED: Only add ratings if legitimate (5+ reviews)
        "aggregateRating": service.rating && service.reviewCount && service.reviewCount >= 5 ? {
          "@type": "AggregateRating",
          "ratingValue": service.rating.toString(),
          "reviewCount": service.reviewCount.toString()
        } : undefined
      },
      "price": service.price.toString(),
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      // "priceValidUntil": new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      // FIXED: Correct URL generation using primaryCategory
      "url": service.url 
        ? `${seoData.business.contact.website}${service.url}`
        : `${seoData.business.contact.website}/${service.primaryCategory}/${service.slug || service.id}`
    }));
};

const homeStructuredData = {
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
      "makesOffer": generateAllServiceOffers(),
      // FIXED: Simplified to City instead of GeoCircle
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
      "@id": `${seoData.business.contact.website}/#webpage`,
      "url": seoData.business.contact.website,
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
        "url": `${seoData.business.contact.website}/images/hero-banner.jpg`
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
        }
      ]
    }
  ]
};

// FIXED: Generate comprehensive FAQ with escaped HTML
const generateComprehensiveFAQ = () => {
  const allServices = [
    ...makeupServices,
    ...hairServices,
    ...nailServices,
    ...skinServices
  ];
  
  const serviceFAQs = allServices
    .flatMap((service: any) => service.faqs || [])
    .slice(0, 5)
    .map((faq: any) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        // FIXED: Escape quotes in answers
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
        "text": `We are located at ${seoData.business.address.street}, ${seoData.business.address.city} - ${seoData.business.address.pincode}. Easily accessible from ${seoData.nearbyLandmarks.transport.map((t: any) => t.name).join(', ')}.`
      }
    },
    {
      "@type": "Question",
      "name": "What services do you offer?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `We offer comprehensive beauty services including Bridal Makeup, HD & Airbrush Makeup, Hair Treatments (Keratin, Spa, Coloring), Skin Treatments (Facials, HydraFacial, D-Tan), and Nail Services (Manicure, Pedicure, Nail Art). Total ${makeupServices.length + hairServices.length + nailServices.length + skinServices.length}+ services available.`
      }
    },
    {
      "@type": "Question",
      "name": "What are your working hours?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `We are open ${seoData.business.workingHours.weekdays} on weekdays and ${seoData.business.workingHours.weekends} on weekends. ${seoData.business.workingHours.emergencyBooking}`
      }
    },
    {
      "@type": "Question",
      "name": "Do you offer home services?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `Yes, we provide home services within ${seoData.business.serviceRadius} radius covering ${seoData.nearbyLandmarks.residential.slice(0, 5).map((l: any) => l.name).join(', ')} and nearby areas.`
      }
    }
  ];

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [...serviceFAQs, ...generalFAQs]
  };
};

// Get all services from JSON files
const getAllServices = (): Service[] => {
  return [
    ...makeupServices,
    ...hairServices,
    ...nailServices,
    ...skinServices
  ] as Service[];
};

// Get trending services across all categories
const getTrendingServices = (allServices: Service[]): Service[] => {
  return allServices
    .filter(service => service.isBestSeller === true)
    .sort((a, b) => (b.bookingCount || 0) - (a.bookingCount || 0))
    .slice(0, 20); // Limit to top 20 trending services
};

export default function HomePage() {
  const allServices = getAllServices();
  const trendingServices = getTrendingServices(allServices);

  return (
    <>
      {/* Primary Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homeStructuredData)
        }}
      />

      {/* FAQ Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateComprehensiveFAQ())
        }}
      />

      {/* FIXED: Minimal SEO-friendly content (anti-spam) */}
      <div className="sr-only" aria-hidden="true">
        <h1>{PAGE_TITLE}</h1>
        <p>{generateDescription()}</p>
      </div>

      <ClientHomePage 
        allServices={allServices}
        trendingServices={trendingServices}
      />
    </>
  );
}

export const dynamic = 'force-static';
export const revalidate = 3600;