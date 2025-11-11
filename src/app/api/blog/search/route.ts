// ========================================
// SUPABASE SEARCH API ROUTE
// app/api/blog/search/route.ts
// ========================================
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .textSearch('title', query)
      .limit(10);

    if (error) throw error;

    return NextResponse.json({ results: data || [] });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { results: [], error: errorMessage },
      { status: 500 }
    );
  }
}

