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
    <div className="min-h-screen p-6 flex flex-col justify-center items-center relative overflow-hidden bg-mystic-dark">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-600/10 rounded-full blur-[80px] pointer-events-none" />

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center space-y-8 w-full max-w-sm z-10"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full" />
              <div className="text-6xl relative animate-pulse">✨</div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-white to-amber-100 drop-shadow-lg">
                Matrix AI
              </h1>
              <p className="text-lg text-gray-300 font-light tracking-wide">
                Зеркало твоей души
              </p>
            </div>

            <div className="glass-panel rounded-2xl p-6 border border-white/5">
               <p className="text-gray-300 text-sm leading-relaxed">
                 Откройте тайны предназначения с помощью синергии древних знаний Таро и искусственного интеллекта.
               </p>
            </div>

            <MysticButton fullWidth size="lg" onClick={handleNext} className="shadow-neon">
              Начать путь
            </MysticButton>
            
            <p className="text-[10px] text-gray-600 uppercase tracking-widest opacity-60">
              Развлекательный контент
            </p>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-sm space-y-8 z-10"
          >
            <div className="text-center space-y-2">
               <h2 className="text-2xl font-bold text-white">Дата рождения</h2>
               <p className="text-gray-400 text-sm">
                 Ключ к расчету вашей Матрицы
               </p>
            </div>

            <div className="glass-panel p-1 rounded-2xl">
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full bg-mystic-card/50 rounded-xl px-4 py-4 text-white focus:outline-none focus:bg-mystic-card/80 transition-colors text-center text-xl font-mono tracking-widest placeholder-gray-600"
              />
            </div>

            <MysticButton fullWidth size="lg" onClick={handleNext} isLoading={loading} disabled={!birthDate}>
              Рассчитать
            </MysticButton>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm space-y-8 z-10 text-center"
          >
            <div className="space-y-1">
               <h2 className="text-2xl font-bold text-white">Карта Дня</h2>
               <p className="text-xs text-amber-400 uppercase tracking-widest">Ваш аркан сегодня</p>
            </div>
            
            <motion.div 
              initial={{ rotateY: 90 }}
              animate={{ rotateY: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
              className="relative w-56 h-80 mx-auto"
            >
              {/* Card Glow */}
              <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-xl" />
              
              <div className="relative h-full bg-gradient-to-br from-gray-900 to-black border border-amber-500/30 rounded-2xl flex flex-col items-center justify-center shadow-2xl overflow-hidden group">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/noise.png')] opacity-20" />
                 <div className="w-full h-full absolute top-0 left-0 bg-gradient-to-t from-black/80 to-transparent z-0" />
                 
                 <span className="relative z-10 text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-600 p-6 text-center leading-normal">
                   {dailyCard}
                 </span>
                 
                 <div className="absolute bottom-4 z-10">
                    <span className="text-xs text-gray-500">Нажмите чтобы узнать смысл</span>
                 </div>
              </div>
            </motion.div>

            <div className="flex gap-3 pt-4">
              <MysticButton variant="secondary" className="flex-1" onClick={() => navigate('/home')}>
                Позже
              </MysticButton>
              <MysticButton className="flex-1 shadow-gold" onClick={() => navigate('/catalog')}>
                Расшифровать (199 ⭐)
              </MysticButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
