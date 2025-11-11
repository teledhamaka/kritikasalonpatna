// ========================================
// lib/supabase/bookmark.ts - Bookmark Utilities
// ========================================
import { createClientSupabase } from './client';

export async function toggleBookmark(postSlug: string, userId: string) {
  const supabase = createClientSupabase();

  // Check if already bookmarked
  const { data: existing } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', userId)
    .eq('post_slug', postSlug)
    .single();

  if (existing) {
    // Remove bookmark
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', existing.id);
    
    return { bookmarked: false, error };
  } else {
    // Add bookmark
    const { error } = await supabase
      .from('bookmarks')
      .insert({ user_id: userId, post_slug: postSlug });
    
    return { bookmarked: true, error };
  }
}

export async function getUserBookmarks(userId: string) {
  const supabase = createClientSupabase();

  const { data, error } = await supabase
    .from('bookmarks')
    .select(`
      post_slug,
      blog_posts (
        id, slug, title, excerpt, cover_image, read_time,
        category:categories(name, color)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { bookmarks: data, error };
}