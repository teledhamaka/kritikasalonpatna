// scripts/generate-seo-pages.js (adapted to your schema)
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const LOCATION_DATA = { /* same as before */ };
const SERVICE_SEO = { /* same as before */ };

async function generateJunction() {
  // Fetch services using your column names
  const { data: services } = await supabase
    .from('services')
    .select('id, slug, name, base_price, description')
    .in('slug', Object.keys(SERVICE_SEO));

  const { data: locations } = await supabase
    .from('locations')
    .select('id, slug')
    .in('slug', Object.keys(LOCATION_DATA));

  for (const service of services) {
    const seo = SERVICE_SEO[service.slug];
    if (!seo) continue;

    for (const location of locations) {
      const loc = LOCATION_DATA[location.slug];
      const canonicalUrl = `https://www.kritikasalonpatna.com/${location.slug}/${service.slug}`;

      const metaTitle = `${seo.title} | Patna | Book Now`;
      const metaDescription = `${seo.desc} Book your appointment at our ${location.slug.replace(/-/g, ' ')} salon.`;

      const extraAreas = loc.landmarks.length > 2
        ? loc.landmarks.slice(2).join(' and ')
        : 'nearby areas';

      const localDescription = `
Experience ${seo.title} at Kritika Ladies Parlour, ${loc.name} Patna.

Located just 2 minutes from ${loc.landmarks[0]} and close to ${loc.landmarks[1] || 'Patna Junction'}, our salon is a convenient choice for college students, office professionals, and brides-to-be in ${loc.name} and nearby areas.

Many of our clients visit from ${extraAreas} for quick, reliable, and hygienic beauty services.

✔ Lakme certified experts
✔ Hygienic & safe service
✔ Affordable pricing
✔ Trusted by 1000+ clients in Patna

Book your appointment today for best results.
      `;

      const { error } = await supabase.from('service_location_pages').upsert({
        service_id: service.id,
        location_id: location.id,
        meta_title: metaTitle,
        meta_description: metaDescription,
        canonical_url: canonicalUrl,
        local_description: localDescription,
        local_highlights: ['Lakme Certified Experts', `Near ${loc.landmarks[0]}`, 'Hygienic & Safe', 'Affordable Pricing'],
        local_price: null, // will fallback to service.base_price
        nearby_landmarks: loc.landmarks,
        seo_keywords: seo.keywords,
        local_reviews: [
          {
            customer_name: 'Priya S.',
            rating: 5,
            review_text: `Best ${seo.title} in ${loc.name}. Highly recommended!`
          }
        ]
      }, { onConflict: 'service_id, location_id' });

      if (error) console.error(`❌ ${location.slug}/${service.slug}`, error);
      else console.log(`✅ ${location.slug}/${service.slug}`);
    }
  }
}

generateJunction();