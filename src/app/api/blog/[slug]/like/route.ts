import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/blog/[slug]/like
 * Increments the like count for a specific blog post.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createServerClient();
    
    // In Next.js 15, params must be awaited
    const { slug } = await params;

    // 1. Fetch current likes and validate post existence
    const { data: post, error: fetchError } = await supabase
      .from('blog_posts')
      .select('likes')
      .eq('slug', slug)
      .single();

    // Checking 'fetchError' and 'post' resolves the "assigned but never used" warning
    if (fetchError || !post) {
      console.error('Fetch error or post not found:', fetchError);
      return NextResponse.json(
        { error: 'Blog post not found' }, 
        { status: 404 }
      );
    }

    // 2. Increment the likes
    const { error: updateError } = await supabase
      .from('blog_posts')
      .update({ likes: (post.likes || 0) + 1 })
      .eq('slug', slug);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Like added successfully',
      newLikelikeCount: (post.likes || 0) + 1 
    });

  } catch (error) {
    console.error('Error in like API POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

/**
 * GET /api/blog/[slug]/like
 * Retrieves the current like count for a specific blog post.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createServerClient();
    
    // Await params for Next.js 15 compatibility
    const { slug } = await params;

    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('likes')
      .eq('slug', slug)
      .single();

    if (error || !post) {
      return NextResponse.json(
        { error: 'Post not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json({ likes: post.likes || 0 });

  } catch (error) {
    console.error('Error in like API GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}