// app/login/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiEye, FiEyeOff, FiMail, FiLock, FiX, FiArrowLeft, FiHeart, 
  FiAlertCircle, FiCheck, FiLoader } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
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

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push('');
      }
    };
    checkUser();
  }, [router]);

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
          setError('Invalid email or password. Don&apos;t have an account? We&apos;ll redirect you to sign up!');
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
      if (error) {
        setLoading(false);
      }
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    setError('');
    try {
      const { error: socialError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}`
        }
      });
      if (socialError) throw socialError;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : `${provider} login failed`;
      setError(errorMessage);
      setLoading(false);
    }
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
              href="/" 
              className="absolute left-4 top-4 text-white hover:text-pink-200 transition-colors"
              title="Go Back"
            >
              <FiArrowLeft className="w-6 h-6" />
            </Link>
             <button
              onClick={() => router.push('/')}
              className="absolute right-4 top-4 bg-white/20 hover:bg-white/30 text-white rounded-full p-1 transition-all duration-200 backdrop-blur-sm"
              title="Skip to Home"
            >
              <FiX className="w-4 h-4" />
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
                <FiAlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center"
              >
                <FiCheck className="w-5 h-5 mr-2 flex-shrink-0" />
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
                      <FiMail className="h-5 w-5 text-pink-400" />
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
                      <FiLock className="h-5 w-5 text-pink-400" />
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
                        <FiEyeOff className="h-5 w-5 text-pink-400 hover:text-pink-600 transition-colors" />
                      ) : (
                        <FiEye className="h-5 w-5 text-pink-400 hover:text-pink-600 transition-colors" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                   <div className="flex items-center">
                     {/* Remember me functionality can be added here */}
                   </div>
                  <div className="text-sm">
                    <Link href="/forgot-password" className="font-medium text-pink-600 hover:text-pink-500">
                      Forgot password?
                    </Link>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading && <FiLoader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />}
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
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all font-medium"
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
              <button 
                onClick={() => handleSocialLogin('google')}
                className="bg-white border border-gray-300 rounded-lg py-2 px-4 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <FcGoogle className="h-5 w-5" />
              </button>
              <button 
                onClick={() => handleSocialLogin('facebook')}
                className="bg-blue-600 text-white rounded-lg py-2 px-4 flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <FaFacebook className="h-5 w-5" />
              </button>
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg py-2 px-4 flex items-center justify-center hover:from-purple-700 hover:to-pink-700 transition-colors">
                <FaInstagram className="h-5 w-5" />
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
              <FiHeart className="h-6 w-6 text-pink-600" />
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