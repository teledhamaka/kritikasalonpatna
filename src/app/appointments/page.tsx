"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiCalendar, FiClock, FiUser, FiStar, FiMoreVertical, FiX, FiDownload, FiShare2,
  FiCheckCircle, FiXCircle, FiAlertCircle, FiSearch, FiLoader } from 'react-icons/fi';
import Image from 'next/image';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface Service {
  id: string;
  service_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  service_name?: string;
  service_image?: string;
}

interface Appointment {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  total_duration: number;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  tip_amount: number;
  total_amount: number;
  status: string;
  payment_status: string;
  special_instructions?: string;
  share_code?: string;
  stylist?: {
    full_name: string;
    profile_image_url?: string;
    rating: number;
    phone?: string;
  };
  services: Service[];
  review?: {
    id: string;
    rating: number;
    review_text: string;
  };
}

type FilterType = 'all' | 'upcoming' | 'completed' | 'cancelled';

export default function AppointmentsPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchAppointments = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('appointments')
        .select(`*, stylist:stylists(full_name, profile_image_url, rating, phone)`)
        .eq('user_id', user.id)
        .order('appointment_date', { ascending: false })
        .order('start_time', { ascending: false });

      if (filter === 'upcoming') {
        query = query.in('status', ['scheduled', 'confirmed']);
      } else if (filter === 'completed') {
        query = query.eq('status', 'completed');
      } else if (filter === 'cancelled') {
        query = query.eq('status', 'cancelled');
      }

      const { data: appointmentsData, error } = await query;

      if (error) throw error;

      const appointmentsWithServices = await Promise.all(
        (appointmentsData || []).map(async (apt) => {
          const { data: servicesData } = await supabase
            .from('appointment_services')
            .select(`*, service:services(name, image_url)`)
            .eq('appointment_id', apt.id);

          const services = servicesData?.map(s => ({
            id: s.id,
            service_id: s.service_id,
            quantity: s.quantity,
            unit_price: s.unit_price,
            total_price: s.total_price,
            service_name: s.service?.name,
            service_image: s.service?.image_url
          })) || [];

          const { data: reviewData } = await supabase
            .from('reviews')
            .select('id, rating, review_text')
            .eq('appointment_id', apt.id)
            .single();

          return {
            ...apt,
            services,
            review: reviewData || undefined
          };
        })
      );

      setAppointments(appointmentsWithServices);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  }, [user, filter]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    } else {
      fetchAppointments();
    }
  }, [isLoggedIn, fetchAppointments, router]);

  const handleCancelAppointment = async () => {
    if (!selectedAppointment || !cancelReason.trim()) return;

    setCancelling(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: cancelReason,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedAppointment.id);

      if (error) throw error;

      setShowCancelModal(false);
      setCancelReason('');
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Failed to cancel appointment. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'scheduled':
        return { color: 'bg-blue-100 text-blue-700', icon: FiClock, label: 'Scheduled' };
      case 'confirmed':
        return { color: 'bg-green-100 text-green-700', icon: FiCheckCircle, label: 'Confirmed' };
      case 'completed':
        return { color: 'bg-purple-100 text-purple-700', icon: FiCheckCircle, label: 'Completed' };
      case 'cancelled':
        return { color: 'bg-red-100 text-red-700', icon: FiXCircle, label: 'Cancelled' };
      case 'in_progress':
        return { color: 'bg-yellow-100 text-yellow-700', icon: FiClock, label: 'In Progress' };
      default:
        return { color: 'bg-gray-100 text-gray-700', icon: FiAlertCircle, label: status };
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const filteredAppointments = appointments.filter(apt => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      apt.stylist?.full_name.toLowerCase().includes(query) ||
      apt.services.some(s => s.service_name?.toLowerCase().includes(query)) ||
      apt.id.toLowerCase().includes(query)
    );
  });

  const stats = {
    total: appointments.length,
    upcoming: appointments.filter(a => ['scheduled', 'confirmed'].includes(a.status)).length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <FiLoader className="w-8 h-8 text-pink-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-pink-100 mr-2"
            >
              <FiArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">My Appointments</h1>
              <p className="text-sm text-gray-600">{stats.total} total bookings</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-pink-100">
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 shadow-sm border border-blue-100">
            <div className="text-2xl font-bold text-blue-600">{stats.upcoming}</div>
            <div className="text-sm text-blue-700">Upcoming</div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 shadow-sm border border-purple-100">
            <div className="text-2xl font-bold text-purple-600">{stats.completed}</div>
            <div className="text-sm text-purple-700">Completed</div>
          </div>
          <div className="bg-red-50 rounded-xl p-4 shadow-sm border border-red-100">
            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
            <div className="text-sm text-red-700">Cancelled</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-pink-100 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex gap-2 overflow-x-auto">
              {(['all', 'upcoming', 'completed', 'cancelled'] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    filter === f
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by stylist, service, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
          </div>
        </div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-pink-100 text-center">
            <FiCalendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Appointments Found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You haven&apos;t booked any appointments yet."
                : `No ${filter} appointments.`}
            </p>
            <button
              onClick={() => router.push('/book')}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all font-medium"
            >
              Book Your First Appointment
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => {
              const statusConfig = getStatusConfig(appointment.status);
              const StatusIcon = statusConfig.icon;

              return (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm border border-pink-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {appointment.stylist?.profile_image_url ? (
                            <Image
                              src={appointment.stylist.profile_image_url}
                              alt={appointment.stylist.full_name}
                              width={48}
                              height={48}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <FiUser className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {appointment.stylist?.full_name || 'Stylist'}
                          </h3>
                          <div className="flex items-center text-sm text-gray-600">
                            <FiCalendar className="w-4 h-4 mr-1" />
                            {formatDate(appointment.appointment_date)} at {formatTime(appointment.start_time)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowDetailsModal(true);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <FiMoreVertical className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {appointment.services.map((service, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-sm"
                          >
                            {service.service_name} {service.quantity > 1 && `x${service.quantity}`}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <FiClock className="w-4 h-4 mr-1" />
                          {appointment.total_duration} mins
                        </div>
                        <div className="font-semibold text-gray-800">
                          ₹{appointment.total_amount.toLocaleString()}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        {appointment.status === 'completed' && !appointment.review && (
                          <button
                            onClick={() => router.push(`/appointments/${appointment.id}/review`)}
                            className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium flex items-center"
                          >
                            <FiStar className="w-4 h-4 mr-1" />
                            Add Review
                          </button>
                        )}
                        
                        {['scheduled', 'confirmed'].includes(appointment.status) && (
                          <>
                            <button
                              onClick={() => router.push(`/appointments/${appointment.id}/reschedule`)}
                              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setShowCancelModal(true);
                              }}
                              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowDetailsModal(true);
                          }}
                          className="px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors text-sm font-medium"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Details Modal */}
        <AnimatePresence>
          {showDetailsModal && selectedAppointment && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowDetailsModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Appointment Details</h2>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiX className="w-6 h-6 text-gray-600" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Booking ID</div>
                    <div className="font-mono text-gray-800">{selectedAppointment.id}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Date</div>
                      <div className="font-medium text-gray-800">
                        {formatDate(selectedAppointment.appointment_date)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Time</div>
                      <div className="font-medium text-gray-800">
                        {formatTime(selectedAppointment.start_time)} - {formatTime(selectedAppointment.end_time)}
                      </div>
                    </div>
                  </div>

                  {selectedAppointment.stylist && (
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Stylist</div>
                      <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                        <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white">
                          {selectedAppointment.stylist.profile_image_url ? (
                            <Image
                              src={selectedAppointment.stylist.profile_image_url}
                              alt={selectedAppointment.stylist.full_name}
                              width={48}
                              height={48}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <FiUser className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">
                            {selectedAppointment.stylist.full_name}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <FiStar className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                            {selectedAppointment.stylist.rating.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-sm text-gray-600 mb-2">Services</div>
                    <div className="space-y-2">
                      {selectedAppointment.services.map((service, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-800">{service.service_name}</div>
                            <div className="text-sm text-gray-600">Qty: {service.quantity}</div>
                          </div>
                          <div className="font-medium text-gray-800">
                            ₹{service.total_price.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-2">Price Breakdown</div>
                    <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Subtotal</span>
                        <span className="text-gray-800">₹{selectedAppointment.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Tax (18%)</span>
                        <span className="text-gray-800">₹{selectedAppointment.tax_amount.toLocaleString()}</span>
                      </div>
                      {selectedAppointment.discount_amount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount</span>
                          <span>-₹{selectedAppointment.discount_amount.toLocaleString()}</span>
                        </div>
                      )}
                      {selectedAppointment.tip_amount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-700">Tip</span>
                          <span className="text-gray-800">₹{selectedAppointment.tip_amount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t border-gray-300 font-semibold text-lg">
                        <span className="text-gray-800">Total</span>
                        <span className="text-pink-600">₹{selectedAppointment.total_amount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {selectedAppointment.special_instructions && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Special Instructions</div>
                      <div className="bg-yellow-50 p-3 rounded-lg text-gray-700">
                        {selectedAppointment.special_instructions}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button className="flex-1 px-4 py-3 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors font-medium flex items-center justify-center">
                      <FiDownload className="w-4 h-4 mr-2" />
                      Download Invoice
                    </button>
                    <button className="flex-1 px-4 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium flex items-center justify-center">
                      <FiShare2 className="w-4 h-4 mr-2" />
                      Share
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cancel Modal */}
        <AnimatePresence>
          {showCancelModal && selectedAppointment && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
              >
                <div className="text-center mb-6">
                  <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <FiXCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Cancel Appointment?
                  </h3>
                  <p className="text-gray-600">
                    Are you sure you want to cancel this appointment? This action cannot be undone.
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for cancellation
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Please tell us why you&apos;re cancelling..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 resize-none"
                    rows={4}
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowCancelModal(false);
                      setCancelReason('');
                      setSelectedAppointment(null);
                    }}
                    disabled={cancelling}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Keep Appointment
                  </button>
                  <button
                    onClick={handleCancelAppointment}
                    disabled={cancelling || !cancelReason.trim()}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {cancelling ? (
                      <>
                        <FiLoader className="animate-spin mr-2 w-4 h-4" />
                        Cancelling...
                      </>
                    ) : (
                      'Yes, Cancel'
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}