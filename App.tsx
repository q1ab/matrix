import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { TelegramService } from './services/telegram';

// Pages
import { Onboarding } from './pages/Onboarding';
import { Home } from './pages/Home';
import { Tarot } from './pages/Tarot';
import { Matrix } from './pages/Matrix';
import { Catalog } from './pages/Catalog';
import { Profile } from './pages/Profile';
import { Navigation } from './components/Navigation';

// Initialization Wrapper
const AppContent = () => {
  const { user, loading } = useApp();
  const location = useLocation();

  useEffect(() => {
    TelegramService.ready();
    TelegramService.expand();
    // Configure colors via Telegram params
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
       tg.setHeaderColor('#1a0b2e');
       tg.setBackgroundColor('#1a0b2e');
    }
  }, []);

  if (loading) {
    return (
       <div className="flex h-screen items-center justify-center bg-mystic-dark">
         <div className="animate-spin text-amber-500 text-4xl">✨</div>
       </div>
    );
  }

  // Redirect to onboarding if no birthdate set
  if (!user?.birth_date && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <>
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/home" element={<Home />} />
        <Route path="/tarot" element={<Tarot />} />
        <Route path="/matrix" element={<Matrix />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
      <Navigation />
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AppProvider>
  );
}