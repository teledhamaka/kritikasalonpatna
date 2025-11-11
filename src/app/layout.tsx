// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Image from 'next/image';
import Script from 'next/script';
import { BUSINESS_CONFIG } from '../lib/seo-config';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppFloating from '../components/WhatsAppFloating';
import { Providers } from './providers';
import PWARegister from '../components/PWARegister';
import PWAInstallPrompt from '../components/PWAInstallPrompt';

import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import FloatingInstallButton from '../components/FloatingInstallButton';

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
  
  // PWA Manifest - Updated to use our generated manifest
  manifest: '/manifest.json',
  
  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'hi_IN',
    url: 'https://kritikasalonpatna.com',
    siteName: BUSINESS_CONFIG.name,
    title: BUSINESS_CONFIG.name,
    description: BUSINESS_CONFIG.description,
    images: [
      {
        url: '/icons/icon-512x512.png', // Using our generated icon for OG
        width: 512,
        height: 512,
        alt: BUSINESS_CONFIG.name
      }
    ]
  },
  
  // Twitter Cards
  twitter: {
    card: 'summary_large_image',
    title: BUSINESS_CONFIG.name,
    description: BUSINESS_CONFIG.description,
    images: ['/icons/icon-512x512.png'], // Using our generated icon for Twitter
  },
  
  // Robots
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
  
  // Updated Icons for PWA - Using all generated icons
  icons: {
    icon: [
      { url: '/icons/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: [
      { url: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' }
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/icons/icon-152x152.png',
      },
    ]
  },

  // Apple Web App Capabilities
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Kritika Salon'
  },
  
  applicationName: 'Kritika Salon',
  formatDetection: {
    telephone: false
  }
};

// PWA Viewport configuration
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ec4899' },
    { media: '(prefers-color-scheme: dark)', color: '#ec4899' }
  ],
  colorScheme: 'light'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi" className="scroll-smooth">      
      <head>
        {/* Essential PWA Meta Tags */}
        <meta name="application-name" content="Kritika Salon" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Kritika Salon" />
        <meta name="description" content={BUSINESS_CONFIG.description} />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#ec4899" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#ec4899" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-152x152.png" />

        {/* iOS Splash Screens - Updated with all generated splash screens */}
        <link 
          rel="apple-touch-startup-image" 
          href="/splash/iphone5_splash.png" 
          media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" 
        />
        <link 
          rel="apple-touch-startup-image" 
          href="/splash/iphone6_splash.png" 
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" 
        />
        <link 
          rel="apple-touch-startup-image" 
          href="/splash/iphoneplus_splash.png" 
          media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" 
        />
        <link 
          rel="apple-touch-startup-image" 
          href="/splash/iphonex_splash.png" 
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" 
        />
        <link 
          rel="apple-touch-startup-image" 
          href="/splash/iphonexr_splash.png" 
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" 
        />
        <link 
          rel="apple-touch-startup-image" 
          href="/splash/iphonexsmax_splash.png" 
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" 
        />
        <link 
          rel="apple-touch-startup-image" 
          href="/splash/ipad_splash.png" 
          media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" 
        />
        <link 
          rel="apple-touch-startup-image" 
          href="/splash/ipadpro1_splash.png" 
          media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" 
        />
        <link 
          rel="apple-touch-startup-image" 
          href="/splash/ipadpro2_splash.png" 
          media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" 
        />

        {/* Landscape Splash Screens */}
        <link 
          rel="apple-touch-startup-image" 
          href="/splash/iphone5_splash.png" 
          media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" 
        />
        <link 
          rel="apple-touch-startup-image" 
          href="/splash/iphone6_splash.png" 
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" 
        />
        <link 
          rel="apple-touch-startup-image" 
          href="/splash/iphoneplus_splash.png" 
          media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)" 
        />

        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Favicon for older browsers */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <link rel="shortcut icon" href="/icons/icon-96x96.png" />

        {/* Local Business Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BeautySalon",
              "name": "Kritika Salon Patna",
              "url": "https://kritikasalonpatna.com",
              "description": "Premium ladies beauty parlour in Patna offering bridal makeup, skincare, hair & nail services. Where every woman is a heroine.",
              "telephone": "+91-9650461390",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Bhootnath Road",
                "addressLocality": "Patna",
                "addressRegion": "Bihar",
                "postalCode": "800010",
                "addressCountry": "IN"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "25.6154",
                "longitude": "85.1354"
              },
              "openingHours": "Mo-Su 09:00-20:00",
              "priceRange": "₹₹",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "reviewCount": "5000"
              }
            })
          }}
        />
      </head>
      <body className={`${inter.className} bg-linear-to-br from-pink-50 via-white to-purple-50 min-h-screen`}>
        {/* Skip to main content for accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-pink-600 text-white px-4 py-2 rounded-lg z-50"
        >
          Skip to main content
        </a>
        
        {/* Your existing Header/Navbar */}
        <Providers>
          <Navbar />
        
          {/* Main content */}
          <main id="main-content" className="grow">
            {children}
          </main>
        
          {/* Your existing Footer */}
          <Footer />
        </Providers>

        {/* PWA Service Worker Registration */}
        <PWARegister />

        {/* PWA Install Prompt */}
        <PWAInstallPrompt />

        {/* Floating Install Button */}
        <FloatingInstallButton />

        {/* Vercel Analytics */}
        <Analytics />
        <SpeedInsights />

        {/* Google Analytics */}
        <Script          
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `}
        </Script>
        
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
          <Image
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        
        {/* WhatsApp Floating Button */}
        <WhatsAppFloating />
      </body>
    </html>
  );
}