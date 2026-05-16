// kritika/src/app/page.tsx - PRODUCTION OPTIMIZED SEO + BALANCED TRENDING VERSION

import { Metadata } from 'next';
import ClientHomePage from './ClientHomePage';
import { Service } from '../types/service';

// ─────────────────────────────────────────────────────────────────────────────
// JSON Imports
// ─────────────────────────────────────────────────────────────────────────────

import makeupServices from '../../public/makeup_services.json';
import hairServices   from '../../public/hair_services.json';
import nailServices   from '../../public/nail_services.json';
import skinServices   from '../../public/skin_services.json';
import comboServices  from '../../public/combo_services.json';
import seoData        from '../../public/seo.json';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const WEBSITE_URL = seoData.business.contact.website;

const ALL_SERVICES: Service[] = [
  ...makeupServices,
  ...hairServices,
  ...nailServices,
  ...skinServices,
  ...comboServices,
] as Service[];

const TOTAL_SERVICES = ALL_SERVICES.length;

// ─────────────────────────────────────────────────────────────────────────────
// SEO Keywords (Limited)
// ─────────────────────────────────────────────────────────────────────────────

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

  const serviceKeywords = ALL_SERVICES.flatMap(
    (service: any) => service.seoKeywords || []
  );

  return [...new Set([
    ...allSeoKeywords,
    ...serviceKeywords,
  ])].slice(0, 60);
};

const HOME_KEYWORDS = generateHomeKeywords();

// ─────────────────────────────────────────────────────────────────────────────
// SEO Description
// ─────────────────────────────────────────────────────────────────────────────

