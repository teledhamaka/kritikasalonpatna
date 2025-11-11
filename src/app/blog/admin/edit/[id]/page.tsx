// ========================================
// app/blog/admin/edit/[id]/page.tsx
// ========================================
import { createServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import EditPostForm from '@/components/admin/EditPostForm';

export default async function EditPostPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const supabase = await createServerClient();

  // Get post data
  const { data: post, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      category:categories!inner(id, name, slug),
      author:authors!inner(id, name, slug)
    `)
    .eq('id', id)
    .single();

  if (error || !post) {
    notFound();
  }

  // Get categories and authors for dropdowns
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name');

  const { data: authors } = await supabase
    .from('authors')
    .select('id, name, slug')
    .order('name');

  // Transform nested arrays
  const transformedPost = {
    ...post,
    category: Array.isArray(post.category) ? post.category[0] : post.category,
    author: Array.isArray(post.author) ? post.author[0] : post.author,
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50 via-purple-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <EditPostForm 
          post={transformedPost}
          categories={categories || []} 
          authors={authors || []} 
        />
      </div>
    </div>
  );
}
