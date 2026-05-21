// app/[first]/[second]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createServerClient } from '@/lib/supabase/server';
import { createStaticClient } from '@/lib/supabase/static-client';
import { Phone, Star, Clock } from 'lucide-react';

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
      title: junction?.meta_title || `${service.title} in ${location.name} | Kritika Salon` ,
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
  // LOCATION-SPECIFIC PAGE VIEW
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
        <div className="max-w-3xl mx-auto px-4 py-6 pb-40 md:pb-28">
          <nav className="text-sm text-gray-400 mb-5 flex items-center gap-1 flex-wrap font-serif italic">
            <Link href="/" className="hover:text-rose-500">Home</Link>
            <span className="text-gray-300">/</span>
            <Link href={`/${location.slug}`} className="hover:text-rose-500">{location.name}</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-600 font-normal not-italic">{service.title}</span>
          </nav>

          <div className="bg-white rounded-2xl border border-rose-100/40 overflow-hidden mb-8 shadow-[0_2px_12px_-3px_rgba(254,242,242,0.8)]">
            {service.image && (
              <div className="relative aspect-video">
                <Image src={service.image} alt={service.title} fill className="object-cover" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="bg-white/95 text-rose-700 text-xs font-serif font-medium font-style:italic px-3 py-1 rounded-full border border-rose-100/30">📍 {location.name}</span>
                </div>
                {service.is_best_seller && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-rose-600/90 backdrop-blur-[2px] text-white text-xs font-serif italic px-3 py-1 rounded-full tracking-wide">✨ Best Seller</span>
                  </div>
                )}
                {savings > 0 && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-emerald-600/90 backdrop-blur-[2px] text-white text-xs font-medium px-3 py-1 rounded-full">Save ₹{savings}</span>
                  </div>
                )}
              </div>
            )}
            <div className="p-6">
              <h1 className="text-2xl font-serif text-gray-900 leading-snug mb-2 font-medium">{service.title} in {location.name}, Patna</h1>
              {service.short_description && <p className="text-gray-500 font-serif font-light italic text-sm mb-5">{service.short_description}</p>}
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-5 border-b border-rose-50/50 pb-4">
                {service.duration_text && <span className="flex items-center gap-1.5 font-serif italic"><Clock className="w-3.5 h-3.5 text-rose-300" /> {service.duration_text}</span>}
                {service.rating && <span className="flex items-center gap-1.5 font-serif italic"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {service.rating} ({service.review_count} reviews)</span>}
              </div>
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-serif font-light text-rose-700">₹{finalPrice}</span>
                {service.original_price && service.original_price > finalPrice && <span className="text-base text-gray-400 line-through font-light font-serif">₹{service.original_price}</span>}
              </div>
              <div className="flex gap-4">
                <a href="tel:+919650461390" className="flex-1 bg-rose-600 hover:bg-rose-700 transition-colors text-white py-3 rounded-xl font-serif font-medium text-center text-sm shadow-sm">📞 Call to Book</a>
                <a href={`https://wa.me/919650461390?text=Hi, I want to book ${encodeURIComponent(service.title)} at ${location.name}`} className="flex-1 bg-emerald-600 hover:bg-emerald-700 transition-colors text-white py-3 rounded-xl font-serif font-medium text-center text-sm shadow-sm">💬 WhatsApp</a>
              </div>
              {landmarks[0] && <p className="text-xs text-emerald-700 font-serif italic mt-3 text-center">Just {landmarks[0].toLowerCase().includes('metro') ? '2–3 mins walk' : '5–7 mins'} from {landmarks[0]}</p>}
            </div>
          </div>

          {highlights.length > 0 && (
            <div className="bg-[#fffbfc] border border-rose-100/60 rounded-2xl p-6 mb-8">
              <h2 className="font-serif text-rose-800 font-medium mb-4 flex items-center gap-2">✨ Why Choose Us in {location.name}</h2>
              <ul className="space-y-3">
                {highlights.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm font-serif text-gray-600 italic">
                    <span className="text-rose-400 text-xs mt-0.5">✦</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {junction?.local_description && (
            <article className="prose prose-rose max-w-none mb-10 selection:bg-rose-100" dangerouslySetInnerHTML={{ __html: junction.local_description }} />
          )}

          {reviews.length > 0 && (
            <div className="mb-8">
              <h2 className="font-serif text-rose-800 font-medium mb-4">What {location.name} Clients Say</h2>
              <div className="space-y-4">
                {reviews.map((r: any, idx: number) => (
                  <div key={idx} className="bg-white border border-rose-100/40 rounded-xl p-5 shadow-[0_1px_4px_rgba(254,242,242,0.5)]">
                    <div className="flex gap-0.5 mb-2.5">{[...Array(5)].map((_, i) => <span key={i} className={i < r.rating ? 'text-amber-400 text-sm' : 'text-gray-200 text-sm'}>★</span>)}</div>
                    <p className="text-sm font-serif italic text-gray-700 leading-relaxed">"{r.review_text}"</p>
                    <p className="text-xs text-rose-400 font-serif italic mt-3 text-right">— {r.customer_name}</p>
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
  // CATEGORY-ONLY PAGE VIEW (GENERIC LANDINGS)
  // ─────────────────────────────────────────────────────────────
  const finalPrice = service.price;
  const savings = service.original_price ? service.original_price - finalPrice : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-40 md:pb-28">
      <nav className="text-sm text-gray-400 mb-5 flex items-center gap-1 flex-wrap font-serif italic">
        <Link href="/" className="hover:text-rose-500">Home</Link>
        <span className="text-gray-300">/</span>
        <Link href={`/${first}`} className="hover:text-rose-500 capitalize">{first}</Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-600 font-normal not-italic">{service.title}</span>
      </nav>

      {service.seo_keywords?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {service.seo_keywords.slice(0, 5).map((kw: string) => (
            <span key={kw} className="bg-[#fffbfc] text-rose-600 text-xs px-3 py-1 rounded-full border border-rose-100/50 font-serif italic">{kw}</span>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-rose-100/40 overflow-hidden mb-8 shadow-[0_2px_12px_-3px_rgba(254,242,242,0.8)]">
        {service.image && (
          <div className="relative aspect-video">
            <Image src={service.image} alt={service.title} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            {service.is_best_seller && (
              <div className="absolute top-4 left-4">
                <span className="bg-rose-600/90 backdrop-blur-[2px] text-white text-xs font-serif italic px-3 py-1 rounded-full tracking-wide">✨ Best Seller</span>
              </div>
            )}
            {savings > 0 && (
              <div className="absolute top-4 right-4">
                <span className="bg-emerald-600/90 backdrop-blur-[2px] text-white text-xs font-medium px-3 py-1 rounded-full">Save ₹{savings}</span>
              </div>
            )}
          </div>
        )}
        <div className="p-6">
          <h1 className="text-2xl font-serif text-gray-900 font-medium leading-snug mb-2">{service.title}</h1>
          {service.short_description && <p className="text-gray-500 font-serif font-light italic text-sm mb-5">{service.short_description}</p>}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-5 border-b border-rose-50/50 pb-4">
            {service.duration_text && <span className="flex items-center gap-1.5 font-serif italic"><Clock className="w-3.5 h-3.5 text-rose-300" /> {service.duration_text}</span>}
            {service.rating && <span className="flex items-center gap-1.5 font-serif italic"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {service.rating} ({service.review_count || 0} reviews)</span>}
            {service.booking_count && <span className="font-serif italic text-rose-400/90">🔖 {service.booking_count.toLocaleString()}+ sessions</span>}
          </div>
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-serif font-light text-rose-700">₹{finalPrice}</span>
            {service.original_price && service.original_price > finalPrice && (
              <span className="text-base text-gray-400 line-through font-serif font-light">₹{service.original_price}</span>
            )}
          </div>
          <div className="flex gap-4">
            <a href="tel:+919650461390" className="flex-1 bg-rose-600 hover:bg-rose-700 transition-colors text-white py-3 rounded-xl font-serif font-medium text-center text-sm shadow-sm flex items-center justify-center gap-2">
              Call to Book
            </a>
            <a href={`https://wa.me/919650461390?text=Hi, I want to book ${encodeURIComponent(service.title)}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-emerald-600 hover:bg-emerald-700 transition-colors text-white py-3 rounded-xl font-serif font-medium text-center text-sm shadow-sm">
              💬 WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div
        className="prose prose-rose max-w-none mb-10"
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

      {/* REFINED BOTTOM HERO CALLOUT — Replaced hard dark colors with a soft feminine touch */}
      <div className="bg-rose-50/60 border border-rose-100/80 rounded-2xl p-6 text-center mt-12 shadow-[0_2px_10px_-4px_rgba(254,242,242,0.5)]">
        <h2 className="text-xl font-serif font-medium text-rose-800 mb-2">Ready to glow? ✨</h2>
        <p className="text-sm font-serif italic text-gray-600 mb-6">Book your personalized {service.title} experience today at our Bhootnath Road branch – just 2 minutes away from the metro exit.</p>
        <div className="flex gap-4 justify-center">
          <a href="tel:+919650461390" className="bg-rose-600 hover:bg-rose-700 transition-colors text-white px-6 py-2.5 rounded-xl font-serif font-medium text-sm shadow-sm">📞 Call Now</a>
          <Link href="/appointments" className="bg-white border border-rose-200 text-rose-700 hover:bg-rose-50/50 transition-colors px-6 py-2.5 rounded-xl font-serif font-medium text-sm shadow-xs">Book Online →</Link>
        </div>
      </div>

      {/* Sticky mobile CTA bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-rose-50 p-3 flex gap-3 z-[80] lg:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
        <a href="tel:+919650461390" className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-serif font-medium text-center text-sm shadow-xs">📞 Call Now</a>
        <a href={`https://wa.me/919650461390?text=Hi, I want to book ${encodeURIComponent(service.title)}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-rose-600 text-white py-3 rounded-xl font-serif font-medium text-center text-sm shadow-xs">💬 WhatsApp</a>
      </div>
    </div>
  );
}