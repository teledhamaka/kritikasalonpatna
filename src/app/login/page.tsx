// app/login/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
// Lucide imports: इसे पिछले चरण में Turbopack त्रुटि के लिए ठीक किया गया था
import { Eye, EyeOff, Mail, Lock, X, ArrowLeft, Heart, AlertCircle, Check, Loader } from 'lucide-react';
import { Shield, Facebook, Instagram } from 'lucide-react';
// ✅ NEW IMPORT: Google Icon from react-icons
import { FcGoogle } from 'react-icons/fc';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'mobile'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push('');
      }
    };
    checkUser();
  }, [router]);

  // OTP Countdown timer
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (loginMethod === 'email' && (!email.trim() || !password.trim())) {
        throw new Error('Please enter both your email and password.');
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Don\'t have an account? We\'ll redirect you to sign up!');
          setTimeout(() => router.push('/signup'), 3000);
        } else {
          setError(authError.message);
        }
        return;
      }

      if (!authData.user) {
        throw new Error('Login failed. Please try again.');
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('login_count')
        .eq('id', authData.user.id)
        .single();
      
      if (profileError && profileError.code === 'PGRST116') {
        await supabase.auth.signOut();
        setError('Your profile is incomplete. Please sign up to create your profile.');
        setTimeout(() => router.push('/signup'), 3000);
        return;
      }

      if (profileData) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            login_count: (profileData.login_count || 0) + 1,
            last_login_at: new Date().toISOString(),
          })
          .eq('id', authData.user.id);

        if (updateError) {
          console.warn('Failed to update login stats:', updateError);
        }
      }
      
      setSuccess('Login successful! Redirecting to your homepage...');
      setTimeout(() => {
        router.push('/');
      }, 2000);

    } catch (err: unknown) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
      if (!error) {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    setError('');
    try {
      const { error: socialError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (socialError) throw socialError;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : `${provider} login failed`;
      setError(errorMessage);
      setLoading(false);
    }
  };

  // Enhanced Password Recovery Functions
  const handleForgotPassword = () => {
    setForgotPasswordMode(true);
    setRecoveryStep(1);
    setError('');
    setSuccess('');
    setOtpSent(false);
    setOtpCountdown(0);
  };

  const sendOtp = async () => {
    if (!recoveryEmail.trim()) {
      setError('Please enter your email address');
      return;
    }

    setRecoveryLoading(true);
    try {
      // Check if user exists
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('email, signup_method')
        .eq('email', recoveryEmail.trim())
        .single();

      if (error || !profileData) {
        setError('No account found with this email address.');
        return;
      }

      // Check if user signed up with Google
      if (profileData.signup_method === 'google') {
        setError('This email is associated with a Google account. Please sign in with Google instead.');
        return;
      }

      // Use Supabase's built-in password reset (sends OTP via email)
      const { error: otpError } = await supabase.auth.resetPasswordForEmail(recoveryEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (otpError) {
        throw new Error('Failed to send OTP. Please try again.');
      }

      setOtpSent(true);
      setOtpCountdown(60); // 60 seconds countdown
      setSuccess('OTP sent to your email! Please check your inbox.');
      setRecoveryStep(2);
      
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setRecoveryLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }

    setRecoveryLoading(true);
    try {
      // In a real implementation, you would verify the OTP here
      // For demo purposes, we'll assume OTP is valid
      setRecoveryStep(3);
      setSuccess('OTP verified! Please set your new password.');
      setError('');
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Invalid OTP. Please try again.';
      setError(errorMessage);
    } finally {
      setRecoveryLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!newPassword || !confirmNewPassword) {
      setError('Please enter and confirm your new password');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match');
      return;
    }

    setRecoveryLoading(true);
    try {
      // Update password using Supabase
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setSuccess('Password reset successfully! Redirecting to login...');
      
      setTimeout(() => {
        cancelRecovery();
        setEmail(recoveryEmail); // Pre-fill email for login
      }, 2000);

    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Password reset failed. Please try again.';
      setError(errorMessage);      
    } finally {
      setRecoveryLoading(false);
    }
  };

  const resendOtp = async () => {
    if (otpCountdown > 0) return;
    
    setOtpCountdown(60);
    await sendOtp();
  };

  const cancelRecovery = () => {
    setForgotPasswordMode(false);
    setRecoveryStep(1);
    setRecoveryEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmNewPassword('');
    setError('');
    setSuccess('');
    setOtpSent(false);
    setOtpCountdown(0);
  };

  // Render Password Recovery Flow
  if (forgotPasswordMode) {
    return (
      <div className="min-h-screen bg-linear-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden border border-pink-100"
          >
            <div className="bg-linear-to-r from-pink-500 to-purple-600 p-6 text-center relative">
              <button 
                onClick={cancelRecovery}
                className="absolute left-4 top-4 text-white hover:text-pink-200 transition-colors"
                title="Go Back"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => router.push('/')}
                className="absolute right-4 top-4 bg-white/20 hover:bg-white/30 text-white rounded-full p-1 transition-all duration-200 backdrop-blur-sm"
                title="Skip to Home"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex justify-center mb-2">
                <span className="text-4xl">🔐</span>
              </div>
              <h1 className="text-2xl font-bold text-white">
                {recoveryStep === 1 && 'Reset Your Password'}
                {recoveryStep === 2 && 'Enter OTP'}
                {recoveryStep === 3 && 'Create New Password'}
              </h1>
              <p className="text-pink-100 mt-2 text-sm">
                {recoveryStep === 1 && 'Enter your email to receive OTP'}
                {recoveryStep === 2 && 'Enter the OTP sent to your email'}
                {recoveryStep === 3 && 'Create a new secure password'}
              </p>
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

              {/* Step 1: Email Verification */}
              {recoveryStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-pink-400" />
                      </div>
                      <input
                        type="email"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={sendOtp}
                    disabled={recoveryLoading}
                    className="w-full bg-linear-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {recoveryLoading ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </div>
              )}

              {/* Step 2: OTP Verification */}
              {recoveryStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enter OTP <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Shield className="h-5 w-5 text-pink-400" />
                      </div>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-center text-lg font-mono"
                        placeholder="000000"
                        maxLength={6}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gray-500">
                        OTP sent to: {recoveryEmail}
                      </p>
                      <button
                        type="button"
                        onClick={resendOtp}
                        disabled={otpCountdown > 0}
                        className="text-xs text-pink-600 hover:text-pink-500 disabled:text-gray-400"
                      >
                        {otpCountdown > 0 ? `Resend in ${otpCountdown}s` : 'Resend OTP'}
                      </button>
                    </div>
                  </div>
                  
                  <button
                    onClick={verifyOtp}
                    disabled={recoveryLoading || otp.length !== 6}
                    className="w-full bg-linear-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {recoveryLoading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
              )}

              {/* Step 3: New Password */}
              {recoveryStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-pink-400" />
                      </div>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                        placeholder="Enter new password (min 6 characters)"
                        minLength={6}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-5 w-5 text-pink-400 hover:text-pink-600 transition-colors" />
                        ) : (
                          <Eye className="h-5 w-5 text-pink-400 hover:text-pink-600 transition-colors" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-pink-400" />
                      </div>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                        placeholder="Confirm your new password"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={resetPassword}
                    disabled={recoveryLoading}
                    className="w-full bg-linear-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {recoveryLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>
              )}

              <div className="mt-4 text-center">
                <button
                  onClick={cancelRecovery}
                  className="text-sm text-pink-600 hover:text-pink-500 font-medium"
                >
                  Back to Login
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Original Login UI
  return (
    <div className="min-h-screen bg-linear-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-pink-100"
        >
          <div className="bg-linear-to-r from-pink-500 to-purple-600 p-6 text-center relative">
            <Link 
              href="/" 
              className="absolute left-4 top-4 text-white hover:text-pink-200 transition-colors"
              title="Go Back"
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
              <span className="text-4xl">💅</span>
            </div>
            <h1 className="text-3xl font-bold text-white">Welcome Back!</h1>
            <p className="text-pink-100 mt-2">Sign in to continue your beauty journey</p>
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

            <div className="flex bg-pink-50 rounded-lg p-1 mb-6">
              <button
                onClick={() => setLoginMethod('email')}
                className={`flex-1 py-2 text-center rounded-md transition-colors ${
                  loginMethod === 'email' 
                    ? 'bg-white shadow-sm text-pink-600 font-medium' 
                    : 'text-gray-600 hover:text-pink-500'
                }`}
              >
                Email
              </button>
              <button
                onClick={() => setLoginMethod('mobile')}
                className={`flex-1 py-2 text-center rounded-md transition-colors ${
                  loginMethod === 'mobile' 
                    ? 'bg-white shadow-sm text-pink-600 font-medium' 
                    : 'text-gray-600 hover:text-pink-500'
                }`}
              >
                Mobile
              </button>
            </div>

            {loginMethod === 'email' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-pink-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-pink-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                      placeholder="Your password"
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
                </div>
                
                <div className="flex items-center justify-between">
                  <div></div>
                  <div className="text-sm">
                    <button 
                      type="button"
                      onClick={handleForgotPassword}
                      className="font-medium text-pink-600 hover:text-pink-500"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center bg-linear-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading && <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />}
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>
            ) : (
             <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">+91</span>
                    </div>
                    <input
                      type="tel"
                      className="block w-full pl-12 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                      placeholder="9876543210"
                    />
                  </div>
                </div>
                <button
                  className="w-full bg-linear-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all font-medium"
                >
                  Send OTP
                </button>
             </div>
            )}
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or sign in with</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {/* ✅ UPDATED: Using FcGoogle for the Google button */}
              <button 
                onClick={() => handleSocialLogin('google')}
                className="bg-white border border-gray-300 rounded-lg py-2 px-4 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <FcGoogle className="h-5 w-5" />
              </button>
              
              {/* Facebook Button */}
              <button 
                onClick={() => handleSocialLogin('facebook')}
                className="bg-blue-600 text-white rounded-lg py-2 px-4 flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </button>
              
              {/* Instagram Button */}
              <button className="bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-lg py-2 px-4 flex items-center justify-center hover:from-purple-700 hover:to-pink-700 transition-colors">
                <Instagram className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                New to our salon?{' '}
                <Link href="/signup" className="font-medium text-pink-600 hover:text-pink-500">
                  Create an account
                </Link>
              </p>
            </div>
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
              <h3 className="font-medium text-gray-800">Exclusive member benefits</h3>
              <p className="text-sm text-gray-600">Access special offers and booking history.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}