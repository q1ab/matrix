import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MysticButton } from '../components/MysticButton';
import { api } from '../api/client';
import { Sparkles, Calendar, MoreVertical, X } from 'lucide-react';
import { TelegramService } from '../services/telegram';

export const Home = () => {
  const { user, refreshUser } = useApp();
  const navigate = useNavigate();
  const [dailyLoading, setDailyLoading] = useState(false);

  const handleDaily = async () => {
    if (!user?.can_use_daily_card) return;
    
    setDailyLoading(true);
    try {
      const res = await api.getTarot({ spread_type: 'daily' });
      TelegramService.showConfirm(`Карта дня: ${res.cards[0]}\n\n${res.result_text.substring(0, 100)}...`, (ok) => {
        if(ok) navigate('/tarot');
      });
      await refreshUser();
    } catch (e: any) {
      if (e.status === 403) {
         // Should ideally be handled by state, but fallback here
      }
    } finally {
      setDailyLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-32 pt-4 px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-20 left-0 w-48 h-48 bg-amber-600/10 rounded-full blur-[60px] pointer-events-none" />

      {/* 1. Header Row */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
             <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">Matrix AI</span>
             <span className="text-xs">🪄</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Привет, {user?.first_name || '...'}</h1>
          <p className="text-sm text-amber-500/80">Путь открывается идущему</p>
        </div>
        
        {/* Top Right Actions */}
        <div className="flex items-center gap-3">
           <button className="p-2 text-gray-400 hover:text-white" onClick={() => navigate('/profile')}>
              {/* Profile Icon / Menu */}
              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                 <span className="text-xs">👤</span>
              </div>
           </button>
           <button className="p-1 text-gray-400 hover:text-white">
             <MoreVertical size={20} />
           </button>
           {/* Close button usually reserved for app controls, but rendering for visual match */}
           <button className="p-1 text-gray-400 hover:text-white" onClick={() => TelegramService.close()}>
             <X size={20} />
           </button>
        </div>
      </div>

      {/* 2. Daily Card Widget */}
      <div className="glass-panel rounded-2xl p-5 mb-6 relative overflow-hidden group">
        {/* Glow effect */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/20 blur-[50px] group-hover:bg-amber-500/30 transition-colors" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-gradient-to-br from-white/10 to-transparent rounded-lg border border-white/10">
               <Calendar className="text-amber-300" size={20} />
            </div>
            <h2 className="font-bold text-lg text-white">Карта Дня</h2>
          </div>
          
          <div className="min-h-[60px]">
            <p className="text-sm text-gray-300 leading-relaxed mb-6">
              {user?.can_use_daily_card 
                ? "Энергии дня готовы открыть вам свои тайны." 
                : "Вы уже открыли карту сегодня.\nВозвращайтесь завтра."}
            </p>
          </div>

          <MysticButton 
            fullWidth 
            onClick={handleDaily} 
            disabled={!user?.can_use_daily_card}
            variant={user?.can_use_daily_card ? 'primary' : 'disabled-filled'}
            isLoading={dailyLoading}
            className="h-12 text-sm uppercase tracking-wide"
          >
            {user?.can_use_daily_card ? "Получить прогноз" : "Уже получено"}
          </MysticButton>
        </div>
        
        {/* Subtle sparkle decoration */}
        <Sparkles className="absolute bottom-10 right-4 text-amber-500/10 w-24 h-24 rotate-12" strokeWidth={1} />
      </div>

      {/* 3. Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Tarot Card */}
        <div 
          onClick={() => navigate('/tarot')}
          className="glass-panel p-4 rounded-2xl relative overflow-hidden active:scale-95 transition-all duration-200 border border-purple-500/20 hover:border-purple-500/40"
        >
          <div className="w-10 h-10 mb-3 bg-purple-900/40 rounded-xl flex items-center justify-center border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            <span className="text-xl">🔮</span>
          </div>
          <h3 className="font-bold text-white mb-1">Расклад</h3>
          <p className="text-[10px] text-gray-400">Задать вопрос</p>
          
          {/* Neon accent */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-600/20 blur-2xl" />
        </div>

        {/* Matrix Card */}
        <div 
          onClick={() => navigate('/matrix')}
          className="glass-panel p-4 rounded-2xl relative overflow-hidden active:scale-95 transition-all duration-200 border border-blue-500/20 hover:border-blue-500/40"
        >
          <div className="w-10 h-10 mb-3 bg-blue-900/40 rounded-xl flex items-center justify-center border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <span className="text-xs font-mono text-blue-300 leading-none text-center">
              1 2<br/>3 4
            </span>
          </div>
          <h3 className="font-bold text-white mb-1">Матрица</h3>
          <p className="text-[10px] text-gray-400">По дате рождения</p>
           
           {/* Neon accent */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-600/20 blur-2xl" />
        </div>
      </div>

      {/* 4. Premium Banner */}
      <div 
        onClick={() => navigate('/catalog')}
        className="relative rounded-2xl p-5 overflow-hidden flex items-center justify-between group active:scale-[0.98] transition-transform"
      >
        {/* Gold Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#b48a1e] via-[#fbbf24] to-[#b48a1e] opacity-90" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/noise.png')] opacity-10 mix-blend-overlay" />
        
        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />

        <div className="relative z-10 text-mystic-dark">
          <h3 className="font-bold text-lg leading-tight">Premium Доступ</h3>
          <p className="text-xs opacity-80 font-medium">Полная расшифровка матрицы</p>
        </div>

        <div className="relative z-10 bg-mystic-dark/90 backdrop-blur text-amber-400 font-bold text-xs px-3 py-1.5 rounded-lg border border-amber-500/50 shadow-lg">
          PRO
        </div>
      </div>

    </div>
  );
};
