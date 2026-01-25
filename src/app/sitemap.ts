// kritika/src/app/sitemap.ts - COMPREHENSIVE SITEMAP
import { MetadataRoute } from 'next'
import seoData from '../../public/seo.json'

// Import service data
import makeupServices from '../../public/makeup_services.json'
import hairServices from '../../public/hair_services.json'
import nailServices from '../../public/nail_services.json'
import skinServices from '../../public/skin_services.json'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = seoData.business.contact.website
  const currentDate = new Date().toISOString()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/appointments`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/profile`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Service category pages
  const categoryPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/makeup`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/hair`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/skin`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/nails`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ]

  // Individual service pages
  const allServices = [
    ...makeupServices,
    ...hairServices,
    ...nailServices,
    ...skinServices,
  ]

  const servicePages: MetadataRoute.Sitemap = allServices.map((service: any) => ({
    url: `${baseUrl}/service/${service.slug || service.id}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: service.isTrending || service.isBestSeller ? 0.9 : 0.8,
  }))

  // Location-based pages
  const locationPages: MetadataRoute.Sitemap = []

  // Generate location pages for each landmark
  const landmarks = [
    ...seoData.nearbyLandmarks.educational,
    ...seoData.nearbyLandmarks.healthcare,
    ...seoData.nearbyLandmarks.commercial,
    ...seoData.nearbyLandmarks.transport,
    ...seoData.nearbyLandmarks.residential,
    ...seoData.nearbyLandmarks.nearbyAreas,
  ]

  landmarks.forEach((landmark: any) => {
    const slug = landmark.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    locationPages.push({
      url: `${baseUrl}/location/${slug}`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  })

  // Service + Location combo pages (high-value)
  const comboPages: MetadataRoute.Sitemap = []
  const primaryServices = ['bridal-makeup', 'hair-spa', 'facial', 'nail-art']
  const primaryLocations = ['kankarbagh', 'bhootnath-road', 'zero-mile', 'medanta-hospital']

  primaryServices.forEach(service => {
    primaryLocations.forEach(location => {
      comboPages.push({
        url: `${baseUrl}/${service}-near-${location}`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.85,
      })
    })
  })

  // Combine all pages
  return [
    ...staticPages,
    ...categoryPages,
    ...servicePages,
    ...locationPages,
    ...comboPages,
  ]
}