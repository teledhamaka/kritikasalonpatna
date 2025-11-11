// app/offline/page.tsx
"use client";

import { motion } from 'framer-motion';
import { WifiOff, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const OfflinePage = () => {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setTimeout(() => {
        router.push('/');
      }, 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Check initial status
    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [router]);

  const handleRetry = () => {
    if (navigator.onLine) {
      router.push('/');
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          {/* Icon */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-24 h-24 mx-auto mb-6 bg-linear-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center"
          >
            <WifiOff className="w-12 h-12 text-pink-600" />
          </motion.div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
            {isOnline ? 'Back Online!' : 'You\'re Offline'}
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-8">
            {isOnline 
              ? 'Great! Your connection is restored. Redirecting you back...'
              : 'It looks like you\'ve lost your internet connection. Please check your network and try again.'}
          </p>

          {/* Status Indicator */}
          <div className="flex items-center justify-center space-x-2 mb-8">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isOnline ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              disabled={isOnline}
              className={`w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                isOnline
                  ? 'bg-green-500 text-white cursor-not-allowed'
                  : 'bg-linear-to-r from-pink-600 to-purple-600 text-white hover:from-pink-700 hover:to-purple-700 transform hover:scale-105'
              }`}
            >
              <RefreshCw className={isOnline ? '' : 'animate-spin-slow'} />
              <span>{isOnline ? 'Reconnecting...' : 'Try Again'}</span>
            </button>

            <button
              onClick={() => router.push('/')}
              className="w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-semibold border-2 border-pink-600 text-pink-600 hover:bg-pink-50 transition-all duration-300"
            >
              <Home />
              <span>Go to Homepage</span>
            </button>
          </div>

          {/* Cached Content Notice */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>💡 Tip:</strong> Some pages may still be available offline from your cache.
            </p>
          </div>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center text-sm text-gray-500"
        >
          <p>Having trouble? Make sure:</p>
          <ul className="mt-2 space-y-1">
            <li>• Your device is connected to Wi-Fi or mobile data</li>
            <li>• Airplane mode is turned off</li>
            <li>• Your network settings are correct</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default OfflinePage;