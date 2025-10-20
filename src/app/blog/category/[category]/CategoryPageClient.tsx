// app/blog/category/[category]/CategoryPageClient.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import BlogList from '@/components/blog/BlogList';
import blogData from '../../blogData.json';
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

interface CategoryPageClientProps {
  category: {
    id: string;
    name: string;
    icon: string;
    description?: string;
  };
  posts: RawPost[];
}

export default function CategoryPageClient({ category, posts }: CategoryPageClientProps) {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const loadedPosts = await Promise.all(
          posts.map(async (post) => {
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
        
        // Sort by date
        loadedPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setBlogPosts(loadedPosts);
      } catch (error) {
        console.error('Failed to load posts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [posts]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-pink-500 mb-3"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        {/* Back Link */}
        <Link 
          href="/blog" 
          className="inline-flex items-center text-pink-600 hover:text-pink-700 mb-6 font-medium"
        >
          ← Back to Blog
        </Link>

        {/* Category Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">{category.icon}</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{category.description}</p>
          )}
          <p className="text-gray-500 mt-4">{blogPosts.length} articles</p>
        </div>

        {/* Posts */}
        {blogPosts.length > 0 ? (
          <BlogList posts={blogPosts} />
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="text-5xl mb-3">📝</div>
            <p className="text-gray-600 text-lg">No articles in this category yet</p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Ready For A Makeover? 💅
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Book your appointment at Patna&apos;s best beauty salon
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              href="/booking" 
              className="px-6 py-3 bg-white text-pink-600 rounded-full font-bold hover:shadow-xl transition-all"
            >
              Book Now
            </Link>
            <a 
              href="tel:+91-9650461390" 
              className="px-6 py-3 bg-transparent border-2 border-white rounded-full font-bold hover:bg-white hover:text-pink-600 transition-all"
            >
              📞 Call Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}