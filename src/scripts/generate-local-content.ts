// scripts/generate-local-content-v2.ts
// REPLACES: generate-local-content.ts
// Changes: Rich HTML output with feminine styling, visual section breaks,
//          styled Q&A cards, benefit pills, ingredient tags, decorative elements

export interface ServiceJSON {
  id: string
  slug: string
  title: string
  category: string
  categorySlug: string
  description: string
  shortDescription: string
  price: number
  originalPrice?: number
  discountPercentage?: number
  isTrending?: boolean
  isPopular?: boolean
  isBestSeller?: boolean
  duration: number
  durationText: string
  rating?: number
  reviewCount?: number
  bookingCount?: number
  keyIngredients?: string[]
  benefits?: string[]
  precautions?: string
  aftercare?: string
  faqs?: Array<{ question: string; answer: string }>
  seoKeywords?: string[]
  targetAudience?: string[]
  idealFor?: string[]
  whatsIncluded?: string[]
  whatsNotIncluded?: string[]
  addOns?: Array<{ name: string; price: number }>
  nearbyLandmarks?: string[]
  seasonalTags?: string[]
  processingTime?: string
  cancellationPolicy?: string
  image?: string
}

export interface LocationProfile {
  slug: string
  name: string
  landmarks: string[]
  clientProfile: string
  proximity: string
  localTrait: string
  priceMultiplier: number
  reviewNames: string[]
}

// ─── Category config — icon + colour + emotional angle ───────────────────────
const CATEGORY_CONFIG: Record<string, {
  icon: string
  accentClass: string        // Tailwind class used in rendered page
  accentHex: string          // Inline hex for generated HTML emails/fallback
  openingEmotion: string
  ctaEmoji: string
}> = {
  bridal:    { icon: '👰', accentClass: 'rose',   accentHex: '#f43f5e', openingEmotion: 'Your dream wedding look starts here',       ctaEmoji: '💍' },
  reception: { icon: '✨', accentClass: 'pink',   accentHex: '#ec4899', openingEmotion: 'Shine at your reception like never before',  ctaEmoji: '🌟' },
  party:     { icon: '🎉', accentClass: 'pink',   accentHex: '#ec4899', openingEmotion: 'Get party-ready in minutes',                 ctaEmoji: '🎊' },
  makeup:    { icon: '💄', accentClass: 'rose',   accentHex: '#f43f5e', openingEmotion: 'Makeup that moves with you all day',         ctaEmoji: '💋' },
  hair:      { icon: '💇‍♀️', accentClass: 'amber', accentHex: '#f59e0b', openingEmotion: 'Hair that turns heads — every single day',   ctaEmoji: '✨' },
  skin:      { icon: '✨', accentClass: 'purple', accentHex: '#a855f7', openingEmotion: 'Glow that starts from within',               ctaEmoji: '🌸' },
  nails:     { icon: '💅', accentClass: 'teal',   accentHex: '#14b8a6', openingEmotion: 'Beautiful nails that tell your story',       ctaEmoji: '💎' },
  default:   { icon: '🌸', accentClass: 'rose',   accentHex: '#f43f5e', openingEmotion: 'A treatment designed just for you',          ctaEmoji: '💖' },
}

function getCatConfig(service: ServiceJSON) {
  const cat = service.categorySlug?.toLowerCase() || service.category?.toLowerCase() || 'default'
  return CATEGORY_CONFIG[cat] || CATEGORY_CONFIG['default']
}

// ─── HTML helpers — all styled inline for email/web safety ───────────────────

const DIVIDER = `
<div style="display:flex;align-items:center;gap:12px;margin:24px 0 20px;">
  <div style="flex:1;height:1px;background:linear-gradient(to right,#fce7f3,transparent);"></div>
  <span style="color:#f9a8d4;font-size:12px;letter-spacing:3px;">✦ ✦ ✦</span>
  <div style="flex:1;height:1px;background:linear-gradient(to left,#fce7f3,transparent);"></div>
</div>`

