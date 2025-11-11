// components/TrustPWAInstallPrompt.tsx
'use client';

import { useState, useEffect } from 'react';
import { Download, Shield, Check, Lock, Award } from 'lucide-react';
import Image from 'next/image';

export default function TrustPWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
      return;
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      setTimeout(() => {
        const dismissed = localStorage.getItem('trustPromptDismissed');
        if (!dismissed) {
          setShowPrompt(true);
        }
      }, 5000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const installApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowPrompt(false);
        localStorage.setItem('trustPromptDismissed', 'true');
      }
    }
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    localStorage.setItem('trustPromptDismissed', 'true');
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-xl shadow-2xl border border-green-200 z-50 overflow-hidden">
      {/* Trust Header */}
      <div className="bg-linear-to-r from-green-500 to-blue-500 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Image 
              src="/icons/icon-192x192.png" 
              alt="Kritika Salon Logo"
              className="w-10 h-10 rounded-lg border-2 border-white mr-3"
            />
            <div>
              <h3 className="font-bold text-lg">Kritika Salon</h3>
              <p className="text-green-100 text-sm">Official App</p>
            </div>
          </div>
          <div className="flex space-x-1">
            <Shield className="w-5 h-5 text-white" />
            <Lock className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Security Badges */}
        <div className="flex justify-center space-x-4 mb-4">
          <div className="flex items-center text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
            <Check className="w-3 h-3 mr-1" />
            Verified Business
          </div>
          <div className="flex items-center text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
            <Lock className="w-3 h-3 mr-1" />
            Secure Connection
          </div>
        </div>

        {/* Trust Messages */}
        <div className="space-y-3 mb-4">
          <div className="flex items-start">
            <Award className="w-5 h-5 text-green-500 mr-2 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-gray-800 text-sm">Official Kritika Salon App</p>
              <p className="text-gray-600 text-xs">This is our official mobile app</p>
            </div>
          </div>

          <div className="flex items-start">
            <Shield className="w-5 h-5 text-blue-500 mr-2 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-gray-800 text-sm">100% Safe & Secure</p>
              <p className="text-gray-600 text-xs">No virus, no fraud, no hidden charges</p>
            </div>
          </div>

          <div className="flex items-start">
            <Check className="w-5 h-5 text-purple-500 mr-2 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-gray-800 text-sm">Free Installation</p>
              <p className="text-gray-600 text-xs">No payment required, direct from our website</p>
            </div>
          </div>
        </div>

        {/* Installation Stats */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-center text-xs text-gray-600">
            <span className="font-semibold text-green-600">5,000+</span> customers have installed this app
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={installApp}
            className="flex-1 bg-linear-to-r from-green-500 to-blue-500 text-white py-3 px-4 rounded-lg font-bold hover:from-green-600 hover:to-blue-600 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Install Safe App
          </button>
          <button
            onClick={dismissPrompt}
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-all"
          >
            Later
          </button>
        </div>

        {/* Trust Footer */}
        <div className="text-center mt-3">
          <p className="text-xs text-gray-500">
            🔒 Secure • 🏪 Official • 💰 Free
          </p>
        </div>
      </div>
    </div>
  );
}