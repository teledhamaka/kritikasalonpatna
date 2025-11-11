// ========================================
// Usage in CreatePostForm / EditPostForm
// ========================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';
//import { motion } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const SimpleMDE = dynamic(() => import('react-simplemde-editor'), { ssr: false });
import 'easymde/dist/easymde.min.css';

interface CreatePostFormProps {
  categories: Array<{ id: string; name: string; slug: string }>;
  authors: Array<{ id: string; name: string; slug: string }>;
}

export default function CreatePostForm({ categories, authors }: CreatePostFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  // FIX: Define formData state
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    coverImage: '',
    categoryId: '',
    authorId: authors[0]?.id || '',
    tags: '',
    featured: false,
    status: 'draft' as 'draft' | 'published' | 'archived',
    metaTitle: '',
    metaDescription: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/blog/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Post created successfully!');
        await fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: '/blog' })
        });
        setTimeout(() => {
          router.push(`/blog/${data.data.slug}`);
        }, 1500);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Error creating post');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <Link 
              href="/blog/admin" 
              className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 mb-3"
            >
              <ArrowLeft size={20} />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Create New Blog Post</h1>
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-3 bg-linear-to-r from-pink-500 to-purple-500 text-white rounded-full font-semibold hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Post'}
          </button>
        </div>
        {message && (
          <div className={`mt-4 p-4 rounded-xl ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </div>
        )}
      </div>

      {/* Rest of the form... */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Bridal Makeup Complete Guide 2025..."
              required
              className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all text-lg"
            />
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Excerpt *</label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              placeholder="Short description..."
              required
              rows={3}
              className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all resize-none"
            />
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Content *</label>
            <SimpleMDE
              value={formData.content}
              onChange={(value) => setFormData({ ...formData, content: value })}
              options={{
                spellChecker: false,
                placeholder: 'Write your blog content here...',
                minHeight: '400px',
              }}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Settings</h3>
            <div className="space-y-4">
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2 border-2 border-pink-200 rounded-xl"
              >
                <option value="draft">📝 Draft</option>
                <option value="published">✅ Published</option>
              </select>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-5 h-5"
                />
                <span>Featured Post ⭐</span>
              </label>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              required
              className="w-full px-4 py-2 border-2 border-pink-200 rounded-xl"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </>
  );
}
