// Maps landmarks from seo-config.json to location pages
import seoConfig from '../../../public/seo.json';

export interface LocationData {
  name: string;
  slug: string;
  type: string;
  distance: string;
  address?: string;
  targetAudience: string;
  estimatedFootfall?: string;
  keywords: string[];
  description: string;
}

/**
 * Convert location name to URL-friendly slug
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Get all locations from seo-config.json
 */
export function getAllLocations(): LocationData[] {
  const locations: LocationData[] = [];
  
  // Educational landmarks
  if (seoConfig.nearbyLandmarks?.educational) {
    seoConfig.nearbyLandmarks.educational.forEach((loc: any) => {
      locations.push({
        name: loc.name,
        slug: slugify(loc.name),
        type: loc.type,
        distance: loc.distance,
        address: loc.address,
        targetAudience: loc.targetAudience,
        estimatedFootfall: loc.estimatedFootfall,
        keywords: loc.keywords,
        description: `Premium beauty services near ${loc.name}. Just ${loc.distance} from Kritika Salon, Bhootnath Road. Perfect for ${loc.targetAudience}. ⭐4.9 Rated | 5000+ Happy Clients`
      });
    });
  }
  
  // Healthcare landmarks
  if (seoConfig.nearbyLandmarks?.healthcare) {
    seoConfig.nearbyLandmarks.healthcare.forEach((loc: any) => {
      locations.push({
        name: loc.name,
        slug: slugify(loc.name),
        type: loc.type,
        distance: loc.distance,
        address: loc.address,
        targetAudience: loc.targetAudience,
        estimatedFootfall: loc.estimatedFootfall,
        keywords: loc.keywords,
        description: `Expert beauty services near ${loc.name}. Convenient location just ${loc.distance} away. Serving ${loc.targetAudience}. Quick appointments available.`
      });
    });
  }
  
  // Transport hubs
  if (seoConfig.nearbyLandmarks?.transport) {
    seoConfig.nearbyLandmarks.transport.forEach((loc: any) => {
      locations.push({
        name: loc.name,
        slug: slugify(loc.name),
        type: loc.type,
        distance: loc.distance,
        targetAudience: loc.targetAudience,
        keywords: loc.keywords,
        description: `Quick beauty services near ${loc.name}. Only ${loc.distance} from Kritika Salon. Ideal for ${loc.targetAudience}. Express services available.`
      });
    });
  }
  
  return locations;
}

/**
 * Get all location slugs for generateStaticParams
 */
export function getAllLocationSlugs(): string[] {
  return getAllLocations().map(loc => loc.slug);
}

/**
 * Find location by slug
 */
export function getLocationBySlug(slug: string): LocationData | null {
  const locations = getAllLocations();
  return locations.find(loc => loc.slug === slug) || null;
}