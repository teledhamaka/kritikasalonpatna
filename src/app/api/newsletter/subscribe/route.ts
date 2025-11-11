// ========================================
// app/api/newsletter/subscribe/route.ts
// ========================================
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email' },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Save to database
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email, subscribed_at: new Date().toISOString() });

    if (error) {
      // Check if already subscribed
      if (error.code === '23505') {
        return NextResponse.json({ message: 'Already subscribed' });
      }
      throw error;
    }

    // TODO: Send welcome email via Resend/SendGrid

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}