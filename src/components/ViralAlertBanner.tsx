// components/ViralAlertBanner.tsx
import { motion } from 'framer-motion';
import { FiZap } from 'react-icons/fi';

interface ViralAlertBannerProps {
  serviceType: string;
}

export const ViralAlertBanner = ({ serviceType }: ViralAlertBannerProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-linear-to-r from-rose-500 to-pink-600 text-white py-3 px-4 text-center"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2">
        <FiZap className="animate-pulse" />
        <span className="font-semibold text-sm md:text-base">TRENDING ALERT:</span>
        <span className="text-sm md:text-base">
          These {serviceType.toLowerCase()} services are going viral! Book now before they sell out! 🚀
        </span>
      </div>
    </motion.div>
  );
};