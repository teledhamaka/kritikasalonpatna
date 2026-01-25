'use client';

import { motion } from 'framer-motion';
import { Heart, Clock, Eye, Sparkles } from 'lucide-react';
//import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface BlogCardProps {
  post: {
    slug: string;
    title: string;
    excerpt: string;
    coverImage: string;
    category: { name: string; color: string };
    author: { name: string; avatar: string };
    readTime: number;
    views: number;
    likes: number;
    publishedAt: string;
    featured: boolean;
  };
}

export default function BlogCard({ post }: BlogCardProps) {
  const router = useRouter();
  
  // Safely handle undefined values
  const safePost = {
    slug: post?.slug || '',
    title: post?.title || 'Untitled Post',
    excerpt: post?.excerpt || '',
    coverImage: post?.coverImage || '/images/placeholder.jpg',
    category: post?.category || { name: 'General', color: '#ec4899' },
    author: post?.author || { name: 'Anonymous', avatar: '/images/default-avatar.jpg' },
    readTime: post?.readTime || 5,
    views: post?.views || 0,
    likes: post?.likes || 0,
    publishedAt: post?.publishedAt || new Date().toISOString(),
    featured: post?.featured || false
  };

  const handleCardClick = () => {
    router.push(`/blog/${safePost.slug}`);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-pink-200 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Featured Badge */}
      {safePost.featured && (
        <motion.div
          initial={{ rotate: -12 }}
          animate={{ rotate: 0 }}
          className="absolute top-4 right-4 z-10 bg-linear-to-r from-pink-500 to-rose-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1"
        >
          <Sparkles size={14} />
          TRENDING
        </motion.div>
      )}

      {/* Image Container with Overlay */}
      <div className="relative h-64 overflow-hidden bg-linear-to-br from-pink-100 to-purple-100">
        <Image
          src={safePost.coverImage}
          alt={safePost.title}
          width={600}
          height={400}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.src = '/images/all-services.webp';
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Category Badge on Image */}
        <div className="absolute bottom-4 left-4">
          <span 
            className="px-4 py-1.5 rounded-full text-xs font-semibold text-white backdrop-blur-md shadow-lg"
            style={{ backgroundColor: `${safePost.category.color}80` }}
          >
            {safePost.category.name}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Author & Date */}
        <div className="flex items-center gap-3 mb-4">
          <Image
            src={safePost.author.avatar}
            alt={safePost.author.name}
            width={40}
            height={40}
            className="rounded-full border-2 border-pink-200 object-cover"
            onError={(e) => {
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {safePost.author.name}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(safePost.publishedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-pink-600 transition-colors duration-300 leading-tight">
          {safePost.title}
        </h3>

        {/* Excerpt */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
          {safePost.excerpt}
        </p>

        {/* Stats Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock size={14} className="text-pink-500" />
              {safePost.readTime} min
            </span>
            <span className="flex items-center gap-1">
              <Eye size={14} className="text-purple-500" />
              {safePost.views.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Heart size={14} className="text-rose-500" />
              {safePost.likes}
            </span>
          </div>

          {/* Read More Button - Now just visual, entire card is clickable */}
          <div className="text-sm font-semibold text-pink-600 group-hover:text-pink-700 flex items-center gap-1 transition-colors duration-300">
            Read More
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-pink-100 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-2xl" />
      <div className="absolute -top-2 -left-2 w-24 h-24 bg-purple-100 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-2xl" />
    </motion.article>
  );
}