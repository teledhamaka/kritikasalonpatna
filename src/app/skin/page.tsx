// kritika/src/app/skin/page.tsx - COMPREHENSIVE SEO OPTIMIZED VERSION
import { Metadata } from 'next';
import ClientSkinPage from './ClientSkinPage';
import { Service } from '../../types/service';
import skinServices from '../../../public/skin_services.json';
import seoData from '../../../public/seo.json';

// Dynamic SEO keywords generation from both files
const generateSkinKeywords = () => {
  const hairSeoKeywords = seoData.seo.serviceSpecificKeywords.hairServices || [];
  const skinSeoKeywords = seoData.seo.serviceSpecificKeywords.skinServices || [];
  const locationKeywords = seoData.seo.locationBasedKeywords.ultraLocal || [];
  const serviceKeywords = skinServices.flatMap((service: any) => service.seoKeywords || []);
  
  return [...new Set([...hairSeoKeywords, ...skinSeoKeywords, ...locationKeywords, ...serviceKeywords])];
};

const SKIN_KEYWORDS = generateSkinKeywords();

// Generate rich description using actual services
const generateDescription = () => {
  const serviceCount = skinServices.length;
  const categories = [...new Set(skinServices.map((s: any) => s.category))];
  const minPrice = Math.min(...skinServices.map((s: any) => s.price));
  const maxPrice = Math.max(...skinServices.map((s: any) => s.price));
  
  return `⭐${seoData.business.rating} Rated Expert Skin & Body Care Services in ${seoData.business.address.locality}, Patna. ${serviceCount}+ Services including ${categories.slice(0, 3).join(', ')}. Prices from ₹${minPrice} to ₹${maxPrice}. ${seoData.business.totalReviews}+ Happy Clients. Book: ${seoData.business.contact.phone}`;
};

const PAGE_TITLE = `Best Skin Treatment & Facial Services in ${seoData.business.address.locality} Patna | Hydrafacial, D-Tan & Body Care | ${seoData.business.name}`;

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: generateDescription(),
  
  keywords: SKIN_KEYWORDS.join(', '),

  openGraph: {
    title: `Expert Skin Treatment & Facial Services ${seoData.business.address.locality} Patna | ${seoData.business.name}`,
    description: generateDescription(),
    images: [
      {
        url: "/images/skin/skin-treatment-patna-kritika.jpg",
        width: 1200,
        height: 630,
        alt: `Best Skin Treatment & Facial Services in Patna - ${seoData.business.name}`
      }
    ],
    type: "website",
    locale: "en_IN",
    siteName: seoData.business.name,
    url: `${seoData.business.contact.website}/skin`
  },

  twitter: {
    card: "summary_large_image",
    title: `Best Skin Treatment & Facial Services Patna | ${seoData.business.name}`,
    description: generateDescription(),
    images: ["/images/skin/skin-twitter-card.jpg"],
    creator: seoData.business.socialMedia.instagram
  },

  alternates: {
    canonical: `${seoData.business.contact.website}/skin`,
    languages: {
      'en-IN': `${seoData.business.contact.website}/skin`,
      'hi-IN': `${seoData.business.contact.website}/hi/skin`
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
    'service-category': 'Skin Treatment & Facial Services',
    'business-hours': seoData.business.workingHours.weekdays,
    'price-range': '₹₹-₹₹₹'
  },

  verification: {
    google: 'your-google-verification-code',
  }
};

