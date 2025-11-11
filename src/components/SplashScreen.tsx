'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SplashScreen() {
  const [scale, setScale] = useState(0.5);
  const [opacity, setOpacity] = useState(0);
  const [slide, setSlide] = useState(0.5);
  const [color, setColor] = useState('rgba(106, 13, 173, 0.5)');
  const router = useRouter();

  useEffect(() => {
    // Animation sequence
    const animate = () => {
      // Scale animation
      setScale(1);
      
      // Fade and slide animations with delay
      setTimeout(() => {
        setOpacity(1);
        setSlide(0);
        setColor('rgba(255, 107, 107, 0.8)');
      }, 300);

      // Check auth status and navigate after 3 seconds
      setTimeout(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
          router.push('/home');
        } else {
          router.push('/login');
        }
      }, 3000);
    };

    animate();
  }, [router]);

  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{
        background: `radial-gradient(circle at top left, var(--brand-primary), var(--brand-accent))`
      }}
    >
      <div className="text-center">
        {/* Animated Logo */}
        <div
          className="mx-auto mb-10 p-5 rounded-full shadow-2xl"
          style={{
            transform: `scale(${scale})`,
            backgroundColor: color,
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.2)',
            width: '120px',
            height: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55)'
          }}
        >
          <span 
            className="text-4xl"
            style={{ color: 'var(--brand-light)' }}
          >
            🌸
          </span>
        </div>

        {/* Brand Name */}
        <div
          style={{
            opacity,
            transform: `translateY(${slide * 50}px)`,
            transition: 'all 0.8s ease-out'
          }}
        >
          <h1 
            className="text-5xl font-bold mb-4"
            style={{
              color: 'var(--brand-light)',
              fontFamily: 'var(--font-pacifico)',
              textShadow: '2px 2px 10px rgba(0, 0, 0, 0.3)',
              letterSpacing: '2px'
            }}
          >
            Salonic
          </h1>
        </div>

        {/* Tagline */}
        <div
          style={{
            opacity,
            transform: `translateY(${slide * 50}px)`,
            transition: 'all 0.8s ease-out 0.1s'
          }}
        >
          <p 
            className="text-lg italic mb-8"
            style={{
              color: 'var(--brand-secondary)',
              fontWeight: 600,
              letterSpacing: '1px'
            }}
          >
            WHERE EVERY WOMAN IS A HEROINE
          </p>
        </div>

        {/* Loading indicator */}
        <div
          style={{
            opacity,
            transition: 'opacity 0.8s ease-out 0.2s'
          }}
        >
          <div 
            className="w-6 h-6 border-2 border-transparent rounded-full mx-auto animate-spin"
            style={{
              borderTopColor: 'var(--brand-light)',
              borderWidth: '3px'
            }}
          />
        </div>
      </div>
    </div>
  );
}