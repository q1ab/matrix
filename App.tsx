import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { RoutePath } from './types';
import { initTelegram, tg } from './services/telegram';
import { api } from './services/api';
import TabBar from './components/Layout/TabBar';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Tarot from './pages/Tarot';
import Matrix from './pages/Matrix';
import Catalog from './pages/Catalog';
import Profile from './pages/Profile';

// Layout wrapper to conditionally show TabBar
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const showTabBar = location.pathname !== RoutePath.ONBOARDING;

  return (
    <>
      <div className="w-full max-w-md mx-auto min-h-screen relative overflow-x-hidden">
        {children}
      </div>
      {showTabBar && <TabBar />}
    </>
  );
};

const AppRoutes = () => {
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    initTelegram();
    
    // Check user status
    const checkUser = async () => {
      try {
        const user = await api.getUser();
        if (!user.onboardingComplete) {
          setNeedsOnboarding(true);
        }
      } catch (e) {
        console.error("Auth failed", e);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mystic-900">
        <div className="animate-spin-slow text-6xl">✨</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={<Navigate to={needsOnboarding ? RoutePath.ONBOARDING : RoutePath.HOME} replace />} 
      />
      <Route path={RoutePath.ONBOARDING} element={<Onboarding />} />
      <Route path={RoutePath.HOME} element={<Home />} />
      <Route path={RoutePath.TAROT} element={<Tarot />} />
      <Route path={RoutePath.MATRIX} element={<Matrix />} />
      <Route path={RoutePath.CATALOG} element={<Catalog />} />
      <Route path={RoutePath.PROFILE} element={<Profile />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <AppRoutes />
      </Layout>
    </Router>
  );
};

export default App;