// Enhanced JSON-LD with all services
const generateServiceOffers = () => {
  return skinServices.map((service: any) => ({
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

const skinStructuredData = {
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
      "makesOffer": generateServiceOffers(),
      "areaServed": {
        "@type": "GeoCircle",
        "geoMidpoint": {
          "@type": "GeoCoordinates",
          "latitude": seoData.business.coordinates.latitude,
          "longitude": seoData.business.coordinates.longitude
        },
        "geoRadius": seoData.business.serviceRadius,
        "description": `Serving ${Object.values(seoData.nearbyLandmarks).flat().map((l: any) => l.name).slice(0, 10).join(', ')} and surrounding areas`
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
      "@id": `${seoData.business.contact.website}/skin/#webpage`,
      "url": `${seoData.business.contact.website}/skin`,
      "name": metadata.title,
      "description": metadata.description,
      "isPartOf": {
        "@id": `${seoData.business.contact.website}/#website`
      },
      "about": {
        "@id": `${seoData.business.contact.website}/#organization`
      },
      "primaryImageOfPage": {
        "@type": "ImageObject",
        "url": `${seoData.business.contact.website}/images/skin/skin-treatment-hero.jpg`
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
          "name": "Skin & Body Care Services",
          "item": `${seoData.business.contact.website}/skin`
        }
      ]
    },
    {
      "@type": "ItemList",
      "name": "Skin & Body Care Services",
      "description": "Complete list of professional skin treatment and body care services",
      "itemListElement": skinServices.map((service: any, index: number) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `${seoData.business.contact.website}/service/${service.slug}`,
        "name": service.title
      }))
    }
  ]
};

// Enhanced FAQ Schema with actual service FAQs
const generateFAQSchema = () => {
  const allFAQs = skinServices.flatMap((service: any) => 
    (service.faqs || []).map((faq: any) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  );

  // Add general FAQs
  const generalFAQs = [
    {
      "@type": "Question",
      "name": `Where is ${seoData.business.name} located?`,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `We are located at ${seoData.business.address.street}, ${seoData.business.address.locality}, ${seoData.business.address.city}, ${seoData.business.address.state} - ${seoData.business.address.pincode}. We serve a ${seoData.business.serviceRadius} radius including areas like Kankarbagh, Rajendra Nagar, and more.`
      }
    },
    {
      "@type": "Question",
      "name": "What are your working hours?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `We are open ${seoData.business.workingHours.weekdays} on weekdays and ${seoData.business.workingHours.weekends} on weekends. ${seoData.business.workingHours.emergencyBooking}`
      }
    }
  ];

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [...allFAQs.slice(0, 10), ...generalFAQs]
  };
};

export default function SkinPage() {
  const allServices = skinServices as Service[];
  
  const trendingServices = allServices
    .filter(service => service.isTrending || service.isPopular || service.isBestSeller)
    .sort((a, b) => (b.bookingCount || 0) - (a.bookingCount || 0));

  return (
    <>
      {/* Primary Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(skinStructuredData)
        }}
      />

      {/* FAQ Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateFAQSchema())
        }}
      />

      {/* SEO-friendly content for crawlers */}
      <div className="sr-only" aria-hidden="true">
        <h1>{PAGE_TITLE}</h1>
        <p>{metadata.description}</p>
        
        {/* Location keywords for crawler */}
        <ul>
          {seoData.nearbyLandmarks.educational.map((landmark: any) => (
            <li key={landmark.name}>
              Skin treatment services near {landmark.name} - {landmark.distance} away
            </li>
          ))}
          {seoData.nearbyLandmarks.healthcare.map((landmark: any) => (
            <li key={landmark.name}>
              Facial services near {landmark.name} - {landmark.distance} away
            </li>
          ))}
          {seoData.nearbyLandmarks.commercial.map((landmark: any) => (
            <li key={landmark.name}>
              Body care services near {landmark.name} - {landmark.distance} away
            </li>
          ))}
        </ul>

        {/* Service listings for crawler */}
        <section>
          <h2>Our Skin & Body Care Services in Patna</h2>
          {allServices.map(service => (
            <article key={service.id}>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <p>Price: ₹{service.price} | Duration: {service.duration} minutes</p>
              <p>Rating: {service.rating} ({service.reviewCount} reviews)</p>
              <p>Category: {service.category}</p>
              <ul>
                {service.benefits.map((benefit, idx) => (
                  <li key={idx}>{benefit}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      </div>

      <ClientSkinPage 
        allServices={allServices}
        trendingServices={trendingServices}
      />
    </>
  );
}

// Export for static generation
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour