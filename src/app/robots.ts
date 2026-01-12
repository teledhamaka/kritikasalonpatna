// src/app/robots.ts - SEO OPTIMIZED VERSION
import { MetadataRoute } from "next";
import seoData from '../../public/seo.json';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = seoData.business.contact.website;
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/private/',
          '/_next/',
          '/static/',
          '/dashboard/',
          '/booking/confirm',
          '/checkout/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        crawlDelay: 0,
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
        disallow: ['/private/', '/admin/']
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        crawlDelay: 1,
      },
      // Block AI scrapers while allowing search engines
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: '/',
      },
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
      {
        userAgent: 'anthropic-ai',
        disallow: '/',
      },
      {
        userAgent: 'Claude-Web',
        disallow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}