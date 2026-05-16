// app/components/BeautyQuiz.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Gift, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

// ---------- Types ----------
interface QuizQuestion {
  id: number;
  question: string;
  category: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
}

interface RecommendedService {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  category: string;
  slug?: string;
}

// ---------- Viral Persona Engine ----------
const determinePersona = (answers: Record<number, string>) => {
  const text = Object.values(answers).join(' ').toLowerCase();
  if (text.includes('premium') && (text.includes('today') || text.includes('urgently')))
    return { title: '🔥 Last-Minute Glow Getter', vibe: 'Instant, visible results before events', emoji: '⚡' };
  if (text.includes('natural') || text.includes('subtle'))
    return { title: '🌿 Natural Glow Minimalist', vibe: 'Effortless, clean beauty looks', emoji: '✨' };
  if (text.includes('bold') || text.includes('glam'))
    return { title: '💄 Soft Glam Queen', vibe: 'Polished & camera‑ready', emoji: '💋' };
  if (text.includes('budget'))
    return { title: '💅 Smart Beauty Planner', vibe: 'Best results without overspending', emoji: '💸' };
  return { title: '✨ Glow Seeker', vibe: 'Better skin & confidence boost', emoji: '🌸' };
};

const generateGlowScore = (answers: Record<number, string>) => {
  let score = 5;
  if (answers[2]?.includes('Dullness')) score -= 1;
  if (answers[2]?.includes('Pigmentation')) score -= 1;
  if (answers[14] === 'Yes, urgently') score -= 1;
  if (answers[99] === 'Premium results') score += 1;
  if (answers[98] === 'Today') score += 1;
  return Math.max(4, Math.min(score, 9));
};

const getGlowComparison = (score: number) => {
  if (score >= 8) return 'Top 20% glow level 💎';
  if (score >= 6) return 'Better than 60% users 🔥';
  return 'Needs glow boost ⚡';
};

const getTransformationStory = (answers: Record<number, string>) => {
  const concern = answers[2] || 'dull skin';
  return {
    now: `😐 Currently: ${concern}`,
    after1: '✨ After 1 session: Instant glow + smooth skin',
    after3: '🔥 After 3 sessions: Glass skin effect + even tone',
  };
};

const detectIntent = (answers: Record<number, string>) => {
  if (answers[98] === 'Today') return 'hot';
  if (answers[98] === 'Tomorrow') return 'warm';
  if (answers[99] === 'Premium results') return 'high_value';
  if (answers[99] === 'Budget-friendly') return 'price_sensitive';
  return 'cold';
};

const generateShareText = (persona: any, score: number, serviceName: string) => {
  return `✨ My Glow Score: ${score}/10\n💖 I’m a ${persona.title}\n🔥 Recommended: ${serviceName}\n\nTry your result 👇`;
};

const MAX_QUESTIONS = 10;

