// app/api/analytics/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Type definitions
// interface AnalyticsData {
//   slug: string;
//   views: number;
//   likes: number;
//   shares: number;
// }

interface UpdateData {
  views?: number;
  likes?: number;
  shares?: number;
}

interface InsertData {
  slug: string;
  views: number;
  likes: number;
  shares: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const { data, error } = await supabase
      .from('post_analytics')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch analytics' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      analytics: data || { views: 0, likes: 0, shares: 0 }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { action } = body; // 'view', 'like', or 'share'

    if (!['view', 'like', 'share'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    // Get current analytics or create new
    const { data: existing } = await supabase
      .from('post_analytics')
      .select('*')
      .eq('slug', slug)
      .single();

    let result;
    if (existing) {
      // Update existing
      const updateData: UpdateData = {};
      if (action === 'view') updateData.views = existing.views + 1;
      if (action === 'like') updateData.likes = existing.likes + 1;
      if (action === 'share') updateData.shares = existing.shares + 1;

      result = await supabase
        .from('post_analytics')
        .update(updateData)
        .eq('slug', slug)
        .select()
        .single();
    } else {
      // Create new
      const insertData: InsertData = {
        slug,
        views: action === 'view' ? 1 : 0,
        likes: action === 'like' ? 1 : 0,
        shares: action === 'share' ? 1 : 0,
      };

      result = await supabase
        .from('post_analytics')
        .insert([insertData])
        .select()
        .single();
    }

    if (result.error) {
      console.error('Supabase error:', result.error);
      return NextResponse.json(
        { error: 'Failed to update analytics' },
        { status: 500 }
      );
    }

    // Track engagement
    await supabase.from('user_engagement').insert([
      {
        slug,
        action,
        user_ip: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      }
    ]);

    return NextResponse.json({
      success: true,
      analytics: result.data
    });
  } catch (error) {
    console.error('Error updating analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}