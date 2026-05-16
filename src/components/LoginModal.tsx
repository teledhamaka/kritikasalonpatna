// app/components/LoginModal.tsx
"use client";

import { useState, useEffect } from 'react';
import { X, User, Mail, Lock, Phone, Calendar, Heart, Home, Eye, 
  EyeOff, Gift, Star, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
  onSkipToHome?: () => void; // Made optional
}

// This interface should match your 'profiles' table columns exactly
interface UserProfile {
  id?: string;
  full_name: string;
  email: string;
  birthday: string;
  phone: string;
  enable_period_tracker: boolean;
  anniversary_date?: string;
  age?: number;
  theme_style?: string;
  login_count?: number;
  last_login_at?: string;
  created_at?: string;
  updated_at?: string;
}

const LoginModal = ({ isOpen, onClose, onLoginSuccess, onSkipToHome }: LoginModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [enablePeriodTracker, setEnablePeriodTracker] = useState(true);
  const [anniversaryDate, setAnniversaryDate] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAgeWarning, setShowAgeWarning] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [showWelcomeBonus, setShowWelcomeBonus] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Use the auth context
  const { signIn, signUp, loading } = useAuth();

  // Reset form when switching between login/signup or closing
  useEffect(() => {
    setError('');
    if (!isOpen) {
      // Reset all fields when modal closes
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setBirthday('');
      setAnniversaryDate('');
      setFormStep(1);
      setShowPassword(false);
      setIsLogin(true); // Default to login view when reopened
    }
  }, [isOpen]);

  // Email validation
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsEmailValid(emailRegex.test(email));
  }, [email]);

  // Password strength calculation
  useEffect(() => {
    if (!isLogin) {
      let strength = 0;
      if (password.length >= 8) strength += 25;
      if (/[A-Z]/.test(password)) strength += 25;
      if (/[0-9]/.test(password)) strength += 25;
      if (/[^A-Za-z0-9]/.test(password)) strength += 25;
      setPasswordStrength(strength);
    }
  }, [password, isLogin]);

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!isLogin) {
        // --- Signup Flow ---
        if (formStep === 1) {
          if (!name || !email || !password) {
            setError('Please fill in your name, email, and password.');
            setIsLoading(false);
            return;
          }

          if (!isEmailValid) {
            setError('Please enter a valid email address.');
            setIsLoading(false);
            return;
          }

          if (passwordStrength < 50) {
            setError('Please choose a stronger password.');
            setIsLoading(false);
            return;
          }

          setFormStep(2);
          
        } else if (formStep === 2) {
          if (!birthday || !phone) {
            setError('Please provide your birthday and phone number.');
            setIsLoading(false);
            return;
          }

          const age = calculateAge(birthday);
          if (age < 13) {
            setShowAgeWarning(true);
            setIsLoading(false);
            return;
          }

          const nameParts = name.trim().split(' ').filter(Boolean);
          const firstName = nameParts[0] ?? '';
          const lastName = nameParts.slice(1).join(' ');

          const result = await signUp({
            email,
            password,
            firstName,
            lastName,
          });

          if (result.error) {
            setError(result.error);
          } else {
            setShowWelcomeBonus(true);
            setTimeout(() => {
              setShowWelcomeBonus(false);
              onLoginSuccess();
            }, 3000);
          }
        }
      } else {
        // --- Login Flow ---
        const result = await signIn(email, password);
        
        if (result.error) {
          setError(result.error);
        } else {
          onLoginSuccess();
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgeWarningClose = () => {
    setShowAgeWarning(false);
    if (onSkipToHome) {
      onSkipToHome();
    } else {
      onClose();
    }
  };
  
  const handleSwitchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormStep(1);
    // Do not reset fields here, user might want to switch back with filled data
  };

  const handleSkipToHome = () => {
    if (onSkipToHome) {
      onSkipToHome();
    } else {
      onClose(); // Fallback to close if onSkipToHome is not provided
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 50) return 'bg-yellow-400';
    if (passwordStrength < 75) return 'bg-blue-400';
    return 'bg-green-400';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return 'Weak';
    if (passwordStrength < 50) return 'Fair';
    if (passwordStrength < 75) return 'Good';
    return 'Strong';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Welcome Bonus Popup */}
      {showWelcomeBonus && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-70">
          <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center animate-pulse">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-pink-600 mb-2">Welcome Bonus!</h3>
            <p className="text-gray-700 mb-4">
              Congratulations! You've earned a 20% discount on your first service!
            </p>
            <div className="inline-flex items-center bg-pink-100 text-pink-800 px-4 py-2 rounded-full">
              <Gift className="mr-2" />
              <span className="font-semibold">Code: WELCOME20</span>
            </div>
          </div>
        </div>
      )}

      {/* Age Warning Popup */}
      {showAgeWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-60">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-pink-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Age Restriction</h3>
              <p className="text-gray-600 mb-4">
                Sorry! You must be at least 13 years old to create an account. 
                Please enjoy our services with parental guidance.
              </p>
              <button
                onClick={handleAgeWarningClose}
                className="w-full bg-pink-600 text-white py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl w-full max-w-md relative overflow-hidden shadow-xl">
        {/* Header with Close and Skip buttons */}
        <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-pink-50 to-purple-50">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          {onSkipToHome && (
            <button
              onClick={handleSkipToHome}
              className="flex items-center text-pink-600 hover:text-pink-700 font-medium transition-colors"
            >
              Skip to Home
              <Home className="w-4 h-4 ml-1" />
            </button>
          )}
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Heart className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {isLogin ? 'Welcome Back, Beautiful!' : 'Join Our Beauty Family'}
            </h2>
            <p className="text-gray-600 mt-2">
              {isLogin 
                ? 'Continue your glow-up journey with us' 
                : formStep === 1 
                  ? 'Create your personalized beauty profile' 
                  : 'Tell us more about yourself'
              }
            </p>
            {!isLogin && (
              <div className="flex justify-center mt-4 space-x-2">
                <div className={`w-3 h-3 rounded-full transition-colors ${formStep === 1 ? 'bg-pink-500' : 'bg-pink-200'}`}></div>
                <div className={`w-3 h-3 rounded-full transition-colors ${formStep === 2 ? 'bg-pink-500' : 'bg-pink-200'}`}></div>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 flex items-center">
              <Heart className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Login Form */}
            {isLogin && (
              <>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    required
                  />
                  {email && (
                    <div className="absolute right-3 top-3.5">
                      {isEmailValid ? <Check className="text-green-500" /> : <div className="w-2 h-2 bg-red-400 rounded-full"></div>}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </>
            )}

            {/* Signup Form - Step 1 */}
            {!isLogin && formStep === 1 && (
              <>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Your beautiful name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    required
                  />
                  {email && (
                    <div className="absolute right-3 top-3.5">
                      {isEmailValid ? <Check className="text-green-500" /> : <div className="w-2 h-2 bg-red-400 rounded-full"></div>}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>

                {password && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Password strength:</span>
                      <span className={`font-medium ${passwordStrength < 50 ? 'text-red-500' : 'text-green-500'}`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${passwordStrength}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Signup Form - Step 2 */}
            {!isLogin && formStep === 2 && (
              <>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="Your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-gray-700"
                    required
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="date"
                    value={anniversaryDate}
                    onChange={(e) => setAnniversaryDate(e.target.value)}
                    placeholder="Anniversary (Optional)"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-gray-700"
                  />
                </div>
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-xl border border-pink-100">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="periodTracker"
                      checked={enablePeriodTracker}
                      onChange={(e) => setEnablePeriodTracker(e.target.checked)}
                      className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500 mt-1"
                    />
                    <div>
                      <label htmlFor="periodTracker" className="text-sm font-medium text-gray-700 flex items-center">
                        <Heart className="w-4 h-4 text-pink-500 mr-1.5" />
                        Personalized Beauty Calendar
                      </label>
                      <p className="text-xs text-gray-600 mt-1">
                        Enable cycle-based recommendations for skincare and wellness.
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormStep(1)}
                  className="text-pink-600 hover:text-pink-700 text-sm font-medium"
                >
                  ← Back
                </button>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading || loading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center shadow-lg"
            >
              {(isLoading || loading) ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Please wait...
                </>
              ) : (
                isLogin 
                  ? 'Sign In' 
                  : formStep === 1 
                    ? 'Continue' 
                    : 'Create My Beauty Account'
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <button onClick={handleSwitchMode} className="text-pink-600 hover:text-pink-700 font-medium transition-colors">
              {isLogin ? "New here? Create account" : 'Already part of our family? Sign in'}
            </button>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-50 to-pink-50 p-3 text-center border-t">
          <div className="flex items-center justify-center text-xs text-gray-600">
            <Star className="w-3 h-3 mr-1.5 text-yellow-500" />
            <span className="font-medium">Beauty Tip:</span>
            <span className="ml-1">Drink water for glowing skin!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;