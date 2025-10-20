// context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

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
  membership_tier: string
  last_login_at?: string;
  login_count: number;
  is_premium?: boolean; // Added for premium membership
  wallet_balance?: number; // Added for wallet/cashback
  total_referrals?: number; // Added for referral system
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: (User & { loyaltyPoints?: number; isPremium?: boolean }) | null;
  profile: Profile | null;
  session: Session | null;
  isLoggedIn: boolean;
  loading: boolean;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error?: string; user?: User }>;
  signIn: (email: string, password: string) => Promise<{ error?: string; user?: User }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error?: string }>;
  refreshProfile: () => Promise<void>;
  checkExistingSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<(User & { loyaltyPoints?: number; isPremium?: boolean }) | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const createProfile = useCallback(async (userId: string, email: string): Promise<Profile | null> => {
    try {
      const newProfile: Partial<Profile> = {
        id: userId,
        email: email,
        full_name: email.split('@')[0],
        loyalty_points: 0,
        total_bookings: 0,
        total_spent: 0,
        login_count: 1,
        is_premium: false,
        wallet_balance: 0,
        total_referrals: 0,
        last_login_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return null;
      }

      return data as Profile;
    } catch (error) {
      console.error('Error in createProfile:', error);
      return null;
    }
  }, []);

  const fetchProfile = useCallback(async (userId: string, userEmail?: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116' && userEmail) {
          console.log('Profile not found, creating new profile...');
          return await createProfile(userId, userEmail);
        }
        console.error('Error fetching profile:', error);
        return null;
      }

      return data as Profile;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  }, [createProfile]);

  const updateLoginStats = useCallback(async (userId: string) => {
    try {
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('login_count')
        .eq('id', userId)
        .single();

      await supabase
        .from('profiles')
        .update({
          last_login_at: new Date().toISOString(),
          login_count: (currentProfile?.login_count || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
    } catch (error) {
      console.error('Error updating login stats:', error);
    }
  }, []);

  const checkExistingSession = useCallback(async (): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch (error) {
      return false;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else if (mounted) {
          setSession(session);
          
          if (session?.user) {
            const userProfile = await fetchProfile(session.user.id, session.user.email);
            if (mounted) {
              setProfile(userProfile);
              // Extend user object with profile data
              setUser({
                ...session.user,
                loyaltyPoints: userProfile?.loyalty_points || 0,
                isPremium: userProfile?.is_premium || false,
              });
            }
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        if (mounted) {
          setLoading(false);
          setIsInitialized(true);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
    };
  }, [fetchProfile]);

  useEffect(() => {
    if (!isInitialized) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        
        if (session?.user) {
          const userProfile = await fetchProfile(session.user.id, session.user.email);
          setProfile(userProfile);
          setUser({
            ...session.user,
            loyaltyPoints: userProfile?.loyalty_points || 0,
            isPremium: userProfile?.is_premium || false,
          });
          
          if (event === 'SIGNED_IN' && userProfile) {
            await updateLoginStats(session.user.id);
            const updatedProfile = await fetchProfile(session.user.id, session.user.email);
            setProfile(updatedProfile);
            setUser({
              ...session.user,
              loyaltyPoints: updatedProfile?.loyalty_points || 0,
              isPremium: updatedProfile?.is_premium || false,
            });
          }
        } else {
          setProfile(null);
          setUser(null);
        }
        
        setLoading(false);

        switch (event) {
          case 'SIGNED_IN':
            console.log('User signed in successfully');
            break;
          case 'SIGNED_OUT':
            console.log('User signed out');
            setProfile(null);
            break;
          case 'TOKEN_REFRESHED':
            console.log('Token refreshed');
            break;
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [isInitialized, fetchProfile, updateLoginStats]);

  const signUp = useCallback(async (email: string, password: string, userData?: any) => {
    try {
      setLoading(true);
      
      const existingSession = await checkExistingSession();
      if (existingSession) {
        return { error: 'You are already logged in. Please sign out first.' };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData || {},
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        await createProfile(data.user.id, email);
        return { user: data.user };
      }

      return { error: undefined };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: 'An unexpected error occurred during sign up' };
    } finally {
      setLoading(false);
    }
  }, [checkExistingSession, createProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const existingSession = await checkExistingSession();
      if (existingSession) {
        return { error: 'You are already logged in from another session. Please sign out first.' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        return { user: data.user };
      }

      return { error: undefined };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: 'An unexpected error occurred during sign in' };
    } finally {
      setLoading(false);
    }
  }, [checkExistingSession]);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
      
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { error: error.message };
      }

      return { error: undefined };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: 'An unexpected error occurred' };
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    try {
      setLoading(true);
      
      if (!user) {
        return { error: 'No user logged in' };
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        return { error: error.message };
      }

      const updatedProfile = await fetchProfile(user.id, user.email);
      setProfile(updatedProfile);
      setUser({
        ...user,
        loyaltyPoints: updatedProfile?.loyalty_points || 0,
        isPremium: updatedProfile?.is_premium || false,
      });

      return { error: undefined };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  }, [user, fetchProfile]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const updatedProfile = await fetchProfile(user.id, user.email);
      setProfile(updatedProfile);
      setUser({
        ...user,
        loyaltyPoints: updatedProfile?.loyalty_points || 0,
        isPremium: updatedProfile?.is_premium || false,
      });
    }
  }, [user, fetchProfile]);

  const value: AuthContextType = React.useMemo(() => ({
    user,
    profile,
    session,
    isLoggedIn: !!user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile,
    checkExistingSession,
  }), [
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile,
    checkExistingSession,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };