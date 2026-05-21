// src/app/page.tsx — PRODUCTION READY (WITH LOCAL & CATEGORY SEO MATRIX)
import { Metadata } from 'next';
import ClientHomePage from './ClientHomePage';
import { Service } from '../types/service';
import { HomepageService } from '../types/HomepageService';

import makeupServices from '../../public/makeup_services.json';
import hairServices   from '../../public/hair_services.json';
import nailServices   from '../../public/nail_services.json';
import skinServices   from '../../public/skin_services.json';
import comboServices  from '../../public/combo_services.json';
import seoData        from '../../public/seo.json';

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_URL     = seoData.business.contact.website.replace(/\/$/, ''); // Normalizes away trailing slashes
const BUILD_DATE   = '2026-05-19T00:00:00+05:30'; 

const ALL_SERVICES: Service[] = [
  ...makeupServices,
  ...hairServices,
  ...nailServices,
  ...skinServices,
  ...comboServices,
] as unknown as Service[];

const HOMEPAGE_SERVICES  = ALL_SERVICES.filter(s => s.isHomepage === true);
const TOTAL_HOMEPAGE_SERVICES = HOMEPAGE_SERVICES.length;

const toHomepageDTO = (service: Service): HomepageService => ({
  id:               service.id,
  title:            service.title,
  slug:             service.slug,
  image:            service.image,
  shortDescription: service.shortDescription,
  price:            service.price,
  originalPrice:    service.originalPrice,
  rating:           service.rating,
  reviewCount:      service.reviewCount,
  durationText:     service.durationText,
  isBestSeller:     service.isBestSeller,
  primaryCategory:  service.primaryCategory,
  eventCategory:    service.eventCategory,
  url:              service.url,
});

const getTrendScore = (s: Service) =>
  (s.bookingCount  || 0) * 1 +
  (s.rating        || 0) * 20 +
  (s.reviewCount   || 0) * 0.5 +
  (s.price         || 0) * 0.02 +
  (s.isBestSeller ? 40 : 0);

const getTrendingServices = (services: Service[]): Service[] => {
  const LIMIT = 4;
  const buckets = {
    combo:  [] as Service[],
    makeup: [] as Service[],
    skin:   [] as Service[],
    hair:   [] as Service[],
    nails:  [] as Service[],
  };

  for (const s of services) {
    if (!s.isBestSeller) continue;
    const p = (s.primaryCategory || '').toLowerCase();
    const c = (s.category        || '').toLowerCase();

    if (p.includes('combo') || c.includes('combo'))
      { buckets.combo.push(s);  continue; }
    if (['makeup','bridal','party','engagement','reception'].some(k => p.includes(k)))
      { buckets.makeup.push(s); continue; }
    if (['skin','facial','hydrafacial','cleanup','detan','bleach','glow','peel','polish'].some(k => p.includes(k)))
      { buckets.skin.push(s);   continue; }
    if (['hair','keratin','smoothening','botox','color','styling','rebonding'].some(k => p.includes(k)))
      { buckets.hair.push(s);   continue; }
    if (['nail','manicure','pedicure'].some(k => p.includes(k)))
      { buckets.nails.push(s); }
  }

  Object.values(buckets).forEach(b => b.sort((a, b) => getTrendScore(b) - getTrendScore(a)));

  return [
    ...buckets.combo.slice(0,  LIMIT),
    ...buckets.makeup.slice(0, LIMIT),
    ...buckets.skin.slice(0,   LIMIT),
    ...buckets.hair.slice(0,   LIMIT),
    ...buckets.nails.slice(0,  LIMIT),
  ];
};

const getOneBestsellerPerSubCategory = (
  services:   Service[],
  primaryCat: string,
  limit = 8,
): Service[] => {
  const bestsellers = services.filter(
    s => s.primaryCategory?.toLowerCase() === primaryCat.toLowerCase() && s.isBestSeller === true
  );
  const grouped = new Map<string, Service>();
  for (const s of bestsellers) {
    const sub = s.category || 'Other';
    const existing = grouped.get(sub);
    if (!existing || (s.bookingCount || 0) > (existing.bookingCount || 0)) {
      grouped.set(sub, s);
    }
  }
  return Array.from(grouped.values())
    .sort((a, b) => (b.bookingCount || 0) - (a.bookingCount || 0))
    .slice(0, limit);
};

