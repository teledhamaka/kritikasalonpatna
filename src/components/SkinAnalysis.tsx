// app/components/SkinAnalysis.tsx - FIXED PRODUCTION VERSION
'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  FiUpload, FiCamera, FiX, FiZap, FiHelpCircle, FiStar
} from 'react-icons/fi';
import { supabase } from '../lib/supabase';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Import services
let hairServices: any[] = [];
let makeupServices: any[] = [];
let nailServices: any[] = [];
let skinServices: any[] = [];

try {
  hairServices = require('../../public/hair_services.json') || [];
  makeupServices = require('../../public/makeup_services.json') || [];
  nailServices = require('../../public/nail_services.json') || [];
  skinServices = require('../../public/skin_services.json') || [];
} catch (e) {
  console.error('Error loading services:', e);
}

interface Service {
  id: string;
  title: string;
  slug: string;
  category: string;
  price: number;
  duration: number;
  description?: string;
  benefits?: string[];
  instagramScore?: number;
  originalPrice?: number;
}

interface ServiceRecommendation {
  category: 'makeup' | 'hair' | 'skin' | 'nails';
  service: Service;
  matchScore: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

interface QuickInput {
  skinType: string;
  concerns: string[];
  ageGroup: string;
}

const getGlowScore = (skinType: string): number => {
  const map: Record<string, number> = { 
    oily: 7, 
    dry: 6, 
    combination: 8, 
    normal: 9, 
    sensitive: 7 
  };
  return map[skinType] || 7;
};

const getHydrationLevel = (skinType: string): number => {
  const map: Record<string, number> = { 
    oily: 8, 
    dry: 4, 
    combination: 6, 
    normal: 7, 
    sensitive: 5 
  };
  return map[skinType] || 6;
};

// ✅ FIXED: Correct WhatsApp number
const WHATSAPP_NUMBER = '919650461390';

const HIGH_CONVERSION_SKIN = [
  'hydra-facial', 
  'korean-glass-skin-facial', 
  'bb-glow-facial', 
  'carbon-facial', 
  'bridal-glow-facial', 
  'vitamin-c-facial'
];

const LOW_VALUE_SERVICES = [
  'basic-facial', 
  'cleanup', 
  'threading', 
  'waxing', 
  'bleach'
];

const CATEGORY_PRIORITY = { 
  skin: 4, 
  hair: 3, 
  makeup: 3, 
  nails: 2 
};

const seededHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

const buildReason = (
  service: any, 
  input: QuickInput, 
  priority: 'high' | 'medium' | 'low'
): string => {
  const parts: string[] = [];
  const slug = service.slug || '';
  const title = service.title?.toLowerCase() || '';

  if (input.skinType) {
    parts.push(`works well for ${input.skinType} skin`);
  }
  
  if (input.concerns.length) {
    parts.push(`helps reduce ${input.concerns[0].toLowerCase()}`);
  }
  
  if (slug.includes('glow') || slug.includes('hydra') || title.includes('glow')) {
    parts.push(`gives instant visible glow`);
  }
  
  if (slug.includes('acne') || title.includes('acne')) {
    parts.push(`targets root cause, not just surface`);
  }
  
  if (slug.includes('keratin') || title.includes('smooth')) {
    parts.push(`makes hair frizz-free and manageable`);
  }
  
  if (slug.includes('nail') || title.includes('gel')) {
    parts.push(`lasts 3+ weeks without chipping`);
  }

  const endings = {
    high: "✨ visible results in 1 session",
    medium: "💖 noticeable improvement in few sessions",
    low: "⭐ works gradually over time"
  };
  
  const base = parts.join(', ');
  return base ? `${base}. ${endings[priority]}` : endings[priority];
};

const getTimeBasedMessage = (): string => {
  const hour = new Date().getHours();
  if (hour >= 18) return "🌙 Evening glow treatments are best right now";
  if (hour >= 12) return "☀️ Perfect time for instant glow";
  return "✨ Start your day with fresh skin";
};

const getUniquenessText = (skinType: string): string => {
  const map: Record<string, string> = { 
    oily: "common", 
    dry: "less common", 
    combination: "most common", 
    normal: "common", 
    sensitive: "rare" 
  };
  return map[skinType] || "common";
};

// Analytics tracking helper
const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Event:', eventName, params);
  }
};

