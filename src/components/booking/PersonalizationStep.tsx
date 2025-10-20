// app/components/booking/PersonalizationStep.tsx
"use client";

import { useState } from 'react';
import { FiMusic, FiSun, FiMessageCircle, FiHeart } from 'react-icons/fi';
import { useBooking } from '../../context/BookingContext';

interface PersonalizationStepProps {
  onNext: () => void;
  onBack: () => void;
}

const PersonalizationStep = ({ onNext, onBack }: PersonalizationStepProps) => {
  const { personalization, setPersonalization } = useBooking();

  const musicOptions = [
    { id: 'pop', label: 'Pop & Charts', emoji: '🎵' },
    { id: 'chill', label: 'Chill Vibes', emoji: '🌊' },
    { id: 'bollywood', label: 'Bollywood', emoji: '🎬' },
    { id: 'classical', label: 'Classical', emoji: '🎻' },
    { id: 'none', label: 'No Music', emoji: '🔇' }
  ];

  const lightingOptions = [
    { id: 'bright', label: 'Bright', emoji: '💡', desc: 'Well-lit for precision' },
    { id: 'soft', label: 'Soft', emoji: '✨', desc: 'Gentle ambient lighting' },
    { id: 'dim', label: 'Dim', emoji: '🕯️', desc: 'Relaxing atmosphere' },
    { id: 'natural', label: 'Natural', emoji: '☀️', desc: 'Daylight preferred' }
  ];

  const conversationOptions = [
    { id: 'chatty', label: 'Chatty', emoji: '💬', desc: 'Love to chat and connect' },
    { id: 'balanced', label: 'Balanced', emoji: '⚖️', desc: 'Mix of chat and quiet' },
    { id: 'quiet', label: 'Quiet', emoji: '🤫', desc: 'Prefer peaceful service' },
    { id: 'focused', label: 'Focused', emoji: '🎯', desc: 'All about the results' }
  ];

  const trendingStyles = [
    { id: 'glass-skin', name: 'Glass Skin', image: '/api/placeholder/80/80', popular: true },
    { id: 'clean-girl', name: 'Clean Girl', image: '/api/placeholder/80/80', viral: true },
    { id: 'dolphin-skin', name: 'Dolphin Skin', image: '/api/placeholder/80/80', trending: true },
    { id: 'strobing', name: 'Strobing', image: '/api/placeholder/80/80' }
  ];

  // Helper function to safely update personalization
  const updatePersonalization = (updates: Partial<typeof personalization>) => {
    setPersonalization({
      ...personalization,
      ...updates
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Personalize Your Experience</h2>
      <p className="text-gray-600 mb-6">Make this appointment uniquely yours! ✨</p>

      {/* Trending Styles Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Trending Styles</h3>
          <span className="text-sm text-pink-600">See what's viral</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {trendingStyles.map(style => (
            <div
              key={style.id}
              className={`border-2 rounded-xl p-3 text-center cursor-pointer transition-all ${
                personalization?.preferred_style === style.id
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-gray-200 hover:border-pink-300'
              }`}
              onClick={() => updatePersonalization({ preferred_style: style.id })}
            >
              <img src={style.image} alt={style.name} className="w-12 h-12 rounded-lg object-cover mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-800">{style.name}</p>
              <div className="flex justify-center space-x-1 mt-1">
                {style.popular && <span className="bg-red-100 text-red-800 text-xs px-1 rounded">Popular</span>}
                {style.viral && <span className="bg-purple-100 text-purple-800 text-xs px-1 rounded">Viral</span>}
                {style.trending && <span className="bg-blue-100 text-blue-800 text-xs px-1 rounded">Trending</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Music Preference */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <FiMusic className="text-pink-500 mr-2" />
          <h3 className="font-semibold text-gray-800">Music Preference</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {musicOptions.map(option => (
            <button
              key={option.id}
              onClick={() => updatePersonalization({ preferred_music: option.id })}
              className={`p-3 rounded-lg border-2 text-center transition-all ${
                personalization?.preferred_music === option.id
                  ? 'border-pink-500 bg-pink-50 text-pink-700'
                  : 'border-gray-200 text-gray-700 hover:border-pink-300'
              }`}
            >
              <span className="text-lg block mb-1">{option.emoji}</span>
              <span className="text-xs font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lighting Preference */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <FiSun className="text-pink-500 mr-2" />
          <h3 className="font-semibold text-gray-800">Lighting Atmosphere</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {lightingOptions.map(option => (
            <div
              key={option.id}
              onClick={() => updatePersonalization({ lighting_preference: option.id })}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                personalization?.lighting_preference === option.id
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-gray-200 hover:border-pink-300'
              }`}
            >
              <div className="flex items-center mb-2">
                <span className="text-xl mr-2">{option.emoji}</span>
                <span className="font-medium text-gray-800">{option.label}</span>
              </div>
              <p className="text-xs text-gray-600">{option.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Conversation Style */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <FiMessageCircle className="text-pink-500 mr-2" />
          <h3 className="font-semibold text-gray-800">Conversation Style</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {conversationOptions.map(option => (
            <div
              key={option.id}
              onClick={() => updatePersonalization({ conversation_style: option.id })}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                personalization?.conversation_style === option.id
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-gray-200 hover:border-pink-300'
              }`}
            >
              <div className="flex items-center mb-2">
                <span className="text-xl mr-2">{option.emoji}</span>
                <span className="font-medium text-gray-800">{option.label}</span>
              </div>
              <p className="text-xs text-gray-600">{option.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Special Instructions */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Special Instructions (Optional)
        </label>
        <textarea
          value={personalization?.special_instructions || ''}
          onChange={(e) => updatePersonalization({ special_instructions: e.target.value })}
          placeholder="Any allergies, sensitivities, or specific requests? Let us know how we can make this perfect for you! 💕"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 resize-none"
          rows={3}
        />
      </div>

      <div className="flex justify-between">
        <button 
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button 
          onClick={onNext}
          className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:shadow-lg transition-all duration-300 flex items-center"
        >
          Continue to Payment
          <FiHeart className="ml-2" />
        </button>
      </div>
    </div>
  );
};

export default PersonalizationStep;