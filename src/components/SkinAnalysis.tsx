// app/components/SkinAnalysis.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiUpload, FiCamera, FiCheck, FiUser, FiX, FiShare2, FiRefreshCw, FiSun, FiWind, FiSmile, FiMeh } from 'react-icons/fi';
import { supabase } from '../lib/supabase';
import Image from 'next/image';

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
}

export default function SkinAnalysis({ onClose }: { onClose: () => void }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SkinFeature[]>([]);
  const [analysisStatus, setAnalysisStatus] = useState('Upload your selfie for analysis');
  const [skinTone, setSkinTone] = useState('');
  const [skinTexture, setSkinTexture] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showAgePrompt, setShowAgePrompt] = useState(false);

  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setShowAgePrompt(true);
        return;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('age, name')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No profile found, so we ask for age
          setShowAgePrompt(true);
        } else {
          throw error;
        }
      } else if (data) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setShowAgePrompt(true); // Fallback to asking for age
    }
  };

  const saveUserAge = async (age: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_profiles')
        .upsert({ user_id: user.id, age: age, updated_at: new Date().toISOString() });

      if (error) throw error;
      
      setUserProfile(prev => prev ? { ...prev, age } : { age, name: '' });
      setShowAgePrompt(false);
      
      // If an image was already selected, trigger analysis now that we have age
      if (selectedImage) {
        analyzeSkin(age);
      }
    } catch (error) {
      console.error('Error saving age:', error);
    }
  };

  const openGallery = () => {
    galleryInputRef.current?.click();
  };

  const openCamera = () => {
    const cameraInput = document.createElement('input');
    cameraInput.type = 'file';
    cameraInput.accept = 'image/*';
    cameraInput.capture = 'user'; // This forces the front-facing camera for selfies
    cameraInput.onchange = (e) => handleImageSelect(e as any, 'camera');
    cameraInput.click();
  };
  
  const resetAnalysis = () => {
    setSelectedImage(null);
    setResults([]);
    setAnalysisStatus('Upload your selfie for analysis');
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>, source: 'gallery' | 'camera') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setAnalysisStatus(source === 'camera' ? '📸 Photo taken! Analyzing...' : '🖼️ Image selected! Analyzing...');
        analyzeSkin();
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeSkin = async (age = userProfile?.age) => {
    if (!selectedImage) return;
    if (!age) {
        setShowAgePrompt(true); // Prompt for age if not available
        return;
    }

    setIsLoading(true);
    setResults([]);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const skinTones = ['Porcelain Fair', 'Creamy Wheatish', 'Warm Medium', 'Rich Deep'];
      const skinTextures = ['Baby Smooth', 'Silky Normal', 'Combination', 'Textured'];
      
      const mockSkinTone = skinTones[Math.floor(Math.random() * skinTones.length)];
      const mockSkinTexture = skinTextures[Math.floor(Math.random() * skinTextures.length)];
      
      setSkinTone(mockSkinTone);
      setSkinTexture(mockSkinTexture);
      setAnalysisStatus(`✨ Analysis Complete!`);

      const ageGroup = determineAgeGroup(age);
      const { data, error } = await supabase
        .from('indian_skin_features')
        .select('*')
        .eq('age_group', ageGroup)
        .limit(6);

      if (error) throw error;

      const filteredResults = data?.filter(feature => 
        (!feature.skin_tone || feature.skin_tone.includes(mockSkinTone.split(' ')[1])) &&
        (!feature.skin_texture || feature.skin_texture.includes(mockSkinTexture))
      ) || [];

      setResults(filteredResults);
    } catch (error) {
      setAnalysisStatus('Analysis failed. Please try again.');
      console.error('Skin analysis error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const determineAgeGroup = (age: number): string => {
    if (age < 20) return 'teen';
    if (age <= 25) return 'early20s';
    if (age <= 30) return 'late20s';
    if (age <= 35) return 'early30s';
    if (age <= 40) return 'late30s';
    return '40plus';
  };

  const getAgeGroupDisplay = (age: number) => {
    if (age < 20) return 'Teen Glow';
    if (age <= 25) return 'Early 20s Radiance';
    if (age <= 30) return 'Late 20s Brilliance';
    if (age <= 35) return 'Early 30s Elegance';
    if (age <= 40) return 'Late 30s Sophistication';
    return 'Timeless Beauty 40+';
  };
  
  const getFeatureIcon = (featureName: string) => {
      const lowerFeature = featureName.toLowerCase();
      if (lowerFeature.includes('hydration') || lowerFeature.includes('moisture')) return <FiWind/>;
      if (lowerFeature.includes('glow') || lowerFeature.includes('radiance') || lowerFeature.includes('bright')) return <FiSun/>;
      if (lowerFeature.includes('acne') || lowerFeature.includes('blemishes')) return <FiMeh/>;
      if (lowerFeature.includes('aging') || lowerFeature.includes('wrinkles')) return <FiSmile/>;
      return <FiCheck/>;
  };

  if (showAgePrompt) {
    return <AgePrompt onSave={saveUserAge} onClose={onClose} />;
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-pink-100 via-purple-50 to-pink-200 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-pink-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">AI Skin Analysis ✨</h2>
          <button onClick={onClose} className="text-pink-500 hover:text-pink-700"><FiX size={24} /></button>
        </div>

        <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 mb-6 border border-pink-200">
          <h3 className="font-bold text-lg mb-4 text-center">Capture Your Natural Beauty</h3>
          
          <div className="text-center mb-6">
            {selectedImage ? (
              <div className="relative inline-block">
                <Image src={selectedImage} alt="Skin analysis" className="rounded-2xl max-h-64 shadow-lg" />
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">{analysisStatus}</div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-pink-300 rounded-2xl p-8 text-center bg-white">
                <div className="text-6xl mb-4">📸</div>
                <p className="text-gray-600 font-medium">Take a clear, makeup-free selfie</p>
                <p className="text-sm text-gray-500 mt-2">Good lighting gives the best results!</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={openCamera} className="flex items-center justify-center bg-gradient-to-r from-pink-500 to-pink-600 text-white py-4 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all"><FiCamera className="mr-3 text-lg" />Take Photo</motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={openGallery} className="flex items-center justify-center bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all"><FiUpload className="mr-3 text-lg" />Choose from Gallery</motion.button>
          </div>
          {selectedImage && <button onClick={resetAnalysis} className="w-full text-center mt-4 text-pink-600 font-semibold hover:text-pink-800 flex items-center justify-center"><FiRefreshCw className="mr-2"/> Start Over</button>}
          <input type="file" ref={galleryInputRef} onChange={(e) => handleImageSelect(e, 'gallery')} accept="image/*" className="hidden"/>
        </div>

        {userProfile && (
          <div className="bg-white rounded-2xl p-4 mb-6 border border-pink-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-pink-100 rounded-full p-2 mr-3"><FiUser className="text-pink-600" /></div>
                <div>
                  <p className="font-bold text-gray-800">{getAgeGroupDisplay(userProfile.age)}</p>
                  <p className="text-sm text-gray-600">{userProfile.age} years young</p>
                </div>
              </div>
              <button onClick={() => setShowAgePrompt(true)} className="text-pink-600 text-sm hover:text-pink-800">Edit age</button>
            </div>
          </div>
        )}

        <AnimatePresence>
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600 mx-auto mb-4"></div>
              <h4 className="text-lg font-bold text-pink-600 mb-2">Analyzing Your Skin...</h4>
              <p className="text-gray-600">Our AI is finding your personalized glow-up plan!</p>
            </motion.div>
          )}

          {results.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-pink-600 mb-2">Your Skin Analysis</h3>
                <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full px-4 py-1 inline-block text-sm font-medium">{skinTone} • {skinTexture}</div>
              </div>
              <div className="space-y-4">
                {results.map((result, index) => <SkinFeatureCard key={result.id} feature={result} index={index} icon={getFeatureIcon(result.feature)} />)}
              </div>
              <div className="text-center mt-6">
                <button className="text-pink-600 hover:text-pink-800 font-medium"><FiShare2 className="inline mr-2" />Share Analysis Results</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex space-x-3">
          <button onClick={onClose} className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-2xl font-bold hover:bg-gray-300 transition-colors">Back to Home</button>
          {results.length > 0 && <button className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all">Book Recommended Services</button>}
        </div>
      </div>
    </div>
  );
}

function AgePrompt({ onSave, onClose }: { onSave: (age: number) => void; onClose: () => void }) {
  const [age, setAge] = useState('');
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full">
        <h3 className="text-xl font-bold text-center mb-4">✨ Tell Us Your Age</h3>
        <p className="text-gray-600 text-center mb-6">This helps us provide personalized skin care advice.</p>
        <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Enter your age" className="w-full p-4 border-2 border-pink-200 rounded-2xl text-center text-lg font-bold focus:border-pink-500 outline-none" min="13" max="100"/>
        <div className="flex space-x-3 mt-6">
          <button onClick={onClose} className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-2xl font-bold">Cancel</button>
          <button onClick={() => age && onSave(parseInt(age))} disabled={!age} className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-2xl font-bold disabled:opacity-50">Save & Continue</button>
        </div>
      </div>
    </div>
  );
}

function SkinFeatureCard({ feature, index, icon }: { feature: any; index: number, icon: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="bg-white border-2 border-pink-100 rounded-2xl p-4 hover:border-pink-300 transition-colors">
      <div className="flex items-start">
        <div className="bg-gradient-to-br from-pink-400 to-purple-500 text-white rounded-2xl p-3 mr-4 text-lg">{icon}</div>
        <div className="flex-1">
          <h4 className="font-bold text-gray-800 text-lg mb-2">{feature.feature}</h4>
          <p className="text-gray-600 mb-3">{feature.description}</p>
          {feature.recommendations && feature.recommendations.length > 0 && (
            <div>
              <p className="font-semibold text-pink-600 mb-2">💫 Our Advice:</p>
              <ul className="space-y-1">
                {feature.recommendations.map((rec: string, i: number) => (
                  <li key={i} className="flex items-center text-sm text-gray-700"><span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}