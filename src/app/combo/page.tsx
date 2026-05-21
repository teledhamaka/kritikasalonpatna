// app/combo/page.tsx
import { Metadata } from 'next';
import ClientComboPage from './ClientComboPage';
import { Service } from '../../types/service';
import comboServices from '../../../public/combo_services.json';
import seoData from '../../../public/seo.json';

const WEBSITE_URL = seoData.business.contact.website;
const ALL_COMBOS = comboServices as unknown as Service[];

export const metadata: Metadata = {
  title: `Best Beauty Combo Packages in Patna | Save on Makeup, Hair & Skin | ${seoData.business.name}`,
  description: `Save big with our curated beauty combo packages at Kritika Salon Patna. Bridal prep, party glam, hair spa, and premium skincare bundles starting from ₹${Math.min(...ALL_COMBOS.map(c => c.price))}. Book your slot online!`,
  keywords: [
    'beauty combo packages Patna',
    'bridal combo packages Patna',
    'makeup and hair combo salon Patna',
    'affordable beauty salon packages',
    'salon combo offers Bhootnath Road',
    'Kritika salon pre bridal packages',
    'skin and hair care combo offers',
    ...ALL_COMBOS.flatMap(c => c.seoKeywords || []),
  ].slice(0, 30),
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
  },
  alternates: {
    canonical: `${WEBSITE_URL}/combo`,
  },
  openGraph: {
    title: `Value-for-Money Beauty Combos at ${seoData.business.name} Patna`,
    description: `Pre-Bridal, Party Glam, Hair Smoothening, and Hydrafacial bundles. Relax and save 20-30% compared to individual salon rates.`,
    url: `${WEBSITE_URL}/combo`,
    siteName: seoData.business.name,
    locale: 'en_IN',
    type: 'website',
    images: [{ url: `${WEBSITE_URL}/images/og-combo.jpg`, width: 1200, height: 630, alt: 'Kritika Beauty Parlour Combo Packages' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Exclusive Beauty Combo Offers – Kritika Ladies Beauty Parlour Patna`,
    description: `Get professional bridal, makeup, skin, and hair combos under one roof. ${ALL_COMBOS.length}+ value packs available.`,
    images: [`${WEBSITE_URL}/images/twitter-combo.jpg`],
    creator: `@${seoData.business.socialMedia.instagram.replace('@', '')}`,
  },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      '@id': `${WEBSITE_URL}/combo#breadcrumb`,
      'itemListElement': [
        { '@type': 'ListItem', position: 1, name: 'Home', item: WEBSITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Combo Packages', item: `${WEBSITE_URL}/combo` },
      ],
    },
    {
      '@type': 'ItemList',
      '@id': `${WEBSITE_URL}/combo#itemlist`,
      name: 'Beauty Combo Packages in Patna',
      description: 'Curated budget-friendly beauty bundles matching professional makeup, global hair transformations, facial therapies, and nail art styling.',
      numberOfItems: ALL_COMBOS.length,
      itemListElement: ALL_COMBOS.map((combo, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: combo.url || `${WEBSITE_URL}/combo/${combo.slug}`,
        name: combo.title.split('|')[0].trim(),
      })),
    },
  ],
};

export default function ComboPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ClientComboPage combos={ALL_COMBOS} />
    </>
  );
}

export const dynamic = 'force-static';
export const revalidate = 3600;