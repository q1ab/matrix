import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RoutePath } from '../../types';
import { haptic } from '../../services/telegram';

const TabBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { path: RoutePath.HOME, label: 'Главная', icon: '🏠' },
    { path: RoutePath.TAROT, label: 'Таро', icon: '🎴' },
    { path: RoutePath.MATRIX, label: 'Матрица', icon: '✨' },
    { path: RoutePath.CATALOG, label: 'Услуги', icon: '💎' },
    { path: RoutePath.PROFILE, label: 'Профиль', icon: '👤' },
  ];

  const handleNav = (path: string) => {
    haptic.selection();
    navigate(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-mystic-900 border-t border-mystic-700/50 flex items-center justify-around pb-4 z-50">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => handleNav(tab.path)}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
              isActive ? 'text-gold-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-2xl mb-1">{tab.icon}</span>
            <span className="text-[10px] font-medium tracking-wide">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default TabBar;