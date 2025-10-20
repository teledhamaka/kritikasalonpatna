'use client';

import { useState, useEffect, useCallback } from 'react';
import CommentForm from './CommentForm';

interface Comment {
  id: string;
  name: string;
  email?: string;
  comment: string;
  created_at: string;
  parent_id?: string;
  replies?: Comment[];
}

export default function CommentList({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/comments/${slug}`);
      
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      setComments(data.comments || []);
    } catch (err) {
      console.error('Error:', err);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this comment? 🗑️')) return;
    
    try {
      const response = await fetch(`/api/comments/${slug}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      
      if (response.ok) {
        fetchComments();
      }
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    if (diffMins < 10080) return `${Math.floor(diffMins / 1440)}d ago`;
    
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric',
      month: 'short'
    });
  };

  const renderComment = (comment: Comment, depth: number = 0) => (
    <div key={comment.id} className={depth > 0 ? 'ml-6 md:ml-10' : ''}>
      <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-pink-100 hover:shadow-md transition-shadow">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center text-white font-bold shadow-md">
              {comment.name.charAt(0).toUpperCase()}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">{comment.name}</h4>
                <p className="text-xs text-gray-500">{formatDate(comment.created_at)}</p>
              </div>
              <button 
                onClick={() => handleDelete(comment.id)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            
            <p className="text-gray-700 text-sm leading-relaxed mb-3">{comment.comment}</p>
            
            <button
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              className="text-pink-600 hover:text-pink-700 text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              {replyingTo === comment.id ? 'Cancel' : 'Reply'}
            </button>
          </div>
        </div>
        
        {replyingTo === comment.id && (
          <CommentForm
            slug={slug}
            parentId={comment.id}
            parentName={comment.name}
            onSuccess={() => {
              setReplyingTo(null);
              fetchComments();
            }}
            onCancel={() => setReplyingTo(null)}
          />
        )}
      </div>
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map(reply => renderComment(reply, depth + 1))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span>💬</span>
          <span>{comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}</span>
        </h3>
      </div>

      {comments.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border-2 border-dashed border-pink-200">
          <div className="text-5xl mb-3">💭</div>
          <h4 className="text-lg font-semibold text-gray-800 mb-1">No comments yet</h4>
          <p className="text-gray-600 text-sm">Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => renderComment(comment))}
        </div>
      )}
    </div>
  );
}