// lib/db/queries.ts
import { db, User, Profile, Session } from './client';

/**
 * USER QUERIES
 */

export async function createUser(data: {
  email: string;
  passwordHash?: string;
  authProvider: 'email' | 'google' | 'facebook';
  providerId?: string;
}): Promise<User | null> {
  try {
    console.log('📝 Creating user with data:', {
      email: data.email,
      authProvider: data.authProvider,
      providerId: data.providerId ? 'present' : 'none',
      hasPassword: !!data.passwordHash,
    });

    const { data: user, error } = await db
      .from('users')
      .insert({
        email: data.email.toLowerCase(),
        password_hash: data.passwordHash || null,
        auth_provider: data.authProvider,
        provider_id: data.providerId || null,
        email_verified: data.authProvider !== 'email', // OAuth users are auto-verified
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating user - Full details:');
      console.error('  - Code:', error.code);
      console.error('  - Message:', error.message);
      console.error('  - Details:', error.details);
      console.error('  - Hint:', error.hint);
      console.error('  - Full error:', JSON.stringify(error, null, 2));
      return null;
    }

    console.log('✅ User created successfully:', user.id);
    return user as User;
  } catch (error: any) {
    console.error('❌ Exception in createUser:', error);
    console.error('  - Type:', error?.constructor?.name);
    console.error('  - Message:', error?.message);
    console.error('  - Stack:', error?.stack);
    return null;
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const { data: user, error } = await db
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found - this is normal
        return null;
      }
      console.error('Error finding user by email:', error);
      return null;
    }
    return user as User;
  } catch (error) {
    console.error('Exception in findUserByEmail:', error);
    return null;
  }
}

export async function findUserById(id: string): Promise<User | null> {
  try {
    const { data: user, error } = await db
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error finding user by id:', error);
      return null;
    }
    return user as User;
  } catch (error) {
    console.error('Exception in findUserById:', error);
    return null;
  }
}

export async function findUserByProvider(
  provider: string,
  providerId: string
): Promise<User | null> {
  try {
    const { data: user, error } = await db
      .from('users')
      .select('*')
      .eq('auth_provider', provider)
      .eq('provider_id', providerId)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found - this is normal for new users
        return null;
      }
      console.error('Error finding user by provider:', error);
      return null;
    }
    return user as User;
  } catch (error) {
    console.error('Exception in findUserByProvider:', error);
    return null;
  }
}

export async function updateUserLastLogin(userId: string): Promise<void> {
  try {
    const { error } = await db
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      console.error('Error updating last login:', error);
    }
  } catch (error) {
    console.error('Exception in updateUserLastLogin:', error);
  }
}

export async function verifyUserEmail(userId: string): Promise<void> {
  try {
    const { error } = await db
      .from('users')
      .update({ email_verified: true })
      .eq('id', userId);

    if (error) {
      console.error('Error verifying email:', error);
    }
  } catch (error) {
    console.error('Exception in verifyUserEmail:', error);
  }
}

/**
 * PROFILE QUERIES
 */

export async function createProfile(data: {
  userId: string;
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  birthday?: string;
  signupMethod: string;
  profileImageUrl?: string;
}): Promise<Profile | null> {
  try {
    console.log('📝 Creating profile with data:', {
      userId: data.userId,
      email: data.email,
      fullName: data.fullName,
      signupMethod: data.signupMethod,
    });

    const { data: profile, error } = await db
      .from('profiles')
      .insert({
        user_id: data.userId,
        email: data.email.toLowerCase(),
        full_name: data.fullName,
        first_name: data.firstName || null,
        last_name: data.lastName || null,
        phone: data.phone || null,
        birthday: data.birthday || null,
        signup_method: data.signupMethod,
        profile_image_url: data.profileImageUrl || null,
        loyalty_points: 0,
        total_bookings: 0,
        total_spent: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating profile - Full details:');
      console.error('  - Code:', error.code);
      console.error('  - Message:', error.message);
      console.error('  - Details:', error.details);
      console.error('  - Hint:', error.hint);
      console.error('  - Full error:', JSON.stringify(error, null, 2));
      return null;
    }

    console.log('✅ Profile created successfully');
    return profile as Profile;
  } catch (error: any) {
    console.error('❌ Exception in createProfile:', error);
    console.error('  - Type:', error?.constructor?.name);
    console.error('  - Message:', error?.message);
    return null;
  }
}

export async function findProfileByUserId(userId: string): Promise<Profile | null> {
  try {
    const { data: profile, error } = await db
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error finding profile:', error);
      return null;
    }
    return profile as Profile;
  } catch (error) {
    console.error('Exception in findProfileByUserId:', error);
    return null;
  }
}