function sectionHeading(icon: string, text: string, accent = '#f43f5e'): string {
  return `
<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;margin-top:4px;">
  <span style="font-size:18px;line-height:1;">${icon}</span>
  <h3 style="margin:0;font-size:15px;font-weight:700;color:${accent};letter-spacing:0.01em;">${text}</h3>
  <div style="flex:1;height:1px;background:#fce7f3;"></div>
</div>`
}

function openingPill(text: string): string {
  return `<span style="display:inline-block;background:#fff0f6;color:#e11d48;font-size:11px;font-weight:700;padding:4px 12px;border-radius:100px;border:1px solid #fecdd3;margin-bottom:16px;letter-spacing:0.04em;">${text}</span>`
}

function benefitCard(benefit: string, index: number): string {
  const colors = [
    { bg: '#fff0f6', border: '#fecdd3', dot: '#f43f5e' },
    { bg: '#fdf4ff', border: '#e9d5ff', dot: '#a855f7' },
    { bg: '#fff7ed', border: '#fed7aa', dot: '#f97316' },
    { bg: '#f0fdf4', border: '#bbf7d0', dot: '#22c55e' },
  ]
  const c = colors[index % colors.length]
  return `
<div style="display:flex;align-items:flex-start;gap:10px;background:${c.bg};border:1px solid ${c.border};border-radius:12px;padding:10px 14px;margin-bottom:8px;">
  <div style="width:8px;height:8px;border-radius:50%;background:${c.dot};flex-shrink:0;margin-top:4px;"></div>
  <p style="margin:0;font-size:13px;color:#374151;line-height:1.6;">${benefit}</p>
</div>`
}

function ingredientTag(ingredient: string): string {
  return `<span style="display:inline-block;background:#fdf4ff;color:#7e22ce;font-size:11px;font-weight:600;padding:4px 10px;border-radius:100px;border:1px solid #e9d5ff;margin:3px;">${ingredient}</span>`
}

function includedItem(item: string, included = true): string {
  const icon = included ? '✔' : '✕'
  const color = included ? '#16a34a' : '#9ca3af'
  const bg = included ? '#f0fdf4' : '#f9fafb'
  const border = included ? '#bbf7d0' : '#e5e7eb'
  return `
<div style="display:flex;align-items:flex-start;gap:10px;padding:8px 12px;background:${bg};border:1px solid ${border};border-radius:8px;margin-bottom:6px;">
  <span style="color:${color};font-size:13px;font-weight:700;flex-shrink:0;">${icon}</span>
  <span style="font-size:13px;color:#374151;line-height:1.5;">${item}</span>
</div>`
}

function addOnCard(name: string, price: number): string {
  return `
<div style="display:flex;align-items:center;justify-content:space-between;background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:9px 12px;margin-bottom:6px;">
  <span style="font-size:13px;color:#92400e;font-weight:500;">✦ ${name}</span>
  <span style="font-size:13px;font-weight:700;color:#d97706;">+₹${price}</span>
</div>`
}

function idealForTag(tag: string): string {
  return `<span style="display:inline-block;background:#fff0f6;color:#be185d;font-size:11px;font-weight:600;padding:5px 12px;border-radius:100px;border:1px solid #fbcfe8;margin:3px;">${tag}</span>`
}

function careBlock(icon: string, title: string, content: string): string {
  return `
<div style="background:#f8fafc;border-left:3px solid #f9a8d4;border-radius:0 10px 10px 0;padding:12px 16px;margin-bottom:10px;">
  <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#be185d;text-transform:uppercase;letter-spacing:0.05em;">${icon} ${title}</p>
  <p style="margin:0;font-size:13px;color:#374151;line-height:1.65;">${content}</p>
</div>`
}