// ---------- Reel Component (tap‑through result) ----------
const GlowReel = ({
  persona,
  glowScore,
  story,
  service,
  answers,
  onClose,
}: {
  persona: any;
  glowScore: number;
  story: any;
  service: RecommendedService;
  answers: Record<number, string>;
  onClose: () => void;
}) => {
  const [step, setStep] = useState(0);
  const [selectedTiming, setSelectedTiming] = useState<string | null>(null);
  const intent = detectIntent(answers);
  const urgencySlots = Math.floor(Math.random() * 4) + 2;
  const bookingRate = Math.floor(Math.random() * 10) + 85;

  const getCTA = () => {
    if (intent === 'hot') return { text: '⚡ Book Now (Today Slots Filling Fast)', sub: 'Only few slots left today' };
    if (intent === 'high_value') return { text: '✨ Get Premium Glow Experience', sub: 'Visible results in 1 session' };
    if (intent === 'price_sensitive') return { text: '💸 Unlock Offer & Book Now', sub: 'Save ₹300 today' };
    return { text: '📲 Check Availability on WhatsApp', sub: 'No pressure booking' };
  };

  const generateWhatsAppMessage = () => {
    const timing = selectedTiming || 'this week';
    return encodeURIComponent(
      `Hi, I just completed your AI Beauty Quiz ✨\n\n💖 My Profile: ${persona.title}\n🔥 Recommended: ${service.name}\n\nI'm planning to visit: ${timing}\n${intent === 'hot' ? 'Can I get a slot today?' : ''}\n${intent === 'price_sensitive' ? 'Any offer available?' : ''}\n\nPlease suggest best time 😊`
    );
  };

  const screens = [
    <div key="persona" className="flex flex-col items-center justify-center h-full text-center px-6">
      <div className="text-6xl mb-4">{persona.emoji}</div>
      <h1 className="text-3xl font-bold">You’re a {persona.title}</h1>
      <p className="mt-3 text-gray-600">{persona.vibe}</p>
    </div>,
    <div key="score" className="flex flex-col items-center justify-center h-full text-center">
      <h2 className="text-lg text-gray-500">Your Glow Score</h2>
      <div className="text-6xl font-bold mt-2">{glowScore}/10 ✨</div>
      <p className="text-purple-600 mt-2">{getGlowComparison(glowScore)}</p>
    </div>,
    <div key="problem" className="flex flex-col justify-center h-full px-6">
      <h2 className="text-2xl font-bold mb-3">Your Skin Right Now</h2>
      <p className="text-lg">{story.now}</p>
      <p className="text-sm text-gray-500 mt-2">This is common due to pollution + sun exposure in Patna</p>
    </div>,
    <div key="transformation" className="flex flex-col justify-center h-full px-6">
      <h2 className="text-2xl font-bold mb-3">Your Glow Transformation</h2>
      <p>{story.after1}</p>
      <p className="mt-2">{story.after3}</p>
      <p className="text-pink-500 mt-3 text-sm">📸 Visible glow right after session</p>
    </div>,
    <div key="service" className="flex flex-col justify-center h-full px-6">
      <h2 className="text-xl text-gray-500">Best For You</h2>
      <h3 className="text-3xl font-bold mt-2">{service.name}</h3>
      <ul className="mt-4 space-y-2 text-sm">
        <li>✔ Instant visible glow</li>
        <li>✔ Better than basic facial</li>
        <li>✔ Trending in Patna 🔥</li>
      </ul>
      <div className="mt-3 flex gap-2 flex-wrap">
        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">⚡ Only {urgencySlots} slots left</span>
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">💬 {bookingRate}% users book this</span>
      </div>
    </div>,
    <div key="timing" className="flex flex-col justify-center h-full px-6">
      <h2 className="text-xl font-bold mb-3">📅 When do you want to visit?</h2>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {['Today', 'Tomorrow', 'This week', 'Just exploring'].map((opt) => (
          <button
            key={opt}
            onClick={() => setSelectedTiming(opt)}
            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              selectedTiming === opt ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {selectedTiming === 'Today' && (
        <p className="text-xs text-red-500 animate-pulse">⚡ High demand right now — confirm soon</p>
      )}
      <p className="text-xs text-gray-500 mt-2">⏳ Your ₹300 quiz offer expires in 24 hours</p>
    </div>,
    <div key="cta" className="flex flex-col justify-center items-center h-full text-center px-6">
      <h2 className="text-2xl font-bold mb-3">Ready for your glow?</h2>
      <button
        onClick={() => window.open(`https://wa.me/919650461390?text=${generateWhatsAppMessage()}`, '_blank')}
        className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold w-full mb-3"
      >
        {getCTA().text}
      </button>
      <button
        onClick={() => {
          const text = generateShareText(persona, glowScore, service.name);
          if (navigator.share) navigator.share({ text });
          else alert(text);
        }}
        className="bg-purple-100 text-purple-700 px-6 py-3 rounded-xl w-full"
      >
        📲 Share Result
      </button>
      <button onClick={onClose} className="mt-4 text-gray-500 text-sm">Maybe later</button>
    </div>,
  ];

  const next = () => setStep((s) => Math.min(s + 1, screens.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="fixed inset-0 bg-black z-50 text-white">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.4 }}
          className="h-full flex flex-col"
          onClick={next}
        >
          <div className="flex justify-between p-4 text-sm">
            <button onClick={onClose}>Close</button>
            <span>{step + 1}/{screens.length}</span>
          </div>
          <div className="flex-1">{screens[step]}</div>
          <div className="flex justify-between p-4">
            <button onClick={prev}>←</button>
            <button onClick={next}>→</button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// ---------- Main Component ----------
export default function BeautyQuiz({ onClose }: { onClose: () => void }) {
  const [allQuestions, setAllQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestions, setCurrentQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [recommendedServices, setRecommendedServices] = useState<RecommendedService[]>([]);
  const [error, setError] = useState('');
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [persona, setPersona] = useState<any>(null);
  const [glowScore, setGlowScore] = useState(0);
  const [story, setStory] = useState<any>(null);
  const [showReel, setShowReel] = useState(false);

  // Funnel order
  const funnel = [1, 2, 14, 15, 31, 35, 56, 61, 71, 83, 99, 98, 100];

  useEffect(() => {
    const init = async () => {
      try {
        const { data, error } = await supabase
          .from('beauty_quiz_questions')
          .select('id, question, category, option1, option2, option3, option4')
          .order('id', { ascending: true });
        if (error) throw error;
        if (!data || data.length === 0) {
          setError('No questions found.');
          setIsLoading(false);
          return;
        }
        setAllQuestions(data);
        const firstQ = data.find((q) => q.id === 1);
        if (firstQ) setCurrentQuestions([firstQ]);
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load questions');
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const getNextQuestion = (
    currentAnswers: Record<number, string>,
    askedQuestions: QuizQuestion[],
    allQ: QuizQuestion[]
  ): QuizQuestion | null => {
    if (askedQuestions.length >= MAX_QUESTIONS) return null;
    const askedIds = askedQuestions.map((q) => q.id);
    const remaining = allQ.filter((q) => !askedIds.includes(q.id));

    for (let id of funnel) {
      if (!askedIds.includes(id)) {
        const q = remaining.find((r) => r.id === id);
        if (q) return q;
      }
    }
    if (askedIds.includes(2)) {
      const concern = currentAnswers[2] || '';
      let followUpId = 0;
      if (concern.includes('Acne')) followUpId = 5;
      else if (concern.includes('Dullness')) followUpId = 14;
      else if (concern.includes('Pigmentation')) followUpId = 17;
      if (followUpId && !askedIds.includes(followUpId)) {
        const q = remaining.find((r) => r.id === followUpId);
        if (q) return q;
      }
    }
    const categoriesAsked = new Set(askedQuestions.map((q) => q.category));
    const categoryOrder = ['hair', 'makeup', 'nail', 'lifestyle'];
    for (let cat of categoryOrder) {
      if (!categoriesAsked.has(cat)) {
        const q = remaining.find((r) => r.category === cat);
        if (q) return q;
      }
    }
    return remaining[0] || null;
  };

  const handleAnswer = async (option: string) => {
    const currentQ = currentQuestions[currentIndex];
    const newAnswers = { ...answers, [currentQ.id]: option };
    setAnswers(newAnswers);

    if (
      newAnswers[98] === 'Today' &&
      newAnswers[99] === 'Premium results' &&
      Object.keys(newAnswers).length >= 6
    ) {
      await submitAnswers(newAnswers);
      return;
    }

    const next = getNextQuestion(newAnswers, currentQuestions, allQuestions);
    if (next) {
      setCurrentQuestions([...currentQuestions, next]);
      setCurrentIndex(currentIndex + 1);
    } else {
      await submitAnswers(newAnswers);
    }
  };

  const handleBack = () => {
    if (currentIndex === 0) return;
    const currentQ = currentQuestions[currentIndex];
    setAnswers((prev) => {
      const updated = { ...prev };
      delete updated[currentQ.id];
      return updated;
    });
    setCurrentIndex(currentIndex - 1);
  };

  const calculateServiceScores = (answers: Record<number, string>) => {
    let hydraScore = 0,
      keratinScore = 0,
      bridalScore = 0,
      gelScore = 0;
    if (answers[14] === 'Yes, urgently') hydraScore += 50;
    else if (answers[14] === 'Yes, for an event') hydraScore += 30;
    if (answers[15] === 'Yes, within 7 days') hydraScore += 30;
    else if (answers[15] === 'Yes, within a month') hydraScore += 15;
    if (answers[2]?.includes('Dullness') || answers[2]?.includes('Pigmentation')) hydraScore += 20;
    if (answers[35] === 'Yes, desperately') keratinScore += 50;
    else if (answers[35] === 'Yes, for events') keratinScore += 30;
    if (answers[31] === 'Frizz') keratinScore += 20;
    if (answers[61]?.includes('wedding')) bridalScore += 60;
    else if (answers[61]?.includes('party') || answers[61]?.includes('shoot')) bridalScore += 40;
    if (answers[83] === 'Yes desperately') gelScore += 50;
    else if (answers[83] === 'Would be nice') gelScore += 25;
    if (answers[99] === 'Premium results') {
      hydraScore += 25;
      keratinScore += 25;
      bridalScore += 30;
      gelScore += 20;
    } else if (answers[99] === 'Balanced') {
      hydraScore += 10;
      keratinScore += 10;
    }
    if (answers[16] === '₹3000–6000') hydraScore += 20;
    if (answers[16] === '₹6000+') hydraScore += 30;
    if (answers[98] === 'Today') {
      hydraScore += 30;
      keratinScore += 30;
    } else if (answers[98] === 'Tomorrow') {
      hydraScore += 20;
      keratinScore += 20;
    }
    return { hydraScore, keratinScore, bridalScore, gelScore };
  };

  const getRecommendedServices = (scores: any): RecommendedService[] => {
    const services: RecommendedService[] = [];
    if (scores.hydraScore >= 30)
      services.push({ id: 'hydra', name: 'Hydra Facial', price: 3500, originalPrice: 4500, discount: 20, category: 'Skin', slug: 'hydra-facial' });
    if (scores.keratinScore >= 30)
      services.push({ id: 'keratin', name: 'Keratin Smoothing', price: 4500, originalPrice: 5500, discount: 15, category: 'Hair', slug: 'keratin-smoothing' });
    if (scores.bridalScore >= 40 && services.length < 2)
      services.push({ id: 'makeup', name: 'Bridal/Event Makeup', price: 3500, originalPrice: 4500, discount: 10, category: 'Makeup', slug: 'bridal-makeup' });
    if (scores.gelScore >= 30 && services.length < 2)
      services.push({ id: 'nails', name: 'Gel Nail Extensions', price: 1800, originalPrice: 2200, discount: 10, category: 'Nail', slug: 'gel-nails' });
    if (services.length === 0) {
      services.push({ id: 'facial', name: 'Signature Facial', price: 2500, originalPrice: 3000, discount: 15, category: 'Skin', slug: 'signature-facial' });
      services.push({ id: 'hairspa', name: 'Hair Spa Treatment', price: 1800, originalPrice: 2200, discount: 10, category: 'Hair', slug: 'hair-spa' });
    }
    return services.slice(0, 2);
  };

  const submitAnswers = async (finalAnswers: Record<number, string>) => {
    try {
      const scores = calculateServiceScores(finalAnswers);
      const services = getRecommendedServices(scores);
      setRecommendedServices(services);
      setPersona(determinePersona(finalAnswers));
      setGlowScore(generateGlowScore(finalAnswers));
      setStory(getTransformationStory(finalAnswers));
      setQuizCompleted(true);
      setShowReel(true);
    } catch (err) {
      console.error(err);
      setError('Failed to get results');
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-pink-600 font-medium">Loading your beauty quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
          <p className="text-red-600">{error}</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-pink-600 text-white rounded-lg">Close</button>
        </div>
      </div>
    );
  }

  if (showReel && quizCompleted && recommendedServices[0]) {
    return (
      <GlowReel
        persona={persona}
        glowScore={glowScore}
        story={story}
        service={recommendedServices[0]}
        answers={answers}
        onClose={onClose}
      />
    );
  }

  const currentQ = currentQuestions[currentIndex];
  if (!currentQ) return null;

  const options = [currentQ.option1, currentQ.option2, currentQ.option3, currentQ.option4];
  const progress = Math.min(((currentIndex + 1) / (MAX_QUESTIONS - 1)) * 100, 100);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'skin': return '✨';
      case 'hair': return '💇‍♀️';
      case 'makeup': return '💄';
      case 'nail': return '💅';
      default: return '🌸';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Question {currentIndex + 1} of {MAX_QUESTIONS}</span>
            <span className="text-sm font-medium text-pink-600">{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
          </div>
        </div>
        <div className="flex items-start mb-6">
          <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-full p-3 mr-4">
            <span className="text-2xl">{getCategoryIcon(currentQ.category)}</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 flex-1">{currentQ.question}</h3>
        </div>
        <div className="space-y-3 mb-6">
          {options.map((opt, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAnswer(opt)}
              className="w-full p-4 text-left border-2 border-gray-200 rounded-xl hover:border-pink-300 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-all duration-300 group"
            >
              <span className="group-hover:text-pink-700">{opt}</span>
            </motion.button>
          ))}
        </div>
        <div className="flex justify-between items-center">
          {currentIndex > 0 && (
            <button onClick={handleBack} className="flex items-center text-pink-600 hover:text-pink-700"><ArrowLeft className="mr-2" />Back</button>
          )}
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">Close</button>
        </div>
        {currentIndex === 0 && <p className="text-xs text-gray-500 mt-4 text-center">Takes only 30 seconds ✨</p>}
        {currentIndex >= 7 && <p className="text-xs text-orange-500 mt-4 text-center animate-pulse">⚡ Almost done! Get your personalized result in seconds</p>}
      </motion.div>
    </div>
  );
}