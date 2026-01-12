// src/app/sitemap.ts - SEO OPTIMIZED VERSION
import { MetadataRoute } from 'next';
import { createServerClient } from '@/lib/supabase/server';
import { getAllServiceSlugs } from '@/lib/services/service-mapper';
import { getAllLocationSlugs } from '@/lib/services/location-mapper';

// Import service data for sitemap generation
import makeupServices from '../../public/makeup_services.json';
import hairServices from '../../public/hair_services.json';
import nailServices from '../../public/nail_services.json';
import skinServices from '../../public/skin_services.json';
import seoData from '../../public/seo.json';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = seoData.business.contact.website;
  const supabase = await createServerClient();
  
  // Static pages with SEO priority
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/makeup`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/hair`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/skin`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/nail`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/booking`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  // Dynamic service pages from JSON
  const allServices = [
    ...makeupServices,
    ...hairServices,
    ...nailServices,
    ...skinServices
  ];

  const servicePages: MetadataRoute.Sitemap = allServices.map((service: any) => ({
    url: `${baseUrl}/service/${service.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: service.isTrending || service.isPopular ? 0.85 : 0.8,
  }));

  // Dynamic location pages
  let locationPages: MetadataRoute.Sitemap = [];
  try {
    const locationSlugs = getAllLocationSlugs();
    locationPages = locationSlugs.map((slug) => ({
      url: `${baseUrl}/location/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }));
  } catch (error) {
    console.error('Error generating location pages:', error);
  }

  // Combo pages (location + category)
  const serviceCategories = ['makeup', 'hair', 'skin', 'nail'];
  const comboPages: MetadataRoute.Sitemap = [];
  
  try {
    const locationSlugs = getAllLocationSlugs();
    locationSlugs.forEach(location => {
      serviceCategories.forEach(category => {
        comboPages.push({
          url: `${baseUrl}/location/${location}/${category}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.85,
        });
      });
    });
  } catch (error) {
    console.error('Error generating combo pages:', error);
  }

  // Blog posts
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, updated_at, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  const blogPages: MetadataRoute.Sitemap = (posts || []).map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at || post.published_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Blog categories
  const { data: blogCategories } = await supabase
    .from('categories')
    .select('slug, updated_at');

  const categoryPages: MetadataRoute.Sitemap = (blogCategories || []).map((cat) => ({
    url: `${baseUrl}/blog/category/${cat.slug}`,
    lastModified: new Date(cat.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Authors
  const { data: authors } = await supabase
    .from('authors')
    .select('slug, updated_at');

  const authorPages: MetadataRoute.Sitemap = (authors || []).map((author) => ({
    url: `${baseUrl}/blog/author/${author.slug}`,
    lastModified: new Date(author.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Nearby landmarks pages for local SEO
  const landmarkPages: MetadataRoute.Sitemap = [];
  const allLandmarks = [
    ...seoData.nearbyLandmarks.educational,
    ...seoData.nearbyLandmarks.residential,
    ...seoData.nearbyLandmarks.commercial,
    ...seoData.nearbyLandmarks.transport
  ];

  allLandmarks.slice(0, 30).forEach((landmark: any) => {
    const slug = landmark.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    landmarkPages.push({
      url: `${baseUrl}/near/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    });
  });

  return [
    ...staticPages,
    ...servicePages,
    ...locationPages,
    ...comboPages,
    ...blogPages,
    ...categoryPages,
    ...authorPages,
    ...landmarkPages
  ];
}