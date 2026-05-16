// app/combo/page.tsx
import { Metadata } from 'next';
import ClientComboPage from './ClientComboPage';
import { Service } from '../../types/service';
import comboServices from '../../../public/combo_services.json';
import seoData from '../../../public/seo.json';

const WEBSITE_URL = seoData.business.contact.website;
const ALL_COMBOS = comboServices as unknown as Service[];

// ─── Metadata (enhanced with twitter & explicit robots) ─────────────────────
export const metadata: Metadata = {
  title: `Best Combo Packages in Patna | Save ₹₹ on Makeup, Hair & Skin | ${seoData.business.name}`,
  description: `Save big with our curated beauty combos – bridal prep, party glam, hair + skin treatments. ${ALL_COMBOS.length}+ combo packages starting from ₹${Math.min(...ALL_COMBOS.map(c => c.price))}. Book online!`,
  keywords: [
    'beauty combo packages Patna',
    'bridal combo Patna',
    'makeup + hair combo',
    'affordable beauty packages',
    'salon combo offers Bhootnath Road',
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
    title: `Combo Packages at ${seoData.business.name} – Save More, Glow More`,
    description: `Bridal, party, and skincare combos – all at discounted prices. Trusted by 5000+ Patna women.`,
    url: `${WEBSITE_URL}/combo`,
    siteName: seoData.business.name,
    locale: 'en_IN',
    type: 'website',
    images: [{ url: `${WEBSITE_URL}/images/og-combo.jpg`, width: 1200, height: 630, alt: 'Kritika Beauty Combo Packages' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Combo Packages – Kritika Ladies Beauty Parlour Patna`,
    description: `Save up to 30% on bridal, makeup, hair & skin combos. ${ALL_COMBOS.length}+ packages available.`,
    images: [`${WEBSITE_URL}/images/twitter-combo.jpg`],
    creator: `@${seoData.business.socialMedia.instagram.replace('@', '')}`,
  },
};

// ─── Structured Data: ItemList + Breadcrumb ─────────────────────────────────
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: WEBSITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Combo Packages', item: `${WEBSITE_URL}/combo` },
      ],
    },
    {
      '@type': 'ItemList',
      name: 'Beauty Combo Packages in Patna',
      description: 'Curated beauty combos with makeup, hair, skin, and nail services at special prices.',
      numberOfItems: ALL_COMBOS.length,
      itemListElement: ALL_COMBOS.map((combo, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `${WEBSITE_URL}/combo/${combo.slug}`,
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