// ═══════════════════════════════════════════════════════════
// FILE 4: src/lib/seo/config.ts
// PURPOSE: Main SEO configuration
// ═══════════════════════════════════════════════════════════

export const BUSINESS_CONFIG = {
  name: "My Ladies Beauty Parlour",
  shortName: "My Ladies",
  tagline: "Best Ladies Beauty Parlour in Patna | Bridal Makeup & Party Makeup Specialist",
  description: "Premier ladies beauty parlour in Patna offering bridal makeup, party makeup, HD makeup, airbrush makeup, hair styling, and complete beauty services. Trusted by 2000+ happy customers across Boring Road, Bailey Road, Kankarbagh, and Fraser Road areas.",
  
  // Contact Info
  phone: "+91-9650461390",
  whatsapp: "+91-9650461390",
  email: "info@myladiesbeautyparlour.com",
  website: "https://kritikasalonpatna.com",
  
  // Location
  coordinates: {
    latitude: 25.5875,
    longitude: 85.1757
  },
  address: {
    street: "Your Street Address",
    locality: "Boring Road Area",
    city: "Patna",
    state: "Bihar",
    pincode: "800001",
    country: "IN",
    full: "Your Street Address, Boring Road Area, Patna, Bihar 800001"
  },
  
  // Business Hours
  openingHours: "Mo-Su 09:00-20:00",
  openingHoursDisplay: "9:00 AM - 8:00 PM (All Days)",
  
  // Social Proof
  rating: 4.9,
  totalReviews: 850,
  totalClients: 2000,
  establishedYear: 2020,
  
  // Social Media
  socialMedia: {
    facebook: "https://facebook.com/myladiesbeautyparlour",
    instagram: "https://instagram.com/myladiesbeautyparlour",
    youtube: "https://youtube.com/@myladiesbeautyparlour",
    twitter: "https://twitter.com/myladiesbeauty"
  },
  
  // Service Areas (Primary locations within 4km)
  serviceAreas: [
    "Boring Road",
    "Bailey Road",
    "Kankarbagh",
    "Fraser Road",
    "Exhibition Road",
    "Rajendra Nagar",
    "Gandhi Maidan",
    "Patna Junction"
  ],
  
  // Primary Keywords
  primaryKeywords: [
    "beauty parlour in Patna",
    "ladies beauty parlour near me",
    "bridal makeup in Patna",
    "best beauty parlour Boring Road",
    "makeup artist Patna",
    "beauty salon Bailey Road",
    "bridal makeup artist Patna",
    "party makeup Patna",
    "HD makeup Patna",
    "airbrush makeup Patna"
  ],
  
  // Secondary Keywords
  secondaryKeywords: [
    "engagement makeup Patna",
    "reception makeup Patna",
    "sangeet makeup artist",
    "haldi ceremony makeup",
    "pre wedding makeup",
    "waterproof makeup Patna",
    "hair spa Patna",
    "keratin treatment Patna",
    "nail art Patna",
    "facial services Patna"
  ]
};

// Service Type Configurations
export const SERVICE_TYPE_CONFIG = {
  hair: {
    name: "Hair Services",
    description: "Professional hair styling, treatments, and care services",
    icon: "💇",
    color: "from-purple-500 to-pink-500"
  },
  makeup: {
    name: "Makeup Services",
    description: "Expert bridal, party, and special occasion makeup",
    icon: "💄",
    color: "from-pink-500 to-rose-500"
  },
  skin: {
    name: "Skin Services",
    description: "Advanced skincare treatments and facials",
    icon: "✨",
    color: "from-rose-500 to-orange-500"
  },
  nail: {
    name: "Nail Services",
    description: "Creative nail art, manicure, and pedicure",
    icon: "💅",
    color: "from-pink-500 to-purple-500"
  }
};
