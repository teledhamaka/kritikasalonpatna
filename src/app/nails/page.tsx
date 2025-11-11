// app/nail/page.tsx (SERVER COMPONENT)
import { Metadata } from 'next';
import ClientNailPage from './ClientNailPage';
import { Service } from '../../types/service';

// Import JSON data directly on the server
import nailServices from '../../../public/nail_services.json';

export const metadata: Metadata = {
  title: "Manicure & Pedicure - Kritika Ladies Beauty Parlour",
  description: "Transform your nails with our specialist Nail Care experts. Flawless canvas, timeless elegance.",
  openGraph: {
    title: "Manicure & Pedicure - Kritika Ladies Beauty Parlour",
    description: "Flawless canvas, timeless elegance. Transform your nails with our specialist Nail Care experts.",
  },
};

// Transform JSON service to match component interface
const transformServiceForComponent = (service: any): Service => ({
  id: service.id,
  name: service.title,
  title: service.title,
  category: service.category,
  imageUrl: service.image,
  image: service.image,
  description: service.description,
  price: service.price,
  base_price: service.price,
  originalPrice: service.originalPrice,
  isTrending: service.isTrending,
  duration: service.duration,
  duration_minutes: service.duration,
  keyIngredients: service.keyIngredients,
  benefits: service.benefits,
  precautions: service.precautions,
  aftercare: service.aftercare,
  faqs: service.faqs,
  link: '/services/' + service.id,
  deal: service.deal || ''
});

// Server-side data fetching
const getAllServices = (): Service[] => {
  try {
    return nailServices.map(transformServiceForComponent);
  } catch (error) {
    console.error('Error loading nail services:', error);
    return [];
  }
};

const getTrendingServices = (allServices: Service[]): Service[] => {
  try {
    const trendingServices = allServices.filter(service => service.isTrending === true);
    
    // Static trending data - no random values
    const enhancedTrendingServices = trendingServices.map(service => ({
      ...service,
      isViral: service.category?.includes('Nail Art') || service.category?.includes('Gel'),
      trendingScore: 70,
      socialProof: {
        shares: 300,
        likes: 1200,
        saves: 180
      }
    }));

    return enhancedTrendingServices;
  } catch (error) {
    console.error('Error fetching trending nail services:', error);
    return [];
  }
};

export default function NailPage() {
  // Fetch data on the server
  const allServices = getAllServices();
  const trendingServices = getTrendingServices(allServices);

  return (
    <ClientNailPage 
      allServices={allServices}
      trendingServices={trendingServices}
    />
  );
}