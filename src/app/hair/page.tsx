// app/hair/page.tsx - SEO OPTIMIZED VERSION
import { Metadata } from 'next';
import ClientHairPage from './ClientHairPage';
import { Service } from '../../types/service';
import hairServices from '../../../public/hair_services.json';
import seoData from '../../../public/seo.json';

// Dynamic SEO keywords generation
const generateHairKeywords = () => {
  const seoKeywords = [
    ...seoData.seo.serviceSpecificKeywords.hairServices,
    ...seoData.seo.locationBasedKeywords.ultraLocal
  ];
  const serviceKeywords = hairServices.flatMap((service: any) => service.seoKeywords || []);
  
  return [...new Set([...seoKeywords, ...serviceKeywords])];
};

const HAIR_KEYWORDS = generateHairKeywords();

// Generate rich description using actual services
const generateDescription = () => {
  const serviceCount = hairServices.length;
  const categories = [...new Set(hairServices.map((s: any) => s.category))];
  const minPrice = Math.min(...hairServices.map((s: any) => s.price));
  const maxPrice = Math.max(...hairServices.map((s: any) => s.price));
  
  return `⭐${seoData.business.rating} Rated Expert Hair Care Services in ${seoData.business.address.locality}, Patna. ${serviceCount}+ Services including ${categories.slice(0, 3).join(', ')}. Prices from ₹${minPrice} to ₹${maxPrice}. ${seoData.business.totalReviews}+ Happy Clients. Book: ${seoData.business.contact.phone}`;
};

const PAGE_TITLE = `Best Hair Salon & Hair Treatment in ${seoData.business.address.locality} Patna | Keratin, Hair Spa, Coloring, Smoothening | ${seoData.business.name}`;

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: generateDescription(),
  
  keywords: HAIR_KEYWORDS.join(', '),

  openGraph: {
    title: `Professional Hair Care Services ${seoData.business.address.locality} Patna | ${seoData.business.name}`,
    description: generateDescription(),
    images: [
      {
        url: "/images/hair/hair-transformation-patna-kritika.jpg",
        width: 1200,
        height: 630,
        alt: `Best Hair Salon in Patna - ${seoData.business.name}`
      }
    ],
    type: "website",
    locale: "en_IN",
    siteName: seoData.business.name,
    url: `${seoData.business.contact.website}/hair`
  },

  twitter: {
    card: "summary_large_image",
    title: `Best Hair Salon Patna | ${seoData.business.name}`,
    description: generateDescription(),
    images: ["/images/hair/hair-twitter-card.jpg"],
    creator: seoData.business.socialMedia.instagram
  },

  alternates: {
    canonical: `${seoData.business.contact.website}/hair`,
    languages: {
      'en-IN': `${seoData.business.contact.website}/hair`,
      'hi-IN': `${seoData.business.contact.website}/hi/hair`
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
    'service-category': 'Hair Care, Hair Treatment & Styling Services',
    'business-hours': seoData.business.workingHours.weekdays,
    'price-range': '₹₹-₹₹₹'
  },

  verification: {
    google: 'your-google-verification-code',
  }
};

// Enhanced JSON-LD with all hair services
const generateHairServiceOffers = () => {
  return hairServices.map((service: any) => ({
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
      "serviceType": "HairCare",
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
    "url": `${seoData.business.contact.website}/hair/service/${service.slug}`
  }));
};

const hairStructuredData = {
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
      "makesOffer": generateHairServiceOffers(),
      "areaServed": {
        "@type": "GeoCircle",
        "geoMidpoint": {
          "@type": "GeoCoordinates",
          "latitude": seoData.business.coordinates.latitude,
          "longitude": seoData.business.coordinates.longitude
        },
        "geoRadius": seoData.business.serviceRadius,
        "description": `Serving ${seoData.nearbyLandmarks.residential.map((l: any) => l.name).slice(0, 10).join(', ')} and surrounding areas`
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
      "@id": `${seoData.business.contact.website}/hair/#webpage`,
      "url": `${seoData.business.contact.website}/hair`,
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
        "url": `${seoData.business.contact.website}/images/hair/hair-hero-banner.jpg`
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
          "name": "Hair Services",
          "item": `${seoData.business.contact.website}/hair`
        }
      ]
    },
    {
      "@type": "ItemList",
      "name": "Hair Care Services",
      "description": "Complete list of professional hair care and styling services",
      "itemListElement": hairServices.map((service: any, index: number) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `${seoData.business.contact.website}/hair/service/${service.slug}`,
        "name": service.title
      }))
    }
  ]
};

