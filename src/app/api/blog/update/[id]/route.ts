// ========================================
// app/api/blog/update/[id]/route.ts
// ========================================
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = await createServerClient();

    // Calculate read time
    const wordCount = body.content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);

    const { data, error } = await supabase
      .from('blog_posts')
      .update({
        title: body.title,
        excerpt: body.excerpt,
        content: body.content,
        cover_image: body.coverImage,
        category_id: body.categoryId,
        author_id: body.authorId,
        tags: body.tags || [],
        featured: body.featured,
        read_time: readTime,
        status: body.status,
        meta_title: body.metaTitle || body.title,
        meta_description: body.metaDescription || body.excerpt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
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
