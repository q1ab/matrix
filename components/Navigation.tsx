import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Sparkles, Grid, ShoppingBag, User } from 'lucide-react';
import { TelegramService } from '../services/telegram';

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
    <div className="fixed bottom-0 left-0 right-0 bg-mystic-dark/95 backdrop-blur-md border-t border-white/5 pb-safe pt-2 px-2 z-50">
      <div className="flex justify-around items-center">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => handleNav(tab.path)}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors w-full ${
                isActive ? 'text-amber-400' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <tab.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
      <div className="h-4" /> {/* Safe area spacer */}
    </div>
  );
};
