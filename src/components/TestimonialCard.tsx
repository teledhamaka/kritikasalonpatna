// kritika/src/components/TestimonialCard.tsx
import Image from 'next/image';

interface TestimonialCardProps {
  name: string;
  text: string;
  image: string;
}

const TestimonialCard = ({ name, text, image }: TestimonialCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-lg w-72 shrink-0 overflow-hidden border border-pink-100">
      <div className="p-4">
        <div className="flex items-center mb-3">
          {/* FIX: Using next/image for optimization and correct paths */}
          <Image 
            className="w-10 h-10 rounded-full object-cover mr-3" 
            src={image} 
            alt={name}
            width={40}
            height={40}
            loading="lazy"
          />
          <div>
            <p className="font-bold text-purple-800 text-sm">{name}</p>
            <div className="flex text-yellow-400 text-sm">{'⭐'.repeat(5)}</div>
          </div>
        </div>
        <p className="text-gray-700 text-xs leading-relaxed">&quot;{text}</p>
      </div>
    </div>
  );
};

export default TestimonialCard;