/**
 * Single source of truth for building service page URLs.
 * Used by ServiceCard, ClientHomePage, ClientSkinPage, etc.
 */

export interface ServiceUrlable {
  url?:             string;
  primaryCategory?: string;
  slug?:            string;
  id:               string;
}

/**
 * Returns the canonical URL for a service.
 * Priority: service.url → /{primaryCategory}/{slug} → /{primaryCategory}/{id}
 */
export function getServiceUrl(service: ServiceUrlable): string {
  if (service.url) return service.url;
  const category = (service.primaryCategory || 'service').toLowerCase();
  const slug = service.slug || service.id;
  return `/${category}/${slug}`;
}