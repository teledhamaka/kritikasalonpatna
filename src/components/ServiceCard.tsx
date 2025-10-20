// app/components/ServiceCard.tsx
"use client";

import { motion } from 'framer-motion';
import { FiHeart, FiClock, FiCheck } from 'react-icons/fi';
import { Service } from '../../types/service';

interface ServiceCardProps {
  service: Service;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onAddToCart: () => void;
  onViewDetails: () => void;
}

const ServiceCard = ({ 
  service, 
  isFavorite, 
  onToggleFavorite, 
  onAddToCart, 
  onViewDetails 
}: ServiceCardProps) => {
  // Calculate discount percentage safely
  const discountPercentage = service.originalPrice && service.originalPrice > service.price
    ? Math.round(((service.originalPrice - service.price) / service.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="flex-shrink-0 w-72 bg-white rounded-2xl shadow-lg overflow-hidden border border-pink-100"
    >
      <div className="relative">
        <img
          src={service.image}
          alt={service.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 right-3 flex space-x-2">
          <button
            onClick={onToggleFavorite}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
              isFavorite 
                ? 'bg-pink-500 text-white' 
                : 'bg-white/80 text-gray-600 hover:bg-pink-100'
            }`}
          >
            <FiHeart className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          {discountPercentage > 0 && (
            <div className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              {discountPercentage}% OFF
            </div>
          )}
        </div>
        <div className="absolute bottom-3 left-3">
          <div className="bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm flex items-center">
            <FiClock className="w-3 h-3 mr-1" />
            {service.duration} mins
          </div>
        </div>
        {service.isTrending && (
          <div className="absolute top-3 left-3">
            <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
              🔥 HOT DEAL
            </div>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-lg text-gray-800 leading-tight">{service.title}</h3>
          <div className="text-right">
            {service.originalPrice && service.originalPrice > service.price && (
              <p className="text-gray-400 line-through text-sm">₹{service.originalPrice}</p>
            )}
            <p className="text-pink-600 font-bold text-lg">₹{service.price}</p>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{service.description}</p>

        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1">Popular benefit:</p>
          <p className="text-sm text-gray-700">• {service.benefits[0]}</p>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={onAddToCart}
            className="flex-1 bg-pink-600 text-white py-2 px-4 rounded-full font-medium hover:bg-pink-700 transition-colors text-sm"
          >
            Add to Cart
          </button>
          <button
            onClick={onViewDetails}
            className="px-4 py-2 border border-pink-600 text-pink-600 rounded-full font-medium hover:bg-pink-50 transition-colors text-sm"
          >
            Details
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ServiceCard;