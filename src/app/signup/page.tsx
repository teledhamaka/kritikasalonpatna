// ==========================================
// FILE: app/signup/page.tsx (Server Component)
// ==========================================
import { Suspense } from 'react';
import SignupClient from './SignupClient';
import { Loader } from 'lucide-react';

// Loading fallback
function SignupLoading() {
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
export default function SignupPage() {
  return (
    <Suspense fallback={<SignupLoading />}>
      <SignupClient />
    </Suspense>
  );
}

// Metadata for SEO
export const metadata = {
  title: 'Create Account - Kritika Salon',
  description: 'Join our beauty community and start your personalized beauty journey',
};
