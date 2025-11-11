// app/makeup/page.tsx (SERVER COMPONENT)
import { Metadata } from 'next';
import ClientMakeupPage from './ClientMakeupPage';
import { Service } from '../../types/service';

// Import JSON data directly on the server
import makeupServices from '../../../public/makeup_services.json';

export const metadata: Metadata = {
  title: "Makeup Magic - Kritika Ladies Beauty Parlour",
  description: "Transform your look with our specialist Makeup artists. Flawless canvas, timeless elegance.",
  openGraph: {
    title: "Makeup Magic - Kritika Ladies Beauty Parlour",
    description: "Flawless canvas, timeless elegance. Transform your look with our specialist Makeup artists.",
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
    return makeupServices.map(transformServiceForComponent);
  } catch (error) {
    console.error('Error loading makeup services:', error);
    return [];
  }
};

const getTrendingServices = (allServices: Service[]): Service[] => {
  try {
    const trendingServices = allServices.filter(service => service.isTrending === true);
    
    // Static trending data - no random values
    const enhancedTrendingServices = trendingServices.map(service => ({
      ...service,
      isViral: service.category?.includes('Bridal') || service.category?.includes('Party'),
      trendingScore: 80,
      socialProof: {
        shares: 400,
        likes: 1500,
        saves: 200
      }
    }));

    return enhancedTrendingServices;
  } catch (error) {
    console.error('Error fetching trending makeup services:', error);
    return [];
  }
};

export default function MakeupPage() {
  // Fetch data on the server
  const allServices = getAllServices();
  const trendingServices = getTrendingServices(allServices);

  return (
    <ClientMakeupPage 
      allServices={allServices}
      trendingServices={trendingServices}
    />
  );
}