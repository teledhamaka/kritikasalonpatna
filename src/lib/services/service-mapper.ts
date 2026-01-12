// Maps your existing JSON files to SEO-friendly URLs
import makeupServices from '../../../public/makeup_services.json';
import hairServices from '../../../public/hair_services.json';
import skinServices from '../../../public/skin_services.json';
import nailServices from '../../../public/nail_services.json';

// Import type from your existing types file
import { Service } from '@/types/service';

export interface ServiceSlugMap {
  slug: string;
  service: Service;
}

/**
 * Generate SEO-friendly slug from service title
 * Example: "HD Bridal Makeup" → "hd-bridal-makeup-bhootnath-road-patna"
 */
export function generateServiceSlug(service: Service): string {
  const titleSlug = service.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  // Add location for local SEO
  return `${titleSlug}-bhootnath-road-patna`;
}

/**
 * Get all services from your existing JSON files
 */
export function getAllServices(): Service[] {
  const rawServices = [
    ...makeupServices,
    ...hairServices,
    ...skinServices,
    ...nailServices
  ];

  return rawServices.map(s => ({
    ...s,
    // Ensure 'name' exists for the Service type
    name: s.id || s.title,
    // Ensure 'base_price' exists
    base_price: s.price || s.originalPrice,
    // Ensure 'duration_minutes' exists
    duration_minutes: s.durationText || s.duration || 0,
  })) as Service[];
}

/**
 * Generate slug mappings for all services
 * Used by Next.js generateStaticParams
 */
export function getAllServiceSlugs(): ServiceSlugMap[] {
  const allServices = getAllServices();
  
  return allServices.map(service => ({
    slug: generateServiceSlug(service),
    service
  }));
}

/**
 * Find service by slug
 * Used by dynamic [slug] page
 */
export function getServiceBySlug(slug: string): Service | null {
  const allServices = getAllServices();
  
  return allServices.find(service => 
    generateServiceSlug(service) === slug
  ) || null;
}

/**
 * Get services by category
 */
export function getServicesByCategory(category: string): Service[] {
  const allServices = getAllServices();
  return allServices.filter(s => 
    s.category.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Get related services for "You may also like" section
 */
export function getRelatedServices(service: Service, limit: number = 4): Service[] {
  const categoryServices = getServicesByCategory(service.category);
  return categoryServices
    .filter(s => s.id !== service.id)
    .slice(0, limit);
}

/**
 * Get trending services (from JSON isTrending flag)
 */
export function getTrendingServices(): Service[] {
  const allServices = getAllServices();
  return allServices.filter(s => 
    s.isTrending || s.is_popular || s.isBestSeller
  );
}