function bookingBlock(
  serviceTitle: string,
  locationName: string,
  finalPrice: number,
  savings: number,
  processingTime?: string,
  cancellationPolicy?: string
): string {
  return `
<div style="background:linear-gradient(135deg,#fff0f6,#fdf4ff);border:1px solid #fecdd3;border-radius:16px;padding:20px;text-align:center;margin-top:8px;">
  <p style="margin:0 0 6px;font-size:13px;color:#6b7280;">Starting from</p>
  <p style="margin:0 0 4px;font-size:28px;font-weight:700;color:#e11d48;">₹${finalPrice}</p>
  ${savings > 0 ? `<p style="margin:0 0 12px;font-size:12px;color:#16a34a;font-weight:600;">You save ₹${savings} on this service ✦</p>` : '<div style="margin-bottom:12px;"></div>'}
  <div style="display:flex;flex-direction:column;gap:6px;text-align:left;margin-bottom:16px;">
    ${processingTime ? `<p style="margin:0;font-size:12px;color:#4b5563;">⏱ ${processingTime}</p>` : '<p style="margin:0;font-size:12px;color:#4b5563;">⏱ Same-day bookings available</p>'}
    ${cancellationPolicy ? `<p style="margin:0;font-size:12px;color:#4b5563;">📋 ${cancellationPolicy}</p>` : ''}
    <p style="margin:0;font-size:12px;color:#4b5563;">📞 Call or WhatsApp: +91 9650461390</p>
  </div>
  <p style="margin:0;font-size:11px;color:#9ca3af;">Available at ${locationName}, Patna · All branches open Mon–Sun 9AM–8PM</p>
</div>`
}

// ─── Category-specific opening hooks ─────────────────────────────────────────
const CATEGORY_HOOKS: Record<string, (s: ServiceJSON, loc: LocationProfile) => string> = {
  bridal: (s, loc) =>
    `Your wedding day is the most photographed moment of your life — and <strong>${s.title.split('|')[0].trim()}</strong> at Kritika Ladies Parlour, ${loc.name} ensures every photo, every frame, every glance captures you at your most radiant. Trusted by hundreds of Patna brides from ${loc.clientProfile}, we bring Lakme Academy Delhi expertise to your bridal chair.`,

  hair: (s, loc) =>
    `Patna's humidity, heat, and dust are your hair's biggest enemies. Our <strong>${s.title.split('|')[0].trim()}</strong> at Kritika Ladies Parlour, ${loc.name} is specifically designed to fight Patna's climate — giving ${loc.clientProfile} the kind of hair that stays beautiful from morning to night, no matter the season.`,

  skin: (s, loc) =>
    `Your skin works hard every single day — Patna's pollution, heat, and humidity take a toll that regular cleansing simply cannot fix. Our <strong>${s.title.split('|')[0].trim()}</strong> at Kritika Ladies Parlour, ${loc.name} goes deeper, working with your skin's natural rhythm to restore glow, clarity, and confidence.`,

  nails: (s, loc) =>
    `Beautiful nails are the detail that completes every outfit, every look, every moment. At Kritika Ladies Parlour, ${loc.name}, our <strong>${s.title.split('|')[0].trim()}</strong> is crafted with precision for ${loc.clientProfile} — salon-quality results that last, at prices that make sense.`,

  party: (s, loc) =>
    `Every party deserves a version of you that stops the room. Our <strong>${s.title.split('|')[0].trim()}</strong> at Kritika Ladies Parlour, ${loc.name} gets you camera-ready in just ${s.durationText} — perfect for the busy schedule of ${loc.clientProfile} across Patna.`,

  makeup: (s, loc) =>
    `Great makeup is more than colour — it is confidence you wear. Our <strong>${s.title.split('|')[0].trim()}</strong> at Kritika Ladies Parlour, ${loc.name} is crafted for ${loc.clientProfile}, combining Lakme Academy precision with a deep understanding of Patna's climate and skin tones.`,

  default: (s, loc) =>
    `At Kritika Ladies Parlour, ${loc.name}, our <strong>${s.title.split('|')[0].trim()}</strong> is tailored specifically for ${loc.clientProfile}. ${loc.localTrait} — which is why this has become one of our most-requested services at this branch.`,
}

function getHook(service: ServiceJSON, loc: LocationProfile): string {
  const cat = service.categorySlug?.toLowerCase() || service.category?.toLowerCase() || 'default'
  return (CATEGORY_HOOKS[cat] || CATEGORY_HOOKS['default'])(service, loc)
}

