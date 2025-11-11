// components/AndroidInstallGuide.tsx
'use client';

import { useState, useEffect } from 'react';
import { FiDownload, FiCheck } from 'react-icons/fi';

export default function AndroidInstallGuide() {
  const [showGuide, setShowGuide] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if user is on Android
    const userAgent = navigator.userAgent.toLowerCase();
    const isAndroidDevice = /android/.test(userAgent);
    setIsAndroid(isAndroidDevice);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
      return;
    }

    // Show guide after 8 seconds for Android users
    if (isAndroidDevice) {
      const timer = setTimeout(() => {
        const dismissed = localStorage.getItem('androidGuideDismissed');
        if (!dismissed) {
          setShowGuide(true);
        }
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, []);

  const dismissGuide = () => {
    setShowGuide(false);
    localStorage.setItem('androidGuideDismissed', 'true');
  };

  if (isStandalone || !isAndroid || !showGuide) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white rounded-xl shadow-2xl border border-green-200 z-50 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
            <FiDownload className="text-white text-lg" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Install Android App</h3>
            <p className="text-sm text-gray-600">Get the native app experience</p>
          </div>
        </div>
        <button
          onClick={dismissGuide}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-sm text-gray-700">
          <FiCheck className="w-4 h-4 text-green-500 mr-2" />
          <span>Works offline</span>
        </div>
        <div className="flex items-center text-sm text-gray-700">
          <FiCheck className="w-4 h-4 text-green-500 mr-2" />
          <span>Fast loading</span>
        </div>
        <div className="flex items-center text-sm text-gray-700">
          <FiCheck className="w-4 h-4 text-green-500 mr-2" />
          <span>No Play Store download</span>
        </div>
      </div>

      <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
        <p className="text-sm text-green-800 font-medium mb-2">Installation Steps:</p>
        <ol className="text-xs text-green-700 space-y-1">
          <li>1. Tap &quot;Install App&quot; when prompted</li>
          <li>2. Or tap ⋮ (menu) → &quot;Install app&quot;</li>
          <li>3. Launch from home screen</li>
        </ol>
      </div>

      <button
        onClick={dismissGuide}
        className="w-full mt-3 bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors"
      >
        Got It!
      </button>
    </div>
  );
}