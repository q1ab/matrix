import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Sparkles, Grid, ShoppingBag, User, Moon } from 'lucide-react';
import { TelegramService } from '../services/telegram';
import { motion } from 'framer-motion';

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { path: '/home', label: 'Главная', icon: Home },
    { path: '/natal', label: 'Натальная', icon: Moon },
    { path: '/tarot', label: 'Таро', icon: Sparkles },
    { path: '/matrix', label: 'Матрица', icon: Grid },
    { path: '/catalog', label: 'Каталог', icon: ShoppingBag },
    { path: '/profile', label: 'Профиль', icon: User },
  ];

  const handleNav = (path: string) => {
    if (location.pathname !== path) {
      TelegramService.haptic.selection();
      navigate(path);
    }
  };

  if (location.pathname === '/onboarding') return null;

  return (
    <div className="fixed left-2 right-2 z-50 bottom-[calc(1.5rem+env(safe-area-inset-bottom))]">
      <div className="glass-nav rounded-2xl p-1.5 flex justify-between items-center shadow-2xl">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => handleNav(tab.path)}
              className="relative flex flex-col items-center p-2 w-full min-w-0"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 bg-white/5 rounded-xl blur-sm"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <div className={`relative z-10 transition-colors duration-200 ${
                isActive ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'text-gray-400'
              }`}>
                <tab.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              </div>
              
              <span className={`relative z-10 text-[9px] mt-1 font-medium truncate w-full text-center transition-colors duration-200 ${
                isActive ? 'text-amber-400' : 'text-gray-500'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};