// ─── Main generator ───────────────────────────────────────────────────────────
export function generateLocalDescription(
  service: ServiceJSON,
  loc: LocationProfile
): string {
  const cat = getCatConfig(service)
  const serviceTitle = service.title.split('|')[0].trim()
  const landmark0 = loc.landmarks[0]
  const landmark1 = loc.landmarks[1] || loc.landmarks[0]
  const finalPrice = Math.round(service.price * loc.priceMultiplier)
  const savings = service.originalPrice
    ? service.originalPrice - finalPrice
    : 0

  const sections: string[] = []

  // ── SECTION 1: Opening ────────────────────────────────────────────────────
  sections.push(`
${openingPill(`${cat.icon} ${serviceTitle} · ${loc.name}, Patna`)}

<p style="font-size:14px;color:#374151;line-height:1.8;margin:0 0 14px;">${getHook(service, loc)}</p>

<p style="font-size:13px;color:#4b5563;line-height:1.8;margin:0 0 8px;">${service.description}</p>

${DIVIDER}`)

  // ── SECTION 2: Why us here ────────────────────────────────────────────────
  sections.push(`
${sectionHeading('📍', `Why Choose Us in ${loc.name}?`, cat.accentHex)}

<p style="font-size:13px;color:#374151;line-height:1.8;margin:0 0 10px;"><strong>${loc.proximity}.</strong> ${loc.localTrait}. Our Lakme Academy Delhi certified cosmetologist (BSc Chemistry) brings both scientific precision and artistic skill to every session — making this one of the most trusted beauty experiences in ${loc.name}.</p>

<p style="font-size:13px;color:#4b5563;line-height:1.8;margin:0 0 8px;">Whether you step in from <strong>${landmark0}</strong> or travel from <strong>${landmark1}</strong>, we are easy to reach — with flexible slots that suit your schedule, from early morning to evening appointments.</p>

<div style="background:#fff0f6;border:1px solid #fecdd3;border-radius:12px;padding:14px 18px;margin-top:4px;">
  <p style="margin:0;font-size:13px;color:#9f1239;line-height:1.7;">
    ${service.rating ? `⭐ Rated <strong>${service.rating}</strong> by ${service.reviewCount}+ clients &nbsp;·&nbsp; ` : ''}
    ${service.bookingCount ? `💖 ${service.bookingCount}+ bookings &nbsp;·&nbsp; ` : ''}
    🎓 Lakme Academy Delhi certified
  </p>
</div>

${DIVIDER}`)

  // ── SECTION 3: Key ingredients ────────────────────────────────────────────
  if (service.keyIngredients?.length) {
    sections.push(`
${sectionHeading('🧴', 'What We Use — Premium Products & Technique', cat.accentHex)}

<p style="font-size:13px;color:#374151;line-height:1.8;margin:0 0 12px;">Every <strong>${serviceTitle}</strong> session at our ${loc.name} salon uses professional-grade products — not mass-market alternatives. These formulations are specifically chosen for Patna's climate: high humidity, seasonal heat, and daily pollution exposure.</p>

<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;">
${service.keyIngredients.map(i => ingredientTag(i)).join('')}
</div>

${DIVIDER}`)
  }

  // ── SECTION 4: Benefits ───────────────────────────────────────────────────
  if (service.benefits?.length) {
    sections.push(`
${sectionHeading('✨', `Benefits of ${serviceTitle} at ${loc.name}`, cat.accentHex)}

<p style="font-size:13px;color:#4b5563;line-height:1.8;margin:0 0 12px;">Here is what makes this treatment especially valuable for women in ${loc.name}, Patna — results you will see and feel from your very first session:</p>

${service.benefits.map((b, i) => benefitCard(b, i)).join('')}

${DIVIDER}`)
  }

  // ── SECTION 5: Ideal for ──────────────────────────────────────────────────
  const idealList = [
    ...(service.idealFor || []),
    ...(service.targetAudience || []),
    ...(service.seasonalTags || []),
  ].slice(0, 7)

  if (idealList.length) {
    sections.push(`
${sectionHeading('💖', 'Perfect For', cat.accentHex)}

<p style="font-size:13px;color:#374151;line-height:1.8;margin:0 0 10px;">This service is designed for women who want real results — whether you are a first-timer or a regular. Especially popular among ${loc.clientProfile} in ${loc.name}.</p>

<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:4px;">
${idealList.map(t => idealForTag(t)).join('')}
</div>

${DIVIDER}`)
  }

  // ── SECTION 6: What's included ────────────────────────────────────────────
  if (service.whatsIncluded?.length) {
    sections.push(`
${sectionHeading('📋', "What's Included in Your Session", cat.accentHex)}

${service.whatsIncluded.map(i => includedItem(i, true)).join('')}
${(service.whatsNotIncluded || []).map(i => includedItem(i, false)).join('')}

${DIVIDER}`)
  }

  // ── SECTION 7: Add-ons ────────────────────────────────────────────────────
  if (service.addOns?.length) {
    sections.push(`
${sectionHeading('⬆️', 'Enhance Your Experience — Add-Ons', cat.accentHex)}

<p style="font-size:13px;color:#4b5563;line-height:1.8;margin:0 0 10px;">Customise your ${serviceTitle} session with popular add-ons. Many of our clients from ${landmark0} choose these for special occasions:</p>

${service.addOns.map(a => addOnCard(a.name, a.price)).join('')}

${DIVIDER}`)
  }

  // ── SECTION 8: Before & After care ───────────────────────────────────────
  if (service.precautions || service.aftercare) {
    sections.push(`
${sectionHeading('🌸', 'Before & After Your Appointment', cat.accentHex)}

${service.precautions ? careBlock('📌', 'Before You Come In', service.precautions) : ''}
${service.aftercare ? careBlock('💧', 'After Your Session', service.aftercare) : ''}

${DIVIDER}`)
  }

  // ── SECTION 9: Booking ────────────────────────────────────────────────────
  sections.push(`
${sectionHeading('📅', `Book Your ${serviceTitle} in ${loc.name}`, cat.accentHex)}

${bookingBlock(serviceTitle, loc.name, finalPrice, savings, service.processingTime, service.cancellationPolicy)}`)

  return sections.join('\n')
}

