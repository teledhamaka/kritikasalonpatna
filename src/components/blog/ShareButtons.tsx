// components/blog/ShareButtons.tsx
'use client';

import { useState } from 'react';

interface ShareButtonsProps {
  title: string;
  slug: string;
  compact?: boolean;
}

export default function ShareButtons({ title, slug, compact = false }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const url = `https://kritikasalonpatna.com/blog/${slug}`;

  const trackShare = async (platform: string) => {
    try {
      await fetch(`/api/analytics/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'share' }),
      });
    } catch (error) {
      console.error('Failed to track share:', error);
    }
  };

  const handleShare = (platform: string, shareUrl: string) => {
    trackShare(platform);
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareButtons = [
    {
      name: 'WhatsApp',
      icon: '💚',
      url: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
      color: 'from-green-400 to-green-600'
    },
    {
      name: 'Facebook',
      icon: '📘',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: 'from-blue-500 to-blue-700'
    },
    {
      name: 'Twitter',
      icon: '🐦',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      color: 'from-sky-400 to-sky-600'
    },
    {
      name: 'Pinterest',
      icon: '📌',
      url: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}`,
      color: 'from-red-500 to-red-700'
    },
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {shareButtons.slice(0, 2).map((btn) => (
          <button
            key={btn.name}
            onClick={() => handleShare(btn.name, btn.url)}
            className="w-8 h-8 rounded-full bg-gradient-to-r hover:scale-110 transition-transform flex items-center justify-center shadow-md"
            style={{ background: `linear-gradient(to right, ${btn.color})` }}
            title={`Share on ${btn.name}`}
          >
            <span className="text-white text-sm">{btn.icon}</span>
          </button>
        ))}
        <button
          onClick={copyLink}
          className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-600 to-gray-800 hover:scale-110 transition-transform flex items-center justify-center shadow-md"
          title={copied ? 'Copied!' : 'Copy link'}
        >
          <span className="text-white text-sm">{copied ? '✓' : '🔗'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {shareButtons.map((btn) => (
        <button
          key={btn.name}
          onClick={() => handleShare(btn.name, btn.url)}
          className={`px-4 py-2 bg-gradient-to-r ${btn.color} text-white rounded-full text-sm font-semibold hover:shadow-lg transition-all transform hover:scale-105 flex items-center gap-2`}
        >
          <span>{btn.icon}</span>
          <span>{btn.name}</span>
        </button>
      ))}
      <button
        onClick={copyLink}
        className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-full text-sm font-semibold hover:shadow-lg transition-all transform hover:scale-105 flex items-center gap-2"
      >
        <span>{copied ? '✓' : '🔗'}</span>
        <span>{copied ? 'Copied!' : 'Copy Link'}</span>
      </button>
    </div>
  );
}