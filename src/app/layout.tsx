// src/app/layout.tsx - PWA REMOVED (no friction for ladies customers)
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import 'globals';
import Image from 'next/image';
import Script from 'next/script';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Providers } from './providers';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import GlobalFloatingUI from '@/components/GlobalFloatingUI';

// Import SEO data
import seoData from '../../public/seo.json';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true
});

// ─── Metadata (PWA fields removed) ─────────────────────────────────────────
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
  
  // REMOVED: manifest: '/manifest.json',
  
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
  },
  
  // Simplified icons – only a basic favicon, no PWA touch icons
  icons: {
    icon: '/favicon.ico',  // simple fallback
  },

  // REMOVED: appleWebApp, formatDetection (telephone detection kept? optional)
  formatDetection: {
    telephone: false,  // keep to avoid auto-linking numbers
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

// ─── Viewport (basic only, no PWA theme color override) ─────────────────────
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  // keep theme color for browser UI (optional but harmless)
  themeColor: '#ec4899',
  colorScheme: 'light',
};

// ─── Organization Schema (unchanged) ────────────────────────────────────────
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
        {/* REMOVED all PWA meta tags and splash screens */}

        {/* Basic SEO / responsive */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="theme-color" content="#ec4899" />
        
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        
        {/* Simple favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema)
          }}
        />

        {/* Critical CSS for safe area / overflow */}
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
          {/* Fixed navbar (works on desktop & mobile) */}
          <header className="fixed top-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-md border-b border-pink-100">
            <Navbar />
          </header>

          {/* Top padding equals navbar height */}
          <div className="flex flex-col min-h-screen pt-[72px] md:pt-[80px]">
            <main id="main-content" className="grow w-full relative overflow-x-hidden">
              {children}
            </main>
            <Footer />
          </div>

          {/* Global floating UI – appears on every page */}
          <GlobalFloatingUI />
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
        
        {/* Facebook Pixel (optional – keep or remove as needed) */}
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
      </body>
    </html>
  );
}