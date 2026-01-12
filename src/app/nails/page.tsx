// app/nail/page.tsx - COMPREHENSIVE SEO OPTIMIZED VERSION
import { Metadata } from 'next';
import ClientNailPage from './ClientNailPage';
import { Service } from '../../types/service';
import nailServices from '../../../public/nail_services.json';
import seoData from '../../../public/seo.json';

// Dynamic SEO keywords generation
const generateNailKeywords = () => {
  const seoKeywords = seoData.seo.serviceSpecificKeywords.nailServices || [];
  const locationKeywords = seoData.seo.locationBasedKeywords.ultraLocal || [];
  const serviceKeywords = nailServices.flatMap((service: any) => service.seoKeywords || []);
  
  return [...new Set([...seoKeywords, ...locationKeywords, ...serviceKeywords])];
};

const NAIL_KEYWORDS = generateNailKeywords();

// Generate rich description using actual services
const generateDescription = () => {
  const serviceCount = nailServices.length;
  const categories = [...new Set(nailServices.map((s: any) => s.category))];
  const minPrice = Math.min(...nailServices.map((s: any) => s.price));
  const maxPrice = Math.max(...nailServices.map((s: any) => s.price));
  const totalBookings = nailServices.reduce((sum, s) => sum + (s.bookingCount || 0), 0);
  
  return `⭐${seoData.business.rating} Rated Professional Nail Services in ${seoData.business.address.locality}, Patna. ${serviceCount}+ Services including ${categories.slice(0, 3).join(', ')}. Prices from ₹${minPrice} to ₹${maxPrice}. ${totalBookings.toLocaleString()}+ Nail Appointments. Book: ${seoData.business.contact.phone}`;
};

const PAGE_TITLE = `Best Nail Art & Manicure Pedicure in ${seoData.business.address.locality} Patna | Gel Nails, Bridal Nails | ${seoData.business.name}`;

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: generateDescription(),
  keywords: NAIL_KEYWORDS.join(', '),

  openGraph: {
    title: `Expert Nail Services ${seoData.business.address.locality} Patna | ${seoData.business.name}`,
    description: generateDescription(),
    images: [
      {
        url: "/images/nails/bridal-nails-patna-kritika.jpg",
        width: 1200,
        height: 630,
        alt: `Best Nail Art & Manicure in Patna - ${seoData.business.name}`
      }
    ],
    type: "website",
    locale: "en_IN",
    siteName: seoData.business.name,
    url: `${seoData.business.contact.website}/nail`
  },

  twitter: {
    card: "summary_large_image",
    title: `Best Nail Art Studio Patna | ${seoData.business.name}`,
    description: generateDescription(),
    images: ["/images/nails/nail-art-twitter-card.jpg"],
    creator: seoData.business.socialMedia.instagram
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
  }
};

// Enhanced JSON-LD with all nail services
const generateServiceOffers = () => {
  return nailServices.map((service: any) => ({
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
      "serviceType": service.category,
      "aggregateRating": service.rating ? {
        "@type": "AggregateRating",
        "ratingValue": service.rating.toString(),
        "reviewCount": service.reviewCount?.toString() || "0",
        "ratingCount": service.reviewCount?.toString() || "0"
      } : undefined,
      "duration": `PT${service.duration}M`
    },
    "price": service.price.toString(),
    "priceCurrency": "INR",
    "priceValidUntil": new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    "url": `${seoData.business.contact.website}/nail/${service.slug}`,
    "availability": "https://schema.org/InStock",
    "category": service.category
  }));
};

const nailStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BeautySalon",
      "@id": `${seoData.business.contact.website}/#organization`,
      "name": seoData.business.name,
      "description": `${seoData.business.description} - Professional nail salon offering manicure, pedicure, nail art, and bridal nail services.`,
      "url": seoData.business.contact.website,
      "logo": `${seoData.business.contact.website}/logo.png`,
      "telephone": seoData.business.contact.phone,
      "email": seoData.business.contact.email,
      "priceRange": "₹-₹₹₹",
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
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Nail Services",
        "itemListElement": nailServices.map((service: any, index: number) => ({
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": service.title
          },
          "position": index + 1
        }))
      },
      "areaServed": {
        "@type": "GeoCircle",
        "geoMidpoint": {
          "@type": "GeoCoordinates",
          "latitude": seoData.business.coordinates.latitude,
          "longitude": seoData.business.coordinates.longitude
        },
        "geoRadius": seoData.business.serviceRadius,
        "description": `Serving nail services to ${Object.values(seoData.nearbyLandmarks).flat().map((l: any) => l.name).slice(0, 10).join(', ')} and surrounding areas`
      }
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

