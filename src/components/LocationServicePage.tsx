"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Calendar, Phone, MapPin, Star, Clock } from "lucide-react";
import BeautyQuiz from "./BeautyQuiz";
import SkinAnalysis from "./SkinAnalysis";

type Service = {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  original_price: number | null;
  duration: number;
  image: string;
  rating: number | null;
  review_count: number | null;
  category?: string;
};

type Location = {
  id: string;
  slug: string;
  name: string;
  landmark: string | null;
};

type PageData = {
  local_description: string | null;
  local_highlights: string[] | null;
  local_price: number | null;
  nearby_landmarks: string[] | null;
  local_reviews: Array<{ customer_name: string; rating: number; review_text: string }> | null;
  seo_keywords?: string[];
};

interface LocationServicePageProps {
  pageData: PageData;
  service: Service;
  location: Location;
  finalPrice: number;
  relatedServices?: Service[];
}

// Hardcoded upgrade and occasion maps (extend as needed)
const UPGRADE_MAP: Record<string, string[]> = {
  "cleanup": ["essential-facial", "hydrafacial-patna"],
  "essential-facial": ["hydrafacial-patna"],
  "hydrafacial-patna": ["bridal-glow-prep-patna"],
  "bridal-hd-makeup-patna": ["airbrush-bridal-makeup-patna"],
  "hair-spa-patna": ["keratin-treatment-patna"],
};

const OCCASION_FUNNEL: Record<string, string[]> = {
  "essential-facial": ["bridal-glow-prep-patna", "bridal-hd-makeup-patna"],
  "hydrafacial-patna": ["bridal-glow-prep-patna", "bridal-hd-makeup-patna"],
  "bridal-glow-prep-patna": ["bridal-hd-makeup-patna"],
};

