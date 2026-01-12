// ==========================================
// FILE: context/AuthContext.tsx
// UPDATED VERSION - Custom Auth Implementation
// ==========================================
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  birthday?: string;
  anniversary_date?: string;
  skin_type?: string;
  hair_type?: string;
  marital_status?: string;
  profile_image_url?: string;
  loyalty_points: number;
  total_bookings: number;
  total_spent: number;
  membership_tier: string;
  last_login_at?: string;
  login_count: number;
  is_premium?: boolean;
  wallet_balance?: number;
  total_referrals?: number;
  signup_method?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: Profile | null;
  profile: Profile | null;
  isLoggedIn: boolean;
  loading: boolean;
  signUp: (formData: any) => Promise<{ error?: string; user?: Profile }>;
  signIn: (email: string, password: string) => Promise<{ error?: string; user?: Profile }>;
  signInWithGoogle: () => void;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Check session on mount
  const checkSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Session check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Sign up with email/password
  const signUp = useCallback(async (formData: any) => {
    try {
      setLoading(true);

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Signup failed' };
      }

      setUser(data.user);
      return { user: data.user };
    } catch (error) {
      console.error('Signup error:', error);
      return { error: 'Signup failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign in with email/password
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Login failed' };
      }

      setUser(data.user);
      return { user: data.user };
    } catch (error) {
      console.error('Login error:', error);
      return { error: 'Login failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign in with Google
  const signInWithGoogle = useCallback(() => {
    // Redirect to your custom Google OAuth endpoint
    // This will show ONLY your domain, not Supabase
    window.location.href = '/api/auth/google';
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      setLoading(true);

      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Failed to send reset email' };
      }

      return { error: undefined };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: 'An unexpected error occurred' };
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    try {
      setLoading(true);

      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Profile update failed' };
      }

      setUser(data.user);
      return { error: undefined };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    await checkSession();
  }, [checkSession]);

  const value: AuthContextType = React.useMemo(
    () => ({
      user,
      profile: user,
      isLoggedIn: !!user,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      resetPassword,
      updateProfile,
      refreshProfile,
    }),
    [user, loading, signUp, signIn, signInWithGoogle, signOut, resetPassword, updateProfile, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };