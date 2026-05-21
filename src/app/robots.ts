import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/', 
          '/trending', 
          '/combo',
          '/makeup',
          '/hair',
          '/skin',
          '/nails'
        ],
        disallow: [
          '/api/', 
          '/admin/', 
          '/private/',
          '/*?_rsc=' // Prevents Next.js internal data prefetch route bloating
        ],
      },
    ],
    sitemap: 'https://kritikasalonpatna.com/sitemap.xml',
  };
}