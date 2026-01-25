// src/app/blog/[slug]/page.tsx - FIXED VERSION
import { createStaticClient } from '@/lib/supabase/static-client';
import { getPostBySlugServer } from '@/lib/supabase/queries';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import MobileBottomNav from '@/components/MobileBottomNav';

// ✅ Generate static params without cookies
export async function generateStaticParams() {
  const supabase = createStaticClient();

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('status', 'published');

  return posts?.map(({ slug }) => ({ slug })) || [];
}

// ✅ Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createStaticClient();

  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, excerpt, cover_image, meta_title, meta_description')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.',
    };
  }

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt,
      images: [post.cover_image || '/images/all-services.webp'],
      type: 'article',
    },
  };
}

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image: string;
  read_time: number;
  views: number;
  likes: number;
  published_at: string;
  featured: boolean;
  tags: string[];
  category: {
    id: string;
    name: string;
    slug: string;
    color: string;
    icon: string;
  };
  author: {
    id: string;
    name: string;
    avatar_url: string;
    bio: string;
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Use server client for dynamic requests
  const post = await getPostBySlugServer(slug);

  if (!post) {
    notFound();
  }

  const blogPost = post as BlogPost;

  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-gray-600">
          <Link href="/" className="hover:text-pink-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="hover:text-pink-600">Blog</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{blogPost.title}</span>
        </nav>

        {/* Article Header */}
        <article className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
          
          {/* Cover Image */}
          <div className="relative h-96 overflow-hidden">
            <Image
              src={blogPost.cover_image || '/images/all-services.webp'}
              alt={blogPost.title}
              fill
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
            
            {/* Category Badge */}
            <div className="absolute top-6 left-6">
              <span 
                className="px-4 py-2 rounded-full text-white font-semibold text-sm backdrop-blur-md"
                style={{ backgroundColor: `${blogPost.category?.color || '#ec4899'}CC` }}
              >
                {blogPost.category?.name || 'General'}
              </span>
            </div>

            {/* Featured Badge */}
            {blogPost.featured && (
              <div className="absolute top-6 right-6 bg-linear-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                <span>🔥</span>
                TRENDING
              </div>
            )}
          </div>

          {/* Article Content */}
          <div className="p-8">
            
            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {blogPost.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 mb-8 text-gray-600 border-b border-gray-200 pb-6">
              
              {/* Author */}
              <div className="flex items-center gap-3">
                <Image
                  src={blogPost.author?.avatar_url || '/images/all-services.webp'}
                  alt={blogPost.author?.name || 'Author profile picture'}
                  width={32}
                  height={32}  
                  className="w-12 h-12 rounded-full border-2 border-pink-200 object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900">{blogPost.author?.name || 'Team'}</p>
                  <p className="text-sm">
                    {new Date(blogPost.published_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                  {blogPost.read_time || 5} min read
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  {blogPost.views || 0} views
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
                  {blogPost.likes || 0} likes
                </span>
              </div>
            </div>

            {/* Excerpt */}
            {blogPost.excerpt && (
              <div className="bg-pink-50 border-l-4 border-pink-500 p-6 rounded-lg mb-8">
                <p className="text-lg text-gray-700 italic">{blogPost.excerpt}</p>
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-600 prose-strong:text-gray-900 prose-a:text-pink-600 hover:prose-a:text-pink-700">
              
              {/* Render markdown content */}
              <div 
                className="blog-content"
                dangerouslySetInnerHTML={{ 
                  __html: blogPost.content 
                    ? blogPost.content.replace(/\n/g, '<br>')
                    : '<p>Content coming soon...</p>' 
                }}
              />

              {/* Tags */}
              {blogPost.tags && blogPost.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags:</h3>
                  <div className="flex flex-wrap gap-2">
                    {blogPost.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-pink-100 hover:text-pink-700 transition-colors"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <MobileBottomNav />

              {/* CTA Section */}
              <div className="mt-12 bg-linear-to-r from-pink-500 via-purple-500 to-blue-500 rounded-2xl p-8 text-center text-white">
                <h3 className="text-2xl font-bold mb-4">Loved This Article? 💖</h3>
                <p className="mb-6 opacity-95">Get personalized beauty advice from Patna&apos;s top experts
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/booking"
                    className="px-6 py-3 bg-white text-pink-600 rounded-full font-bold hover:shadow-2xl transition-all flex items-center justify-center gap-2"
                  >
                    <span>💖</span>
                    Book Appointment
                  </Link>
                  <Link
                    href="/blog"
                    className="px-6 py-3 bg-transparent border-2 border-white rounded-full font-bold hover:bg-white hover:text-pink-600 transition-all flex items-center justify-center gap-2"
                  >
                    <span>📚</span>
                    More Articles
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Related Posts Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">More Articles You Might Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* You can fetch related posts here based on category */}
            <Link href="/blog" className="block p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Discover More Beauty Tips</h3>
              <p className="text-gray-600 text-sm">Explore our complete collection of beauty guides and tutorials</p>
            </Link>
            <Link href="/" className="block p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Our Services</h3>
              <p className="text-gray-600 text-sm">Check out our complete range of beauty and salon services</p>
            </Link>
            <a href="/privacy" className="block p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Get In Touch</h3>
              <p className="text-gray-600 text-sm">Have questions? Our beauty experts are here to help you</p>
            </a>
          </div>
        </div>

        


      </div>
    </div>
  );
}