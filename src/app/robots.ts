import { MetadataRoute } from 'next';

// IMPORTANT: this must exactly match the domain used in metadataBase (seo.json)
// and in sitemap.ts. Confirmed from your live URLs (hair-smoothening-patna etc.)
// that the canonical host is the www version.
const SITE_URL = 'https://www.kritikasalonpatna.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        // No 'allow' whitelist: everything is crawlable by default except what's
        // explicitly disallowed below. The previous version's 'allow' list
        // (only home + 5 category pages) did not actually block anything else
        // (allow doesn't work as a whitelist without a leading 'disallow: /'),
        // but it's misleading to read and worth removing.
        disallow: [
          '/api/',
          '/admin/',
          '/blog/admin/',       // <-- was NOT blocked before: CMS editor was crawlable
          '/blog/admin/edit/',
          '/blog/admin/analytics/',
          '/private/',
          '/cart',
          '/*?_rsc=',           // Next.js internal data prefetch route bloat
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
