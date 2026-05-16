'use client';

// ============================================================
// FILE: components/ui/ProgressiveProfileNudge.tsx
//
// NEW FILE — doesn't exist in original codebase.
//
// WHAT IT DOES:
//   Replaces the 2-step signup form's DOB + phone collection.
//   Shows a soft, dismissable nudge AFTER first login / booking
//   to collect missing profile fields — one at a time.
//
// WHEN TO USE:
//   On home page after first login:
//     <ProgressiveProfileNudge fields={['birthday']} />
//   On booking confirmation page:
//     <ProgressiveProfileNudge fields={['phone']} />
//   On profile page always:
//     <ProgressiveProfileNudge fields={['birthday','phone','marital_status']} />
//
// UX PRINCIPLE:
//   • One field at a time
//   • Dismissable (user can skip)
//   • Shows the BENEFIT not the request
//     ("Get birthday surprise" not "Enter your birthday")
//   • Saves silently in background
//   • Never interrupts booking flow
// ============================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Phone, Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type ProfileField = 'birthday' | 'phone' | 'marital_status' | 'anniversary_date';

interface NudgeConfig {
  icon:        React.ReactNode;
  title:       string;
  description: string;
  inputType:   'date' | 'tel' | 'select';
  placeholder: string;
  max?:        string;
  options?:    { value: string; label: string }[];
  benefit:     string;
}

const NUDGE_CONFIG: Record<ProfileField, NudgeConfig> = {
  birthday: {
    icon:        <Gift className="w-5 h-5 text-rose-brand" />,
    title:       'Unlock birthday surprise 🎂',
    description: 'We\'ll send you a special birthday offer!',
    inputType:   'date',
    placeholder: 'Date of Birth',
    max:         new Date().toISOString().split('T')[0],
    benefit:     '🎁 Free birthday gift with any service',
  },
  phone: {
    icon:        <Phone className="w-5 h-5 text-rose-brand" />,
    title:       'Get appointment reminders 📱',
    description: 'We\'ll WhatsApp you before your booking.',
    inputType:   'tel',
    placeholder: '+91 98765 43210',
    benefit:     '📲 Never miss an appointment',
  },
  marital_status: {
    icon:        <Heart className="w-5 h-5 text-rose-brand" />,
    title:       'Unlock bridal offers 💍',
    description: 'Tell us and we\'ll share exclusive packages.',
    inputType:   'select',
    placeholder: '',
    options: [
      { value: 'single',  label: 'Single' },
      { value: 'engaged', label: 'Engaged 💕' },
      { value: 'married', label: 'Married 💍' },
      { value: 'other',   label: 'Other' },
    ],
    benefit:     '💍 Exclusive bridal & anniversary packages',
  },
  anniversary_date: {
    icon:        <Heart className="w-5 h-5 text-rose-brand" />,
    title:       'Anniversary surprise ❤️',
    description: 'Get a special offer on your anniversary!',
    inputType:   'date',
    placeholder: 'Anniversary Date',
    max:         new Date().toISOString().split('T')[0],
    benefit:     '❤️ Special anniversary discount every year',
  },
};

interface Props {
  fields:     ProfileField[];
  className?: string;
  onDismiss?: () => void;
}

export default function ProgressiveProfileNudge({ fields, className = '', onDismiss }: Props) {
  const { profile, updateProfile } = useAuth();

  // Find first field that is missing from profile
  const missingField = fields.find(f => {
    if (!profile) return false;
    const val = (profile as any)[f];
    return !val || val === '';
  });

  const [value,   setValue]   = useState('');
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [visible, setVisible] = useState(true);

  if (!missingField || !visible || !profile) return null;

  const config = NUDGE_CONFIG[missingField];

  const handleSave = async () => {
    if (!value.trim()) return;
    setSaving(true);
    const { error } = await updateProfile({ [missingField]: value } as any);
    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setVisible(false), 1500);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          className={`relative bg-white rounded-2xl shadow-brand-sm
            border border-[rgba(184,102,122,0.15)] p-4 ${className}`}
        >
          <button
            onClick={handleDismiss}
            className="absolute right-3 top-3 text-plum-light hover:text-plum
              transition-colors p-1"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {saved ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 py-1"
            >
              <span className="text-xl">🎉</span>
              <p className="text-[13px] font-medium text-plum">
                Saved! {config.benefit}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3 pr-4">
              <div className="flex items-start gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blush flex items-center
                  justify-center flex-shrink-0">
                  {config.icon}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-plum">{config.title}</p>
                  <p className="text-[11px] text-plum-light">{config.description}</p>
                </div>
              </div>

              <div className="flex gap-2">
                {config.inputType === 'select' ? (
                  <select
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    className="flex-1 inp text-[12px] py-2"
                  >
                    <option value="">Select…</option>
                    {config.options?.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={config.inputType}
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    placeholder={config.placeholder}
                    max={config.max}
                    inputMode={config.inputType === 'tel' ? 'tel' : undefined}
                    className="flex-1 inp text-[12px] py-2"
                  />
                )}
                <button
                  onClick={handleSave}
                  disabled={!value.trim() || saving}
                  className="px-4 py-2 rounded-xl bg-rose-brand text-white
                    text-[12px] font-medium hover:bg-rose-deep
                    active:scale-[0.98] transition-all disabled:opacity-50
                    flex items-center gap-1.5"
                >
                  {saving ? (
                    <span className="w-3 h-3 border border-white/30 border-t-white
                      rounded-full animate-spin" />
                  ) : 'Save'}
                </button>
              </div>

              <p className="text-[10px] text-gold-deep">{config.benefit}</p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}