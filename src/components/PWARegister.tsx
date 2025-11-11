// components/PWARegister.tsx
"use client";

import { useEffect } from 'react';

const PWARegister = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60000); // Check every minute

          // Listen for new service worker
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available, show update prompt
                  if (confirm('New version available! Reload to update?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });

      // Handle service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CACHE_UPDATED') {
          console.log('Cache has been updated');
        }
      });

      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        // Wait a bit before asking for permission
        setTimeout(() => {
          Notification.requestPermission().then((permission) => {
            console.log('Notification permission:', permission);
          });
        }, 5000);
      }
    }
  }, []);

  return null;
};

export default PWARegister;