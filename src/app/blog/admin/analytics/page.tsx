// ========================================
// app/blog/admin/analytics/page.tsx
// ========================================
import { createServerClient } from '@/lib/supabase/server';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';

interface CategoryStats {
  [key: string]: {
    views: number;
    posts: number;
    color: string;
  };
}

interface BlogPostFromDB {
  id: string;
  slug: string;
  title: string;
  views: number;
  likes: number;
  published_at: string;
  category: {
    name: string;
    color: string;
  } | Array<{ name: string; color: string }> | null; // Handle potential array or null based on the query structure
}

export default async function AnalyticsPage() {
  const supabase = await createServerClient();

  // Get posts with analytics
  const { data: posts } = await supabase
    .from('blog_posts')
    .select(`
      id, slug, title, views, likes, published_at,
      category:categories!inner(name, color)
    `)
    .eq('status', 'published')
    .order('views', { ascending: false });

  // Get total stats
  const totalViews = posts?.reduce((sum, post) => sum + (post.views || 0), 0) || 0;
  const totalLikes = posts?.reduce((sum, post) => sum + (post.likes || 0), 0) || 0;

  // Category breakdown
  const categoryStats = (posts as BlogPostFromDB[])?.reduce((
    acc: CategoryStats, post: BlogPostFromDB) => {
    const category = Array.isArray(post.category) ? post.category[0] : post.category;
    const catName = category?.name || 'Uncategorized';
    
    if (!acc[catName]) {
      acc[catName] = { views: 0, posts: 0, color: category?.color || '#gray' };
    }
    acc[catName].views += post.views || 0;
    acc[catName].posts += 1;
    return acc;
  }, {});

  // Transform for charts
  const transformedPosts = (posts || []).map(post => ({
    ...post,
    category: Array.isArray(post.category) ? post.category[0] : post.category,
  }));

  return (
    <AnalyticsDashboard 
      posts={transformedPosts}
      totalViews={totalViews}
      totalLikes={totalLikes}
      categoryStats={categoryStats || {}}
    />
  );
}