// ─── SEO keyword generator (unchanged) ───────────────────────────────────────
export function generateSEOKeywords(service: ServiceJSON, loc: LocationProfile): string[] {
  const base = service.seoKeywords || []
  const t = service.title.split('|')[0].trim().toLowerCase()
  const l = loc.name.toLowerCase()
  return [...new Set([
    ...base,
    `${t} ${l} patna`,
    `${t} near ${loc.landmarks[0].toLowerCase()}`,
    `best ${t} patna`,
    `${t} near me patna`,
    `${service.category.toLowerCase()} services ${l} patna`,
  ])].slice(0, 10)
}

export function generateMetaTitle(service: ServiceJSON, loc: LocationProfile): string {
  const t = service.title.split('|')[0].trim()
  return `${t} in ${loc.name} Patna | From ₹${Math.round(service.price * loc.priceMultiplier)} — Kritika Parlour`
}

export function generateMetaDescription(service: ServiceJSON, loc: LocationProfile): string {
  const t = service.title.split('|')[0].trim()
  const p = Math.round(service.price * loc.priceMultiplier)
  return `${t} at Kritika Ladies Parlour, ${loc.name} Patna. ${loc.proximity}. ${service.shortDescription?.slice(0, 80)}. From ₹${p}. Lakme certified. Call +91 9650461390.`
}

