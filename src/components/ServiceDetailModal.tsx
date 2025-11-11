// app/components/ServiceDetailModal.tsx
"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { Service } from '../types/service';
import Image from 'next/image';

interface ServiceDetailModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (service: Service) => void;
  activeFaq: number | null;
  setActiveFaq: (index: number | null) => void;
}

const ServiceDetailModal = ({
  service,
  isOpen,
  onClose,
  onAddToCart,
  activeFaq,
  setActiveFaq
}: ServiceDetailModalProps) => {
  if (!service) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative">
              <Image
                src={service.image}
                alt={service.title}
                className="w-full h-64 object-cover rounded-t-xl"
              />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black to-transparent p-6">
                <h2 className="text-white text-2xl font-bold mb-2">{service.title}</h2>
                <div className="flex items-center space-x-4">
                  <div className="bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {service.duration} mins
                  </div>
                  <div className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {Math.round(((service.originalPrice - service.price) / service.originalPrice) * 100)}% OFF
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Pricing */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-gray-400 line-through">₹{service.originalPrice}</p>
                  <p className="text-3xl font-bold text-pink-600">₹{service.price}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-medium">{service.category}</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Description</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>

              {/* Benefits */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Benefits</h3>
                <div className="space-y-2">
                  {service.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start">
                      <Check className="text-green-500 mt-1 mr-2 shrink-0" />
                      <p className="text-gray-600">{benefit}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Ingredients */}
              {service.keyIngredients.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Key Ingredients</h3>
                  <div className="flex overflow-x-auto space-x-4 pb-2">
                    {service.keyIngredients.map((ingredient, index) => (
                      <div key={index} className="flex flex-col items-center shrink-0">
                        <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-2">
                          <Check className="text-pink-500 w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium text-center">{ingredient}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Precautions & Aftercare */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-red-700 mb-3">Precautions</h3>
                  <p className="text-gray-600">{service.precautions}</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-green-700 mb-3">Aftercare</h3>
                  <p className="text-gray-600">{service.aftercare}</p>
                </div>
              </div>

              {/* FAQs */}
              {service.faqs.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">FAQs</h3>
                  <div className="space-y-3">
                    {service.faqs.map((faq, index) => (
                      <div key={index} className="border border-pink-100 rounded-lg overflow-hidden">
                        <button
                          className="w-full flex justify-between items-center p-4 text-left bg-white hover:bg-pink-50 transition-colors"
                          onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                        >
                          <span className="font-medium text-pink-700">{faq.question}</span>
                          {activeFaq === index ? <ChevronUp /> : <ChevronDown />}
                        </button>
                        <AnimatePresence>
                          {activeFaq === index && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 bg-pink-50 text-gray-700">
                                {faq.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    onAddToCart(service);
                    onClose();
                  }}
                  className="flex-1 bg-white border border-pink-500 text-pink-500 py-3 px-6 rounded-lg font-medium hover:bg-pink-50 transition-colors"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => {
                    onAddToCart(service);
                    onClose();
                  }}
                  className="flex-1 bg-pink-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-pink-700 transition-colors"
                >
                  Book Now
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ServiceDetailModal;