// ========================================
// components/admin/EditPostForm.tsx
// ========================================
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Eye, Trash2, ArrowLeft } from 'lucide-react';
//import { motion } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const SimpleMDE = dynamic(() => import('react-simplemde-editor'), { ssr: false });
import 'easymde/dist/easymde.min.css';

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category: { id: string; name: string };
  author: { id: string; name: string };
  tags: string[];
  featured: boolean;
  status: string;
  meta_title: string;
  meta_description: string;
}

interface EditPostFormProps {
  post: Post;
  categories: Array<{ id: string; name: string; slug: string }>;
  authors: Array<{ id: string; name: string; slug: string }>;
}

export default function EditPostForm({ post, categories, authors }: EditPostFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    coverImage: post.cover_image,
    categoryId: post.category.id,
    authorId: post.author.id,
    tags: post.tags.join(', '),
    featured: post.featured,
    status: post.status as 'draft' | 'published' | 'archived',
    metaTitle: post.meta_title,
    metaDescription: post.meta_description,
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch(`/api/blog/update/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Post updated successfully!');
        
        // Revalidate
        await fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: `/blog/${post.slug}` })
        });

        setTimeout(() => {
          router.push(`/blog/${data.data.slug}`);
        }, 1500);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Error updating post');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    
    try {
      const response = await fetch(`/api/blog/delete/${post.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('✅ Post deleted successfully!');
        setTimeout(() => {
          router.push('/blog/admin');
        }, 1500);
      } else {
        setMessage('❌ Error deleting post');
      }
    } catch (error) {
      setMessage('❌ Error deleting post');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {/* Header */}
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
            <h1 className="text-3xl font-bold text-gray-900">Edit Post</h1>
            <p className="text-gray-600 mt-1">Editing: {post.slug}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-6 py-3 bg-red-100 text-red-700 rounded-full font-semibold hover:bg-red-200 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Trash2 size={18} />
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
            <button
              onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
              className="px-6 py-3 bg-purple-100 text-purple-700 rounded-full font-semibold hover:bg-purple-200 transition-all flex items-center gap-2"
            >
              <Eye size={18} />
              View Live
            </button>
            <button
              onClick={handleUpdate}
              disabled={saving}
              className="px-6 py-3 bg-linear-to-r from-pink-500 to-purple-500 text-white rounded-full font-semibold hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Update Post'}
            </button>
          </div>
        </div>
        {message && (
          <div className={`mt-4 p-4 rounded-xl ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Title */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all text-lg"
            />
          </div>

          {/* Excerpt */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Excerpt *
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              required
              rows={3}
              className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all resize-none"
            />
          </div>

          {/* Markdown Editor */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Content (Markdown) *
            </label>
            <SimpleMDE
              value={formData.content}
              onChange={(value) => setFormData({ ...formData, content: value })}
              options={{
                spellChecker: false,
                minHeight: '400px',
              }}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Publish Settings */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Publish Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2 border-2 border-pink-200 rounded-xl focus:border-pink-500 outline-none"
                >
                  <option value="draft">📝 Draft</option>
                  <option value="published">✅ Published</option>
                  <option value="archived">📦 Archived</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-5 h-5 text-pink-500 rounded focus:ring-2 focus:ring-pink-200"
                  />
                  <span className="text-sm font-semibold text-gray-700">Featured Post ⭐</span>
                </label>
              </div>
            </div>
          </div>

          {/* Category & Author */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Organization</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  required
                  className="w-full px-4 py-2 border-2 border-pink-200 rounded-xl focus:border-pink-500 outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Author *
                </label>
                <select
                  value={formData.authorId}
                  onChange={(e) => setFormData({ ...formData, authorId: e.target.value })}
                  required
                  className="w-full px-4 py-2 border-2 border-pink-200 rounded-xl focus:border-pink-500 outline-none"
                >
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-pink-200 rounded-xl focus:border-pink-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Cover Image */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Cover Image</h3>
            <input
              type="text"
              value={formData.coverImage}
              onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
              placeholder="Image URL"
              className="w-full px-4 py-2 border-2 border-pink-200 rounded-xl focus:border-pink-500 outline-none mb-3"
            />
            {formData.coverImage && (
              <Image 
                src={formData.coverImage} 
                alt="Preview" 
                className="w-full h-40 object-cover rounded-xl"
              />
            )}
          </div>

          {/* SEO */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">SEO</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={formData.metaTitle}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                placeholder="Meta Title"
                className="w-full px-4 py-2 border-2 border-pink-200 rounded-xl focus:border-pink-500 outline-none"
              />
              <textarea
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                placeholder="Meta Description"
                rows={3}
                className="w-full px-4 py-2 border-2 border-pink-200 rounded-xl focus:border-pink-500 outline-none resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
