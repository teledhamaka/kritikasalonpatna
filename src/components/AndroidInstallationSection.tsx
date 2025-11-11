// components/AndroidInstallationSection.tsx
'use client';

import { Download, Menu } from 'lucide-react';

export default function AndroidInstallationSection() {
  return (
    <section className="mb-8">
      <div className="bg-linear-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 text-center">
          📱 For Android Users
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Automatic Installation */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-green-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <Download className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Automatic Installation</h3>
                <p className="text-green-600 text-sm">Easiest method</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">1</div>
                <p className="text-sm text-gray-700">Wait for install prompt (appears in 3-5 seconds)</p>
              </div>
              
              <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">2</div>
                <p className="text-sm text-gray-700">Tap &quot;Install App&quot; button</p>
              </div>
              
              <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">3</div>
                <p className="text-sm text-gray-700">App will be added to home screen automatically</p>
              </div>
            </div>
          </div>

          {/* Manual Installation */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <Menu className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">Manual Installation</h3>
                <p className="text-blue-600 text-sm">If prompt doesn&apos;t appear</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold mt-1">1</div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Tap three dots menu (⋮)</p>
                  <p className="text-xs text-gray-600">Top-right corner of Chrome browser</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold mt-1">2</div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Select &quot;Install app&quot; or Add to &quot;screen&quot;</p>
                  <p className="text-xs text-gray-600">From the dropdown menu</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold mt-1">3</div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Confirm installation</p>
                  <p className="text-xs text-gray-600">Tap &quot;Install&quot; or &quot;Add&quot;</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Android App Benefits */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white rounded-lg border border-green-200">
            <div className="text-2xl mb-2">🚀</div>
            <p className="text-sm font-medium text-gray-800">Fast Loading</p>
            <p className="text-xs text-gray-600">Like native app</p>
          </div>
          
          <div className="text-center p-4 bg-white rounded-lg border border-green-200">
            <div className="text-2xl mb-2">📶</div>
            <p className="text-sm font-medium text-gray-800">Works Offline</p>
            <p className="text-xs text-gray-600">Browse without internet</p>
          </div>
          
          <div className="text-center p-4 bg-white rounded-lg border border-green-200">
            <div className="text-2xl mb-2">🔔</div>
            <p className="text-sm font-medium text-gray-800">Push Notifications</p>
            <p className="text-xs text-gray-600">Get updates & offers</p>
          </div>
          
          <div className="text-center p-4 bg-white rounded-lg border border-green-200">
            <div className="text-2xl mb-2">💾</div>
            <p className="text-sm font-medium text-gray-800">Small Size</p>
            <p className="text-xs text-gray-600">Less than 1MB</p>
          </div>
        </div>

        {/* Supported Browsers */}
        <div className="mt-6 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <h4 className="font-bold text-yellow-800 mb-2 text-center">Supported Android Browsers</h4>
          <div className="flex justify-center space-x-6 text-sm text-yellow-700">
            <span>✅ Google Chrome</span>
            <span>✅ Samsung Internet</span>
            <span>✅ Microsoft Edge</span>
            <span>✅ Firefox</span>
          </div>
        </div>
      </div>
    </section>
  );
}