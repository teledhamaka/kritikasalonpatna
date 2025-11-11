"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {ArrowLeft, Settings, Lock, Bell, Shield, MapPin, Heart, Moon, Sun, HelpCircle, LogOut,
  ChevronRight, Check, AlertTriangle, Loader, Trash2, Mail, Phone, User} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface NotificationPreferences {
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  whatsapp_enabled: boolean;
  booking_notifications: boolean;
  payment_notifications: boolean;
  loyalty_notifications: boolean;
  promotional_notifications: boolean;
  reminder_notifications: boolean;
  reminder_hours_before: number;
}

interface Address {
  id: string;
  flat?: string;
  colony: string;
  locality: string;
  landmark?: string;
  city: string;
  pincode: string;
  full_address?: string;
  is_default: boolean;
}

interface NotificationUpdateError {
  message: string;
  code?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile, signOut, isLoggedIn } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('account');
  
  // Account Settings
  const [showChangePassword, setShowChangePassword] = useState(false);
  //const [ setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  
  // Notification Preferences
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    email_enabled: true,
    sms_enabled: true,
    push_enabled: true,
    whatsapp_enabled: false,
    booking_notifications: true,
    payment_notifications: true,
    loyalty_notifications: true,
    promotional_notifications: true,
    reminder_notifications: true,
    reminder_hours_before: 24
  });
  
  // Privacy Settings
  const [privacySettings, setPrivacySettings] = useState({
    profile_visible: true,
    reviews_anonymous: false,
    data_sharing: true
  });
  
  // Addresses
  const [addresses, setAddresses] = useState<Address[]>([]);
  //const [showAddAddress, setShowAddAddress] = useState(false);
  
  // App Preferences
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('INR');

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    } else {
      fetchSettings();
    }
  }, [isLoggedIn]);

  const fetchSettings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch notification preferences
      const { data: notifData } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (notifData) {
        setNotificationPrefs(notifData);
      }

      // Fetch addresses
      const { data: addressData } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (addressData) {
        setAddresses(addressData);
      }

      // Fetch user preferences
      const { data: prefsData } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id);

      if (prefsData) {
        prefsData.forEach((pref) => {
          if (pref.preference_key === 'theme') {
            setTheme(pref.preference_value as any);
          } else if (pref.preference_key === 'language') {
            setLanguage(pref.preference_value);
          } else if (pref.preference_key === 'privacy_settings') {
            setPrivacySettings(pref.preference_value as any);
          }
        });
      }
    } catch (error) {
      const err = error as NotificationUpdateError;
      console.error('Error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      alert('Password changed successfully!');
      setShowChangePassword(false);
      // setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      const err = error as NotificationUpdateError;
      console.error('Failed to change password:', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotificationPrefs = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...notificationPrefs,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      alert('Notification preferences saved!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrivacySettings = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          preference_key: 'privacy_settings',
          preference_value: privacySettings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      alert('Privacy settings saved!');
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;
      fetchSettings();
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address');
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    if (!user) return;

    try {
      // Remove default from all addresses
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Set new default
      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', addressId);

      if (error) throw error;
      fetchSettings();
    } catch (error) {
      console.error('Error setting default address:', error);
      alert('Failed to update default address');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you absolutely sure? This action cannot be undone!')) return;

    try {
      // Delete user data
      await supabase.from('profiles').delete().eq('id', user!.id);
      
      // Sign out
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please contact support.');
    }
  };

  const sections = [
    { id: 'account', label: 'Account Settings', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
    { id: 'preferences', label: 'App Preferences', icon: Settings },
    { id: 'help', label: 'Help & Support', icon: HelpCircle }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <Loader className="w-8 h-8 text-pink-500 animate-spin" />
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
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <Settings className="w-6 h-6 mr-2 text-pink-500" />
                Settings
              </h1>
              <p className="text-sm text-gray-600">Manage your account and preferences</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-pink-100 overflow-hidden">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
                      activeSection === section.id
                        ? 'bg-pink-50 text-pink-600 border-l-4 border-pink-500'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon className="w-5 h-5 mr-3" />
                      <span className="font-medium text-sm">{section.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {/* Account Settings */}
              {activeSection === 'account' && (
                <motion.div
                  key="account"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Account Information</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <Mail className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="text-gray-800">{profile?.email}</span>
                          <span className="ml-auto px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            Verified
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <Phone className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="text-gray-800">{profile?.phone || 'Not added'}</span>
                          {profile?.phone && (
                            <button className="ml-auto text-pink-600 text-sm font-medium hover:text-pink-700">
                              Change
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                        <div className="p-3 bg-gray-50 rounded-lg text-gray-800">
                          {new Date(profile?.created_at || '').toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Change Password */}
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">Password</h3>
                      <button
                        onClick={() => setShowChangePassword(!showChangePassword)}
                        className="px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors text-sm font-medium"
                      >
                        {showChangePassword ? 'Cancel' : 'Change Password'}
                      </button>
                    </div>

                    {showChangePassword && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                          />
                        </div>

                        <button
                          onClick={handleChangePassword}
                          disabled={saving || !newPassword || !confirmPassword}
                          className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all font-medium disabled:opacity-50 flex items-center justify-center"
                        >
                          {saving ? (
                            <>
                              <Loader className="animate-spin mr-2 w-5 h-5" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Lock className="mr-2 w-5 h-5" />
                              Update Password
                            </>
                          )}
                        </button>
                      </motion.div>
                    )}
                  </div>

                  {/* Delete Account */}
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <div className="flex items-start">
                      <AlertTriangle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-red-800 mb-2">Delete Account</h3>
                        <p className="text-sm text-red-700 mb-4">
                          Once you delete your account, there is no going back. All your data, bookings, and loyalty points will be permanently deleted.
                        </p>
                        <button
                          onClick={() => setShowDeleteAccount(true)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Notifications */}
              {activeSection === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Notification Channels</h2>
                    
                    <div className="space-y-4">
                      {[
                        { key: 'email_enabled', label: 'Email Notifications', icon: Mail },
                        { key: 'sms_enabled', label: 'SMS Notifications', icon: Phone },
                        { key: 'push_enabled', label: 'Push Notifications', icon: Bell },
                        { key: 'whatsapp_enabled', label: 'WhatsApp Notifications', icon: Phone }
                      ].map(({ key, label, icon: Icon }) => (
                        <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <Icon className="w-5 h-5 text-gray-600 mr-3" />
                            <span className="font-medium text-gray-800">{label}</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationPrefs[key as keyof NotificationPreferences] as boolean}
                              onChange={(e) => setNotificationPrefs({
                                ...notificationPrefs,
                                [key]: e.target.checked
                              })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Notification Types</h2>
                    
                    <div className="space-y-4">
                      {[
                        { key: 'booking_notifications', label: 'Booking Updates', description: 'Get notified about booking confirmations and changes' },
                        { key: 'payment_notifications', label: 'Payment Alerts', description: 'Receive payment receipts and transaction updates' },
                        { key: 'loyalty_notifications', label: 'Loyalty & Rewards', description: 'Stay updated on points, rewards, and tier changes' },
                        { key: 'promotional_notifications', label: 'Promotions & Offers', description: 'Receive exclusive deals and special offers' },
                        { key: 'reminder_notifications', label: 'Appointment Reminders', description: 'Get reminded before your appointments' }
                      ].map(({ key, label, description }) => (
                        <div key={key} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-gray-800">{label}</div>
                            <div className="text-sm text-gray-600">{description}</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer ml-4">
                            <input
                              type="checkbox"
                              checked={notificationPrefs[key as keyof NotificationPreferences] as boolean}
                              onChange={(e) => setNotificationPrefs({
                                ...notificationPrefs,
                                [key]: e.target.checked
                              })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100">
                    <h3 className="font-semibold text-gray-800 mb-4">Reminder Timing</h3>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Send appointment reminders
                    </label>
                    <select
                      value={notificationPrefs.reminder_hours_before}
                      onChange={(e) => setNotificationPrefs({
                        ...notificationPrefs,
                        reminder_hours_before: parseInt(e.target.value)
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    >
                      <option value="1">1 hour before</option>
                      <option value="3">3 hours before</option>
                      <option value="6">6 hours before</option>
                      <option value="12">12 hours before</option>
                      <option value="24">24 hours before</option>
                      <option value="48">48 hours before</option>
                    </select>
                  </div>

                  <button
                    onClick={handleSaveNotificationPrefs}
                    disabled={saving}
                    className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all font-medium disabled:opacity-50 flex items-center justify-center"
                  >
                    {saving ? (
                      <>
                        <Loader className="animate-spin mr-2 w-5 h-5" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 w-5 h-5" />
                        Save Preferences
                      </>
                    )}
                  </button>
                </motion.div>
              )}

              {/* Privacy & Security */}
              {activeSection === 'privacy' && (
                <motion.div
                  key="privacy"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Privacy Settings</h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-gray-800 mb-1">Profile Visibility</div>
                          <div className="text-sm text-gray-600">
                            Allow other users to view your profile information
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                          <input
                            type="checkbox"
                            checked={privacySettings.profile_visible}
                            onChange={(e) => setPrivacySettings({
                              ...privacySettings,
                              profile_visible: e.target.checked
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                        </label>
                      </div>

                      <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-gray-800 mb-1">Anonymous Reviews</div>
                          <div className="text-sm text-gray-600">
                            Post reviews anonymously without showing your name
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                          <input
                            type="checkbox"
                            checked={privacySettings.reviews_anonymous}
                            onChange={(e) => setPrivacySettings({
                              ...privacySettings,
                              reviews_anonymous: e.target.checked
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                        </label>
                      </div>

                      <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-gray-800 mb-1">Data Sharing</div>
                          <div className="text-sm text-gray-600">
                            Share anonymized data to help improve our services
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                          <input
                            type="checkbox"
                            checked={privacySettings.data_sharing}
                            onChange={(e) => setPrivacySettings({
                              ...privacySettings,
                              data_sharing: e.target.checked
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Data & Privacy</h3>
                    <div className="space-y-3">
                      <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <span className="font-medium text-gray-800">Download My Data</span>
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      </button>
                      <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <span className="font-medium text-gray-800">Privacy Policy</span>
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      </button>
                      <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <span className="font-medium text-gray-800">Terms of Service</span>
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleSavePrivacySettings}
                    disabled={saving}
                    className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all font-medium disabled:opacity-50 flex items-center justify-center"
                  >
                    {saving ? (
                      <>
                        <Loader className="animate-spin mr-2 w-5 h-5" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 w-5 h-5" />
                        Save Settings
                      </>
                    )}
                  </button>
                </motion.div>
              )}

              {/* Saved Addresses */}
              {activeSection === 'addresses' && (
                <motion.div
                  key="addresses"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-800">Saved Addresses</h2>
                      <button
                        onClick={() => router.push('/profile')}
                        className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all font-medium text-sm"
                      >
                        Add Address
                      </button>
                    </div>

                    {addresses.length > 0 ? (
                      <div className="space-y-4">
                        {addresses.map((address) => (
                          <div
                            key={address.id}
                            className={`p-4 rounded-lg border-2 ${
                              address.is_default
                                ? 'border-pink-500 bg-pink-50'
                                : 'border-gray-200 bg-white'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center mb-2">
                                  <MapPin className="w-5 h-5 text-pink-500 mr-2" />
                                  <span className="font-semibold text-gray-800">
                                    {address.flat ? `${address.flat}, ` : ''}{address.colony}
                                  </span>
                                  {address.is_default && (
                                    <span className="ml-2 px-2 py-0.5 bg-pink-500 text-white text-xs rounded-full">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">
                                  {address.locality}, {address.city} - {address.pincode}
                                </p>
                                {address.landmark && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    Near {address.landmark}
                                  </p>
                                )}
                              </div>
                              <div className="flex space-x-2 ml-4">
                                {!address.is_default && (
                                  <button
                                    onClick={() => handleSetDefaultAddress(address.id)}
                                    className="p-2 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                                    title="Set as default"
                                  >
                                    <Check className="w-5 h-5" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteAddress(address.id)}
                                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete address"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">No saved addresses yet</p>
                        <button
                          onClick={() => router.push('/profile')}
                          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all font-medium"
                        >
                          Add Your First Address
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* App Preferences */}
              {activeSection === 'preferences' && (
                <motion.div
                  key="preferences"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">App Preferences</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Theme
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: 'light', label: 'Light', icon: Sun },
                            { value: 'dark', label: 'Dark', icon: Moon },
                            { value: 'auto', label: 'Auto', icon: Settings }
                          ].map(({ value, label, icon: Icon }) => (
                            <button
                              key={value}
                              onClick={() => setTheme(value as any)}
                              className={`p-4 rounded-lg border-2 transition-all ${
                                theme === value
                                  ? 'border-pink-500 bg-pink-50'
                                  : 'border-gray-200 hover:border-pink-300'
                              }`}
                            >
                              <Icon className="w-6 h-6 mx-auto mb-2 text-gray-700" />
                              <span className="text-sm font-medium text-gray-800">{label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Language
                        </label>
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        >
                          <option value="en">English</option>
                          <option value="hi">हिंदी (Hindi)</option>
                          <option value="mr">मराठी (Marathi)</option>
                          <option value="bn">বাংলা (Bengali)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Currency
                        </label>
                        <select
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        >
                          <option value="INR">₹ INR (Indian Rupee)</option>
                          <option value="USD">$ USD (US Dollar)</option>
                          <option value="EUR">€ EUR (Euro)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Beauty Preferences</h3>
                    <div className="space-y-3">
                      <button 
                        onClick={() => router.push('/profile')}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center">
                          <Heart className="w-5 h-5 text-pink-500 mr-3" />
                          <span className="font-medium text-gray-800">Skin Type & Preferences</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      </button>
                      <button 
                        onClick={() => router.push('/profile')}
                        className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center">
                          <User className="w-5 h-5 text-purple-500 mr-3" />
                          <span className="font-medium text-gray-800">Preferred Stylists</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Help & Support */}
              {activeSection === 'help' && (
                <motion.div
                  key="help"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Help & Support</h2>
                    
                    <div className="space-y-3">
                      <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center">
                          <HelpCircle className="w-5 h-5 text-pink-500 mr-3" />
                          <span className="font-medium text-gray-800">FAQ</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      </button>

                      <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center">
                          <Mail className="w-5 h-5 text-purple-500 mr-3" />
                          <span className="font-medium text-gray-800">Contact Support</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      </button>

                      <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center">
                          <Phone className="w-5 h-5 text-blue-500 mr-3" />
                          <span className="font-medium text-gray-800">Call Us</span>
                        </div>
                        <span className="text-sm text-gray-600">1800-XXX-XXXX</span>
                      </button>

                      <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center">
                          <HelpCircle className="w-5 h-5 text-green-500 mr-3" />
                          <span className="font-medium text-gray-800">Report an Issue</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">About</h3>
                    <div className="space-y-3">
                      <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <span className="font-medium text-gray-800">About SALONIC</span>
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      </button>
                      <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <span className="font-medium text-gray-800">Terms & Conditions</span>
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      </button>
                      <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <span className="font-medium text-gray-800">Privacy Policy</span>
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      </button>
                      <div className="p-3 bg-gray-50 rounded-lg text-center">
                        <span className="text-sm text-gray-600">Version 1.0.0</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      if (confirm('Are you sure you want to sign out?')) {
                        await signOut();
                        router.push('/');
                      }
                    }}
                    className="w-full px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium flex items-center justify-center"
                  >
                    <LogOut className="mr-2 w-5 h-5" />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Delete Account Confirmation Modal */}
        <AnimatePresence>
          {showDeleteAccount && (
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
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Delete Account?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    This action cannot be undone. All your data including:
                  </p>
                  <ul className="text-left text-sm text-gray-700 mb-6 space-y-2">
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      Personal information and profile
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      Booking history and appointments
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      {profile?.loyalty_points || 0} loyalty points
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      Saved addresses and preferences
                    </li>
                  </ul>
                  <p className="text-gray-800 font-semibold mb-6">
                    will be permanently deleted.
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowDeleteAccount(false)}
                      className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}