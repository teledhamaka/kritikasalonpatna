// ========================================
// components/admin/AnalyticsDashboard.tsx
// ========================================
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Eye, Heart, BarChart3, PieChart, Download } from 'lucide-react';
import Link from 'next/link';

interface Post {
  id: string;
  slug: string;
  title: string;
  views: number;
  likes: number;
  published_at: string;
  category: { name: string; color: string };
}

interface AnalyticsDashboardProps {
  posts: Post[];
  totalViews: number;
  totalLikes: number;
  categoryStats: Record<string, { views: number; posts: number; color: string }>;
}

export default function AnalyticsDashboard({ 
  posts, 
  totalViews, 
  totalLikes,
  categoryStats 
}: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');
  const [sortBy, setSortBy] = useState<'views' | 'likes'>('views');

  // Sort posts
  const sortedPosts = [...posts].sort((a, b) => 
    sortBy === 'views' ? b.views - a.views : b.likes - a.likes
  );

  // Top 5 posts
  const topPosts = sortedPosts.slice(0, 5);

  // Calculate engagement rate
  const engagementRate = totalViews > 0 
    ? ((totalLikes / totalViews) * 100).toFixed(2) 
    : '0';

  // Export data
  const exportCSV = () => {
    const csv = [
      ['Title', 'Slug', 'Views', 'Likes', 'Category', 'Published Date'],
      ...posts.map(p => [
        p.title,
        p.slug,
        p.views,
        p.likes,
        p.category.name,
        new Date(p.published_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blog-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50 via-purple-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/blog/admin" className="text-pink-600 hover:text-pink-700 mb-2 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Blog Analytics</h1>
            <p className="text-gray-600">Track your blog performance and insights</p>
          </div>
          <div className="flex gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-4 py-2 border-2 border-pink-200 rounded-xl focus:border-pink-500 outline-none"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="all">All time</option>
            </select>
            <button
              onClick={exportCSV}
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-semibold hover:bg-purple-200 transition-all flex items-center gap-2"
            >
              <Download size={18} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-semibold">Total Views</h3>
              <Eye className="text-blue-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalViews.toLocaleString()}</p>
            <p className="text-sm text-green-600 mt-2">+12% from last month</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border-2 border-pink-100"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-semibold">Total Likes</h3>
              <Heart className="text-pink-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalLikes}</p>
            <p className="text-sm text-green-600 mt-2">+8% from last month</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-100"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-semibold">Engagement Rate</h3>
              <TrendingUp className="text-purple-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{engagementRate}%</p>
            <p className="text-sm text-gray-500 mt-2">Likes per view</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-100"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-semibold">Avg. Views/Post</h3>
              <BarChart3 className="text-green-600" size={24} />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {posts.length > 0 ? Math.round(totalViews / posts.length) : 0}
            </p>
            <p className="text-sm text-gray-500 mt-2">Across {posts.length} posts</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Top Posts */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="text-pink-500" size={24} />
                Top Performing Posts
              </h2>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 border-2 border-pink-200 rounded-xl text-sm focus:border-pink-500 outline-none"
              >
                <option value="views">By Views</option>
                <option value="likes">By Likes</option>
              </select>
            </div>

            <div className="space-y-4">
              {topPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-linear-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <Link 
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="font-semibold text-gray-900 hover:text-pink-600 line-clamp-1 block"
                    >
                      {post.title}
                    </Link>
                    <p className="text-sm text-gray-500">
                      {new Date(post.published_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-blue-600">
                      <Eye size={16} />
                      {post.views.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 text-pink-600">
                      <Heart size={16} />
                      {post.likes}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <PieChart className="text-purple-500" size={24} />
              By Category
            </h2>

            <div className="space-y-4">
              {Object.entries(categoryStats).map(([name, stats], index) => {
                const percentage = totalViews > 0 
                  ? ((stats.views / totalViews) * 100).toFixed(1) 
                  : '0';

                return (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-gray-900">{name}</span>
                      <span className="text-gray-600">{percentage}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: stats.color }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{stats.posts} posts</span>
                      <span>{stats.views.toLocaleString()} views</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* All Posts Table */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">All Posts Performance</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Title</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Views</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Likes</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Engagement</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Published</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedPosts.map((post) => {
                  const engagement = post.views > 0 
                    ? ((post.likes / post.views) * 100).toFixed(1) 
                    : '0';

                  return (
                    <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="font-semibold text-gray-900 hover:text-pink-600"
                        >
                          {post.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span 
                          className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                          style={{ backgroundColor: post.category.color }}
                        >
                          {post.category.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">
                        {post.views.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-pink-600">
                        {post.likes}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-600">
                        {engagement}%
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(post.published_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
