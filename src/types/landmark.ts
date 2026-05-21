// src/types/landmark.ts
// Centralized type definitions for landmarks

export interface Landmark {
  id?: string;
  name: string;
  slug: string; // Make required, not optional
  type: string;
  distance: string;
  pincode?: string; // Keep optional
  targetAudience?: string;
  estimatedFootfall?: string;
  keywords: string[];
  population?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}