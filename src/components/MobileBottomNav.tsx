// kritika/src/components/MobileBottomNav.tsx - COMPLETELY FIXED VERSION
'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Home, Search, Heart, User, Book } from 'lucide-react'
import { UserCircle, Leaf, Scissors } from 'lucide-react'

export default function MobileBottomNav() {
  const [activeTab, setActiveTab] = useState('home')
  const [isLandscape, setIsLandscape] = useState(false)

  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight)
    }
    
    checkOrientation()
    window.addEventListener('resize', checkOrientation)
    window.addEventListener('orientationchange', checkOrientation)
    
    return () => {
      window.removeEventListener('resize', checkOrientation)
      window.removeEventListener('orientationchange', checkOrientation)
    }
  }, [])

  return (
    <nav className="
      lg:hidden 
      fixed 
      bottom-0 
      left-0 
      right-0 
      bg-white 
      border-t-2 
      border-gray-200 
      shadow-2xl 
      z-40 
      no-print 
      safe-area-inset
      pb-safe
      ${isLandscape ? 'h-16' : 'h-20'}
    ">
      <div className="
        flex 
        justify-around 
        items-center 
        h-full
        px-1
        ${isLandscape ? 'py-1' : 'py-2'}
      ">
        <Link 
          href="/" 
          className={`
            flex 
            flex-col 
            items-center 
            justify-center
            ${isLandscape ? 'gap-0.5' : 'gap-1'} 
            ${activeTab === 'home' ? 'text-pink-600' : 'text-gray-600'}
            w-full
            h-full
            touch-target
          `}
          onClick={() => setActiveTab('home')}
        >
          <Home className={`
            ${isLandscape ? 'w-5 h-5' : 'w-6 h-6'}
          `} />
          <span className={`
            ${isLandscape ? 'text-[10px]' : 'text-xs'} 
            font-semibold
            leading-tight
          `}>
            Home
          </span>
        </Link>
        
        <Link 
          href="/makeup" 
          className={`
            flex 
            flex-col 
            items-center 
            justify-center
            ${isLandscape ? 'gap-0.5' : 'gap-1'} 
            ${activeTab === 'makeup' ? 'text-pink-600' : 'text-gray-600'}
            w-full
            h-full
            touch-target
          `}
          onClick={() => setActiveTab('makeup')}
        >
          <UserCircle className={`
            ${isLandscape ? 'w-5 h-5' : 'w-6 h-6'}
          `} />
          <span className={`
            ${isLandscape ? 'text-[10px]' : 'text-xs'} 
            font-semibold
            leading-tight
          `}>
            Makeup
          </span>
        </Link>
        
        <Link 
          href="/skin" 
          className={`
            flex 
            flex-col 
            items-center 
            justify-center
            ${isLandscape ? 'gap-0.5' : 'gap-1'} 
            ${activeTab === 'skin' ? 'text-pink-600' : 'text-gray-600'}
            w-full
            h-full
            touch-target
          `}
          onClick={() => setActiveTab('skin')}
        >
          <Leaf className={`
            ${isLandscape ? 'w-5 h-5' : 'w-6 h-6'}
          `} />
          <span className={`
            ${isLandscape ? 'text-[10px]' : 'text-xs'} 
            font-semibold
            leading-tight
          `}>
            Skin
          </span>
        </Link>
        
        <Link 
          href="/hair" 
          className={`
            flex 
            flex-col 
            items-center 
            justify-center
            ${isLandscape ? 'gap-0.5' : 'gap-1'} 
            ${activeTab === 'hair' ? 'text-pink-600' : 'text-gray-600'}
            w-full
            h-full
            touch-target
          `}
          onClick={() => setActiveTab('hair')}
        >
          <Scissors className={`
            ${isLandscape ? 'w-5 h-5' : 'w-6 h-6'}
          `} />
          <span className={`
            ${isLandscape ? 'text-[10px]' : 'text-xs'} 
            font-semibold
            leading-tight
          `}>
            Hair
          </span>
        </Link>
        
        <Link 
          href="/nails" 
          className={`
            flex 
            flex-col 
            items-center 
            justify-center
            ${isLandscape ? 'gap-0.5' : 'gap-1'} 
            ${activeTab === 'nail' ? 'text-pink-600' : 'text-gray-600'}
            w-full
            h-full
            touch-target
          `}
          onClick={() => setActiveTab('nail')}
        >
          <Leaf className={`
            ${isLandscape ? 'w-5 h-5' : 'w-6 h-6'}
          `} />
          <span className={`
            ${isLandscape ? 'text-[10px]' : 'text-xs'} 
            font-semibold
            leading-tight
          `}>
            Nails
          </span>
        </Link>
        
        <Link 
          href="/blog" 
          className={`
            flex 
            flex-col 
            items-center 
            justify-center
            ${isLandscape ? 'gap-0.5' : 'gap-1'} 
            ${activeTab === 'blog' ? 'text-pink-600' : 'text-gray-600'}
            w-full
            h-full
            touch-target
          `}
          onClick={() => setActiveTab('blog')}
        >
          <Book className={`
            ${isLandscape ? 'w-5 h-5' : 'w-6 h-6'}
          `} />
          <span className={`
            ${isLandscape ? 'text-[10px]' : 'text-xs'} 
            font-semibold
            leading-tight
          `}>
            Blog
          </span>
        </Link>
      </div>
    </nav>
  )
}