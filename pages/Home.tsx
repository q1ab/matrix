import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { RoutePath } from '../types';
import MysticButton from '../components/UI/MysticButton';
import { MAJOR_ARCANA } from '../constants';
import { haptic } from '../services/telegram';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [dailyCardRevealed, setDailyCardRevealed] = useState(false);
  const [dailyCard, setDailyCard] = useState(MAJOR_ARCANA[0]);

  useEffect(() => {
    // Check local storage if daily card was already pulled today
    const storedDate = localStorage.getItem('last_daily_card_date');
    const today = new Date().toDateString();
    
    if (storedDate === today) {
      setDailyCardRevealed(true);
      const storedCardId = localStorage.getItem('last_daily_card_id');
      if (storedCardId) setDailyCard(MAJOR_ARCANA[parseInt(storedCardId)]);
    }
  }, []);

  const revealDailyCard = () => {
    haptic.impact('heavy');
    // Random card logic
    const randomIndex = Math.floor(Math.random() * MAJOR_ARCANA.length);
    setDailyCard(MAJOR_ARCANA[randomIndex]);
    setDailyCardRevealed(true);
    
    // Save state
    const today = new Date().toDateString();
    localStorage.setItem('last_daily_card_date', today);
    localStorage.setItem('last_daily_card_id', randomIndex.toString());
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white">Добро пожаловать</h1>
          <p className="text-sm text-gold-400">Уровень: Искатель (Novice)</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold border-2 border-gold-500">
          LVL 1
        </div>
      </div>

      {/* Daily Card Widget */}
      <div className="bg-mystic-800 rounded-2xl p-6 text-center border border-mystic-700 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none text-6xl">✨</div>
        <h2 className="text-lg font-semibold text-white mb-4">Карта Дня</h2>
        
        <div className="perspective-1000 h-64 w-40 mx-auto relative mb-4">
          <motion.div
            className="w-full h-full relative preserve-3d cursor-pointer"
            animate={{ rotateY: dailyCardRevealed ? 180 : 0 }}
            transition={{ duration: 0.8 }}
            onClick={!dailyCardRevealed ? revealDailyCard : undefined}
          >
            {/* Front (Back of card) */}
            <div className="absolute inset-0 backface-hidden rounded-xl bg-gradient-to-br from-mystic-700 to-mystic-900 border-2 border-gold-500/50 flex items-center justify-center">
               <span className="text-4xl">🔮</span>
            </div>

            {/* Back (Revealed face) */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-xl bg-slate-800 border-2 border-gold-400 overflow-hidden">
              <img src={dailyCard.image} alt="Tarot" className="w-full h-full object-cover" />
              <div className="absolute bottom-0 inset-x-0 bg-black/70 p-2">
                <p className="text-white font-bold text-sm">{dailyCard.name}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {!dailyCardRevealed ? (
          <p className="text-sm text-gray-400 animate-pulse">Нажмите на карту, чтобы узнать совет</p>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-gold-300 text-sm mb-3">{dailyCard.desc}</p>
            <MysticButton variant="outline" className="text-xs py-2" onClick={() => navigate(RoutePath.TAROT)}>
              Подробнее в раскладе
            </MysticButton>
          </motion.div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <div onClick={() => navigate(RoutePath.TAROT)} className="bg-mystic-800 p-4 rounded-xl border border-white/10 active:scale-95 transition-transform cursor-pointer">
          <span className="text-2xl block mb-2">🃏</span>
          <h3 className="font-bold text-white">Таро Расклад</h3>
          <p className="text-xs text-gray-400">Ответ на вопрос</p>
        </div>
        <div onClick={() => navigate(RoutePath.MATRIX)} className="bg-mystic-800 p-4 rounded-xl border border-white/10 active:scale-95 transition-transform cursor-pointer">
          <span className="text-2xl block mb-2">🔢</span>
          <h3 className="font-bold text-white">Матрица</h3>
          <p className="text-xs text-gray-400">Расчет по дате</p>
        </div>
      </div>

      {/* Tripwire Banner */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-xl p-4 flex items-center justify-between border border-gold-500/30">
        <div>
          <h3 className="font-bold text-gold-400">Premium Доступ</h3>
          <p className="text-xs text-gray-300">Все расклады безлимитно</p>
        </div>
        <MysticButton variant="secondary" className="text-xs px-3 py-2" onClick={() => navigate(RoutePath.CATALOG)}>
          ⭐ 349 Stars
        </MysticButton>
      </div>
    </div>
  );
};

export default Home;