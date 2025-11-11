// ========================================
// components/admin/MediaLibrary.tsx - BONUS
// ========================================
'use client';

import { useState, useEffect } from 'react';
import { createClientSupabase } from '@/lib/supabase/client';
import { Image as ImageIcon, Trash2, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function MediaLibrary({ onSelect }: { onSelect?: (url: string) => void }) {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const supabase = createClientSupabase();
      
      const { data, error } = await supabase.storage
        .from('blog-images')
        .list('covers', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) throw error;

      const imageUrls = data.map((file) => {
        const { data: { publicUrl } } = supabase.storage
          .from('blog-images')
          .getPublicUrl(`covers/${file.name}`);
        return publicUrl;
      });

      setImages(imageUrls);
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (url: string) => {
    if (!confirm('Delete this image?')) return;

    try {
      const supabase = createClientSupabase();
      const urlObj = new URL(url);
      const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/);
      
      if (pathMatch) {
        const filePath = pathMatch[1];
        await supabase.storage.from('blog-images').remove([filePath]);
        setImages(images.filter(img => img !== url));
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const filteredImages = images.filter(img => 
    img.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ImageIcon size={24} className="text-pink-500" />
          Media Library
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search images..."
            className="pl-10 pr-4 py-2 border-2 border-pink-200 rounded-xl focus:border-pink-500 outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No images found
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map((url, index) => (
            <motion.div
              key={url}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="relative group rounded-xl overflow-hidden border-2 border-gray-200 hover:border-pink-500 transition-all cursor-pointer"
              onClick={() => onSelect?.(url)}
            >
              <Image
                src={url}
                alt="Media"
                className="w-full h-32 object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteImage(url);
                  }}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