// ─── Pre-computed DTO arrays ───
const trendingFull = getTrendingServices(HOMEPAGE_SERVICES);
const combosFull   = HOMEPAGE_SERVICES.filter(s => s.primaryCategory?.toLowerCase() === 'combo');
const bridalFull   = HOMEPAGE_SERVICES
  .filter(s =>
    s.isBestSeller === true &&
    (s.primaryCategory?.toLowerCase() === 'bridal' || s.eventCategory?.toLowerCase() === 'bridal')
  )
  .sort((a, b) => (b.bookingCount || 0) - (a.bookingCount || 0))
  .slice(0, 4);

const topServicesFull = {
  makeup: getOneBestsellerPerSubCategory(HOMEPAGE_SERVICES, 'makeup', 8),
  hair:   getOneBestsellerPerSubCategory(HOMEPAGE_SERVICES, 'hair',   8),
  skin:   getOneBestsellerPerSubCategory(HOMEPAGE_SERVICES, 'skin',   8),
  nails:  getOneBestsellerPerSubCategory(HOMEPAGE_SERVICES, 'nails',  8),
};

const trendingServicesDTO = trendingFull.map(toHomepageDTO);
const comboServicesDTO    = combosFull.map(toHomepageDTO);
const bridalServicesDTO   = bridalFull.map(toHomepageDTO);
const topServicesDTO = {
  makeup: topServicesFull.makeup.map(toHomepageDTO),
  hair:   topServicesFull.hair.map(toHomepageDTO),
  skin:   topServicesFull.skin.map(toHomepageDTO),
  nails:  topServicesFull.nails.map(toHomepageDTO),
};

// ─── Pre-computed SEO Link Slices ───
// Extracts compiled hyper-local landing slugs from public/seo.json
const LOCAL_SEO_PATHS: string[] = seoData.dynamicPageGeneration?.combinedPages?.examples || [];

// Maps individual dynamic categorical entry URLs cleanly
const CATEGORY_SEO_PATHS: string[] = ['/makeup', '/skin', '/hair', '/nails', '/combo'];

// ─── Metadata Preparation ───
const HOME_KEYWORDS = [
  'ladies beauty parlour Patna',
  'bridal makeup Patna',
  'best beauty salon Bhootnath Metro Patna',
  'Lakme Academy trained cosmetologist Patna',
  'hair spa Patna',
  'hydrafacial Patna',
  'nail art Patna',
  'keratin treatment Patna',
  'makeup artist Patna',
  'skin care parlour Patna',
  'Kritika beauty parlour Patna',
  'beauty parlour near me Patna',
].join(', ');

const generateDescription = () =>
  `⭐ ${seoData.business.rating} Rated ${seoData.business.name} in ${seoData.business.address.city}. ` +
  `Lakme Academy Delhi Trained Cosmetologist. ` +
  `${TOTAL_HOMEPAGE_SERVICES}+ Premium Beauty Services — Bridal Makeup, HD Makeup, Hair Spa, Keratin, ` +
  `Hydra Facial, Nail Art & Combo Packages. Trusted by ${seoData.business.totalReviews}+ happy clients. ` +
  `Book: ${seoData.business.contact.phone}`;

