// app/[first]/[second]/page.tsx
import { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createServerClient } from '@/lib/supabase/server';
import { createStaticClient } from '@/lib/supabase/static-client';
import { Phone, Star, Clock } from 'lucide-react';

// Keep in sync with sitemap.ts / robots.ts.
const SITE_URL = 'https://www.kritikasalonpatna.com';

interface PageProps {
  params: Promise<{ first: string; second: string }>;
}

// Turns a human-readable category value ("Bridal Combo") into a URL-safe
// segment ("bridal-combo"). Every place that builds or compares a category
// URL must go through this — .toLowerCase() alone was leaving raw spaces
// in the URL (e.g. /bridal%20combo/...), which browsers percent-encode
// and which then never matches a plain `first.toLowerCase() !== ...`
// comparison consistently, causing repeated redirect/refetch loops.
function slugifyCategory(category?: string | null): string {
  if (!category) return '';
  return category
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Falls back to the numeric `duration` (minutes) column when `duration_text`
// is null — e.g. for rows (like migrated combos) whose source data only had
// a number, not a pre-formatted label. Never fabricates a value: if neither
// column has real data, this returns null and the caller's existing `&&`
// guard hides the stat entirely, same as before.
function resolveDurationText(
  durationText?: string | null,
  durationMinutes?: number | null
): string | null {
  if (durationText) return durationText;
  if (typeof durationMinutes === 'number' && durationMinutes > 0) {
    if (durationMinutes >= 60) {
      const hours = Math.floor(durationMinutes / 60);
      const mins = durationMinutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}-hour session`;
    }
    return `${durationMinutes} minutes`;
  }
  return null;
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
    .map((s: any) => ({ first: slugifyCategory(s.category), second: s.slug }));
  const allPairs = [...locationPairs, ...categoryPairs];
  const uniqueMap = new Map<string, { first: string; second: string }>();
  for (const pair of allPairs) {
    const key = `${pair.first}|${pair.second}`;
    if (!uniqueMap.has(key)) uniqueMap.set(key, pair);
  }
  return Array.from(uniqueMap.values());
}

export const revalidate = 86400;

// ─── Metadata ───────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { first, second: serviceSlug } = await params;
  const supabase = await createServerClient();

  const { data: location } = await supabase
    .from('locations')
    .select('id, name, slug')
    .eq('slug', first)
    .single();

  const { data: service } = await supabase
    .from('services')
    .select('id, title, short_description, image, category, seo_keywords, slug')
    .eq('slug', serviceSlug)
    .single();

  if (!service) {
    return { title: 'Not Found', robots: { index: false, follow: false } };
  }

  // This service's ONE authoritative category URL. Whatever the requested
  // "first" segment was (a real location, the real category, or any other
  // string that still resolves here because generateStaticParams/dynamicParams
  // doesn't reject it), every variant points its canonical tag at either its
  // true location URL or this single category URL — never at itself when
  // "itself" isn't the intended canonical. This is what stops
  // /hair-treatment/x, /hair/x, /anything/x from being read as N separate
  // duplicate pages by Google.
  const categoryCanonical = `${SITE_URL}/${slugifyCategory(service.category)}/${service.slug}`;

  if (location) {
    const { data: junction } = await supabase
      .from('service_location_pages')
      .select('meta_title, meta_description, canonical_url')
      .eq('location_id', location.id)
      .eq('service_id', service.id)
      .eq('is_active', true)
      .single();

    // location matched, but this location doesn't actually offer this
    // service — don't present it as if it does.
    if (!junction) {
      return { title: 'Not Found', robots: { index: false, follow: false } };
    }

    const canonical = junction.canonical_url
      ? `${SITE_URL}${junction.canonical_url.startsWith('/') ? '' : '/'}${junction.canonical_url}`
      : `${SITE_URL}/${location.slug}/${service.slug}`;

    const title = junction.meta_title || `${service.title} in ${location.name} | Kritika Salon`;
    const description = junction.meta_description || service.short_description;

    return {
      title,
      description,
      alternates: { canonical },
      robots: { index: true, follow: true },
      openGraph: {
        type: 'website',
        url: canonical,
        title,
        description,
        images: service.image ? [{ url: service.image }] : [],
      },
    };
  }

  // No location match. Any first-segment that isn't the service's real
  // category redirects (see the page component below) before this ever
  // reaches a person or a crawler — so this metadata only actually needs
  // to describe the one canonical URL.
  return {
    title: `${service.title} in Patna | Best ${service.category} Service | Kritika Salon`,
    description: `${service.short_description}. Professional beauty service in Patna with Lakme-certified experts, premium products, hygienic salon environment, and affordable pricing.`,
    keywords: [
      ...(service.seo_keywords || []),
      `${service.title} in Patna`,
      `best ${service.category} in Patna`,
      `${service.title} near me`,
      `Kritika Ladies Parlour Patna`,
    ],
    alternates: { canonical: categoryCanonical },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      url: categoryCanonical,
      title: `${service.title} in Patna | Kritika Salon`,
      description: service.short_description,
      images: service.image ? [{ url: service.image }] : [],
    },
  };
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
  // ALIAS CONSOLIDATION
  // Any first-segment that isn't a real location AND isn't the service's
  // real category (e.g. /hair-treatment/x when services.category is "hair")
  // permanently redirects to the one canonical category URL. With traffic
  // still under 1,000/month, this is the cheapest possible moment to collapse
  // every duplicate alias into a single URL that can actually accumulate
  // ranking signal — waiting until there's real traffic on the aliases only
  // makes the eventual consolidation more disruptive, not less necessary.
  // ─────────────────────────────────────────────────────────────
  if (!location && first.toLowerCase() !== slugifyCategory(service.category)) {
    permanentRedirect(`/${slugifyCategory(service.category)}/${service.slug}`);
  }

  // ─────────────────────────────────────────────────────────────
  // LOCATION-SPECIFIC PAGE VIEW
  // ─────────────────────────────────────────────────────────────
  if (location) {
    const { data: junction } = await supabase
      .from('service_location_pages')
      .select('*')
      .eq('service_id', service.id)
      .eq('location_id', location.id)
      .eq('is_active', true)
      .single();

    // This location doesn't actually offer this service — a real location
    // slug isn't enough on its own to justify rendering the page.
    if (!junction) notFound();

    const finalPrice = junction?.local_price ?? service.price;
    const savings = service.original_price ? service.original_price - finalPrice : 0;
    const landmarks = junction?.nearby_landmarks ?? [location.landmark];
    const highlights = junction?.local_highlights ?? [];
    const reviews = junction?.local_reviews ?? [];

    const pageUrl = junction.canonical_url
      ? `${SITE_URL}${junction.canonical_url.startsWith('/') ? '' : '/'}${junction.canonical_url}`
      : `${SITE_URL}/${location.slug}/${service.slug}`;

    const breadcrumbJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: location.name, item: `${SITE_URL}/${location.slug}` },
        { '@type': 'ListItem', position: 3, name: service.title, item: pageUrl },
      ],
    };

    const serviceJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      serviceType: service.title,
      provider: {
        '@type': 'BeautySalon',
        name: 'Kritika Ladies Beauty Parlour',
        url: SITE_URL,
      },
      areaServed: { '@type': 'Place', name: `${location.name}, Patna` },
      offers: {
        '@type': 'Offer',
        price: finalPrice,
        priceCurrency: 'INR',
        url: pageUrl,
      },
      ...(service.rating ? {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: service.rating,
          reviewCount: service.review_count || reviews.length || 1,
        },
      } : {}),
    };

    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />

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
                {(() => {
                  const durationDisplay = resolveDurationText(service.duration_text, service.duration);
                  return durationDisplay && (
                    <span className="flex items-center gap-1.5 font-serif italic"><Clock className="w-3.5 h-3.5 text-rose-300" /> {durationDisplay}</span>
                  );
                })()}
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

          {/* Cross-link to the blog: a service page linking out to relevant
              how-to content is exactly the internal-linking pattern discussed
              earlier for the blog — it should run in both directions. */}
          <div className="text-center">
            <Link href="/blog" className="text-sm text-rose-600 hover:text-rose-700 font-serif italic underline">
              Read more hair &amp; beauty guides on our blog →
            </Link>
          </div>
        </div>
      </>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // CATEGORY-ONLY PAGE VIEW (GENERIC LANDINGS)
  // ─────────────────────────────────────────────────────────────
  const finalPrice = service.price;
  const savings = service.original_price ? service.original_price - finalPrice : 0;
  const canonicalUrl = `${SITE_URL}/${slugifyCategory(service.category)}/${service.slug}`;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: service.category, item: `${SITE_URL}/${slugifyCategory(service.category)}` },
      { '@type': 'ListItem', position: 3, name: service.title, item: canonicalUrl },
    ],
  };

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: service.title,
    provider: {
      '@type': 'BeautySalon',
      name: 'Kritika Ladies Beauty Parlour',
      url: SITE_URL,
    },
    areaServed: { '@type': 'City', name: 'Patna' },
    offers: {
      '@type': 'Offer',
      price: finalPrice,
      priceCurrency: 'INR',
      url: canonicalUrl,
    },
    ...(service.rating ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: service.rating,
        reviewCount: service.review_count || 1,
      },
    } : {}),
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-40 md:pb-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />

      <nav className="text-sm text-gray-400 mb-5 flex items-center gap-1 flex-wrap font-serif italic">
        <Link href="/" className="hover:text-rose-500">Home</Link>
        <span className="text-gray-300">/</span>
        <Link href={`/${slugifyCategory(service.category)}`} className="hover:text-rose-500 capitalize">{service.category}</Link>
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
            {(() => {
              const durationDisplay = resolveDurationText(service.duration_text, service.duration);
              return durationDisplay && (
                <span className="flex items-center gap-1.5 font-serif italic"><Clock className="w-3.5 h-3.5 text-rose-300" /> {durationDisplay}</span>
              );
            })()}
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

      <div className="text-center mb-4">
        <Link href="/blog" className="text-sm text-rose-600 hover:text-rose-700 font-serif italic underline">
          Read more hair &amp; beauty guides on our blog →
        </Link>
      </div>

      <div className="bg-rose-50/60 border border-rose-100/80 rounded-2xl p-6 text-center mt-12 shadow-[0_2px_10px_-4px_rgba(254,242,242,0.5)]">
        <h2 className="text-xl font-serif font-medium text-rose-800 mb-2">Ready to glow? ✨</h2>
        <p className="text-sm font-serif italic text-gray-600 mb-6">Book your personalized {service.title} experience today at our Bhootnath Road branch – just 2 minutes away from the metro exit.</p>
        <div className="flex gap-4 justify-center">
          <a href="tel:+919650461390" className="bg-rose-600 hover:bg-rose-700 transition-colors text-white px-6 py-2.5 rounded-xl font-serif font-medium text-sm shadow-sm">📞 Call Now</a>
          {/* was /appointments — every other CTA on the site uses /booking */}
          <Link href="/booking" className="bg-white border border-rose-200 text-rose-700 hover:bg-rose-50/50 transition-colors px-6 py-2.5 rounded-xl font-serif font-medium text-sm shadow-xs">Book Online →</Link>
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
