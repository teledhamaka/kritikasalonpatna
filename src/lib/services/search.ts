// ═══════════════════════════════════════════════════════════
// FILE 3: src/lib/services/search.ts
// PURPOSE: Advanced search and filtering
// ═══════════════════════════════════════════════════════════

import { EnhancedService, ServiceType } from './loader';

export interface SearchFilters {
  query?: string;
  serviceType?: ServiceType;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  durationMin?: number;
  durationMax?: number;
  trending?: boolean;
}

export function filterServices(
  services: EnhancedService[],
  filters: SearchFilters
): EnhancedService[] {
  let filtered = [...services];
  
  // Text search
  if (filters.query) {
    const query = filters.query.toLowerCase();
    filtered = filtered.filter(service => 
      service.title.toLowerCase().includes(query) ||
      service.description.toLowerCase().includes(query) ||
      service.category.toLowerCase().includes(query)
    );
  }
  
  // Service type filter
  if (filters.serviceType) {
    filtered = filtered.filter(service => 
      service.serviceType === filters.serviceType
    );
  }
  
  // Category filter
  if (filters.category) {
    filtered = filtered.filter(service => 
      service.category?.toLowerCase() === filters.category?.toLowerCase()
    );
  }
  
  // Price range filter
  if (filters.priceMin !== undefined) {
    filtered = filtered.filter(service => service.price >= filters.priceMin!);
  }
  if (filters.priceMax !== undefined) {
    filtered = filtered.filter(service => service.price <= filters.priceMax!);
  }
  
  // Duration filter
  if (filters.durationMin !== undefined) {
    filtered = filtered.filter(service => service.duration >= filters.durationMin!);
  }
  if (filters.durationMax !== undefined) {
    filtered = filtered.filter(service => service.duration <= filters.durationMax!);
  }
  
  // Trending filter
  if (filters.trending !== undefined) {
    filtered = filtered.filter(service => service.isTrending === filters.trending);
  }
  
  return filtered;
}

export function sortServices(
  services: EnhancedService[],
  sortBy: 'price-asc' | 'price-desc' | 'duration-asc' | 'duration-desc' | 'popularity'
): EnhancedService[] {
  const sorted = [...services];
  
  switch (sortBy) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'duration-asc':
      return sorted.sort((a, b) => a.duration - b.duration);
    case 'duration-desc':
      return sorted.sort((a, b) => b.duration - a.duration);
    case 'popularity':
      return sorted.sort((a, b) => {
        // Trending services first
        if (a.isTrending && !b.isTrending) return -1;
        if (!a.isTrending && b.isTrending) return 1;
        return 0;
      });
    default:
      return sorted;
  }
}


// ═══════════════════════════════════════════════════════════
// USAGE EXAMPLES
// ═══════════════════════════════════════════════════════════

/*

// Example 1: Get all services
import { getAllServices } from '@/lib/services/loader';
const allServices = getAllServices();
console.log(`Total services: ${allServices.length}`);

// Example 2: Get service by slug
import { getServiceBySlug } from '@/lib/services/loader';
const service = getServiceBySlug('bridal-basic-makeup');
console.log(service?.title); // "Bridal Basic Makeup"

// Example 3: Get makeup services only
import { getServicesByType } from '@/lib/services/loader';
const makeupServices = getServicesByType('makeup');
console.log(`Makeup services: ${makeupServices.length}`);

// Example 4: Search services
import { searchServices } from '@/lib/services/loader';
const results = searchServices('bridal');
console.log(`Found ${results.length} bridal services`);

// Example 5: Advanced filtering
import { filterServices } from '@/lib/services/search';
import { getAllServices } from '@/lib/services/loader';

const filtered = filterServices(getAllServices(), {
  serviceType: 'makeup',
  priceMin: 2000,
  priceMax: 5000,
  trending: true
});

// Example 6: Get all slugs for sitemap
import { getAllServiceSlugs } from '@/lib/services/loader';
const slugs = getAllServiceSlugs();
// Returns: ['bridal-basic-makeup', 'keratin-hair-treatment', ...]

*/