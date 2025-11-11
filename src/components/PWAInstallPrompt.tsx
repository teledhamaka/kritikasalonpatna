// components/PWAInstallPrompt.tsx - Android specific updates
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Menu } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
      return;
    }

    // Check device type
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    // Android-specific: Listen for beforeinstallprompt event
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt faster for Android users (3 seconds)
      const delay = isAndroid ? 3000 : 5000;
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwaPromptDismissed');
        if (!dismissed) {
          setShowPrompt(true);
        }
      }, delay);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [isAndroid]);

  const installApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setDeferredPrompt(null);
        setShowPrompt(false);
        localStorage.setItem('pwaPromptDismissed', 'true');
        
        // Track installation in analytics
        if (typeof gtag !== 'undefined') {
          gtag('event', 'pwa_install', {
            event_category: 'engagement',
            event_label: 'android_app_install'
          });
        }
      }
    }
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    localStorage.setItem('pwaPromptDismissed', 'true');
  };

  // Don't show if app is already installed
  if (isStandalone) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-xl shadow-2xl border border-green-200 z-50 p-4"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-linear-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                <Smartphone className="text-white text-xl" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">
                  {isAndroid ? 'Install Android App' : 'Add to Home Screen'}
                </h3>
                <p className="text-sm text-gray-600">
                  {isAndroid ? 'Get native app experience' : 'Quick access & offline use'}
                </p>
              </div>
            </div>
            <button
              onClick={dismissPrompt}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {isAndroid ? (
            <div className="mb-3">
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Download className="w-4 h-4 mr-2 text-green-500" />
                Tap below to install directly
              </div>
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-xs text-green-800 font-medium mb-1">Android Benefits:</p>
                <div className="grid grid-cols-2 gap-1 text-xs text-green-700">
                  <div>✓ Works offline</div>
                  <div>✓ Fast loading</div>
                  <div>✓ No app store</div>
                  <div>✓ Push notifications</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-2">
                Tap Share → &quot;Add to Home Screen&quot;
              </p>
            </div>
          )}

          <div className="flex space-x-2">
            {isAndroid && (
              <button
                onClick={installApp}
                className="flex-1 bg-linear-to-r from-green-500 to-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-blue-600 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Install App
              </button>
            )}
            <button
              onClick={dismissPrompt}
              className={`${
                isAndroid ? 'flex-1' : 'w-full'
              } bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-all`}
            >
              {isAndroid ? 'Later' : 'OK'}
            </button>
          </div>

          {isAndroid && (
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-500">
                Or tap <Menu className="w-3 h-3 inline mx-1" /> → &quot;Install app&quot;
              </p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}