const PAGE_TITLE =
  `Best Ladies Beauty Parlour in ${seoData.business.address.city} | ` +
  `${seoData.business.name} | Lakme Academy Trained Cosmetologist`;

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: generateDescription(),
  keywords: HOME_KEYWORDS,
  alternates: {
    canonical: BASE_URL,
    languages: { 'en-IN': BASE_URL, 'hi-IN': `${BASE_URL}/hi` },
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
    title:       `${seoData.business.name} — Lakme Academy Trained Cosmetologist, ${seoData.business.address.city}`,
    description: generateDescription(),
    url:         BASE_URL,
    siteName:    seoData.business.name,
    locale:      'en_IN',
    type:        'website',
    images: [{
      url:    `${BASE_URL}/images/kritika-salon-patna.jpg`,
      width:  1200,
      height: 630,
      alt:    `${seoData.business.name} Beauty Parlour`,
    }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       `${seoData.business.name} — Premium Beauty Salon Patna`,
    description: generateDescription(),
    images:      [`${BASE_URL}/images/twitter-card.jpg`],
    creator:     `@${seoData.business.socialMedia.instagram.replace('@', '')}`,
  },
  other: {
    'geo.region':       `IN-${seoData.business.address.state}`,
    'geo.placename':    `${seoData.business.address.city}, ${seoData.business.address.state}`,
    'geo.position':     `${seoData.business.coordinates.latitude};${seoData.business.coordinates.longitude}`,
    ICBM:               `${seoData.business.coordinates.latitude}, ${seoData.business.coordinates.longitude}`,
    rating:             seoData.business.rating.toString(),
    'service-category': 'Beauty Salon, Bridal Makeup, Hair Care, Skin Treatment, Nail Services',
    'business-hours':   seoData.business.workingHours.weekdays,
    'price-range':      '₹₹-₹₹₹',
  },
};

// ─── Schema Builders ───
const generateRichServiceOffer = (service: Service) => {
  const finalUrl = `${BASE_URL}${service.url ?? `/${service.primaryCategory}/${service.slug ?? service.id}`}`;
  return {
    '@type': 'Offer',
    itemOffered: {
      '@type':       'Service',
      '@id':         `${finalUrl}#service`,
      name:          service.title,
      description:   service.description ?? service.shortDescription,
      serviceType:   service.eventCategory ?? service.primaryCategory,
      category:      service.category,
      keywords:      [...(service.seoKeywords || []), ...(service.seasonalTags || [])].join(', '),
      areaServed:    { '@type': 'City', name: service.serviceArea?.city ?? 'Patna' },
      audience:      service.targetAudience?.map((a: string) => ({ '@type': 'Audience', audienceType: a })),
      availableChannel: {
        '@type': 'ServiceChannel',
        serviceLocation: {
          '@type': 'BeautySalon',
          name: seoData.business.name,
          address: {
            '@type':           'PostalAddress',
            addressLocality:   seoData.business.address.city,
            addressRegion:     seoData.business.address.state,
          },
        },
      },
      provider: {
        '@type':    'BeautySalon',
        name:       seoData.business.name,
        telephone:  seoData.business.contact.phone,
      },
      image:            `${BASE_URL}${service.image}`,
      termsOfService:   service.cancellationPolicy,
      offers: {
        '@type':       'Offer',
        price:         service.price,
        priceCurrency: 'INR',
        availability:  'https://schema.org/InStock',
      },
      ...(service.rating && service.reviewCount && service.reviewCount >= 5 && {
        aggregateRating: {
          '@type':      'AggregateRating',
          ratingValue:  service.rating.toString(),
          reviewCount:  service.reviewCount.toString(),
        },
      }),
    },
    price:          service.price.toString(),
    priceCurrency: 'INR',
    availability:  'https://schema.org/InStock',
    url:           finalUrl,
  };
};

const generateOfferCatalog = () => ({
  '@type': 'OfferCatalog',
  name:    'Beauty Services',
  itemListElement: HOMEPAGE_SERVICES.slice(0, 20).map(service => ({
    '@type': 'OfferCatalog',
    name:    service.title,
    itemListElement: [{
      '@type': 'Offer',
      price:   service.price.toString(),
      priceCurrency: 'INR',
      itemOffered: { '@type': 'Service', name: service.title },
    }],
  })),
});

const KNOWS_ABOUT = [
  'Lakme Academy Delhi Trained Cosmetology',
  'Bridal Makeup', 'HD Makeup', 'Airbrush Makeup',
  'Hair Spa', 'Keratin Treatment', 'Hydrafacial',
  'Nail Extensions', 'Party Makeup', 'Pre Bridal Packages',
  'Glass Skin Makeup', 'Waterproof Makeup', 'Matte HD Makeup',
  'Mature Skin Makeup', 'Saree Draping',
];