export async function findProfileByEmail(email: string): Promise<Profile | null> {
  try {
    const { data: profile, error } = await db
      .from('profiles')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error finding profile by email:', error);
      return null;
    }
    return profile as Profile;
  } catch (error) {
    console.error('Exception in findProfileByEmail:', error);
    return null;
  }
}

/**
 * SESSION QUERIES
 */

export async function createSession(data: {
  userId: string;
  refreshToken: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}): Promise<Session | null> {
  try {
    console.log('📝 Creating session for user:', data.userId);

    const { data: session, error } = await db
      .from('sessions')
      .insert({
        user_id: data.userId,
        refresh_token: data.refreshToken,
        expires_at: data.expiresAt.toISOString(),
        ip_address: data.ipAddress || null,
        user_agent: data.userAgent || null,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating session:', error);
      return null;
    }

    console.log('✅ Session created successfully');
    return session as Session;
  } catch (error) {
    console.error('Exception in createSession:', error);
    return null;
  }
}

export async function findSessionByRefreshToken(
  refreshToken: string
): Promise<Session | null> {
  try {
    const { data: session, error } = await db
      .from('sessions')
      .select('*')
      .eq('refresh_token', refreshToken)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      return null;
    }

    // Check if expired
    if (new Date(session.expires_at) < new Date()) {
      await deleteSession(session.id);
      return null;
    }

    return session as Session;
  } catch (error) {
    console.error('Exception in findSessionByRefreshToken:', error);
    return null;
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  try {
    await db.from('sessions').delete().eq('id', sessionId);
  } catch (error) {
    console.error('Exception in deleteSession:', error);
  }
}

export async function deleteUserSessions(userId: string): Promise<void> {
  try {
    await db.from('sessions').delete().eq('user_id', userId);
  } catch (error) {
    console.error('Exception in deleteUserSessions:', error);
  }
}

export async function cleanExpiredSessions(): Promise<void> {
  try {
    await db
      .from('sessions')
      .delete()
      .lt('expires_at', new Date().toISOString());
  } catch (error) {
    console.error('Exception in cleanExpiredSessions:', error);
  }
}

/**
 * PASSWORD RESET QUERIES
 */

export async function createPasswordResetToken(data: {
  userId: string;
  token: string;
  expiresAt: Date;
}): Promise<void> {
  try {
    await db.from('password_reset_tokens').insert({
      user_id: data.userId,
      token: data.token,
      expires_at: data.expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Exception in createPasswordResetToken:', error);
  }
}

export async function findPasswordResetToken(token: string): Promise<{
  user_id: string;
  expires_at: string;
  used: boolean;
} | null> {
  try {
    const { data, error } = await db
      .from('password_reset_tokens')
      .select('user_id, expires_at, used')
      .eq('token', token)
      .eq('used', false)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error finding password reset token:', error);
      return null;
    }

    // Check if expired
    if (new Date(data.expires_at) < new Date()) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception in findPasswordResetToken:', error);
    return null;
  }
}

export async function markPasswordResetTokenUsed(token: string): Promise<void> {
  try {
    await db
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('token', token);
  } catch (error) {
    console.error('Exception in markPasswordResetTokenUsed:', error);
  }
}

export async function updateUserPassword(
  userId: string,
  passwordHash: string
): Promise<void> {
  try {
    await db
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('id', userId);
  } catch (error) {
    console.error('Exception in updateUserPassword:', error);
  }
}