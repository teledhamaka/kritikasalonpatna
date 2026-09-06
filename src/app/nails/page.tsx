// kritika/src/app/nails/page.tsx - SYNCHRONIZED WITH HAIR & MAKEUP MASTER PATTERNS
import { Metadata } from 'next';
import ClientNailsPage from './ClientNailPage';
import { Service } from '../../types/service';
import nailServices from '../../../public/nail_services.json';
import seoData from '../../../public/seo.json';

// Generate limited keywords (top 60) matching Master System criteria
const generateNailKeywords = () => {
  const nailSeoKeywords = seoData.seo.serviceSpecificKeywords.nailServices || [];
  const locationKeywords = seoData.seo.locationBasedKeywords.ultraLocal || [];
  const serviceKeywords = nailServices.flatMap((service: any) => service.seoKeywords || []);
  
  return [...new Set([...nailSeoKeywords, ...locationKeywords, ...serviceKeywords])].slice(0, 60);
};

const NAIL_KEYWORDS = generateNailKeywords();

// Standardized structure logic avoiding locality fallback leaks
const generateDescription = () => {
  const serviceCount = nailServices.length;
  const categories = [...new Set(nailServices.map((s: any) => s.category))];
  const minPrice = Math.min(...nailServices.map((s: any) => s.price));
  const maxPrice = Math.max(...nailServices.map((s: any) => s.price));
  
  return `⭐${seoData.business.rating} Rated Nail Art & Extension Studio in ${seoData.business.address.city}. ${serviceCount}+ Services including ${categories.slice(0, 3).join(', ')}. Prices from ₹${minPrice} to ₹${maxPrice}. ${seoData.business.totalReviews}+ Happy Clients. Book: ${seoData.business.contact.phone}`;
};

const PAGE_TITLE = `Best Nail Art, Extension & Manicure Salon in ${seoData.business.address.city} | ${seoData.business.name}`;

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: generateDescription(),
  keywords: NAIL_KEYWORDS.join(', '),

  openGraph: {
    title: `Expert Nail Art & Extension Studio in ${seoData.business.address.city} | ${seoData.business.name}`,
    description: generateDescription(),
    images: [
      {
        url: `${seoData.business.contact.website}/images/nails/nail-salon-patna-kritika.jpg`,
        width: 1200,
        height: 630,
        alt: `Best Nail Art & Extension Services in ${seoData.business.address.city} - ${seoData.business.name}`
      }
    ],
    type: "website",
    locale: "en_IN",
    siteName: seoData.business.name,
    url: `${seoData.business.contact.website}/nails`
  },

  twitter: {
    card: "summary_large_image",
    title: `Best Nail Art & Salon Services ${seoData.business.address.city} | ${seoData.business.name}`,
    description: generateDescription(),
    images: [`${seoData.business.contact.website}/images/nails/nail-twitter-card.jpg`],
    creator: `@${seoData.business.socialMedia.instagram.replace('@', '')}`
  },

  alternates: {
    canonical: `${seoData.business.contact.website}/nails`,
    languages: {
      'en-IN': `${seoData.business.contact.website}/nails`,
      'hi-IN': `${seoData.business.contact.website}/hi/nails`
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
    'service-category': 'Nail Art & Salon Services',
    'business-hours': seoData.business.workingHours.weekdays,
    'price-range': '₹₹-₹₹₹'
  },

  verification: {
    google: 'Uj54YUbFFcOLdeffGXlZMH35yYC-N6HyO9Wdoxj_DXA',
  }
};

const generateServiceOffers = () => {
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
        "category": service.primaryCategory || service.category,
        "serviceType": service.eventCategory || service.primaryCategory || service.category,
        "aggregateRating": service.rating && service.reviewCount && service.reviewCount >= 5 ? {
          "@type": "AggregateRating",
          "ratingValue": service.rating.toString(),
          "reviewCount": service.reviewCount.toString()
        } : undefined
      },
      "price": service.price.toString(),
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "url": service.url 
        ? `${seoData.business.contact.website}${service.url}`
        : `${seoData.business.contact.website}/nails/${service.slug || service.id}`
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
      "areaServed": {
        "@type": "City",
        "name": seoData.business.address.city
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
      "@id": `${seoData.business.contact.website}/nails/#webpage`,
      "url": `${seoData.business.contact.website}/nails`,
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
        "url": `${seoData.business.contact.website}/images/nails/nail-treatment-hero.jpg`
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
          "item": `${seoData.business.contact.website}/nails`
        }
      ]
    }
  ]
};

const generateFAQSchema = () => {
  const serviceFAQs = nailServices
    .flatMap((service: any) => service.faqs || [])
    .slice(0, 5)
    .map((faq: any) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer.replace(/"/g, '\\"')
      }
    }));

  const generalFAQs = [
    {
      "@type": "Question",
      "name": `Where is ${seoData.business.name} located?`,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `We are located at ${seoData.business.address.street}, ${seoData.business.address.city} - ${seoData.business.address.pincode}.`
      }
    },
    {
      "@type": "Question",
      "name": "What nail extension and art services do you offer?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `We offer ${nailServices.length}+ specialized nail choices including Gel Extensions, Acrylic Overlays, Chrome Nail Art, Luxury Manicures & Pedicures. Prices range from ₹${Math.min(...nailServices.map((s: any) => s.price))} to ₹${Math.max(...nailServices.map((s: any) => s.price))}.`
      }
    }
  ];

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [...serviceFAQs, ...generalFAQs]
  };
};

const getAllServices = (): Service[] => {
  return nailServices as Service[];
};

const getTrendingServices = (allServices: Service[]): Service[] => {
  return allServices
    .filter(service => service.isBestSeller === true)
    .sort((a, b) => (b.bookingCount || 0) - (a.bookingCount || 0))
    .slice(0, 15);
};

export default function NailPage() {
  const allServices = getAllServices();
  const trendingServices = getTrendingServices(allServices);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(nailStructuredData)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateFAQSchema())
        }}
      />

      <div className="sr-only" aria-hidden="true">
        <h1>{PAGE_TITLE}</h1>
        <p>{generateDescription()}</p>
      </div>

      <ClientNailsPage 
        allServices={allServices}
        trendingServices={trendingServices}
      />
    </>
  );
}

export const dynamic = 'force-static';
export const revalidate = 3600;