// src/components/MobileBottomNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Home, UserCircle, Leaf, Scissors, Sparkles, Book } from 'lucide-react';

export default function MobileBottomNav() {
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile) return null;

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/makeup', label: 'Makeup', icon: UserCircle },
    { href: '/skin', label: 'Skin', icon: Leaf },
    { href: '/hair', label: 'Hair', icon: Scissors },
    { href: '/nails', label: 'Nails', icon: Sparkles },
    { href: '/blog', label: 'Blog', icon: Book },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-pink-100 shadow-lg z-[90] safe-area-inset-bottom">
      <div className="flex justify-around items-center py-2 px-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-full transition-colors ${
                isActive ? 'text-pink-600' : 'text-gray-500 hover:text-pink-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}