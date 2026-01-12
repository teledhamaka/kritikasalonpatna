// kritika/src/app/page.tsx - COMPREHENSIVE SEO OPTIMIZED VERSION
import { Metadata } from 'next';
import ClientHomePage from './ClientHomePage';
import { Service } from '../types/service';

// Import all service JSON files
import makeupServices from '../../public/makeup_services.json';
import hairServices from '../../public/hair_services.json';
import nailServices from '../../public/nail_services.json';
import skinServices from '../../public/skin_services.json';
import seoData from '../../public/seo.json';

// Generate comprehensive keywords from all services and SEO data
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
  
  return [...new Set([...allSeoKeywords, ...serviceKeywords])];
};

const HOME_KEYWORDS = generateHomeKeywords();

// Generate rich description using actual data
const generateDescription = () => {
  const totalServices = makeupServices.length + hairServices.length + nailServices.length + skinServices.length;
  const categories = ['Makeup', 'Hair', 'Skin', 'Nail'];
  
  return `⭐${seoData.business.rating} Rated ${seoData.business.name} in ${seoData.business.address.locality}, Patna. ${totalServices}+ Premium Beauty Services including ${categories.join(', ')} treatments. Expert Bridal Makeup, Hair Spa, Facials & Nail Art. ${seoData.business.totalReviews}+ Happy Clients. Book: ${seoData.business.contact.phone}`;
};

const PAGE_TITLE = `Best Ladies Beauty Parlour in ${seoData.business.address.locality} Patna | ${seoData.business.name} | Premium Makeup, Hair, Skin & Nail Services`;

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: generateDescription(),
  
  keywords: HOME_KEYWORDS.join(', '),

  openGraph: {
    title: `${seoData.business.name} - Premier Beauty Salon in ${seoData.business.address.locality}, Patna`,
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
    creator: seoData.business.socialMedia.instagram
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
    google: 'your-google-verification-code',
  }
};

// Enhanced JSON-LD with comprehensive service catalog
const generateAllServiceOffers = () => {
  const allServices = [
    ...makeupServices,
    ...hairServices,
    ...nailServices,
    ...skinServices
  ];
  
  return allServices.map((service: any) => ({
    "@type": "Offer",
    "itemOffered": {
      "@type": "Service",
      "name": service.title,
      "description": service.shortDescription,
      "image": `${seoData.business.contact.website}${service.image}`,
      "provider": {
        "@type": "BeautySalon",
        "name": seoData.business.name
      },
      "category": service.category,
      "serviceType": service.serviceType || "BeautyService",
      "aggregateRating": service.rating ? {
        "@type": "AggregateRating",
        "ratingValue": service.rating.toString(),
        "reviewCount": service.reviewCount?.toString() || "0"
      } : undefined
    },
    "price": service.price.toString(),
    "priceCurrency": "INR",
    "availability": "https://schema.org/InStock",
    "priceValidUntil": new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    "url": `${seoData.business.contact.website}/service/${service.slug}`
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
        "streetAddress": `${seoData.business.address.street}, ${seoData.business.address.locality}`,
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
      "areaServed": {
        "@type": "GeoCircle",
        "geoMidpoint": {
          "@type": "GeoCoordinates",
          "latitude": seoData.business.coordinates.latitude,
          "longitude": seoData.business.coordinates.longitude
        },
        "geoRadius": seoData.business.serviceRadius,
        "description": `Serving ${[
          ...seoData.nearbyLandmarks.educational.map((l: any) => l.name),
          ...seoData.nearbyLandmarks.residential.map((l: any) => l.name),
          ...seoData.nearbyLandmarks.commercial.map((l: any) => l.name)
        ].slice(0, 15).join(', ')} and surrounding areas`
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

// Generate comprehensive FAQ from all services
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
        "text": faq.answer
      }
    }));

  const generalFAQs = [
    {
      "@type": "Question",
      "name": `Where is ${seoData.business.name} located?`,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `We are located at ${seoData.business.address.street}, ${seoData.business.address.locality}, ${seoData.business.address.city} - ${seoData.business.address.pincode}. Easily accessible from ${seoData.nearbyLandmarks.transport.map((t: any) => t.name).join(', ')}.`
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
    .filter(service => 
      service.isTrending === true || 
      service.isPopular === true || 
      service.isBestSeller === true
    )
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

      {/* SEO-friendly content for crawlers */}
      <div className="sr-only" aria-hidden="true">
        <h1>{PAGE_TITLE}</h1>
        <p>{generateDescription()}</p>
        
        {/* Service categories for crawlers */}
        <nav aria-label="Service categories">
          <ul>
            <li><a href="/makeup">Bridal & Party Makeup Services - {makeupServices.length} options</a></li>
            <li><a href="/hair">Hair Care & Styling Services - {hairServices.length} options</a></li>
            <li><a href="/skin">Skin Treatment & Facial Services - {skinServices.length} options</a></li>
            <li><a href="/nail">Nail Art & Manicure Services - {nailServices.length} options</a></li>
          </ul>
        </nav>

        {/* Location coverage for crawlers */}
        <section>
          <h2>Areas We Serve in Patna</h2>
          <ul>
            {seoData.nearbyLandmarks.educational.map((landmark: any) => (
              <li key={landmark.name}>
                Beauty services near {landmark.name} - {landmark.distance}
              </li>
            ))}
            {seoData.nearbyLandmarks.residential.map((landmark: any) => (
              <li key={landmark.name}>
                Ladies parlour near {landmark.name} - {landmark.distance}
              </li>
            ))}
            {seoData.nearbyLandmarks.commercial.map((landmark: any) => (
              <li key={landmark.name}>
                Salon services near {landmark.name} - {landmark.distance}
              </li>
            ))}
          </ul>
        </section>

        {/* Featured services for crawlers */}
        <section>
          <h2>Featured Services</h2>
          {trendingServices.slice(0, 10).map(service => (
            <article key={service.id}>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <p>Price: ₹{service.price} | Duration: {service.duration} minutes</p>
              <p>Rating: {service.rating}/5 ({service.reviewCount} reviews)</p>
            </article>
          ))}
        </section>
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