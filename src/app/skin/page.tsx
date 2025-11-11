// app/skin/page.tsx (SERVER COMPONENT)
import { Metadata } from 'next';
import ClientSkinPage from './ClientSkinPage';
import { Service } from '../../types/service';

// Import JSON data directly on the server
import skinServices from '../../../public/skin_services.json';

export const metadata: Metadata = {
  title: "Skin & Body Care - Kritika Ladies Beauty Parlour",
  description: "Transform your skin with our specialist Skin Care experts. Flawless canvas, timeless elegance.",
  openGraph: {
    title: "Skin & Body Care - Kritika Ladies Beauty Parlour",
    description: "Flawless canvas, timeless elegance. Transform your skin with our specialist Skin Care experts.",
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
    return skinServices.map(transformServiceForComponent);
  } catch (error) {
    console.error('Error loading skin services:', error);
    return [];
  }
};

const getTrendingServices = (allServices: Service[]): Service[] => {
  try {
    const trendingServices = allServices.filter(service => service.isTrending === true);
    
    // Static trending data - no random values that cause hydration issues
    const enhancedTrendingServices = trendingServices.map(service => ({
      ...service,
      isViral: service.category?.includes('Facial') || service.category?.includes('Treatment'), // Fixed logic instead of random
      trendingScore: 75, // Fixed score for consistency
      socialProof: {
        shares: 350,
        likes: 1200,
        saves: 150
      }
    }));

    return enhancedTrendingServices;
  } catch (error) {
    console.error('Error fetching trending skin services:', error);
    return [];
  }
};

export default function SkinPage() {
  // Fetch data on the server
  const allServices = getAllServices();
  const trendingServices = getTrendingServices(allServices);

  return (
    <ClientSkinPage 
      allServices={allServices}
      trendingServices={trendingServices}
    />
  );
}