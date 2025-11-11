// app/signup/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react'; // ✅ FIXED: Added useCallback
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Phone, User as UserIcon, ArrowLeft, Calendar, Heart, X, AlertCircle, Check, Loader, LogIn, Facebook, Instagram } from 'lucide-react'; // Renamed User import
import { supabase } from '@/lib/supabase';
// ✅ NEW IMPORT: Google Icon from react-icons
import { FcGoogle } from 'react-icons/fc';
import { User } from '@supabase/supabase-js'; // ✅ FIXED: Added Supabase User type

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    dob: '',
    maritalStatus: 'single',
    anniversaryDate: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupMethod, setSignupMethod] = useState<'email' | 'mobile' | 'google'>('email');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [googleUser, setGoogleUser] = useState<User | null>(null); // ✅ FIXED
  const [googleLoading, setGoogleLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push('/');
      }
    };
    checkUser();
  }, [router]);

  // Handle Google user profile after OAuth
  const handleGoogleUserProfile = useCallback(async (user: User) => { // ✅ FIXED
    try {
      // Extract name from Google profile
      const fullName = user.user_metadata?.full_name || '';
      const names = fullName.split(' ');
      const firstName = names[0] || '';
      const lastName = names.slice(1).join(' ') || '';

      // Pre-fill form with Google data
      setFormData(prev => ({
        ...prev,
        firstName,
        lastName,
        email: user.email || prev.email
      }));

      setGoogleUser(user);
      setSignupMethod('google');
      setSuccess('Google account connected! Please complete your profile details below.');
      
      // Auto-proceed to step 2 for Google users
      if (step === 1) {
        setStep(2);
      }
    } catch (error) {
      console.error('Error handling Google profile:', error);
      setError('Failed to load Google profile information.');
    }
  }, [step]); // ✅ FIXED: Added 'step' dependency

  // Check for OAuth callback on component mount
  useEffect(() => {
    const checkOAuthSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const user = session.user;
        if (user.app_metadata?.provider === 'google') {
          await handleGoogleUserProfile(user);
        }
      }
    };

    checkOAuthSession();
  }, [handleGoogleUserProfile]); // ✅ FIXED

  // Password strength checker
  useEffect(() => {
    const password = formData.password;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  }, [formData.password]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const isStep1DataComplete = 
    formData.firstName.trim() && 
    formData.lastName.trim() && 
    formData.email.trim() && 
    formData.password.length >= 6 && 
    formData.password === formData.confirmPassword;

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const showAgeRestrictionModal = () => {
    alert("You must be at least 13 years old to create an account. You will be redirected to the homepage.");
    router.push('/');
  };

  const handleContinueToStep2 = () => {
    setError('');
    if (!formData.firstName.trim()) return setError('First name is required');
    if (!formData.lastName.trim()) return setError('Last name is required');
    if (!/\S+@\S+\.\S+/.test(formData.email)) return setError('Please enter a valid email address');
    if (formData.password.length < 6) return setError('Password must be at least 6 characters long');
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
    setStep(2);
  };

  // Enhanced Google Sign-In Integration
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) throw error;

    } catch (error: unknown) { // ✅ FIXED
      console.error('Google OAuth error:', error);
      let message = 'Google sign-in failed. Please try again.';
      if (error instanceof Error) message = error.message;
      setError(message);
      setGoogleLoading(false);
    }
  };

  // Enhanced submit handler for both manual and Google signup
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Age validation (must be 13 or older)
      if (formData.dob) {
        const age = calculateAge(formData.dob);
        if (age < 13) {
          showAgeRestrictionModal();
          return;
        }
      } else {
        throw new Error('Date of birth is required.');
      }

      let authUser: User;

      if (signupMethod === 'google' && googleUser) {
        // For Google users, we're already authenticated
        authUser = googleUser;
        
        // Update Google user's profile with additional data
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            full_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          }
        });

        if (updateError) {
          console.warn('Failed to update Google user metadata:', updateError);
        }
      } else {
        // For manual signup, create the user in Supabase Auth
        const { data: signUpData, error: authError } = await supabase.auth.signUp({
          email: formData.email.trim(),
          password: formData.password,
          options: {
            data: {
              full_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
            }
          }
        });

        if (authError) {
          throw authError;
        }

        if (!signUpData.user) {
          throw new Error('Failed to create user account. Please try again.');
        }

        authUser = signUpData.user;
      }

      // Prepare profile updates
      const profileUpdates = {
        phone: formData.mobile.trim() || null,
        birthday: formData.dob || null,
        anniversary_date: formData.anniversaryDate || null,
        enable_period_tracker: true,
        signup_method: signupMethod,
        ...(signupMethod === 'google' && {
          // For Google users, ensure name is updated
          full_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`
        })
      };

      // Update or create profile
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: authUser.id,
          email: formData.email.trim(),
          full_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          ...profileUpdates
        }, {
          onConflict: 'id'
        });

      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw new Error(`Failed to save profile details: ${updateError.message}`);
      }

      setSuccess('Account created successfully! Redirecting to your dashboard...');
      
      setTimeout(() => {
        router.push('/');
      }, 2000);

    } catch (error: unknown) { // ✅ FIXED
      console.error('Signup process error:', error);
      let errorMessage = 'An unknown error occurred during signup.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String((error as { message: unknown }).message);
      }

      if (errorMessage.includes('User already registered')) {
        errorMessage = 'An account with this email already exists. Please login instead.';
      } else if (errorMessage.includes('Email not confirmed')) {
        errorMessage = 'Please check your email to confirm your account before proceeding.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = async (provider: 'google' | 'facebook') => {
    try {
      if (provider === 'google') {
        await handleGoogleSignIn();
        return;
      }

      // Facebook OAuth
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
    } catch (error: unknown) { // ✅ FIXED
      let message = `${provider} signup failed`;
      if (error instanceof Error) message = error.message;
      setError(message || `${provider} signup failed`);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Medium';
    return 'Strong';
  };

  // Google account information display
  const renderGoogleAccountInfo = () => {
    if (signupMethod !== 'google' || !googleUser) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
      >
        <div className="flex items-center">
          <LogIn className="w-5 h-5 mr-2" />
          <div>
            <p className="text-sm font-medium text-blue-800">
              Connected with Google
            </p>
            <p className="text-xs text-blue-600">
              {googleUser.email}
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-pink-100"
        >
          {/* Header with Navigation Buttons */}
          <div className="bg-linear-to-r from-pink-500 to-purple-600 p-6 text-center relative">
            <Link 
              href="/login" 
              className="absolute left-4 top-4 text-white hover:text-pink-200 transition-colors"
              title="Go to Login"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <button
              onClick={() => router.push('/')}
              className="absolute right-4 top-4 bg-white/20 hover:bg-white/30 text-white rounded-full p-1 transition-all duration-200 backdrop-blur-sm"
              title="Skip to Home"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex justify-center mb-2">
              <span className="text-4xl">💄</span>
            </div>
            <h1 className="text-3xl font-bold text-white">
              {signupMethod === 'google' ? 'Complete Profile' : 'Create Account'}
            </h1>
            <p className="text-pink-100 mt-2">
              {signupMethod === 'google' 
                ? 'Add your details to complete registration' 
                : 'Join our beauty community'}
            </p>
            
            {/* Progress Indicator */}
            <div className="flex justify-center mt-4">
              <div className="flex space-x-2">
                <div className={`w-3 h-3 rounded-full transition-colors ${step >= 1 ? 'bg-white' : 'bg-white/30'}`}></div>
                <div className={`w-3 h-3 rounded-full transition-colors ${step >= 2 ? 'bg-white' : 'bg-white/30'}`}></div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center"
              >
                <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center"
              >
                <Check className="w-5 h-5 mr-2 shrink-0" />
                <span className="text-sm">{success}</span>
              </motion.div>
            )}

            {renderGoogleAccountInfo()}

            {step === 1 ? (
              <>
                {/* Signup Method Toggle - Hide for Google users */}
                {signupMethod !== 'google' && (
                  <div className="flex bg-pink-50 rounded-lg p-1 mb-6">
                    <button
                      onClick={() => setSignupMethod('email')}
                      className={`flex-1 py-2 text-center rounded-md transition-colors ${
                        signupMethod === 'email' 
                          ? 'bg-white shadow-sm text-pink-600 font-medium' 
                          : 'text-gray-600 hover:text-pink-500'
                      }`}
                    >
                      Email
                    </button>
                    <button
                      onClick={() => setSignupMethod('mobile')}
                      className={`flex-1 py-2 text-center rounded-md transition-colors ${
                        signupMethod === 'mobile' 
                          ? 'bg-white shadow-sm text-pink-600 font-medium' 
                          : 'text-gray-600 hover:text-pink-500'
                      }`}
                    >
                      Mobile
                    </button>
                  </div>
                )}

                {(signupMethod === 'email' || signupMethod === 'google') ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <UserIcon className="h-5 w-5 text-pink-400" />
                          </div>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                            disabled={signupMethod === 'google'}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                            placeholder="First name"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          disabled={signupMethod === 'google'}
                          className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                          placeholder="Last name"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-pink-400" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          disabled={signupMethod === 'google'}
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mobile Number (Optional)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-pink-400" />
                        </div>
                        <input
                          type="tel"
                          name="mobile"
                          value={formData.mobile}
                          onChange={handleInputChange}
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                          placeholder="+91 9876543210"
                        />
                      </div>
                    </div>
                    
                    {/* Password fields - Only show for email signup, not for Google */}
                    {signupMethod === 'email' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Lock className="h-5 w-5 text-pink-400" />
                            </div>
                            <input
                              type={showPassword ? "text" : "password"}
                              name="password"
                              value={formData.password}
                              onChange={handleInputChange}
                              required
                              minLength={6}
                              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                              placeholder="Create a password (min 6 characters)"
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5 text-pink-400 hover:text-pink-600 transition-colors" />
                              ) : (
                                <Eye className="h-5 w-5 text-pink-400 hover:text-pink-600 transition-colors" />
                              )}
                            </button>
                          </div>
                          {formData.password && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">Password strength:</span>
                                <span className={`font-medium ${
                                  passwordStrength <= 2 ? 'text-red-500' : 
                                  passwordStrength <= 3 ? 'text-yellow-500' : 'text-green-500'
                                }`}>
                                  {getPasswordStrengthText()}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                                <div 
                                  className={`h-1 rounded-full transition-all ${getPasswordStrengthColor()}`}
                                  style={{ width: `${(passwordStrength / 5) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Lock className="h-5 w-5 text-pink-400" />
                            </div>
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              required
                              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                              placeholder="Confirm your password"
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5 text-pink-400 hover:text-pink-600 transition-colors" />
                              ) : (
                                <Eye className="h-5 w-5 text-pink-400 hover:text-pink-600 transition-colors" />
                              )}
                            </button>
                          </div>
                          {formData.confirmPassword && formData.password && (
                            <div className="flex items-center mt-1">
                              {formData.password === formData.confirmPassword ? (
                                <div className="flex items-center text-green-600 text-xs">
                                  <Check className="w-3 h-3 mr-1" />
                                  Passwords match
                                </div>
                              ) : (
                                <div className="flex items-center text-red-500 text-xs">
                                  <X className="w-3 h-3 mr-1" />
                                  Passwords don&apos;t match
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                    
                    <button
                      type="button"
                      onClick={handleContinueToStep2}
                      disabled={signupMethod === 'email' ? !isStep1DataComplete : !formData.firstName.trim() || !formData.lastName.trim()}
                      className="w-full bg-linear-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Mobile OTP flow */}
                    <div className="text-center text-gray-500 py-8">
                      Mobile OTP signup coming soon...
                    </div>
                  </div>
                )}
                
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {/* ✅ UPDATED: Using FcGoogle for the Google button */}
                  <button 
                    onClick={() => handleSocialSignup('google')}
                    disabled={googleLoading}
                    className="bg-white border border-gray-300 rounded-lg py-2 px-4 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {googleLoading ? (
                      <Loader className="h-5 w-5 animate-spin" />
                    ) : (
                      <FcGoogle className="h-5 w-5" />
                    )}
                  </button>
                  <button 
                    onClick={() => handleSocialSignup('facebook')}
                    className="bg-blue-600 text-white rounded-lg py-2 px-4 flex items-center justify-center hover:bg-blue-700 transition-colors"
                  >
                    <Facebook className="h-5 w-5" />
                  </button>
                  <button className="bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-lg py-2 px-4 flex items-center justify-center hover:from-purple-700 hover:to-pink-700 transition-colors">
                    <Instagram className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="mt-6 text-center">
                  <p className="text-gray-600">
                    Already have an account?{' '}
                    <Link href="/login" className="font-medium text-pink-600 hover:text-pink-500">
                      Sign in
                    </Link>
                  </p>
                </div>
              </>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-gray-800">Personal Details</h3>
                  <p className="text-sm text-gray-600 mt-1">Help us personalize your experience</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-pink-400" />
                    </div>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                      required
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <p className="text-xs text-pink-600 mt-1">
                    🎂 We&apos;ll send you special birthday offers! (Must be 13+ to register)
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                  <select
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleInputChange}
                    className="block w-full py-3 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                  >
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="engaged">Engaged</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                {(formData.maritalStatus === 'married' || formData.maritalStatus === 'engaged') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {formData.maritalStatus === 'married' ? 'Anniversary Date' : 'Engagement Date'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Heart className="h-5 w-5 text-pink-400" />
                      </div>
                      <input
                        type="date"
                        name="anniversaryDate"
                        value={formData.anniversaryDate}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <p className="text-xs text-pink-600 mt-1">
                      💝 We@apos;ll help you celebrate with special offers!</p>
                  </motion.div>
                )}
                
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-all font-medium"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-linear-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader className="animate-spin inline mr-2" />
                        {signupMethod === 'google' ? 'Completing Profile...' : 'Creating Account...'}
                      </>
                    ) : (
                      signupMethod === 'google' ? 'Complete Profile' : 'Create Account'
                    )}
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 text-center mt-4">
                  By creating an account, you agree to our{' '}
                  <Link href="/terms" className="text-pink-600 hover:text-pink-500">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-pink-600 hover:text-pink-500">Privacy Policy</Link>
                </p>
              </form>
            )}
          </div>
        </motion.div>
        
        {/* Promotional Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 bg-white rounded-2xl shadow-xl p-4 border border-pink-100"
        >
          <div className="flex items-center">
            <div className="bg-pink-100 p-3 rounded-full mr-3">
              <Heart className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Personalized beauty experience</h3>
              <p className="text-sm text-gray-600">Get recommendations based on your preferences</p>
            </div>
          </div>
        </motion.div>
        
        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-4 grid grid-cols-2 gap-4"
        >
          <div className="bg-white rounded-lg p-3 shadow-md border border-pink-50">
            <div className="text-pink-600 text-lg mb-1">💅</div>
            <h4 className="text-sm font-medium text-gray-800">Beauty Tips</h4>
            <p className="text-xs text-gray-600">Daily care routines</p>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-md border border-pink-50">
            <div className="text-pink-600 text-lg mb-1">🎁</div>
            <h4 className="text-sm font-medium text-gray-800">Special Offers</h4>
            <p className="text-xs text-gray-600">Birthday & anniversary deals</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ✅ FIXED: Removed unused GoogleUser interface