// ========================================
// components/blog/CommentsSection.tsx
// ========================================
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Heart, Reply, Send, User, Loader } from 'lucide-react';
import { createClientSupabase } from '@/lib/supabase/client';

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
  likes: number;
  replies?: Comment[];
}

interface CommentsSectionProps {
  postId: string;
}

export default function CommentsSection({ postId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    content: '',
  });

  useEffect(() => {
    loadComments();
    
    // Load liked comments from localStorage
    const liked = localStorage.getItem(`liked_comments_${postId}`);
    if (liked) {
      setLikedComments(new Set(JSON.parse(liked)));
    }
  }, [postId]);

  const loadComments = async () => {
    try {
      const supabase = createClientSupabase();
      
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .eq('status', 'approved')
        .is('parent_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Load replies for each comment
      const commentsWithReplies = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: replies } = await supabase
            .from('comments')
            .select('*')
            .eq('parent_id', comment.id)
            .eq('status', 'approved')
            .order('created_at', { ascending: true });

          return { ...comment, replies: replies || [] };
        })
      );

      setComments(commentsWithReplies);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content.trim()) return;

    setSubmitting(true);

    try {
      const supabase = createClientSupabase();

      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          parent_id: replyTo,
          author_name: formData.name || 'Anonymous',
          author_email: formData.email,
          content: formData.content,
          status: 'approved', // Auto-approve (or set to 'pending' for moderation)
        });

      if (error) throw error;

      // Reset form
      setFormData({ name: '', email: '', content: '' });
      setReplyTo(null);

      // Reload comments
      await loadComments();
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Error posting comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLike = async (commentId: string) => {
    const supabase = createClientSupabase();
    const newLiked = new Set(likedComments);

    if (newLiked.has(commentId)) {
      newLiked.delete(commentId);
      await supabase.rpc('decrement_comment_likes', { comment_id: commentId });
    } else {
      newLiked.add(commentId);
      await supabase.rpc('increment_comment_likes', { comment_id: commentId });
    }

    setLikedComments(newLiked);
    localStorage.setItem(`liked_comments_${postId}`, JSON.stringify([...newLiked]));

    // Update local state
    setComments(comments.map(c => {
      if (c.id === commentId) {
        return { ...c, likes: c.likes + (newLiked.has(commentId) ? 1 : -1) };
      }
      if (c.replies) {
        return {
          ...c,
          replies: c.replies.map(r => 
            r.id === commentId 
              ? { ...r, likes: r.likes + (newLiked.has(commentId) ? 1 : -1) }
              : r
          )
        };
      }
      return c;
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <motion.div
      key={comment.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isReply ? 'ml-12' : ''}`}
    >
      <div className={`p-6 rounded-2xl transition-all ${
        isReply 
          ? 'bg-purple-50 border-l-4 border-purple-300' 
          : 'bg-white shadow-lg hover:shadow-xl'
      }`}>
        
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-linear-to-br from-pink-400 to-purple-400 flex items-center justify-center text-white font-bold shadow-lg shrink-0">
            <User size={20} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-bold text-gray-900">{comment.author_name}</h4>
              <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
            </div>
            <p className="text-gray-700 leading-relaxed">{comment.content}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 ml-16">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => toggleLike(comment.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
              likedComments.has(comment.id)
                ? 'bg-pink-500 text-white'
                : 'bg-pink-50 text-pink-600 hover:bg-pink-100'
            }`}
          >
            <Heart size={14} fill={likedComments.has(comment.id) ? 'white' : 'none'} />
            {comment.likes}
          </motion.button>

          {!isReply && (
            <button
              onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-purple-50 text-purple-600 hover:bg-purple-100 transition-all"
            >
              <Reply size={14} />
              Reply
            </button>
          )}
        </div>

        {/* Reply Form */}
        <AnimatePresence>
          {replyTo === comment.id && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 ml-16"
            >
              <div className="flex gap-3">
                <input
                  type="text"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write a reply..."
                  className="flex-1 px-4 py-2 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !formData.content.trim()}
                  className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Render Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 mt-12">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <MessageCircle className="text-pink-500" size={28} />
          Comments ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      <div className="mb-8">
        <div className="flex gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-linear-to-br from-pink-400 to-purple-400 flex items-center justify-center text-white font-bold shadow-lg shrink-0">
            <User size={20} />
          </div>
          <div className="flex-1 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name (optional)"
                className="px-4 py-2 border-2 border-pink-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
              />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Email (optional)"
                className="px-4 py-2 border-2 border-pink-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
              />
            </div>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Share your thoughts... (Hindi/English dono mein likh sakte hain)"
              rows={3}
              className="w-full px-4 py-3 border-2 border-pink-200 rounded-2xl focus:border-pink-500 focus:ring-4 focus:ring-pink-100 outline-none resize-none transition-all"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Be kind and respectful ❤️
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={submitting || !formData.content.trim()}
                className="px-6 py-2.5 bg-linear-to-r from-pink-500 to-purple-500 text-white rounded-full font-semibold hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Post Comment
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-12">
          <Loader size={32} className="animate-spin text-pink-500 mx-auto" />
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map(comment => renderComment(comment))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageCircle size={48} className="mx-auto text-gray-300 mb-4" />
          <h4 className="text-xl font-bold text-gray-700 mb-2">No comments yet</h4>
          <p className="text-gray-500">Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  );
}
