// app/components/ServicesSection.tsx - SERVER COMPONENT
import { Service } from '../types/service';
import ServiceCard from './ServiceCard';
import ServiceCardSimple from './ServiceCard';

interface ServicesSectionProps {
  services: Service[];
  title?: string;
  limit?: number;
}

const ServicesSection = async ({ 
  services, 
  title = "Trending Services",
  limit = 8 
}: ServicesSectionProps) => {
  const displayedServices = services.slice(0, limit);
  
  return (
    <section className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <a 
          href="/services" 
          className="text-pink-600 hover:text-pink-700 font-medium text-sm"
        >
          View all →
        </a>
      </div>
      
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayedServices.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div> */}
    </section>
  );
};

export default ServicesSection;