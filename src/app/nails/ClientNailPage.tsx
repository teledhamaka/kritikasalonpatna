// app/nail/ClientNailPage.tsx - SEO OPTIMIZED VERSION
"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { MapPin, Sparkles, Zap, Phone, Clock, Star, Award, Scissors, Heart } from 'lucide-react';

import { Service } from '../../types/service';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import ServiceSkeleton from '../../components/ServiceSkeleton';

// Import SEO data
import seoData from '../../../public/seo.json';

// Lazy load components
const ServiceCard = dynamic(() => import('../../components/ServiceCard'), {
  ssr: false,
  loading: () => <ServiceSkeleton />
});

const ServiceDetailModal = dynamic(() => import('../../components/ServiceDetailModal'), {
  ssr: false
});

const BeautyQuiz = dynamic(() => import('../../components/BeautyQuiz'), {
  ssr: false
});

const SkinAnalysis = dynamic(() => import('../../components/SkinAnalysis'), {
  ssr: false
});

const TestimonialCard = dynamic(() => import('../../components/TestimonialCard'), {
  ssr: false
});

const LoginModal = dynamic(() => import('../../components/LoginModal'), {
  ssr: false
});

const BookingFlow = dynamic(() => import('../../components/booking/BookingFlow'), {
  ssr: false
});

const MobileBottomNav = dynamic(() => import('../../components/MobileBottomNav'), {
  ssr: false
});

const FloatingCart = dynamic(() => import('../../components/FloatingCart'), {
  ssr: false
});

interface ClientNailPageProps {
  allServices: Service[];
  trendingServices: Service[];
}

