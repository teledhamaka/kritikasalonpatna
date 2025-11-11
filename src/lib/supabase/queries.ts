// src/lib/supabase/queries.ts - FIXED VERSION
import { createStaticClient } from './static-client';
import { createServerClient } from './server';

export async function getAllPublishedPosts() {
  const supabase = createStaticClient();

  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      id,
      slug,
      title,
      excerpt,
      cover_image,
      read_time,
      views,
      likes,
      published_at,
      featured,
      tags,
      category:categories(name, slug, color, icon),
      author:authors(name, avatar_url, bio)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
  return data;
}

export async function getPostBySlug(slug: string) {
  const supabase = createStaticClient();

  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      category:categories(*),
      author:authors(*)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) {
    console.error('Error fetching post:', error);
    return null;
  }
  return data;
}

export async function getRelatedPosts(postId: string, categoryId: string, limit = 3) {
  const supabase = createStaticClient();

  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      id,
      slug,
      title,
      cover_image,
      read_time,
      category:categories(name, color)
    `)
    .eq('category_id', categoryId)
    .eq('status', 'published')
    .neq('id', postId)
    .limit(limit);

  if (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }
  return data;
}

// Server-side version for dynamic requests
export async function getPostBySlugServer(slug: string) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      category:categories(*),
      author:authors(*)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) {
    console.error('Error fetching post:', error);
    return null;
  }
  return data;
}