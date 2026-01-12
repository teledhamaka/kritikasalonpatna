// ==========================================
// FILE: app/login/page.tsx (Server Component)
// ==========================================
import { Suspense } from 'react';
import LoginClient from './LoginClient';
import { Loader } from 'lucide-react';

// Loading fallback
function LoginLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <Loader className="w-8 h-8 text-pink-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

// Server Component - handles metadata and layout
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginClient />
    </Suspense>
  );
}

// Metadata for SEO
export const metadata = {
  title: 'Sign In - Kritika Salon',
  description: 'Sign in to your account to book appointments and manage your beauty journey',
};