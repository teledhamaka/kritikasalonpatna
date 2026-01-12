// ==========================================
// FILE: app/api/auth/signup/route.ts
// ==========================================
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/authService';
import { SessionManager } from '@/lib/auth/sessionManager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      email, 
      password, 
      firstName, 
      lastName,
      mobile,
      dob,
      maritalStatus,
      anniversaryDate,
      ...otherData 
    } = body;

    // Validate required fields
    if (!email || !password || !firstName) {
      return NextResponse.json(
        { error: 'Email, password, and first name are required' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Validate age (must be 13+)
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 13) {
        return NextResponse.json(
          { error: 'You must be at least 13 years old to create an account' },
          { status: 400 }
        );
      }
    }

    // Prepare user data
    const userData = {
      full_name: `${firstName} ${lastName || ''}`.trim(),
      first_name: firstName,
      last_name: lastName || '',
      phone: mobile || null,
      birthday: dob || null,
      marital_status: maritalStatus || 'single',
      anniversary_date: anniversaryDate || null,
      signup_method: 'email',
      ...otherData,
    };

    // Signup
    const { user } = await AuthService.signupWithEmail(email, password, userData);

    // Create session
    await SessionManager.createSession(user.id, user.email!);

    // Get full profile
    const profile = await AuthService.getProfile(user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        ...profile,
      },
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    
    let errorMessage = 'Signup failed. Please try again.';
    if (error.message.includes('User already registered')) {
      errorMessage = 'An account with this email already exists. Please login instead.';
    } else if (error.message.includes('Email')) {
      errorMessage = 'Invalid email address.';
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}