// Enhanced FAQ Schema for hair services
const generateHairFAQSchema = () => {
  const hairFAQs = hairServices.flatMap((service: any) => 
    (service.faqs || []).map((faq: any) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  );

  const generalHairFAQs = [
    {
      "@type": "Question",
      "name": `What is the best hair treatment for Patna's climate?`,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `For Patna's humid climate, we recommend keratin treatments for frizz control and anti-hairfall treatments to combat seasonal shedding. Our experts will assess your hair type and suggest the perfect treatment.`
      }
    },
    {
      "@type": "Question",
      "name": `Do you offer home services for hair treatments?`,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `Yes, we provide home services for all hair treatments within ${seoData.business.serviceRadius} radius of our salon in ${seoData.business.address.locality}.`
      }
    },
    {
      "@type": "Question",
      "name": "What's the difference between keratin and smoothening?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Keratin treatment reduces frizz while maintaining natural texture, perfect for wavy hair. Smoothening straightens hair completely, ideal for curly hair. Our experts will guide you to choose based on your hair type."
      }
    }
  ];

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [...hairFAQs.slice(0, 10), ...generalHairFAQs]
  };
};

// Transform JSON service to match component interface
const transformServiceForComponent = (service: any): Service => ({
  id: service.id,
  name: service.title,
  title: service.title,
  category: service.category,
  imageUrl: service.image,
  image: service.image,
  description: service.description,
  price: service.price,
  base_price: service.price,
  originalPrice: service.originalPrice,
  isTrending: service.isTrending,
  duration: service.duration,
  duration_minutes: service.duration,
  keyIngredients: service.keyIngredients,
  benefits: service.benefits,
  precautions: service.precautions,
  aftercare: service.aftercare,
  faqs: service.faqs,
  link: '/hair/service/' + service.id,
  deal: service.deal || '',
  rating: service.rating || 4.5,
  reviewCount: service.reviewCount || 0,
  bookingCount: service.bookingCount || 0
});

export default function HairPage() {
  const allServices = hairServices.map(transformServiceForComponent) as Service[];
  
  const trendingServices = allServices
    .filter(service => service.isTrending || service.isPopular || service.isBestSeller)
    .sort((a, b) => (b.bookingCount || 0) - (a.bookingCount || 0));

  return (
    <>
      {/* Primary Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(hairStructuredData)
        }}
      />

      {/* FAQ Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateHairFAQSchema())
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
              Hair services near {landmark.name} - {landmark.distance} away
            </li>
          ))}
          {seoData.nearbyLandmarks.healthcare.map((landmark: any) => (
            <li key={landmark.name}>
              Hair treatments near {landmark.name} - {landmark.distance} away
            </li>
          ))}
          {seoData.nearbyLandmarks.residential.slice(0, 5).map((landmark: any) => (
            <li key={landmark.name}>
              Hair salon near {landmark.name} - {landmark.distance} away
            </li>
          ))}
        </ul>

        {/* Service listings for crawler */}
        <section>
          <h2>Our Hair Care Services in {seoData.business.address.locality}, Patna</h2>
          {allServices.slice(0, 10).map(service => (
            <article key={service.id}>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <p>Price: ₹{service.price} | Duration: {service.duration} minutes</p>
              <p>Rating: {service.rating} ({service.reviewCount} reviews)</p>
              <p>Category: {service.category}</p>
              <ul>
                {service.benefits?.map((benefit: string, idx: number) => (
                  <li key={idx}>{benefit}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        {/* Local service areas */}
        <div>
          <h3>Hair Services Available In:</h3>
          <ul>
            <li>Kankarbagh Patna - 0.8km</li>
            <li>Rajendra Nagar Patna - 1km</li>
            <li>Zero Mile Patna - 1km</li>
            <li>Bhootnath Road Patna - 0.1km</li>
            <li>Hanuman Nagar Patna - 1km</li>
            <li>BH Colony Patna - 0.1km</li>
            <li>Kumhrar Patna - 2.5km</li>
          </ul>
        </div>
      </div>

      <ClientHairPage 
        allServices={allServices}
        trendingServices={trendingServices}
      />
    </>
  );
}

// Export for static generation
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour