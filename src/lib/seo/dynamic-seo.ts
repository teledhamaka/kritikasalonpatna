import { Metadata } from 'next';
import { Service } from '@/types/service';
import { LocationData } from '../services/location-mapper';

/**
 * Generate SEO metadata for service pages
 */
export function generateServiceMetadata(service: Service): Metadata {
  const discount = service.originalPrice && service.originalPrice > service.price
    ? Math.round(((service.originalPrice - service.price) / service.originalPrice) * 100)
    : 0;

  const title = `${service.title} in Bhootnath Road Patna | ₹${service.price} | Kritika Salon`;
  const description = `Book ${service.title} at Kritika Salon, Bhootnath Road. Professional ${service.category} services. ₹${service.price}${discount > 0 ? ` (${discount}% OFF)` : ''} | ${service.duration} mins | ⭐4.9 Rated. Call +91-9650461390 to book now!`;

  return {
    title,
    description,
    keywords: [
      service.title.toLowerCase(),
      `${service.title} Bhootnath Road`,
      `${service.title} Patna`,
      `${service.title} near Kankarbagh`,
      `${service.title} near NMCH`,
      `${service.title} near Medanta Hospital`,
      `${service.category} services Patna`,
      `best ${service.title} Patna`,
      `${service.title} price in Patna`
    ].join(', '),
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://kritikasalonpatna.com/service/${generateServiceSlug(service)}`,
      images: [
        {
          url: service.image,
          width: 800,
          height: 600,
          alt: service.title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [service.image]
    },
    alternates: {
      canonical: `/service/${generateServiceSlug(service)}`
    }
  };
}

function generateServiceSlug(service: Service): string {
  return service.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') + '-bhootnath-road-patna';
}

/**
 * Generate SEO metadata for location pages
 */
export function generateLocationMetadata(location: LocationData): Metadata {
  const title = `Beauty Parlour near ${location.name} | Kritika Salon Patna - ${location.distance} Away`;
  const description = `Premium beauty services near ${location.name}. Just ${location.distance} from Kritika Salon, Bhootnath Road. Bridal makeup, hair spa, skin facials & nail art. Serving ${location.targetAudience}. ⭐4.9 Rated | 5000+ Clients | Call +91-9650461390`;

  return {
    title,
    description,
    keywords: location.keywords.join(', '),
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://kritikasalonpatna.com/location/${location.slug}`,
      images: [{
        url: 'https://kritikasalonpatna.com/og-image.jpg',
        width: 1200,
        height: 630
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
    },
    alternates: {
      canonical: `/location/${location.slug}`
    }
  };
}