// app/components/booking/TimeStep.tsx
"use client";

import { FiCalendar, FiCheck, FiClock, FiSun, FiMoon } from 'react-icons/fi';
import { useBooking } from '../../context/BookingContext';
import { useState, useEffect } from 'react';

interface TimeStepProps {
  onNext: () => void;
  onBack: () => void;
}

const TimeStep = ({ onNext, onBack }: TimeStepProps) => {
  const { 
    selectedTimeSlot, 
    setSelectedTimeSlot, 
    selectedStylist,
    availableTimeSlots,
    fetchAvailableTimeSlots,
    cart,
    loading 
  } = useBooking();
  
  const [selectedDate, setSelectedDate] = useState('');
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Calculate total duration from cart
  const totalDuration = cart.reduce((total, item) => {
    const itemDuration = item.duration_minutes || item.duration || 60; // Default to 60 if not found
    const itemQuantity = item.quantity || 1;
    return total + (itemDuration * itemQuantity);
  }, 0);

  // Generate next 7 days
  const getNextDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayName = i === 0 ? 'Today' : 
                      i === 1 ? 'Tomorrow' : 
                      date.toLocaleDateString('en-US', { weekday: 'short' });
      
      days.push({
        label: dayName,
        date: date.toISOString().split('T')[0],
        fullDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        dayOfWeek: date.getDay(),
      });
    }
    
    return days;
  };

  const dates = getNextDays();

  // Set initial date
  useEffect(() => {
    if (!selectedDate && dates.length > 0) {
      // Find first available date based on stylist's working days
      let initialDate = dates[0].date;
      
      if (selectedStylist && selectedStylist.working_days && selectedStylist.working_days.length > 0) {
        const availableDate = dates.find(d => selectedStylist.working_days.includes(d.dayOfWeek));
        if (availableDate) {
          initialDate = availableDate.date;
        }
      }
      
      setSelectedDate(initialDate);
    }
  }, [selectedStylist]);

  // Fetch time slots when date changes
  useEffect(() => {
    if (selectedDate) {
      loadTimeSlots();
    }
  }, [selectedDate, selectedStylist?.id]);

  const loadTimeSlots = async () => {
    setIsLoadingSlots(true);
    try {
      await fetchAvailableTimeSlots(selectedDate, selectedStylist?.id);
    } catch (error) {
      console.error('Error loading time slots:', error);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const filteredSlots = availableTimeSlots.filter(slot => slot.date === selectedDate);

  const groupSlotsByPeriod = () => {
    const grouped = {
      morning: filteredSlots.filter(s => {
        const hour = parseInt(s.time.split(':')[0]);
        return hour >= 6 && hour < 12;
      }),
      afternoon: filteredSlots.filter(s => {
        const hour = parseInt(s.time.split(':')[0]);
        return hour >= 12 && hour < 17;
      }),
      evening: filteredSlots.filter(s => {
        const hour = parseInt(s.time.split(':')[0]);
        return hour >= 17 && hour < 22;
      }),
    };
    return grouped;
  };

  const groupedSlots = groupSlotsByPeriod();

  const formatDuration = (minutes: number) => {
    if (!minutes || isNaN(minutes)) return '60 min'; // Default display
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
    return `${hours} hr${hours > 1 ? 's' : ''} ${mins} min`;
  };

  const isDateAvailable = (date: any) => {
    // Check if date is in stylist's working days
    if (selectedStylist && selectedStylist.working_days && selectedStylist.working_days.length > 0) {
      return selectedStylist.working_days.includes(date.dayOfWeek);
    }
    return true; // If no stylist selected or no working days specified, allow all dates
  };

  const handleProceedWithoutSlot = () => {
    // Allow proceeding without selecting a time slot
    // Set a placeholder time slot
    if (!selectedTimeSlot) {
      const placeholderSlot = {
        id: 'pending',
        date: selectedDate || dates[0].date,
        time: '10:00',
        stylist_id: selectedStylist?.id || '',
        available: true,
        duration_minutes: totalDuration || 60,
        period: 'morning' as const,
      };
      setSelectedTimeSlot(placeholderSlot);
    }
    onNext();
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Pick Your Perfect Time
          </h2>
          <p className="text-gray-500 mt-1">Choose a time that works best for you</p>
        </div>
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-full">
          <FiCalendar className="w-6 h-6 text-white" />
        </div>
      </div>
      
      {/* Service Duration Info */}
      <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-2xl">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white rounded-xl shadow-sm">
            <FiClock className="text-pink-600 w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-gray-800 mb-1">
              Estimated Duration: {formatDuration(totalDuration)}
            </p>
            <p className="text-sm text-gray-600">
              Please ensure you have enough time. We'll send you a reminder 30 minutes before.
            </p>
            {cart.length > 0 && (
              <p className="text-xs text-purple-600 mt-2">
                📋 {cart.length} service{cart.length > 1 ? 's' : ''} selected
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Date Selection */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">Select Date</h3>
        <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
          {dates.map(date => {
            const isAvailable = isDateAvailable(date);
            return (
              <button
                key={date.date}
                onClick={() => isAvailable && setSelectedDate(date.date)}
                disabled={!isAvailable}
                className={`p-3 rounded-xl font-medium transition-all ${
                  selectedDate === date.date
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg scale-105'
                    : isAvailable
                    ? 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-transparent hover:border-pink-200'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                }`}
              >
                <div className="text-xs mb-1">{date.label}</div>
                <div className="text-sm font-bold">{date.fullDate}</div>
                {!isAvailable && (
                  <div className="text-xs mt-1 text-red-400">Unavailable</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slots by Period */}
      {isLoadingSlots ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
        </div>
      ) : filteredSlots.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border-2 border-yellow-200">
          <span className="text-4xl mb-4 block">📅</span>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No time slots available for this date
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Please select another date or we'll call you to schedule a convenient time.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => {
                const nextAvailableDate = dates.find((d, i) => i > 0 && isDateAvailable(d));
                if (nextAvailableDate) {
                  setSelectedDate(nextAvailableDate.date);
                }
              }}
              className="px-6 py-2 bg-white border-2 border-pink-300 text-pink-600 rounded-full hover:bg-pink-50 transition-all font-medium"
            >
              Try Next Date
            </button>
            <button
              onClick={handleProceedWithoutSlot}
              className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:shadow-lg transition-all font-medium"
            >
              Schedule via Call
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5 mb-6">
          {Object.entries(groupedSlots).map(([period, slots]) => {
            if (slots.length === 0) return null;

            return (
              <div key={period}>
                <div className="flex items-center gap-2 mb-3">
                  {period === 'morning' && <FiSun className="text-yellow-500 w-5 h-5" />}
                  {period === 'afternoon' && <FiSun className="text-orange-500 w-5 h-5" />}
                  {period === 'evening' && <FiMoon className="text-indigo-500 w-5 h-5" />}
                  <h4 className="font-semibold text-gray-800 capitalize">{period}</h4>
                  <span className="text-xs text-gray-500">
                    ({slots.filter(s => s.available).length} available)
                  </span>
                </div>
                
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {slots.map(slot => (
                    <div 
                      key={slot.id} 
                      className={`relative p-3 rounded-xl cursor-pointer transition-all ${
                        selectedTimeSlot?.id === slot.id 
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg scale-105' : 
                        !slot.available 
                          ? 'bg-gray-100 border-2 border-gray-200 cursor-not-allowed opacity-60' : 
                          'bg-white border-2 border-gray-200 hover:border-pink-300 hover:shadow-md'
                      }`}
                      onClick={() => slot.available && setSelectedTimeSlot(slot)}
                    >
                      {slot.popular && slot.available && selectedTimeSlot?.id !== slot.id && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-400 to-pink-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold shadow-md">
                          ⭐
                        </div>
                      )}
                      
                      <div className="text-center">
                        <p className={`text-sm font-bold ${
                          selectedTimeSlot?.id === slot.id ? 'text-white' : 'text-gray-800'
                        }`}>
                          {slot.time}
                        </p>
                        {!slot.available && (
                          <span className="text-xs text-red-500 font-medium">Booked</span>
                        )}
                        {selectedTimeSlot?.id === slot.id && (
                          <FiCheck className="w-4 h-4 mx-auto mt-1" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Tips */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-6">
        <div className="flex gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="font-semibold text-gray-800 mb-1">Pro Tip</h4>
            <p className="text-sm text-gray-700">
              Morning slots are 20% less busy. Evening slots fill up quickly on weekends!
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
          onClick={selectedTimeSlot ? onNext : handleProceedWithoutSlot}
          className="flex-1 px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:shadow-lg transition-all font-medium"
        >
          {selectedTimeSlot ? 'Continue to Personalization →' : 'Schedule via Call →'}
        </button>
      </div>
    </div>
  );
};

export default TimeStep;