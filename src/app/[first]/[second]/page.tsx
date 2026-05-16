// app/[first]/[second]/page.tsx - with adjusted padding and z-index
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createServerClient } from '@/lib/supabase/server';
import { createStaticClient } from '@/lib/supabase/static-client';
import { Phone, Star, Clock, ArrowRight } from 'lucide-react';

interface PageProps {
  params: Promise<{ first: string; second: string }>;
}

// ─── Static generation (unchanged) ─────────────────────────────────────────
export async function generateStaticParams() {
  const supabase = createStaticClient();
  const { data: pages } = await supabase
    .from('service_location_pages')
    .select('locations(slug), services(slug)')
    .eq('is_active', true);
  const locationPairs = (pages ?? [])
    .map((p: any) => ({ first: p.locations?.slug, second: p.services?.slug }))
    .filter((p: any) => p.first && p.second);
  const { data: services } = await supabase
    .from('services')
    .select('category, slug')
    .eq('is_active', true);
  const categoryPairs = (services ?? [])
    .filter((s: any) => s.category)
    .map((s: any) => ({ first: s.category.toLowerCase(), second: s.slug }));
  const allPairs = [...locationPairs, ...categoryPairs];
  const uniqueMap = new Map<string, { first: string; second: string }>();
  for (const pair of allPairs) {
    const key = `${pair.first}|${pair.second}`;
    if (!uniqueMap.has(key)) uniqueMap.set(key, pair);
  }
  return Array.from(uniqueMap.values());
}

export const revalidate = 86400;

// ─── Metadata (unchanged) ──────────────────────────────────────────────────
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { first, second: serviceSlug } = await params;
  const supabase = await createServerClient();
  const { data: location } = await supabase
    .from('locations')
    .select('id, name')
    .eq('slug', first)
    .single();
  const { data: service } = await supabase
    .from('services')
    .select('id, title, short_description, image, category, seo_keywords')
    .eq('slug', serviceSlug)
    .single();
  if (!service) return { title: 'Not Found' };
  if (location) {
    const { data: junction } = await supabase
      .from('service_location_pages')
      .select('meta_title, meta_description')
      .eq('location_id', location.id)
      .eq('service_id', service.id)
      .single();
    return {
      title: junction?.meta_title || `${service.title} in ${location.name} | Kritika Salon`,
      description: junction?.meta_description || service.short_description,
      openGraph: { images: service.image ? [{ url: service.image }] : [] },
    };
  } else {
    return {
      title: `${service.title} in Patna | Best ${service.category} Service | Kritika Salon`,
      description: `${service.short_description}. Professional beauty service in Patna with Lakme-certified experts, premium products, hygienic salon environment, and affordable pricing.`,
      keywords: [
        ...(service.seo_keywords || []),
        `${service.title} in Patna`,
        `best ${service.category} in Patna`,
        `${service.title} near me`,
        `Kritika Ladies Parlour Patna`
      ],
      openGraph: {
        title: `${service.title} in Patna | Kritika Salon`,
        description: service.short_description,
        images: service.image ? [{ url: service.image }] : [],
      },
    };
  }
}

