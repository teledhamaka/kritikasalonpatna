// app/makeup/page.tsx - SEPARATED SERVER COMPONENT WITH FULL SEO & SCHEMA
import { Metadata } from 'next';
import ClientMakeupPage from './ClientMakeupPage';
import { Service } from '../../types/service';
import makeupServices from '../../../public/makeup_services.json'; // Make sure this JSON exists
import seoData from '../../../public/seo.json';

// Generate optimized keywords tailored for makeup services (limited to top 60)
const generateMakeupKeywords = () => {
  const seoKeywords = seoData.seo.serviceSpecificKeywords.makeupServices || [];
  const locationKeywords = seoData.seo.locationBasedKeywords.ultraLocal || [];
  const serviceKeywords = makeupServices.flatMap((service: any) => service.seoKeywords || []);
  
  return [...new Set([...seoKeywords, ...locationKeywords, ...serviceKeywords])].slice(0, 60);
};

const MAKEUP_KEYWORDS = generateMakeupKeywords();

// Generate dynamic hyper-local description
const generateDescription = () => {
  const serviceCount = makeupServices.length;
  const categories = [...new Set(makeupServices.map((s: any) => s.category))];
  const minPrice = Math.min(...makeupServices.map((s: any) => s.price));
  const maxPrice = Math.max(...makeupServices.map((s: any) => s.price));
  
  return `⭐${seoData.business.rating} Rated Premium Makeup Artists in ${seoData.business.address.city}. ${serviceCount}+ Luxury Packages including ${categories.slice(0, 3).join(', ')}. Prices from ₹${minPrice} to ₹${maxPrice}. ${seoData.business.totalReviews}+ Bridal Transformations. Book: ${seoData.business.contact.phone}`;
};

const PAGE_TITLE = `Best Bridal Makeup Artist & Party Makeovers in ${seoData.business.address.city} | HD, Airbrush | ${seoData.business.name}`;

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: generateDescription(),
  keywords: MAKEUP_KEYWORDS.join(', '),

  openGraph: {
    title: `Luxury Bridal & Party Makeup ${seoData.business.address.city} | ${seoData.business.name}`,
    description: generateDescription(),
    images: [
      {
        url: `${seoData.business.contact.website}/images/makeup/bridal-makeup-transformation-patna.jpg`,
        width: 1200,
        height: 630,
        alt: `Best Bridal Makeup Artist in ${seoData.business.address.city} - ${seoData.business.name}`
      }
    ],
    type: "website",
    locale: "en_IN",
    siteName: seoData.business.name,
    url: `${seoData.business.contact.website}/makeup`
  },

  twitter: {
    card: "summary_large_image",
    title: `Premium Makeup Studio ${seoData.business.address.city} | ${seoData.business.name}`,
    description: generateDescription(),
    images: [`${seoData.business.contact.website}/images/makeup/makeup-twitter-card.jpg`],
    creator: `@${seoData.business.socialMedia.instagram.replace('@', '')}`
  },

  alternates: {
    canonical: `${seoData.business.contact.website}/makeup`,
    languages: {
      'en-IN': `${seoData.business.contact.website}/makeup`,
      'hi-IN': `${seoData.business.contact.website}/hi/makeup`
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
    'service-category': 'Bridal Makeup, Party Makeup, Airbrush Makeup, Engagement Makeover',
    'business-hours': seoData.business.workingHours.weekdays,
    'price-range': '₹₹-₹₹₹'
  },

  verification: {
    google: 'Uj54YUbFFcOLdeffGXlZMH35yYC-N6HyO9Wdoxj_DXA',
  }
};

// Generate high-value markup service listings for JSON-LD (capped at top 20 to preserve document weight)
const generateServiceOffers = () => {
  return makeupServices
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
        : `${seoData.business.contact.website}/makeup/service/${service.slug || service.id}`
    }));
};

const makeupStructuredData = {
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
      "@id": `${seoData.business.contact.website}/makeup/#webpage`,
      "url": `${seoData.business.contact.website}/makeup`,
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
        "url": `${seoData.business.contact.website}/images/makeup/makeup-hero-banner.jpg`
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
          "name": "Makeup Services",
          "item": `${seoData.business.contact.website}/makeup`
        }
      ]
    }
  ]
};

const generateFAQSchema = () => {
  const serviceFAQs = makeupServices
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
      "name": `Do you offer on-venue bridal makeup services near ${seoData.business.address.city}?`,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `Yes! ${seoData.business.name} offers premium on-venue and destination bridal makeup services across ${seoData.business.address.city} and neighboring regions. Outstation travel and stay charges apply based on distance.`
      }
    },
    {
      "@type": "Question",
      "name": "What is the difference between HD Makeup and Airbrush Makeup?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "HD Makeup uses high-end, light-scattering microproducts applied with traditional brushes or blenders for a natural, camera-ready look. Airbrush Makeup utilizes a specialized spray gun system to layer a flawless, water-resistant, ultra-long-lasting mist ideal for high humidity and all-day wedding events."
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
  return makeupServices as unknown as Service[];
};

const getTrendingServices = (allServices: Service[]): Service[] => {
  return allServices
    .filter(service => service.isBestSeller === true)
    .sort((a, b) => (b.bookingCount || 0) - (a.bookingCount || 0))
    .slice(0, 15);
};

export default function MakeupPage() {
  const allServices = getAllServices();
  const trendingServices = getTrendingServices(allServices);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(makeupStructuredData)
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

      <ClientMakeupPage 
        allServices={allServices}
        trendingServices={trendingServices}
      />
    </>
  );
}

export const dynamic = 'force-static';
export const revalidate = 3600;