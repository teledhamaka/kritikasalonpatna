// kritika/src/app/page.tsx
import { Metadata } from 'next';
import ClientHomePage from './ClientHomePage'; // We will create this next
import { Service } from '../types/service'; // Make sure this path is correct

// Import JSON data directly on the server
import hairServices from '../../public/hair_services.json';
import makeupServices from '../../public/makeup_services.json';
import nailServices from '../../public/nail_services.json';
import skinServices from '../../public/skin_services.json';

// Adds the missing <meta description> for SEO
export const metadata: Metadata = {
  title: "Kritika Ladies Beauty Parlour - Patna's Premier Destination",
  description: "Transform your definition with our specialist Cosmetologist. Explore a wide range of hair, skin, nail, and makeup services in Patna.",
  openGraph: {
    title: "Kritika Ladies Beauty Parlour",
    description: "Patna's Premier Ladies Beauty Destination.",
    // Add a URL to your main logo or hero image here for social sharing
    // images: ['/images/og-image.jpg'], 
  },
};

// This data-fetching logic now runs ON THE SERVER, not in the browser.
const getAllServices = (): Service[] => {
  try {
    return [
      ...hairServices,
      ...makeupServices,
      ...nailServices,
      ...skinServices
    ] as Service[];
  } catch (error) {
    console.error('Error loading services:', error);
    return [];
  }
};

const getTrendingServices = (allServices: Service[]): Service[] => {
  try {
    const trendingServices = allServices.filter(service => service.isTrending === true);
    
    // This logic now runs once on the server, not on every client's machine
    const enhancedTrendingServices = trendingServices.map(service => ({
      ...service,
      isViral: Math.random() > 0.7, // Note: This will be static until the next server build
      trendingScore: Math.floor(Math.random() * 100) + 50,
      socialProof: {
        shares: Math.floor(Math.random() * 1000) + 100,
        likes: Math.floor(Math.random() * 5000) + 1000,
        saves: Math.floor(Math.random() * 500) + 50
      }
    }));

    return enhancedTrendingServices;
  } catch (error) {
    console.error('Error fetching trending services:', error);
    return [];
  }
};

// This is the default Server Component for the '/' route
export default function HomePage() {
  // Fetch data on the server
  const allServices = getAllServices();
  const trendingServices = getTrendingServices(allServices);

  // Pass the data as props to the Client Component
  return (
    <ClientHomePage 
      allServices={allServices} 
      trendingServices={trendingServices} 
    />
  );
}