export default function LocationServicePage({
  pageData,
  service,
  location,
  finalPrice,
  relatedServices = [],
}: LocationServicePageProps) {
  const [showQuiz, setShowQuiz] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  const landmarks = pageData.nearby_landmarks ?? [location.landmark, "Patna City"].filter(Boolean);
  // More realistic distance text
  const distanceText = landmarks[0]?.toLowerCase().includes("metro")
    ? "2–3 mins walk"
    : "5–7 mins drive";

  const upgradeSlugs = UPGRADE_MAP[service.slug] || [];
  const occasionSlugs = OCCASION_FUNNEL[service.slug] || [];

  const sameCategory = relatedServices.filter(s => s.category === service.category && s.id !== service.id);
  const upgradeServices = relatedServices.filter(s => upgradeSlugs.includes(s.slug));
  const occasionServices = relatedServices.filter(s => occasionSlugs.includes(s.slug));

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-28">
      {/* Nearby banner (personalised) */}
      {from === "metro" && (
        <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg mb-4 flex justify-between items-center">
          <span>📍 You searched near Bhootnath Metro Station — we’re just 2–3 mins away.</span>
          <a href="tel:+919650461390" className="font-bold underline whitespace-nowrap ml-2">
            Call now →
          </a>
        </div>
      )}
      {from === "nmch" && (
        <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg mb-4 flex justify-between items-center">
          <span>📍 You searched near NMCH — our salon is conveniently close.</span>
          <a href="tel:+919650461390" className="font-bold underline whitespace-nowrap ml-2">
            Call now →
          </a>
        </div>
      )}

      {/* Visible SEO chips */}
      {pageData.seo_keywords && pageData.seo_keywords.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">🔍 Popular Searches in Patna</h2>
          <div className="flex flex-wrap gap-2">
            {pageData.seo_keywords.slice(0, 8).map((kw) => (
              <span key={kw} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Breadcrumbs (visual) */}
      <nav className="text-sm text-gray-500 mb-4">
        <a href="/" className="hover:text-rose-500">Home</a> &gt;
        <a href={`/${location.slug}`} className="hover:text-rose-500"> {location.name}</a> &gt;
        <span className="text-gray-800"> {service.title}</span>
      </nav>

      {/* Hero Card */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 mb-6">
        <div className="relative aspect-video">
          <Image src={service.image || "/placeholder.jpg"} alt={service.title} fill className="object-cover" />
          <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-sm font-bold text-rose-600">
            📍 {location.name}
          </div>
        </div>
        <div className="p-5">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {service.title} in {location.name}
          </h1>
          <p className="text-gray-600 text-sm mb-4">
            {pageData.local_description?.slice(0, 150)}...
          </p>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-bold text-rose-600">₹{finalPrice}</span>
            {service.original_price && (
              <span className="text-sm text-gray-400 line-through">₹{service.original_price}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4" /> Book Now
            </button>
            <a href="tel:+919650461390" className="border border-rose-200 text-rose-600 px-6 py-2 rounded-full font-bold flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4" /> Call
            </a>
          </div>
          <div className="mt-4 flex items-center gap-3 text-xs text-gray-500">
            <MapPin className="w-3 h-3" /> {landmarks.slice(0, 2).join(" • ")}
          </div>
          {/* Distance signal with location name */}
          <p className="text-xs text-green-600 mt-2">
            🚶 Just {distanceText} from {landmarks[0]} ({location.name})
          </p>
        </div>
      </div>

      {/* Interactive Tools */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button onClick={() => setShowQuiz(true)} className="bg-gradient-to-br from-purple-100 to-pink-100 p-4 rounded-xl text-left active:scale-95 transition-transform">
          <div className="text-2xl mb-1">💫</div>
          <div className="font-bold text-sm">Beauty Quiz</div>
          <div className="text-xs text-gray-600">Get personalized recs</div>
        </button>
        <button onClick={() => setShowAnalysis(true)} className="bg-gradient-to-br from-blue-100 to-cyan-100 p-4 rounded-xl text-left active:scale-95 transition-transform">
          <div className="text-2xl mb-1">🔬</div>
          <div className="font-bold text-sm">AI Skin Analysis</div>
          <div className="text-xs text-gray-600">For {location.name} climate</div>
        </button>
      </div>

      {/* Local Highlights */}
      {pageData.local_highlights && pageData.local_highlights.length > 0 && (
        <div className="bg-rose-50 rounded-xl p-5 mb-6">
          <h2 className="font-bold text-lg mb-3">✨ Why Choose Us in {location.name}</h2>
          <ul className="space-y-2">
            {pageData.local_highlights.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm">
                <span className="text-rose-500">✔</span> {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Detailed Local Description */}
      {pageData.local_description && (
        <div className="prose prose-sm max-w-none bg-white p-5 rounded-xl shadow-sm mb-6">
          <h2 className="text-lg font-bold">About {service.title} Near {landmarks[0]}</h2>
          <div dangerouslySetInnerHTML={{ __html: pageData.local_description }} />
        </div>
      )}

      {/* Semantic Internal Linking with title attribute */}
      <div className="space-y-6 mb-6">
        {sameCategory.length > 0 && (
          <div>
            <h3 className="font-bold text-md mb-2">✨ More {service.category || "Related"} Services</h3>
            <div className="flex flex-wrap gap-2">
              {sameCategory.map((s) => (
                <Link
                  key={s.id}
                  href={`/${location.slug}/${s.slug}`}
                  title={`${s.title} in ${location.name}`}
                  className="bg-white border border-gray-200 rounded-full px-3 py-1.5 text-sm hover:border-rose-300 hover:text-rose-600"
                >
                  {`${s.title} in ${location.name}`}
                </Link>
              ))}
            </div>
          </div>
        )}
        {upgradeServices.length > 0 && (
          <div>
            <h3 className="font-bold text-md mb-2">⬆️ Upgrade Your Glow</h3>
            <div className="flex flex-wrap gap-2">
              {upgradeServices.map((s) => (
                <Link
                  key={s.id}
                  href={`/${location.slug}/${s.slug}`}
                  title={`${s.title} in ${location.name}`}
                  className="bg-white border border-gray-200 rounded-full px-3 py-1.5 text-sm hover:border-rose-300 hover:text-rose-600"
                >
                  {`${s.title} in ${location.name}`}
                </Link>
              ))}
            </div>
          </div>
        )}
        {occasionServices.length > 0 && (
          <div>
            <h3 className="font-bold text-md mb-2">🎉 Perfect For Your Occasion</h3>
            <div className="flex flex-wrap gap-2">
              {occasionServices.map((s) => (
                <Link
                  key={s.id}
                  href={`/${location.slug}/${s.slug}`}
                  title={`${s.title} in ${location.name}`}
                  className="bg-white border border-gray-200 rounded-full px-3 py-1.5 text-sm hover:border-rose-300 hover:text-rose-600"
                >
                  {`${s.title} in ${location.name}`}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Local Reviews */}
      {pageData.local_reviews && pageData.local_reviews.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-5 mb-6">
          <h2 className="font-bold text-lg mb-3">⭐ What {location.name} Clients Say</h2>
          <div className="space-y-3">
            {pageData.local_reviews.map((review, idx) => (
              <div key={idx} className="bg-white p-3 rounded-lg">
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-yellow-400" : "text-gray-300"}`} />
                  ))}
                </div>
                <p className="text-sm text-gray-700">"{review.review_text}"</p>
                <p className="text-xs text-gray-500 mt-1">— {review.customer_name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Final CTA */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-xl p-6 text-center text-white">
        <h2 className="text-xl font-bold mb-2">Ready to Glow?</h2>
        <p className="text-sm mb-4">Book your {service.title} at our {location.name} salon today.</p>
        <button className="bg-white text-rose-600 px-6 py-2 rounded-full font-bold text-sm">Book Now →</button>
      </div>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 flex gap-3 z-50 lg:hidden shadow-lg">
        <a href="tel:+919650461390" className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold text-center flex items-center justify-center gap-2">
          <Phone className="w-4 h-4" /> 📞 Call Now (Instant Booking)
        </a>
        <button className="flex-1 bg-rose-500 text-white py-3 rounded-xl font-bold text-center flex items-center justify-center gap-2">
          <Calendar className="w-4 h-4" /> ✨ Book Appointment (10% Off Today)
        </button>
      </div>

      {/* Modals */}
      {showQuiz && <BeautyQuiz onClose={() => setShowQuiz(false)} />}
      {showAnalysis && <SkinAnalysis onClose={() => setShowAnalysis(false)} />}
    </div>
  );
}