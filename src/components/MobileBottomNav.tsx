// kritika/src/components/MobileBottomNav.tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Home, Search, Heart, User, Book } from 'lucide-react'
import { UserCircle, Leaf, Scissors } from 'lucide-react'

export default function MobileBottomNav() {
  const [activeTab, setActiveTab] = useState('home')

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-40 no-print">
        <div className="flex justify-around items-center py-2">
          <Link 
            href="/" 
            className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-pink-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('home')}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs font-semibold">Home</span>
          </Link>
          
          <Link 
            href="/makeup" 
            className={`flex flex-col items-center gap-1 ${activeTab === 'makeup' ? 'text-pink-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('makeup')}
          >
            <UserCircle className="w-6 h-6" />
            <span className="text-xs font-semibold">Makeup</span>
          </Link>
          
          <Link 
            href="/skin" 
            className={`flex flex-col items-center gap-1 ${activeTab === 'skin' ? 'text-pink-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('skin')}
          >
            <Leaf className="w-6 h-6" />
            <span className="text-xs font-semibold">Skin</span>
          </Link>
          
          <Link 
            href="/hair" 
            className={`flex flex-col items-center gap-1 ${activeTab === 'hair' ? 'text-pink-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('hair')}
          >
            <Scissors className="w-6 h-6" />
            <span className="text-xs font-semibold">Hair</span>
          </Link>
          
          <Link 
            href="/nails" 
            className={`flex flex-col items-center gap-1 ${activeTab === 'nail' ? 'text-pink-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('nail')}
          >
            <Leaf className="w-6 h-6" />
            <span className="text-xs font-semibold">Nails</span>
          </Link>
          
          <Link 
            href="/blog" 
            className={`flex flex-col items-center gap-1 ${activeTab === 'blog' ? 'text-pink-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('blog')}
          >
            <Book className="w-6 h-6" />
            <span className="text-xs font-semibold">Blog</span>
          </Link>
        </div>
      </nav>
    </>
  )
}