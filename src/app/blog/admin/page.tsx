"use client";

import { useState } from 'react';
import { Save, Eye, Upload, Sparkles } from 'lucide-react';

export default function AdminBlogEditor() {
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    coverImage: '',
    category: '',
    tags: '',
    featured: false,
    status: 'draft'
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const categories = [
    { id: 'hair-care', name: 'Hair Care' },
    { id: 'makeup', name: 'Makeup & Beauty' },
    { id: 'skin-care', name: 'Skin Care' },
    { id: 'bridal', name: 'Bridal Services' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      // In real app, this would call Supabase API
      const response = await fetch('/api/blog/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(t => t.trim()),
        })
      });

      if (response.ok) {
        setMessage('✅ Blog saved successfully!');
        // Trigger revalidation
        await fetch('/api/revalidate?path=/blog');
      } else {
        setMessage('❌ Error saving blog');
      }
    } catch (error) {
      setMessage('❌ Error: ' + error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50 via-purple-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Sparkles className="text-pink-500" size={32} />
                Create New Blog Post
              </h1>
              <p className="text-gray-600 mt-2">Write beautiful content for your readers</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="px-6 py-3 bg-purple-100 text-purple-700 rounded-full font-semibold hover:bg-purple-200 transition-all flex items-center gap-2"
              >
                <Eye size={18} />
                {previewMode ? 'Edit' : 'Preview'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-6 py-3 bg-linear-to-r from-pink-500 to-purple-500 text-white rounded-full font-semibold hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Blog'}
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
          
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Title */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Blog Title ✨
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Bridal Makeup Complete Guide 2025..."
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all text-lg"
              />
            </div>

            {/* Excerpt */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Short Description (Excerpt)
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Write a short summary that appears on the blog listing page..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all resize-none"
              />
            </div>

            {/* Content Editor */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700">
                  Blog Content (Markdown Supported)
                </label>
                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {formData.content.length} characters
                </span>
              </div>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your beautiful blog content here...

## Use Markdown
- **Bold text**
- *Italic text*
- [Links](https://example.com)
- Images ![alt](url)"
                rows={20}
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all resize-none font-mono text-sm"
              />
            </div>
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-6">
            
            {/* Cover Image */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Cover Image 📸
              </label>
              <div className="border-2 border-dashed border-pink-300 rounded-xl p-6 text-center hover:border-pink-500 transition-all cursor-pointer">
                <Upload className="mx-auto text-pink-500 mb-3" size={32} />
                <p className="text-sm text-gray-600 mb-2">Click to upload or drag image</p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="coverImage"
                />
                <label
                  htmlFor="coverImage"
                  className="text-xs text-pink-600 cursor-pointer hover:underline"
                >
                  Browse Files
                </label>
              </div>
              <input
                type="text"
                value={formData.coverImage}
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                placeholder="Or paste image URL"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-3 text-sm"
              />
            </div>

            {/* Category */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:border-pink-500 outline-none"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="bridal makeup, hair care, beauty tips"
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:border-pink-500 outline-none"
              />
            </div>

            {/* Featured Toggle */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-sm font-semibold text-gray-700">Featured Post</span>
                  <p className="text-xs text-gray-500 mt-1">Show in trending section</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-5 h-5 text-pink-500 rounded focus:ring-2 focus:ring-pink-200"
                />
              </label>
            </div>

            {/* Status */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl focus:border-pink-500 outline-none"
              >
                <option value="draft">📝 Draft</option>
                <option value="published">✅ Published</option>
                <option value="archived">📦 Archived</option>
              </select>
            </div>

            {/* Quick Tips */}
            <div className="bg-linear-to-br from-pink-50 to-purple-50 rounded-2xl p-6 border-2 border-pink-200">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Sparkles size={18} className="text-pink-500" />
                Writing Tips
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Use Hindi + English mix for better reach</li>
                <li>• Add emojis for visual appeal</li>
                <li>• Keep paragraphs short & easy to read</li>
                <li>• Use headings for better structure</li>
                <li>• Add personal touch & conversational tone</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}