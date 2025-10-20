// app/blog/[slug]/BlogPostClient.tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface BlogPostProps {
  post: {
    slug: string;
    title: string;
    excerpt: string;
    date: string;
    coverImage?: string;
    category?: string;
    author: {
      name: string;
      avatar: string;
      bio?: string;
    };
    tags?: string[];
    contentHtml: string;
    readTime?: number;
  };
}

export default function BlogPostClient({ post }: BlogPostProps) {
  useEffect(() => {
    // Track view count
    fetch(`/api/views/${post.slug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).catch(err => console.error('View count error:', err));
  }, [post.slug]);

  return (
    <article className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Link */}
        <Link 
          href="/blog" 
          className="inline-flex items-center text-pink-600 hover:text-pink-700 mb-6 font-medium"
        >
          ← Back to Blog
        </Link>

        {/* Header */}
        <header className="mb-8">
          {post.category && (
            <Link 
              href={`/blog/category/${post.category}`}
              className="inline-block mb-4 px-4 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium hover:bg-pink-200"
            >
              {post.category}
            </Link>
          )}
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            {post.title}
          </h1>
          
          <p className="text-xl text-gray-600 mb-6">{post.excerpt}</p>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="font-medium">{post.author.name}</span>
            </div>
            <span>•</span>
            <time>{new Date(post.date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}</time>
            {post.readTime && (
              <>
                <span>•</span>
                <span>{post.readTime} min read</span>
              </>
            )}
          </div>
        </header>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="mb-8 rounded-2xl overflow-hidden shadow-xl">
            <Image
              src={post.coverImage}
              alt={post.title}
              width={1200}
              height={600}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div 
          className="prose prose-lg prose-pink max-w-none mb-8 bg-white rounded-2xl p-8 shadow-lg"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map(tag => (
              <span 
                key={tag}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Author Bio */}
        {post.author.bio && (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={80}
                height={80}
                className="rounded-full"
              />
              <div>
                <h3 className="text-xl font-bold mb-2">About {post.author.name}</h3>
                <p className="text-gray-600">{post.author.bio}</p>
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Ready to Transform Your Look?
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Book your appointment at Patna&apos;s best beauty salon
          </p>
          <Link 
            href="/booking"
            className="inline-block px-8 py-3 bg-white text-pink-600 rounded-full font-bold hover:shadow-xl transition-all"
          >
            Book Now
          </Link>
        </div>
      </div>
    </article>
  );
}