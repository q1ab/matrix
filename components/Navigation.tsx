import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Sparkles, Grid, ShoppingBag, User } from 'lucide-react';
import { TelegramService } from '../services/telegram';
import { motion } from 'framer-motion';

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { path: '/home', label: 'Главная', icon: Home },
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
    <div className="fixed bottom-6 left-4 right-4 z-50">
      <div className="glass-nav rounded-2xl p-2 flex justify-around items-center shadow-2xl">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => handleNav(tab.path)}
              className="relative flex flex-col items-center p-2 w-full"
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
                <tab.icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
              </div>
              
              <span className={`relative z-10 text-[10px] mt-1 font-medium transition-colors duration-200 ${
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
