import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { RoutePath } from '../types';
import MysticButton from '../components/UI/MysticButton';
import { haptic } from '../services/telegram';
import { DISCLAIMER_TEXT } from '../constants';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    haptic.impact('light');
    setStep(prev => prev + 1);
  };

  const handleFinish = async () => {
    if (!birthDate) return;
    setLoading(true);
    haptic.impact('medium');
    try {
      await api.updateProfile({ birthDate, onboardingComplete: true });
      navigate(RoutePath.HOME);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[url('https://picsum.photos/seed/bg/400/800')] bg-cover bg-center">
      <div className="absolute inset-0 bg-mystic-900/90 backdrop-blur-sm" />
      
      <div className="relative z-10 w-full max-w-md">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-amber-600 mb-4">
                Destiny Matrix
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed">
                Раскрой тайны своей судьбы через древние знания Таро и нумерологии.
              </p>
              <div className="p-4 bg-mystic-800/50 rounded-lg border border-mystic-600/50 text-xs text-gray-400">
                {DISCLAIMER_TEXT}
              </div>
              <MysticButton fullWidth onClick={handleNext}>Начать путь</MysticButton>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-white">Когда вы родились?</h2>
              <p className="text-gray-400">Дата рождения нужна для расчета вашей Матрицы Судьбы.</p>
              
              <input
                type="text"
                placeholder="ДД.ММ.ГГГГ"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full bg-mystic-800 border border-gold-500/30 rounded-xl px-4 py-3 text-center text-xl text-white focus:outline-none focus:border-gold-500 placeholder-gray-600"
              />

              <MysticButton fullWidth onClick={handleFinish} disabled={birthDate.length < 8} isLoading={loading}>
                Рассчитать бесплатно
              </MysticButton>
              <p className="text-xs text-gray-500 mt-4">Мы не храним ваши данные для третьих лиц.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;