// src/components/blog/BlogList.tsx
'use client';

//import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  coverImage: string; // Ensure this is not optional
  category: string;
  author: {
    name: string;
    avatar: string;
  };
  tags?: string[];
  content?: string;
  featured?: boolean;
  readTime?: number;
}

interface BlogListProps {
  posts: BlogPost[];
  showSearch?: boolean;
  title?: string;
  subtitle?: string;
  searchQuery?: string; // Added to handle the prop in the error block
  setSelectedCategory?: (category: string) => void; // Added to handle the prop in the error block
}

// Icon components
const SearchIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

// Helper function to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function BlogList({ posts, title, subtitle, searchQuery, setSelectedCategory }: BlogListProps) {

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {title && (
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-2">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="text-xl text-gray-600 text-center mb-8">
            {subtitle}
          </p>
        )}

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article
                key={post.slug}
                className={`bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden ${
                  post.featured ? 'md:col-span-2' : 'col-span-1'
                }`}
              >
                <Link href={`/blog/${post.slug}`} className="block">
                  {/* Image Display Block - MODIFIED BLOCK */}
                  <div className="relative w-full h-56"> 
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                      priority={post.featured} // Priority for featured articles
                    />
                  </div>

                  <div className="p-6">
                    <span className="text-xs font-bold uppercase text-pink-600">
                      {post.category}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 mt-2 hover:text-pink-700 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mt-3 line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative w-8 h-8">
                          <Image
                            src={post.author.avatar}
                            alt={post.author.name}
                            fill
                            className="rounded-full object-cover"
                          />
                        </div>
                        <span className="text-sm text-gray-600">{post.author.name}</span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{formatDate(post.date)}</span>
                        {post.readTime && (
                          <span>• {post.readTime} min read</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <SearchIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No articles found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {searchQuery 
                ? `We couldn't find any articles matching "${searchQuery}".` 
                : "No articles match the selected filters."}
            </p>
            <button 
              onClick={() => {
                // Assuming these functions are passed via props or defined externally if needed
                if (setSelectedCategory) setSelectedCategory('all');
                // You might need a way to clear the searchQuery state, but it's not defined here.
                // Assuming an external state setter would be used.
              }}
              className="mt-6 bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors duration-300 font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}