const generateReviews = () => [
  {
    '@type': 'Review',
    reviewRating: { '@type': 'Rating', ratingValue: 5, bestRating: 5, worstRating: 1 },
    author:        { '@type': 'Person', name: 'Priya S.' },
    reviewBody:    'Amazing bridal glow and skin preparation service. Kritika did my wedding makeup and it lasted all day!',
    datePublished: '2025-12-15',
  },
  {
    '@type': 'Review',
    reviewRating: { '@type': 'Rating', ratingValue: 5, bestRating: 5, worstRating: 1 },
    author:        { '@type': 'Person', name: 'Ananya R.' },
    reviewBody:    'Best hydrafacial in Patna. My skin is glowing like never before. Highly recommend!',
    datePublished: '2026-02-10',
  },
  {
    '@type': 'Review',
    reviewRating: { '@type': 'Rating', ratingValue: 4.8, bestRating: 5, worstRating: 1 },
    author:        { '@type': 'Person', name: 'Maya T.' },
    reviewBody:    'Great hair spa and keratin treatment. Very professional staff and clean environment.',
    datePublished: '2026-04-05',
  },
];

const generateCategoryFAQ = (label: string, services: Service[]) => {
  const faqs = services.flatMap(s => s.faqs || []).slice(0, 4);
  if (faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type':    'FAQPage',
    mainEntity: faqs.map((faq: any) => ({
      '@type': 'Question',
      name:    faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
};

const generateCategoryBreadcrumbs = () => ({
  '@context': 'https://schema.org',
  '@type':    'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
    ...['makeup', 'skin', 'hair', 'nails', 'bridal'].map((cat, idx) => ({
      '@type':    'ListItem',
      position:   idx + 2,
      name:       `${cat.charAt(0).toUpperCase() + cat.slice(1)} Services`,
      item:       `${BASE_URL}/${cat}`,
    })),
  ],
});

const SERVICE_AREAS = [
  { '@type': 'City',  name: 'Patna'           },
  { '@type': 'Place', name: 'Bhootnath'        },
  { '@type': 'Place', name: 'Kankarbagh'       },
  { '@type': 'Place', name: 'Rajendra Nagar'   },
  { '@type': 'Place', name: 'Boring Road'      },
  { '@type': 'Place', name: 'Fraser Road'      },
];

const homeStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type':      'BeautySalon',
      '@id':         `${BASE_URL}/#organization`,
      name:         seoData.business.name,
      legalName:    seoData.business.legalName,
      description:  `${seoData.business.description} Managed by Lakme Academy Delhi trained cosmetologist.`,
      url:          BASE_URL,
      logo:         `${BASE_URL}/logo.png`,
      image:        `${BASE_URL}/images/salon-exterior.jpg`,
      telephone:    seoData.business.contact.phone,
      email:        seoData.business.contact.email,
      priceRange:   '₹₹-₹₹₹',
      address: {
        '@type':          'PostalAddress',
        streetAddress:    seoData.business.address.street,
        addressLocality:  seoData.business.address.city,
        addressRegion:    seoData.business.address.state,
        postalCode:       seoData.business.address.pincode,
        addressCountry:   seoData.business.address.country,
      },
      geo: {
        '@type':    'GeoCoordinates',
        latitude:   seoData.business.coordinates.latitude,
        longitude:  seoData.business.coordinates.longitude,
      },
      openingHoursSpecification: [
        {
          '@type':     'OpeningHoursSpecification',
          dayOfWeek:   ['Monday','Tuesday','Wednesday','Thursday','Friday'],
          opens:       seoData.business.workingHours.weekdays.split(' - ')[0],
          closes:      seoData.business.workingHours.weekdays.split(' - ')[1],
        },
        {
          '@type':     'OpeningHoursSpecification',
          dayOfWeek:   ['Saturday','Sunday'],
          opens:       seoData.business.workingHours.weekends.split(' - ')[0],
          closes:      seoData.business.workingHours.weekends.split(' - ')[1],
        },
      ],
      aggregateRating: {
        '@type':      'AggregateRating',
        ratingValue:  seoData.business.rating.toString(),
        reviewCount:  seoData.business.totalReviews.toString(),
        bestRating:   '5',
        worstRating:  '1',
      },
      review:          generateReviews(),
      makesOffer:      HOMEPAGE_SERVICES.slice(0, 8).map(generateRichServiceOffer),
      hasOfferCatalog: generateOfferCatalog(),
      knowsAbout:      KNOWS_ABOUT,
      areaServed:      SERVICE_AREAS,
      sameAs: [
        `https://instagram.com/${seoData.business.socialMedia.instagram}`,
        `https://facebook.com/${seoData.business.socialMedia.facebook}`,
        `https://youtube.com/${seoData.business.socialMedia.youtube}`,
        seoData.localSEOOptimization.localCitations.justdial,
        seoData.localSEOOptimization.localCitations.googleMaps,
      ],
      hasMap:           seoData.localSEOOptimization.localCitations.googleMaps,
      paymentAccepted:  'Cash, Credit Card, Debit Card, UPI, Net Banking',
      amenityFeature:   seoData.localSEOOptimization.googleMyBusiness.attributes.map((attr: string) => ({
        '@type': 'LocationFeatureSpecification',
        name:    attr,
      })),
    },
    {
      '@type':       'WebPage',
      '@id':         `${BASE_URL}/#webpage`,
      url:           BASE_URL,
      name:          PAGE_TITLE,
      description:   generateDescription(),
      isPartOf:      { '@id': `${BASE_URL}/#website` },
      about:         { '@id': `${BASE_URL}/#organization` },
      primaryImageOfPage: { '@type': 'ImageObject', url: `${BASE_URL}/images/hero-banner.jpg` },
      datePublished: '2024-01-01T00:00:00+05:30',
      dateModified:  BUILD_DATE,
    },
  ],
};

