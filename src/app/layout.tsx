// src/app/layout.tsx — PRODUCTION READY
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Script from 'next/script';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Providers } from './providers';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import GlobalFloatingUI from '@/components/GlobalFloatingUI';

import seoData from '../../public/seo.json';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default:  `${seoData.business.name} - ${seoData.business.tagline}`,
    template: `%s | ${seoData.business.name}`,
  },
  description: seoData.business.description,
  keywords: [
    ...seoData.seo.serviceSpecificKeywords.makeupServices.slice(0, 3),
    ...seoData.seo.serviceSpecificKeywords.hairServices.slice(0, 3),
    ...seoData.seo.serviceSpecificKeywords.skinServices.slice(0, 3),
    ...seoData.seo.serviceSpecificKeywords.nailServices.slice(0, 3),
    ...seoData.seo.locationBasedKeywords.ultraLocal.slice(0, 3),
  ].join(', '),

  authors:   [{ name: seoData.business.name }],
  creator:   seoData.business.name,
  publisher: seoData.business.name,

  metadataBase: new URL(seoData.business.contact.website),
  alternates: { canonical: '/' },

  openGraph: {
    type:        'website',
    locale:      'en_IN',
    url:         seoData.business.contact.website,
    siteName:    seoData.business.name,
    title:       seoData.business.name,
    description: seoData.business.description,
    images: [{
      url:    `${seoData.business.contact.website}/icons/icon-512x512.png`,
      width:  512,
      height: 512,
      alt:    seoData.business.name,
    }],
  },

  twitter: {
    card:        'summary_large_image',
    title:       seoData.business.name,
    description: seoData.business.description,
    images:      [`${seoData.business.contact.website}/icons/icon-512x512.png`],
    creator:     `@${seoData.business.socialMedia.instagram}`,
  },

  robots: {
    index:  true,
    follow: true,
    googleBot: {
      index:               true,
      follow:              true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet':       -1,
    },
  },

  verification: {
    google: 'Uj54YUbFFcOLdeffGXlZMH35yYC-N6HyO9Wdoxj_DXA',
  },

  icons: { icon: '/favicon.ico' },
  formatDetection: { telephone: false },

  other: {
    'geo.region':    `IN-${seoData.business.address.state}`,
    'geo.placename': `${seoData.business.address.city}, ${seoData.business.address.state}`,
    'geo.position':  `${seoData.business.coordinates.latitude};${seoData.business.coordinates.longitude}`,
    ICBM:            `${seoData.business.coordinates.latitude}, ${seoData.business.coordinates.longitude}`,
    rating:          seoData.business.rating.toString(),
    'service-radius': seoData.business.serviceRadius,
  },
};

export const viewport: Viewport = {
  width:         'device-width',
  initialScale:  1,
  maximumScale:  5,
  userScalable:  true,
  themeColor:    '#ec4899',
  colorScheme:   'light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fbPixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

  return (
    <html lang="en" className="scroll-smooth h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="icon" href="/favicon.ico" sizes="any" />

        <style dangerouslySetInnerHTML={{
          __html: `
            .safe-area-inset {
              padding-left:   env(safe-area-inset-left,   0px);
              padding-right:  env(safe-area-inset-right,  0px);
              padding-bottom: env(safe-area-inset-bottom, 0px);
              padding-top:    env(safe-area-inset-top,    0px);
            }
            @media (max-width: 768px) {
              html { overflow-x: hidden; }
              body { overflow-x: hidden; width: 100%; position: relative; }
            }
          `,
        }} />
      </head>

      <body className={`
        ${inter.className}
        bg-gradient-to-br from-pink-50 via-white to-purple-50
        min-h-screen h-full safe-area-inset overflow-x-hidden w-full relative
      `}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-pink-600 text-white px-4 py-2 rounded-lg z-[100]"
        >
          Skip to main content
        </a>

        <Providers>
          <header className="fixed top-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-md border-b border-pink-100">
            <Navbar />
          </header>

          <div className="flex flex-col min-h-screen pt-[72px] md:pt-[80px]">
            <main id="main-content" className="grow w-full relative overflow-x-hidden">
              {children}
            </main>
            <Footer />
          </div>

          <GlobalFloatingUI />
        </Providers>

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
        {fbPixelId && (
          <>
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
                fbq('init', '${fbPixelId}');
                fbq('track', 'PageView');
              `}
            </Script>
            <noscript>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                height="1" width="1"
                style={{ display: 'none' }}
                src={`https://www.facebook.com/tr?id=${fbPixelId}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}
      </body>
    </html>
  );
}