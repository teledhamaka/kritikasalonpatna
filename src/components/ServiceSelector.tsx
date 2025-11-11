// src/app/ai-beauty-scan/ServiceSelector.tsx
'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';

// Use mock data with proper image URLs
const mockServices = {
  makeup: [
    { id: '1', title: 'Natural Makeup', category: 'makeup', image: 'https://images.unsplash.com/photo-1512496015857-a6edfb6d3f3?w=300&h=200&fit=crop' },
    { id: '2', title: 'Evening Glam', category: 'makeup', image: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=300&h=200&fit=crop' },
    { id: '3', title: 'Bold Lips', category: 'makeup', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&h=200&fit=crop' },
    { id: '4', title: 'Smoky Eyes', category: 'makeup', image: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e33b?w=300&h=200&fit=crop' },
  ],
  hair: [
    { id: '5', title: 'Blonde Highlights', category: 'hair', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300&h=200&fit=crop' },
    { id: '6', title: 'Brunette Glow', category: 'hair', image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=300&h=200&fit=crop' },
  ],
  skin: [
    { id: '7', title: 'Smooth Skin', category: 'skin', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=300&h=200&fit=crop' },
    { id: '8', title: 'Glowing Complexion', category: 'skin', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=300&h=200&fit=crop' },
  ],
};

interface Service {
  id: string;
  title: string;
  category: string;
  image: string;
}

interface ServiceSelectorProps {
  onServiceSelect: (service: Service) => void;
  isImageUploaded: boolean;
}

export default function ServiceSelector({ onServiceSelect, isImageUploaded }: ServiceSelectorProps) {
  const [services, setServices] = useState<{ makeup: Service[], skin: Service[], hair: Service[] } | null>(null);
  const [activeTab, setActiveTab] = useState<'makeup' | 'skin' | 'hair'>('makeup');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setServices(mockServices);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const renderServiceGrid = (serviceList: Service[]) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {serviceList.map((service) => (
        <div
          key={service.id}
          onClick={() => isImageUploaded && onServiceSelect(service)}
          className={`relative rounded-lg overflow-hidden cursor-pointer group transition-all duration-300 ${
            !isImageUploaded ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-xl'
          }`}
        >
          <Image 
            src={service.image} 
            alt={service.title} 
            className="w-full h-32 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://via.placeholder.com/300x200/FF69B4/FFFFFF?text=${encodeURIComponent(service.title)}`;
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end p-2">
            <p className="text-white text-xs font-bold">{service.title}</p>
          </div>
          {isImageUploaded && (
            <div className="absolute inset-0 bg-pink-500 bg-opacity-0 group-hover:bg-opacity-70 flex items-center justify-center transition-all duration-300">
              <p className="text-white font-bold opacity-0 group-hover:opacity-100 text-sm">Apply {service.title}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  if (loading) return <div className="text-center p-10">Loading services...</div>;

  return (
    <div className={`w-full p-4 bg-white rounded-2xl shadow-lg transition-opacity duration-500 relative ${
      !isImageUploaded ? 'opacity-60' : ''
    }`}>
      {!isImageUploaded && (
        <div className="absolute inset-0 bg-white bg-opacity-80 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
          <p className="font-semibold text-gray-600 text-lg">Upload an image to begin</p>
        </div>
      )}
      
      <div className="flex border-b border-gray-200 mb-4">
        <button 
          onClick={() => setActiveTab('makeup')} 
          className={`px-4 py-2 font-semibold ${
            activeTab === 'makeup' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-500'
          }`}
        >
          Makeup
        </button>
        <button 
          onClick={() => setActiveTab('hair')} 
          className={`px-4 py-2 font-semibold ${
            activeTab === 'hair' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-500'
          }`}
        >
          Hair
        </button>
        <button 
          onClick={() => setActiveTab('skin')} 
          className={`px-4 py-2 font-semibold ${
            activeTab === 'skin' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-500'
          }`}
        >
          Skin
        </button>
      </div>
      <div className="max-h-[60vh] overflow-y-auto pr-2">
        {activeTab === 'makeup' && renderServiceGrid(services?.makeup || [])}
        {activeTab === 'hair' && renderServiceGrid(services?.hair || [])}
        {activeTab === 'skin' && renderServiceGrid(services?.skin || [])}
      </div>
    </div>
  );
}