const categoryFAQScripts = () => [
  { label: 'Makeup', services: topServicesFull.makeup },
  { label: 'Skin',   services: topServicesFull.skin   },
  { label: 'Hair',   services: topServicesFull.hair   },
  { label: 'Bridal', services: bridalFull              },
].map(cat => generateCategoryFAQ(cat.label, cat.services)).filter(Boolean);

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeStructuredData) }}
      />
      {categoryFAQScripts().map((script, idx) => (
        <script
          key={`faq-${idx}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(script) }}
        />
      ))}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateCategoryBreadcrumbs()) }}
      />

      {/* Crawl Engine Semantic Layer */}
      <div className="sr-only" aria-hidden="true">
        <h1>{PAGE_TITLE}</h1>
        <p>{generateDescription()}</p>
        <p>Certified: Lakme Academy Delhi Trained Cosmetologist</p>

        {HOMEPAGE_SERVICES.slice(0, 20).map(service => (
          <section key={service.id}>
            <h2>{service.title}</h2>
            <p>{service.description ?? service.shortDescription}</p>
            <p>Price: ₹{service.price}</p>
            <p>Category: {service.category}</p>
            {service.idealFor      && <p>Ideal for: {service.idealFor.join(', ')}</p>}
            {service.benefits      && <p>Benefits: {service.benefits.join(', ')}</p>}
            {service.whatsIncluded && <p>Includes: {service.whatsIncluded.join(', ')}</p>}
            <p>Location: {service.serviceArea?.city}, {service.serviceArea?.region}</p>
            {service.nearbyLandmarks && <p>Nearby: {service.nearbyLandmarks.join(', ')}</p>}
          </section>
        ))}
      </div>

      <ClientHomePage
        trendingServices={trendingServicesDTO}
        comboServices={comboServicesDTO}
        bridalServices={bridalServicesDTO}
        topServices={topServicesDTO}
        localSeoPaths={LOCAL_SEO_PATHS}
        categorySeoPaths={CATEGORY_SEO_PATHS}
      />
    </>
  );
}

export const dynamic   = 'force-static';
export const revalidate = false;