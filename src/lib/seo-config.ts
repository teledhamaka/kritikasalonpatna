// src/lib/seo-config.ts

export const BUSINESS_CONFIG = {
  name: "Kritika Ladies Beauty Parlour",
  tagline: "Patna's Premier Ladies Beauty Destination",
  description: "Best ladies salon in Bhootnath Road, Patna offering hair care, bridal makeup, spa services, nail art, and beauty treatments",
  
  // Location Details
  location: {
    street: "Bhootnath Road",
    city: "Patna",
    state: "Bihar",
    country: "India",
    postalCode: "800001",
    coordinates: {
      latitude: 25.587406341942586,
      longitude: 85.17572682575796
    },
    nearbyLandmarks: [
      "Patna Junction Railway Station",
      "Gandhi Maidan",
      "Ashok Rajpath"
    ]
  },
  
  // Contact Information
  contact: {
    phone: "+91-XXXXXXXXXX",
    whatsapp: "+91-XXXXXXXXXX",
    email: "info@glamoursalon.com",
    hours: {
      weekdays: "10:00 AM - 8:00 PM",
      weekends: "10:00 AM - 8:00 PM",
      holidays: "Open on all holidays"
    }
  },
  
  // Social Media
  social: {
    facebook: "https://facebook.com/glamoursalonpatna",
    instagram: "https://instagram.com/glamoursalonpatna",
    youtube: "https://youtube.com/@glamoursalonpatna",
    pinterest: "https://pinterest.com/glamoursalonpatna",
    twitter: "https://twitter.com/glamoursalon"
  },
  
  // Services
  mainServices: [
    "Hair Treatment & Spa",
    "Bridal Makeup",
    "Party Makeup",
    "Facial Services",
    "Nail Art & Manicure",
    "Body Spa & Massage",
    "Threading & Waxing",
    "Hair Coloring & Styling"
  ],
  
  // SEO Keywords
  primaryKeywords: [
    "ladies salon patna",
    "best salon bhootnath road",
    "bridal makeup patna",
    "hair treatment patna",
    "beauty parlour patna",
    "spa in patna"
  ],
  
  secondaryKeywords: [
    "hair fall treatment patna",
    "facial in patna",
    "nail art patna",
    "makeup artist patna",
    "beauty services patna",
    "salon near me patna"
  ],
  
  // Long-tail Keywords
  longtailKeywords: [
    "best ladies salon in bhootnath road patna",
    "bridal makeup artist near patna junction",
    "affordable salon services in patna bihar",
    "hair spa treatment in patna",
    "top rated beauty parlour patna"
  ]
};

// Generate Local Business Schema
export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "@id": "https://yourwebsite.com/#organization",
    "name": BUSINESS_CONFIG.name,
    "description": BUSINESS_CONFIG.description,
    "image": "https://yourwebsite.com/og-image.jpg",
    "logo": "https://yourwebsite.com/logo.png",
    
    "address": {
      "@type": "PostalAddress",
      "streetAddress": BUSINESS_CONFIG.location.street,
      "addressLocality": BUSINESS_CONFIG.location.city,
      "addressRegion": BUSINESS_CONFIG.location.state,
      "postalCode": BUSINESS_CONFIG.location.postalCode,
      "addressCountry": BUSINESS_CONFIG.location.country
    },
    
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": BUSINESS_CONFIG.location.coordinates.latitude,
      "longitude": BUSINESS_CONFIG.location.coordinates.longitude
    },
    
    "url": "https://yourwebsite.com",
    "telephone": BUSINESS_CONFIG.contact.phone,
    "email": BUSINESS_CONFIG.contact.email,
    
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "10:00",
        "closes": "20:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Saturday", "Sunday"],
        "opens": "10:00",
        "closes": "20:00"
      }
    ],
    
    "priceRange": "₹₹",
    "currenciesAccepted": "INR",
    "paymentAccepted": "Cash, Card, UPI",
    
    "hasMap": `https://www.google.com/maps?q=${BUSINESS_CONFIG.location.coordinates.latitude},${BUSINESS_CONFIG.location.coordinates.longitude}`,
    
    "areaServed": {
      "@type": "City",
      "name": BUSINESS_CONFIG.location.city
    },
    
    "sameAs": Object.values(BUSINESS_CONFIG.social),
    
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "500",
      "bestRating": "5",
      "worstRating": "1"
    },
    
    "makesOffer": BUSINESS_CONFIG.mainServices.map(service => ({
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": service
      }
    }))
  };
}

