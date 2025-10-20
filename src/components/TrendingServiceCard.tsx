// app/components/TrendingServiceCard.tsx
"use client";

import { motion } from 'framer-motion';
import { FiClock } from 'react-icons/fi';
import { Service } from '../../types/service';

interface TrendingServiceCardProps {
  service: Service;
  onAddToCart: () => void;
  onViewDetails: () => void;
  
}

const TrendingServiceCard = ({ 
  service, 
  onAddToCart, 
  onViewDetails 
}: TrendingServiceCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">{service.title}</h3>
          <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
            🔥 Trending
          </div>
        </div>
        
        <p className="text-pink-100 mb-4 text-sm">{service.deal}</p>
        
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-2xl font-bold">₹{service.price}</span>
            <span className="text-pink-200 line-through ml-2 text-sm">₹{service.originalPrice}</span>
          </div>
          <div className="text-right text-sm">
            <div className="flex items-center">
              <FiClock className="w-4 h-4 mr-1" />
              {service.duration} mins
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={onAddToCart}
            className="flex-1 bg-white text-pink-600 py-2 px-4 rounded-full font-medium hover:bg-pink-50 transition-colors text-sm"
          >
            Add to Cart
          </button>
          <button
            onClick={onViewDetails}
            className="px-4 py-2 border border-white/30 text-white rounded-full font-medium hover:bg-white/10 transition-colors text-sm"
          >
            View
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TrendingServiceCard;