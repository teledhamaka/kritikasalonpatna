// app/components/BeautyQuiz.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Gift, Share2 } from 'lucide-react';
import { Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface QuizQuestion {
  id: string;
  question: string;
  category: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
}

interface QuizResult {
  profile_type: string;
  description: string;
  skin_advice: string;
  hair_advice: string;
  makeup_advice: string;
  nail_advice: string;
}

interface RecommendedService {
  id: string;
  name: string;
  price: number;
  discount?: number;
  category: string;
}

export default function BeautyQuiz({ onClose }: { onClose: () => void; }) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [recommendedServices, setRecommendedServices] = useState<RecommendedService[]>([]);
  const [, setError] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    fetchQuizQuestions();
  }, []);

  const fetchQuizQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('beauty_quiz_questions')
        .select('*');

      if (error) throw error;

      // Shuffle and take first 10 questions
      const shuffled = data?.sort(() => 0.5 - Math.random()).slice(0, 10) || [];
      setQuestions(shuffled);
      setIsLoading(false);
    } 
    catch (err) {
      setError('Failed to load questions');
      setIsLoading(false);
    }
  };

  const submitAnswers = async () => {
    try {
      const profileType = determineProfileType();
      
      const { data, error } = await supabase
        .from('beauty_quiz_results')
        .select('*')
        .eq('profile_type', profileType)
        .single();

      if (error) throw error;

      setQuizResult(data);
      setShowCelebration(true);
      
      // Fetch recommended services based on profile
      await fetchRecommendedServices(profileType);
      
      setTimeout(() => setShowCelebration(false), 2000);
    } 
    catch (err) {
      setError('Failed to get results');
    }
  };

  const fetchRecommendedServices = async (profileType: string) => {
    // Mock recommended services based on profile type
    const mockServices: RecommendedService[] = [
      { id: '1', name: 'Signature Facial', price: 2500, discount: 20, category: 'Skin' },
      { id: '2', name: 'Hair Spa Treatment', price: 1800, discount: 15, category: 'Hair' },
      { id: '3', name: 'Bridal Makeup Trial', price: 3500, category: 'Makeup' },
    ];
    
    setRecommendedServices(mockServices);
  };

  const determineProfileType = (): string => {
    let naturalCount = 0;
    let boldCount = 0;
    let wellnessCount = 0;
    let luxuryCount = 0;
    let timeSaverCount = 0;

    questions.forEach((question: QuizQuestion, index: number) => {
      const answer = answers[index] || '';
      const category = question.category.toLowerCase();

      if (answer.includes('Natural') || answer.includes('Rarely') || 
          answer.includes('Clear') || (category === 'skin' && answer.includes('Comfortable'))) {
        naturalCount++;
      }
      if (answer.includes('Bold') || answer.includes('Glam') || 
          answer.includes('Dark') || answer.includes('Experimental')) {
        boldCount++;
      }
      if (answer.includes('Treatment') || answer.includes('Professional') || 
          answer.includes('Serum')) {
        wellnessCount++;
      }
      if (answer.includes('Luxury') || answer.includes('Premium') || 
          answer.includes('Salon')) {
        luxuryCount++;
      }
      if (answer.includes('Quick') || answer.includes('Multitasking') || 
          answer.includes('Minimal')) {
        timeSaverCount++;
      }
    });

    const counts = {
      'Time-Saver': timeSaverCount,
      'Natural Minimalist': naturalCount,
      'Bold Experimenter': boldCount,
      'Luxury Connoisseur': luxuryCount,
      'Wellness Focused': wellnessCount,
    };

    return Object.entries(counts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'skin': return '✨';
      case 'hair': return '💇‍♀️';
      case 'nail': return '💅';
      case 'makeup': return '💄';
      default: return '🌸';
    }
  };

  const getProfileIcon = (profileType: string) => {
    switch (profileType) {
      case 'Natural Minimalist': return '🌿';
      case 'Bold Experimenter': return '💎';
      case 'Luxury Connoisseur': return '👑';
      case 'Wellness Focused': return '🧘‍♀️';
      case 'Time-Saver': return '⚡';
      default: return '✨';
    }
  };

  const handleFinish = () => {
    onClose(); // This will close the quiz and return to homepage
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-pink-600 font-medium">Loading your beauty quiz...</p>
            <p className="text-sm text-gray-500 mt-1">Preparing personalized questions ✨</p>
          </div>
        </div>
      </div>
    );
  }

  if (quizResult) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center z-10"
            >
              <div className="text-6xl">🎉</div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        >
          <div className="text-center mb-6">
            <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">{getProfileIcon(quizResult.profile_type)}</span>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
              You&apos;re a {quizResult.profile_type}!
            </h2>
            <p className="text-gray-600 text-lg">{quizResult.description}</p>
          </div>
          
          {/* Personalized Advice */}
          <div className="space-y-4 mb-6">
            {quizResult.skin_advice && (
              <AdviceCard title="Skin Care" advice={quizResult.skin_advice} icon="✨" color="pink" />
            )}
            {quizResult.hair_advice && (
              <AdviceCard title="Hair Care" advice={quizResult.hair_advice} icon="💇‍♀️" color="purple" />
            )}
            {quizResult.makeup_advice && (
              <AdviceCard title="Makeup" advice={quizResult.makeup_advice} icon="💄" color="red" />
            )}
            {quizResult.nail_advice && (
              <AdviceCard title="Nail Care" advice={quizResult.nail_advice} icon="💅" color="orange" />
            )}
          </div>

          {/* Recommended Services */}
          {recommendedServices.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-4 flex items-center">
                <Gift className="mr-2 text-pink-600" />
                Perfect Services For You
              </h3>
              <div className="space-y-3">
                {recommendedServices.map((service) => (
                  <div key={service.id} className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-gray-800">{service.name}</h4>
                        <p className="text-sm text-gray-600">{service.category}</p>
                      </div>
                      <div className="text-right">
                        {service.discount && (
                          <div className="text-xs text-green-600 font-bold">
                            {service.discount}% OFF
                          </div>
                        )}
                        <div className="text-lg font-bold text-pink-600">
                          ₹{service.discount ? service.price - (service.price * service.discount / 100) : service.price}
                        </div>
                        {service.discount && (
                          <div className="text-xs text-gray-400 line-through">
                            ₹{service.price}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Special Offer */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl p-4 mb-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Sparkles className="mr-2" />
              <span className="font-bold">Quiz Completion Bonus!</span>
            </div>
            <p className="text-sm">Get 15% off on your first booking</p>
            <p className="text-xs mt-1 opacity-90">Use code: BEAUTYQUIZ15</p>
          </div>
          
            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    onClick={() => alert('Sharing your amazing beauty profile!')}
                    className="w-full sm:w-auto flex-1 bg-gray-200 text-gray-800 py-4 rounded-xl font-bold text-lg hover:bg-gray-300 transition-all duration-300 flex items-center justify-center"
                >
                    <Share2 className="mr-2"/> Share
                </button>
                <button
                    onClick={handleFinish}
                    className="w-full sm:w-auto flex-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
                >
                    Explore My Recommendations ✨
                </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const options = currentQuestion ? [currentQuestion.option1, currentQuestion.option2, currentQuestion.option3, currentQuestion.option4] : [];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full mx-4"
      >
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium text-pink-600">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Question */}
        {currentQuestion && (
            <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-start mb-6"
            >
            <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-full p-3 mr-4">
                <span className="text-2xl">
                {getCategoryIcon(currentQuestion.category)}
                </span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 flex-1">
                {currentQuestion.question}
            </h3>
            </motion.div>
        )}

        {/* Options */}
        <div className="space-y-3 mb-6">
          {options.map((option, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const newAnswers = { ...answers, [currentQuestionIndex]: option };
                setAnswers(newAnswers);
                
                if (currentQuestionIndex < questions.length - 1) {
                  setTimeout(() => {
                    setCurrentQuestionIndex(currentQuestionIndex + 1);
                  }, 150);
                } else {
                  submitAnswers();
                }
              }}
              className="w-full p-4 text-left border-2 border-gray-200 rounded-xl hover:border-pink-300 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-all duration-300 group"
            >
              <span className="group-hover:text-pink-700 transition-colors">
                {option}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          {currentQuestionIndex > 0 ? (
            <button
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
              className="flex items-center text-pink-600 hover:text-pink-700 transition-colors"
            >
              <ArrowLeft className="mr-2" />
              Back
            </button>
          ) : <div></div>}
          
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function AdviceCard({ title, advice, icon, color }: { 
  title: string; 
  advice: string; 
  icon: string; 
  color: string; 
}) {
  const colorClasses = {
    pink: 'from-pink-50 to-pink-100 border-pink-200',
    purple: 'from-purple-50 to-purple-100 border-purple-200',
    red: 'from-red-50 to-red-100 border-red-200',
    orange: 'from-orange-50 to-orange-100 border-orange-200'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} rounded-xl p-4 border`}
    >
      <div className="flex items-start">
        <div className="text-2xl mr-3">{icon}</div>
        <div className="flex-1">
          <h4 className="font-bold text-gray-800 mb-2">{title}</h4>
          <p className="text-gray-700 text-sm leading-relaxed">{advice}</p>
        </div>
      </div>
    </motion.div>
  );
}