const ClientNailPage = ({ allServices, trendingServices }: ClientNailPageProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showServiceDetail, setShowServiceDetail] = useState(false);
  const [showBeautyQuiz, setShowBeautyQuiz] = useState(false);
  const [showSkinAnalysis, setShowSkinAnalysis] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [bookingStep, setBookingStep] = useState<'browsing' | 'booking'>('browsing');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [currentServiceIndex, setCurrentServiceIndex] = useState<number>(0);
  const [visibleServiceIndices, setVisibleServiceIndices] = useState<Set<number>>(new Set([0]));

  const serviceScrollRef = useRef<HTMLDivElement>(null);
  const { isLoggedIn } = useAuth();
  const { addToCart } = useBooking();

  const serviceCategories = ['All', ...Array.from(new Set(allServices.map(service => service.category)))];

  const getFilteredServices = useCallback(() => {
    if (selectedCategory === 'All') return allServices;
    return allServices.filter(service => service.category === selectedCategory);
  }, [selectedCategory, allServices]);

  const filteredServices = getFilteredServices();

  const getCategoryImage = useCallback((category: string) => {
    if (category === 'All') return '/images/all-services.jpg';
    const firstService = allServices.find(s => s.category === category);
    return firstService?.image || '/images/placeholder.jpg';
  }, [allServices]);

  // Calculate nail service statistics
  const nailStats = {
    totalServices: allServices.length,
    totalBookings: allServices.reduce((sum, s) => sum + (s.bookingCount || 0), 0),
    totalReviews: allServices.reduce((sum, s) => sum + (s.reviewCount || 0), 0),
    avgRating: (allServices.reduce((sum, s) => sum + (s.rating || 0), 0) / allServices.length).toFixed(1)
  };

  useEffect(() => {
    setCurrentServiceIndex(0);
    setVisibleServiceIndices(new Set([0]));
  }, [selectedCategory]);

  const updateVisibleServices = useCallback(() => {
    if (!serviceScrollRef.current) return;

    const container = serviceScrollRef.current;
    const containerRect = container.getBoundingClientRect();
    const services = container.children;
    const newVisibleIndices = new Set<number>();

    for (let i = 0; i < services.length; i++) {
      const serviceRect = services[i].getBoundingClientRect();
      const isVisible = 
        serviceRect.left >= containerRect.left && 
        serviceRect.right <= containerRect.right;
      
      if (isVisible) {
        newVisibleIndices.add(i);
      }
    }

    if (newVisibleIndices.size > 0) {
      const indices = Array.from(newVisibleIndices);
      const centeredIndex = indices.reduce((prev, curr) => {
        const prevRect = services[prev].getBoundingClientRect();
        const currRect = services[curr].getBoundingClientRect();
        const prevCenter = Math.abs(prevRect.left + prevRect.right - containerRect.left - containerRect.right) / 2;
        const currCenter = Math.abs(currRect.left + currRect.right - containerRect.left - containerRect.right) / 2;
        return currCenter < prevCenter ? curr : prev;
      }, indices[0]);
      
      setCurrentServiceIndex(centeredIndex);
    }

    setVisibleServiceIndices(newVisibleIndices);
  }, []);

  const toggleFavorite = useCallback((serviceId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(serviceId)) {
        newFavorites.delete(serviceId);
      } else {
        newFavorites.add(serviceId);
      }
      return newFavorites;
    });
  }, []);

  const scrollToService = useCallback((index: number) => {
    if (serviceScrollRef.current && serviceScrollRef.current.children[index]) {
      serviceScrollRef.current.children[index].scrollIntoView({
        behavior: 'smooth',
        inline: 'center'
      });
      setCurrentServiceIndex(index);
    }
  }, []);

  const proceedToBooking = useCallback(() => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    setBookingStep('booking');
  }, [isLoggedIn]);

  const handleAddToCart = useCallback((service: Service) => {
    addToCart(service);
  }, [addToCart]);

  if (bookingStep === 'booking') {
    return <BookingFlow onBack={() => setBookingStep('browsing')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      {/* SEO Header - Hidden but crawlable */}
      <header className="sr-only">
        <h1>Best Nail Art & Manicure Services in {seoData.business.address.locality}, Patna | {seoData.business.name}</h1>
        <p>
          Professional nail services including bridal nails, gel manicures, nail extensions, 
          pedicures, and nail art in {seoData.business.address.locality}, Patna. 
          Rated {seoData.business.rating}⭐ with {seoData.business.totalReviews}+ happy clients.
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-8">
        
        {/* Category Services Banner */}
        <section className="bg-gradient-to-r from-orange-50 via-pink-50 to-rose-50 rounded-2xl p-4 mb-6 flex flex-col border border-orange-200">
          <h2 className="sr-only">
            {selectedCategory !== 'All' 
              ? `${selectedCategory} Services in ${seoData.business.address.locality}` 
              : `All Nail Services in ${seoData.business.address.locality}, Patna`}
          </h2>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                  {selectedCategory !== 'All' ? `${selectedCategory} Services` : 'All Nail Services'}
                </h3>
                <p className="text-xs text-gray-600">
                  {filteredServices.length} professional nail services available
                </p>
              </div>
            </div>
            
            <div className="bg-black/70 text-white text-xs font-medium px-2 py-1 rounded-full hidden sm:block">
              {currentServiceIndex + 1}/{filteredServices.length}
            </div>
            <div className="bg-black/70 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full sm:hidden">
              {currentServiceIndex + 1}/{filteredServices.length}
            </div>
          </div>
          
          {/* Instagram-like dot indicators */}
          {filteredServices.length > 0 && (
            <div className="flex justify-center items-center gap-[6px] mt-3">
              {filteredServices.slice(0, 20).map((_, index) => (
                <span
                  key={index}
                  onClick={() => scrollToService(index)}
                  className={`
                    block cursor-pointer rounded-full
                    transition-all duration-200
                    ${currentServiceIndex === index
                      ? 'bg-pink-600'
                      : 'bg-gray-300'}
                    ${currentServiceIndex === index
                      ? 'w-2 h-2'
                      : 'w-1.5 h-1.5'}
                    sm:${currentServiceIndex === index
                      ? 'w-2 h-2'
                      : 'w-1.5 h-1.5'}
                  `}
                  aria-label={`Go to service ${index + 1}`}
                />
              ))}
            </div>
          )}
        </section>

        {/* Services Grid - Semantic HTML for SEO */}
        <section aria-label="Nail services list">
          <div
            ref={serviceScrollRef}
            className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto sm:overflow-visible scrollbar-hide snap-x snap-mandatory pb-4"
            onScroll={updateVisibleServices}
            role="list"
          >
            {filteredServices.map((service, index) => (
              <article 
                key={service.id} 
                data-index={index}
                className="snap-start min-w-[280px] sm:min-w-0"
                itemScope
                itemType="https://schema.org/Service"
                role="listitem"
              >
                <meta itemProp="name" content={service.title} />
                <meta itemProp="description" content={service.shortDescription} />
                <meta itemProp="image" content={service.image} />
                <div itemProp="offers" itemScope itemType="https://schema.org/Offer">
                  <meta itemProp="price" content={service.price.toString()} />
                  <meta itemProp="priceCurrency" content="INR" />
                  <meta itemProp="availability" content="https://schema.org/InStock" />
                </div>
                
                <ServiceCard
                  service={service}
                  isFavorite={favorites.has(service.id)}
                  onToggleFavorite={() => toggleFavorite(service.id)}
                  onAddToCart={() => handleAddToCart(service)}
                  onViewDetails={() => {
                    setSelectedService(service);
                    setShowServiceDetail(true);
                  }}
                />
              </article>
            ))}
          </div>

          {filteredServices.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl shadow-md">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-medium text-gray-600 mb-2">No services found</h3>
              <p className="text-gray-500">Try selecting a different category</p>
            </div>
          )}
        </section>

        {/* Browse Categories - SEO Optimized */}
        <section className="mb-8" aria-label="Browse nail categories">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center flex items-center justify-center">
            <Zap className="mr-2 text-orange-600" />
            Browse Nail Categories
          </h2>
          
          <nav aria-label="Nail service categories">
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-3">
              {serviceCategories.map((category) => {
                const categoryServices = allServices.filter(s => 
                  category === 'All' ? true : s.category === category
                );
                
                return (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category || 'Nails');
                      if (serviceScrollRef.current) {
                        serviceScrollRef.current.scrollLeft = 0;
                      }
                    }}
                    className="cursor-pointer transition-all duration-300 aspect-square hover:scale-105"
                    aria-label={`View ${category} nail services - ${categoryServices.length} available`}
                    aria-pressed={selectedCategory === category}
                  >
                    <div className={`h-full rounded-xl p-2 text-center transition-all duration-300 flex flex-col items-center justify-center ${
                      selectedCategory === category 
                        ? 'bg-gradient-to-br from-orange-500 to-pink-600 text-white shadow-lg' 
                        : 'bg-white text-gray-700 shadow-md hover:shadow-lg border border-orange-100'
                    }`}>
                      <div className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-1 rounded-full overflow-hidden border border-white/20">
                        <Image 
                          src={getCategoryImage(category|| 'Nails')} 
                          alt={`${category} nail services in ${seoData.business.address.locality}`}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <p className="font-medium text-xs leading-tight truncate w-full">{category}</p>
                      <p className="text-[10px] opacity-75 mt-0.5">
                        {categoryServices.length} services
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </nav>
        </section>

        {/* Interactive Tools */}
        <section className="mb-8" aria-label="Nail consultation tools">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center flex items-center justify-center">
            <Zap className="mr-2 text-orange-600" />
            Discover Your Perfect Nail Style
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowBeautyQuiz(true)}
              className="bg-gradient-to-br from-orange-50 to-pink-100 p-4 rounded-xl hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center border-2 border-orange-200"
              aria-label="Take our nail style quiz"
            >
              <div className="text-3xl mb-2">💅</div>
              <h3 className="text-base font-bold text-pink-800">Nail Style Quiz</h3>
              <p className="text-gray-600 text-xs mt-1">Find perfect nail designs tailored for you!</p>
              <span className="mt-3 bg-white text-orange-600 font-semibold py-1.5 px-3 rounded-full text-xs border border-orange-300">
                Start Quiz
              </span>
            </button>
            <button
              onClick={() => setShowSkinAnalysis(true)}
              className="bg-gradient-to-br from-pink-50 to-orange-100 p-4 rounded-xl hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center border-2 border-pink-200"
              aria-label="Analyze your nail health"
            >
              <div className="text-3xl mb-2">🔍</div>
              <h3 className="text-base font-bold text-pink-800">Nail Health Analysis</h3>
              <p className="text-gray-600 text-xs mt-1">Get personalized nail care advice.</p>
              <span className="mt-3 bg-white text-pink-600 font-semibold py-1.5 px-3 rounded-full text-xs border border-pink-300">
                Analyze Nails
              </span>
            </button>
          </div>
        </section>

        {/* Trust Signals Banner */}
        <section className="bg-gradient-to-r from-orange-100 via-pink-100 to-rose-100 rounded-2xl p-4 mb-6 border-2 border-orange-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center">
              <Award className="w-8 h-8 text-orange-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900" itemProp="ratingValue">
                {nailStats.avgRating}⭐
              </div>
              <div className="text-xs text-gray-600" itemProp="ratingCount">
                {nailStats.totalReviews.toLocaleString()}+ Reviews
              </div>
            </div>
            <div className="flex flex-col items-center">
              <Scissors className="w-8 h-8 text-pink-600 mb-2" />
              <div className="text-2xl font-bold text-gray-900">{nailStats.totalServices}+</div>
              <div className="text-xs text-gray-600">Nail Services</div>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="w-8 h-8 text-rose-600 mb-2" />
              <div className="text-sm font-bold text-gray-900">Open Now</div>
              <div className="text-xs text-gray-600">{seoData.business.workingHours.weekdays}</div>
            </div>
          </div>
        </section>

        {/* Location & Contact - Rich Schema */}
        <section 
          className="bg-white rounded-2xl p-6 shadow-md mb-6"
          itemScope
          itemType="https://schema.org/LocalBusiness"
        >
          <meta itemProp="name" content={seoData.business.name} />
          <meta itemProp="image" content={`${seoData.business.contact.website}/logo.png`} />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div className="flex items-start gap-3" itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Visit Our Nail Studio</h3>
                <p className="text-gray-600 text-sm">
                  <span itemProp="streetAddress">{seoData.business.address.street}, {seoData.business.address.locality}</span>,{' '}
                  <span itemProp="addressLocality">{seoData.business.address.city}</span>,{' '}
                  <span itemProp="addressRegion">{seoData.business.address.state}</span>{' '}
                  <span itemProp="postalCode">{seoData.business.address.pincode}</span>
                </p>
                <a
                  href={seoData.localSEOOptimization.localCitations.googleMaps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 text-sm font-medium mt-2 inline-block hover:underline"
                  itemProp="hasMap"
                >
                  Get Directions →
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Call for Nail Appointment</h3>
                <a
                  href={`tel:${seoData.business.contact.phone}`}
                  className="text-gray-600 text-sm hover:text-orange-600 block"
                  itemProp="telephone"
                >
                  {seoData.business.contact.phone}
                </a>
                <p className="text-xs text-gray-500 mt-1">
                  <time itemProp="openingHours">{seoData.business.workingHours.weekdays}</time>
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-orange-100">
            <h3 className="font-bold text-gray-900 mb-4 text-center">
              Why Choose Our Nail Services?
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {nailStats.totalBookings.toLocaleString()}+
                </div>
                <div className="text-xs text-gray-600">Nail Appointments</div>
              </div>
              <div className="text-center" itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  <span itemProp="ratingValue">{nailStats.avgRating}</span>
                </div>
                <div className="text-xs text-gray-600">
                  ⭐ <span itemProp="reviewCount">{nailStats.totalReviews.toLocaleString()}+</span> Reviews
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">{nailStats.totalServices}+</div>
                <div className="text-xs text-gray-600">Nail Services</div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-6" aria-label="Customer testimonials for nail services">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Nail Transformations</h2>
          <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide">
            <TestimonialCard 
              name="Priya S." 
              text="My gel manicure lasted for weeks without chipping! The nail art was absolutely stunning!" 
              image="/images/nails/gel_manicure.webp" 
            />
            <TestimonialCard 
              name="Ananya R." 
              text="The pedicure was so relaxing and my feet have never felt better. Highly recommend!" 
              image="/images/nails/luxury_pedicure.webp" 
            />
            <TestimonialCard 
              name="Maya T." 
              text="The 3D nail art I got for my wedding was breathtaking! Everyone complimented my nails!" 
              image="/images/nails/nail_art.webp" 
            />
          </div>
        </section>

        {/* Promotional Banner */}
        <section className="bg-gradient-to-r from-orange-100 to-pink-100 rounded-xl p-6 text-center border-2 border-orange-200">
          <div className="inline-flex items-center bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full mb-2">
            <Zap className="mr-1" />
            BRIDAL NAIL SPECIAL
          </div>
          <h3 className="text-lg font-bold text-gray-800">25% OFF On Bridal Nail Packages</h3>
          <p className="text-gray-600 text-sm mt-1">Book your trial now for perfect wedding nails!</p>
        </section>
      </main>

      {/* Modals & Components */}
      {selectedService && showServiceDetail && (
        <ServiceDetailModal
          service={selectedService}
          isOpen={showServiceDetail}
          onClose={() => setShowServiceDetail(false)}
          onAddToCart={handleAddToCart}
          activeFaq={activeFaq}
          setActiveFaq={setActiveFaq}
        />
      )}

      {showBeautyQuiz && <BeautyQuiz onClose={() => setShowBeautyQuiz(false)} />}
      {showSkinAnalysis && <SkinAnalysis onClose={() => setShowSkinAnalysis(false)} />}
      
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={() => {
          setShowLoginModal(false);
          setBookingStep('booking');
        }}
        onSkipToHome={() => setShowLoginModal(false)}
      />

      <FloatingCart onProceedToBooking={proceedToBooking} />
      <MobileBottomNav />
    </div>
  );
};

export default ClientNailPage;