// Generate Website Schema
export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": BUSINESS_CONFIG.name,
    "url": "https://yourwebsite.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://yourwebsite.com/blog?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };
}

// Generate FAQ Schema (for blog posts)
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

// Meta Tags Generator
export function generateMetaTags(page: {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
}) {
  const baseUrl = "https://yourwebsite.com";
  const fullUrl = page.url ? `${baseUrl}${page.url}` : baseUrl;
  const imageUrl = page.image || `${baseUrl}/og-image.jpg`;
  
  return {
    title: `${page.title} | ${BUSINESS_CONFIG.name}`,
    description: page.description,
    keywords: page.keywords?.join(', '),
    
    openGraph: {
      type: page.type || 'website',
      url: fullUrl,
      title: page.title,
      description: page.description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: page.title
        }
      ],
      siteName: BUSINESS_CONFIG.name,
      locale: 'hi_IN'
    },
    
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.description,
      images: [imageUrl],
      site: '@glamoursalon',
      creator: '@glamoursalon'
    },
    
    alternates: {
      canonical: fullUrl
    },
    
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1
    }
  };
}

// Viral Content Strategies
export const VIRAL_STRATEGIES = {
  // Trending topics for Patna ladies
  trendingTopics: [
    "Karwa Chauth Makeup Look",
    "Durga Puja Special Hairstyle",
    "Wedding Season Bridal Packages",
    "Summer Hair Care Tips",
    "Monsoon Skin Care",
    "Diwali Party Makeup",
    "New Year Party Look",
    "Valentine's Day Special"
  ],
  
  // Local search terms
  localSearchTerms: [
    "salon near patna junction",
    "best makeup artist in patna",
    "bridal makeup bhootnath road",
    "hair treatment near me patna",
    "ladies parlour patna cantt",
    "beauty services in boring road"
  ],
  
  // Seasonal content ideas
  seasonalContent: {
    summer: [
      "Summer Hair Care Routine",
      "Beat the Heat - Cooling Facial",
      "Sun Protection Tips",
      "Light Makeup for Summer"
    ],
    monsoon: [
      "Monsoon Hair Care",
      "Frizz-Free Hair Tips",
      "Monsoon Skin Care",
      "Waterproof Makeup Guide"
    ],
    winter: [
      "Winter Skin Care Essentials",
      "Dry Hair Treatment",
      "Party Makeup for Winter Weddings",
      "Lip Care in Winter"
    ],
    festive: [
      "Festive Makeup Looks",
      "Bridal Hair Styling",
      "Traditional Makeup Tips",
      "Quick Party Ready Look"
    ]
  },
  
  // Engagement boosters
  engagementHooks: [
    "🔥 Viral Trend Alert",
    "💯 Most Requested Service",
    "⭐ Celebrity Inspired Look",
    "🎁 Limited Time Offer",
    "👑 Bridal Special Package",
    "💝 Customer Favorite",
    "🌟 New Service Launch",
    "✨ Before & After Transformation"
  ]
};

// Content optimization tips
export const SEO_BEST_PRACTICES = {
  titleLength: { min: 50, max: 60 },
  descriptionLength: { min: 150, max: 160 },
  headingStructure: ['H1 (1)', 'H2 (3-5)', 'H3 (5-10)'],
  keywordDensity: { min: 0.5, max: 2.5 }, // percentage
  contentLength: { min: 1500, max: 3000 }, // words
  internalLinks: { min: 3, max: 7 },
  externalLinks: { min: 1, max: 3 },
  imageAltTags: 'Always required',
  readability: 'Grade 8-10 level (Hindi + English mix)'
};