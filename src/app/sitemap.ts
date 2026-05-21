import { MetadataRoute } from 'next';
import { createServerClient } from '@/lib/supabase/server';
import { getAllServiceSlugs }  from '@/lib/services/service-mapper';
import { getAllLocationSlugs } from '@/lib/services/location-mapper';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl  = 'https://kritikasalonpatna.com';
  const BUILD_NOW = new Date(); // Single unified timestamp for build execution consistency

  // ── Static Pages Index ───────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl,                 lastModified: BUILD_NOW, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${baseUrl}/trending`,   lastModified: BUILD_NOW, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${baseUrl}/blog`,       lastModified: BUILD_NOW, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${baseUrl}/nails`,      lastModified: BUILD_NOW, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${baseUrl}/makeup`,     lastModified: BUILD_NOW, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${baseUrl}/skin`,       lastModified: BUILD_NOW, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${baseUrl}/hair`,       lastModified: BUILD_NOW, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${baseUrl}/combo`,      lastModified: BUILD_NOW, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${baseUrl}/booking`,    lastModified: BUILD_NOW, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/about`,      lastModified: BUILD_NOW, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`,    lastModified: BUILD_NOW, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/gallery`,    lastModified: BUILD_NOW, changeFrequency: 'weekly',  priority: 0.7 },
  ];

  // ── Dynamic Service Slugs ────────────────────────────────────────────────
  let servicePages: MetadataRoute.Sitemap = [];
  try {
    servicePages = getAllServiceSlugs().map(slug => ({
      url:              `${baseUrl}/service/${slug}`,
      lastModified:     BUILD_NOW,
      changeFrequency:  'weekly' as const,
      priority:         0.8,
    }));
  } catch (e) {
    console.error('Sitemap Execution: Service slugs fetch safely caught:', e);
  }

  // ── Dynamic Location Slugs ───────────────────────────────────────────────
  let locationPages: MetadataRoute.Sitemap = [];
  try {
    locationPages = getAllLocationSlugs().map(slug => ({
      url:              `${baseUrl}/location/${slug}`,
      lastModified:     BUILD_NOW,
      changeFrequency:  'weekly' as const,
      priority:         0.9,
    }));
  } catch (e) {
    console.error('Sitemap Execution: Location slugs fetch safely caught:', e);
  }

  // ── Dynamic Blog Posts Index ─────────────────────────────────────────────
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const supabase = await createServerClient();
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug, updated_at, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    blogPages = (posts || []).map(post => ({
      url:              `${baseUrl}/blog/${post.slug}`,
      lastModified:     new Date(post.updated_at || post.published_at),
      changeFrequency:  'weekly' as const,
      priority:         0.8,
    }));
  } catch (e) {
    console.error('Sitemap Execution: Published blog posts fetch safely caught:', e);
  }

  // ── Dynamic Blog Categories Index ────────────────────────────────────────
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const supabase = await createServerClient();
    const { data: blogCategories } = await supabase
      .from('categories')
      .select('slug, updated_at');

    categoryPages = (blogCategories || []).map(cat => ({
      url:              `${baseUrl}/blog/category/${cat.slug}`,
      lastModified:     new Date(cat.updated_at || BUILD_NOW),
      changeFrequency:  'weekly' as const,
      priority:         0.7,
    }));
  } catch (e) {
    console.error('Sitemap Execution: Blog categories fetch safely caught:', e);
  }

  // ── Dynamic Authors Index ────────────────────────────────────────────────
  let authorPages: MetadataRoute.Sitemap = [];
  try {
    const supabase = await createServerClient();
    const { data: authors } = await supabase
      .from('authors')
      .select('slug, updated_at');

    authorPages = (authors || []).map(author => ({
      url:              `${baseUrl}/blog/author/${author.slug}`,
      lastModified:     new Date(author.updated_at || BUILD_NOW),
      changeFrequency:  'weekly' as const,
      priority:         0.6,
    }));
  } catch (e) {
    console.error('Sitemap Execution: Authors engine fetch safely caught:', e);
  }

  return [
    ...staticPages,
    ...servicePages,
    ...locationPages,
    ...blogPages,
    ...categoryPages,
    ...authorPages,
  ];
}