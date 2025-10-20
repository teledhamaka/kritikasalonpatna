"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft, FiGift, FiTrendingUp, FiCopy, FiShare2,
  FiCheck, FiLoader, FiAward, FiUsers, FiClock,
  FiInstagram, FiTwitter, FiMessageCircle, FiMail,
  FiX, FiExternalLink
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface LoyaltyTier {
  id: string;
  name: string;
  display_name: string;
  icon: string;
  color: string;
  min_points: number;
  max_points: number | null;
  discount_percentage: number;
  points_multiplier: number;
  birthday_bonus_points?: number;
  perks: string[];
  tier_order: number;
}

interface Transaction {
  id: string;
  transaction_type: string;
  points: number;
  description: string;
  related_amount?: number;
  created_at: string;
  expiry_date?: string;
  social_share_bonus: boolean;
  referral_bonus: boolean;
}

interface Referral {
  id: string;
  referral_code: string;
  referred_email?: string;
  referred_name?: string;
  status: string;
  referrer_points_awarded: number;
  created_at: string;
  referred_signup_at?: string;
  first_booking_completed_at?: string;
}

interface Reward {
  id: string;
  name: string;
  points_required: number;
  discount_amount: number;
  description: string;
  icon: string;
}

export default function LoyaltyPage() {
  const router = useRouter();
  const { user, profile, isLoggedIn, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'tiers' | 'rewards' | 'transactions' | 'referrals'>('overview');
  const [tiers, setTiers] = useState<LoyaltyTier[]>([]);
  const [currentTier, setCurrentTier] = useState<LoyaltyTier | null>(null);
  const [nextTier, setNextTier] = useState<LoyaltyTier | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [userReferralCode, setUserReferralCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const rewards: Reward[] = [
    {
      id: '1',
      name: '₹500 Off',
      points_required: 500,
      discount_amount: 500,
      description: 'Get ₹500 off on your next booking',
      icon: '💰'
    },
    {
      id: '2',
      name: 'Free Facial',
      points_required: 1000,
      discount_amount: 1500,
      description: 'Complimentary facial treatment',
      icon: '✨'
    },
    {
      id: '3',
      name: '₹2000 Off Premium',
      points_required: 2000,
      discount_amount: 2000,
      description: 'Premium package discount',
      icon: '🎁'
    },
    {
      id: '4',
      name: 'VIP Experience',
      points_required: 5000,
      discount_amount: 5000,
      description: 'Full VIP treatment package',
      icon: '👑'
    }
  ];

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    } else {
      fetchLoyaltyData();
    }
  }, [isLoggedIn]);

  const fetchLoyaltyData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch tiers
      const { data: tiersData } = await supabase
        .from('loyalty_tiers')
        .select('*')
        .order('tier_order', { ascending: true });

      if (tiersData) {
        setTiers(tiersData);
        
        // Determine current and next tier
        const userPoints = profile?.loyalty_points || 0;
        const current = tiersData.find(t => 
          userPoints >= t.min_points && (t.max_points === null || userPoints <= t.max_points)
        );
        setCurrentTier(current || tiersData[0]);

        const next = tiersData.find(t => t.min_points > userPoints);
        setNextTier(next || null);
      }

      // Fetch transactions
      const { data: transactionsData } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (transactionsData) {
        setTransactions(transactionsData);
      }

      // Fetch referrals
      const { data: referralsData } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_user_id', user.id)
        .order('created_at', { ascending: false });

      if (referralsData) {
        setReferrals(referralsData);
        if (referralsData.length > 0) {
          setUserReferralCode(referralsData[0].referral_code);
        }
      } else {
        // Create referral code if doesn't exist
        await createReferralCode();
      }
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createReferralCode = async () => {
    if (!user || !profile) return;

    try {
      const { data, error } = await supabase.rpc('generate_referral_code');
      
      if (!error && data) {
        const { error: insertError } = await supabase
          .from('referrals')
          .insert({
            referrer_user_id: user.id,
            referral_code: data,
            status: 'pending'
          });

        if (!insertError) {
          setUserReferralCode(data);
        }
      }
    } catch (error) {
      console.error('Error creating referral code:', error);
    }
  };

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(userReferralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareReferral = async (platform: string) => {
    const shareUrl = `${window.location.origin}/signup?ref=${userReferralCode}`;
    const shareText = `Join SALONIC with my referral code ${userReferralCode} and get 200 bonus points on your first booking! 💄✨`;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
        break;
      case 'instagram':
        navigator.clipboard.writeText(shareText + ' ' + shareUrl);
        alert('Referral message copied! Share it on Instagram.');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent('Join SALONIC')}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
        break;
      default:
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRedeemReward = async (reward: Reward) => {
    if (!user || !profile || profile.loyalty_points < reward.points_required) return;

    setRedeeming(reward.id);
    try {
      const { error } = await supabase
        .from('reward_redemptions')
        .insert({
          user_id: user.id,
          reward_type: 'discount',
          reward_name: reward.name,
          points_redeemed: reward.points_required,
          discount_amount: reward.discount_amount,
          status: 'active',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        });

      if (!error) {
        // Update user points
        await supabase
          .from('profiles')
          .update({ 
            loyalty_points: profile.loyalty_points - reward.points_required,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        // Create transaction
        await supabase
          .from('loyalty_transactions')
          .insert({
            user_id: user.id,
            transaction_type: 'redeemed',
            points: -reward.points_required,
            description: `Redeemed: ${reward.name}`,
            related_amount: reward.discount_amount
          });

        await refreshProfile();
        await fetchLoyaltyData();
        alert(`Successfully redeemed ${reward.name}! Check your rewards in the cart.`);
      }
    } catch (error) {
      console.error('Error redeeming reward:', error);
      alert('Failed to redeem reward. Please try again.');
    } finally {
      setRedeeming(null);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned': return '💰';
      case 'redeemed': return '🎁';
      case 'expired': return '⏰';
      case 'bonus': return '🎉';
      case 'social_bonus': return '📱';
      case 'referral_bonus': return '👥';
      default: return '✨';
    }
  };

  const getReferralStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'signed_up': return 'bg-blue-100 text-blue-700';
      case 'first_booking': return 'bg-purple-100 text-purple-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'expired': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const pointsToNextTier = nextTier ? nextTier.min_points - (profile?.loyalty_points || 0) : 0;
  const progressPercentage = currentTier && nextTier
    ? ((profile?.loyalty_points || 0) - currentTier.min_points) / (nextTier.min_points - currentTier.min_points) * 100
    : 100;

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
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <FiGift className="w-6 h-6 mr-2 text-pink-500" />
                Loyalty & Rewards
              </h1>
              <p className="text-sm text-gray-600">Earn points, unlock rewards, and enjoy exclusive benefits</p>
            </div>
          </div>
        </div>

        {/* Points Overview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-pink-500 via-purple-500 to-pink-600 rounded-2xl shadow-xl overflow-hidden mb-6"
        >
          <div className="p-6 text-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-sm opacity-90 mb-1">Your Points Balance</div>
                <div className="text-5xl font-bold">{profile?.loyalty_points || 0}</div>
                <div className="text-sm opacity-90 mt-1">
                  ≈ ₹{Math.floor((profile?.loyalty_points || 0) / 10)} in rewards
                </div>
              </div>
              <div className="text-right">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-4xl backdrop-blur-sm">
                  {currentTier?.icon || '🥉'}
                </div>
                <div className="text-sm font-medium mt-2">{currentTier?.display_name || 'Bronze'}</div>
              </div>
            </div>

            {nextTier && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="opacity-90">Progress to {nextTier.display_name}</span>
                  <span className="font-medium">{pointsToNextTier} points to go</span>
                </div>
                <div className="w-full bg-white bg-opacity-20 rounded-full h-3 overflow-hidden backdrop-blur-sm">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-white rounded-full shadow-lg"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-px bg-white bg-opacity-20">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm p-4 text-center">
              <div className="text-2xl font-bold text-white">{profile?.total_bookings || 0}</div>
              <div className="text-xs text-white opacity-90">Total Bookings</div>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm p-4 text-center">
              <div className="text-2xl font-bold text-white">{profile?.total_referrals || 0}</div>
              <div className="text-xs text-white opacity-90">Referrals</div>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm p-4 text-center">
              <div className="text-2xl font-bold text-white">{currentTier?.discount_percentage || 0}%</div>
              <div className="text-xs text-white opacity-90">Discount Rate</div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-pink-100 mb-6">
          <div className="flex overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: FiTrendingUp },
              { id: 'tiers', label: 'Tiers', icon: FiAward },
              { id: 'rewards', label: 'Rewards', icon: FiGift },
              { id: 'transactions', label: 'History', icon: FiClock },
              { id: 'referrals', label: 'Referrals', icon: FiUsers }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                  activeTab === id
                    ? 'text-pink-600 border-b-2 border-pink-500 bg-pink-50'
                    : 'text-gray-600 hover:text-pink-500 hover:bg-pink-50'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <FiUsers className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Refer Friends</h3>
                      <p className="text-sm text-gray-600">Earn 500 points per referral</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-medium"
                  >
                    Share Referral Code
                  </button>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mr-3">
                      <FiShare2 className="w-6 h-6 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Social Media Bonus</h3>
                      <p className="text-sm text-gray-600">Share & earn 50 points</p>
                    </div>
                  </div>
                  <button className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all font-medium">
                    Share on Social Media
                  </button>
                </div>
              </div>

              {/* Ways to Earn */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Ways to Earn Points</h3>
                <div className="space-y-3">
                  {[
                    { action: 'Complete a booking', points: '100-500', icon: '📅' },
                    { action: 'Refer a friend', points: '500', icon: '👥' },
                    { action: 'Write a review', points: '50', icon: '⭐' },
                    { action: 'Share on social media', points: '50', icon: '📱' },
                    { action: 'Birthday month bonus', points: currentTier?.birthday_bonus_points || '100', icon: '🎂' },
                    { action: 'Complete 5 bookings (streak)', points: '200', icon: '🔥' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{item.icon}</span>
                        <span className="text-gray-700">{item.action}</span>
                      </div>
                      <span className="font-semibold text-pink-600">+{item.points} pts</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
                {transactions.slice(0, 5).length > 0 ? (
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((txn) => (
                      <div key={txn.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{getTransactionIcon(txn.transaction_type)}</span>
                          <div>
                            <div className="font-medium text-gray-800">{txn.description}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(txn.created_at).toLocaleDateString('en-IN')}
                            </div>
                          </div>
                        </div>
                        <span className={`font-semibold ${txn.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {txn.points > 0 ? '+' : ''}{txn.points} pts
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-4">No recent activity</p>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'tiers' && (
            <motion.div
              key="tiers"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Current Tier</h3>
                <p className="text-gray-600 mb-4">
                  Unlock higher tiers by earning more points. Each tier comes with exclusive benefits and higher rewards!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tiers.map((tier) => {
                  const isCurrent = tier.id === currentTier?.id;
                  const isUnlocked = (profile?.loyalty_points || 0) >= tier.min_points;

                  return (
                    <motion.div
                      key={tier.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`relative rounded-xl p-6 shadow-lg border-2 ${
                        isCurrent
                          ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50'
                          : isUnlocked
                          ? 'border-green-200 bg-white'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      {isCurrent && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="px-4 py-1 bg-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
                            CURRENT TIER
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <span className="text-4xl mr-3">{tier.icon}</span>
                          <div>
                            <h3 className="text-xl font-bold" style={{ color: tier.color }}>
                              {tier.display_name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {tier.min_points.toLocaleString()} - {tier.max_points?.toLocaleString() || '∞'} points
                            </p>
                          </div>
                        </div>
                        {isUnlocked && (
                          <FiCheck className="w-6 h-6 text-green-500" />
                        )}
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                          <span className="text-sm text-gray-700">Discount</span>
                          <span className="font-semibold text-pink-600">{tier.discount_percentage}%</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                          <span className="text-sm text-gray-700">Points Multiplier</span>
                          <span className="font-semibold text-purple-600">{tier.points_multiplier}x</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2 text-sm">Perks & Benefits:</h4>
                        <ul className="space-y-1">
                          {tier.perks.map((perk, idx) => (
                            <li key={idx} className="flex items-start text-sm text-gray-700">
                              <FiCheck className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span>{perk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === 'rewards' && (
            <motion.div
              key="rewards"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Available Rewards</h3>
                <p className="text-gray-600">
                  Redeem your points for exclusive discounts and rewards. Redeemed rewards are valid for 30 days.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rewards.map((reward) => {
                  const canRedeem = (profile?.loyalty_points || 0) >= reward.points_required;
                  const isRedeeming = redeeming === reward.id;

                  return (
                    <motion.div
                      key={reward.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`bg-white rounded-xl p-6 shadow-lg border-2 ${
                        canRedeem ? 'border-pink-200' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <span className="text-5xl mr-4">{reward.icon}</span>
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">{reward.name}</h3>
                            <p className="text-sm text-gray-600">{reward.description}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Points Required</span>
                        <span className="text-lg font-bold text-pink-600">
                          {reward.points_required.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-4 p-3 bg-green-50 rounded-lg">
                        <span className="text-sm text-gray-700">Value</span>
                        <span className="text-lg font-bold text-green-600">
                          ₹{reward.discount_amount.toLocaleString()}
                        </span>
                      </div>

                      <button
                        onClick={() => handleRedeemReward(reward)}
                        disabled={!canRedeem || isRedeeming}
                        className={`w-full px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center ${
                          canRedeem
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {isRedeeming ? (
                          <>
                            <FiLoader className="animate-spin mr-2 w-5 h-5" />
                            Redeeming...
                          </>
                        ) : canRedeem ? (
                          <>
                            <FiGift className="mr-2 w-5 h-5" />
                            Redeem Now
                          </>
                        ) : (
                          <>
                            Need {(reward.points_required - (profile?.loyalty_points || 0)).toLocaleString()} more points
                          </>
                        )}
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === 'transactions' && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Points History</h3>
                <p className="text-gray-600">
                  Complete history of all your points earned, redeemed, and expired.
                </p>
              </div>

              {transactions.length > 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-pink-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Points
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {transactions.map((txn) => (
                          <tr key={txn.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {new Date(txn.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              <div className="flex items-center">
                                <span className="mr-2">{getTransactionIcon(txn.transaction_type)}</span>
                                {txn.description}
                                {txn.social_share_bonus && (
                                  <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                    Social Bonus
                                  </span>
                                )}
                                {txn.referral_bonus && (
                                  <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                                    Referral Bonus
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                txn.transaction_type === 'earned' ? 'bg-green-100 text-green-700' :
                                txn.transaction_type === 'redeemed' ? 'bg-pink-100 text-pink-700' :
                                txn.transaction_type === 'expired' ? 'bg-red-100 text-red-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {txn.transaction_type}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                              <span className={`font-semibold ${
                                txn.points > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {txn.points > 0 ? '+' : ''}{txn.points}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                              {txn.related_amount ? `₹${txn.related_amount.toLocaleString()}` : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl p-12 shadow-sm border border-pink-100 text-center">
                  <FiClock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No transaction history yet</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'referrals' && (
            <motion.div
              key="referrals"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Referral Code Card */}
              <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">Your Referral Code</h3>
                  <p className="text-sm opacity-90 mb-4">
                    Share your code with friends and earn 500 points for each successful referral!
                  </p>
                  
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="flex-1 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 flex items-center justify-between">
                      <span className="text-2xl font-bold tracking-wider">
                        {userReferralCode || 'Loading...'}
                      </span>
                      <button
                        onClick={handleCopyReferralCode}
                        className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                      >
                        {copied ? (
                          <FiCheck className="w-5 h-5" />
                        ) : (
                          <FiCopy className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowShareModal(true)}
                    className="w-full px-4 py-3 bg-white text-purple-600 rounded-lg hover:bg-opacity-90 transition-all font-medium flex items-center justify-center"
                  >
                    <FiShare2 className="mr-2 w-5 h-5" />
                    Share Referral Link
                  </button>
                </div>

                {/* Referral Stats */}
                <div className="grid grid-cols-3 gap-px bg-white bg-opacity-20">
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm p-4 text-center">
                    <div className="text-2xl font-bold text-white">{referrals.length}</div>
                    <div className="text-xs text-white opacity-90">Total Sent</div>
                  </div>
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm p-4 text-center">
                    <div className="text-2xl font-bold text-white">
                      {referrals.filter(r => r.status === 'completed').length}
                    </div>
                    <div className="text-xs text-white opacity-90">Completed</div>
                  </div>
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm p-4 text-center">
                    <div className="text-2xl font-bold text-white">
                      {referrals.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.referrer_points_awarded, 0)}
                    </div>
                    <div className="text-xs text-white opacity-90">Points Earned</div>
                  </div>
                </div>
              </div>

              {/* How it Works */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">How Referrals Work</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-3xl">1️⃣</span>
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">Share Your Code</h4>
                    <p className="text-sm text-gray-600">
                      Send your unique referral code to friends via WhatsApp, email, or social media
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-3xl">2️⃣</span>
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">Friend Signs Up</h4>
                    <p className="text-sm text-gray-600">
                      Your friend creates an account using your referral code and gets 200 bonus points
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-3xl">3️⃣</span>
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">Both Earn Rewards</h4>
                    <p className="text-sm text-gray-600">
                      When they complete their first booking, you earn 500 points!
                    </p>
                  </div>
                </div>
              </div>

              {/* Referral List */}
              <div className="bg-white rounded-xl shadow-sm border border-pink-100 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">Your Referrals</h3>
                </div>
                
                {referrals.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {referrals.map((referral) => (
                      <div key={referral.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                              {referral.referred_name?.charAt(0) || referral.referred_email?.charAt(0) || '?'}
                            </div>
                            <div>
                              <div className="font-medium text-gray-800">
                                {referral.referred_name || referral.referred_email || 'Pending'}
                              </div>
                              <div className="text-xs text-gray-500">
                                Sent {new Date(referral.created_at).toLocaleDateString('en-IN')}
                              </div>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getReferralStatusColor(referral.status)}`}>
                            {referral.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="bg-gray-50 rounded-lg p-2">
                            <div className="text-xs text-gray-600 mb-1">Signed Up</div>
                            <div className="font-semibold text-gray-800">
                              {referral.referred_signup_at ? (
                                <FiCheck className="w-5 h-5 text-green-500 mx-auto" />
                              ) : (
                                <FiX className="w-5 h-5 text-gray-400 mx-auto" />
                              )}
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2">
                            <div className="text-xs text-gray-600 mb-1">First Booking</div>
                            <div className="font-semibold text-gray-800">
                              {referral.first_booking_completed_at ? (
                                <FiCheck className="w-5 h-5 text-green-500 mx-auto" />
                              ) : (
                                <FiX className="w-5 h-5 text-gray-400 mx-auto" />
                              )}
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2">
                            <div className="text-xs text-gray-600 mb-1">Points Earned</div>
                            <div className="font-semibold text-pink-600">
                              {referral.referrer_points_awarded}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">No referrals yet</p>
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all font-medium"
                    >
                      Start Referring Friends
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Share Modal */}
        <AnimatePresence>
          {showShareModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowShareModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Share Referral Code</h3>
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiX className="w-6 h-6 text-gray-600" />
                  </button>
                </div>

                <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg p-4 mb-6 text-center">
                  <div className="text-sm text-gray-700 mb-2">Your Referral Code</div>
                  <div className="text-3xl font-bold text-pink-600 tracking-wider mb-3">
                    {userReferralCode}
                  </div>
                  <button
                    onClick={handleCopyReferralCode}
                    className="px-4 py-2 bg-white text-pink-600 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm flex items-center justify-center mx-auto"
                  >
                    {copied ? (
                      <>
                        <FiCheck className="mr-2 w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <FiCopy className="mr-2 w-4 h-4" />
                        Copy Code
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => handleShareReferral('whatsapp')}
                    className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center"
                  >
                    <FiMessageCircle className="mr-2 w-5 h-5" />
                    Share on WhatsApp
                  </button>

                  <button
                    onClick={() => handleShareReferral('instagram')}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors font-medium flex items-center justify-center"
                  >
                    <FiInstagram className="mr-2 w-5 h-5" />
                    Share on Instagram
                  </button>

                  <button
                    onClick={() => handleShareReferral('twitter')}
                    className="w-full px-4 py-3 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors font-medium flex items-center justify-center"
                  >
                    <FiTwitter className="mr-2 w-5 h-5" />
                    Share on Twitter
                  </button>

                  <button
                    onClick={() => handleShareReferral('email')}
                    className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center justify-center"
                  >
                    <FiMail className="mr-2 w-5 h-5" />
                    Share via Email
                  </button>

                  <button
                    onClick={() => handleShareReferral('copy')}
                    className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center"
                  >
                    <FiExternalLink className="mr-2 w-5 h-5" />
                    Copy Link
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