// components/TrustSecuritySection.tsx
'use client';

import { Shield, Lock, Award } from 'lucide-react';
import { FiLock } from 'react-icons/fi';

export default function TrustSecuritySection() {
  return (
    <section className="mb-8">
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-200">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 text-center">
          🔒 100% Safe & Secure
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Trust Indicators */}
          <div>
            <h3 className="font-bold text-gray-800 mb-4 text-lg">Why Trust This App?</h3>
            
            <div className="space-y-4">
              <div className="flex items-start p-4 bg-green-50 rounded-lg border border-green-200">
                <Shield className="w-6 h-6 text-green-500 mr-3 mt-1 shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-800">Official Business App</h4>
                  <p className="text-gray-600 text-sm mt-1">
                    This is the official mobile app of Kritika Salon, Patna. 
                    We are a registered beauty salon with physical presence.
                  </p>
                </div>
              </div>

              <div className="flex items-start p-4 bg-blue-50 rounded-lg border border-blue-200">
                <FiLock className="w-6 h-6 text-blue-500 mr-3 mt-1 shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-800">No Data Collection</h4>
                  <p className="text-gray-600 text-sm mt-1">
                    We don&apos;t access your personal data, contacts, or files. 
                    The app only stores your booking preferences.
                  </p>
                </div>
              </div>

              <div className="flex items-start p-4 bg-purple-50 rounded-lg border border-purple-200">
                <Award className="w-6 h-6 text-purple-500 mr-3 mt-1 shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-800">Virus & Fraud Free</h4>
                  <p className="text-gray-600 text-sm mt-1">
                    100% safe from viruses and malware. No hidden charges 
                    or fraudulent activities.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Business Verification */}
          <div>
            <h3 className="font-bold text-gray-800 mb-4 text-lg">Business Verification</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-2">🏪 Physical Address</h4>
                <p className="text-gray-600 text-sm">
                  Bhootnath Road, Patna, Bihar - 800010<br/>
                  Visit our salon to verify authenticity
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-2">📞 Contact Verification</h4>
                <p className="text-gray-600 text-sm">
                  Phone: +91-9650461390<br/>
                  Call us to confirm this is our official app
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-2">⭐ Customer Reviews</h4>
                <p className="text-gray-600 text-sm">
                  4.9★ rating from 5,000+ customers<br/>
                  Trusted by women in Patna since 2010
                </p>
              </div>
            </div>

            {/* Quick Verification Buttons */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <a 
                href="tel:+919650461390"
                className="bg-green-500 text-white text-center py-2 px-3 rounded-lg font-medium hover:bg-green-600 transition-colors text-sm"
              >
                📞 Call to Verify
              </a>
              <a 
                href="https://g.co/kgs/xxxxxxx" 
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-500 text-white text-center py-2 px-3 rounded-lg font-medium hover:bg-blue-600 transition-colors text-sm"
              >
                📍 Google Reviews
              </a>
            </div>
          </div>
        </div>

        {/* Security Badges */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-center font-bold text-gray-800 mb-4">Security Certifications</h3>
          <div className="flex justify-center space-x-6 flex-wrap">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-xs font-medium text-gray-700">SSL Secure</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Lock className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-xs font-medium text-gray-700">Data Protected</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-xs font-medium text-gray-700">Verified Business</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}