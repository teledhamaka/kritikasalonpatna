// src/types/HomepageService.ts
export type HomepageService = {
  id: string;
  title: string;
  slug?: string;              // optional, fallback to id
  image: string;
  shortDescription?: string;  // optional
  price: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  durationText?: string;
  isBestSeller?: boolean;
  primaryCategory?: string;
  eventCategory?: string;
  url?: string;
};