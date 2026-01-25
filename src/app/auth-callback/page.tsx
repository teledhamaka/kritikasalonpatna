// app/auth-callback/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connecting your account...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Give it a moment for session to be established
        setTimeout(async () => {
          const sessionResponse = await fetch('/api/auth/session');
          const sessionData = await sessionResponse.json();
          
          if (sessionData.isLoggedIn) {
            setStatus('success');
            setMessage('Successfully connected! Redirecting to your profile...');
            
            // Check if profile is complete
            if (sessionData.user?.profile?.birthday) {
              setTimeout(() => router.push('/'), 2000);
            } else {
              setTimeout(() => router.push('/profile?setup=true'), 2000);
            }
          } else {
            setStatus('error');
            setMessage('Failed to connect. Please try again.');
            setTimeout(() => router.push('/login'), 3000);
          }
        }, 1000);
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('An error occurred. Please try again.');
        setTimeout(() => router.push('/login'), 3000);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
      >
        <div className="mb-6">
          {status === 'loading' && (
            <div className="w-16 h-16 mx-auto bg-pink-100 rounded-full flex items-center justify-center">
              <Loader className="w-8 h-8 text-pink-600 animate-spin" />
            </div>
          )}
          {status === 'success' && (
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600" />
            </div>
          )}
          {status === 'error' && (
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          )}
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {status === 'loading' && 'Connecting...'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Oops!'}
        </h1>
        
        <p className="text-gray-600 mb-6">{message}</p>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-pink-500 h-2 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: status === 'loading' ? '60%' : '100%' }}
            transition={{ duration: 2 }}
          />
        </div>
        
        <p className="text-sm text-gray-500 mt-6">
          Kritika Salon • Patna, Bihar
        </p>
      </motion.div>
    </div>
  );
}