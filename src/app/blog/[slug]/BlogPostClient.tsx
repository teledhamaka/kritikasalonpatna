'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Heart, Bookmark, Clock, Eye, Calendar, Facebook, Twitter, Linkedin, 
  Link2, Check, ChevronUp, ArrowLeft, MessageCircle} from 'lucide-react';
import Image from 'next/image';  

interface BlogPostProps {
  post: {
    slug: string;
    title: string;
    excerpt: string;
    coverImage: string;
    category: string;
    author: {
      name: string;
      avatar: string;
      bio: string;
    };
    tags: string[];
    contentHtml: string;
    readTime: number;
    views: number; // ADD THIS
    likes: number; // ADD THIS
    publishedAt: string;
  };
}

export default function BlogPostClient({ post }: BlogPostProps) {
  // Safe defaults
  const safePost = {
    slug: post?.slug || '',
    title: post?.title || 'Untitled Post',
    excerpt: post?.excerpt || '',
    contentHtml: post?.contentHtml || '',
    coverImage: post?.coverImage || '/images/placeholder.jpg',
    category: post?.category || 'General',
    author: post?.author || { name: 'Anonymous', avatar: '/images/default-avatar.jpg', bio: '' },
    tags: post?.tags || [],
    readTime: post?.readTime || 5,
    views: post?.views || 0,
    likes: post?.likes || 0,
    publishedAt: post?.publishedAt || new Date().toISOString()
  };

  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  // Reading Progress Bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Table of Contents
  const [toc, setToc] = useState<Array<{ id: string; text: string }>>([]);

  useEffect(() => {
    if (contentRef.current) {
      const headings = contentRef.current.querySelectorAll('h2');
      const tocItems = Array.from(headings).map((heading, index) => {
        const id = `section-${index}`;
        heading.id = id;
        return { id, text: heading.textContent || '' };
      });
      setToc(tocItems);
    }

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
      if (contentRef.current) {
        const headings = contentRef.current.querySelectorAll('h2');
        let currentSection = '';
        headings.forEach((heading) => {
          const rect = heading.getBoundingClientRect();
          if (rect.top <= 100 && rect.top >= -rect.height) {
            currentSection = heading.id;
          }
        });
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLike = async () => {
    setLiked(!liked);
    await fetch(`/api/blog/${safePost.slug}/like`, { method: 'POST' }).catch(() => {});
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  
  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(safePost.title)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50 via-purple-50 to-blue-50">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-linear-to-r from-pink-500 via-purple-500 to-blue-500 origin-left z-50"
        style={{ scaleX }}
      />

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <motion.a
          href="/blog"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-semibold mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Blog
        </motion.a>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8"
            >
              <div className="relative h-96 bg-linear-to-br from-pink-100 to-purple-100">
                <Image
                  src={safePost.coverImage}
                  alt={safePost.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/images/placeholder.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
              </div>

              <div className="p-8">
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                  <div className="flex items-center gap-2">
                    <Image
                      src={safePost.author.avatar}
                      alt={safePost.author.name}
                      className="w-12 h-12 rounded-full border-2 border-pink-200 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/images/default-avatar.jpg';
                      }}
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{safePost.author.name}</p>
                      <p className="text-xs text-gray-500">Beauty Expert</p>
                    </div>
                  </div>
                  <span className="hidden sm:inline text-gray-300">•</span>
                  <div className="flex items-center gap-1">
                    <Calendar size={16} className="text-pink-500" />
                    <time>
                      {new Date(safePost.publishedAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </time>
                  </div>
                  <span className="hidden sm:inline text-gray-300">•</span>
                  <div className="flex items-center gap-1">
                    <Clock size={16} className="text-purple-500" />
                    <span>{safePost.readTime} min read</span>
                  </div>
                  <span className="hidden sm:inline text-gray-300">•</span>
                  <div className="flex items-center gap-1">
                    <Eye size={16} className="text-blue-500" />
                    <span>{safePost.views.toLocaleString()} views</span>
                  </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  {safePost.title}
                </h1>

                <p className="text-xl text-gray-600 leading-relaxed mb-6">
                  {safePost.excerpt}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-gray-200">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-all ${
                      liked 
                        ? 'bg-pink-500 text-white' 
                        : 'bg-pink-50 text-pink-600 hover:bg-pink-100'
                    }`}
                  >
                    <Heart size={18} fill={liked ? 'white' : 'none'} />
                    {safePost.likes + (liked ? 1 : 0)}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setBookmarked(!bookmarked)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-all ${
                      bookmarked
                        ? 'bg-purple-500 text-white'
                        : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                    }`}
                  >
                    <Bookmark size={18} fill={bookmarked ? 'white' : 'none'} />
                    Save
                  </motion.button>

                  <div className="flex gap-2 ml-auto">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={shareOnFacebook}
                      className="p-2.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      <Facebook size={18} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={shareOnTwitter}
                      className="p-2.5 bg-sky-50 text-sky-600 rounded-full hover:bg-sky-100 transition-colors"
                    >
                      <Twitter size={18} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={shareOnLinkedIn}
                      className="p-2.5 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      <Linkedin size={18} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={copyLink}
                      className={`p-2.5 rounded-full transition-all ${
                        copied
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {copied ? <Check size={18} /> : <Link2 size={18} />}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              ref={contentRef}
              className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-8 prose prose-lg prose-pink max-w-none"
              dangerouslySetInnerHTML={{ __html: safePost.contentHtml }}
            />

            {safePost.tags && safePost.tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-3xl shadow-xl p-8 mb-8"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">Related Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {safePost.tags.map((tag) => (
                    <a
                      key={tag}
                      href={`/blog?search=${encodeURIComponent(tag)}`}
                      className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-100 transition-colors"
                    >
                      #{tag}
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {toc.length > 0 && (
            <div className="lg:col-span-4">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-3xl shadow-xl p-6 sticky top-24"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageCircle size={20} className="text-pink-500" />
                  Table of Contents
                </h3>
                <nav className="space-y-2">
                  {toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`block text-sm py-2 px-3 rounded-lg transition-all ${
                        activeSection === item.id
                          ? 'bg-pink-100 text-pink-700 font-semibold'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-4 bg-linear-to-r from-pink-500 to-purple-500 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all z-50"
        >
          <ChevronUp size={24} />
        </motion.button>
      )}
    </div>
  );
}
