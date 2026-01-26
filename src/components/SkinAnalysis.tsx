// app/components/AISkinAnalysis.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  FiUpload, FiCamera, FiCheck, FiUser, FiX, FiShare2, 
  FiRefreshCw, FiSun, FiWind, FiSmile, FiMeh, 
  FiDroplet, FiActivity, FiStar, FiClock, FiTag,
  FiInfo
} from 'react-icons/fi';
import { supabase } from '../lib/supabase';
import Image from 'next/image';

// Import your JSON files
const makeupServices = require('../../public/makeup_services.json');
const hairServices = require('../../public/hair_services.json');
const nailServices = require('../../public/nail_services.json');
const skinServices = require('../../public/skin_services.json');

// Declare MediaPipe types (will be loaded from CDN)
declare global {
  interface Window {
    FaceMesh: any;
    Camera: any;
  }
}

interface SkinFeature {
  id: string;
  feature: string;
  description: string;
  recommendations: string[];
  skin_tone: string[];
  skin_texture: string[];
  age_group: string;
}

interface UserProfile {
  age: number;
  name: string;
  skin_type?: string;
  hair_type?: string;
}

// Define proper service interfaces based on your JSON structure
interface Service {
  id: string;
  title: string;
  slug: string;
  category: string;
  price: number;
  duration: number;
  description?: string;
  keyIngredients?: string[];
  features?: {
    suitableFor?: string[];
    benefits?: string[];
    recommendedFor?: string[];
    priorityScore?: number;
    keyIngredients?: string[];
  };
  suitableFor?: string[];
  benefits?: string[];
  recommendedFor?: string[];
  priorityScore?: number;
}