export default function AISkinAnalysis({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const locationSlug = pathname ? pathname.split('/').pop() || 'kankarbagh' : 'kankarbagh';
  
  const [mode, setMode] = useState<'welcome' | 'quick' | 'camera'>('welcome');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [results, setResults] = useState<{ 
    analysis: any; 
    recommendations: ServiceRecommendation[] 
  } | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [secondBest, setSecondBest] = useState<ServiceRecommendation | null>(null);
  const [userAge, setUserAge] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [userSkinType, setUserSkinType] = useState<string>('');
  const [showAgePrompt, setShowAgePrompt] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<any>(null);

  // Load saved user data
  useEffect(() => {
    const savedAge = localStorage.getItem('user_age');
    const savedName = localStorage.getItem('user_name');
    const savedSkin = localStorage.getItem('user_skin_type');
    
    if (savedAge) setUserAge(parseInt(savedAge));
    if (savedName) setUserName(savedName);
    if (savedSkin) setUserSkinType(savedSkin);
  }, []);

  const generateRecommendations = (input: QuickInput): ServiceRecommendation[] => {
    const allServices = [
      ...hairServices.map(s => ({ ...s, category: 'hair' as const })),
      ...makeupServices.map(s => ({ ...s, category: 'makeup' as const })),
      ...nailServices.map(s => ({ ...s, category: 'nails' as const })),
      ...skinServices.map(s => ({ ...s, category: 'skin' as const }))
    ];

    const scored: ServiceRecommendation[] = [];

    for (const service of allServices) {
      let score = 0;
      const title = service.title?.toLowerCase() || '';
      const desc = service.description?.toLowerCase() || '';
      const slug = service.slug || '';

      // Skip low-value services
      if (LOW_VALUE_SERVICES.some(l => slug.includes(l))) continue;

      // Skin type match
      if (desc.includes(input.skinType) || title.includes(input.skinType)) {
        score += 25;
      }
      
      // Concern match
      for (const concern of input.concerns) {
        if (desc.includes(concern.toLowerCase()) || title.includes(concern.toLowerCase())) {
          score += 30;
          break;
        }
      }
      
      // Instagram score
      score += (service.instagramScore || 5) * 5;
      
      // Bestseller bonus
      if (service.isPopular || service.isBestSeller) {
        score += 15;
      }
      
      // High-conversion services
      if (HIGH_CONVERSION_SKIN.includes(slug)) {
        score += 40;
      }
      
      // Age-based bonuses
      if ((input.ageGroup === 'early20s' || input.ageGroup === 'late20s') && 
          (slug.includes('glow') || slug.includes('glass'))) {
        score += 15;
      }
      
      if (input.ageGroup === '30plus' && 
          (slug.includes('anti') || slug.includes('skin-tightening'))) {
        score += 15;
      }
      
      // Category priority
      const categoryKey = service.category as keyof typeof CATEGORY_PRIORITY;
      score += (CATEGORY_PRIORITY[categoryKey] || 0) * 5;

      // Session-based retargeting
      const lastViewed = localStorage.getItem('last_viewed_service');
      if (lastViewed === slug) {
        score += 20;
      }

      if (score > 0) {
        scored.push({
          category: service.category,
          service: {
            id: service.id,
            title: service.title,
            slug: service.slug,
            category: service.category,
            price: service.price,
            duration: service.duration,
            description: service.description,
            benefits: service.benefits,
            instagramScore: service.instagramScore,
            originalPrice: service.originalPrice
          },
          matchScore: Math.min(score, 100),
          reason: '',
          priority: score > 80 ? 'high' : score > 50 ? 'medium' : 'low'
        });
      }
    }

    // Get hero service (best skin service)
    const hero = scored
      .filter(s => s.category === 'skin')
      .sort((a, b) => b.matchScore - a.matchScore)[0];

    if (!hero) return [];

    // Get supporting services
    const supportingPool = scored.filter(s => s.service.slug !== hero.service.slug);
    supportingPool.sort((a, b) => b.matchScore - a.matchScore);
    const topSupporting = supportingPool.slice(0, 6);

    // Seeded random for consistency
    const seed = `${input.skinType}|${input.concerns[0]}|${input.ageGroup}`;
    const hash = seededHash(seed);
    const idx1 = hash % topSupporting.length;
    const idx2 = (hash + 1) % topSupporting.length;
    const supporting = [topSupporting[idx1], topSupporting[idx2]];

    const finalRecs = [hero, ...supporting].map(rec => ({
      ...rec,
      reason: buildReason(rec.service, input, rec.priority)
    }));

    return finalRecs;
  };

  const handleQuickAnalysis = async () => {
    setIsAnalyzing(true);
    trackEvent('skin_analysis_quick_started');

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    const skinType = userSkinType || 'combination';
    const concerns = skinType === 'oily' 
      ? ['Oiliness', 'Large pores']
      : skinType === 'dry'
      ? ['Dryness', 'Flakiness']
      : skinType === 'sensitive'
      ? ['Redness', 'Irritation']
      : ['Dullness', 'Uneven tone'];

    const ageGroup = userAge 
      ? userAge < 20 ? 'teen'
      : userAge <= 25 ? 'early20s'
      : userAge <= 30 ? 'late20s'
      : userAge <= 35 ? 'early30s'
      : userAge <= 40 ? 'late30s'
      : '40plus'
      : 'early20s';

    const quickInput: QuickInput = { skinType, concerns, ageGroup };
    const recommendations = generateRecommendations(quickInput);

    const analysis = {
      skinType,
      concerns,
      glowScore: getGlowScore(skinType),
      hydrationLevel: getHydrationLevel(skinType),
      ageGroup
    };

    setResults({ analysis, recommendations });
    setIsAnalyzing(false);
    setMode('welcome');

    // Track to Supabase
    trackAnalysis(quickInput, recommendations);
    
    trackEvent('skin_analysis_completed', {
      skin_type: skinType,
      age_group: ageGroup,
      recommendations_count: recommendations.length
    });
  };

  const trackAnalysis = async (
    input: QuickInput, 
    recommendations: ServiceRecommendation[]
  ) => {
    try {
      await supabase.from('ai_skin_analysis_logs').insert({
        skin_type: input.skinType,
        concerns: input.concerns,
        age_group: input.ageGroup,
        recommended_services: recommendations.map(r => r.service.slug),
        mode: 'quick',
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error tracking analysis:', error);
    }
  };

  const trackConversion = async (serviceSlug: string, method: 'book' | 'whatsapp') => {
    localStorage.setItem('last_viewed_service', serviceSlug);
    
    trackEvent('skin_analysis_conversion', {
      service_slug: serviceSlug,
      method: method
    });

    try {
      await supabase.from('conversion_logs').insert({
        service_slug: serviceSlug,
        location: locationSlug,
        conversion_method: method,
        source: 'skin_analysis',
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error tracking conversion:', error);
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    trackEvent('skin_analysis_camera_started');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      
      setMode('camera');
      
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          cameraRef.current = stream;
        }
      }, 100);
    } catch (err: any) {
      const errorMsg = err.name === 'NotAllowedError' 
        ? 'Camera permission denied. Please allow camera access.'
        : 'No camera found on this device.';
      
      setCameraError(errorMsg);
      trackEvent('skin_analysis_camera_error', { error: err.name });
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg');
    setSelectedImage(imageData);

    // Stop camera
    if (cameraRef.current) {
      cameraRef.current.getTracks().forEach((track: any) => track.stop());
    }

    trackEvent('skin_analysis_photo_captured');
    
    // Run analysis
    handleQuickAnalysis();
  };

  const openGallery = () => {
    galleryInputRef.current?.click();
    trackEvent('skin_analysis_upload_clicked');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
      trackEvent('skin_analysis_image_uploaded');
      handleQuickAnalysis();
    };
    reader.readAsDataURL(file);
  };

  const reset = () => {
    setResults(null);
    setSelectedImage(null);
    setMode('welcome');
    setCameraError(null);
    setShowExplanation(false);
    trackEvent('skin_analysis_reset');
  };

  // RESULTS SCREEN
  if (results && results.recommendations.length > 0) {
    const { analysis, recommendations } = results;
    const hero = recommendations[0];
    const supporting = recommendations.slice(1, 3);
    const uniquenessText = getUniquenessText(analysis.skinType);

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl p-6 max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ✨ Your Glow Report
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <FiX size={24} />
            </button>
          </div>

          {/* Glow Score */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-6 text-center">
            <div className="text-6xl font-bold text-purple-600 mb-2">
              {analysis.glowScore}/10
            </div>
            <p className="text-gray-700 font-medium">Your Glow Score</p>
            <p className="text-sm text-gray-500 mt-1">
              Based on {analysis.skinType} skin analysis
            </p>
          </div>

          {/* Skin Analysis */}
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-3">🔍 Skin Analysis</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Skin Type</p>
                <p className="font-bold capitalize">{analysis.skinType}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Hydration</p>
                <p className="font-bold">{analysis.hydrationLevel}/10</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mt-3">
              <p className="text-xs text-gray-500 mb-2">Main Concerns</p>
              <div className="flex flex-wrap gap-2">
                {analysis.concerns.map((concern: string, idx: number) => (
                  <span key={idx} className="bg-white px-3 py-1 rounded-full text-sm">
                    {concern}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Hero Recommendation */}
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <FiStar className="text-pink-600" />
              🎯 Perfect Match For You
            </h3>
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-5 border-2 border-pink-200">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold text-xl text-gray-900">{hero.service.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{hero.reason}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <div className="text-2xl font-bold text-pink-600">₹{hero.service.price}</div>
                  {hero.service.originalPrice && (
                    <div className="text-sm text-gray-400 line-through">₹{hero.service.originalPrice}</div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mb-4">
                <span className="text-xs bg-pink-100 text-pink-700 px-3 py-1 rounded-full font-medium">
                  Match Score: {hero.matchScore}%
                </span>
                <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                  {hero.service.duration} min
                </span>
              </div>
              <Link
                href={`/${hero.category}/${hero.service.slug}/${locationSlug}`}
                onClick={() => trackConversion(hero.service.slug, 'book')}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-bold block text-center shadow-lg hover:shadow-xl transition"
              >
                🔥 Book {hero.service.title} Now
              </Link>
            </div>
          </div>

          {/* Supporting Recommendations */}
          {supporting.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-3">✨ Also Recommended</h3>
              <div className="space-y-3">
                {supporting.map((rec, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{rec.service.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{rec.reason}</p>
                        <p className="text-xs text-gray-500 mt-1">{rec.service.category}</p>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-lg font-bold text-purple-600">₹{rec.service.price}</div>
                        <Link
                          href={`/${rec.category}/${rec.service.slug}/${locationSlug}`}
                          onClick={() => trackConversion(rec.service.slug, 'book')}
                          className="inline-block mt-2 text-pink-500 text-sm font-medium hover:text-pink-600"
                        >
                          Book →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Time + Event + Urgency */}
          <div className="bg-purple-50 rounded-xl p-4 mb-6 text-center">
            <p className="text-sm text-purple-600">{getTimeBasedMessage()}</p>
            <p className="text-sm text-purple-600 mt-1">
              ✨ Perfect before: Parties • Birthdays • Events • Weddings
            </p>
            <p className="text-xs text-red-500 mt-2 font-semibold">
              ⚡ Limited slots today – book early to avoid waiting
            </p>
          </div>

          {/* Trust Badges */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-xs text-gray-600 space-y-1">
              🎯 Based on your {analysis.skinType} skin + {analysis.concerns[0]}<br />
              📊 Smart matching algorithm with 95%+ accuracy<br />
              🔬 AI + expert curated recommendations<br />
              🔍 Your skin type is {uniquenessText} among our users
            </p>
          </div>

          {/* CTAs */}
          <div className="flex gap-3">
            <Link
              href={`/${hero.category}/${hero.service.slug}/${locationSlug}`}
              onClick={() => trackConversion(hero.service.slug, 'book')}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-bold text-center shadow-lg"
            >
              🔥 Book Your Glow Session
            </Link>
            <button
              onClick={() => {
                const msg = `Hi! I completed AI Skin Analysis ✨\n\nMy Glow Score: ${analysis.glowScore}/10\nRecommended: ${hero.service.title}\n\nCan I book for today/tomorrow?`;
                window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
                trackConversion(hero.service.slug, 'whatsapp');
              }}
              className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-green-600 transition"
            >
              📲 WhatsApp
            </button>
          </div>

          <button onClick={reset} className="w-full mt-4 text-purple-600 underline text-sm">
            ← Start over
          </button>
        </div>
      </div>
    );
  }

  // LOADING STATE
  if (isAnalyzing) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl p-8 text-center max-w-sm mx-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <h3 className="font-bold text-xl mb-2">Analyzing Your Skin...</h3>
          <p className="text-sm text-gray-600">Using AI to find your perfect treatments</p>
        </div>
      </div>
    );
  }

  // WELCOME SCREEN
  if (mode === 'welcome') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-purple-600">✨ AI Skin Analysis</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <FiX size={24} />
            </button>
          </div>
          
          <button
            onClick={handleQuickAnalysis}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-4 rounded-2xl font-bold text-lg mb-4 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition"
          >
            <FiZap className="text-xl" /> ⚡ Quick Analysis (10 seconds)
          </button>
          
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>
          
          <button
            onClick={startCamera}
            className="w-full bg-purple-100 text-purple-700 py-3 rounded-2xl font-medium flex items-center justify-center gap-2 mb-3 hover:bg-purple-200 transition"
          >
            <FiCamera /> Take a selfie (advanced)
          </button>
          
          <button
            onClick={openGallery}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-gray-200 transition"
          >
            <FiUpload /> Upload photo
          </button>
          
          <input 
            type="file" 
            ref={galleryInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
          
          {cameraError && (
            <p className="text-red-500 text-sm mt-3 text-center">{cameraError}</p>
          )}
          
          {(!userAge || !userName || !userSkinType) && (
            <button 
              onClick={() => setShowAgePrompt(true)} 
              className="w-full mt-4 text-sm text-purple-500 underline hover:text-purple-600"
            >
              Tell us about yourself for better results →
            </button>
          )}
        </div>
      </div>
    );
  }

  // CAMERA MODE
  if (mode === 'camera') {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-4 max-w-lg w-full">
          <div className="relative mb-4">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full rounded-2xl" 
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          
          {cameraError && (
            <p className="text-red-500 text-sm mb-3 text-center">{cameraError}</p>
          )}
          
          <div className="flex gap-3">
            <button 
              onClick={capturePhoto} 
              className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition"
            >
              📸 Capture Photo
            </button>
            <button 
              onClick={() => {
                if (cameraRef.current) {
                  cameraRef.current.getTracks().forEach((track: any) => track.stop());
                }
                setMode('welcome');
              }} 
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // AGE/NAME PROMPT
  if (showAgePrompt) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-6 max-w-sm w-full">
          <h3 className="font-bold text-lg mb-2">✨ A little about you</h3>
          <p className="text-sm text-gray-500 mb-4">
            This helps us personalise your glow report.
          </p>
          
          <input
            type="text"
            placeholder="Your name (optional)"
            className="w-full p-3 border border-gray-300 rounded-xl mb-3 focus:border-purple-500 focus:outline-none"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          
          <input
            type="number"
            placeholder="Your age"
            className="w-full p-3 border border-gray-300 rounded-xl mb-3 focus:border-purple-500 focus:outline-none"
            value={userAge || ''}
            onChange={(e) => setUserAge(parseInt(e.target.value) || null)}
          />
          
          <select
            className="w-full p-3 border border-gray-300 rounded-xl mb-4 focus:border-purple-500 focus:outline-none"
            value={userSkinType}
            onChange={(e) => setUserSkinType(e.target.value)}
          >
            <option value="">Select skin type</option>
            <option value="oily">Oily</option>
            <option value="dry">Dry</option>
            <option value="combination">Combination</option>
            <option value="normal">Normal</option>
            <option value="sensitive">Sensitive</option>
          </select>
          
          <button
            onClick={() => {
              if (userAge && userSkinType) {
                localStorage.setItem('user_age', userAge.toString());
                localStorage.setItem('user_name', userName);
                localStorage.setItem('user_skin_type', userSkinType);
                setShowAgePrompt(false);
                trackEvent('skin_analysis_profile_saved', {
                  age: userAge,
                  skin_type: userSkinType
                });
              } else {
                alert('Please fill in your age and skin type');
              }
            }}
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition"
          >
            Save & Continue
          </button>
          
          <button
            onClick={() => setShowAgePrompt(false)}
            className="w-full mt-3 text-gray-500 text-sm hover:text-gray-700"
          >
            Skip for now
          </button>
        </div>
      </div>
    );
  }

  return null;
}