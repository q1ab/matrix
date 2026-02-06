import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '../api/client';
import { User, Entitlement } from '../types';

interface AppContextType {
  user: User | null;
  entitlements: Entitlement[];
  loading: boolean;
  refreshUser: () => Promise<void>;
  hasEntitlement: (productCodePrefix: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const [userData, entData] = await Promise.all([
        api.getMe(),
        api.getEntitlements()
      ]);
      setUser(userData);
      setEntitlements(entData.items);
    } catch (e) {
      console.error('Failed to init app', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const hasEntitlement = (codeOrPrefix: string) => {
    return entitlements.some(e => 
      (e.product_code === codeOrPrefix || e.product_code.startsWith(codeOrPrefix)) && 
      (e.quantity > 0 || e.is_subscription)
    );
  };

  return (
    <AppContext.Provider value={{ user, entitlements, loading, refreshUser, hasEntitlement }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