interface ServiceRecommendation {
  category: 'makeup' | 'hair' | 'skin' | 'nails';
  service: Service;
  matchScore: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

interface SkinAnalysisResult {
  skinTone: string;
  undertone: 'cool' | 'warm' | 'neutral';
  skinTexture: string;
  skinType: 'oily' | 'dry' | 'combination' | 'normal';
  concerns: string[];
  hydrationLevel: number; // 1-10
  glowScore: number; // 1-10
  ageGroup: string;
  faceShape?: 'oval' | 'round' | 'square' | 'heart' | 'diamond';
}

// Helper functions defined at module level
const getCategoryIcon = (category: string) => {
  switch(category) {
    case 'makeup': return '💄';
    case 'hair': return '💇‍♀️';
    case 'skin': return '✨';
    case 'nails': return '💅';
    default: return '⭐';
  }
};

const getPriorityColor = (priority: string) => {
  switch(priority) {
    case 'high': return 'bg-red-100 text-red-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Helper function to get suitableFor from service
const getServiceSuitableFor = (service: Service): string[] => {
  return service.suitableFor || service.features?.suitableFor || [];
};

// Helper function to get benefits from service
const getServiceBenefits = (service: Service): string[] => {
  return service.benefits || service.features?.benefits || [];
};

// Helper function to get priority score from service
const getServicePriorityScore = (service: Service): number => {
  return service.priorityScore || service.features?.priorityScore || 0;
};

// Helper function to get key ingredients from service
const getServiceKeyIngredients = (service: Service): string[] => {
  return service.keyIngredients || service.features?.keyIngredients || [];
};

export default function AISkinAnalysis({ onClose }: { onClose: () => void }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<SkinAnalysisResult | null>(null);
  const [serviceRecommendations, setServiceRecommendations] = useState<ServiceRecommendation[]>([]);
  const [analysisStatus, setAnalysisStatus] = useState('Upload your selfie for analysis');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showAgePrompt, setShowAgePrompt] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [tempAge, setTempAge] = useState<number | null>(null);
  const [tempSkinType, setTempSkinType] = useState<string>('');
  const [tempHairType, setTempHairType] = useState<string>('');
  const [mediaPipeLoaded, setMediaPipeLoaded] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const faceMeshRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    // Try to fetch user profile, but don't require it
    checkUserProfile();
    loadMediaPipeScripts();
    
    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop?.();
      }
      if (faceMeshRef.current) {
        faceMeshRef.current.close?.();
      }
    };
  }, []);

  const loadMediaPipeScripts = () => {
    // Check if scripts are already loaded
    if (window.FaceMesh && window.Camera) {
      setMediaPipeLoaded(true);
      return;
    }

    // Load FaceMesh script
    const faceMeshScript = document.createElement('script');
    faceMeshScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js';
    faceMeshScript.crossOrigin = 'anonymous';
    
    // Load Camera Utils script
    const cameraScript = document.createElement('script');
    cameraScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';
    cameraScript.crossOrigin = 'anonymous';

    let scriptsLoaded = 0;
    const onScriptLoad = () => {
      scriptsLoaded++;
      if (scriptsLoaded === 2) {
        setMediaPipeLoaded(true);
      }
    };

    faceMeshScript.onload = onScriptLoad;
    cameraScript.onload = onScriptLoad;

    document.body.appendChild(faceMeshScript);
    document.body.appendChild(cameraScript);
  };

  const checkUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // No user logged in, that's fine - we'll use temporary profile
        return;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('age, name, skin_type, hair_type')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Don't show age prompt on error - allow guest usage
    }
  };

  const saveUserProfile = async (profile: { age: number; skinType?: string; hairType?: string }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // If logged in, save to database
        const { error } = await supabase
          .from('user_profiles')
          .upsert({ 
            user_id: user.id, 
            age: profile.age, 
            skin_type: profile.skinType,
            hair_type: profile.hairType,
            updated_at: new Date().toISOString() 
          });

        if (error) throw error;
        setUserProfile(prev => prev ? { ...prev, ...profile } : { ...profile, name: '' });
      } else {
        // Not logged in, just set temporary profile
        setTempAge(profile.age);
        setTempSkinType(profile.skinType || '');
        setTempHairType(profile.hairType || '');
      }
      
      setShowAgePrompt(false);
      
      // If we already have an image, analyze it now
      if (selectedImage) {
        analyzeSkin();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      // Even if save fails, continue with temporary values
      setTempAge(profile.age);
      setTempSkinType(profile.skinType || '');
      setTempHairType(profile.hairType || '');
      setShowAgePrompt(false);
      
      if (selectedImage) {
        analyzeSkin();
      }
    }
  };

  const initializeFaceMesh = () => {
    if (!window.FaceMesh) return null;

    const faceMesh = new window.FaceMesh({
      locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      }
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    faceMesh.onResults((results: any) => {
      if (!canvasRef.current || !results.multiFaceLandmarks?.[0]) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Simple face detection indicator
      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        ctx.strokeStyle = '#C0C0C070';
        ctx.lineWidth = 2;
        ctx.beginPath();
        // Draw a simple rectangle around detected face area
        ctx.rect(50, 50, canvas.width - 100, canvas.height - 100);
        ctx.stroke();
      }
    });

    faceMeshRef.current = faceMesh;
    return faceMesh;
  };

  const startCamera = () => {
    if (!mediaPipeLoaded) {
      alert('Camera utilities are still loading. Please wait a moment and try again.');
      return;
    }

    setShowCamera(true);
    setTimeout(() => {
      if (videoRef.current && window.Camera) {
        const faceMesh = initializeFaceMesh();
        if (!faceMesh) return;

        const camera = new window.Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current && faceMesh) {
              await faceMesh.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480
        });
        camera.start();
        cameraRef.current = camera;
      }
    }, 100);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    const photoData = canvas.toDataURL('image/jpeg');
    handlePhotoCaptured(photoData);
  };

  const handlePhotoCaptured = (photoData: string) => {
    setSelectedImage(photoData);
    setShowCamera(false);
    
    // Stop camera
    if (cameraRef.current) {
      cameraRef.current.stop?.();
    }
    
    setAnalysisStatus('📸 Photo captured! Analyzing...');
    
    // Check if we have age info
    if (userProfile?.age || tempAge) {
      analyzeSkin();
    } else {
      setShowAgePrompt(true);
    }
  };

  const openGallery = () => {
    galleryInputRef.current?.click();
  };

  const openCamera = () => {
    startCamera();
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setAnalysisResults(null);
    setServiceRecommendations([]);
    setAnalysisStatus('Upload your selfie for analysis');
    setShowCamera(false);
    setTempAge(null);
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setSelectedImage(imageData);
        setAnalysisStatus('🖼️ Image selected! Analyzing...');
        
        // Check if we have age info
        if (userProfile?.age || tempAge) {
          analyzeSkin();
        } else {
          setShowAgePrompt(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeSkin = async () => {
    if (!selectedImage) return;
    
    // Get age from either user profile or temporary storage
    const age = userProfile?.age || tempAge;
    if (!age) {
      setShowAgePrompt(true);
      return;
    }

    setIsLoading(true);
    setAnalysisResults(null);
    setServiceRecommendations([]);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Use temporary skin/hair type if available
      const skinTypeFromUser = userProfile?.skin_type || tempSkinType;
      const hairTypeFromUser = userProfile?.hair_type || tempHairType;
      
      // Simulate AI analysis
      const mockAnalysis: SkinAnalysisResult = {
        skinTone: getRandomSkinTone(),
        undertone: getRandomUndertone(),
        skinTexture: getRandomSkinTexture(),
        skinType: skinTypeFromUser ? (skinTypeFromUser as any) : getRandomSkinType(),
        concerns: getRandomConcerns(),
        hydrationLevel: Math.floor(Math.random() * 10) + 1,
        glowScore: Math.floor(Math.random() * 10) + 1,
        ageGroup: determineAgeGroup(age),
        faceShape: getRandomFaceShape()
      };

      setAnalysisResults(mockAnalysis);
      setAnalysisStatus('✨ Analysis Complete!');

      // Generate service recommendations
      const recommendations = generateServiceRecommendations(mockAnalysis, age);
      setServiceRecommendations(recommendations);

    } catch (error) {
      setAnalysisStatus('Analysis failed. Please try again.');
      console.error('Skin analysis error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions for mock analysis
  const getRandomSkinTone = () => {
    const tones = ['Porcelain Fair', 'Creamy Wheatish', 'Warm Medium', 'Rich Deep'];
    return tones[Math.floor(Math.random() * tones.length)];
  };

  const getRandomUndertone = (): 'cool' | 'warm' | 'neutral' => {
    const undertones: ('cool' | 'warm' | 'neutral')[] = ['cool', 'warm', 'neutral'];
    return undertones[Math.floor(Math.random() * undertones.length)];
  };

  const getRandomSkinTexture = () => {
    const textures = ['Baby Smooth', 'Silky Normal', 'Combination', 'Textured'];
    return textures[Math.floor(Math.random() * textures.length)];
  };

  const getRandomSkinType = (): 'oily' | 'dry' | 'combination' | 'normal' => {
    const types: ('oily' | 'dry' | 'combination' | 'normal')[] = ['oily', 'dry', 'combination', 'normal'];
    return types[Math.floor(Math.random() * types.length)];
  };

  const getRandomConcerns = () => {
    const concerns = [
      'Dryness', 'Oiliness', 'Pores', 'Dullness', 
      'Acne', 'Pigmentation', 'Fine Lines', 'Redness'
    ];
    return concerns.slice(0, Math.floor(Math.random() * 3) + 2);
  };

  const getRandomFaceShape = (): 'oval' | 'round' | 'square' | 'heart' | 'diamond' => {
    const shapes: ('oval' | 'round' | 'square' | 'heart' | 'diamond')[] = ['oval', 'round', 'square', 'heart', 'diamond'];
    return shapes[Math.floor(Math.random() * shapes.length)];
  };

  const determineAgeGroup = (age: number): string => {
    if (age < 20) return 'teen';
    if (age <= 25) return 'early20s';
    if (age <= 30) return 'late20s';
    if (age <= 35) return 'early30s';
    if (age <= 40) return 'late30s';
    return '40plus';
  };

  const generateServiceRecommendations = (analysis: SkinAnalysisResult, age: number): ServiceRecommendation[] => {
    const recommendations: ServiceRecommendation[] = [];
    
    // Skin service recommendations
    (skinServices as Service[]).forEach((service: Service) => {
      let score = 0;
      let reason = '';
      
      // Check if service is suitable for the skin type
      const suitableFor = getServiceSuitableFor(service);
      if (suitableFor.some((s: string) => 
        analysis.skinType.toLowerCase().includes(s.toLowerCase()) || 
        s.toLowerCase().includes(analysis.skinType.toLowerCase())
      )) {
        score += 30;
        reason += `Perfect for ${analysis.skinType} skin. `;
      }
      
      // Check if service addresses concerns
      if (analysis.concerns.some(c => 
        service.title.toLowerCase().includes(c.toLowerCase()) ||
        (service.description?.toLowerCase().includes(c.toLowerCase()))
      )) {
        score += 40;
        reason += `Targets your ${analysis.concerns.join(', ')} concerns. `;
      }
      
      // Age-based recommendations
      if (analysis.ageGroup === 'teen' || analysis.ageGroup === 'early20s') {
        const priorityScore = getServicePriorityScore(service);
        if (priorityScore >= 7) {
          score += 20;
          reason += 'Popular choice for your age group. ';
        }
      }
      
      if (score > 0) {
        recommendations.push({
          category: 'skin',
          service,
          matchScore: score,
          reason,
          priority: score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low'
        });
      }
    });

    // Makeup service recommendations
    (makeupServices as Service[]).forEach((service: Service) => {
      let score = 0;
      let reason = '';
      
      // Hydration-focused makeup for dry skin
      if (analysis.skinType === 'dry' && (
        service.title.toLowerCase().includes('hydrat') ||
        service.title.toLowerCase().includes('moistur') ||
        (service.description?.toLowerCase().includes('hydrat'))
      )) {
        score += 30;
        reason += 'Hydrating formula for dry skin. ';
      }
      
      // Age-appropriate makeup
      if ((analysis.ageGroup.includes('30') || analysis.ageGroup.includes('40')) &&
          (service.title.toLowerCase().includes('anti-aging') || 
           service.title.toLowerCase().includes('mature') ||
           service.title.toLowerCase().includes('wrinkle'))
      ) {
        score += 40;
        reason += 'Anti-aging benefits for mature skin. ';
      }
      
      if (score > 0) {
        recommendations.push({
          category: 'makeup',
          service,
          matchScore: score,
          reason,
          priority: score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low'
        });
      }
    });

    // Hair service recommendations
    (hairServices as Service[]).forEach((service: Service) => {
      let score = 0;
      let reason = '';
      
      // Scalp treatments for oily skin
      if (analysis.skinType === 'oily' && service.title.toLowerCase().includes('scalp')) {
        score += 30;
        reason += 'Controls oil production. ';
      }
      
      // Age-appropriate hair treatments
      if (analysis.ageGroup.includes('40') && service.title.toLowerCase().includes('treatment')) {
        score += 30;
        reason += 'Age-appropriate hair care. ';
      }
      
      if (score > 0) {
        recommendations.push({
          category: 'hair',
          service,
          matchScore: score,
          reason,
          priority: score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low'
        });
      }
    });

    // Nail service recommendations
    (nailServices as Service[]).forEach((service: Service) => {
      let score = 0;
      let reason = '';
      
      // Bridal nail packages for wedding season
      if (service.title.toLowerCase().includes('bridal')) {
        score += 30;
        reason += 'Perfect for special occasions. ';
      }
      
      // Basic services for regular maintenance
      if (service.title.toLowerCase().includes('basic') || service.title.toLowerCase().includes('regular')) {
        score += 20;
        reason += 'Great for regular maintenance. ';
      }
      
      if (score > 0) {
        recommendations.push({
          category: 'nails',
          service,
          matchScore: score,
          reason,
          priority: score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low'
        });
      }
    });

    // Sort by match score and take top 8
    return recommendations
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 8);
  };

  const getAgeGroupDisplay = (age: number) => {
    if (age < 20) return 'Teen Glow';
    if (age <= 25) return 'Early 20s Radiance';
    if (age <= 30) return 'Late 20s Brilliance';
    if (age <= 35) return 'Early 30s Elegance';
    if (age <= 40) return 'Late 30s Sophistication';
    return 'Timeless Beauty 40+';
  };

  // Show disclaimer first
  if (showDisclaimer) {
    return <DisclaimerModal onAccept={() => setShowDisclaimer(false)} onClose={onClose} />;
  }

  // Show age prompt if needed (after photo capture or if manually requested)
  if (showAgePrompt) {
    return <AgePrompt 
      onSave={saveUserProfile} 
      onClose={onClose}
      isLoggedIn={!!userProfile}
      defaultAge={userProfile?.age || tempAge || undefined}
    />;
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-purple-200">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 py-2">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Beauty Analysis ✨
            </h2>
            <p className="text-sm text-gray-600 mt-1">Powered by MediaPipe Face Analysis</p>
          </div>
          <div className="flex items-center gap-3">
            {!userProfile && (
              <button 
                onClick={() => setShowDisclaimer(true)}
                className="text-purple-500 hover:text-purple-700 transition-colors flex items-center gap-1"
              >
                <FiInfo size={16} />
                <span className="text-sm">Privacy Info</span>
              </button>
            )}
            <button onClick={onClose} className="text-purple-500 hover:text-purple-700 transition-colors">
              <FiX size={24} />
            </button>
          </div>
        </div>

        {/* Camera View */}
        {showCamera && (
          <div className="mb-6">
            <div className="relative rounded-2xl overflow-hidden border-2 border-purple-300">
              <video 
                ref={videoRef} 
                className="w-full h-64 object-cover"
                autoPlay 
                playsInline
              />
              <canvas 
                ref={canvasRef} 
                className="absolute inset-0 w-full h-full pointer-events-none"
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                👤 Face detected - Smile for the camera!
              </div>
            </div>
            <button 
              onClick={capturePhoto}
              className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all"
            >
              📸 Capture Photo
            </button>
          </div>
        )}

        {/* Image Selection */}
        {!showCamera && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 mb-6 border border-purple-200">
            <h3 className="font-bold text-lg mb-4 text-center text-gray-800">Capture Your Natural Beauty</h3>
            
            <div className="text-center mb-6">
              {selectedImage ? (
                <div className="relative inline-block">
                  <div className="relative w-64 h-64 mx-auto rounded-2xl overflow-hidden shadow-lg">
                    <Image 
                      src={selectedImage} 
                      alt="Skin analysis" 
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="mt-4 bg-black/60 text-white px-4 py-2 rounded-full text-sm inline-block">
                    {analysisStatus}
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-purple-300 rounded-2xl p-8 text-center bg-white hover:bg-purple-50 transition-colors cursor-pointer" onClick={openCamera}>
                  <div className="text-6xl mb-4">📸</div>
                  <p className="text-gray-700 font-medium">Take a clear, makeup-free selfie</p>
                  <p className="text-sm text-gray-500 mt-2">Good lighting gives the best results!</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                onClick={openCamera} 
                className="flex items-center justify-center bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all"
              >
                <FiCamera className="mr-3 text-lg" />Take Photo
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                onClick={openGallery} 
                className="flex items-center justify-center bg-gradient-to-r from-pink-500 to-pink-600 text-white py-4 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all"
              >
                <FiUpload className="mr-3 text-lg" />Upload Photo
              </motion.button>
            </div>
            
            {selectedImage && (
              <button 
                onClick={resetAnalysis} 
                className="w-full text-center mt-4 text-purple-600 font-semibold hover:text-purple-800 flex items-center justify-center transition-colors"
              >
                <FiRefreshCw className="mr-2"/> Start Over
              </button>
            )}
            
            <input 
              type="file" 
              ref={galleryInputRef} 
              onChange={handleImageSelect} 
              accept="image/*" 
              className="hidden"
            />
          </div>
        )}

        {/* User Profile Info */}
        {(userProfile || tempAge) && (
          <div className="bg-white rounded-2xl p-4 mb-6 border border-purple-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-full p-2 mr-3">
                  <FiUser className="text-purple-600" size={20} />
                </div>
                <div>
                  <p className="font-bold text-gray-800">
                    {getAgeGroupDisplay(userProfile?.age || tempAge!)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {userProfile?.age || tempAge} years young
                    {!userProfile && " (Guest)"}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowAgePrompt(true)} 
                className="text-purple-600 text-sm hover:text-purple-800 transition-colors"
              >
                Edit profile
              </button>
            </div>
            
            {/* Disclaimer for guest users */}
            {!userProfile && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-700 flex items-start">
                  <FiInfo className="mr-2 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Guest mode:</strong> Your analysis is not saved. 
                    {tempSkinType && ` Using skin type: ${tempSkinType}`}
                    {tempHairType && `, hair type: ${tempHairType}`}
                    . For personalized results and to save your analysis, please log in.
                  </span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Loading Animation */}
        <AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="text-center py-8"
            >
              <div className="relative">
                <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-purple-600 mx-auto"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-2xl">✨</div>
                </div>
              </div>
              <h4 className="text-lg font-bold text-purple-600 mt-4 mb-2">Analyzing Your Beauty Profile...</h4>
              <p className="text-gray-600">Our AI is finding your personalized beauty plan!</p>
              <p className="text-sm text-gray-500 mt-2">Detecting skin tone, texture, and facial features</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analysis Results */}
        {analysisResults && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-purple-600 mb-3">Your Beauty Analysis</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full px-4 py-1 text-sm font-medium">
                  {analysisResults.skinTone}
                </span>
                <span className="bg-purple-100 text-purple-800 rounded-full px-4 py-1 text-sm font-medium">
                  {analysisResults.skinType}
                </span>
                <span className="bg-pink-100 text-pink-800 rounded-full px-4 py-1 text-sm font-medium">
                  {analysisResults.skinTexture}
                </span>
              </div>
            </div>

            {/* Analysis Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white border-2 border-purple-100 rounded-2xl p-4 text-center">
                <div className="text-2xl mb-2">💧</div>
                <h4 className="font-bold text-gray-800">Hydration</h4>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${analysisResults.hydrationLevel * 10}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{analysisResults.hydrationLevel}/10</p>
                </div>
              </div>
              
              <div className="bg-white border-2 border-purple-100 rounded-2xl p-4 text-center">
                <div className="text-2xl mb-2">✨</div>
                <h4 className="font-bold text-gray-800">Glow Score</h4>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${analysisResults.glowScore * 10}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{analysisResults.glowScore}/10</p>
                </div>
              </div>
              
              <div className="bg-white border-2 border-purple-100 rounded-2xl p-4 text-center">
                <div className="text-2xl mb-2">👁️</div>
                <h4 className="font-bold text-gray-800">Undertone</h4>
                <p className="text-lg font-bold capitalize mt-1 text-gray-700">
                  {analysisResults.undertone}
                </p>
              </div>
              
              <div className="bg-white border-2 border-purple-100 rounded-2xl p-4 text-center">
                <div className="text-2xl mb-2">🎯</div>
                <h4 className="font-bold text-gray-800">Concerns</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {analysisResults.concerns.slice(0, 2).join(', ')}
                </p>
              </div>
            </div>

            {/* Service Recommendations */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-bold text-gray-800 flex items-center">
                  <FiStar className="mr-2 text-yellow-500" />
                  Personalized Service Recommendations
                </h4>
                {!userProfile && (
                  <button 
                    onClick={() => setShowDisclaimer(true)}
                    className="text-xs text-purple-600 hover:text-purple-800 flex items-center"
                  >
                    <FiInfo className="mr-1" size={12} />
                    AI-generated results
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {serviceRecommendations.map((rec, index) => (
                  <ServiceRecommendationCard key={index} recommendation={rec} index={index} />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 sticky bottom-0 bg-white pt-4">
          <button 
            onClick={onClose} 
            className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-2xl font-bold hover:bg-gray-300 transition-colors"
          >
            Back to Home
          </button>
          {serviceRecommendations.length > 0 && (
            <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all">
              Book Recommended Services
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ServiceRecommendationCard({ recommendation, index }: { recommendation: ServiceRecommendation; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }} 
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white border-2 border-purple-100 rounded-2xl p-4 hover:border-purple-300 transition-colors cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start">
        <div className="bg-gradient-to-br from-purple-400 to-pink-500 text-white rounded-2xl p-3 mr-4 text-xl">
          {getCategoryIcon(recommendation.category)}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-gray-800 text-lg mb-1">{recommendation.service.title}</h4>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(recommendation.priority)}`}>
                  {recommendation.priority.toUpperCase()} PRIORITY
                </span>
                <span className="text-sm text-gray-600">⭐ {recommendation.matchScore}% match</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-purple-600">₹{recommendation.service.price}</div>
              <div className="text-sm text-gray-500 flex items-center justify-end mt-1">
                <FiClock className="mr-1" size={12} />
                {recommendation.service.duration} min
              </div>
            </div>
          </div>
          
          <p className="text-gray-600 mb-3">{recommendation.reason}</p>
          
          {expanded && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pt-4 border-t border-purple-100"
            >
              <p className="font-semibold text-purple-600 mb-2 flex items-center">
                <FiDroplet className="mr-2" />
                Key Benefits:
              </p>
              <ul className="space-y-1 mb-3">
                {getServiceBenefits(recommendation.service).slice(0, 3).map((benefit: string, i: number) => (
                  <li key={i} className="flex items-center text-sm text-gray-700">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                    {benefit}
                  </li>
                ))}
              </ul>
              
              {getServiceKeyIngredients(recommendation.service).length > 0 && (
                <>
                  <p className="font-semibold text-purple-600 mb-2 flex items-center">
                    <FiActivity className="mr-2" />
                    Key Ingredients:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {getServiceKeyIngredients(recommendation.service).slice(0, 3).map((ing: string, i: number) => (
                      <span key={i} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs">
                        {ing}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}
          
          <button className="text-purple-600 hover:text-purple-800 text-sm font-medium mt-3 flex items-center">
            {expanded ? 'Show less' : 'Show details'}
            <span className="ml-1">{expanded ? '↑' : '↓'}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function AgePrompt({ onSave, onClose, isLoggedIn, defaultAge }: { 
  onSave: (profile: { age: number; skinType?: string; hairType?: string }) => void; 
  onClose: () => void;
  isLoggedIn: boolean;
  defaultAge?: number;
}) {
  const [age, setAge] = useState(defaultAge?.toString() || '');
  const [skinType, setSkinType] = useState('');
  const [hairType, setHairType] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold text-center mb-4 text-purple-600">
          {isLoggedIn ? '✨ Update Your Profile' : '✨ Tell Us About Yourself'}
        </h3>
        <p className="text-gray-600 text-center mb-6">
          {isLoggedIn 
            ? 'Update your details for more accurate recommendations.'
            : 'This helps us provide personalized beauty recommendations.'}
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Age *</label>
            <input 
              type="number" 
              value={age} 
              onChange={(e) => setAge(e.target.value)} 
              placeholder="Enter your age"
              className="w-full p-4 border-2 border-purple-200 rounded-2xl text-center text-lg font-bold focus:border-purple-500 outline-none transition-colors"
              min="13" 
              max="100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Skin Type (Optional)</label>
            <select 
              value={skinType}
              onChange={(e) => setSkinType(e.target.value)}
              className="w-full p-4 border-2 border-purple-200 rounded-2xl text-gray-700 focus:border-purple-500 outline-none transition-colors"
            >
              <option value="">Select skin type</option>
              <option value="oily">Oily</option>
              <option value="dry">Dry</option>
              <option value="combination">Combination</option>
              <option value="normal">Normal</option>
              <option value="sensitive">Sensitive</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hair Type (Optional)</label>
            <select 
              value={hairType}
              onChange={(e) => setHairType(e.target.value)}
              className="w-full p-4 border-2 border-purple-200 rounded-2xl text-gray-700 focus:border-purple-500 outline-none transition-colors"
            >
              <option value="">Select hair type</option>
              <option value="straight">Straight</option>
              <option value="wavy">Wavy</option>
              <option value="curly">Curly</option>
              <option value="coily">Coily</option>
              <option value="thin">Thin/Fine</option>
              <option value="thick">Thick</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
          <p className="text-xs text-yellow-700 flex items-start">
            <FiInfo className="mr-2 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Note:</strong> Age is required for analysis. Skin/hair types are optional but improve accuracy. 
              {!isLoggedIn && ' You can log in to save your profile for future use.'}
            </span>
          </p>
        </div>
        
        <div className="flex space-x-3 mt-6">
          <button 
            onClick={onClose} 
            className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-2xl font-bold hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => age && onSave({
              age: parseInt(age),
              skinType: skinType || undefined,
              hairType: hairType || undefined
            })} 
            disabled={!age}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-2xl font-bold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save & Continue
          </button>
        </div>
      </div>
    </div>
  );
}

function DisclaimerModal({ onAccept, onClose }: { onAccept: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-xl font-bold text-purple-600 mb-2">Privacy & Disclaimer</h3>
          <p className="text-gray-600">Important information before you begin</p>
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-start">
            <FiInfo className="text-blue-500 mr-3 mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-800">Your photos are not stored</p>
              <p className="text-sm text-gray-600">We process your photo in real-time and do not save it to our servers.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <FiInfo className="text-yellow-500 mr-3 mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-800">AI-generated recommendations</p>
              <p className="text-sm text-gray-600">Results are AI-powered and may not be 100% accurate. They are for guidance only.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <FiInfo className="text-green-500 mr-3 mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-800">Better with login</p>
              <p className="text-sm text-gray-600">Log in to save your profile and get more accurate, personalized results.</p>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button 
            onClick={onClose} 
            className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-2xl font-bold hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onAccept}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-2xl font-bold hover:shadow-xl transition-all"
          >
            I Understand, Continue
          </button>
        </div>
      </div>
    </div>
  );
}