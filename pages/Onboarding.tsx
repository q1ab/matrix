import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MysticButton } from '../components/MysticButton';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import { TelegramService } from '../services/telegram';

export const Onboarding = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useApp();
  const [step, setStep] = useState(1);
  const [birthDate, setBirthDate] = useState(user?.birth_date || '');
  const [loading, setLoading] = useState(false);
  const [dailyCard, setDailyCard] = useState<string | null>(null);

  const handleNext = async () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!birthDate) return;
      setLoading(true);
      try {
        await api.updateMe({ birth_date: birthDate });
        await refreshUser();
        // Fetch teaser card
        try {
          const res = await api.getTarot({ spread_type: 'daily' });
          setDailyCard(res.cards[0]);
        } catch (e) {
          // If already taken, just ignore or show generic
          setDailyCard('Колесо Фортуны'); 
        }
        setStep(3);
      } catch (e) {
        console.error(e);
        TelegramService.haptic.notification('error');
      } finally {
        setLoading(false);
      }
    } else if (step === 3) {
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen p-6 flex flex-col justify-center items-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center space-y-6 w-full max-w-sm z-10"
          >
            <div className="text-5xl animate-bounce">✨</div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
              Матрица Судьбы
            </h1>
            <p className="text-gray-300">
              Откройте тайны своей души с помощью древних знаний Таро и Нумерологии.
            </p>
            <MysticButton fullWidth onClick={handleNext}>
              Начать путь
            </MysticButton>
            <p className="text-xs text-gray-500 mt-8">
              Развлекательный контент. Не является профессиональным советом.
            </p>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-sm space-y-6 z-10"
          >
            <h2 className="text-2xl font-bold text-center">Ваша дата рождения</h2>
            <p className="text-center text-gray-400 text-sm">
              Необходима для расчета Матрицы и персональных предсказаний.
            </p>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full bg-mystic-purple border border-white/20 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none text-center text-lg"
            />
            <MysticButton fullWidth onClick={handleNext} isLoading={loading} disabled={!birthDate}>
              Продолжить
            </MysticButton>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm space-y-6 z-10 text-center"
          >
            <h2 className="text-2xl font-bold">Ваша карта дня</h2>
            <motion.div 
              initial={{ rotateY: 90 }}
              animate={{ rotateY: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-purple-800 to-indigo-900 border-2 border-amber-500/30 w-48 h-72 mx-auto rounded-xl flex items-center justify-center shadow-2xl shadow-amber-900/40"
            >
              <span className="text-xl font-serif font-bold text-amber-100 p-4 text-center">
                {dailyCard}
              </span>
            </motion.div>
            <p className="text-sm text-gray-300">
              Это лишь начало. Узнайте больше с полным раскладом.
            </p>
            <div className="flex gap-3">
              <MysticButton variant="secondary" className="flex-1" onClick={() => navigate('/home')}>
                Позже
              </MysticButton>
              <MysticButton className="flex-1" onClick={() => navigate('/catalog')}>
                Подробнее (199 ⭐)
              </MysticButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
