import { Service } from '@/types/service';

/**
 * Generate Schema.org Service markup
 */
export function generateServiceSchema(service: Service) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    'name': service.title,
    'description': service.description,
    'provider': {
      '@type': 'BeautySalon',
      'name': 'Kritika Ladies Beauty Parlour',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': 'Bhootnath Road, BH Colony',
        'addressLocality': 'Patna',
        'addressRegion': 'Bihar',
        'postalCode': '800026',
        'addressCountry': 'IN'
      },
      'telephone': '+91-9650461390',
      'url': 'https://kritikasalonpatna.com'
    },
    'offers': {
      '@type': 'Offer',
      'price': service.price,
      'priceCurrency': 'INR',
      'availability': 'https://schema.org/InStock',
      'url': `https://kritikasalonpatna.com/service/${service.title.toLowerCase().replace(/\s+/g, '-')}-bhootnath-road-patna`
    },
    ...(service.rating && {
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': service.rating,
        'reviewCount': service.reviewCount || 100,
        'bestRating': 5,
        'worstRating': 1
      }
    }),
    'duration': `PT${service.duration}M`
  };
}

/**
 * Generate Breadcrumb schema
 */
export function generateBreadcrumbSchema(items: Array<{name: string, url: string}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': `https://kritikasalonpatna.com${item.url}`
    }))
  };
}

/**
 * Generate Local Business schema
 */
export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    'name': 'Kritika Ladies Beauty Parlour',
    'image': 'https://kritikasalonpatna.com/logo.png',
    'description': 'Premium ladies beauty parlour in Bhootnath Road, Patna offering bridal makeup, hair spa, skin treatments, and nail services.',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'Bhootnath Road, BH Colony',
      'addressLocality': 'Patna',
      'addressRegion': 'Bihar',
      'postalCode': '800026',
      'addressCountry': 'IN'
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': 25.5875,
      'longitude': 85.1757
    },
    'url': 'https://kritikasalonpatna.com',
    'telephone': '+91-9650461390',
    'openingHoursSpecification': [
      {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': [
          'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
          'Friday', 'Saturday', 'Sunday'
        ],
        'opens': '09:00',
        'closes': '20:00'
      }
    ],
    'priceRange': '₹₹',
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.9',
      'reviewCount': '5000'
    }
  };
}