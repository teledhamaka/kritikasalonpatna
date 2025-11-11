// ========================================
// components/blog/StructuredData.tsx - JSON-LD
// ========================================
'use client';

interface StructuredDataProps {
  type: 'BlogPosting' | 'Blog' | 'Person';
  data: any;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  let schema = {};

  if (type === 'BlogPosting') {
    schema = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: data.title,
      description: data.excerpt,
      image: data.coverImage,
      datePublished: data.publishedAt,
      dateModified: data.updatedAt || data.publishedAt,
      author: {
        '@type': 'Person',
        name: data.author.name,
        url: `https://yourwebsite.com/blog/author/${data.author.slug}`,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Beauty & You Salon',
        logo: {
          '@type': 'ImageObject',
          url: 'https://yourwebsite.com/logo.png',
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://yourwebsite.com/blog/${data.slug}`,
      },
    };
  } else if (type === 'Blog') {
    schema = {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Beauty & You Blog',
      description: 'Expert beauty tips and tutorials from Patna',
      url: 'https://yourwebsite.com/blog',
      publisher: {
        '@type': 'Organization',
        name: 'Beauty & You Salon',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Bhootnath Road',
          addressLocality: 'Patna',
          addressRegion: 'Bihar',
          postalCode: '800001',
          addressCountry: 'IN',
        },
      },
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
