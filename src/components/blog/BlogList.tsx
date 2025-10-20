// src/components/blog/BlogList.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  coverImage: string;
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
}

// Icon components
const SearchIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

// const CalendarIcon = ({ className }: { className?: string }) => (
//   <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//     <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//   </svg>
// );

// const ClockIcon = ({ className }: { className?: string }) => (
//   <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//     <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//   </svg>
// );

export default function BlogList({ posts, showSearch = false, title, subtitle }: BlogListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>(posts);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOption, setSortOption] = useState('newest');
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  
  // Extract unique categories from posts
  const categories = ['all', ...new Set(posts.map(post => post.category))];
  
  const handleImageError = (slug: string) => {
    setImageErrors(prev => ({ ...prev, [slug]: true }));
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'hair-care': 'from-pink-400 to-rose-500',
      'makeup': 'from-purple-400 to-pink-500',
      'skin-care': 'from-blue-400 to-purple-500',
      'bridal': 'from-rose-400 to-pink-500',
      'nail-art': 'from-red-400 to-pink-500',
      'spa-wellness': 'from-teal-400 to-blue-500',
      'fashion-trends': 'from-indigo-400 to-purple-500',
      'health-tips': 'from-green-400 to-teal-500'
    };
    return colors[category] || 'from-gray-400 to-gray-500';
  };

  const getCategoryEmoji = (category: string) => {
    const emojis: Record<string, string> = {
      'hair-care': '💇‍♀️',
      'makeup': '💄',
      'skin-care': '✨',
      'bridal': '👰',
      'nail-art': '💅',
      'spa-wellness': '🧖‍♀️',
      'fashion-trends': '👗',
      'health-tips': '🏥'
    };
    return emojis[category] || '📝';
  };

  // Filter and sort posts
  useEffect(() => {
    let result = [...posts];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(post => 
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.content?.toLowerCase().includes(query) ||
        post.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        post.category.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      result = result.filter(post => post.category === selectedCategory);
    }
    
    // Apply sorting
    if (sortOption === 'newest') {
      result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortOption === 'oldest') {
      result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortOption === 'popular') {
      // In a real app, you would sort by views or engagement metrics
      result.sort(() => Math.random() - 0.5); // Randomize for demo
    }
    
    setFilteredPosts(result);
  }, [posts, searchQuery, selectedCategory, sortOption]);
  
  // Format date without date-fns
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Calculate read time
  // const calculateReadTime = (content: string = '') => {
  //   const wordsPerMinute = 200;
  //   const wordCount = content.split(/\s+/).length;
  //   return Math.ceil(wordCount / wordsPerMinute);
  // };

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl shadow-lg">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">No Articles Yet</h3>
        <p className="text-gray-600">Check back soon for amazing beauty tips!</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && (
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{title}</h1>
          {subtitle && <p className="text-gray-600 max-w-2xl mx-auto">{subtitle}</p>}
        </div>
      )}
      
      {showSearch && (
        <div className="mb-10">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <SearchIcon className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
        </div>
      )}
      
      {/* Filters */}
      <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? 'All' : category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </button>
          ))}
        </div>
        
        <div className="flex items-center">
          <label htmlFor="sort" className="text-gray-600 mr-2 text-sm">Sort by:</label>
          <select
            id="sort"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>
      
      {/* Results info */}
      <div className="mb-6 flex justify-between items-center">
        <p className="text-gray-600">
          Showing {filteredPosts.length} of {posts.length} articles
        </p>
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="text-pink-600 hover:underline text-sm"
          >
            Clear search
          </button>
        )}
      </div>

      {/* Blog posts grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filteredPosts.map((post, index) => (
            <article 
              key={post.slug}
              className="group bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-pink-200"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Featured Badge */}
              {post.featured && (
                <div className="absolute top-4 left-4 z-10 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                  🔥 TRENDING
                </div>
              )}

              {/* Cover Image */}
              <Link href={`/blog/${post.slug}`}>
                <div className="relative h-64 bg-gradient-to-br from-pink-100 to-purple-100 overflow-hidden">
                  {!imageErrors[post.slug] ? (
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="group-hover:scale-110 transition-transform duration-500"
                      onError={() => handleImageError(post.slug)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl">{getCategoryEmoji(post.category)}</span>
                    </div>
                  )}
                </div>
              </Link>

              {/* Content */}
              <div className="p-6">
                {/* Category */}
                <div className="mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getCategoryColor(post.category)} text-white`}>
                    <span className="mr-1">{getCategoryEmoji(post.category)}</span>
                    {post.category.replace('-', ' ').toUpperCase()}
                  </span>
                </div>

                {/* Title */}
                <Link href={`/blog/${post.slug}`}>
                  <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-pink-600 transition-colors duration-300 line-clamp-2">
                    {post.title}
                  </h3>
                </Link>

                {/* Excerpt */}
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.slice(0, 3).map(tag => (
                      <span 
                        key={tag} 
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Meta Info */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {post.author.name.charAt(0)}
                      </div>
                      <span className="text-sm text-gray-600">{post.author.name}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{formatDate(post.date)}</span>
                    {post.readTime && (
                      <span>• {post.readTime} min read</span>
                    )}
                  </div>
                </div>
              </div>
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
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="mt-6 bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>	
      )}
    </div>
  );
}