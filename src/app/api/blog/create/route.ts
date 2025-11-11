// ========================================
// app/api/blog/create/route.ts - CREATE POST API
// ========================================
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = await createServerClient();

    // Generate slug from title
    const slug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/(^-|-$)/g, '');

    const wordCount = body.content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);
      

      const { data, error } = await supabase
      .from('blog_posts')
      .insert([
        {
          slug,
          title: body.title,
          excerpt: body.excerpt,
          content: body.content,
          cover_image: body.coverImage,
          category_id: body.category,
          tags: body.tags,
          featured: body.featured,
          read_time: readTime,
          status: body.status,
          published_at: body.status === 'published' ? new Date().toISOString() : null,
          meta_title: body.metaTitle || body.title,
          meta_description: body.metaDescription || body.excerpt,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}