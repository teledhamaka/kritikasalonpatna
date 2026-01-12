// ============================================================================
// FILE: lib/db/users.ts
// Database operations for users
// ============================================================================

import { createServerSupabaseClient } from '../supabase-server';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  profile_image_url: string | null;
  loyalty_points: number;
  total_bookings: number;
  total_spent: number;
  theme_style: string;
  birthday: string | null;
  anniversary_date: string | null;
  marital_status: string;
  created_at: string;
}

export async function findUserByEmail(email: string) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error) return null;
  return data;
}

export async function findUserById(userId: string) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data;
}

export async function createUser(userData: {
  email: string;
  password_hash: string;
  full_name: string;
  first_name: string;
  last_name: string;
  phone?: string;
  birthday?: string;
  marital_status?: string;
  anniversary_date?: string;
  signup_method: 'email' | 'google';
  google_id?: string;
}) {
  const supabase = createServerSupabaseClient();
  
  const profileData = {
    email: userData.email.toLowerCase(),
    password_hash: userData.password_hash,
    full_name: userData.full_name,
    first_name: userData.first_name,
    last_name: userData.last_name,
    phone: userData.phone || null,
    birthday: userData.birthday || null,
    anniversary_date: userData.anniversary_date || null,
    marital_status: userData.marital_status || 'single',
    signup_method: userData.signup_method,
    google_id: userData.google_id || null,
    loyalty_points: 0,
    total_bookings: 0,
    total_spent: 0.00,
    theme_style: 'pink',
    enable_period_tracker: false,
    notification_preferences: { sms: false, push: true, email: true },
    login_count: 0,
    is_premium: false,
    wallet_balance: 0.00,
    total_referrals: 0,
    membership_tier: 'bronze',
  };

  const { data, error } = await supabase
    .from('profiles')
    .insert(profileData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserLogin(userId: string) {
  const supabase = createServerSupabaseClient();
  
  const user = await findUserById(userId);
  if (!user) return;

  await supabase
    .from('profiles')
    .update({
      last_login_at: new Date().toISOString(),
      login_count: (user.login_count || 0) + 1,
    })
    .eq('id', userId);
}

export async function updateUserProfile(userId: string, updateData: Partial<UserProfile>) {
  const supabase = createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updateData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}