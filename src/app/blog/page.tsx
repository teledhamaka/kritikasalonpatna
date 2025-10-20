// app/blog/page.tsx - MOBILE OPTIMIZED
'use client';

import { useSearchParams } from 'next/navigation';
import BlogList from '@/components/blog/BlogList';
import Pagination from '@/components/blog/Pagination';
import SearchBar from '@/components/blog/SearchBar';
import { categories } from '../../lib/categories';
import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import blogData from './blogData.json';
import matter from 'gray-matter';

interface Author {
  name: string;
  avatar: string;
  bio?: string;
}

interface BlogPostMetadata {
  title: string;
  excerpt: string;
  date: string;
  coverImage: string;
  category: string;
  author: string;
  tags: string[];
  featured?: boolean;
  readTime?: number;
}

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  coverImage: string;
  category: string;
  author: Author;
  tags: string[];
  content: string;
  featured?: boolean;
  readTime?: number;
}

interface RawPost {
  slug: string;
  metadata: BlogPostMetadata;
  filePath: string;
}

function getPaginatedPosts(posts: BlogPost[], page: number, perPage: number, category?: string, search?: string) {
  let filtered = category ? posts.filter(p => p.category === category) : posts;

  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(p => 
      p.title.toLowerCase().includes(s) ||
      p.excerpt.toLowerCase().includes(s) ||
      p.tags.some(t => t.toLowerCase().includes(s))
    );
  }

  filtered.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / perPage);
  const start = (page - 1) * perPage;

  return {
    posts: filtered.slice(start, start + perPage),
    total,
    totalPages,
    currentPage: page
  };
}

export default function BlogPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <BlogContent />
    </Suspense>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-pink-500 mb-3"></div>
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}

function BlogContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<{
    posts: BlogPost[];
    total: number;
    totalPages: number;
    currentPage: number;
  } | null>(null);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  
  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || undefined;

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const posts = await Promise.all(
          (blogData.posts as RawPost[]).map(async (post) => {
            const response = await fetch(post.filePath);
            const content = await response.text();
            const parsed = matter(content);
            const author = blogData.authors[post.metadata.author as keyof typeof blogData.authors];
            
            return {
              slug: post.slug,
              title: post.metadata.title,
              excerpt: post.metadata.excerpt,
              date: post.metadata.date,
              coverImage: post.metadata.coverImage,
              category: post.metadata.category,
              author: { name: author.name, avatar: author.avatar },
              tags: post.metadata.tags,
              content: parsed.content,
              featured: post.metadata.featured || false,
              readTime: post.metadata.readTime || 5
            };
          })
        );
        
        setAllPosts(posts);
      } catch (error) {
        console.error('Failed to load posts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  useEffect(() => {
    if (allPosts.length > 0) {
      setData(getPaginatedPosts(allPosts, page, 6, category, search));
    } else if (!loading) {
      setData({ posts: [], total: 0, totalPages: 0, currentPage: 1 });
    }
  }, [allPosts, page, search, category, loading]);

  if (loading) return <LoadingState />;

  const { posts, total, totalPages, currentPage } = data || { posts: [], total: 0, totalPages: 0, currentPage: 1 };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-6">
        {/* Compact Hero - Mobile Optimized */}
        <section className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md mb-4 border border-pink-200">
            <span className="text-lg">📍</span>
            <span className="text-xs font-semibold text-gray-700">
              Bhootnath Road, Patna
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            ✨ Beauty Hub ✨
          </h1>
          
          <p className="text-sm md:text-lg text-gray-700 max-w-2xl mx-auto mb-4">
            Latest beauty tips &amp; trends from Patna&apos;s top salon
          </p>

          {/* Trust Pills - Compact */}
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            {[
              { icon: '⭐', text: '4.9/5' },
              { icon: '❤️', text: '10K+ Clients' },
              { icon: '👑', text: 'Expert Team' }
            ].map((item) => (
              <span 
                key={item.text}
                className="px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full border border-pink-200"
              >
                {item.icon} {item.text}
              </span>
            ))}
          </div>
        </section>

        {/* Search Bar - Compact */}
        <div className="mb-6 bg-white rounded-2xl shadow-lg p-4 border border-pink-100">
          <SearchBar initialValue={search} />
          <div className="flex items-center justify-between mt-3 text-xs text-gray-600">
            <span>🔍 <strong className="text-pink-600">{total}</strong> articles</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Updated Daily
            </span>
          </div>
        </div>

        {/* Featured Badge */}
        {posts.length > 0 && posts[0].featured && (
          <div className="text-center mb-4">
            <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full text-xs font-bold shadow-md">
              🔥 TRENDING
            </span>
          </div>
        )}

        {/* Blog List */}
        {posts.length > 0 ? (
          <BlogList posts={posts} />
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="text-5xl mb-3">😔</div>
            <p className="text-gray-600 text-lg mb-1">No articles found</p>
            <p className="text-gray-400 text-sm">Try different keywords</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination 
              totalPages={totalPages} 
              currentPage={currentPage}
              searchQuery={search}
              category={category}
            />
          </div>
        )}

        {/* Categories - Compact Grid */}
        <section className="mt-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Explore Topics
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {categories.map(cat => {
              const count = allPosts.filter(p => p.category === cat.id).length;
              
              return (
                <Link key={cat.id} href={`/blog/category/${cat.id}`}>
                  <div className="group bg-white rounded-xl p-4 text-center hover:shadow-xl transition-all border-2 border-transparent hover:border-pink-300 transform hover:-translate-y-1">
                    <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform">
                      {cat.icon}
                    </div>
                    <h3 className="text-sm md:text-base font-bold text-gray-800 group-hover:text-pink-600 mb-1">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-gray-600">{count} posts</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* CTA Section - Compact */}
        <section className="mt-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl p-6 md:p-8 text-center text-white shadow-xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Ready For A Makeover? 💅
          </h2>
          <p className="text-sm md:text-lg mb-5 opacity-90">
            Visit Patna&apos;s best ladies salon
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              href="/booking" 
              className="px-6 py-3 bg-white text-pink-600 rounded-full font-bold hover:shadow-xl transition-all text-sm"
            >
              Book Now
            </Link>
            <a 
              href="tel:+91-9650461390" 
              className="px-6 py-3 bg-transparent border-2 border-white rounded-full font-bold hover:bg-white hover:text-pink-600 transition-all text-sm"
            >
              📞 Call Us
            </a>
          </div>
        </section>

        {/* Social Proof - Compact */}
        <section className="mt-10 text-center">
          <h3 className="text-lg font-bold mb-4 text-gray-800">
            Follow Us 📱
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: '📘', name: 'Facebook', count: '50K+' },
              { icon: '📷', name: 'Instagram', count: '100K+' },
              { icon: '▶️', name: 'YouTube', count: '25K+' },
              { icon: '📌', name: 'Pinterest', count: '30K+' }
            ].map((social) => (
              <div 
                key={social.name}
                className="bg-white rounded-xl p-3 shadow-md hover:shadow-lg transition-shadow border border-pink-100"
              >
                <div className="text-2xl mb-1">{social.icon}</div>
                <div className="text-xs font-bold text-pink-600">{social.count}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}