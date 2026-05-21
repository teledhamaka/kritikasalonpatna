// app/bridal/page.tsx
import { Metadata } from 'next';
import ClientBridalPage from './ClientBridalPage';
import { Service } from '../../types';

// Multi-Source Catalog Ingestion
import comboServices from '../../../public/combo_services.json';
import makeupServices from '../../../public/makeup_services.json';
import skinServices from '../../../public/skin_services.json';
import hairServices from '../../../public/hair_services.json';
import nailServices from '../../../public/nail_services.json';
import seoData from '../../../public/seo.json';

const WEBSITE_URL = seoData.business.contact.website;

// Centralized matching pipeline across multi-file architectures
function extractBridalServices(services: any[], sourceCategory: string): Service[] {
  if (!Array.isArray(services)) return [];
  
  return services
    .filter((s: any) => {
      const titleMatch = s.title?.toLowerCase().includes('bridal');
      const nameMatch = s.name?.toLowerCase().includes('bridal');
      const idMatch = s.id?.toLowerCase().includes('bridal');
      const tagMatch = s.tags?.some((t: string) => t.toLowerCase().includes('bridal'));
      const catMatch = s.category?.toLowerCase().includes('bridal');

      return !!(titleMatch || nameMatch || idMatch || tagMatch || catMatch);
    })
    .map((s: any) => ({
      ...s,
      category: s.category || sourceCategory,
    })) as Service[];
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Premium Bridal Makeup Packages in Patna | Wedding Makeovers | ${seoData.business.name}`,
    description: `Discover premium pre-bridal grooming and luxury wedding makeover packages at Kritika Salon Patna. Crafted by certified experts using high-definition & airbrush configurations.`,
    alternates: {
      canonical: `${WEBSITE_URL}/bridal`,
    },
    openGraph: {
      title: `Exquisite Bridal Makeover & Pre-Bridal Packages – ${seoData.business.name}`,
      description: `Complete bridal transformations combining high-definition makeup, global hair styling, and premium skin facials.`,
      url: `${WEBSITE_URL}/bridal`,
      siteName: seoData.business.name,
      type: 'website',
    },
  };
}

export default function BridalPage() {
  // Combine matching objects from all JSON files
  const allBridalServices: Service[] = [
    ...extractBridalServices(comboServices, 'combo'),
    ...extractBridalServices(makeupServices, 'makeup'),
    ...extractBridalServices(skinServices, 'skin'),
    ...extractBridalServices(hairServices, 'hair'),
    ...extractBridalServices(nailServices, 'nail'),
  ];

  // De-duplicate any intersecting object keys across files safely
  const uniqueBridalMap = new Map<string, Service>();
  allBridalServices.forEach(service => {
    if (service.id) uniqueBridalMap.set(service.id, service);
  });
  const finalizedBridalServices = Array.from(uniqueBridalMap.values());

  return <ClientBridalPage bridalServices={finalizedBridalServices} />;
}

export const dynamic = 'force-static';
export const revalidate = 3600;