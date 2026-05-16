// scripts/generate-junction.ts
// FINAL PRODUCTION VERSION (FIXED FOR SUPABASE SCHEMA)

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

import {
  generateLocalDescription,
  generateSEOKeywords,
  generateMetaTitle,
  generateMetaDescription,
  generateLocalHighlights,
  generateLocalReviews,
  generateGenericDescription,
  type ServiceJSON,
  type LocationProfile,
} from './generate-local-content'

dotenv.config({ path: '.env.local' })

// ─────────────────────────────────────────────────────────────
// Supabase Client
// ─────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ─────────────────────────────────────────────────────────────
// Location Profiles
// ─────────────────────────────────────────────────────────────
const LOCATION_PROFILES: Record<string, LocationProfile> = {
  'bhootnath-road': {
    slug: 'bhootnath-road',
    name: 'Bhootnath Road',
    landmarks: ['Bhootnath Metro Station', 'NMCH Hospital', 'Bazar Samiti', 'Bhagwat Nagar'],
    clientProfile: 'college students, medical professionals, working women',
    proximity: '2 minutes from Bhootnath Metro Station',
    localTrait: 'Patna’s busiest metro corridor — most convenient salon',
    priceMultiplier: 1.0,
    reviewNames: ['Priya Sharma', 'Aarti Singh', 'Neha Kumari', 'Sunita Devi', 'Ritu Gupta'],
  },
  'kankarbagh': {
    slug: 'kankarbagh',
    name: 'Kankarbagh',
    landmarks: ['Kankarbagh Overbridge', 'Patna Junction', 'Exhibition Road', 'R Block'],
    clientProfile: 'families, office workers, brides',
    proximity: '5 minutes from Kankarbagh Overbridge',
    localTrait: 'Trusted residential salon for years',
    priceMultiplier: 0.95,
    reviewNames: ['Anjali Verma', 'Shikha Rani', 'Mamta Singh', 'Kavita Devi', 'Pooja Kumari'],
  },
  'patna-city': {
    slug: 'patna-city',
    name: 'Patna City',
    landmarks: ['Gandhi Maidan', 'Patna Sahib', 'Ashok Rajpath'],
    clientProfile: 'traditional families, brides, govt employees',
    proximity: '7 minutes from Gandhi Maidan',
    localTrait: 'Blend of traditional + modern beauty expertise',
    priceMultiplier: 0.9,
    reviewNames: ['Savita Prasad', 'Meena Devi', 'Rekha Sinha', 'Usha Kumari', 'Geeta Singh'],
  },
}

// ─────────────────────────────────────────────────────────────
// Load JSON Files
// ─────────────────────────────────────────────────────────────
function loadServiceFiles(): ServiceJSON[] {
  const publicDir = path.join(process.cwd(), 'public')

  const files = [
    'makeup_services.json',
    'hair_services.json',
    'skin_services.json',
    'nail_services.json',
    'combo_services.json',
  ]

  const all: ServiceJSON[] = []

  for (const file of files) {
    const filePath = path.join(publicDir, file)

    if (!fs.existsSync(filePath)) {
      console.log(`⏭ Skipping ${file}`)
      continue
    }

    try {
      const raw = fs.readFileSync(filePath, 'utf-8')
      const parsed = JSON.parse(raw) as ServiceJSON[]

      console.log(`✅ ${file}: ${parsed.length}`)
      all.push(...parsed)
    } catch (err) {
      console.error(`❌ Error in ${file}`, err)
    }
  }

  return all
}

