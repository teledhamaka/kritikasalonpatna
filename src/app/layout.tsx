// src/app/layout.tsx - COMPLETE FIXED VERSION
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Image from 'next/image';
import Script from 'next/script';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppFloating from '../components/WhatsAppFloating';
import { Providers } from './providers';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

// Import SEO data
import seoData from '../../public/seo.json';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true
});

// Generate dynamic metadata from seo.json
export const metadata: Metadata = {
  title: {
    default: `${seoData.business.name} - ${seoData.business.tagline}`,
    template: `%s | ${seoData.business.name}`
  },
  description: seoData.business.description,
  keywords: [
    ...seoData.seo.serviceSpecificKeywords.hairServices,
    ...seoData.seo.serviceSpecificKeywords.skinServices,
    ...seoData.seo.serviceSpecificKeywords.nailServices,
    ...seoData.seo.serviceSpecificKeywords.bridalServices,
    ...seoData.seo.locationBasedKeywords.ultraLocal
  ].join(', '),
  
  authors: [{ name: seoData.business.name }],
  creator: seoData.business.name,
  publisher: seoData.business.name,
  
  metadataBase: new URL(seoData.business.contact.website),
  
  alternates: {
    canonical: '/',
  },
  
  manifest: '/manifest.json',
  
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: seoData.business.contact.website,
    siteName: seoData.business.name,
    title: seoData.business.name,
    description: seoData.business.description,
    images: [
      {
        url: `${seoData.business.contact.website}/icons/icon-512x512.png`,
        width: 512,
        height: 512,
        alt: seoData.business.name
      }
    ]
  },
  
  twitter: {
    card: 'summary_large_image',
    title: seoData.business.name,
    description: seoData.business.description,
    images: [`${seoData.business.contact.website}/icons/icon-512x512.png`],
    creator: `@${seoData.business.socialMedia.instagram}`
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
    google: 'Uj54YUbFFcOLdeffGXlZMH35yYC-N6HyO9Wdoxj_DXA',
    // yandex: 'your-yandex-verification-code',
    // other: {
    //   'facebook-domain-verification': 'your-fb-verification-code'
    // }
  },
  
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

  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: seoData.business.name
  },
  
  applicationName: seoData.business.name,
  formatDetection: {
    telephone: false
  },
  
  other: {
    'geo.region': `IN-${seoData.business.address.state}`,
    'geo.placename': `${seoData.business.address.city}, ${seoData.business.address.state}`,
    'geo.position': `${seoData.business.coordinates.latitude};${seoData.business.coordinates.longitude}`,
    'ICBM': `${seoData.business.coordinates.latitude}, ${seoData.business.coordinates.longitude}`,
    'rating': seoData.business.rating.toString(),
    'service-radius': seoData.business.serviceRadius
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ec4899' },
    { media: '(prefers-color-scheme: dark)', color: '#ec4899' }
  ],
  colorScheme: 'light',
  viewportFit: 'cover'
};

// Generate organization schema from seo.json
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "BeautySalon",
  "@id": `${seoData.business.contact.website}/#organization`,
  "name": seoData.business.name,
  "legalName": seoData.business.legalName,
  "description": seoData.business.description,
  "url": seoData.business.contact.website,
  "logo": `${seoData.business.contact.website}/logo.png`,
  "image": `${seoData.business.contact.website}/images/salon-exterior.jpg`,
  "telephone": seoData.business.contact.phone,
  "email": seoData.business.contact.email,
  "priceRange": "₹₹-₹₹₹",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": `${seoData.business.address.street}, ${seoData.business.address.locality}`,
    "addressLocality": seoData.business.address.city,
    "addressRegion": seoData.business.address.state,
    "postalCode": seoData.business.address.pincode,
    "addressCountry": seoData.business.address.country
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": seoData.business.coordinates.latitude,
    "longitude": seoData.business.coordinates.longitude
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": seoData.business.workingHours.weekdays.split(' - ')[0],
      "closes": seoData.business.workingHours.weekdays.split(' - ')[1]
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Saturday", "Sunday"],
      "opens": seoData.business.workingHours.weekends.split(' - ')[0],
      "closes": seoData.business.workingHours.weekends.split(' - ')[1]
    }
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": seoData.business.rating.toString(),
    "reviewCount": seoData.business.totalReviews.toString(),
    "bestRating": "5",
    "worstRating": "1"
  },
  "areaServed": {
    "@type": "GeoCircle",
    "geoMidpoint": {
      "@type": "GeoCoordinates",
      "latitude": seoData.business.coordinates.latitude,
      "longitude": seoData.business.coordinates.longitude
    },
    "geoRadius": seoData.business.serviceRadius
  },
  "sameAs": [
    `https://instagram.com/${seoData.business.socialMedia.instagram}`,
    `https://facebook.com/${seoData.business.socialMedia.facebook}`,
    `https://youtube.com/${seoData.business.socialMedia.youtube}`,
    seoData.localSEOOptimization.localCitations.justdial,
    seoData.localSEOOptimization.localCitations.googleMaps
  ],
  "hasMap": seoData.localSEOOptimization.localCitations.googleMaps,
  "paymentAccepted": "Cash, Credit Card, Debit Card, UPI, Net Banking"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth h-full">      
      <head>
        {/* Essential PWA Meta Tags */}
        <meta name="application-name" content={seoData.business.name} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content={seoData.business.name} />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#ec4899" />
        <meta name="theme-color" content="#ec4899" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />

        {/* iOS Splash Screens */}
        <link 
          rel="apple-touch-startup-image" 
          href="/splash/iphone5_splash.png" 
          media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" 
        />
        <link 
          rel="apple-touch-startup-image" 
          href="/splash/iphone6_splash.png" 
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" 
        />
        <link 
          rel="apple-touch-startup-image" 
          href="/splash/iphonex_splash.png" 
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" 
        />

        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        
        {/* Favicon */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <link rel="shortcut icon" href="/icons/icon-96x96.png" />

        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema)
          }}
        />

        {/* Preload critical CSS */}
        <style dangerouslySetInnerHTML={{
          __html: `
            .safe-area-inset {
              padding-left: env(safe-area-inset-left, 0px);
              padding-right: env(safe-area-inset-right, 0px);
              padding-bottom: env(safe-area-inset-bottom, 0px);
              padding-top: env(safe-area-inset-top, 0px);
            }
            @media (max-width: 768px) {
              html {
                overflow-x: hidden;
              }
              body {
                overflow-x: hidden;
                width: 100%;
                position: relative;
              }
            }
          `
        }} />
      </head>
      <body className={`
        ${inter.className} 
        bg-gradient-to-br from-pink-50 via-white to-purple-50 
        min-h-screen 
        h-full
        safe-area-inset
        overflow-x-hidden
        w-full
        relative
      `}>
        {/* Skip to main content */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-pink-600 text-white px-4 py-2 rounded-lg z-[100] touch-target"
        >
          Skip to main content
        </a>
        
        <Providers>
          <Navbar />
          <div className="flex flex-col min-h-screen">
            <main 
              id="main-content" 
              className="
                grow 
                w-full 
                min-h-[calc(100vh-200px)] 
                relative
                overflow-x-hidden
              "
            >
              {children}
            </main>
            <Footer />
          </div>
        </Providers>

        {/* Analytics */}
        <Analytics />
        <SpeedInsights />

        {/* Google Analytics */}
        <Script          
          src="https://www.googletagmanager.com/gtag/js?id=G-MS55SP8K7E"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-MS55SP8K7E');
          `}
        </Script>
        
        {/* Facebook Pixel */}
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
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
          `}
        </Script>
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