// Enhanced FAQ Schema for nail services
const generateNailFAQSchema = () => {
  const allFAQs = nailServices.flatMap((service: any) => 
    (service.faqs || []).slice(0, 3).map((faq: any) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  );

  // Add general nail FAQs
  const generalFAQs = [
    {
      "@type": "Question",
      "name": "What is the difference between gel and acrylic nails?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `Gel nails are more flexible and better for Patna's humid climate, while acrylic is more durable for rigorous activities. At ${seoData.business.name} in ${seoData.business.address.locality}, we help you choose based on your lifestyle and nail health.`
      }
    },
    {
      "@type": "Question",
      "name": "How long do nail extensions last?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "With proper care, our nail extensions last 3-4 weeks before needing fills. We recommend fills every 3 weeks for optimal maintenance and nail health."
      }
    },
    {
      "@type": "Question",
      "name": `Where is ${seoData.business.name} located for nail services?`,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `We are located at ${seoData.business.address.street}, ${seoData.business.address.locality}, Patna - ${seoData.business.address.pincode}. Easily accessible from ${seoData.nearbyLandmarks.transport.slice(0, 3).map((t: any) => t.name).join(', ')}.`
      }
    },
    {
      "@type": "Question",
      "name": "How far in advance should I book bridal nails?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We recommend booking 2-3 days in advance for bridal nail trials and 1-2 days before the wedding for the actual appointment. This ensures optimal freshness and durability for your wedding ceremonies."
      }
    }
  ];

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [...allFAQs.slice(0, 6), ...generalFAQs]
  };
};

export default function NailPage() {
  const allServices = nailServices.map((service: any): Service => ({
    id: service.id,
    name: service.title,
    title: service.title,
    category: service.category,
    imageUrl: service.image,
    image: service.image,
    description: service.description,
    shortDescription: service.shortDescription,
    price: service.price,
    base_price: service.price,
    originalPrice: service.originalPrice,
    discountPercentage: service.discountPercentage,
    isTrending: service.isTrending,
    isPopular: service.isPopular,
    isBestSeller: service.isBestSeller,
    duration: service.duration,
    duration_minutes: service.duration,
    keyIngredients: service.keyIngredients,
    benefits: service.benefits,
    precautions: service.precautions,
    aftercare: service.aftercare,
    faqs: service.faqs,
    rating: service.rating,
    reviewCount: service.reviewCount,
    bookingCount: service.bookingCount,
    link: `/nail/${service.slug}`,
    deal: `${service.discountPercentage}% OFF`
  }));

  const trendingServices = allServices
    .filter(service => service.isTrending || service.isPopular || service.isBestSeller)
    .sort((a, b) => (b.bookingCount || 0) - (a.bookingCount || 0));

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
          __html: JSON.stringify(generateNailFAQSchema())
        }}
      />

      {/* Hidden SEO content for crawlers */}
      <div className="sr-only" aria-hidden="true">
        <h1>{PAGE_TITLE}</h1>
        <p>{generateDescription()}</p>
        
        {/* Location-based content */}
        <section>
          <h2>Nail Services in {seoData.business.address.locality} and Nearby Areas</h2>
          <ul>
            {seoData.nearbyLandmarks.educational.map((landmark: any) => (
              <li key={landmark.name}>
                Nail art near {landmark.name} - {landmark.distance} away
              </li>
            ))}
            {seoData.nearbyLandmarks.commercial.map((landmark: any) => (
              <li key={landmark.name}>
                Manicure pedicure near {landmark.name} - {landmark.distance} away
              </li>
            ))}
            {seoData.nearbyLandmarks.residential.map((landmark: any) => (
              <li key={landmark.name}>
                Home nail services near {landmark.name} - {landmark.distance} away
              </li>
            ))}
          </ul>
        </section>

        {/* Service details for crawlers */}
        <section>
          <h2>Our Professional Nail Services</h2>
          {allServices.map(service => (
            <article key={service.id} itemScope itemType="https://schema.org/Service">
              <h3 itemProp="name">{service.title}</h3>
              <p itemProp="description">{service.description}</p>
              <div itemProp="offers" itemScope itemType="https://schema.org/Offer">
                <meta itemProp="price" content={service.price.toString()} />
                <meta itemProp="priceCurrency" content="INR" />
              </div>
              <p>Duration: {service.duration} minutes | Rating: {service.rating}/5 ({service.reviewCount} reviews)</p>
              <p>Category: {service.category}</p>
              {service.keyIngredients && service.keyIngredients.length > 0 && (
                <p>Key Ingredients: {service.keyIngredients.join(', ')}</p>
              )}
            </article>
          ))}
        </section>
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