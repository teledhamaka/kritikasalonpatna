// lib/db/client.ts
import { createClient } from '@supabase/supabase-js';

// Create Supabase client for database operations only (not auth)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role key for server-side database operations
export const db = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false, // We handle sessions ourselves
    autoRefreshToken: false,
  },
});

// Types for our database
export interface User {
  id: string;
  email: string;
  password_hash: string | null;
  email_verified: boolean;
  auth_provider: 'email' | 'google' | 'facebook';
  provider_id: string | null;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  is_active: boolean;
}

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  birthday: string | null;
  profile_image_url: string | null;
  signup_method: string;
  loyalty_points: number;
  total_bookings: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  refresh_token: string;
  expires_at: string;
  created_at: string;
  ip_address: string | null;
  user_agent: string | null;
}