const generateDescription = () => {
  return `⭐ ${seoData.business.rating} Rated ${seoData.business.name} in ${seoData.business.address.city}. ${TOTAL_SERVICES}+ Premium Beauty Services including Bridal Makeup, HD Makeup, Hair Spa, Keratin, Hydra Facial, Nail Art & Combo Packages. Trusted by ${seoData.business.totalReviews}+ happy clients. Book Appointment: ${seoData.business.contact.phone}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_TITLE =
  `Best Ladies Beauty Parlour in ${seoData.business.address.city} | ` +
  `${seoData.business.name} | Bridal Makeup, Hair, Skin & Nails`;

export const metadata: Metadata = {
  title: PAGE_TITLE,

  description: generateDescription(),

  keywords: HOME_KEYWORDS.join(', '),

  alternates: {
    canonical: WEBSITE_URL,
    languages: {
      'en-IN': WEBSITE_URL,
      'hi-IN': `${WEBSITE_URL}/hi`,
    },
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },

  openGraph: {
    title:
      `${seoData.business.name} - Premium Beauty Parlour in ` +
      `${seoData.business.address.city}`,

    description: generateDescription(),

    url: WEBSITE_URL,

    siteName: seoData.business.name,

    locale: 'en_IN',

    type: 'website',

    images: [
      {
        url: `${WEBSITE_URL}/images/kritika-salon-patna.jpg`,
        width: 1200,
        height: 630,
        alt: `${seoData.business.name} Beauty Parlour`,
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',

    title: `${seoData.business.name} - Premium Beauty Salon Patna`,

    description: generateDescription(),

    images: [`${WEBSITE_URL}/images/twitter-card.jpg`],

    creator: `@${seoData.business.socialMedia.instagram.replace('@', '')}`,
  },

  verification: {
    google: 'Uj54YUbFFcOLdeffGXlZMH35yYC-N6HyO9Wdoxj_DXA',
  },

  other: {
    'geo.region': `IN-${seoData.business.address.state}`,

    'geo.placename':
      `${seoData.business.address.city}, ` +
      `${seoData.business.address.state}`,

    'geo.position':
      `${seoData.business.coordinates.latitude};` +
      `${seoData.business.coordinates.longitude}`,

    ICBM:
      `${seoData.business.coordinates.latitude}, ` +
      `${seoData.business.coordinates.longitude}`,

    rating: seoData.business.rating.toString(),

    'service-category':
      'Beauty Salon, Bridal Makeup, Hair Care, Skin Treatment, Nail Services',

    'business-hours':
      seoData.business.workingHours.weekdays,

    'price-range': '₹₹-₹₹₹',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Trending Score
// ─────────────────────────────────────────────────────────────────────────────

const getTrendScore = (service: Service) => {
  const bookingCount = service.bookingCount || 0;
  const rating       = service.rating || 0;
  const reviewCount  = service.reviewCount || 0;
  const price        = service.price || 0;

  return (
    bookingCount * 1 +
    rating * 20 +
    reviewCount * 0.5 +
    price * 0.02 +
    (service.isBestSeller ? 40 : 0)
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Balanced Trending Services
// 4 Combo + 4 Makeup + 4 Skin + 4 Hair + 4 Nails
// ─────────────────────────────────────────────────────────────────────────────

const getTrendingServices = (
  allServices: Service[]
): Service[] => {

  const LIMIT = 4;

  const buckets = {
    combo:  [] as Service[],
    makeup: [] as Service[],
    skin:   [] as Service[],
    hair:   [] as Service[],
    nails:  [] as Service[],
  };

  for (const service of allServices) {
    if (!service.isBestSeller) continue;

    const primary  = (service.primaryCategory || '').toLowerCase();
    const category = (service.category || '').toLowerCase();

    // Combo
    if (
      primary.includes('combo') ||
      category.includes('combo')
    ) {
      buckets.combo.push(service);
      continue;
    }

    // Makeup
    if (
      primary.includes('makeup') ||
      primary.includes('bridal') ||
      primary.includes('party') ||
      primary.includes('engagement') ||
      primary.includes('reception')
    ) {
      buckets.makeup.push(service);
      continue;
    }

    // Skin
    if (
      [
        'skin',
        'facial',
        'hydrafacial',
        'cleanup',
        'detan',
        'bleach',
        'glow',
        'spa',
        'peel',
        'polish',
      ].some(k => primary.includes(k))
    ) {
      buckets.skin.push(service);
      continue;
    }

    // Hair
    if (
      [
        'hair',
        'keratin',
        'smoothening',
        'botox',
        'spa',
        'color',
        'styling',
        'rebonding',
      ].some(k => primary.includes(k))
    ) {
      buckets.hair.push(service);
      continue;
    }

    // Nails
    if (
      [
        'nail',
        'manicure',
        'pedicure',
      ].some(k => primary.includes(k))
    ) {
      buckets.nails.push(service);
    }
  }

  // Sort each bucket independently
  Object.values(buckets).forEach(bucket => {
    bucket.sort(
      (a, b) => getTrendScore(b) - getTrendScore(a)
    );
  });

  return [
    ...buckets.combo.slice(0, LIMIT),
    ...buckets.makeup.slice(0, LIMIT),
    ...buckets.skin.slice(0, LIMIT),
    ...buckets.hair.slice(0, LIMIT),
    ...buckets.nails.slice(0, LIMIT),
  ];
};

// ─────────────────────────────────────────────────────────────────────────────
// Service Offers Structured Data
// ─────────────────────────────────────────────────────────────────────────────

const generateAllServiceOffers = () => {
  return ALL_SERVICES
    .sort(
      (a: any, b: any) =>
        getTrendScore(b) - getTrendScore(a)
    )
    .slice(0, 20)
    .map((service: any) => ({
      '@type': 'Offer',

      itemOffered: {
        '@type': 'Service',

        name: service.title,

        description:
          service.shortDescription || service.description,

        image:
          `${WEBSITE_URL}${service.image}`,

        provider: {
          '@type': 'BeautySalon',
          name: seoData.business.name,
        },

        category: service.primaryCategory,

        serviceType:
          service.eventCategory || service.primaryCategory,

        aggregateRating:
          service.rating &&
          service.reviewCount &&
          service.reviewCount >= 5
            ? {
                '@type': 'AggregateRating',
                ratingValue: service.rating.toString(),
                reviewCount: service.reviewCount.toString(),
              }
            : undefined,
      },

      price: service.price.toString(),

      priceCurrency: 'INR',

      availability: 'https://schema.org/InStock',

      url: service.url
        ? `${WEBSITE_URL}${service.url}`
        : `${WEBSITE_URL}/${service.primaryCategory}/${service.slug || service.id}`,
    }));
};

// ─────────────────────────────────────────────────────────────────────────────
// Structured Data
// ─────────────────────────────────────────────────────────────────────────────

const homeStructuredData = {
  '@context': 'https://schema.org',

  '@graph': [
    {
      '@type': 'BeautySalon',

      '@id': `${WEBSITE_URL}/#organization`,

      name: seoData.business.name,

      legalName: seoData.business.legalName,

      description: seoData.business.description,

      url: WEBSITE_URL,

      logo: `${WEBSITE_URL}/logo.png`,

      image: `${WEBSITE_URL}/images/salon-exterior.jpg`,

      telephone: seoData.business.contact.phone,

      email: seoData.business.contact.email,

      priceRange: '₹₹-₹₹₹',

      address: {
        '@type': 'PostalAddress',

        streetAddress: seoData.business.address.street,

        addressLocality: seoData.business.address.city,

        addressRegion: seoData.business.address.state,

        postalCode: seoData.business.address.pincode,

        addressCountry: seoData.business.address.country,
      },

      geo: {
        '@type': 'GeoCoordinates',

        latitude: seoData.business.coordinates.latitude,

        longitude: seoData.business.coordinates.longitude,
      },

      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',

          dayOfWeek: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
          ],

          opens:
            seoData.business.workingHours.weekdays.split(' - ')[0],

          closes:
            seoData.business.workingHours.weekdays.split(' - ')[1],
        },

        {
          '@type': 'OpeningHoursSpecification',

          dayOfWeek: ['Saturday', 'Sunday'],

          opens:
            seoData.business.workingHours.weekends.split(' - ')[0],

          closes:
            seoData.business.workingHours.weekends.split(' - ')[1],
        },
      ],

      aggregateRating: {
        '@type': 'AggregateRating',

        ratingValue: seoData.business.rating.toString(),

        reviewCount:
          seoData.business.totalReviews.toString(),

        bestRating: '5',

        worstRating: '1',
      },

      makesOffer: generateAllServiceOffers(),

      areaServed: {
        '@type': 'City',
        name: 'Patna',
      },

      sameAs: [
        `https://instagram.com/${seoData.business.socialMedia.instagram}`,
        `https://facebook.com/${seoData.business.socialMedia.facebook}`,
        `https://youtube.com/${seoData.business.socialMedia.youtube}`,
        seoData.localSEOOptimization.localCitations.justdial,
        seoData.localSEOOptimization.localCitations.googleMaps,
      ],

      hasMap:
        seoData.localSEOOptimization.localCitations.googleMaps,

      paymentAccepted:
        'Cash, Credit Card, Debit Card, UPI, Net Banking',

      amenityFeature:
        seoData.localSEOOptimization.googleMyBusiness.attributes.map(
          (attr: string) => ({
            '@type': 'LocationFeatureSpecification',
            name: attr,
          })
        ),
    },

    {
      '@type': 'WebPage',

      '@id': `${WEBSITE_URL}/#webpage`,

      url: WEBSITE_URL,

      name: PAGE_TITLE,

      description: generateDescription(),

      isPartOf: {
        '@id': `${WEBSITE_URL}/#website`,
      },

      about: {
        '@id': `${WEBSITE_URL}/#organization`,
      },

      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: `${WEBSITE_URL}/images/hero-banner.jpg`,
      },

      datePublished: '2024-01-01T00:00:00+05:30',

      dateModified: new Date().toISOString(),
    },

    {
      '@type': 'BreadcrumbList',

      itemListElement: [
        {
          '@type': 'ListItem',

          position: 1,

          name: 'Home',

          item: WEBSITE_URL,
        },
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// FAQ Structured Data
// ─────────────────────────────────────────────────────────────────────────────

const generateComprehensiveFAQ = () => {

  const serviceFAQs = ALL_SERVICES
    .flatMap((service: any) => service.faqs || [])
    .slice(0, 5)
    .map((faq: any) => ({
      '@type': 'Question',

      name: faq.question,

      acceptedAnswer: {
        '@type': 'Answer',

        text: faq.answer,
      },
    }));

  const generalFAQs = [
    {
      '@type': 'Question',

      name:
        `Where is ${seoData.business.name} located?`,

      acceptedAnswer: {
        '@type': 'Answer',

        text:
          `We are located at ${seoData.business.address.street}, ` +
          `${seoData.business.address.city} - ` +
          `${seoData.business.address.pincode}.`,
      },
    },

    {
      '@type': 'Question',

      name: 'What services do you offer?',

      acceptedAnswer: {
        '@type': 'Answer',

        text:
          `We offer Bridal Makeup, HD Makeup, ` +
          `Airbrush Makeup, Hair Spa, Keratin, ` +
          `Smoothening, Hydra Facial, Cleanup, ` +
          `Nail Extensions, Manicure, Pedicure ` +
          `and premium combo packages.`,
      },
    },

    {
      '@type': 'Question',

      name: 'What are your working hours?',

      acceptedAnswer: {
        '@type': 'Answer',

        text:
          `We are open ${seoData.business.workingHours.weekdays} ` +
          `on weekdays and ` +
          `${seoData.business.workingHours.weekends} on weekends.`,
      },
    },

    {
      '@type': 'Question',

      name: 'Do you provide bridal packages?',

      acceptedAnswer: {
        '@type': 'Answer',

        text:
          `Yes, we provide complete bridal packages ` +
          `including bridal makeup, hair styling, ` +
          `skin preparation and nail services.`,
      },
    },
  ];

  return {
    '@context': 'https://schema.org',

    '@type': 'FAQPage',

    mainEntity: [
      ...serviceFAQs,
      ...generalFAQs,
    ],
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default function HomePage() {

  const trendingServices =
    getTrendingServices(ALL_SERVICES);

  return (
    <>
      {/* Structured Data */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homeStructuredData),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateComprehensiveFAQ()
          ),
        }}
      />

      {/* Minimal SEO Content */}

      <div className="sr-only" aria-hidden="true">
        <h1>{PAGE_TITLE}</h1>
        <p>{generateDescription()}</p>
      </div>

      {/* Homepage */}

      <ClientHomePage
        allServices={ALL_SERVICES}
        trendingServices={trendingServices}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Static Optimization
// ─────────────────────────────────────────────────────────────────────────────

export const dynamic = 'force-static';

export const revalidate = 3600;