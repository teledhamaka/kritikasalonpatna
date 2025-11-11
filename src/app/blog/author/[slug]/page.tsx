// ========================================
// app/blog/author/[slug]/page.tsx - FIXED FOR BUILD
// ========================================

import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import BlogCard from '@/components/blog/BlogCard';
import { Award, Calendar } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export const revalidate = 3600;

interface AuthorPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_image: string;
  read_time: number;
  views: number;
  likes: number;
  published_at: string;
  featured: boolean;
  category: { name: string; color: string }; 
  author: { name: string; avatar_url: string };
}

interface RawAuthorPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_image: string;
  read_time: number;
  views: number;
  likes: number;
  published_at: string;
  featured: boolean;
  category: Array<{ name: string; color: string }>;
  author: Array<{ name: string; avatar_url: string }>;
}

// Create a simple client for generateStaticParams (no cookies needed)
function createStaticClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function getAuthorData(slug: string) {
  // Use static client for data fetching
  const supabase = createStaticClient();

  const { data: author, error: authorError } = await supabase
    .from('authors')
    .select('*')
    .eq('slug', slug)
    .single();

  if (authorError || !author) return null;

  const { data: posts, error: postsError } = await supabase
    .from('blog_posts')
    .select(`
      id, slug, title, excerpt, cover_image, read_time, views, likes,
      published_at, featured,
      category:categories!inner(name, color),
      author:authors!inner(name, avatar_url)
    `)
    .eq('author_id', author.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (postsError) throw postsError;

  const transformedPosts = (posts || []).map((post: RawAuthorPost) => ({
    ...post,
    category: Array.isArray(post.category) ? post.category[0] : post.category,
    author: Array.isArray(post.author) ? post.author[0] : post.author,
  })) as AuthorPost[];

  const totalViews = transformedPosts.reduce((sum: number, post) => sum + (post.views || 0), 0);
  const totalLikes = transformedPosts.reduce((sum: number, post) => sum + (post.likes || 0), 0);

  return { 
    author, 
    posts: transformedPosts, 
    stats: { totalViews, totalLikes, totalPosts: transformedPosts.length } 
  };
}

export async function generateStaticParams() {
  // Use static client (no cookies) for build-time generation
  const supabase = createStaticClient();
  
  const { data } = await supabase
    .from('authors')
    .select('slug');
  
  return (data || []).map((author: { slug: string }) => ({ 
    slug: author.slug 
  }));
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const data = await getAuthorData(slug);

  if (!data) {
    return { title: 'Author Not Found' };
  }

  return {
    title: `${data.author.name} - Beauty Expert`,
    description: data.author.bio,
  };
}

export default async function AuthorPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const data = await getAuthorData(slug);

  if (!data) {
    notFound();
  }

  const { author, posts, stats } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-12">
      <div className="container mx-auto px-4">
        
        {/* Author Profile Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-12">
          <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 h-32"></div>
          
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16">
              
              <Image
                src={author.avatar_url || '/images/default-avatar.jpg'}
                alt={author.name}
                width={128}
                height={128}
                className="w-32 h-32 rounded-full border-8 border-white shadow-xl object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/default-avatar.jpg';
                }}
              />

              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {author.name}
                </h1>
                <p className="text-lg text-gray-600 mb-4">{author.bio}</p>

                {/* Expertise Tags */}
                {author.expertise && author.expertise.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {author.expertise.map((skill: string) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="flex flex-wrap gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Award className="text-pink-500" size={20} />
                    <span className="font-semibold text-gray-900">{stats.totalPosts}</span>
                    <span className="text-gray-600">Articles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="text-purple-500" size={20} />
                    <span className="font-semibold text-gray-900">{stats.totalViews.toLocaleString()}</span>
                    <span className="text-gray-600">Views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">❤️</span>
                    <span className="font-semibold text-gray-900">{stats.totalLikes}</span>
                    <span className="text-gray-600">Likes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Certifications */}
            {author.certifications && author.certifications.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Certifications</h3>
                <ul className="space-y-2">
                  {author.certifications.map((cert: string) => (
                    <li key={cert} className="flex items-center gap-2 text-gray-700">
                      <Award size={16} className="text-pink-500" />
                      {cert}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Author's Posts */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Latest Articles by {author.name.split(' ')[0]}
          </h2>
          
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post: AuthorPost) => (
                <BlogCard
                  key={post.id}
                  post={{
                    slug: post.slug,
                    title: post.title,
                    excerpt: post.excerpt,
                    coverImage: post.cover_image,
                    category: post.category,
                    author: {
                      name: post.author.name,
                      avatar: post.author.avatar_url,
                    },
                    readTime: post.read_time,
                    views: post.views,
                    likes: post.likes,
                    publishedAt: post.published_at,
                    featured: post.featured,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl">
              <div className="text-6xl mb-4">✍️</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">
                No posts yet
              </h3>
              <p className="text-gray-500">Stay tuned for upcoming articles!</p>
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-semibold"
          >
            ← Back to blog
          </Link>
        </div>
      </div>
    </div>
  );
}