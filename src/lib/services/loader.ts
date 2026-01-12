// ═══════════════════════════════════════════════════════════
// FILE 2: src/lib/services/loader.ts
// PURPOSE: Load and combine all services from JSON files
// ═══════════════════════════════════════════════════════════

import hairServices from '../../../public/hair_services.json';
import makeupServices from '../../../public/makeup_services.json';
import nailServices from '../../../public/nail_services.json';
import skinServices from '../../../public/skin_services.json';
import { generateServiceSlug } from './slugify';

export type ServiceType = 'hair' | 'makeup' | 'nail' | 'skin';

export interface EnhancedService {
  id: string;
  title: string;
  name: string;  // ADD THIS
  category: string;
  serviceType: ServiceType;
  slug: string;
  image: string;
  description: string;
  price: number;
  base_price: number;  // ADD THIS
  originalPrice?: number;
  duration: number;
  duration_minutes: number;  // ADD THIS
  isTrending?: boolean;
  deal?: string;
  keyIngredients?: string[];
  benefits?: string[];
  precautions?: string;
  aftercare?: string;
  faqs?: Array<{ question: string; answer: string }>;
}

// Load all services with enhanced metadata
export function getAllServices(): EnhancedService[] {
  const services: EnhancedService[] = [];
  
  // Add hair services
  hairServices.forEach(service => {
    services.push({
      ...service,
      name: service.title,  // ADD THIS
      base_price: service.price,  // ADD THIS
      duration_minutes: service.duration,  // ADD THIS
      serviceType: 'hair',
      slug: generateServiceSlug(service)
    } as EnhancedService);
  });
  
  // Add makeup services
  makeupServices.forEach(service => {
    services.push({
      ...service,
      name: service.title,  // ADD THIS
      base_price: service.price,  // ADD THIS
      duration_minutes: service.duration,  // ADD THIS
      serviceType: 'makeup',
      slug: generateServiceSlug(service)
    } as EnhancedService);
  });
  
  // Add nail services
  nailServices.forEach(service => {
    services.push({
      ...service,
      name: service.title,  // ADD THIS
      base_price: service.price,  // ADD THIS
      duration_minutes: service.duration,  // ADD THIS
      serviceType: 'nail',
      slug: generateServiceSlug(service)
    } as EnhancedService);
  });
  
  // Add skin services
  skinServices.forEach(service => {
    services.push({
      ...service,
      name: service.title,  // ADD THIS
      base_price: service.price,  // ADD THIS
      duration_minutes: service.duration,  // ADD THIS
      serviceType: 'skin',
      slug: generateServiceSlug(service)
    } as EnhancedService);
  });
  
  return services;
}

// Get service by slug
export function getServiceBySlug(slug: string): EnhancedService | null {
  const allServices = getAllServices();
  return allServices.find(service => service.slug === slug) || null;
}

// Get services by type
export function getServicesByType(type: ServiceType): EnhancedService[] {
  const allServices = getAllServices();
  return allServices.filter(service => service.serviceType === type);
}

// Get services by category
export function getServicesByCategory(category: string): EnhancedService[] {
  const allServices = getAllServices();
  return allServices.filter(service => 
    service.category.toLowerCase() === category.toLowerCase()
  );
}

// Get trending services
export function getTrendingServices(): EnhancedService[] {
  const allServices = getAllServices();
  return allServices.filter(service => service.isTrending === true);
}

// Search services
export function searchServices(query: string): EnhancedService[] {
  const allServices = getAllServices();
  const lowerQuery = query.toLowerCase();
  
  return allServices.filter(service => 
    service.title.toLowerCase().includes(lowerQuery) ||
    service.description.toLowerCase().includes(lowerQuery) ||
    service.category.toLowerCase().includes(lowerQuery) ||
    service.keyIngredients?.some(ingredient => 
      ingredient.toLowerCase().includes(lowerQuery)
    )
  );
}

// Get all unique categories
export function getAllCategories(): string[] {
  const allServices = getAllServices();
  const categories = new Set<string>();
  allServices.forEach(service => categories.add(service.category));
  return Array.from(categories).sort();
}

// Get all slugs (for sitemap generation)
export function getAllServiceSlugs(): string[] {
  const allServices = getAllServices();
  return allServices.map(service => service.slug);
}
