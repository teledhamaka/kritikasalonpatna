// components/FloatingInstallButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone } from 'lucide-react';

export default function FloatingInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
      return;
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show button after 15 seconds if not dismissed
      setTimeout(() => {
        const dismissed = localStorage.getItem('floatingButtonDismissed');
        if (!dismissed) {
          setIsVisible(true);
        }
      }, 15000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const installApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsVisible(false);
        localStorage.setItem('floatingButtonDismissed', 'true');
      }
    }
  };

  const dismissButton = () => {
    setIsVisible(false);
    localStorage.setItem('floatingButtonDismissed', 'true');
  };

  if (isStandalone || !isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed bottom-20 right-4 z-40"
        >
          <div className="bg-white rounded-full shadow-2xl border border-pink-200 p-3">
            <div className="flex items-center space-x-3">
              <button
                onClick={installApp}
                className="flex items-center space-x-2 bg-linear-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full font-medium hover:from-pink-600 hover:to-purple-700 transition-all"
              >
                <Smartphone className="w-4 h-4" />
                <span className="text-sm">Install App</span>
              </button>
              <button
                onClick={dismissButton}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}