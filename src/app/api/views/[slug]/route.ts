// ========================================
// app/api/views/[slug]/route.ts - INCREMENT VIEWS
// ========================================
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = await createServerClient();
    const { slug } = await params;

    // Call Supabase function to increment views
    const { error } = await supabase.rpc('increment_post_views', {
      post_slug: slug,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}