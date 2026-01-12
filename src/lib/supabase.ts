// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Regular client for general use (client-side safe)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
//   auth: {
//     autoRefreshToken: true,
//     persistSession: true,
//   },
//   realtime: {
//     params: {
//       eventsPerSecond: 10,
//     },
//   },
// });

// Re-export the Service type from the types file
export type { MakeupService } from '../types/service';
export type { SkinService } from '../types/service';
export type { HairService } from '../types/service';
export type { ViralService } from '../types/service';

// Types
export interface Comment {
  id: string;
  slug: string;
  name: string;
  email?: string;
  comment: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  replies?: Comment[];
}

export interface PostAnalytics {
  id: string;
  slug: string;
  views: number;
  likes: number;
  shares: number;
  created_at: string;
  updated_at: string;
}

export interface UserEngagement {
  id: string;
  slug: string;
  action: 'view' | 'like' | 'share' | 'comment';
  user_ip?: string;
  user_agent?: string;
  created_at: string;
}
