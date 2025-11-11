// ========================================
// components/blog/BookmarkButton.tsx
// ========================================
'use client';

import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';
//import { toggleBookmark } from '@/lib/supabase/bookmark';

export default function BookmarkButton({ 
  postSlug, 
  initialBookmarked = false 
}: { 
  postSlug: string; 
  initialBookmarked?: boolean;
}) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`/api/bookmarks/${postSlug}`, { 
        method: 'POST' 
      });
      
      if (response.ok) {
        setBookmarked(!bookmarked);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Bookmark error:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-all ${
        bookmarked
          ? 'bg-purple-500 text-white'
          : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
      }`}
    >
      <Bookmark size={18} fill={bookmarked ? 'white' : 'none'} />
      {loading ? 'Saving...' : bookmarked ? 'Saved' : 'Save'}
    </motion.button>
  );
}