export function generateLocalHighlights(service: ServiceJSON, loc: LocationProfile): string[] {
  const t = service.title.split('|')[0].trim()
  const highlights: string[] = [`${t} specialist in ${loc.name}`, loc.proximity]
  if (service.duration <= 60) highlights.push(`Quick ${service.durationText} session — fits your schedule`)
  else highlights.push(`Dedicated ${service.durationText} for best results`)
  if (service.rating && service.rating >= 4.8) highlights.push(`${service.rating}★ rated by ${service.reviewCount}+ clients in Patna`)
  if (service.discountPercentage && service.discountPercentage >= 20)
    highlights.push(`${service.discountPercentage}% OFF — save ₹${(service.originalPrice || 0) - Math.round(service.price * loc.priceMultiplier)}`)
  highlights.push('Lakme Academy Delhi certified cosmetologist')
  return highlights.slice(0, 5)
}

export function generateLocalReviews(
  service: ServiceJSON,
  loc: LocationProfile
): Array<{ customer_name: string; rating: number; review_text: string }> {
  const t = service.title.split('|')[0].trim()
  const cat = service.categorySlug?.toLowerCase() || ''
  const l0 = loc.landmarks[0]

  const TEMPLATES: Record<string, string[]> = {
    bridal: [
      `Got my ${t} done here before my wedding. My look lasted the entire function without any touch-up needed. Highly recommended for every Patna bride!`,
      `Best bridal experience in Patna. The artist understood my vision perfectly. Guests were complimenting me all evening — I felt like a queen.`,
      `Came specifically from near ${l0}. Professional team, premium products, stunning result. Will recommend to every bride I know.`,
    ],
    hair: [
      `My hair stays smooth even in Patna's humidity after the ${t}. Worth every rupee — results lasted over 3 months!`,
      `Finally found a salon in ${loc.name} that truly understands hair care. The ${t} completely transformed my damaged hair.`,
      `Quick, professional, excellent results. Hair looks healthier than ever. Convenient location near ${l0}.`,
    ],
    skin: [
      `Skin was visibly brighter after just one ${t} session. You can really feel the Lakme-certified difference in technique.`,
      `Patna's heat was ruining my skin. After regular sessions here, my complexion has completely improved. So grateful!`,
      `Convenient, affordable, and genuinely effective. My skin has never looked this clear and healthy. Highly recommend!`,
    ],
    nails: [
      `My nails lasted 3 weeks without a single chip! The ${t} quality here is the best in ${loc.name}. Definitely returning!`,
      `Beautiful work, hygienic tools, great attention to detail. My nails looked gorgeous for the entire wedding function.`,
      `Fast, premium service that fits my busy schedule. Expert technique and lovely finish — exactly what I was looking for.`,
    ],
    party: [
      `Got ready in ${service.durationText} and felt absolutely stunning all night. Quick, professional, and beautiful work!`,
      `Perfect for last-minute party prep. The team is fast and the results are genuinely impressive. My new go-to!`,
      `Everyone at the party kept asking where I got my look done. Results were fresh and natural — loved it completely.`,
    ],
    default: [
      `Excellent ${t} service in ${loc.name}. Professional team, premium products, beautiful results. Will definitely return!`,
      `Best salon near ${l0}. The ${t} was exactly what I needed. Highly recommended to all my friends and family!`,
      `Convenient, affordable, and high quality. The Lakme certified expert really knows her craft. Very satisfied!`,
    ],
  }

  const texts = TEMPLATES[cat] || TEMPLATES['default']
  return texts.slice(0, 3).map((text, i) => ({
    customer_name: loc.reviewNames[i] || loc.reviewNames[0],
    rating: service.rating ? (i === 2 ? Math.max(4, Math.floor(service.rating)) : 5) : 5,
    review_text: text,
  }))
}

