// components/TestimonialCard.tsx - ALTERNATIVE VERSION
"use client";

import { Star, Quote, Calendar, MapPin } from 'lucide-react';

interface TestimonialCardProps {
  name: string;
  text: string;
  image: string;
  rating?: number;
  service?: string;
}

const TestimonialCard = ({ 
  name, 
  text, 
  image, 
  rating = 5,
  service = "Makeup Service"
}: TestimonialCardProps) => {
  return (
    <div className="
      group
      bg-white 
      rounded-2xl 
      shadow-lg 
      p-6 
      min-w-[300px] 
      max-w-[340px]
      flex 
      flex-col 
      border 
      border-pink-100
      hover:shadow-2xl 
      hover:border-pink-300
      transition-all 
      duration-300
      relative
      overflow-hidden
    ">
      {/* Background Pattern */}
      <div className="
        absolute 
        -right-6 
        -top-6 
        w-24 
        h-24 
        bg-pink-100 
        rounded-full 
        opacity-50 
        group-hover:opacity-70 
        transition-opacity
      "></div>
      
      {/* Quote Icon */}
      <div className="mb-4 relative z-10">
        <Quote className="w-8 h-8 text-pink-500" fill="currentColor" />
      </div>
      
      {/* Testimonial Text */}
      <p className="
        text-gray-700 
        mb-6 
        line-clamp-4 
        flex-grow
        text-sm
        leading-relaxed
        relative
        z-10
      ">
        "{text}"
      </p>
      
      {/* Customer Info */}
      <div className="flex items-start gap-4 relative z-10">
        {/* Image with background */}
        <div 
          className="
            w-16 
            h-16 
            rounded-full 
            border-2 
            border-pink-300
            flex-shrink-0
            overflow-hidden
            bg-cover
            bg-center
          "
          style={{ 
            backgroundImage: `url(${image})`,
            width: '64px',
            height: '64px'
          }}
          role="img"
          aria-label={`Photo of ${name}`}
        />
        
        <div className="flex-1 min-w-0">
          {/* Customer Name & Rating */}
          <div className="flex items-center justify-between">
            <h4 className="
              font-bold 
              text-gray-800 
              truncate
              text-base
            ">
              {name}
            </h4>
            
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`
                    w-3 h-3
                    ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                  `}
                />
              ))}
            </div>
          </div>
          
          {/* Service Info */}
          <p className="text-xs text-gray-500 mt-1">
            Received: {service}
          </p>
          
          {/* Location & Date */}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <div className="flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              <span>Patna</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              <span>Nov 2024</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="
        absolute 
        bottom-0 
        left-0 
        right-0 
        h-1 
        bg-gradient-to-r 
        from-pink-400 
        to-rose-400
        opacity-0 
        group-hover:opacity-100 
        transition-opacity
      "></div>
      
      {/* Service Tag */}
      <div className="
        mt-4 
        pt-4 
        border-t 
        border-pink-100 
        text-xs 
        text-gray-500 
        flex 
        items-center 
        justify-between
        relative
        z-10
      ">
        <span className="
          inline-flex 
          items-center 
          bg-pink-50 
          text-pink-700 
          px-2 
          py-1 
          rounded-full
          font-medium
        ">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
          Verified Review
        </span>
        
        <button 
          className="
            text-pink-600 
            hover:text-pink-800 
            font-medium
            flex 
            items-center
            text-xs
          "
          aria-label="Read full review"
        >
          Read full
          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TestimonialCard;