// app/blog/page.tsx - FIXED VERSION
import { createServerClient } from '@/lib/supabase/server';
import BlogCard from '@/components/blog/BlogCard';
import SearchBar from '@/components/blog/SearchBar';
//import { notFound } from 'next/navigation';
import MobileBottomNav from '@/components/MobileBottomNav';

// ✅ ISR: Revalidate every 1 hour
export const revalidate = 3600;

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
  focus_keyphrase?: string;
  seo_keywords?: string[];
  canonical_url?: string;
  category: {
    id: string;
    name: string;
    slug: string;
    color: string;
    icon: string;
  } | null; // ✅ Allow null
  author: {
    id: string;
    name: string;
    avatar_url: string;
    bio: string;
  } | null; // ✅ Allow null
}

async function getBlogPosts(): Promise<BlogPost[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      id,
      slug,
      title,
      excerpt,
      content,
      cover_image,
      read_time,
      views,
      likes,
      published_at,
      featured,
      tags,
      focus_keyphrase,
      seo_keywords,
      canonical_url,
      category:categories(id, name, slug, color, icon),
      author:authors(id, name, avatar_url, bio)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }

  console.log('📊 Total posts:', data?.length);
  
  // ✅ Safe mapping with null checks
  const posts = (data || []).map(post => {
    const category = Array.isArray(post.category) ? post.category[0] : post.category;
    const author = Array.isArray(post.author) ? post.author[0] : post.author;
    
    // ✅ Provide fallbacks for null values
    return {
      ...post,
      category: category || { 
        id: 'default', 
        name: 'General', 
        slug: 'general', 
        color: '#ec4899', 
        icon: '📝' 
      },
      author: author || { 
        id: 'default', 
        name: 'Team', 
        avatar_url: '/images/all-services.webp', 
        bio: 'Beauty Expert' 
      },
    };
  });

  console.log('📝 Posts loaded:', posts.length);
  return posts;
}

async function getCategories() {
  const supabase = await createServerClient();
  
  const { data } = await supabase
    .from('categories')
    .select('id, name, slug, icon, color')
    .order('name');
  
  return data || [];
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const params = await searchParams;
  const posts = await getBlogPosts();
  const categories = await getCategories();

  // Filter by category
  let filteredPosts = posts;
  if (params.category) {
    filteredPosts = posts.filter(
      (post) => post.category?.slug === params.category?.toLowerCase()
    );
  }

  // Filter by search
  if (params.search) {
    const query = params.search.toLowerCase();
    filteredPosts = filteredPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  }

  // Separate featured posts
  const featuredPosts = filteredPosts.filter((p) => p.featured);
  const regularPosts = filteredPosts.filter((p) => !p.featured);

  // ✅ Safe data transformation for BlogCard
  const transformPostForCard = (post: BlogPost) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    coverImage: post.cover_image || '/images/all-services.webp',
    category: {
      name: post.category?.name || 'General',
      color: post.category?.color || '#ec4899'
    },
    author: {
      name: post.author?.name || 'Team',
      avatar: post.author?.avatar_url || '/images/all-services.webp'
    },
    readTime: post.read_time || 5,
    views: post.views || 0,
    likes: post.likes || 0,
    publishedAt: post.published_at,
    featured: post.featured || false
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        
        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg mb-6 border border-pink-200">
            <span className="text-xl">💖</span>
            <span className="text-sm font-semibold text-gray-700">
              Bhootnath Road, Patna
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-linear-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            ✨ Beauty & You ✨
          </h1>

          <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-8">Your trusted friend for beauty secrets, trends, and expert advice from Patna&apos;s favorite salon
          </p>

          {/* Trust Pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: '⭐', text: '4.9/5 Rating' },
              { icon: '❤️', text: '10K+ Happy Clients' },
              { icon: '👑', text: 'Expert Team' },
              { icon: '💎', text: 'Premium Quality' },
            ].map((item) => (
              <span
                key={item.text}
                className="px-4 py-2 bg-white rounded-full border border-pink-200 text-sm font-medium flex items-center gap-2"
              >
                <span className="text-lg">{item.icon}</span>
                {item.text}
              </span>
            ))}
          </div>
        </section>

        {/* Search Bar */}
        <div className="mb-12 bg-white rounded-3xl shadow-2xl p-6 border border-pink-100 max-w-2xl mx-auto">
          <SearchBar />
          <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
            <span>
              <strong className="text-pink-600 text-lg">{filteredPosts.length}</strong>{' '}
              beauty articles
            </span>
            <span className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Fresh Content Daily
            </span>
          </div>
        </div>

        {/* Categories Filter */}
        <div className="mb-8 flex flex-wrap gap-2 justify-center">
          <button
            className="px-4 py-2 bg-pink-500 text-white rounded-full text-sm font-medium hover:bg-pink-600 transition-colors"
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              className="px-4 py-2 bg-white border border-pink-200 rounded-full text-sm font-medium hover:bg-pink-50 transition-colors flex items-center gap-2"
            >
              <span>{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="mb-16">
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-pink-500 to-purple-500 text-white rounded-full text-sm font-bold">
                <span className="text-lg">🔥</span>
                TRENDING NOW - MUST READ!
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.map((post) => (
                <BlogCard 
                  key={post.id} 
                  post={transformPostForCard(post)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Regular Posts */}
        {regularPosts.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold mb-8 text-gray-800">
              Latest Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map((post) => (
                <BlogCard 
                  key={post.id} 
                  post={transformPostForCard(post)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl shadow-xl">
            <div className="text-6xl mb-4">😔</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              No articles found
            </h3>
            <p className="text-gray-500">Try different keywords or browse our categories
            </p>
          </div>
        )}

        {/* CTA Section */}
        <section className="mt-20 bg-linear-to-r from-pink-500 via-purple-500 to-blue-500 rounded-3xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready For Your Glow Up? ✨</h2>
          <p className="text-xl mb-8 opacity-95">Visit Patna&apos;s most trusted ladies salon for an unforgettable beauty experience
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/booking"
              className="px-8 py-4 bg-white text-pink-600 rounded-full font-bold hover:shadow-2xl transition-all text-lg flex items-center justify-center gap-2"
            >
              <span>💖</span>
              Book Your Appointment
            </a>
            <a
              href="tel:+91-9650461390"
              className="px-8 py-4 bg-transparent border-2 border-white rounded-full font-bold hover:bg-white hover:text-pink-600 transition-all text-lg flex items-center justify-center gap-2"
            >
              <span>📞</span>
              Call Us Now
            </a>
          </div>
        </section>

        <MobileBottomNav />


      </div>
    </div>
  );
}

// Metadata for SEO
export const metadata = {
  title: 'Beauty Blog - Expert Tips & Trends | Patna Salon',
  description: 'Latest beauty tips, hair care, makeup tutorials and wellness advice from Patna\'s favorite salon',
  keywords: 'beauty blog patna, hair care tips, makeup tutorials, skin care, bridal beauty',
};