// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { BUSINESS_CONFIG, generateLocalBusinessSchema, generateWebsiteSchema } from '../lib/seo-config';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Providers } from './providers';

import { Analytics } from '@vercel/analytics/next';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: `${BUSINESS_CONFIG.name} - ${BUSINESS_CONFIG.tagline}`,
    template: `%s | ${BUSINESS_CONFIG.name}`
  },
  description: BUSINESS_CONFIG.description,
  keywords: [
    ...BUSINESS_CONFIG.primaryKeywords,
    ...BUSINESS_CONFIG.secondaryKeywords
  ].join(', '),
  
  authors: [{ name: BUSINESS_CONFIG.name }],
  creator: BUSINESS_CONFIG.name,
  publisher: BUSINESS_CONFIG.name,
  
  metadataBase: new URL('https://kritikasalonpatna.com'),
  
  alternates: {
    canonical: '/',
  },
  
  openGraph: {
    type: 'website',
    locale: 'hi_IN',
    url: 'https://kritikasalonpatna.com',
    siteName: BUSINESS_CONFIG.name,
    title: BUSINESS_CONFIG.name,
    description: BUSINESS_CONFIG.description,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: BUSINESS_CONFIG.name
      }
    ]
  },
  
  twitter: {
    card: 'summary_large_image',
    title: BUSINESS_CONFIG.name,
    description: BUSINESS_CONFIG.description,
    images: ['/og-image.jpg'],
    creator: '@kritikasalonpatna',
    site: '@kritikasalonpatna'
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    other: {
      'facebook-domain-verification': 'your-fb-verification-code'
    }
  },
  
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi" className="scroll-smooth">
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateLocalBusinessSchema())
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateWebsiteSchema())
          }}
        />
        
        {/* Additional SEO meta tags */}
        <meta name="geo.region" content="IN-BR" />
        <meta name="geo.placename" content="Patna" />
        <meta name="geo.position" content={`${BUSINESS_CONFIG.location.coordinates.latitude};${BUSINESS_CONFIG.location.coordinates.longitude}`} />
        <meta name="ICBM" content={`${BUSINESS_CONFIG.location.coordinates.latitude}, ${BUSINESS_CONFIG.location.coordinates.longitude}`} />
        
        {/* Mobile optimization */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Theme color */}
        <meta name="theme-color" content="#ec4899" />
        <meta name="msapplication-TileColor" content="#ec4899" />
      </head>
      <body className={`${inter.className} bg-gradient-to-br from-pink-50 via-white to-purple-50 min-h-screen`}>
        {/* Skip to main content for accessibility */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-pink-600 text-white px-4 py-2 rounded-lg z-50">
          Skip to main content
        </a>
        
        {/* Your existing Header/Navbar */}
        <Providers>
          <Navbar />
        
        {/* Main content */}
          <main id="main-content" className="flex-grow">
          {children}
          </main>
        
        {/* Your existing Footer */}
          <Footer />
        </Providers>

        {/* ✅ Vercel Analytics - Add this component */}
        <Analytics />


        {/* Google Analytics */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XXXXXXXXXX');
            `,
          }}
        />
        
        {/* Facebook Pixel */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', 'YOUR_PIXEL_ID');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </body>
    </html>
  );
}