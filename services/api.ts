import { User, MatrixData, Product } from '../types';
import { tg } from './telegram';
import { API_BASE_URL } from '../constants';

const request = async <T>(path: string, method: string = 'GET', body?: any): Promise<T> => {
  // Guard: If we are in dev mode (no initData), do not attempt network request
  // This prevents the 403 "No hash" error from backend
  if (!tg.initData) {
    throw new Error("No Telegram InitData available for request");
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Telegram-Init-Data': tg.initData, 
  };

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error ${response.status}:`, errorText);
      throw new Error(`API Error ${response.status}: ${errorText || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Request failed (${path}):`, error);
    throw error;
  }
};

export const api = {
  getUser: async (): Promise<User> => {
    // Mock for local development
    if (!tg.initData) {
        console.warn("[Dev] No initData, returning mock User");
        return {
             id: 12345,
             username: 'DevUser',
             firstName: 'Developer',
             credits: 100,
             isPremium: false,
             onboardingComplete: localStorage.getItem('onboarding_complete') === 'true',
             birthDate: localStorage.getItem('user_birthdate') || '01.01.1990'
        };
    }

    const userData = await request<User>('/api/me');
    
    // Merge server data with local onboarding state (if needed)
    return {
      ...userData,
      onboardingComplete: localStorage.getItem('onboarding_complete') === 'true',
      birthDate: userData.birthDate || localStorage.getItem('user_birthdate') || undefined
    };
  },

  getProducts: async (): Promise<Product[]> => {
    if (!tg.initData) {
        console.warn("[Dev] No initData, returning mock Products");
        return [
            { id: '3_card_spread', title: 'Расклад 3 карты', price: 199, type: 'consumable', description: ['Прошлое, настоящее, будущее', 'Совет карт'] },
            { id: 'pro_spread', title: 'PRO-расклад 5–7 карт', price: 490, type: 'consumable', description: ['Глубокий анализ', 'Скрытые факторы'] },
            { id: 'matrix_mini', title: 'Матрица MINI', price: 690, type: 'one-time', description: ['Таланты', 'Карма'] },
            { id: 'matrix_pro', title: 'Матрица PRO (PDF)', price: 1290, type: 'one-time', description: ['Полная расшифровка', 'PDF отчет'], tag: 'Hit' },
            { id: 'sub_light', title: 'Daily Light', price: 349, type: 'subscription', description: ['Карта дня', 'Гороскоп'] },
            { id: 'sub_pro', title: 'Daily PRO', price: 699, type: 'subscription', description: ['Все функции', 'Личный оракул'] }
        ];
    }

    try {
        return await request<Product[]>('/api/products');
    } catch (e) {
        console.error("Failed to fetch products", e);
        return [];
    }
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    if (data.birthDate) localStorage.setItem('user_birthdate', data.birthDate);
    if (data.onboardingComplete) localStorage.setItem('onboarding_complete', 'true');
    
    // In dev or if no backend update endpoint exists yet, just return updated user
    if (!tg.initData) return api.getUser();
    
    // If backend supported update, we would call it here. 
    // For now, assume client-side persistence + refresh
    return api.getUser();
  },

  calculateMatrix: async (birthDate: string): Promise<MatrixData> => {
    if (!tg.initData) {
        console.warn("[Dev] No initData, returning mock Matrix");
        // Simple mock calculation
        const sum = birthDate.replace(/\D/g, '').split('').reduce((a, b) => a + parseInt(b), 0);
        return { 
            center: (sum % 22) + 1, 
            karma: ((sum + 5) % 22) + 1, 
            talent: ((sum + 10) % 22) + 1, 
            destiny: ((sum + 15) % 22) + 1, 
            money: ((sum + 20) % 22) + 1 
        };
    }
    return await request<MatrixData>('/api/matrix', 'POST', { birthDate });
  },

  getTarotReading: async (question: string): Promise<{ result: string, cards?: any[] }> => {
     if (!tg.initData) {
         console.warn("[Dev] No initData, returning mock Tarot");
         await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
         return {
             result: `[DEV MODE] Энергии вокруг вашего вопроса "${question}" указывают на необходимость замедлиться. Карта Отшельник подсказывает, что ответы находятся внутри вас. (Это тестовый ответ, так как вы не в Telegram).`,
             cards: []
         };
     }
     return await request<{ result: string, cards?: any[] }>('/api/tarot', 'POST', { question });
  },

  createInvoice: async (productId: string): Promise<string> => {
    if (!tg.initData) {
        console.warn("[Dev] No initData, returning mock Invoice Link");
        return "https://t.me/invoice_example_link";
    }
    const response = await request<{ invoiceLink: string }>('/api/payments/create-invoice', 'POST', { productId });
    return response.invoiceLink;
  }
};