export function generateGenericDescription(service: ServiceJSON): string {
  const cat = getCatConfig(service)
  const serviceTitle = service.title.split('|')[0].trim()

  const finalPrice = service.price ?? 0
  const savings = service.originalPrice
    ? service.originalPrice - finalPrice
    : 0

  const sections: string[] = []

  // ─────────────────────────────────────────
  // Opening
  // ─────────────────────────────────────────
  sections.push(`
${openingPill(`${cat.icon} ${serviceTitle} · Premium Beauty Service in Patna`)}

<p style="font-size:14px;color:#374151;line-height:1.8;margin:0 0 14px;">
  ${service.description}
</p>

<p style="font-size:13px;color:#4b5563;line-height:1.8;margin:0;">
  Patna’s humidity, pollution, hard water, and changing weather conditions can damage skin and hair over time.
  Our <strong>${serviceTitle}</strong> is specially designed for Indian skin and hair conditions using professional salon techniques and premium products.
</p>

${DIVIDER}
`)

  // ─────────────────────────────────────────
  // Why choose this treatment
  // ─────────────────────────────────────────
  sections.push(`
${sectionHeading('✨', `Why Choose ${serviceTitle}?`, cat.accentHex)}

<p style="font-size:13px;color:#374151;line-height:1.8;margin-bottom:12px;">
  This treatment is one of the most popular services among women in Patna because it combines visible results,
  relaxing experience, professional-grade products, and affordable pricing.
</p>

<div style="background:#fff0f6;border:1px solid #fecdd3;border-radius:12px;padding:14px 18px;">
  <p style="margin:0;font-size:13px;color:#9f1239;line-height:1.7;">
    ${service.rating ? `⭐ Rated <strong>${service.rating}</strong> by ${service.reviewCount}+ clients &nbsp;·&nbsp;` : ''}
    ${service.bookingCount ? `💖 ${service.bookingCount}+ bookings &nbsp;·&nbsp;` : ''}
    🎓 Lakme Academy Delhi certified expertise
  </p>
</div>

${DIVIDER}
`)

  // ─────────────────────────────────────────
  // Treatment process
  // ─────────────────────────────────────────
  sections.push(`
${sectionHeading('🧴', `How ${serviceTitle} Works`, cat.accentHex)}

<p style="font-size:13px;color:#374151;line-height:1.8;margin-bottom:14px;">
  Every session is performed step-by-step to ensure hygiene, comfort, and long-lasting visible results.
</p>

<div style="display:flex;flex-direction:column;gap:8px;">
  ${includedItem('Consultation and skin/hair assessment', true)}
  ${includedItem('Deep cleansing and preparation', true)}
  ${includedItem('Professional treatment procedure', true)}
  ${includedItem('Hydration, nourishment, or finishing process', true)}
  ${includedItem('Aftercare guidance from our expert team', true)}
</div>

${DIVIDER}
`)

  // ─────────────────────────────────────────
  // Ingredients
  // ─────────────────────────────────────────
  if (service.keyIngredients?.length) {
    sections.push(`
${sectionHeading('🌸', 'Premium Products & Ingredients', cat.accentHex)}

<p style="font-size:13px;color:#374151;line-height:1.8;margin-bottom:12px;">
  We use carefully selected salon-grade products suitable for Indian skin tones, hair textures,
  and Patna’s climate conditions.
</p>

<div style="display:flex;flex-wrap:wrap;gap:4px;">
  ${service.keyIngredients.map(i => ingredientTag(i)).join('')}
</div>

${DIVIDER}
`)
  }

  // ─────────────────────────────────────────
  // Benefits
  // ─────────────────────────────────────────
  if (service.benefits?.length) {
    sections.push(`
${sectionHeading('💖', `Benefits of ${serviceTitle}`, cat.accentHex)}

<p style="font-size:13px;color:#4b5563;line-height:1.8;margin-bottom:12px;">
  Clients usually notice both instant improvement and long-term benefits after regular sessions.
</p>

${service.benefits.map((b, i) => benefitCard(b, i)).join('')}

${DIVIDER}
`)
  }

  // ─────────────────────────────────────────
  // Ideal for
  // ─────────────────────────────────────────
  const idealList = [
    ...(service.idealFor || []),
    ...(service.targetAudience || []),
    ...(service.seasonalTags || []),
  ].slice(0, 10)

  if (idealList.length) {
    sections.push(`
${sectionHeading('✨', 'Perfect For', cat.accentHex)}

<p style="font-size:13px;color:#374151;line-height:1.8;margin-bottom:10px;">
  Especially recommended for brides, college students, working professionals,
  festive preparation, party occasions, and women looking for regular beauty maintenance.
</p>

<div style="display:flex;flex-wrap:wrap;gap:4px;">
  ${idealList.map(t => idealForTag(t)).join('')}
</div>

${DIVIDER}
`)
  }

  // ─────────────────────────────────────────
  // Expected results
  // ─────────────────────────────────────────
  sections.push(`
${sectionHeading('🌟', 'Results You Can Expect', cat.accentHex)}

${benefitCard('Visible freshness and healthier appearance after the session', 0)}
${benefitCard('Smoother texture and more polished overall look', 1)}
${benefitCard('Professional finish suitable for events and daily confidence', 2)}
${benefitCard('Better long-term maintenance with regular appointments', 3)}

${DIVIDER}
`)

  // ─────────────────────────────────────────
  // Included / not included
  // ─────────────────────────────────────────
  if (service.whatsIncluded?.length || service.whatsNotIncluded?.length) {
    sections.push(`
${sectionHeading('📋', "What's Included", cat.accentHex)}

${(service.whatsIncluded || []).map(i => includedItem(i, true)).join('')}
${(service.whatsNotIncluded || []).map(i => includedItem(i, false)).join('')}

${DIVIDER}
`)
  }

  // ─────────────────────────────────────────
  // Add-ons
  // ─────────────────────────────────────────
  if (service.addOns?.length) {
    sections.push(`
${sectionHeading('⬆️', 'Popular Add-Ons', cat.accentHex)}

<p style="font-size:13px;color:#4b5563;line-height:1.8;margin-bottom:10px;">
  Many clients combine these services together for even better results.
</p>

${service.addOns.map(a => addOnCard(a.name, a.price)).join('')}

${DIVIDER}
`)
  }

  // ─────────────────────────────────────────
  // Before & after care
  // ─────────────────────────────────────────
  if (service.precautions || service.aftercare) {
    sections.push(`
${sectionHeading('🌸', 'Before & After Care', cat.accentHex)}

${service.precautions ? careBlock('📌', 'Before Your Appointment', service.precautions) : ''}
${service.aftercare ? careBlock('💧', 'Aftercare Tips', service.aftercare) : ''}

${DIVIDER}
`)
  }

  // ─────────────────────────────────────────
  // FAQs
  // ─────────────────────────────────────────
  if (service.faqs?.length) {
    sections.push(`
${sectionHeading('❓', 'Frequently Asked Questions', cat.accentHex)}

<div style="display:flex;flex-direction:column;gap:12px;">
  ${service.faqs.slice(0, 6).map(faq => `
    <details style="background:#f9fafb;border-radius:10px;padding:14px;">
      <summary style="font-weight:600;cursor:pointer;color:#111827;">
        ${faq.question}
      </summary>

      <p style="margin-top:10px;font-size:13px;color:#4b5563;line-height:1.8;">
        ${faq.answer}
      </p>
    </details>
  `).join('')}
</div>

${DIVIDER}
`)
  }

  // ─────────────────────────────────────────
  // Related services
  // ─────────────────────────────────────────
  sections.push(`
${sectionHeading('💅', 'Related Beauty Services', cat.accentHex)}

<p style="font-size:13px;color:#4b5563;line-height:1.8;margin-bottom:12px;">
  Clients interested in ${serviceTitle} also frequently book these salon services.
</p>

<div style="display:flex;flex-wrap:wrap;gap:8px;">
  ${idealForTag('Cleanup Facial')}
  ${idealForTag('De-Tan Treatment')}
  ${idealForTag('Hair Spa')}
  ${idealForTag('Party Makeup')}
  ${idealForTag('Bridal Services')}
  ${idealForTag('Skin Glow Treatments')}
</div>

${DIVIDER}
`)

  // ─────────────────────────────────────────
  // Booking CTA
  // ─────────────────────────────────────────
  sections.push(`
${sectionHeading('📅', `Book Your ${serviceTitle} Today`, cat.accentHex)}

${bookingBlock(
  serviceTitle,
  'Patna',
  finalPrice,
  savings,
  service.processingTime,
  service.cancellationPolicy
)}
`)

  return sections.join('\n')
}