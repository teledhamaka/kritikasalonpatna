// ==========================================
// FILE: lib/auth/authService.ts
// ==========================================
import { supabase, supabaseAdmin } from '@/lib/supabase'; // UPDATED IMPORT
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const TOKEN_EXPIRY = '7d';

export interface CustomAuthToken {
  userId: string;
  email: string;
  exp: number;
}

export class AuthService {
  // Generate custom JWT token
  static generateToken(userId: string, email: string): string {
    return jwt.sign(
      { userId, email },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );
  }

  // Verify custom JWT token
  static verifyToken(token: string): CustomAuthToken | null {
    try {
      return jwt.verify(token, JWT_SECRET) as CustomAuthToken;
    } catch {
      return null;
    }
  }

  // Email/Password Login
  static async loginWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('Login failed');

    // Generate custom token
    const token = this.generateToken(data.user.id, data.user.email!);

    return {
      user: data.user,
      token,
      session: data.session,
    };
  }

  // Email/Password Signup
  static async signupWithEmail(
    email: string,
    password: string,
    userData: any
  ) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: userData,
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
      },
    });

    if (error) throw error;
    if (!data.user) throw new Error('Signup failed');

    // Create profile
    await this.createProfile(data.user.id, email, userData);

    const token = this.generateToken(data.user.id, data.user.email!);

    return {
      user: data.user,
      token,
      session: data.session,
    };
  }

  // Google OAuth Login
  static async loginWithGoogle(googleIdToken: string) {
    try {
      // Verify Google token and get user info
      const googleUser = await this.verifyGoogleToken(googleIdToken);

      if (!googleUser.email_verified) {
        throw new Error('Google email not verified');
      }

      // Check if user exists in Supabase profiles
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('email', googleUser.email)
        .single();

      let userId: string;

      if (!profile) {
        // Create new user in Supabase Auth using admin client
        const { data: newAuthUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: googleUser.email,
          email_confirm: true,
          user_metadata: {
            full_name: googleUser.name,
            avatar_url: googleUser.picture,
            provider: 'google',
          },
        });

        if (createError) {
          console.error('Supabase admin createUser error:', createError);
          throw createError;
        }
        
        if (!newAuthUser.user) throw new Error('Failed to create user');

        userId = newAuthUser.user.id;

        // Create profile using admin client
        await this.createProfile(userId, googleUser.email, {
          full_name: googleUser.name,
          first_name: googleUser.given_name,
          last_name: googleUser.family_name,
          profile_image_url: googleUser.picture,
          signup_method: 'google',
        });
      } else {
        userId = profile.id;
      }

      // Generate custom token
      const token = this.generateToken(userId, googleUser.email);

      return { userId, email: googleUser.email, token };
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }

  // Create user profile
  static async createProfile(userId: string, email: string, userData: any) {
    try {
      const profileData = {
        id: userId,
        email,
        full_name: userData.full_name || email.split('@')[0],
        first_name: userData.first_name || userData.full_name?.split(' ')[0] || '',
        last_name: userData.last_name || userData.full_name?.split(' ').slice(1).join(' ') || '',
        phone: userData.phone || null,
        birthday: userData.birthday || null,
        anniversary_date: userData.anniversary_date || null,
        marital_status: userData.marital_status || 'single',
        profile_image_url: userData.profile_image_url || null,
        signup_method: userData.signup_method || 'email',
        loyalty_points: 0,
        total_bookings: 0,
        total_spent: 0,
        login_count: 1,
        membership_tier: 'Bronze',
        is_premium: false,
        wallet_balance: 0,
        total_referrals: 0,
        last_login_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Use admin client to create profile
      const { error } = await supabaseAdmin
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' });

      if (error) {
        console.error('Profile creation error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in createProfile:', error);
      throw error;
    }
  }

  // Verify Google token
  private static async verifyGoogleToken(idToken: string) {
    try {
      const response = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
      );
      
      if (!response.ok) {
        throw new Error('Invalid Google token');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error('Invalid Google token');
      }

      return {
        email: data.email,
        email_verified: data.email_verified === 'true' || data.email_verified === true,
        name: data.name,
        given_name: data.given_name,
        family_name: data.family_name,
        picture: data.picture,
      };
    } catch (error) {
      console.error('Google token verification error:', error);
      throw new Error('Failed to verify Google token');
    }
  }

  // Get user profile
  static async getProfile(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  // Update user profile
  static async updateProfile(userId: string, updates: any) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update login stats
  static async updateLoginStats(userId: string) {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('login_count')
      .eq('id', userId)
      .single();

    await supabaseAdmin
      .from('profiles')
      .update({
        login_count: (profile?.login_count || 0) + 1,
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
  }

  // Password reset
  static async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    });

    if (error) throw error;
  }

  // Update password
  static async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  }
}
