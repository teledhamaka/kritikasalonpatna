"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { LocationData } from '@/lib/services/location-mapper';
import { Service } from '@/types/service';
import ServiceCard from '../ServiceCard';
import { useBooking } from '@/context/BookingContext';
import { MapPin, Phone, Navigation, Clock, Star } from 'lucide-react';

interface LocationServicePageProps {
  location: LocationData;
  services: Service[];
}

export default function LocationServicePage({ 
  location, 
  services 
}: LocationServicePageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const { addToCart } = useBooking();

  const categories = ['All', 'Makeup', 'Hair', 'Skin', 'Nails'];

  const filteredServices = selectedCategory === 'All' 
    ? services.slice(0, 20) // Show top 20 services
    : services.filter(s => s.category === selectedCategory);

  const toggleFavorite = (serviceId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(serviceId)) {
        newFavorites.delete(serviceId);
      } else {
        newFavorites.add(serviceId);
      }
      return newFavorites;
    });
  };

  const whatsappLink = `https://wa.me/919650461390?text=Hi%20Kritika%20Salon%2C%20I%20want%20to%20book%20an%20appointment.%20I'm%20near%20${encodeURIComponent(location.name)}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-pink-600 via-rose-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-pink-100 mb-6">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <span className="text-white">{location.name}</span>
          </div>

          {/* Title */}
          <div className="mb-8">
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
              <MapPin className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">{location.type}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              Beauty Services Near<br />
              {location.name}
            </h1>
            <p className="text-xl text-pink-100 max-w-3xl">
              {location.description}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="text-xs text-pink-100 mb-1">Distance</div>
              <div className="text-2xl font-bold">{location.distance}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="text-xs text-pink-100 mb-1">Travel Time</div>
              <div className="text-2xl font-bold">5 mins</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="text-xs text-pink-100 mb-1">Rating</div>
              <div className="text-2xl font-bold">4.9 ⭐</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="text-xs text-pink-100 mb-1">Clients</div>
              <div className="text-2xl font-bold">5000+</div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-pink-600 px-8 py-4 rounded-2xl font-bold text-center hover:scale-105 transition-transform"
            >
              Book via WhatsApp
            </a>
            <a
              href="tel:+919650461390"
              className="bg-white/10 border-2 border-white text-white px-8 py-4 rounded-2xl font-bold text-center hover:bg-white/20 transition-all flex items-center justify-center gap-2"
            >
              <Phone className="w-5 h-5" />
              Call Now
            </a>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Category Filter */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Browse Services ({filteredServices.length})
          </h2>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-2xl font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-pink-200 hover:border-pink-400'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid - Using existing ServiceCard component */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              isFavorite={favorites.has(service.id)}
              onToggleFavorite={() => toggleFavorite(service.id)}
              onAddToCart={() => addToCart(service)}
              onViewDetails={() => {
                window.location.href = `/service/${service.title.toLowerCase().replace(/\s+/g, '-')}-bhootnath-road-patna`;
              }}
              variant="compact"
            />
          ))}
        </div>
      </div>
    </div>
  );
}