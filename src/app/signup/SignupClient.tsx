// ==========================================
// FILE: app/signup/SignupClient.tsx (Client Component - NEW FILE)
// ==========================================
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Eye, EyeOff, Mail, Lock, Phone, User as UserIcon, 
  ArrowLeft, Calendar, Heart, X, AlertCircle, Check, 
  Loader, Facebook, Instagram 
} from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '@/context/AuthContext';

export default function SignupClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp, signInWithGoogle, isLoggedIn } = useAuth();
  
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
  const [signupMethod, setSignupMethod] = useState<'email' | 'mobile'>('email');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Check for OAuth errors or success
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError('Authentication failed. Please try again.');
    }

    const loginSuccess = searchParams.get('login');
    if (loginSuccess === 'success') {
      setSuccess('Successfully signed up with Google!');
      setTimeout(() => router.push('/'), 1500);
    }
  }, [searchParams, router]);

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      router.push('/');
    }
  }, [isLoggedIn, router]);

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

  const handleContinueToStep2 = () => {
    setError('');
    if (!formData.firstName.trim()) return setError('First name is required');
    if (!formData.lastName.trim()) return setError('Last name is required');
    if (!/\S+@\S+\.\S+/.test(formData.email)) return setError('Please enter a valid email address');
    if (formData.password.length < 6) return setError('Password must be at least 6 characters long');
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
    setStep(2);
  };

  const handleGoogleSignup = () => {
    setError('');
    setLoading(true);
    signInWithGoogle();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (formData.dob) {
        const age = calculateAge(formData.dob);
        if (age < 13) {
          setError('You must be at least 13 years old to create an account.');
          setLoading(false);
          return;
        }
      } else {
        throw new Error('Date of birth is required.');
      }

      const signupData = {
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        mobile: formData.mobile.trim(),
        dob: formData.dob,
        maritalStatus: formData.maritalStatus,
        anniversaryDate: formData.anniversaryDate,
      };

      const { error: signupError, user } = await signUp(signupData);

      if (signupError) {
        setError(signupError);
        return;
      }

      if (user) {
        setSuccess('Account created successfully! Redirecting...');
        setTimeout(() => router.push('/'), 2000);
      }
    } catch (error: unknown) {
      console.error('Signup process error:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unknown error occurred during signup.';
      setError(errorMessage);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-pink-100"
        >
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-center relative">
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
            <h1 className="text-3xl font-bold text-white">Create Account</h1>
            <p className="text-pink-100 mt-2">Join our beauty community</p>
            
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

            {step === 1 ? (
              <>
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

                {signupMethod === 'email' ? (
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
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
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
                          className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
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
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
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
                    
                    <button
                      type="button"
                      onClick={handleContinueToStep2}
                      disabled={!isStep1DataComplete}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
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
                  <button 
                    onClick={handleGoogleSignup}
                    disabled={loading}
                    className="bg-white border border-gray-300 rounded-lg py-2 px-4 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader className="h-5 w-5 animate-spin" />
                    ) : (
                      <FcGoogle className="h-5 w-5" />
                    )}
                  </button>
                  <button className="bg-blue-600 text-white rounded-lg py-2 px-4 flex items-center justify-center hover:bg-blue-700 transition-colors">
                    <Facebook className="h-5 w-5" />
                  </button>
                  <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg py-2 px-4 flex items-center justify-center hover:from-purple-700 hover:to-pink-700 transition-colors">
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
                      💍 We&apos;ll help you celebrate with special offers!
                    </p>
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
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader className="animate-spin inline mr-2" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
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