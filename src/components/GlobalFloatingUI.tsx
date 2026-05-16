// src/components/GlobalFloatingUI.tsx
'use client';

import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import MobileBottomNav from '@/components/MobileBottomNav'; // ✅ direct import

const FloatingCart = dynamic(() => import('@/components/FloatingCart'), { ssr: false });
const WhatsAppFloating = dynamic(() => import('@/components/WhatsAppFloating'), { ssr: false });

export default function GlobalFloatingUI() {
  const router = useRouter();

  return (
    <>
      <MobileBottomNav />
      <FloatingCart onProceedToBooking={() => router.push('/appointments')} />
      <WhatsAppFloating />
    </>
  );
}