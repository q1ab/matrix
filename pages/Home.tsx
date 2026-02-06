import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MysticButton } from '../components/MysticButton';
import { api } from '../api/client';
import { Sparkles, Calendar } from 'lucide-react';
import { TelegramService } from '../services/telegram';

export const Home = () => {
  const { user, refreshUser } = useApp();
  const navigate = useNavigate();
  const [dailyLoading, setDailyLoading] = useState(false);

  const handleDaily = async () => {
    if (!user?.can_use_daily_card) {
      TelegramService.haptic.notification('warning');
      return; // UI handles disabled state visuals
    }
    
    setDailyLoading(true);
    try {
      // Just fetch to mark as used, user sees result in toast or custom modal 
      // (For this MVP, we redirect to Tarot page to see results or show simple alert)
      const res = await api.getTarot({ spread_type: 'daily' });
      TelegramService.showConfirm(`Карта дня: ${res.cards[0]}\n\n${res.result_text.substring(0, 100)}...`, (ok) => {
        if(ok) navigate('/tarot');
      });
      await refreshUser();
    } catch (e: any) {
      if (e.status === 403) {
         // Should ideally be handled by state, but fallback here
         alert('Уже получена сегодня');
      }
    } finally {
      setDailyLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Привет, {user?.first_name || 'Странник'}</h1>
          <p className="text-xs text-amber-400/80">Путь открывается идущему</p>
        </div>
        <div 
          onClick={() => navigate('/profile')} 
          className="w-10 h-10 bg-mystic-purple rounded-full flex items-center justify-center border border-white/10"
        >
          <span className="text-lg">👤</span>
        </div>
      </div>

      {/* Daily Card Widget */}
      <div className="bg-gradient-to-br from-mystic-purple to-indigo-900 rounded-2xl p-5 border border-amber-500/20 shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="text-amber-400" size={20} />
            <h2 className="font-bold text-lg">Карта Дня</h2>
          </div>
          <p className="text-sm text-gray-300 mb-4">
            {user?.can_use_daily_card 
              ? "Узнайте, что день грядущий готовит для вас." 
              : "Вы уже открыли карту сегодня. Возвращайтесь завтра."}
          </p>
          <MysticButton 
            fullWidth 
            onClick={handleDaily} 
            disabled={!user?.can_use_daily_card}
            isLoading={dailyLoading}
          >
            {user?.can_use_daily_card ? "Открыть Карту" : "Уже получено"}
          </MysticButton>
        </div>
        <Sparkles className="absolute -bottom-4 -right-4 text-white/5 w-32 h-32" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <div 
          onClick={() => navigate('/tarot')}
          className="bg-mystic-light/50 p-4 rounded-xl border border-white/5 active:scale-95 transition-transform"
        >
          <div className="text-3xl mb-2">🔮</div>
          <h3 className="font-bold">Расклад</h3>
          <p className="text-xs text-gray-400">Задать вопрос</p>
        </div>
        <div 
          onClick={() => navigate('/matrix')}
          className="bg-mystic-light/50 p-4 rounded-xl border border-white/5 active:scale-95 transition-transform"
        >
          <div className="text-3xl mb-2">🔢</div>
          <h3 className="font-bold">Матрица</h3>
          <p className="text-xs text-gray-400">По дате рождения</p>
        </div>
      </div>

      {/* Upsell Banner */}
      <div 
        onClick={() => navigate('/catalog')}
        className="bg-gradient-to-r from-amber-600/20 to-purple-600/20 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between"
      >
        <div>
          <h3 className="font-bold text-amber-400">Premium Доступ</h3>
          <p className="text-xs text-gray-300">Полная расшифровка матрицы</p>
        </div>
        <div className="bg-amber-500 text-mystic-dark font-bold text-xs px-2 py-1 rounded">
          PRO
        </div>
      </div>
    </div>
  );
};
