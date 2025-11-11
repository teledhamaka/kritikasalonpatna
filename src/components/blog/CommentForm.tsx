'use client';

import { useState } from 'react';

interface CommentFormProps {
  slug: string;
  parentId?: string;
  parentName?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CommentForm({ 
  slug, 
  parentId, 
  parentName,
  onSuccess,
  onCancel 
}: CommentFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug,
          name,
          email,
          comment,
          parent_id: parentId || null
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Comment posted! ✨');
        setName('');
        setEmail('');
        setComment('');
        
        if (onSuccess) {
          setTimeout(() => onSuccess(), 800);
        } else {
          setTimeout(() => window.location.reload(), 1000);
        }
      } else {
        setMessage(data.error || 'Error posting comment 😢');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      setMessage('Network error. Please try again! 🔄');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={parentId ? 'ml-8 md:ml-12 mt-4' : 'mt-6'}>
      {parentId && parentName && (
        <div className="mb-3 text-sm text-gray-600 flex items-center gap-2">
          <span>💬</span>
          <span>Replying to <strong className="text-pink-600">{parentName}</strong></span>
        </div>
      )}
      
      {message && (
        <div className={`mb-3 p-3 rounded-lg text-sm ${
          message.includes('posted') || message.includes('✨')
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Your Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all text-sm"
            required
            minLength={2}
            maxLength={100}
          />
          <input
            type="email"
            placeholder="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all text-sm"
          />
        </div>
        
        <textarea
          placeholder="Share your thoughts... ✨"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={parentId ? 3 : 4}
          className="w-full px-4 py-2.5 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all text-sm resize-none"
          required
          minLength={10}
          maxLength={1000}
        ></textarea>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {comment.length}/1000
          </span>
          <div className="flex gap-2">
            {parentId && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-linear-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold text-sm hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-md"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Posting...
                </span>
              ) : (
                <span>{parentId ? 'Reply 💬' : 'Post Comment ✨'}</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}