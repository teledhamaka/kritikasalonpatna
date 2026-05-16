// src/scripts/verify-pages.ts
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Define your locations (same as in generate-junction.ts)
const LOCATION_SLUGS = ['bhootnath-road', 'kankarbagh', 'patna-city']

// Helper: load all service slugs from your JSON files
function getAllServiceSlugs(): string[] {
  const publicDir = path.join(process.cwd(), 'public')
  const files = [
    'makeup_services.json',
    'hair_services.json',
    'skin_services.json',
    'nail_services.json',
    'test_services.json',
  ]
  const slugs: string[] = []
  for (const file of files) {
    const filePath = path.join(publicDir, file)
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      slugs.push(...data.map((s: any) => s.slug))
    }
  }
  return [...new Set(slugs)]
}

async function main() {
  console.log('\n🔍 Verifying service_location_pages...\n')

  const serviceSlugs = getAllServiceSlugs()
  console.log(`Services found: ${serviceSlugs.length}`)
  console.log(`Locations: ${LOCATION_SLUGS.length}`)
  console.log(`Expected combinations: ${serviceSlugs.length * LOCATION_SLUGS.length}\n`)

  let missing = 0
  let shortDescriptions = 0
  let wordCounts: number[] = []

  for (const serviceSlug of serviceSlugs) {
    // fetch service id
    const { data: service, error: sErr } = await supabase
      .from('services')
      .select('id')
      .eq('slug', serviceSlug)
      .single()
    if (sErr || !service) {
      console.log(`⚠️  Service not found in DB: ${serviceSlug}`)
      continue
    }

    for (const locSlug of LOCATION_SLUGS) {
      const { data: location, error: lErr } = await supabase
        .from('locations')
        .select('id')
        .eq('slug', locSlug)
        .single()
      if (lErr || !location) {
        console.log(`⚠️  Location not found: ${locSlug}`)
        continue
      }

      const { data: page, error } = await supabase
        .from('service_location_pages')
        .select('local_description')
        .eq('service_id', service.id)
        .eq('location_id', location.id)
        .single()

      if (error || !page) {
        console.log(`❌ Missing: ${locSlug}/${serviceSlug}`)
        missing++
        continue
      }

      const wordCount = page.local_description?.split(/\s+/).length || 0
      wordCounts.push(wordCount)
      if (wordCount < 500) {
        console.log(`⚠️  Short (<500 words): ${locSlug}/${serviceSlug} (${wordCount} words)`)
        shortDescriptions++
      }
    }
  }

  const avg = wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length || 0

  console.log(`\n${'─'.repeat(55)}`)
  console.log(`✅ Pages found: ${wordCounts.length}`)
  console.log(`❌ Missing pages: ${missing}`)
  console.log(`⚠️  Pages with <500 words: ${shortDescriptions}`)
  console.log(`📊 Average word count: ${Math.round(avg)}`)
  console.log(`\n${missing === 0 && shortDescriptions === 0 ? '🚀 All pages ready!' : '⚠️ Run generate-pages to fix issues'}\n`)
}

main().catch(console.error)