// ─────────────────────────────────────────────────────────────
// Safe Service Upsert (CRITICAL FIX)
// ─────────────────────────────────────────────────────────────
async function upsertService(service: ServiceJSON): Promise<string | null> {
  const allowedTypes = ['combo', 'makeup', 'skin', 'hair', 'nail', 'spa', 'other']

  const cleanTitle =
    service.title?.split('|')[0]?.trim() ||
    service.slug ||
    'Unnamed Service'

  const serviceType = allowedTypes.includes(service.category)
    ? service.category
    : 'other'

  const basePrice = service.price ?? 0;
  const durationMinutes = service.duration ?? 30;

  // ✅ Generate generic HTML description for category pages
  const genericDescription = generateGenericDescription(service);

  const { data, error } = await supabase
    .from('services')
    .upsert({
      // REQUIRED FIELDS
      name: cleanTitle,
      slug: service.slug,
      service_type: serviceType,
      description: service.description || 'No description available',
      base_price: basePrice,
      duration_minutes: durationMinutes,

      image: service.image || `/images/${service.category || 'service'}/default.webp`,

      // OPTIONAL
      title: cleanTitle,
      short_description: service.shortDescription || null,

     // image: service.image || null,           // image field added

      price: service.price ?? null,
      original_price: service.originalPrice ?? null,

      duration: service.duration ?? null,
      duration_text: service.durationText ?? null,

      rating: service.rating ?? null,
      review_count: service.reviewCount ?? 0,
      booking_count: service.bookingCount ?? 0,

      category: service.category ?? null,
      primary_category: service.category ?? null,

      seo_keywords: service.seoKeywords ?? [],
      benefits: service.benefits ?? [],
      whats_included: service.whatsIncluded ?? [],
      whats_not_included: service.whatsNotIncluded ?? [],

      faqs: service.faqs ?? [],

      is_trending: service.isTrending ?? false,
      is_popular: service.isPopular ?? false,
      is_best_seller: service.isBestSeller ?? false,

      // 🆕 Generic rich description for category pages
      generic_description: genericDescription,


    }, { onConflict: 'slug' })
    .select('id')
    .single()

  if (error) {
    console.error(`❌ Service upsert failed (${service.slug}):`, error.message)
    return null
  }

  return data?.id || null
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🚀 GENERATING JUNCTION PAGES\n')

  const services = loadServiceFiles()
  console.log(`\nTotal services: ${services.length}`)

  const { data: locations, error } = await supabase
    .from('locations')
    .select('id, slug')
    .eq('is_active', true)

  if (error || !locations) {
    console.error('❌ Failed to load locations')
    return
  }

  console.log(`Locations: ${locations.map(l => l.slug).join(', ')}`)

  let success = 0
  let failed = 0

  for (const service of services) {
    console.log(`\n📋 ${service.slug}`)

    const serviceId = await upsertService(service)
    if (!serviceId) {
      failed++
      continue
    }

    for (const loc of locations) {
      const profile = LOCATION_PROFILES[loc.slug]
      if (!profile) continue

      const basePrice = service.price ?? 0
      const finalPrice = Math.round(basePrice * profile.priceMultiplier)

      const { error: pageError } = await supabase
        .from('service_location_pages')
        .upsert({
          service_id: serviceId,
          location_id: loc.id,

          meta_title: generateMetaTitle(service, profile),
          meta_description: generateMetaDescription(service, profile),
          canonical_url: `/${loc.slug}/${service.slug}`,

          local_description: generateLocalDescription(service, profile),
          local_highlights: generateLocalHighlights(service, profile),

          local_price: finalPrice !== basePrice ? finalPrice : null,
          nearby_landmarks: profile.landmarks,

          seo_keywords: generateSEOKeywords(service, profile),
          local_reviews: generateLocalReviews(service, profile),

          is_active: true,
        }, { onConflict: 'service_id,location_id' })

      if (pageError) {
        console.error(`❌ Page failed (${loc.slug}):`, pageError.message)
        failed++
      } else {
        console.log(`✅ ${loc.slug} — ₹${finalPrice}`)
        success++
      }
    }
  }

  console.log('\n──────────── FINAL ────────────')
  console.log(`✅ Success: ${success}`)
  console.log(`❌ Failed: ${failed}`)
}

main().catch(console.error)