// ═══════════════════════════════════════════════════════════
// FILE 1: src/lib/services/slugify.ts
// PURPOSE: Convert service titles to URL-friendly slugs
// ═══════════════════════════════════════════════════════════

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/--+/g, '-')      // Replace multiple hyphens with single
    .trim();
}

export function generateServiceSlug(service: any): string {
  // Create slug from title
  const baseSlug = slugify(service.title);
  
  // Add category prefix for uniqueness if needed
  // Example: "bridal-basic-makeup" vs "party-basic-makeup"
  return baseSlug;
}

// Reverse: Get service by slug
export function matchSlug(slug: string, services: any[]): any | null {
  return services.find(service => {
    const serviceSlug = generateServiceSlug(service);
    return serviceSlug === slug;
  });
}
