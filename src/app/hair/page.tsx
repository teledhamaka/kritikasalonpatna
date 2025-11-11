// app/hair/page.tsx (SERVER COMPONENT)
import { Metadata } from 'next';
import ClientHairPage from './ClientHairPage';
import { Service } from '../../types/service';

// Import JSON data directly on the server
import hairServices from '../../../public/hair_services.json';

export const metadata: Metadata = {
  title: "Hair Care & Styling - Kritika Ladies Beauty Parlour",
  description: "Transform your hair with our specialist Hair Care experts. Flawless styling, timeless elegance.",
  openGraph: {
    title: "Hair Care & Styling - Kritika Ladies Beauty Parlour",
    description: "Flawless styling, timeless elegance. Transform your hair with our specialist Hair Care experts.",
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
    return hairServices.map(transformServiceForComponent);
  } catch (error) {
    console.error('Error loading hair services:', error);
    return [];
  }
};

const getTrendingServices = (allServices: Service[]): Service[] => {
  try {
    const trendingServices = allServices.filter(service => service.isTrending === true);
    
    // Static trending data - no random values
    const enhancedTrendingServices = trendingServices.map(service => ({
      ...service,
      isViral: service.category?.includes('Hair Spa') || service.category?.includes('Keratin'),
      trendingScore: 85,
      socialProof: {
        shares: 450,
        likes: 1800,
        saves: 220
      }
    }));

    return enhancedTrendingServices;
  } catch (error) {
    console.error('Error fetching trending hair services:', error);
    return [];
  }
};

export default function HairPage() {
  // Fetch data on the server
  const allServices = getAllServices();
  const trendingServices = getTrendingServices(allServices);

  return (
    <ClientHairPage 
      allServices={allServices}
      trendingServices={trendingServices}
    />
  );
}