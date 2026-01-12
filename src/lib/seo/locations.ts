// ═══════════════════════════════════════════════════════════
// FILE 5: src/lib/seo/locations.ts
// PURPOSE: Location-specific data and content
// ═══════════════════════════════════════════════════════════

export interface LocationData {
  name: string;
  slug: string;
  distance: string;
  distanceKm: number;
  description: string;
  longDescription: string;
  type: string[];
  landmarks: string[];
  targetAudience: string[];
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  popularServices: string[];
  testimonial?: {
    text: string;
    author: string;
  };
}

export const LOCATIONS: Record<string, LocationData> = {
  "boring-road": {
    name: "Boring Road",
    slug: "boring-road",
    distance: "1.5km away",
    distanceKm: 1.5,
    description: "Top-rated ladies beauty parlour serving Boring Road area. Professional bridal makeup, HD makeup, and all beauty services.",
    longDescription: "Looking for the best beauty parlour in Boring Road? My Ladies Beauty Parlour is conveniently located just 1.5km away, offering premium bridal makeup, party makeup, hair styling, and complete beauty solutions. Serving the Boring Road community with excellence since 2020.",
    type: ["Commercial", "Residential", "Educational"],
    landmarks: [
      "Boring Road Plaza",
      "Coaching Institutes Hub",
      "Boring Road Shopping Complex",
      "Residential Colonies"
    ],
    targetAudience: ["Students", "Working Professionals", "Homemakers", "Brides-to-be"],
    metaTitle: "Beauty Parlour in Boring Road, Patna | Bridal Makeup | My Ladies",
    metaDescription: "Best beauty parlour in Boring Road offering bridal makeup, party makeup, hair styling. 1.5km away. Home service available. Book now! ⭐ 4.9 Rating",
    keywords: [
      "beauty parlour Boring Road",
      "bridal makeup Boring Road Patna",
      "makeup artist near Boring Road",
      "beauty salon Boring Road",
      "ladies parlour Boring Road"
    ],
    popularServices: ["Bridal Makeup", "Party Makeup", "Hair Spa", "Keratin Treatment"],
    testimonial: {
      text: "Best parlour in Boring Road area! The bridal makeup was stunning and lasted all day.",
      author: "Priya S., Boring Road"
    }
  },
  
  "bailey-road": {
    name: "Bailey Road",
    slug: "bailey-road",
    distance: "2km away",
    distanceKm: 2,
    description: "Premium beauty services in Bailey Road shopping hub. Bridal makeup, party makeup, and complete beauty solutions.",
    longDescription: "Discover Patna's finest beauty parlour near Bailey Road! Located in the heart of the shopping district, we offer professional bridal makeup, HD makeup, airbrush makeup, and complete beauty services. Perfect for shoppers and office-goers in the Bailey Road area.",
    type: ["Shopping", "Commercial", "Business Hub"],
    landmarks: [
      "Bailey Road Market",
      "Shopping Complexes",
      "Corporate Offices",
      "Restaurants and Cafes"
    ],
    targetAudience: ["Shoppers", "Office Workers", "Business Women", "Wedding Shoppers"],
    metaTitle: "Beauty Salon in Bailey Road, Patna | Professional Makeup Services",
    metaDescription: "Top beauty salon in Bailey Road. Expert bridal & party makeup, hair styling. Located in shopping hub. 2km away. Walk-ins welcome!",
    keywords: [
      "beauty salon Bailey Road",
      "bridal makeup Bailey Road",
      "makeup artist Bailey Road Patna",
      "beauty parlour near Bailey Road market"
    ],
    popularServices: ["Bridal HD Makeup", "Party Glam", "Hair Styling", "Nail Art"],
    testimonial: {
      text: "Perfect location for shopping day makeover! Professional service and amazing results.",
      author: "Ananya R., Bailey Road"
    }
  },
  
  "kankarbagh": {
    name: "Kankarbagh",
    slug: "kankarbagh",
    distance: "3km away",
    distanceKm: 3,
    description: "Expert bridal makeup and beauty services in Kankarbagh. Serving families with love and care.",
    longDescription: "Trusted by Kankarbagh families for all beauty needs! We specialize in bridal makeup packages, pre-wedding beauty treatments, and family beauty services. Our experienced team serves the Kankarbagh community with personalized care and attention.",
    type: ["Residential", "Market", "Wedding Venues"],
    landmarks: [
      "Kankarbagh Main Market",
      "Residential Colonies",
      "Wedding Banquets",
      "Shopping Areas"
    ],
    targetAudience: ["Families", "Brides", "Homemakers", "Local Residents"],
    metaTitle: "Beauty Parlour in Kankarbagh, Patna | Bridal Packages",
    metaDescription: "Trusted beauty parlour in Kankarbagh offering bridal packages, family beauty services. 3km away. Pre-wedding treatments available. Book consultation!",
    keywords: [
      "beauty parlour Kankarbagh",
      "bridal makeup Kankarbagh Patna",
      "ladies parlour Kankarbagh",
      "beauty services Kankarbagh"
    ],
    popularServices: ["Bridal Packages", "Pre-Wedding Treatments", "Family Beauty", "Makeup Trials"],
    testimonial: {
      text: "They made my entire bridal journey beautiful! From trials to the big day, perfect service.",
      author: "Neha K., Kankarbagh"
    }
  },
  
  "fraser-road": {
    name: "Fraser Road",
    slug: "fraser-road",
    distance: "2.5km away",
    distanceKm: 2.5,
    description: "Professional makeup and beauty services near Fraser Road. Student-friendly prices and premium quality.",
    longDescription: "Fraser Road's favorite beauty destination! We offer affordable beauty services for students, young professionals, and families. Located near Patna College and educational institutions, we provide quick services and budget-friendly packages without compromising on quality.",
    type: ["Educational", "Residential", "Student Area"],
    landmarks: [
      "Patna College",
      "Educational Institutions",
      "PG Accommodations",
      "Local Markets"
    ],
    targetAudience: ["College Students", "Young Professionals", "PG Residents"],
    metaTitle: "Makeup Artist Near Fraser Road, Patna | Student Friendly Prices",
    metaDescription: "Affordable beauty parlour near Fraser Road. Student discounts, party makeup, quick services. Near Patna College. 2.5km away. Book now!",
    keywords: [
      "beauty parlour Fraser Road",
      "makeup artist near Fraser Road",
      "student beauty services Patna",
      "affordable parlour Fraser Road"
    ],
    popularServices: ["Party Makeup", "Quick Glam", "Student Packages", "Event Makeup"],
    testimonial: {
      text: "Perfect for college events! Affordable prices and they understand what students want.",
      author: "Riya M., Fraser Road"
    }
  },
  
  "exhibition-road": {
    name: "Exhibition Road",
    slug: "exhibition-road",
    distance: "2km away",
    distanceKm: 2,
    description: "Premium beauty parlour in Exhibition Road commercial zone. Professional services for working women.",
    longDescription: "Exhibition Road's premier beauty destination for professionals! We cater to busy working women with express services, lunch-hour beauty treatments, and professional makeup. Conveniently located in the commercial hub of Patna.",
    type: ["Commercial", "Business District"],
    landmarks: [
      "Exhibition Road Market",
      "Business Complexes",
      "Corporate Offices"
    ],
    targetAudience: ["Working Professionals", "Business Women", "Office Goers"],
    metaTitle: "Beauty Parlour in Exhibition Road | Professional Services",
    metaDescription: "Professional beauty services in Exhibition Road. Express treatments, lunch-hour beauty, corporate packages. 2km away. Book appointment!",
    keywords: [
      "beauty parlour Exhibition Road",
      "professional makeup Exhibition Road",
      "ladies salon Exhibition Road Patna"
    ],
    popularServices: ["Express Makeup", "Professional Look", "Quick Services", "Corporate Packages"]
  },
  
  "rajendra-nagar": {
    name: "Rajendra Nagar",
    slug: "rajendra-nagar",
    distance: "1.5km away",
    distanceKm: 1.5,
    description: "Premium beauty services for Rajendra Nagar residents. Home service available.",
    longDescription: "Rajendra Nagar's most trusted beauty parlour! We offer premium beauty services with home service options for your convenience. Specializing in bridal makeup, party makeup, and regular beauty treatments for the discerning Rajendra Nagar community.",
    type: ["Premium Residential"],
    landmarks: [
      "Rajendra Nagar Residential Area",
      "Local Markets",
      "Community Centers"
    ],
    targetAudience: ["Homemakers", "Families", "Brides"],
    metaTitle: "Beauty Parlour in Rajendra Nagar | Home Service Available",
    metaDescription: "Trusted beauty parlour serving Rajendra Nagar. Home service available. Bridal makeup, party services. 1.5km away. Call now!",
    keywords: [
      "beauty parlour Rajendra Nagar",
      "home service beauty Rajendra Nagar",
      "bridal makeup Rajendra Nagar Patna"
    ],
    popularServices: ["Home Service", "Bridal Makeup", "Party Packages", "Regular Beauty"]
  },
  
  "gandhi-maidan": {
    name: "Gandhi Maidan",
    slug: "gandhi-maidan",
    distance: "2.5km away",
    distanceKm: 2.5,
    description: "Beauty services near Gandhi Maidan. Perfect for event makeup and wedding guests.",
    longDescription: "Conveniently located near Gandhi Maidan! Ideal for event attendees, wedding guests, and tourists. We specialize in quick transformation makeup, party glam, and special occasion beauty services.",
    type: ["Historic", "Event Area", "Tourist Spot"],
    landmarks: [
      "Gandhi Maidan Ground",
      "Event Venues",
      "Historic Areas"
    ],
    targetAudience: ["Event Attendees", "Wedding Guests", "Tourists"],
    metaTitle: "Beauty Services Near Gandhi Maidan, Patna | Event Makeup",
    metaDescription: "Quick beauty services near Gandhi Maidan. Event makeup, party glam, wedding guest services. 2.5km away. Walk-ins welcome!",
    keywords: [
      "beauty parlour near Gandhi Maidan",
      "event makeup Gandhi Maidan",
      "makeup artist near Gandhi Maidan Patna"
    ],
    popularServices: ["Event Makeup", "Quick Glam", "Wedding Guest", "Party Ready"]
  },
  
  "patna-junction": {
    name: "Patna Junction",
    slug: "patna-junction",
    distance: "2.5km away",
    distanceKm: 2.5,
    description: "Beauty parlour near Patna Junction. Convenient for travelers and outstation brides.",
    longDescription: "Perfect location near Patna Junction Railway Station! We serve travelers, outstation wedding parties, and commuters. Offering quick services, bridal makeup for destination brides, and express beauty treatments.",
    type: ["Transport Hub", "Commercial"],
    landmarks: [
      "Patna Junction Railway Station",
      "Hotels",
      "Commercial Area"
    ],
    targetAudience: ["Travelers", "Outstation Brides", "Hotel Guests"],
    metaTitle: "Beauty Parlour Near Patna Junction | Bridal Makeup for Travelers",
    metaDescription: "Beauty services near Patna Junction. Perfect for outstation brides, travelers. Pre-travel makeup. 2.5km away. Quick service!",
    keywords: [
      "beauty parlour near Patna Junction",
      "bridal makeup near railway station",
      "makeup artist Patna Junction"
    ],
    popularServices: ["Bridal Makeup", "Travel Beauty", "Quick Services", "Hotel Service"]
  }
};

// Helper functions
export function getLocationBySlug(slug: string): LocationData | null {
  return LOCATIONS[slug] || null;
}

export function getAllLocations(): LocationData[] {
  return Object.values(LOCATIONS);
}

export function getAllLocationSlugs(): string[] {
  return Object.keys(LOCATIONS);
}

export function getNearestLocations(maxDistance: number = 3): LocationData[] {
  return getAllLocations()
    .filter(loc => loc.distanceKm <= maxDistance)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}