// ─── Page Component ─────────────────────────────────────────────────────────
export default async function DynamicServicePage({ params }: PageProps) {
  const { first, second: serviceSlug } = await params;
  const supabase = await createServerClient();

  const { data: service } = await supabase
    .from('services')
    .select('*')
    .eq('slug', serviceSlug)
    .single();
  if (!service) notFound();

  const { data: location } = await supabase
    .from('locations')
    .select('*')
    .eq('slug', first)
    .single();

  // ─────────────────────────────────────────────────────────────
  // LOCATION-SPECIFIC PAGE
  // ─────────────────────────────────────────────────────────────
  if (location) {
    const { data: junction } = await supabase
      .from('service_location_pages')
      .select('*')
      .eq('service_id', service.id)
      .eq('location_id', location.id)
      .single();

    const finalPrice = junction?.local_price ?? service.price;
    const savings = service.original_price ? service.original_price - finalPrice : 0;
    const landmarks = junction?.nearby_landmarks ?? [location.landmark];
    const highlights = junction?.local_highlights ?? [];
    const reviews = junction?.local_reviews ?? [];

    return (
      <>
        <div className="max-w-3xl mx-auto px-4 py-6 pb-40 md:pb-28"> {/* increased bottom padding */}
          <nav className="text-sm text-gray-400 mb-5 flex items-center gap-1 flex-wrap">
            <Link href="/" className="hover:text-rose-500">Home</Link>
            <span className="text-gray-300">/</span>
            <Link href={`/${location.slug}`} className="hover:text-rose-500">{location.name}</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-700">{service.title}</span>
          </nav>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            {service.image && (
              <div className="relative aspect-video">
                <Image src={service.image} alt={service.title} fill className="object-cover" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="bg-white/90 text-rose-600 text-xs font-bold px-3 py-1 rounded-full">📍 {location.name}</span>
                </div>
                {service.is_best_seller && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full">⭐ Best Seller</span>
                  </div>
                )}
                {savings > 0 && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">Save ₹{savings}</span>
                  </div>
                )}
              </div>
            )}
            <div className="p-5">
              <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-2">{service.title} in {location.name}, Patna</h1>
              {service.short_description && <p className="text-gray-500 text-sm mb-4">{service.short_description}</p>}
              <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-4">
                {service.duration_text && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {service.duration_text}</span>}
                {service.rating && <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" /> {service.rating} ({service.review_count} reviews)</span>}
              </div>
              <div className="flex items-baseline gap-3 mb-5">
                <span className="text-3xl font-bold text-rose-600">₹{finalPrice}</span>
                {service.original_price && service.original_price > finalPrice && <span className="text-base text-gray-400 line-through">₹{service.original_price}</span>}
              </div>
              <div className="flex gap-3">
                <a href="tel:+919650461390" className="flex-1 bg-rose-500 text-white py-3 rounded-xl font-bold text-center text-sm">📞 Call to Book</a>
                <a href={`https://wa.me/919650461390?text=Hi, I want to book ${encodeURIComponent(service.title)} at ${location.name}`} className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold text-center text-sm">💬 WhatsApp</a>
              </div>
              {landmarks[0] && <p className="text-xs text-green-600 mt-2">Just {landmarks[0].toLowerCase().includes('metro') ? '2–3 mins walk' : '5–7 mins'} from {landmarks[0]}</p>}
            </div>
          </div>

          {highlights.length > 0 && (
            <div className="bg-rose-50 rounded-2xl p-5 mb-8">
              <h2 className="font-bold text-rose-700 mb-3">✨ Why Choose Us in {location.name}</h2>
              <ul className="space-y-2">
                {highlights.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm">🌸 {item}</li>
                ))}
              </ul>
            </div>
          )}

          {junction?.local_description && (
            <article className="prose prose-rose max-w-none mb-8" dangerouslySetInnerHTML={{ __html: junction.local_description }} />
          )}

          {reviews.length > 0 && (
            <div className="mb-8">
              <h2 className="font-bold text-rose-700 mb-3">What {location.name} Clients Say</h2>
              <div className="space-y-3">
                {reviews.map((r: any, idx: number) => (
                  <div key={idx} className="bg-white border border-rose-100 rounded-xl p-4">
                    <div className="flex gap-0.5 mb-2">{[...Array(5)].map((_, i) => <span key={i} className={i < r.rating ? 'text-amber-400' : 'text-gray-200'}>★</span>)}</div>
                    <p className="text-sm italic">"{r.review_text}"</p>
                    <p className="text-xs text-rose-400 mt-2">— {r.customer_name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // CATEGORY-ONLY PAGE (generic)
  // ─────────────────────────────────────────────────────────────
  const finalPrice = service.price;
  const savings = service.original_price ? service.original_price - finalPrice : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-40 md:pb-28"> {/* increased bottom padding */}
      <nav className="text-sm text-gray-400 mb-5 flex items-center gap-1 flex-wrap">
        <Link href="/" className="hover:text-rose-500">Home</Link>
        <span className="text-gray-300">/</span>
        <Link href={`/${first}`} className="hover:text-rose-500 capitalize">{first}</Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-700">{service.title}</span>
      </nav>

      {service.seo_keywords?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {service.seo_keywords.slice(0, 6).map((kw: string) => (
            <span key={kw} className="bg-rose-50 text-rose-600 text-xs px-2.5 py-1 rounded-full border border-rose-100">{kw}</span>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        {service.image && (
          <div className="relative aspect-video">
            <Image src={service.image} alt={service.title} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            {service.is_best_seller && (
              <div className="absolute top-4 left-4">
                <span className="bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full">⭐ Best Seller</span>
              </div>
            )}
            {savings > 0 && (
              <div className="absolute top-4 right-4">
                <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">Save ₹{savings}</span>
              </div>
            )}
          </div>
        )}
        <div className="p-5">
          <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-2">{service.title}</h1>
          {service.short_description && <p className="text-gray-500 text-sm mb-4">{service.short_description}</p>}
          <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-4">
            {service.duration_text && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {service.duration_text}</span>}
            {service.rating && <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" /> {service.rating} ({service.review_count || 0} reviews)</span>}
            {service.booking_count && <span>🔖 {service.booking_count.toLocaleString()}+ booked</span>}
          </div>
          <div className="flex items-baseline gap-3 mb-5">
            <span className="text-3xl font-bold text-rose-600">₹{finalPrice}</span>
            {service.original_price && service.original_price > finalPrice && (
              <span className="text-base text-gray-400 line-through">₹{service.original_price}</span>
            )}
          </div>
          <div className="flex gap-3">
            <a href="tel:+919650461390" className="flex-1 bg-rose-500 text-white py-3 rounded-xl font-bold text-center text-sm flex items-center justify-center gap-2">
              <Phone className="w-4 h-4" /> Call to Book
            </a>
            <a href={`https://wa.me/919650461390?text=Hi, I want to book ${encodeURIComponent(service.title)}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold text-center text-sm">
              💬 WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div
        className="prose prose-rose max-w-none"
        dangerouslySetInnerHTML={{ __html: service.generic_description }}
      />

      {service.faqs?.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: service.faqs.map((faq: any) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: faq.answer
                }
              }))
            })
          }}
        />
      )}

      <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl p-6 text-center text-white mt-8">
        <h2 className="text-xl font-bold mb-2">Ready to glow? ✨</h2>
        <p className="text-sm text-rose-100 mb-5">Book your {service.title} today at our Bhootnath Road salon – just 2 mins from the metro station.</p>
        <div className="flex gap-3 justify-center">
          <a href="tel:+919650461390" className="bg-white text-rose-600 px-6 py-2.5 rounded-full font-bold text-sm">📞 Call Now</a>
          <Link href="/appointments" className="bg-white/20 border border-white/30 text-white px-6 py-2.5 rounded-full font-bold text-sm">Book Online →</Link>
        </div>
      </div>

      {/* Sticky bottom CTA – z-index lowered to z-[80] so it stays below global floating elements (z-[90]) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 p-3 flex gap-3 z-[80] lg:hidden shadow-lg">
        <a href="tel:+919650461390" className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold text-center text-sm">📞 Call Now</a>
        <a href={`https://wa.me/919650461390?text=Hi, I want to book ${encodeURIComponent(service.title)}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-rose-500 text-white py-3 rounded-xl font-bold text-center text-sm">💬 WhatsApp</a>
      </div>
    </div>
  );
}