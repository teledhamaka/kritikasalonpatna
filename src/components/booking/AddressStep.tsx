// app/components/booking/AddressStep.tsx
"use client";

import { FiMapPin, FiX, FiCheck, FiPlus, FiHome, FiBriefcase, FiHeart } from 'react-icons/fi';
import { useBooking } from '../../context/BookingContext';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface AddressStepProps {
  onNext: () => void;
  onBack: () => void;
}

const AddressStep = ({ onNext, onBack }: AddressStepProps) => {
  const { selectedAddress, setSelectedAddress, addresses, fetchAddresses } = useBooking();
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    flat: '',
    colony: '',
    locality: '',
    landmark: '',
    city: '',
    pincode: '',
    address_type: 'home' as 'home' | 'work' | 'other',
    delivery_instructions: '',
    is_default: false,
  });

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'home':
        return FiHome;
      case 'work':
        return FiBriefcase;
      case 'other':
        return FiHeart;
      default:
        return FiHome;
    }
  };

  const handleAddAddress = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const full_address = `${formData.flat ? formData.flat + ', ' : ''}${formData.colony}, ${formData.locality}, ${formData.landmark ? 'Near ' + formData.landmark + ', ' : ''}${formData.city} - ${formData.pincode}`;
      
      const { data, error } = await supabase
        .from('addresses')
        .insert({
          user_id: user.id,
          ...formData,
          full_address,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      // If this is set as default, update other addresses
      if (formData.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .neq('id', data.id);
      }

      await fetchAddresses();
      setSelectedAddress(data);
      setShowAddForm(false);
      setFormData({
        flat: '',
        colony: '',
        locality: '',
        landmark: '',
        city: '',
        pincode: '',
        address_type: 'home',
        delivery_instructions: '',
        is_default: false,
      });
    } catch (error) {
      console.error('Error adding address:', error);
      alert('Failed to add address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const { error } = await supabase
        .from('addresses')
        .update({ is_active: false })
        .eq('id', addressId);

      if (error) throw error;

      await fetchAddresses();
      if (selectedAddress?.id === addressId) {
        setSelectedAddress(undefined);
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Where should we pamper you?
          </h2>
          <p className="text-gray-500 mt-1">Choose your location for the service</p>
        </div>
        <div className="bg-pink-50 p-3 rounded-full">
          <FiMapPin className="w-6 h-6 text-pink-500" />
        </div>
      </div>
      
      <div className="space-y-4 mb-6">
        {addresses.length === 0 && !showAddForm ? (
          <div className="text-center py-8">
            <FiMapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No addresses found. Add your first address!</p>
          </div>
        ) : (
          addresses.map(address => {
            const IconComponent = getAddressIcon(address.address_type);
            return (
              <div 
                key={address.id} 
                className={`group relative p-5 rounded-2xl cursor-pointer transition-all duration-300 ${
                  selectedAddress?.id === address.id 
                    ? 'bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-400 shadow-lg scale-[1.02]' 
                    : 'border-2 border-gray-100 hover:border-pink-200 hover:shadow-md'
                }`}
                onClick={() => setSelectedAddress(address)}
              >
                {address.pincode.startsWith('40') && ( // Premium zones (example: Mumbai)
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs px-3 py-1 rounded-full font-medium shadow-md">
                    ✨ Premium Zone
                  </div>
                )}
                
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`p-3 rounded-xl ${
                      selectedAddress?.id === address.id ? 'bg-pink-500' : 'bg-pink-100'
                    } transition-colors`}>
                      <IconComponent className={`w-5 h-5 ${
                        selectedAddress?.id === address.id ? 'text-white' : 'text-pink-500'
                      }`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg text-gray-800 capitalize">
                          {address.address_type}
                        </h3>
                        {address.is_default && (
                          <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {address.full_address}
                      </p>
                      {address.landmark && (
                        <p className="text-pink-500 text-xs mt-1">📍 {address.landmark}</p>
                      )}
                      {address.delivery_instructions && (
                        <p className="text-gray-500 text-xs mt-1 italic">
                          💡 {address.delivery_instructions}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {selectedAddress?.id === address.id && (
                      <div className="bg-pink-500 text-white p-2 rounded-full animate-pulse">
                        <FiCheck className="w-5 h-5" />
                      </div>
                    )}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAddress(address.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-full transition-opacity text-red-500"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {!showAddForm ? (
          <button 
            onClick={() => setShowAddForm(true)}
            className="w-full p-5 border-2 border-dashed border-pink-300 rounded-2xl text-pink-500 hover:bg-pink-50 transition-all duration-300 flex items-center justify-center gap-3 group"
          >
            <div className="p-2 bg-pink-100 rounded-full group-hover:scale-110 transition-transform">
              <FiPlus className="w-5 h-5" />
            </div>
            <span className="font-medium">Add New Address</span>
          </button>
        ) : (
          <div className="border-2 border-pink-200 rounded-2xl p-6 bg-gradient-to-br from-pink-50 to-purple-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800 text-lg">Add New Address</h3>
              <button 
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Flat/House No.
                </label>
                <input
                  type="text"
                  value={formData.flat}
                  onChange={(e) => setFormData({ ...formData, flat: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="A-303"
                />
              </div>
              
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Colony/Building <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.colony}
                  onChange={(e) => setFormData({ ...formData, colony: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Beauty Street"
                  required
                />
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Locality <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.locality}
                  onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Cosmetics Colony"
                  required
                />
              </div>
              
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Landmark
                </label>
                <input
                  type="text"
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Near Rose Garden"
                />
              </div>
              
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Mumbai"
                  required
                />
              </div>
              
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="400001"
                  maxLength={6}
                  required
                />
              </div>
              
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Type
                </label>
                <select
                  value={formData.address_type}
                  onChange={(e) => setFormData({ ...formData, address_type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Instructions
                </label>
                <input
                  type="text"
                  value={formData.delivery_instructions}
                  onChange={(e) => setFormData({ ...formData, delivery_instructions: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Gate code, floor number, etc."
                />
              </div>
              
              <div className="col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                    className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                  />
                  <span className="text-sm text-gray-700">Set as default address</span>
                </label>
              </div>
            </div>
            
            <button
              onClick={handleAddAddress}
              disabled={loading || !formData.colony || !formData.locality || !formData.city || !formData.pincode}
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Saving...' : 'Save Address'}
            </button>
          </div>
        )}
      </div>

      {/* Service Location Info */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl mb-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white rounded-lg">
            <span className="text-2xl">💅</span>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-1">Our stylists come to you!</h4>
            <p className="text-sm text-gray-600">
              Enjoy salon services in the comfort of your home. Our professionals bring all necessary equipment.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between gap-4">
        <button 
          onClick={onBack}
          className="px-8 py-3 border-2 border-gray-200 text-gray-700 rounded-full hover:bg-gray-50 transition-all font-medium"
        >
          ← Back
        </button>
        <button 
          onClick={onNext}
          disabled={!selectedAddress}
          className="flex-1 px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          Continue to Stylist Selection →
        </button>
      </div>
    </div>
  );
};

export default AddressStep;