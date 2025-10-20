// components/blog/EngagementMetrics.tsx
'use client';

import { useState, useEffect } from 'react';

interface EngagementMetricsProps {
  slug: string;
}

export default function EngagementMetrics({ slug }: EngagementMetricsProps) {
  const [metrics, setMetrics] = useState({ views: 0, likes: 0, shares: 0 });
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch current metrics
    fetchMetrics();
    
    // Track page view
    trackView();
    
    // Check if user already liked (from localStorage)
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
    setLiked(likedPosts.includes(slug));
  }, [slug]);

  const fetchMetrics = async () => {
    try {
      const response = await fetch(`/api/analytics/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.analytics);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackView = async () => {
    try {
      await fetch(`/api/analytics/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'view' }),
      });
    } catch (error) {
      console.error('Failed to track view:', error);
    }
  };

  const handleLike = async () => {
    if (liked) return; // Already liked

    try {
      const response = await fetch(`/api/analytics/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like' }),
      });

      if (response.ok) {
        const data = await response.json();
        setMetrics(data.analytics);
        setLiked(true);
        
        // Save to localStorage
        const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
        likedPosts.push(slug);
        localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
      }
    } catch (error) {
      console.error('Failed to like:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center gap-4 py-4">
        <div className="animate-pulse bg-gray-200 h-10 w-24 rounded-full"></div>
        <div className="animate-pulse bg-gray-200 h-10 w-24 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-3 md:gap-4 py-4">
      {/* Views */}
      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-50 rounded-full border border-blue-200">
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span className="text-sm font-semibold text-blue-700">{metrics.views}</span>
        <span className="text-xs text-blue-600 hidden sm:inline">views</span>
      </div>

      {/* Likes */}
      <button
        onClick={handleLike}
        disabled={liked}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all transform ${
          liked
            ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white border-transparent shadow-lg scale-105'
            : 'bg-gradient-to-r from-red-100 to-pink-50 border-red-200 hover:shadow-md hover:scale-105'
        } ${liked ? 'cursor-default' : 'cursor-pointer'}`}
        title={liked ? 'Already liked' : 'Like this post'}
      >
        <svg 
          className={`w-5 h-5 ${liked ? 'text-white' : 'text-red-600'}`} 
          fill={liked ? 'currentColor' : 'none'} 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <span className={`text-sm font-semibold ${liked ? 'text-white' : 'text-red-700'}`}>
          {metrics.likes}
        </span>
        <span className={`text-xs hidden sm:inline ${liked ? 'text-white' : 'text-red-600'}`}>
          {liked ? 'liked' : 'likes'}
        </span>
      </button>

      {/* Shares */}
      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-green-50 rounded-full border border-green-200">
        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        <span className="text-sm font-semibold text-green-700">{metrics.shares}</span>
        <span className="text-xs text-green-600 hidden sm:inline">shares</span>
      </div>
    </div>
  );
}