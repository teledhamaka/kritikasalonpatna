// components/FAQSection.tsx
'use client';

//import { Shield, Check, Lock, Award } from 'lucide-react';

export default function FAQSection() {
  return (
    <section className="mb-8">
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-pink-200">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 text-center">
          ❓ Frequently Asked Questions
        </h2>
        
        <div className="space-y-4">
          {/* Security FAQ */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-800 mb-2">
              🔒 Is this app safe from viruses?
            </h3>
            <p className="text-gray-600 text-sm">
              <strong>Yes, 100% safe.</strong> This is not a downloaded app from unknown sources. 
              It&apos;s our official website converted to app format by your browser. 
              No virus scan required.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-800 mb-2">
              💰 Is there any hidden charge?
            </h3>
            <p className="text-gray-600 text-sm">
              <strong>No, completely free.</strong> App installation is free. 
              You only pay for services you book at our salon. 
              No subscription or hidden charges.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-800 mb-2">
              📱 Does this app access my personal data?
            </h3>
            <p className="text-gray-600 text-sm">
              <strong>No data access.</strong> The app only stores your booking history 
              and preferences. It cannot access your contacts, photos, or personal files.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-800 mb-2">
              🏪 How to verify this is official?
            </h3>
            <p className="text-gray-600 text-sm">
              <strong>Visit our salon</strong> at Bhootnath Road, Patna or 
              <strong> call +91-9650461390</strong> to verify. 
              Check our Google Business profile for authentic reviews.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-800 mb-2">
              🔄 Can I uninstall if I don&apos;t like it?
            </h3>
            <p className="text-gray-600 text-sm">
              <strong>Yes, easily removable.</strong> Like any other app, 
              long-press the icon and select &quot;Uninstall&quot;. 
              No traces left on your phone.
            </p>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200 text-center">
          <h4 className="font-bold text-red-800 mb-2">Still Have Doubts?</h4>
          <p className="text-red-700 text-sm mb-3">
            Call us directly to verify this is our official app
          </p>
          <a 
            href="tel:+919650461390"
            className="inline-flex items-center bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 transition-colors"
          >
            📞 Call +91-9650461390
          </a>
        </div>
      </div>
    </section>
  );
}